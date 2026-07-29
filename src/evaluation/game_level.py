from collections.abc import Callable, Mapping

import pandas as pd


Predictor = Callable[
    [int, int, Mapping[int, float]],
    int | None,
]


def evaluate_season(
    season: int,
    tournament_games: pd.DataFrame,
    ratings: Mapping[int, float],
    predictor: Predictor,
) -> dict[str, int | float]:
    """
    Evaluate a predictor on the actual tournament games from one season.

    The actual historical matchups are used. This function does not
    simulate a complete bracket.

    A correct prediction receives one point.
    An incorrect prediction receives zero points.
    A tied rating receives half a point.

    Parameters
    ----------
    season
        Tournament season being evaluated.
    tournament_games
        Actual tournament games from exactly one season.
    ratings
        Team ratings produced from that season's regular-season games.
    predictor
        Function that predicts a winner from two team IDs and ratings.

    Returns
    -------
    dict[str, int | float]
        Season-level evaluation results.
    """
    required_columns = {"WTeamID", "LTeamID"}
    missing_columns = required_columns - set(
        tournament_games.columns
    )

    if missing_columns:
        raise ValueError(
            "Missing required columns: "
            f"{sorted(missing_columns)}"
        )

    correct = 0
    incorrect = 0
    ties = 0

    for game in tournament_games.itertuples(index=False):
        actual_winner_id = int(game.WTeamID)
        actual_loser_id = int(game.LTeamID)

        team_a_id = min(
            actual_winner_id,
            actual_loser_id,
        )
        team_b_id = max(
            actual_winner_id,
            actual_loser_id,
        )

        predicted_winner_id = predictor(
            team_a_id,
            team_b_id,
            ratings,
        )

        if predicted_winner_id is None:
            ties += 1
        elif predicted_winner_id == actual_winner_id:
            correct += 1
        else:
            incorrect += 1

    number_of_games = len(tournament_games)

    if number_of_games == 0:
        accuracy = float("nan")
    else:
        accuracy = (
            correct + 0.5 * ties
        ) / number_of_games

    return {
        "Season": season,
        "Games": number_of_games,
        "Correct": correct,
        "Incorrect": incorrect,
        "Ties": ties,
        "Accuracy": accuracy,
    }