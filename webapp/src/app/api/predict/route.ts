import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { getTeamState } from "@/lib/teamStates";
import { predictMatchup } from "@/lib/predictor";

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team1Name, team1Season, team2Name, team2Season, location = 0 } = body;

    if (!team1Name || !team1Season || !team2Name || !team2Season) {
      return NextResponse.json(
        { error: "Missing required parameters: team1Name, team1Season, team2Name, team2Season" },
        { status: 400 }
      );
    }

    const t1State = getTeamState(team1Name, Number(team1Season));
    const t2State = getTeamState(team2Name, Number(team2Season));

    if (!t1State) {
      return NextResponse.json(
        { error: `Team state not found for ${team1Name} (${team1Season})` },
        { status: 404 }
      );
    }

    if (!t2State) {
      return NextResponse.json(
        { error: `Team state not found for ${team2Name} (${team2Season})` },
        { status: 404 }
      );
    }

    // Direct Python backend invocation of src.inference.predict.predict_matchup
    const projectRoot = path.resolve(process.cwd(), "..");
    const pyScript = `
import json, sys
sys.path.insert(0, ${JSON.stringify(projectRoot)})
from src.inference.predict import predict_matchup

res = predict_matchup(
    team_1_name=${JSON.stringify(team1Name)},
    team_1_season=${Number(team1Season)},
    team_2_name=${JSON.stringify(team2Name)},
    team_2_season=${Number(team2Season)},
    team_1_location=${Number(location)}
)
print(json.dumps(res))
`;

    let pyResult: {
      team_1_win_probability: number;
      team_2_win_probability: number;
    } | null = null;

    try {
      const { stdout } = await execFileAsync("python3", ["-c", pyScript], {
        cwd: projectRoot,
      });
      // Parse last JSON line from stdout
      const lines = stdout.trim().split("\n");
      const jsonLine = lines[lines.length - 1];
      pyResult = JSON.parse(jsonLine);
    } catch (pyErr) {
      console.warn("Python predict_matchup execution fallback to local engine:", pyErr);
    }

    // Compute detailed breakdown & fallback probability
    const result = predictMatchup(t1State, t2State, Number(location));

    // If Python prediction succeeded, override probabilities with exact Python predict_matchup output
    if (pyResult) {
      result.probTeam1 = pyResult.team_1_win_probability;
      result.probTeam2 = pyResult.team_2_win_probability;
      result.winner = result.probTeam1 >= result.probTeam2 ? t1State : t2State;
      result.loser = result.probTeam1 >= result.probTeam2 ? t2State : t1State;

      const maxProb = Math.max(result.probTeam1, result.probTeam2);
      if (maxProb >= 0.75) result.confidence = "Heavy Favorite";
      else if (maxProb >= 0.65) result.confidence = "Moderate Favorite";
      else if (maxProb >= 0.54) result.confidence = "Slight Advantage";
      else result.confidence = "Toss-Up";
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
