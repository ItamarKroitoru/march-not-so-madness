import pandas as pd
import numpy as np
from sklearn.feature_selection import mutual_info_classif, mutual_info_regression
import warnings


class FeatureAnalyzer:
    """
    A minimal, manual-first feature analysis utility designed to help humans 
    inspect and modify a feature set prior to rigorous feature selection.
    """

    def __init__(self, data: pd.DataFrame):
        """
        Initialize the FeatureAnalyzer.

        Args:
            data (pd.DataFrame): The input dataset to analyze and manipulate.
        """
        self.original_data = data.copy()
        self.data = data.copy()
        self.history: list[str] = []

    def analyze_collinearity(self, threshold: float = 0.90) -> pd.DataFrame:
        """
        Identifies highly correlated numerical feature pairs.

        Args:
            threshold (float): Absolute Pearson correlation threshold to flag.

        Returns:
            pd.DataFrame: A DataFrame of highly correlated feature pairs.
        """
        numeric_df = self.data.select_dtypes(include=[np.number])
        corr_matrix = numeric_df.corr().abs()

        pairs = []
        cols = corr_matrix.columns

        for i in range(len(cols)):
            for j in range(i + 1, len(cols)):
                val = corr_matrix.iloc[i, j]
                if val >= threshold:
                    pairs.append({
                        'feature_1': cols[i],
                        'feature_2': cols[j],
                        'correlation': val
                    })

        df_pairs = pd.DataFrame(pairs)
        if not df_pairs.empty:
            df_pairs.sort_values(by='correlation', ascending=False, inplace=True)
            df_pairs.reset_index(drop=True, inplace=True)

        print("========================================")
        print("Highly Correlated Feature Pairs")
        print("========================================")
        if df_pairs.empty:
            print(f"No feature pairs found with absolute correlation >= {threshold}.")
        else:
            for _, row in df_pairs.iterrows():
                print(f"{row['correlation']:.3f} {row['feature_1']} <-> {row['feature_2']}")
        print("========================================\n")

        return df_pairs

    def analyze_interactions(self, y: pd.Series, top_features: int = 20) -> pd.DataFrame:
        """
        Suggests potential multiplicative interactions among the top N features 
        based on mutual information with the target.
        Uses vectorized numpy operations and bulk MI scoring for maximum efficiency.

        Args:
            y (pd.Series): The target variable.
            top_features (int): Number of top base features to consider for interactions.

        Returns:
            pd.DataFrame: A DataFrame of feature pairs and their interaction score.
        """
        numeric_df = self.data.select_dtypes(include=[np.number]).copy()
        numeric_df = numeric_df.fillna(numeric_df.median().fillna(0))

        if y.nunique() < 20 or y.dtype == object:
            mi_func = mutual_info_classif
        else:
            mi_func = mutual_info_regression

        # 1. Initial base features MI
        base_mi = mi_func(numeric_df, y)
        top_indices = np.argsort(base_mi)[-top_features:]
        top_cols = np.array(numeric_df.columns)[top_indices]

        # Extract the matrix of just our top features
        X_top = numeric_df[top_cols].values

        # 2. Vectorized Interaction Generatio
        # Get the upper triangle indices to avoid redundant pairs (A*B and B*A) and self-interactions (A*A)
        i_idx, j_idx = np.triu_indices(len(top_cols), k=1)

        # Multiply the columns directly in memory.
        # This creates an (M_samples, K_interactions) matrix instantly.
        interactions_matrix = X_top[:, i_idx] * X_top[:, j_idx]

        # 3. Bulk Mutual Information Calculation
        # Passing the entire matrix pushes the loop into scikit-learn's optimized backend
        interaction_scores_arr = mi_func(interactions_matrix, y)

        # 4. Map back to feature names and structure the results
        interaction_scores = [
            {
                'feature_1': top_cols[i],
                'feature_2': top_cols[j],
                'interaction_score': score
            }
            for i, j, score in zip(i_idx, j_idx, interaction_scores_arr)
        ]

        df_int = pd.DataFrame(interaction_scores)
        if not df_int.empty:
            df_int.sort_values(by='interaction_score', ascending=False, inplace=True)
            df_int.reset_index(drop=True, inplace=True)

        print("========================================")
        print(f"Top Proposed Interactions (Evaluated Top {top_features} Base Features)")
        print("========================================")
        if df_int.empty:
            print("No interactions generated.")
        else:
            for _, row in df_int.head(top_features).iterrows():
                print(f"{row['interaction_score']:.4f} Score: {row['feature_1']} * {row['feature_2']}")
        print("========================================\n")

        return df_int

    def remove(self, columns: list[str]) -> None:
        """
        Removes the specified columns from the working data.

        Args:
            columns (list[str]): Columns to remove.
        """
        missing = [c for c in columns if c not in self.data.columns]
        if missing:
            raise ValueError(f"Columns not found in data: {missing}")

        self.data.drop(columns=columns, inplace=True)
        self.history.append(f"Removed columns: {columns}")

    def interaction(self, col1: str, col2: str, name: str, operation: str = "multiply") -> None:
        """
        Creates a new interaction feature.

        Args:
            col1 (str): First feature name.
            col2 (str): Second feature name.
            name (str): Name for the new feature.
            operation (str): 'multiply', 'divide', 'add', or 'subtract'.
        """
        if name in self.data.columns:
            raise ValueError(f"Feature '{name}' already exists.")
        if col1 not in self.data.columns or col2 not in self.data.columns:
            raise ValueError(f"One or both input columns ('{col1}', '{col2}') do not exist.")

        if operation == "multiply":
            self.data[name] = self.data[col1] * self.data[col2]
        elif operation == "divide":
            self.data[name] = self.data[col1] / self.data[col2].replace(0, np.nan)
        elif operation == "add":
            self.data[name] = self.data[col1] + self.data[col2]
        elif operation == "subtract":
            self.data[name] = self.data[col1] - self.data[col2]
        else:
            raise ValueError(f"Unsupported operation: {operation}")

        self.history.append(f"Created interaction '{name}' ({col1} {operation} {col2})")

    def combine(self, columns: list[str], name: str, operation: str, drop: bool = False) -> None:
        """
        Combines multiple features using aggregation.

        Args:
            columns (list[str]): Columns to aggregate.
            name (str): Name for the new feature.
            operation (str): 'sum', 'mean', 'max', or 'min'.
            drop (bool): If True, drops original columns.
        """
        if name in self.data.columns:
            raise ValueError(f"Feature '{name}' already exists.")
        missing = [c for c in columns if c not in self.data.columns]
        if missing:
            raise ValueError(f"Columns not found: {missing}")

        subset = self.data[columns]
        if operation == "sum":
            self.data[name] = subset.sum(axis=1)
        elif operation == "mean":
            self.data[name] = subset.mean(axis=1)
        elif operation == "max":
            self.data[name] = subset.max(axis=1)
        elif operation == "min":
            self.data[name] = subset.min(axis=1)
        else:
            raise ValueError(f"Unsupported operation: {operation}")

        self.history.append(f"Combined {columns} into '{name}' using '{operation}'")

        if drop:
            self.remove(columns)

    def rename(self, old: str, new: str) -> None:
        """
        Renames an existing feature.

        Args:
            old (str): Existing feature name.
            new (str): New feature name.
        """
        if old not in self.data.columns:
            raise ValueError(f"Column '{old}' not found.")
        if new in self.data.columns:
            raise ValueError(f"Feature '{new}' already exists.")

        self.data.rename(columns={old: new}, inplace=True)
        self.history.append(f"Renamed '{old}' to '{new}'")

    def summary(self) -> None:
        print("========================================")
        print("Feature Analysis Summary")
        print("========================================")
        print(f"Original feature count: {len(self.original_data.columns)}")
        print(f"Current feature count:  {len(self.data.columns)}")

        added = len(self.data.columns.difference(self.original_data.columns))
        removed = len(self.original_data.columns.difference(self.data.columns))
        print(f"Added features:         {added}")
        print(f"Removed features:       {removed}")

        print("\nModification History:")
        if not self.history:
            print("  No modifications made yet.")
        else:
            for entry in self.history:
                print(f"  - {entry}")
        print("========================================\n")

    def get_data(self) -> pd.DataFrame:
        return self.data.copy()