import pandas as pd


METADATA_COLUMNS = {
    "Season",
    "DayNum",
    "team_1_id",
    "team_1_name",
    "team_2_id",
    "team_2_name",
}


def preprocess_X(
    raw_X: pd.DataFrame,
) -> pd.DataFrame:
    """
    Convert raw pregame data into model-ready numeric features.
    """
    X = raw_X.copy()

    columns_to_drop = [
        column
        for column in METADATA_COLUMNS
        if column in X.columns
    ]

    X = X.drop(columns=columns_to_drop)

    non_numeric_columns = [
        column
        for column in X.columns
        if not pd.api.types.is_numeric_dtype(X[column])
    ]

    if non_numeric_columns:
        raise ValueError(
            "Non-numeric model columns remain after preprocessing: "
            f"{non_numeric_columns}"
        )

    return X


def preprocess_train_test(
    raw_X_train: pd.DataFrame,
    raw_X_test: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Apply the same deterministic preprocessing to train and test.
    """
    X_train = preprocess_X(raw_X_train)
    X_test = preprocess_X(raw_X_test)

    if X_train.columns.tolist() != X_test.columns.tolist():
        raise ValueError(
            "Train and test preprocessing produced different columns."
        )

    return X_train, X_test