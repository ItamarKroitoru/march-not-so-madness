import pandas as pd

METADATA_COLUMNS = {
    "Season",
    "DayNum",
    "team_1_id",
    "team_1_name",
    "team_2_id",
    "team_2_name",
}

def symmetrize_dataset(
        X: pd.DataFrame,
        y: pd.Series,
        prefix1: str = "team_1_",
        prefix2: str = "team_2_",
        invert_cols: list[str] | None = None,
        exclude_cols: list[str] | None = None
) -> tuple[pd.DataFrame, pd.Series]:
    """
    Creates a symmetric dataset where each matchup is represented from the
    perspective of both teams to eliminate directional bias.

    Args:
        X (pd.DataFrame): The input feature matrix containing the matchup data.
        y (pd.Series): The target labels (binary win/loss).
        prefix1 (str, optional): The prefix identifying the first team's features. Defaults to "team_1_".
        prefix2 (str, optional): The prefix identifying the second team's features. Defaults to "team_2_".
        invert_cols (list[str] | None, optional): Specific columns to mathematically invert (e.g., location). Defaults to None.
        exclude_cols (list[str] | None, optional): Columns that should not be swapped or inverted (e.g., categoricals). Defaults to None.

    Returns:
        tuple[pd.DataFrame, pd.Series]: A tuple containing the symmetric features DataFrame and target Series.
    """
    # 1. Validate inputs and dataset alignment
    if len(X) != len(y):
        raise ValueError(f"Dimension mismatch: X has {len(X)} rows, but y has {len(y)} rows.")
    if X.empty:
        raise ValueError("Cannot symmetrize an empty dataset.")

    # 2. Initialize default lists if None
    if invert_cols is None:
        invert_cols = []
    if exclude_cols is None:
        exclude_cols = []

    # 3. Identify base feature names by stripping prefix1
    base_features = [
        col[len(prefix1):] for col in X.columns if col.startswith(prefix1)
    ]

    # 4. Ensure a counterpart exists for prefix2 and filter out excluded columns
    valid_bases = []
    for f in base_features:
        col1 = f"{prefix1}{f}"
        col2 = f"{prefix2}{f}"
        if col2 in X.columns and col1 not in exclude_cols and col2 not in exclude_cols:
            valid_bases.append(f)

    # 5. Explanatory print detailing the identified features
    print(f"--- Symmetrizing Dataset ---")
    print(f"Identified {len(valid_bases)} base features to swap between {prefix1} and {prefix2}:")
    print(f"{valid_bases}\n")

    # 6. Create original and flipped perspectives
    X1 = X.copy()
    y1 = y.copy()

    X2 = X.copy()
    y2 = 1 - y.copy()  # Inverts binary win/loss label

    # 7. Swap the prefixed columns for Perspective 2
    for f in valid_bases:
        col1 = f"{prefix1}{f}"
        col2 = f"{prefix2}{f}"
        X2[col1] = X[col2]
        X2[col2] = X[col1]

    # 8. Invert specific columns mathematically
    for col in invert_cols:
        if col in X2.columns and col not in exclude_cols:
            X2[col] = -X2[col]

    # 9. Combine perspectives
    X_sym = pd.concat([X1, X2], ignore_index=True)
    y_sym = pd.concat([y1, y2], ignore_index=True)

    return X_sym, y_sym


def calculate_feature_differentials(
        X: pd.DataFrame,
        prefix1: str = "team_1_",
        prefix2: str = "team_2_",
        diff_suffix: str = "_diff",
        drop_base_features: bool = True,
        exclude_cols: list[str] | None = None
) -> pd.DataFrame:
    """
    Calculates differential features dynamically for any matching numeric columns,
    subtracting Team 2's metrics from Team 1's.

    Args:
        X (pd.DataFrame): The input dataframe containing the merged features for both entities.
        prefix1 (str, optional): The prefix identifying the first team's features. Defaults to "team_1_".
        prefix2 (str, optional): The prefix identifying the second team's features. Defaults to "team_2_".
        diff_suffix (str, optional): The suffix appended to the new differential columns. Defaults to "_diff".
        drop_base_features (bool, optional): If True, drops the original prefix columns after calculation. Defaults to True.
        exclude_cols (list[str] | None, optional): Columns to exempt from differential calculations. Defaults to None.

    Returns:
        pd.DataFrame: A dataframe containing the newly calculated differential columns.
    """
    # 1. Validate inputs
    if X.empty:
        raise ValueError("Cannot calculate differentials on an empty dataframe.")

    # 2. Initialize exclusion list if None
    if exclude_cols is None:
        exclude_cols = []

    # 3. Copy dataframe and identify base features
    X_out = X.copy()
    base_features = [
        col[len(prefix1):] for col in X_out.columns if col.startswith(prefix1)
    ]

    # 4. Check if any features exist to process
    if not base_features:
        raise ValueError(f"No columns found starting with prefix '{prefix1}'.")

    cols_to_drop = []
    processed_features = []

    # 5. Iterate and calculate differentials
    for f in base_features:
        col1 = f"{prefix1}{f}"
        col2 = f"{prefix2}{f}"

        # 6. Skip calculation if either column is on the exclusion list
        if col1 in exclude_cols or col2 in exclude_cols:
            continue

        # 7. Calculate differential if both columns are strictly numeric
        if (col2 in X_out.columns and
                pd.api.types.is_numeric_dtype(X_out[col1]) and
                pd.api.types.is_numeric_dtype(X_out[col2])):

            diff_name = f"{f}{diff_suffix}"
            X_out[diff_name] = X_out[col1] - X_out[col2]
            processed_features.append(f)

            if drop_base_features:
                cols_to_drop.extend([col1, col2])

    # 8. Explanatory print detailing the differentiated features
    print(f"--- Calculating Differentials ---")
    print(f"Successfully computed differentials for {len(processed_features)} base features:")
    print(f"{processed_features}\n")

    # 9. Drop base features if requested
    if drop_base_features:
        X_out = X_out.drop(columns=[c for c in cols_to_drop if c in X_out.columns])

    return X_out


