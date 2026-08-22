import fs from "fs";
import path from "path";
import { MatchRecord, DailyPerformance, MatchAnalysisSummary, MatchesResponse } from "./types";

interface MatchesPayload {
  summary: MatchAnalysisSummary;
  dailyPerformance: DailyPerformance[];
  matches: MatchRecord[];
}

let cachedMatches2026: MatchesPayload | null = null;

export function getMatchesData(season: number = 2026): MatchesPayload {
  if (season === 2026 && cachedMatches2026) {
    return cachedMatches2026;
  }

  const filePath = path.join(process.cwd(), "src", "data", `matches${season}.json`);
  if (!fs.existsSync(filePath)) {
    // Fallback: check ../src/data or default empty
    const fallbackPath = path.join(process.cwd(), "..", "webapp", "src", "data", `matches${season}.json`);
    if (fs.existsSync(fallbackPath)) {
      const data: MatchesPayload = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
      if (season === 2026) cachedMatches2026 = data;
      return data;
    }
    return {
      summary: {
        season,
        totalGames: 0,
        correctCount: 0,
        incorrectCount: 0,
        overallAccuracy: 0,
        homeAccuracy: 0,
        awayAccuracy: 0,
        neutralAccuracy: 0,
        heavyFavoriteAccuracy: 0,
        totalUpsets: 0,
      },
      dailyPerformance: [],
      matches: [],
    };
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const data: MatchesPayload = JSON.parse(raw);
  if (season === 2026) {
    cachedMatches2026 = data;
  }
  return data;
}

export interface MatchFilterOptions {
  season?: number;
  team?: string;
  dayNum?: number;
  outcome?: "all" | "correct" | "incorrect" | "upset";
  location?: number;
  page?: number;
  limit?: number;
}

export function queryMatches(options: MatchFilterOptions = {}): MatchesResponse {
  const season = options.season || 2026;
  const { summary, dailyPerformance, matches } = getMatchesData(season);

  let filtered = matches;

  // Filter by Team name
  if (options.team && options.team.trim().length > 0) {
    const q = options.team.trim().toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.team1Name.toLowerCase().includes(q) ||
        m.team2Name.toLowerCase().includes(q)
    );
  }

  // Filter by DayNum
  if (options.dayNum !== undefined && options.dayNum !== null && options.dayNum > 0) {
    filtered = filtered.filter((m) => m.dayNum === Number(options.dayNum));
  }

  // Filter by Outcome
  if (options.outcome === "correct") {
    filtered = filtered.filter((m) => m.correct);
  } else if (options.outcome === "incorrect") {
    filtered = filtered.filter((m) => !m.correct);
  } else if (options.outcome === "upset") {
    filtered = filtered.filter((m) => m.isUpset);
  }

  // Filter by Location
  if (options.location !== undefined && options.location !== null) {
    filtered = filtered.filter((m) => m.location === Number(options.location));
  }

  const total = filtered.length;
  const page = Math.max(1, options.page || 1);
  const limit = options.limit ? Math.max(1, options.limit) : 50;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginatedMatches = filtered.slice(startIndex, startIndex + limit);

  return {
    summary,
    dailyPerformance,
    matches: paginatedMatches,
    total,
    page,
    totalPages,
  };
}

export function lookupMatch(
  team1Name: string,
  team2Name: string,
  season: number = 2026
): MatchRecord | null {
  const { matches } = getMatchesData(season);
  const t1 = team1Name.trim().toLowerCase();
  const t2 = team2Name.trim().toLowerCase();

  const found = matches.find(
    (m) =>
      (m.team1Name.toLowerCase() === t1 && m.team2Name.toLowerCase() === t2) ||
      (m.team1Name.toLowerCase() === t2 && m.team2Name.toLowerCase() === t1)
  );

  return found || null;
}
