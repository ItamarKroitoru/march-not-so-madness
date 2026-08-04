export interface Team {
  TeamID: number;
  TeamName: string;
  Rating: number;
  Seed?: string;
  Region?: "East" | "West" | "South" | "Midwest";
  Conference?: string;
  Wins?: number;
  Losses?: number;
  OffenseRating?: number;
  DefenseRating?: number;
}

export interface PredictionResult {
  team1: Team;
  team2: Team;
  winner: Team;
  probTeam1: number;
  probTeam2: number;
  spread: number;
  confidence: "High" | "Medium" | "Low";
}

export interface BracketMatchup {
  id: string;
  round: number; // 1 to 6
  region: "East" | "West" | "South" | "Midwest" | "Final Four";
  team1?: Team;
  team2?: Team;
  predictedWinner?: Team;
  probTeam1?: number;
  probTeam2?: number;
}

export interface FeatureWeight {
  feature: string;
  weight: number;
  description: string;
}
