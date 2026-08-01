from src.state.team_state import TeamState


def safe_divide(
    numerator: float,
    denominator: float,
) -> float:
    if denominator == 0:
        return 0.0

    return numerator / denominator


def build_team_features(
    team_state: TeamState,
    prefix: str,
) -> dict:
    """
    Build the current pregame features for one team.
    """
    games_played = team_state.games_played

    return {
        # Experience
        f"{prefix}_games_played": games_played,

        # Record
        f"{prefix}_wins": team_state.wins,
        f"{prefix}_losses": team_state.losses,
        f"{prefix}_win_pct": safe_divide(
            team_state.wins,
            games_played,
        ),

        # Scoring
        f"{prefix}_ppg": safe_divide(
            team_state.total_points_scored,
            games_played,
        ),
        f"{prefix}_papg": safe_divide(
            team_state.total_points_allowed,
            games_played,
        ),

        # Shooting percentages
        f"{prefix}_fg_pct": safe_divide(
            team_state.total_fgm,
            team_state.total_fga,
        ),
        f"{prefix}_fg3_pct": safe_divide(
            team_state.total_fgm3,
            team_state.total_fga3,
        ),
        f"{prefix}_ft_pct": safe_divide(
            team_state.total_ftm,
            team_state.total_fta,
        ),

        # Per-game box score
        f"{prefix}_off_rebounds_pg": safe_divide(
            team_state.total_offensive_rebounds,
            games_played,
        ),
        f"{prefix}_def_rebounds_pg": safe_divide(
            team_state.total_defensive_rebounds,
            games_played,
        ),
        f"{prefix}_assists_pg": safe_divide(
            team_state.total_assists,
            games_played,
        ),
        f"{prefix}_turnovers_pg": safe_divide(
            team_state.total_turnovers,
            games_played,
        ),
        f"{prefix}_steals_pg": safe_divide(
            team_state.total_steals,
            games_played,
        ),
        f"{prefix}_blocks_pg": safe_divide(
            team_state.total_blocks,
            games_played,
        ),
        f"{prefix}_personal_fouls_pg": safe_divide(
            team_state.total_personal_fouls,
            games_played,
        ),

        # Location performance
        f"{prefix}_home_win_pct": safe_divide(
            team_state.home_wins,
            team_state.home_games,
        ),
        f"{prefix}_away_win_pct": safe_divide(
            team_state.away_wins,
            team_state.away_games,
        ),
        f"{prefix}_neutral_win_pct": safe_divide(
            team_state.neutral_wins,
            team_state.neutral_games,
        ),
    }