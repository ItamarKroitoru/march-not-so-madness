from src.state.team_state import TeamState


def build_game_feature_row(
    team_1_state: TeamState,
    team_2_state: TeamState,
    team_name_lookup: dict[int, str],
    season: int,
    day_num: int,
    is_neutral: int,
) -> dict:
    """
    Build one raw pregame feature row.

    The row contains only information available before
    the current game begins.
    """
    return {
        "Season": season,
        "DayNum": day_num,

        "team_1_id": team_1_state.team_id,
        "team_1_name": team_name_lookup[team_1_state.team_id],
        "team_1_games_played": team_1_state.games_played,
        "team_1_wins": team_1_state.wins,
        "team_1_losses": team_1_state.losses,
        "team_1_points_scored": team_1_state.total_points_scored,
        "team_1_points_allowed": team_1_state.total_points_allowed,

        "team_2_id": team_2_state.team_id,
        "team_2_name": team_name_lookup[team_2_state.team_id],
        "team_2_games_played": team_2_state.games_played,
        "team_2_wins": team_2_state.wins,
        "team_2_losses": team_2_state.losses,
        "team_2_points_scored": team_2_state.total_points_scored,
        "team_2_points_allowed": team_2_state.total_points_allowed,

        "is_neutral": is_neutral,
    }