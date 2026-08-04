import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import seaborn as sns
import matplotlib.pyplot as plt


class EnsembleLearner:
    """
    A Stacking Ensemble that trains base learners on one subset of data,
    and a meta-learner on the probabilistic predictions of those base learners
    using a holdout subset to prevent data leakage.
    """

    def __init__(self, meta_model=None, meta_test_size: float = 0.3, random_state: int = 42):
        self.learners = {}
        # The meta-learner itself defaults to a Logistic Regression if not provided
        self.meta_model = meta_model if meta_model is not None else LogisticRegression(random_state=random_state)
        self.meta_test_size = meta_test_size
        self.random_state = random_state
        self.is_fitted = False

    # ==========================================
    # Learner Management API
    # ==========================================

    def add_learner(self, name: str, model) -> None:
        """
        Adds an un-initialized model to the ensemble.
        The model MUST possess .fit() and .predict_proba() methods.
        """
        if not hasattr(model, "fit") or not hasattr(model, "predict_proba"):
            raise ValueError(f"Model '{name}' must have both .fit() and .predict_proba() methods.")
        self.learners[name] = model
        self.is_fitted = False  # Reset if a new model is added

    def remove_learner(self, name: str) -> None:
        """Removes a learner by its dictionary key name."""
        if name in self.learners:
            del self.learners[name]
            self.is_fitted = False

    # ==========================================
    # Core Training & Prediction
    # ==========================================

    def _get_meta_features(self, X: pd.DataFrame) -> np.ndarray:
        """
        Internal helper: Forces all base learners to predict on X,
        extracts the positive class probability, and stacks them into a new feature matrix.
        """
        meta_features = []
        for name, model in self.learners.items():
            # Extract probability of class 1 (win)
            proba = model.predict_proba(X)[:, 1]
            meta_features.append(proba)

        # Transpose to shape (n_samples, n_learners)
        return np.column_stack(meta_features)

    def fit(self, X: pd.DataFrame, y: pd.Series) -> "EnsembleLearner":
        if not self.learners:
            raise ValueError("No base learners available. Use add_learner() first.")

        print("Partitioning data to prevent leakage...")
        X_base, X_meta, y_base, y_meta = train_test_split(
            X, y, test_size=self.meta_test_size, random_state=self.random_state
        )

        print("Training base learners...")
        for name, model in self.learners.items():
            model.fit(X_base, y_base)
            train_acc = accuracy_score(y_base, model.predict(X_base))
            test_acc = accuracy_score(y_meta, model.predict(X_meta))
            print(f"{name:<20} train={train_acc:.4f}  test={test_acc:.4f}")

        print("Generating meta-features...")
        X_meta_features = self._get_meta_features(X_meta)

        print("Training meta-learner...")
        self.meta_model.fit(X_meta_features, y_meta)

        self.is_fitted = True
        return self

    def plot_error_heatmap(self, X: pd.DataFrame, y: pd.Series) -> None:
        """
        Calculates and plots the Error Diversity Matrix (\tilde{E}^T \tilde{E})
        to evaluate how correlated the base learners' mistakes are.
        """
        if not self.learners:
            raise ValueError("No base learners available to evaluate.")

        # We need to make sure they have been fitted first
        # Since they are fitted during self.fit(), we can check self.is_fitted
        if not self.is_fitted:
            print("Warning: The ensemble has not been fitted yet. Run .fit() first.")
            return
        learner_names = list(self.learners.keys())
        n_learners = len(learner_names)
        n_samples = len(y)

        # 1. Generate empty matrix E
        E = np.zeros((n_samples, n_learners))
        y_np = y.to_numpy()

        # 2. Fill matrix with binary errors (1 = error, 0 = correct)
        for i, name in enumerate(learner_names):
            preds = self.learners[name].predict(X)
            E[:, i] = (preds != y_np).astype(float)

        # 3. Center the matrix
        E_centered = E - np.mean(E, axis=0)

        # 4. Normalize the matrix to create \tilde{E}
        # Adding a tiny epsilon (1e-8) to prevent division by zero in case a model is 100% perfect
        norms = np.sqrt(np.sum(E_centered ** 2, axis=0))
        norms[norms == 0] = 1e-8
        E_tilde = E_centered / norms

        # 5. Compute the correlation matrix: \tilde{E}^T * \tilde{E}
        error_correlation_matrix = E_tilde.T @ E_tilde

        print("Matrix \tilde{E}^T * \tilde{E} (Error Correlation):")
        print(np.round(error_correlation_matrix, 4))

        # 6. Plot the heatmap
        # Dynamic sizing based on how many base models you add
        plt.figure(figsize=(max(6, n_learners * 1.2), max(5, n_learners * 1.0)))

        # Using vmin=-1 because negative correlation (making opposite mistakes) is highly desirable!
        sns.heatmap(
            error_correlation_matrix,
            annot=True,
            cmap='coolwarm',
            vmin=-1,
            vmax=1,
            xticklabels=learner_names,
            yticklabels=learner_names,
            cbar_kws={'label': 'Error Correlation'}
        )

        plt.title('Error Diversity Matrix ($\\tilde{E}^T \\tilde{E}$)')
        plt.tight_layout()
        plt.show()

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Returns the final probabilities determined by the meta-learner."""
        if not self.is_fitted:
            raise RuntimeError("The ensemble must be fitted before predicting.")

        X_meta_features = self._get_meta_features(X)
        return self.meta_model.predict_proba(X_meta_features)

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Returns the final binary labels determined by the meta-learner."""
        if not self.is_fitted:
            raise RuntimeError("The ensemble must be fitted before predicting.")

        X_meta_features = self._get_meta_features(X)
        return self.meta_model.predict(X_meta_features)