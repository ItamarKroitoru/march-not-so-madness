import matplotlib.pyplot as plt
import pandas as pd
from sklearn.pipeline import Pipeline


def get_logistic_regression_coefficients(
    model: Pipeline,
    feature_names: list[str],
) -> pd.DataFrame:
    """
    Extract logistic-regression coefficients from a trained pipeline.

    Positive coefficients increase the predicted probability
    that team_1 wins.

    Negative coefficients decrease the predicted probability
    that team_1 wins.
    """
    logistic_regression = model.named_steps[
        "logistic_regression"
    ]

    coefficients = logistic_regression.coef_[0]

    if len(coefficients) != len(feature_names):
        raise ValueError(
            "The number of coefficients does not match "
            "the number of feature names."
        )

    coefficient_table = pd.DataFrame(
        {
            "feature": feature_names,
            "coefficient": coefficients,
        }
    )

    coefficient_table["absolute_coefficient"] = (
        coefficient_table["coefficient"].abs()
    )

    coefficient_table = coefficient_table.sort_values(
        by="absolute_coefficient",
        ascending=False,
    ).reset_index(drop=True)

    return coefficient_table


def print_top_coefficients(
    coefficient_table: pd.DataFrame,
    top_n: int = 15,
) -> None:
    """
    Print the strongest positive and negative coefficients.
    """
    positive = (
        coefficient_table[
            coefficient_table["coefficient"] > 0
        ]
        .sort_values(
            by="coefficient",
            ascending=False,
        )
        .head(top_n)
    )

    negative = (
        coefficient_table[
            coefficient_table["coefficient"] < 0
        ]
        .sort_values(
            by="coefficient",
            ascending=True,
        )
        .head(top_n)
    )

    print("=" * 70)
    print(f"Top {top_n} positive coefficients")
    print("=" * 70)
    print(
        positive[
            ["feature", "coefficient"]
        ].to_string(index=False)
    )

    print()

    print("=" * 70)
    print(f"Top {top_n} negative coefficients")
    print("=" * 70)
    print(
        negative[
            ["feature", "coefficient"]
        ].to_string(index=False)
    )


def plot_top_coefficients(
    coefficient_table: pd.DataFrame,
    top_n: int = 20,
) -> None:
    """
    Plot the features with the largest absolute coefficients.
    """
    top_coefficients = (
        coefficient_table
        .head(top_n)
        .sort_values(
            by="coefficient",
            ascending=True,
        )
    )

    plt.figure(
        figsize=(10, max(6, top_n * 0.35))
    )

    plt.barh(
        top_coefficients["feature"],
        top_coefficients["coefficient"],
    )

    plt.axvline(
        0,
        linewidth=1,
    )

    plt.xlabel("Standardized logistic-regression coefficient")
    plt.ylabel("Feature")
    plt.title(
        f"Top {top_n} logistic-regression coefficients"
    )

    plt.tight_layout()
    plt.show()