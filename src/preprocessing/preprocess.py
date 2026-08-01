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
    Convert the raw historical feature table into model-ready X.

    For V1, preprocessing only removes metadata columns.
    """
    X = raw_X.copy()

    columns_to_drop = [
        column
        for column in METADATA_COLUMNS
        if column in X.columns
    ]

    X = X.drop(columns=columns_to_drop)

    return X