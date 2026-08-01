from src.features.team_features import build_team_features
from src.state.team_state import TeamState


def build_game_feature_row(
    team_1_state: TeamState,
    team_2_state: TeamState,
    team_name_lookup: dict[int, str],
    season: int,
    day_num: int,
    team_1_location: int,
) -> dict:
    """
    Build one raw pregame feature row.

    Team ordering:
        team_1 = lower TeamID
        team_2 = higher TeamID

    team_1_location:
         1 = team_1 is home
        -1 = team_1 is away
         0 = neutral

    The row contains only information available before
    the current game begins.
    """
    if team_1_location not in {-1, 0, 1}:
        raise ValueError(
            "team_1_location must be -1, 0, or 1. "
            f"Received: {team_1_location!r}"
        )

    return {
        "Season": season,
        "DayNum": day_num,

        "team_1_id": team_1_state.team_id,
        "team_1_name": team_name_lookup[
            team_1_state.team_id
        ],
        **build_team_features(
            team_state=team_1_state,
            prefix="team_1",
        ),

        "team_2_id": team_2_state.team_id,
        "team_2_name": team_name_lookup[
            team_2_state.team_id
        ],
        **build_team_features(
            team_state=team_2_state,
            prefix="team_2",
        ),

        "team_1_location": team_1_location,
    }