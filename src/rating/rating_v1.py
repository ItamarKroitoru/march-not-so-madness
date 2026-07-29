import pandas as pd


def build_team_ratings(games: pd.DataFrame) -> dict[int, int]:
    """
    Build V1 team ratings from one season of regular-season games.

    Each win adds 1 point.
    Each loss subtracts 1 point.
    """
    team_ids = set(games["WTeamID"]) | set(games["LTeamID"])
    ratings = {team_id: 0 for team_id in team_ids}

    for _, game in games.iterrows():
        winner = game["WTeamID"]
        loser = game["LTeamID"]

        ratings[winner] += 1
        ratings[loser] -= 1

    return ratings