import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


def train_logistic_regression(
    X_train: pd.DataFrame,
    y_train: pd.Series,
) -> Pipeline:
    """
    Train a logistic-regression classification pipeline.
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

    return model