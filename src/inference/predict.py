from pathlib import Path
import json

import joblib

from src.inference.team_lookup import (
    load_final_team_states,
    get_team_state,
)
from src.inference.matchup_features import build_matchup_features


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = PROJECT_ROOT / "artifacts" / "logistic_regression.joblib"
FEATURE_COLUMNS_PATH = (
    PROJECT_ROOT / "artifacts" / "feature_columns.json"
)

model = joblib.load(MODEL_PATH)
final_team_states = load_final_team_states()

with open(FEATURE_COLUMNS_PATH) as f:
    feature_columns = json.load(f)


def predict_matchup(
    team_1_name: str,
    team_1_season: int,
    team_2_name: str,
    team_2_season: int,
    team_1_location: int = 0,
) -> dict:
    """
    Predict a hypothetical matchup.

    team_1_location:
         1 = team 1 home
         0 = neutral
        -1 = team 1 away
    """
    team_1_state = get_team_state(
        final_team_states,
        team_1_name,
        team_1_season,
    )

    team_2_state = get_team_state(
        final_team_states,
        team_2_name,
        team_2_season,
    )

    X_matchup = build_matchup_features(
        team_1_state=team_1_state,
        team_2_state=team_2_state,
        team_1_location=team_1_location,
    )

    X_matchup = X_matchup[feature_columns]

    probabilities = model.predict_proba(X_matchup)[0]

    return {
        "team_1": f"{team_1_name} {team_1_season}",
        "team_2": f"{team_2_name} {team_2_season}",
        "team_1_win_probability": float(probabilities[1]),
        "team_2_win_probability": float(probabilities[0]),
    }