def preprocess_X(
        raw_X: pd.DataFrame,
        prefix1: str = "team_1_",
        prefix2: str = "team_2_",
        diff_suffix: str = "_diff",
        drop_base_features: bool = True,
        exclude_cols: list[str] | None = None
) -> pd.DataFrame:
    """
    Convert raw pregame data into model-ready numeric features, applying differentials.

    Args:
        raw_X (pd.DataFrame): The raw features dataset before preprocessing.
        prefix1 (str, optional): The prefix identifying the first team's features. Defaults to "team_1_".
        prefix2 (str, optional): The prefix identifying the second team's features. Defaults to "team_2_".
        diff_suffix (str, optional): Suffix for generated differential features. Defaults to "_diff".
        drop_base_features (bool, optional): If True, drops original columns after diffing. Defaults to True.
        exclude_cols (list[str] | None, optional): Columns to keep unaltered (no swapping, no diffing). Defaults to None.

    Returns:
        pd.DataFrame: A fully numeric, model-ready feature dataframe.
    """
    # 1. Copy raw dataframe
    X = raw_X.copy()

    # 2. Drop non-predictive metadata
    columns_to_drop = [
        column for column in METADATA_COLUMNS if column in X.columns
    ]
    X = X.drop(columns=columns_to_drop)

    # 3. Calculate differentials dynamically
    X = calculate_feature_differentials(
        X,
        prefix1=prefix1,
        prefix2=prefix2,
        diff_suffix=diff_suffix,
        drop_base_features=drop_base_features,
        exclude_cols=exclude_cols
    )

    # 4. Check for unhandled non-numeric columns
    non_numeric_columns = [
        column for column in X.columns if not pd.api.types.is_numeric_dtype(X[column])
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
        y_train: pd.Series,
        y_test: pd.Series,
        prefix1: str = "team_1_",
        prefix2: str = "team_2_",
        invert_cols: list[str] | None = None,
        exclude_cols: list[str] | None = None,
        diff_suffix: str = "_diff",
        drop_base_features: bool = True,
        symmetrize_test: bool = True
) -> tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """
    Apply symmetrization and deterministic preprocessing to the train and test splits.

    Args:
        raw_X_train (pd.DataFrame): Raw training feature dataframe.
        raw_X_test (pd.DataFrame): Raw testing feature dataframe.
        y_train (pd.Series): Training target labels.
        y_test (pd.Series): Testing target labels.
        prefix1 (str, optional): The prefix identifying the first team's features. Defaults to "team_1_".
        prefix2 (str, optional): The prefix identifying the second team's features. Defaults to "team_2_".
        invert_cols (list[str] | None, optional): Columns to mathematically invert during symmetrization. Defaults to None.
        exclude_cols (list[str] | None, optional): Columns to exempt from processing rules. Defaults to None.
        diff_suffix (str, optional): Suffix for generated differential features. Defaults to "_diff".
        drop_base_features (bool, optional): Whether to drop original base columns post-differencing. Defaults to True.

    Returns:
        tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]: The final X_train, X_test, y_train, y_test.
    """
    # 1. Validate dataset integrity
    if raw_X_train.empty or raw_X_test.empty:
        raise ValueError("Cannot preprocess. Training or test feature matrix is empty.")

    # 2. Symmetrize the datasets
    print("Processing Training Set:")
    sym_X_train, sym_y_train = symmetrize_dataset(
        raw_X_train, y_train, prefix1, prefix2, invert_cols, exclude_cols
    )

    if symmetrize_test:
        print("Processing Testing Set:")
        X_test, y_test = symmetrize_dataset(
            raw_X_test, y_test, prefix1, prefix2, invert_cols, exclude_cols
        )
    else:
        X_test = raw_X_test.copy()
        y_test = y_test.copy()

    # 3. Preprocess (Differential calculation & Metadata cleanup)
    print("Extracting Differentials for Training Set:")
    X_train = preprocess_X(
        sym_X_train, prefix1, prefix2, diff_suffix, drop_base_features, exclude_cols
    )

    print("Extracting Differentials for Testing Set:")
    X_test = preprocess_X(
        X_test, prefix1, prefix2, diff_suffix, drop_base_features, exclude_cols
    )

    # 4. Validate final column alignment
    if X_train.columns.tolist() != X_test.columns.tolist():
        raise ValueError(
            "Train and test preprocessing produced different columns. "
            f"Train columns: {len(X_train.columns)}, Test columns: {len(X_test.columns)}"
        )

    return X_train, X_test, sym_y_train, y_test