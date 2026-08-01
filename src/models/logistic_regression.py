import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, log_loss
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


def train_logistic_regression(
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
) -> tuple[Pipeline, dict[str, int | float]]:
    """
    Train and evaluate a logistic regression model.

    Parameters
    ----------
    X_train
        Preprocessed training features.
    X_test
        Preprocessed testing features.
    y_train
        Training labels.
    y_test
        Testing labels.

    Returns
    -------
    model
        Trained scaling and logistic-regression pipeline.
    results
        Evaluation metrics and dataset sizes.
    """
    model = Pipeline(
        [
            (
                "scaler",
                StandardScaler(),
            ),
            (
                "logistic_regression",
                LogisticRegression(
                    max_iter=1000,
                ),
            ),
        ]
    )

    model.fit(
        X_train,
        y_train,
    )

    predictions = model.predict(X_test)

    probabilities = model.predict_proba(
        X_test
    )[:, 1]

    results = {
        "train_games": len(X_train),
        "test_games": len(X_test),
        "accuracy": accuracy_score(
            y_test,
            predictions,
        ),
        "log_loss": log_loss(
            y_test,
            probabilities,
        ),
    }

    return model, results