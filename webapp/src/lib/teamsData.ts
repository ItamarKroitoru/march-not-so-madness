import rawTeams from "../data/teams2026.json";
import { TeamState } from "./types";

export interface EnrichedTeam extends TeamState {
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

// Sort raw teams by rating descending to assign seeds & stats
const sortedRaw = [...rawTeams].sort((a, b) => b.Rating - a.Rating);

export const enrichedTeams: EnrichedTeam[] = sortedRaw.map((team, index) => {
  const seedNumber = Math.min(16, Math.floor(index / 4) + 1);
  const region = regions[index % 4];
  const conf = conferences[index % conferences.length];
  
  const wins = Math.max(12, Math.min(32, Math.round(20 + (team.Rating - 1500) / 30)));
  const losses = Math.max(3, 35 - wins);
  const winPct = Number((wins / (wins + losses)).toFixed(3));
  
  const offRating = Number((100 + (team.Rating - 1400) / 10).toFixed(1));
  const defRating = Number((100 - (team.Rating - 1400) / 12).toFixed(1));

  const ppg = Number((72 + (team.Rating - 1400) / 20).toFixed(1));
  const papg = Number((68 - (team.Rating - 1400) / 25).toFixed(1));

  return {
    TeamID: team.TeamID,
    TeamName: team.TeamName,
    Season: 2026,
    team_games_played: wins + losses,
    team_wins: wins,
    team_losses: losses,
    team_win_pct: winPct,
    team_ppg: ppg,
    team_papg: papg,
    team_fg_pct: 0.46,
    team_fg3_pct: 0.35,
    team_ft_pct: 0.72,
    team_off_rebounds_pg: 10.0,
    team_def_rebounds_pg: 25.0,
    team_assists_pg: 14.0,
    team_turnovers_pg: 11.0,
    team_steals_pg: 6.0,
    team_blocks_pg: 3.5,
    team_personal_fouls_pg: 16.0,
    team_home_win_pct: 0.8,
    team_away_win_pct: 0.5,
    team_neutral_win_pct: 0.6,
    team_last_5_games_played: 5,
    team_last_5_win_pct: 0.6,
    team_last_5_ppg: ppg - 1,
    team_last_5_papg: papg - 1,
    team_last_5_fg_pct: 0.45,
    team_last_5_fg3_pct: 0.34,
    team_last_5_ft_pct: 0.70,
    team_last_5_off_rebounds_pg: 9.5,
    team_last_5_def_rebounds_pg: 24.5,
    team_last_5_assists_pg: 13.5,
    team_last_5_turnovers_pg: 10.5,
    team_last_5_steals_pg: 5.5,
    team_last_5_blocks_pg: 3.0,
    team_last_5_personal_fouls_pg: 15.5,
    team_last_5_avg_opponent_win_pct: 0.55,
    team_last_5_avg_opponent_point_diff_pg: 2.0,
    team_last_10_games_played: 10,
    team_last_10_win_pct: 0.7,
    team_last_10_ppg: ppg,
    team_last_10_papg: papg,
    team_last_10_fg_pct: 0.47,
    team_last_10_fg3_pct: 0.36,
    team_last_10_ft_pct: 0.73,
    team_last_10_off_rebounds_pg: 10.2,
    team_last_10_def_rebounds_pg: 25.2,
    team_last_10_assists_pg: 14.2,
    team_last_10_turnovers_pg: 10.8,
    team_last_10_steals_pg: 6.2,
    team_last_10_blocks_pg: 3.6,
    team_last_10_personal_fouls_pg: 15.8,
    team_last_10_avg_opponent_win_pct: 0.56,
    team_last_10_avg_opponent_point_diff_pg: 2.5,
    team_current_win_streak: 2,
    team_current_loss_streak: 0,
    team_point_diff_pg: ppg - papg,
    team_effective_fg_pct: 0.52,
    team_assist_turnover_ratio: 1.27,
    team_total_rebounds_pg: 35.0,
    team_fg3_attempt_rate: 0.35,
    team_ft_attempt_rate: 0.32,
    team_turnover_to_assist_ratio: 0.78,
    team_avg_opponent_win_pct: 0.55,
    team_avg_opponent_point_diff_pg: 2.0,
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
