export type Team = {
  TeamID: number;
  TeamName: string;
  Rating: number;
};

export type PredictionResult = {
  team1: Team;
  team2: Team;
  winner: Team;
  loser: Team;
  probTeam1: number;
  probTeam2: number;
  ratingDiff: number;
};

export interface MatchPredictor {
  predict(team1: Team, team2: Team): PredictionResult;
}

export class RatingMatchPredictor implements MatchPredictor {
  private scalingFactor: number;

  constructor(scalingFactor: number = 400.0) {
    this.scalingFactor = scalingFactor;
  }

  predict(team1: Team, team2: Team): PredictionResult {
    const ratingDiff = team1.Rating - team2.Rating;

    // Logistic win probability formula
    const probTeam1 = 1.0 / (1.0 + Math.pow(10, -ratingDiff / this.scalingFactor));
    const probTeam2 = 1.0 - probTeam1;

    const winner = probTeam1 >= 0.5 ? team1 : team2;
    const loser = probTeam1 >= 0.5 ? team2 : team1;

    return {
      team1,
      team2,
      winner,
      loser,
      probTeam1,
      probTeam2,
      ratingDiff,
    };
  }
}

export const defaultPredictor = new RatingMatchPredictor();
