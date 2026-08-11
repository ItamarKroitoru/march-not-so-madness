import { NextRequest, NextResponse } from "next/server";
import { getTeamsBySeason, getAvailableSeasons } from "@/lib/teamStates";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonParam = searchParams.get("season");
    
    let season = 2026;
    if (seasonParam) {
      const parsed = parseInt(seasonParam, 10);
      if (!isNaN(parsed)) season = parsed;
    }

    const teams = getTeamsBySeason(season);
    const seasons = getAvailableSeasons();

    return NextResponse.json({ season, seasons, teams });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
