import pandas as pd

from src.data_loading.loaders import (
    get_regular_season_games,
    get_teams,
)
from src.state.team_state import TeamState
from src.game_processing.process_game import process_game
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

    Team ordering:
        team_1 = lower TeamID
        team_2 = higher TeamID

    team_1_location:
         1 = team_1 is home
        -1 = team_1 is away
         0 = neutral

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
        winner_location = str(game["WLoc"])

        if winner_location not in {"H", "A", "N"}:
            raise ValueError(
                "WLoc must be 'H', 'A', or 'N'. "
                f"Received: {winner_location!r}"
            )

        # Stable ordering for every game.
        team_1_id = min(winner_id, loser_id)
        team_2_id = max(winner_id, loser_id)

        # 1 if the lower-ID team won, otherwise 0.
        label = int(team_1_id == winner_id)

        # Location from team_1's perspective.
        if winner_location == "N":
            team_1_location = 0

        elif team_1_id == winner_id:
            # team_1 is the winner, so WLoc is already
            # from team_1's perspective.
            team_1_location = (
                1
                if winner_location == "H"
                else -1
            )

        else:
            # team_1 is the loser, so invert WLoc.
            team_1_location = (
                -1
                if winner_location == "H"
                else 1
            )

        team_1_state = team_states[team_1_id]
        team_2_state = team_states[team_2_id]

        # A usable pregame row requires both teams to have
        # completed at least one previous game.
        if (
            team_1_state.games_played > 0
            and team_2_state.games_played > 0
        ):
            feature_row = build_game_feature_row(
                team_1_state=team_1_state,
                team_2_state=team_2_state,
                team_name_lookup=team_name_lookup,
                season=int(game["Season"]),
                day_num=int(game["DayNum"]),
                team_1_location=team_1_location,
            )

            feature_rows.append(feature_row)
            labels.append(label)

        # Always update the states, even when the row was excluded.
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