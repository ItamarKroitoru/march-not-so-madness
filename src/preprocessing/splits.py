import pandas as pd


def split_by_season(
    raw_X: pd.DataFrame,
    X: pd.DataFrame,
    y: pd.Series,
    test_seasons: list[int],
) -> tuple[
    pd.DataFrame,
    pd.DataFrame,
    pd.Series,
    pd.Series,
]:
    """
    Split a preprocessed dataset into train and test sets by season.

    Parameters
    ----------
    raw_X
        Original dataset containing metadata columns
        (including Season).
    X
        Preprocessed feature matrix.
    y
        Labels.
    test_seasons
        Seasons reserved for testing.

    Returns
    -------
    X_train
    X_test
    y_train
    y_test
    """
    train_mask = ~raw_X["Season"].isin(
        test_seasons
    )

    test_mask = raw_X["Season"].isin(
        test_seasons
    )

    X_train = X.loc[train_mask]
    X_test = X.loc[test_mask]

    y_train = y.loc[train_mask]
    y_test = y.loc[test_mask]

    return (
        X_train,
        X_test,
        y_train,
        y_test,
    )