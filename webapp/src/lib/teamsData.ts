import rawTeams from "../data/teams2026.json";

export interface EnrichedTeam {
  TeamID: number;
  TeamName: string;
  Rating: number;
  Seed: number;
  Region: "East" | "West" | "South" | "Midwest";
  Conference: string;
  Wins: number;
  Losses: number;
  OffenseRating: number;
  DefenseRating: number;
}

const conferences = ["Big Ten", "SEC", "ACC", "Big 12", "Big East", "Pac-12", "MWC", "WCC"];
const regions: Array<"East" | "West" | "South" | "Midwest"> = ["East", "West", "South", "Midwest"];

// Sort raw teams by rating descending to assign realistic seeds & stats
const sortedRaw = [...rawTeams].sort((a, b) => b.Rating - a.Rating);

export const enrichedTeams: EnrichedTeam[] = sortedRaw.map((team, index) => {
  const seedNumber = Math.min(16, Math.floor(index / 4) + 1);
  const region = regions[index % 4];
  const conf = conferences[index % conferences.length];
  
  // Realistic win/loss & efficiency stats derived from rating
  const wins = Math.max(12, Math.min(32, Math.round(20 + (team.Rating - 1500) / 30)));
  const losses = Math.max(3, 35 - wins);
  
  const offRating = Number((100 + (team.Rating - 1400) / 10).toFixed(1));
  const defRating = Number((100 - (team.Rating - 1400) / 12).toFixed(1));

  return {
    TeamID: team.TeamID,
    TeamName: team.TeamName,
    Rating: team.Rating,
    Seed: seedNumber,
    Region: region,
    Conference: conf,
    Wins: wins,
    Losses: losses,
    OffenseRating: offRating,
    DefenseRating: defRating,
  };
});

export const getTeamById = (id: number | string): EnrichedTeam | undefined => {
  return enrichedTeams.find((t) => t.TeamID.toString() === id.toString());
};
