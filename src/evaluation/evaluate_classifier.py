from typing import Any

import numpy as np
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    log_loss,
    roc_auc_score,
)


def evaluate_classifier(
    model: Any,
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
) -> dict:
    """
    Evaluate a trained binary classification model.

    The positive class is y = 1, meaning team_1 won.

    Parameters
    ----------
    model
        A trained classifier implementing:
            predict(X)
            predict_proba(X)

    X_train
        Model-ready training features.

    X_test
        Model-ready test features.

    y_train
        Training labels.

    y_test
        Test labels.

    Returns
    -------
    dict
        Metrics, predictions, probabilities, and confusion matrices
        for both the training and test sets.
    """
    train_predictions = model.predict(X_train)
    test_predictions = model.predict(X_test)

    train_probabilities = model.predict_proba(X_train)[:, 1]
    test_probabilities = model.predict_proba(X_test)[:, 1]

    train_confusion_matrix = confusion_matrix(
        y_train,
        train_predictions,
        labels=[0, 1],
    )

    test_confusion_matrix = confusion_matrix(
        y_test,
        test_predictions,
        labels=[0, 1],
    )

    results = {
        "train_games": len(X_train),
        "test_games": len(X_test),

        "train_accuracy": accuracy_score(
            y_train,
            train_predictions,
        ),
        "test_accuracy": accuracy_score(
            y_test,
            test_predictions,
        ),

        "train_log_loss": log_loss(
            y_train,
            train_probabilities,
            labels=[0, 1],
        ),
        "test_log_loss": log_loss(
            y_test,
            test_probabilities,
            labels=[0, 1],
        ),

        "train_roc_auc": roc_auc_score(
            y_train,
            train_probabilities,
        ),
        "test_roc_auc": roc_auc_score(
            y_test,
            test_probabilities,
        ),

        "train_confusion_matrix": train_confusion_matrix,
        "test_confusion_matrix": test_confusion_matrix,

        "train_predictions": train_predictions,
        "test_predictions": test_predictions,

        "train_probabilities": train_probabilities,
        "test_probabilities": test_probabilities,
    }

    return results


def print_classifier_results(
    results: dict,
) -> None:
    """
    Print the main classifier evaluation metrics.
    """
    print("=" * 60)
    print("Classifier Evaluation")
    print("=" * 60)

    print(f"Train games     : {results['train_games']:,}")
    print(f"Test games      : {results['test_games']:,}")

    print()

    print(
        f"Train accuracy  : "
        f"{results['train_accuracy']:.2%}"
    )
    print(
        f"Test accuracy   : "
        f"{results['test_accuracy']:.2%}"
    )

    print()

    print(
        f"Train log loss  : "
        f"{results['train_log_loss']:.4f}"
    )
    print(
        f"Test log loss   : "
        f"{results['test_log_loss']:.4f}"
    )

    print()

    print(
        f"Train ROC-AUC   : "
        f"{results['train_roc_auc']:.4f}"
    )
    print(
        f"Test ROC-AUC    : "
        f"{results['test_roc_auc']:.4f}"
    )

    print()

    print("Train confusion matrix:")
    print(results["train_confusion_matrix"])

    print()

    print("Test confusion matrix:")
    print(results["test_confusion_matrix"])

    print("=" * 60)