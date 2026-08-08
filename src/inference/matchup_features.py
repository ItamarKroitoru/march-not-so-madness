import pandas as pd


def build_matchup_features(
    team_1_state: pd.Series,
    team_2_state: pd.Series,
    team_1_location: int = 0,
) -> pd.DataFrame:
    """
    Build one differential matchup feature row from two
    saved end-of-season team-state rows.

    team_1_location:
         1 = team_1 is home
        -1 = team_1 is away
         0 = neutral
    """
    if team_1_location not in {-1, 0, 1}:
        raise ValueError(
            "team_1_location must be -1, 0, or 1. "
            f"Received: {team_1_location!r}"
        )

    feature_row = {}

    team_feature_columns = [
        col
        for col in team_1_state.index
        if col.startswith("team_")
    ]

    for col in team_feature_columns:
        feature_name = col.removeprefix("team_") + "_diff"

        feature_row[feature_name] = (
            team_1_state[col]
            - team_2_state[col]
        )

    feature_row["team_1_location"] = team_1_location

    return pd.DataFrame([feature_row])