import pandas as pd

from src.data_loading.loaders import (
    get_regular_season_games,
    get_teams,
)
from src.state.team_state import TeamState
from src.game_processing.game_processor import process_game
from src.features.game_features import build_game_feature_row


def get_team_ids(season_games: pd.DataFrame) -> set[int]:
    """
    Get all teams that participated in the season.
    """
    winner_ids = set(season_games["WTeamID"])
    loser_ids = set(season_games["LTeamID"])

    return winner_ids | loser_ids


def initialize_team_states(
    team_ids: set[int],
) -> dict[int, TeamState]:
    """
    Create an empty TeamState for every team.
    """
    team_states = {}

    for team_id in team_ids:
        team_id = int(team_id)

        team_states[team_id] = TeamState(
            team_id=team_id,
        )

    return team_states


def build_Xy_dataset(
    season: int,
) -> tuple[pd.DataFrame, pd.Series]:
    """
    Replay one regular season and construct X and y.

    For non-neutral games:
        team_1 = home team
        team_2 = away team

    For neutral games:
        team_1 = lower TeamID
        team_2 = higher TeamID

    y:
        1 if team_1 won
        0 if team_2 won
    """
    season_games = get_regular_season_games(season)

    team_ids = get_team_ids(season_games)
    team_states = initialize_team_states(team_ids)

    teams = get_teams()

    team_name_lookup = dict(
        zip(
            teams["TeamID"],
            teams["TeamName"],
        )
    )

    feature_rows = []
    labels = []

    for _, game in season_games.iterrows():
        winner_id = int(game["WTeamID"])
        loser_id = int(game["LTeamID"])
        winner_location = game["WLoc"]

        if winner_location == "H":
            team_1_id = winner_id
            team_2_id = loser_id
            label = 1
            is_neutral = 0

        elif winner_location == "A":
            team_1_id = loser_id
            team_2_id = winner_id
            label = 0
            is_neutral = 0

        else:
            team_1_id = min(winner_id, loser_id)
            team_2_id = max(winner_id, loser_id)
            label = int(team_1_id == winner_id)
            is_neutral = 1

        team_1_state = team_states[team_1_id]
        team_2_state = team_states[team_2_id]

        feature_row = build_game_feature_row(
            team_1_state=team_1_state,
            team_2_state=team_2_state,
            team_name_lookup=team_name_lookup,
            season=int(game["Season"]),
            day_num=int(game["DayNum"]),
            is_neutral=is_neutral,
        )

        feature_rows.append(feature_row)
        labels.append(label)

        process_game(
            game=game,
            team_states=team_states,
        )

    X = pd.DataFrame(feature_rows)

    y = pd.Series(
        labels,
        name="team_1_won",
    )

    return X, y