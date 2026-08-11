import { TeamState, PredictionResult, FeatureImpact } from "./types";

export const MODEL_INTERCEPT = 3.1415278469672446e-14;

export const MODEL_WEIGHTS: Record<string, number> = {
  current_loss_streak_diff: -0.015616682573660744,
  avg_opponent_win_pct_diff: 0.16429116192953205,
  last_5_win_pct_diff: -0.053388119895459975,
  assist_turnover_ratio_diff: -0.17870098396211953,
  papg_diff: -0.014841777387936655,
  last_5_avg_opponent_point_diff_pg_diff: -0.010001559900995558,
  last_10_ppg_diff: 0.007861294391409842,
  last_10_def_rebounds_pg_diff: -0.013950659046153726,
  last_5_steals_pg_diff: 0.0160269965369181,
  home_win_pct_diff: 0.11465353741807473,
  losses_diff: -0.024756661284242514,
  last_5_off_rebounds_pg_diff: 0.013902518453734018,
  turnovers_pg_diff: -0.05980194615089622,
  off_rebounds_pg_diff: 0.03457835602252258,
  assists_pg_diff: 0.0475569293807136,
  last_10_win_pct_diff: 0.16920581580216254,
  last_5_ppg_diff: 0.0002824768882478356,
  last_10_fg_pct_diff: 0.7056078967819032,
  last_10_papg_diff: -0.01577928080503601,
  last_5_fg_pct_diff: 1.158232872624794,
  fg3_attempt_rate_diff: 0.8026355591239911,
  ppg_diff: 0.020687000386841892,
  wins_diff: 0.08677281417354762,
  last_10_avg_opponent_point_diff_pg_diff: -0.03196494914711233,
  win_pct_diff: -0.966529106696025,
  effective_fg_pct_diff: -0.8253914058310674,
  point_diff_pg_diff: 0.03552877777486581,
  team_1_location: 0.6192792018617824,
  fg_pct_diff: 0.8501905422978858,
  avg_opponent_point_diff_pg_diff: 0.06990294896110806,
  last_5_papg_diff: -0.006095847898087029,
  ft_attempt_rate_diff: 0.5586156486707305,
  turnover_to_assist_ratio_diff: 0.1002788356930361,
};

export const FEATURE_LABELS: Record<string, string> = {
  current_loss_streak_diff: "Current Loss Streak Diff",
  avg_opponent_win_pct_diff: "Opponent Strength (Win %)",
  last_5_win_pct_diff: "Last 5 Games Win %",
  assist_turnover_ratio_diff: "Assist/Turnover Ratio",
  papg_diff: "Points Allowed Per Game (PAPG)",
  last_5_avg_opponent_point_diff_pg_diff: "Last 5 Opponent Point Diff",
  last_10_ppg_diff: "Last 10 Games PPG",
  last_10_def_rebounds_pg_diff: "Last 10 Defensive Rebounds/G",
  last_5_steals_pg_diff: "Last 5 Steals/G",
  home_win_pct_diff: "Home Win % Diff",
  losses_diff: "Total Losses Diff",
  last_5_off_rebounds_pg_diff: "Last 5 Offensive Rebounds/G",
  turnovers_pg_diff: "Turnovers Per Game",
  off_rebounds_pg_diff: "Offensive Rebounds Per Game",
  assists_pg_diff: "Assists Per Game",
  last_10_win_pct_diff: "Last 10 Games Win %",
  last_5_ppg_diff: "Last 5 Games PPG",
  last_10_fg_pct_diff: "Last 10 FG %",
  last_10_papg_diff: "Last 10 PAPG",
  last_5_fg_pct_diff: "Last 5 Games FG %",
  fg3_attempt_rate_diff: "3-Point Attempt Rate",
  ppg_diff: "Points Per Game (PPG)",
  wins_diff: "Total Wins Diff",
  last_10_avg_opponent_point_diff_pg_diff: "Last 10 Opponent Point Diff",
  win_pct_diff: "Overall Win %",
  effective_fg_pct_diff: "Effective FG %",
  point_diff_pg_diff: "Point Differential / Game",
  team_1_location: "Court Location Advantage",
  fg_pct_diff: "Field Goal % (FG%)",
  avg_opponent_point_diff_pg_diff: "Opponent Point Differential",
  last_5_papg_diff: "Last 5 PAPG",
  ft_attempt_rate_diff: "Free Throw Attempt Rate",
  turnover_to_assist_ratio_diff: "Turnover-to-Assist Ratio",
};

export function predictMatchup(
  team1: TeamState,
  team2: TeamState,
  location: number = 0
): PredictionResult {
  let logit = MODEL_INTERCEPT;
  const keyFactors: FeatureImpact[] = [];

  for (const [feat, weight] of Object.entries(MODEL_WEIGHTS)) {
    let val = 0;
    if (feat === "team_1_location") {
      val = location;
    } else {
      const base = feat.replace(/_diff$/, "");
      const col = `team_${base}` as keyof TeamState;
      const t1Val = (team1[col] as number) ?? 0;
      const t2Val = (team2[col] as number) ?? 0;
      val = t1Val - t2Val;
    }

    const impact = val * weight;
    logit += impact;

    keyFactors.push({
      featureName: feat,
      label: FEATURE_LABELS[feat] || feat,
      diff: val,
      weight,
      impact,
    });
  }

  // Sort key factors by absolute impact magnitude
  keyFactors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // Logistic win probability
  const probTeam1 = 1.0 / (1.0 + Math.exp(-logit));
  const probTeam2 = 1.0 - probTeam1;

  const winner = probTeam1 >= 0.5 ? team1 : team2;
  const loser = probTeam1 >= 0.5 ? team2 : team1;

  // Estimated point spread (~ 11.5 pts per unit of logit)
  const spread = Math.abs(logit * 11.5);

  const maxProb = Math.max(probTeam1, probTeam2);
  let confidence = "Toss-Up";
  if (maxProb >= 0.75) confidence = "Heavy Favorite";
  else if (maxProb >= 0.65) confidence = "Moderate Favorite";
  else if (maxProb >= 0.54) confidence = "Slight Advantage";

  return {
    team1,
    team2,
    winner,
    loser,
    probTeam1,
    probTeam2,
    spread,
    confidence,
    location,
    keyFactors,
  };
}
