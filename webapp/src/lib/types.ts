export interface TeamState {
  TeamID: number;
  TeamName: string;
  Season: number;
  team_games_played: number;
  team_wins: number;
  team_losses: number;
  team_win_pct: number;
  team_ppg: number;
  team_papg: number;
  team_fg_pct: number;
  team_fg3_pct: number;
  team_ft_pct: number;
  team_off_rebounds_pg: number;
  team_def_rebounds_pg: number;
  team_assists_pg: number;
  team_turnovers_pg: number;
  team_steals_pg: number;
  team_blocks_pg: number;
  team_personal_fouls_pg: number;
  team_home_win_pct: number;
  team_away_win_pct: number;
  team_neutral_win_pct: number;
  team_last_5_games_played: number;
  team_last_5_win_pct: number;
  team_last_5_ppg: number;
  team_last_5_papg: number;
  team_last_5_fg_pct: number;
  team_last_5_fg3_pct: number;
  team_last_5_ft_pct: number;
  team_last_5_off_rebounds_pg: number;
  team_last_5_def_rebounds_pg: number;
  team_last_5_assists_pg: number;
  team_last_5_turnovers_pg: number;
  team_last_5_steals_pg: number;
  team_last_5_blocks_pg: number;
  team_last_5_personal_fouls_pg: number;
  team_last_5_avg_opponent_win_pct: number;
  team_last_5_avg_opponent_point_diff_pg: number;
  team_last_10_games_played: number;
  team_last_10_win_pct: number;
  team_last_10_ppg: number;
  team_last_10_papg: number;
  team_last_10_fg_pct: number;
  team_last_10_fg3_pct: number;
  team_last_10_ft_pct: number;
  team_last_10_off_rebounds_pg: number;
  team_last_10_def_rebounds_pg: number;
  team_last_10_assists_pg: number;
  team_last_10_turnovers_pg: number;
  team_last_10_steals_pg: number;
  team_last_10_blocks_pg: number;
  team_last_10_personal_fouls_pg: number;
  team_last_10_avg_opponent_win_pct: number;
  team_last_10_avg_opponent_point_diff_pg: number;
  team_current_win_streak: number;
  team_current_loss_streak: number;
  team_point_diff_pg: number;
  team_effective_fg_pct: number;
  team_assist_turnover_ratio: number;
  team_total_rebounds_pg: number;
  team_fg3_attempt_rate: number;
  team_ft_attempt_rate: number;
  team_turnover_to_assist_ratio: number;
  team_avg_opponent_win_pct: number;
  team_avg_opponent_point_diff_pg: number;

  // Optional visual/display ratings
  Rating?: number;
  Seed?: number;
  Region?: string;
}

export interface FeatureImpact {
  featureName: string;
  label: string;
  diff: number;
  weight: number;
  impact: number;
}

export interface PredictionResult {
  team1: TeamState;
  team2: TeamState;
  winner: TeamState;
  loser: TeamState;
  probTeam1: number;
  probTeam2: number;
  spread: number;
  confidence: string;
  location: number; // 1 = Team 1 Home, 0 = Neutral, -1 = Team 1 Away
  keyFactors: FeatureImpact[];
}
