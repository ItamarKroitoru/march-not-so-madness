import collections

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import RFE
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler


class FeatureSelector:
    """
    Selects features by evaluating results from Lasso (L1),
    Recursive Feature Elimination (RFE), and Random Forest importance.
    """

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.selected_features_ = []
        self.method_votes_ = []

    # ==========================================
    # Public Evaluation Methods
    # ==========================================

    def run_lasso(
            self,
            X: pd.DataFrame,
            y: pd.Series,
            target_features: int = 10,
            print_results: bool = True,
            plot_results: bool = True,
            max_samples: int = 40000,
            n_steps: int = 25
    ) -> list[str]:
        """
        Evaluates features using the Lasso Path for Classification.
        Uses subsampling to dramatically improve execution speed on large datasets.
        """
        feature_names = X.columns.tolist()

        # Subsample to drastically speed up the regularization path loop
        if len(X) > max_samples:
            if print_results:
                print(f"Subsampling {max_samples} rows from {len(X)} for Lasso speed...")
            X_sample = X.sample(n=max_samples, random_state=self.random_state)
            y_sample = y.loc[X_sample.index]
        else:
            X_sample = X.copy()
            y_sample = y.copy()

        # Scale features for regularization
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_sample)

        # Reduced resolution from 40 to 25 to save computation
        C_values = np.logspace(-3, 1, n_steps)
        coefficients = []

        for c in C_values:
            temp_model = LogisticRegression(
                penalty='l1',
                C=c,
                solver='liblinear',
                random_state=self.random_state,
                max_iter=2000
            )
            temp_model.fit(X_scaled, y_sample)
            coefficients.append(temp_model.coef_.ravel())

        coefficients = np.array(coefficients)

        # Find the closest index to C=1.0 for identifying the top surviving features
        c_index_for_top = np.abs(C_values - 1.0).argmin()
        top_indices = np.argsort(np.abs(coefficients[c_index_for_top]))[-target_features:]

        selected = [feature_names[i] for i in top_indices]
        removed = [f for f in feature_names if f not in selected]

        self.method_votes_.extend(selected)

        if print_results:
            self._print_method_results("Lasso (L1 Regularization Path)", selected, removed)
        if plot_results:
            self._plot_lasso_path(coefficients, C_values, top_indices, feature_names)

        return selected

    def run_rfe(
            self,
            X: pd.DataFrame,
            y: pd.Series,
            target_features: int = 10,
            print_results: bool = True,
            plot_results: bool = True
    ) -> list[str]:
        """
        Evaluates features using Recursive Feature Elimination (Backward Elimination).
        """
        feature_names = X.columns.tolist()

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Standard logistic regression
        estimator = LogisticRegression(
            max_iter=1000,
            random_state=self.random_state
        )
        selector = RFE(
            estimator=estimator,
            n_features_to_select=target_features
        )
        selector.fit(X_scaled, y)

        selected_mask = selector.support_
        ranking = selector.ranking_

        selected = [f for f, keep in zip(feature_names, selected_mask) if keep]
        removed = [f for f, keep in zip(feature_names, selected_mask) if not keep]

        self.method_votes_.extend(selected)

        if print_results:
            self._print_method_results("Recursive Feature Elimination (Backward)", selected, removed)
        if plot_results:
            self._plot_rfe_ranking(ranking, feature_names)

        return selected

    def run_tree_importance(
            self,
            X: pd.DataFrame,
            y: pd.Series,
            target_features: int = 10,
            print_results: bool = True,
            plot_results: bool = True
    ) -> list[str]:
        """
        Evaluates features using Random Forest impurity decrease.
        """
        feature_names = X.columns.tolist()

        model = RandomForestClassifier(
            n_estimators=100,
            random_state=self.random_state,
            n_jobs=-1
        )
        model.fit(X, y)

        importances = model.feature_importances_
        top_indices = np.argsort(importances)[-target_features:]

        selected = [feature_names[i] for i in top_indices]
        removed = [f for f in feature_names if f not in selected]

        self.method_votes_.extend(selected)

        if print_results:
            self._print_method_results("Random Forest Importance", selected, removed)
        if plot_results:
            self._plot_tree_importance(importances, feature_names, target_features)

        return selected

    # ==========================================
    # Finalization & Transformation
    # ==========================================

    def finalize_selection(
            self,
            vote_threshold: int = 2,
            print_results: bool = True
    ) -> list[str]:
        """
        Tallies the votes from all executed runs and finalizes the feature list.
        """
        vote_counts = collections.Counter(self.method_votes_)

        self.selected_features_ = [
            feature for feature, count in vote_counts.items()
            if count >= vote_threshold
        ]

        if print_results:
            self._print_final_verdict(vote_counts, vote_threshold)

        return self.selected_features_

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Reduces the dataframe strictly to the finalized selected features.
        """
        if not self.selected_features_:
            raise ValueError(
                "No features have been selected. "
                "Ensure you have run evaluation methods and called finalize_selection()."
            )

        return X[self.selected_features_].copy()

    # ==========================================
    # Reporting & Visualization Helpers
    # ==========================================

    def _print_method_results(self, method_name: str, selected: list[str], removed: list[str]) -> None:
        print(f"--- {method_name} ---")
        print(f"Selected ({len(selected)}): {selected}")
        print(f"Removed  ({len(removed)}): {removed}\n")

    def _print_final_verdict(self, vote_counts: dict, vote_threshold: int) -> None:
        print("============================================")
        print("FINAL FEATURE SELECTION VERDICT")
        print("============================================")
        print(f"Target Threshold: {vote_threshold} votes required")
        print(f"Total Features Selected: {len(self.selected_features_)}\n")

        print("Detailed Voting Breakdown:")
        sorted_votes = sorted(vote_counts.items(), key=lambda item: (-item[1], item[0]))

        for feature, votes in sorted_votes:
            status = "KEEP" if votes >= vote_threshold else "DROP"
            print(f"[{status}] {feature}: {votes} vote(s)")
        print("============================================\n")

    def _plot_lasso_path(self, coefs: np.ndarray, C_values: np.ndarray, top_indices: np.ndarray,
                         feature_names: list[str]) -> None:
        plt.figure(figsize=(12, 6))

        for i in range(coefs.shape[1]):
            if i not in top_indices:
                plt.plot(np.log10(C_values), coefs[:, i], color='lightgray', alpha=0.4)

        for i in top_indices:
            plt.plot(np.log10(C_values), coefs[:, i], label=feature_names[i], linewidth=2.5)

        plt.xlabel('log10(C) (Inverse of Regularization Strength)', fontsize=12)
        plt.ylabel('Coefficient Value', fontsize=12)
        plt.title('Lasso Path for Classification (L1 Logistic Regression)', fontsize=14)
        plt.axvline(x=0, color='k', linestyle='--', alpha=0.5, label='Standard Reg (C=1.0)')
        plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left', title="Top Features")
        plt.grid(True, linestyle=':', alpha=0.7)
        plt.tight_layout()
        plt.show()

    def _plot_rfe_ranking(self, ranking: np.ndarray, feature_names: list[str]) -> None:
        plt.figure(figsize=(10, 6))

        indices = np.argsort(ranking)
        sorted_ranks = ranking[indices]
        sorted_features = [feature_names[i] for i in indices]

        colors = ["green" if r == 1 else "gray" for r in sorted_ranks]

        plt.barh(sorted_features, sorted_ranks, color=colors)
        plt.title("RFE Feature Rankings (Rank 1 = Selected)")
        plt.xlabel("Elimination Rank (Lower is Better)")
        plt.gca().invert_yaxis()
        plt.tight_layout()
        plt.show()

    def _plot_tree_importance(self, importances: np.ndarray, feature_names: list[str], target_features: int) -> None:
        plt.figure(figsize=(10, 6))

        indices = np.argsort(importances)
        sorted_importances = importances[indices]
        sorted_features = [feature_names[i] for i in indices]

        colors = ["orange" if i >= (len(importances) - target_features) else "gray"
                  for i in range(len(importances))]

        plt.barh(sorted_features, sorted_importances, color=colors)
        plt.title("Random Forest Feature Importance")
        plt.xlabel("Gini Importance")
        plt.tight_layout()
        plt.show()