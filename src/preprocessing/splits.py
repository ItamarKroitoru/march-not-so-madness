import pandas as pd


def split_raw_by_season(
    raw_X: pd.DataFrame,
    y: pd.Series,
    test_seasons: list[int],
) -> tuple[
    pd.DataFrame,
    pd.DataFrame,
    pd.Series,
    pd.Series,
]:
    """
    Split the raw canonical dataset by season.

    The returned feature tables still contain metadata.
    Preprocessing happens afterward.
    """
    if "Season" not in raw_X.columns:
        raise ValueError("raw_X must contain a 'Season' column.")

    missing_test_seasons = (
        set(test_seasons)
        - set(raw_X["Season"].unique())
    )

    if missing_test_seasons:
        raise ValueError(
            "Requested test seasons are missing from raw_X: "
            f"{sorted(missing_test_seasons)}"
        )

    train_mask = ~raw_X["Season"].isin(test_seasons)
    test_mask = raw_X["Season"].isin(test_seasons)

    raw_X_train = raw_X.loc[train_mask].copy()
    raw_X_test = raw_X.loc[test_mask].copy()

    y_train = y.loc[train_mask].copy()
    y_test = y.loc[test_mask].copy()

    if raw_X_train.empty:
        raise ValueError("Training set is empty.")

    if raw_X_test.empty:
        raise ValueError("Test set is empty.")

    return (
        raw_X_train,
        raw_X_test,
        y_train,
        y_test,
    )