import pandas as pd


def build_team_ratings(
    games: pd.DataFrame,
) -> dict[int, float]:
    """
    Build team ratings from one regular season.

    Each win adds one rating point.
    Each loss subtracts one rating point.

    Parameters
    ----------
    games
        Regular-season games from exactly one season.

    Returns
    -------
    dict[int, float]
        Mapping from TeamID to win-loss rating.
    """
    required_columns = {"WTeamID", "LTeamID"}
    missing_columns = required_columns - set(games.columns)

    if missing_columns:
        raise ValueError(
            "Missing required columns: "
            f"{sorted(missing_columns)}"
        )

    winner_ids = set(games["WTeamID"].astype(int))
    loser_ids = set(games["LTeamID"].astype(int))
    team_ids = winner_ids | loser_ids

    ratings = {
        team_id: 0.0
        for team_id in team_ids
    }

    for game in games.itertuples(index=False):
        winner_id = int(game.WTeamID)
        loser_id = int(game.LTeamID)

        ratings[winner_id] += 1.0
        ratings[loser_id] -= 1.0

    return ratings