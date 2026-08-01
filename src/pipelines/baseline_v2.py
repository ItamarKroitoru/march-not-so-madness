import pandas as pd

from src.data_prep.loaders import (
    get_regular_season_games,
    get_tournament_games,
)
from src.evaluation.game_level import evaluate_season
from src.prediction.higher_rating import predict_winner
from src.rating.context_rating import build_team_ratings


def run_season(
    season: int,
    regular_season_games: pd.DataFrame | None = None,
    tournament_games: pd.DataFrame | None = None,
) -> dict[str, int | float]:
    """
    Run the complete context-rating pipeline for one season.

    The pipeline consists of:

    1. Two-pass context-based team ratings.
    2. Higher-rating-wins predictions.
    3. Game-level tournament evaluation.

    The rating algorithm currently uses:

    - Margin of victory with diminishing returns.
    - Game location.
    - Opponent quality based on preliminary ratings.

    Parameters
    ----------
    season
        Season to evaluate.
    regular_season_games
        Optional preloaded regular-season data.
    tournament_games
        Optional preloaded tournament data.

    Returns
    -------
    dict[str, int | float]
        Evaluation results for the requested season.
    """
    if regular_season_games is None:
        regular_season_games = get_regular_season_games()

    if tournament_games is None:
        tournament_games = get_tournament_games()

    season_regular_games = (
        regular_season_games[
            regular_season_games["Season"] == season
        ]
        .sort_values("DayNum")
        .reset_index(drop=True)
    )

    season_tournament_games = (
        tournament_games[
            tournament_games["Season"] == season
        ]
        .sort_values("DayNum")
        .reset_index(drop=True)
    )

    if season_regular_games.empty:
        raise ValueError(
            f"No regular-season games found for {season}."
        )

    if season_tournament_games.empty:
        raise ValueError(
            f"No tournament games found for {season}."
        )

    ratings = build_team_ratings(
        season_regular_games
    )

    return evaluate_season(
        season=season,
        tournament_games=season_tournament_games,
        ratings=ratings,
        predictor=predict_winner,
    )


def run_all_seasons() -> pd.DataFrame:
    """
    Run the context-rating pipeline for every evaluable season.

    A season is evaluable when both regular-season and tournament
    game data are available.

    Returns
    -------
    pd.DataFrame
        One evaluation row per season.
    """
    regular_season_games = get_regular_season_games()
    tournament_games = get_tournament_games()

    regular_seasons = set(
        regular_season_games["Season"].unique()
    )
    tournament_seasons = set(
        tournament_games["Season"].unique()
    )

    evaluable_seasons = sorted(
        regular_seasons & tournament_seasons
    )

    results = [
        run_season(
            season=season,
            regular_season_games=regular_season_games,
            tournament_games=tournament_games,
        )
        for season in evaluable_seasons
    ]

    return pd.DataFrame(results)


def summarize_results(
    season_results: pd.DataFrame,
) -> pd.Series:
    """
    Calculate overall context-rating results across all seasons.

    Parameters
    ----------
    season_results
        Output from run_all_seasons().

    Returns
    -------
    pd.Series
        Overall game counts and effective accuracy.
    """
    if season_results.empty:
        raise ValueError(
            "Cannot summarize an empty results table."
        )

    total_games = int(
        season_results["Games"].sum()
    )
    total_correct = int(
        season_results["Correct"].sum()
    )
    total_incorrect = int(
        season_results["Incorrect"].sum()
    )
    total_ties = int(
        season_results["Ties"].sum()
    )

    overall_accuracy = (
        total_correct + 0.5 * total_ties
    ) / total_games

    return pd.Series(
        {
            "Games": total_games,
            "Correct": total_correct,
            "Incorrect": total_incorrect,
            "Ties": total_ties,
            "Accuracy": overall_accuracy,
        },
        name="Overall",
    )