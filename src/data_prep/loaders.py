from pathlib import Path

import pandas as pd


# loaders.py is assumed to be inside:
# project_root/src/data_prep/loaders.py
#
# Therefore parents[2] points to project_root.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"


def get_teams() -> pd.DataFrame:
    """
    Load the NCAA men's teams table.

    Returns
    -------
    pd.DataFrame
        Columns:
        - TeamID
        - TeamName
    """
    file_path = DATA_DIR / "MTeams.csv"

    teams = pd.read_csv(file_path)

    return teams[["TeamID", "TeamName"]].copy()

def get_regular_season_games(
    season: int,
) -> pd.DataFrame:
    """
    Load one season of regular-season games,
    sorted chronologically.
    """

    file_path = DATA_DIR / "MRegularSeasonCompactResults.csv"

    games = pd.read_csv(file_path)

    games = games[
        games["Season"] == season
    ].copy()

    games = games.sort_values(
        by="DayNum"
    ).reset_index(drop=True)

    return games

def get_regular_seasons() -> list[int]:
    """
    Return all seasons available in the regular-season results file.
    """
    file_path = DATA_DIR / "MRegularSeasonCompactResults.csv"

    seasons = pd.read_csv(
        file_path,
        usecols=["Season"],
    )["Season"]

    return sorted(seasons.unique().tolist())