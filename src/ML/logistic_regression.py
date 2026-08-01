import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, log_loss
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


METADATA_COLUMNS = {
    "Season",
    "DayNum",
    "team_1_id",
    "team_1_name",
    "team_2_id",
    "team_2_name",
}


def train_logistic_regression(
    X: pd.DataFrame,
    y: pd.Series,
    test_seasons: list[int],
):
    train_mask = ~X["Season"].isin(test_seasons)
    test_mask = X["Season"].isin(test_seasons)

    model_X = X.drop(
        columns=[
            column
            for column in METADATA_COLUMNS
            if column in X.columns
        ]
    )

    X_train = model_X.loc[train_mask]
    X_test = model_X.loc[test_mask]

    y_train = y.loc[train_mask]
    y_test = y.loc[test_mask]

    model = Pipeline(
        [
            ("scaler", StandardScaler()),
            (
                "logistic_regression",
                LogisticRegression(max_iter=1000),
            ),
        ]
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]

    results = {
        "train_seasons": sorted(
            X.loc[train_mask, "Season"].unique().tolist()
        ),
        "test_seasons": sorted(
            X.loc[test_mask, "Season"].unique().tolist()
        ),
        "train_games": len(X_train),
        "test_games": len(X_test),
        "accuracy": accuracy_score(y_test, predictions),
        "log_loss": log_loss(y_test, probabilities),
    }

    return model, results