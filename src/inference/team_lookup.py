from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
FINAL_TEAM_STATES_PATH = (
    PROJECT_ROOT / "data" / "final_team_states.csv"
)


def load_final_team_states() -> pd.DataFrame:
    return pd.read_csv(FINAL_TEAM_STATES_PATH)


def get_team_state(
    final_team_states: pd.DataFrame,
    team_name: str,
    season: int,
) -> pd.Series:
    matches = final_team_states[
        (final_team_states["TeamName"] == team_name)
        & (final_team_states["Season"] == season)
    ]

    if len(matches) != 1:
        raise ValueError(
            f"Expected exactly one row for "
            f"{team_name} {season}, found {len(matches)}."
        )

    return matches.iloc[0]