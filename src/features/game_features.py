from src.features.team_features import (
    build_team_features,
)

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
        "team_1_name": team_name_lookup[
            team_1_state.team_id
        ],
        **build_team_features(
            team_1_state,
            prefix="team_1",
        ),

        "team_2_id": team_2_state.team_id,
        "team_2_name": team_name_lookup[
            team_2_state.team_id
        ],
        **build_team_features(
            team_2_state,
            prefix="team_2",
        ),

        "is_neutral": is_neutral,
    }