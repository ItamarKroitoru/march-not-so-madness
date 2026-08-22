import numpy as np
import pandas as pd


def build_matchup_features(
    team_1_state: pd.Series,
    team_2_state: pd.Series,
    team_1_location: int = 0,
) -> pd.DataFrame:
    """
    Build one model-ready differential matchup row from two
    saved end-of-season team-state rows.

    team_1_location:
         1 = team 1 home
         0 = neutral
        -1 = team 1 away
    """

    if team_1_location not in {-1, 0, 1}:
        raise ValueError(
            "team_1_location must be -1, 0, or 1. "
            f"Received: {team_1_location!r}"
        )

    feature_row = {}

    # ---------------------------------------------------------
    # 1. Standard Team 1 - Team 2 differentials
    # ---------------------------------------------------------

    team_feature_columns = [
        col
        for col in team_1_state.index
        if col.startswith("team_")
        and col in team_2_state.index
    ]

    for col in team_feature_columns:
        feature_name = col.removeprefix("team_") + "_diff"

        feature_row[feature_name] = (
            team_1_state[col] - team_2_state[col]
        )

    # ---------------------------------------------------------
    # 2. Season-progress-adjusted win percentage
    #    Same formula used in NB1
    # ---------------------------------------------------------

    def wins_ratio(state):
        games = state["team_games_played"]
        win_pct = state["team_win_pct"]

        weight = np.exp(-0.15 * games)

        return (
            (1 - weight) * win_pct
            + weight * 0.5
        )

    feature_row["wins_ratio_diff"] = (
        wins_ratio(team_1_state)
        - wins_ratio(team_2_state)
    )

    # ---------------------------------------------------------
    # 3. Location-specific strength
    #    Same logic used in NB1
    # ---------------------------------------------------------

    team_1_home_strength = (
        team_1_state["team_home_win_pct"]
        if team_1_location == 1 else 0
    )

    team_1_neutral_strength = (
        team_1_state["team_neutral_win_pct"]
        if team_1_location == 0 else 0
    )

    team_1_away_strength = (
        team_1_state["team_away_win_pct"]
        if team_1_location == -1 else 0
    )

    # If Team 1 is away, Team 2 is home, and vice versa.
    team_2_home_strength = (
        team_2_state["team_home_win_pct"]
        if team_1_location == -1 else 0
    )

    team_2_neutral_strength = (
        team_2_state["team_neutral_win_pct"]
        if team_1_location == 0 else 0
    )

    team_2_away_strength = (
        team_2_state["team_away_win_pct"]
        if team_1_location == 1 else 0
    )

    feature_row["home_strength_diff"] = (
        team_1_home_strength - team_2_home_strength
    )

    feature_row["neutral_strength_diff"] = (
        team_1_neutral_strength - team_2_neutral_strength
    )

    feature_row["away_strength_diff"] = (
        team_1_away_strength - team_2_away_strength
    )

    return pd.DataFrame([feature_row])