from pathlib import Path
import pandas as pd


DATA_DIR = Path(__file__).resolve().parents[2] / "data"


def get_teams() -> pd.DataFrame:
    """
    Load the master NCAA teams table.

    Returns
    -------
    pd.DataFrame
        DataFrame containing at least TeamID and TeamName.
    """
    file_path = DATA_DIR / "MTeams.csv"

    teams = pd.read_csv(file_path)

    return teams[["TeamID", "TeamName"]].copy()


def get_regular_season_games() -> pd.DataFrame:
    """
    Load the raw NCAA men's regular season games.
    """
    return pd.read_csv(DATA_DIR / "MRegularSeasonCompactResults.csv")    


def get_tournament_games() -> pd.DataFrame:
    """
    Load the raw NCAA men's tournament games.
    """
    return pd.read_csv(DATA_DIR / "MNCAATourneyCompactResults.csv")