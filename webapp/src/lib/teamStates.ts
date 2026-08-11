import fs from "fs";
import path from "path";
import { TeamState } from "./types";

let cachedTeamStates: TeamState[] | null = null;

export function getAllTeamStates(): TeamState[] {
  if (cachedTeamStates) return cachedTeamStates;

  const csvPath = path.join(process.cwd(), "..", "data", "final_team_states.csv");
  if (!fs.existsSync(csvPath)) {
    console.warn(`[teamStates] File not found: ${csvPath}`);
    return [];
  }

  const rawData = fs.readFileSync(csvPath, "utf8");
  const lines = rawData.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const states: TeamState[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    if (values.length !== headers.length) continue;

    const row: Record<string, string | number> = {};
    headers.forEach((h, idx) => {
      const val = values[idx].trim();
      if (h === "TeamName") {
        row[h] = val;
      } else {
        const num = Number(val);
        row[h] = isNaN(num) ? val : num;
      }
    });

    // Approximate power rating for visualization
    row.Rating = Number(
      (((row.team_win_pct as number) * 40) + ((row.team_point_diff_pg as number) * 2) + ((row.team_effective_fg_pct as number) * 50)).toFixed(1)
    );

    states.push(row as unknown as TeamState);
  }

  cachedTeamStates = states;
  return states;
}

export function getAvailableSeasons(): number[] {
  const states = getAllTeamStates();
  const seasons = Array.from(new Set(states.map((s) => s.Season))).sort((a, b) => b - a);
  return seasons;
}

export function getTeamsBySeason(season: number): TeamState[] {
  const states = getAllTeamStates();
  return states
    .filter((s) => s.Season === season)
    .sort((a, b) => a.TeamName.localeCompare(b.TeamName));
}

export function getTeamState(teamName: string, season: number): TeamState | undefined {
  const states = getAllTeamStates();
  return states.find(
    (s) => s.TeamName.toLowerCase() === teamName.toLowerCase() && s.Season === season
  );
}
