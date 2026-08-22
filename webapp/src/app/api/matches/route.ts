import { NextRequest, NextResponse } from "next/server";
import { queryMatches, lookupMatch, getMatchesData } from "@/lib/matchesData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const isLookup = searchParams.get("lookup") === "1";
    const isSummaryOnly = searchParams.get("summaryOnly") === "1";
    const season = searchParams.get("season") ? Number(searchParams.get("season")) : 2026;

    // Single match lookup between two teams
    if (isLookup) {
      const team1 = searchParams.get("team1");
      const team2 = searchParams.get("team2");

      if (!team1 || !team2) {
        return NextResponse.json(
          { error: "team1 and team2 are required for lookup" },
          { status: 400 }
        );
      }

      const match = lookupMatch(team1, team2, season);
      return NextResponse.json({ found: !!match, match });
    }

    // Summary only request (for KPI widgets / chart)
    if (isSummaryOnly) {
      const { summary, dailyPerformance } = getMatchesData(season);
      return NextResponse.json({ summary, dailyPerformance });
    }

    // Query matches with filtering & pagination
    const team = searchParams.get("team") || undefined;
    const dayNum = searchParams.get("day") ? Number(searchParams.get("day")) : undefined;
    const outcome = (searchParams.get("outcome") as "all" | "correct" | "incorrect" | "upset") || "all";
    const location = searchParams.get("location") !== null && searchParams.get("location") !== ""
      ? Number(searchParams.get("location"))
      : undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;

    const result = queryMatches({
      season,
      team,
      dayNum,
      outcome,
      location,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
