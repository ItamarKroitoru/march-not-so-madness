/**
 * ============================================================================
 * MATCH PREDICTOR SERVICE (TypeScript Frontend Layer)
 * ============================================================================
 * This file contains the TypeScript domain types and prediction logic 
 * consumed by the Next.js WebApp interface.
 *
 * Statistical Model Note:
 * -----------------------
 * Win probabilities are calculated using the Logistic Sigmoid Function:
 *     P(Team 1 wins) = 1 / (1 + 10 ^ (-(Rating_1 - Rating_2) / ScalingFactor))
 *
 * Where:
 * - Rating_1 and Rating_2 are team rating scores output by the Step 1 algorithm
 *   (calculated in python via `src.rating.team_rating_algorithm`).
 * - ScalingFactor (default 15.0) controls the sigmoid curve steepness.
 * ============================================================================
 */

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
  summary: string;
};

/**
 * Strategy Pattern Interface:
 * Standardizes prediction engines so frontend UI components don't care how 
 * predictions are computed (e.g. Elo, Logistic Regression, XGBoost, Neural Nets).
 */
export interface MatchPredictor {
  predict(team1: Team, team2: Team): PredictionResult;
}

/**
 * Rating-based Match Predictor implementation using the Logistic Sigmoid function.
 */
export class RatingMatchPredictor implements MatchPredictor {
  private scalingFactor: number;

  constructor(scalingFactor: number = 15.0) {
    this.scalingFactor = scalingFactor;
  }

  predict(team1: Team, team2: Team): PredictionResult {
    const ratingDiff = team1.Rating - team2.Rating;

    // Logistic win probability formula
    const probTeam1 = 1.0 / (1.0 + Math.pow(10, -ratingDiff / this.scalingFactor));
    const probTeam2 = 1.0 - probTeam1;

    const winner = team1.Rating >= team2.Rating ? team1 : team2;
    const loser = team1.Rating >= team2.Rating ? team2 : team1;

    const topProb = (Math.max(probTeam1, probTeam2) * 100).toFixed(1);
    const summary = `Predicted ${winner.TeamName} over ${loser.TeamName} (${topProb}% probability)`;

    return {
      team1,
      team2,
      winner,
      loser,
      probTeam1,
      probTeam2,
      ratingDiff: Math.abs(ratingDiff),
      summary,
    };
  }
}

// Export default predictor instance for the WebApp UI
export const defaultPredictor: MatchPredictor = new RatingMatchPredictor();
