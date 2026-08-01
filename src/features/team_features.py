from src.state.team_state import TeamState


def build_team_features(
    team_state: TeamState,
    prefix: str,
) -> dict:
    """
    Build the current pregame features for one team.
    """
    games_played = team_state.games_played

    if games_played == 0:
        win_pct = 0.0
        ppg = 0.0
        papg = 0.0
    else:
        win_pct = (
            team_state.wins
            / games_played
        )

        ppg = (
            team_state.total_points_scored
            / games_played
        )

        papg = (
            team_state.total_points_allowed
            / games_played
        )

    return {
        f"{prefix}_games_played": games_played,

        f"{prefix}_wins": team_state.wins,
        f"{prefix}_losses": team_state.losses,

        f"{prefix}_win_pct": win_pct,

        f"{prefix}_ppg": ppg,
        f"{prefix}_papg": papg,
    }