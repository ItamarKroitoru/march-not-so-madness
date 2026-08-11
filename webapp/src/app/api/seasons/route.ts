import { NextResponse } from "next/server";
import { getAvailableSeasons } from "@/lib/teamStates";

export async function GET() {
  try {
    const seasons = getAvailableSeasons();
    return NextResponse.json({ seasons });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
