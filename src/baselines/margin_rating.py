import pandas as pd


# Pass 1
HOME_LOCATION_FACTOR = 0.8
NEUTRAL_LOCATION_FACTOR = 1.0
AWAY_LOCATION_FACTOR = 1.2

# Pass 2
OPPONENT_THRESHOLD = 10.0

FAVORITE_FACTOR = 0.75
EQUAL_FACTOR = 1.0
UNDERDOG_FACTOR = 1.5


def build_team_ratings(
    season_games: pd.DataFrame,
) -> dict[int, float]:

    team_ids = set(season_games["WTeamID"]) | set(season_games["LTeamID"])

    # Pass 1
    preliminary_ratings = {}

    for team_id in team_ids:
        preliminary_ratings[team_id] = 0.0

    for _, game in season_games.iterrows():

        winner_id = game["WTeamID"]
        loser_id = game["LTeamID"]

        margin = game["WScore"] - game["LScore"]
        margin_factor = margin ** 0.5

        if game["WLoc"] == "H":
            location_factor = HOME_LOCATION_FACTOR
        elif game["WLoc"] == "A":
            location_factor = AWAY_LOCATION_FACTOR
        else:
            location_factor = NEUTRAL_LOCATION_FACTOR

        game_value = margin_factor * location_factor

        preliminary_ratings[winner_id] += game_value
        preliminary_ratings[loser_id] -= game_value

    # Pass 2
    final_ratings = {}

    for team_id in team_ids:
        final_ratings[team_id] = 0.0

    for _, game in season_games.iterrows():

        winner_id = game["WTeamID"]
        loser_id = game["LTeamID"]

        margin = game["WScore"] - game["LScore"]
        margin_factor = margin ** 0.5

        if game["WLoc"] == "H":
            location_factor = HOME_LOCATION_FACTOR
        elif game["WLoc"] == "A":
            location_factor = AWAY_LOCATION_FACTOR
        else:
            location_factor = NEUTRAL_LOCATION_FACTOR

        rating_gap = (
            preliminary_ratings[winner_id]
            - preliminary_ratings[loser_id]
        )

        if rating_gap > OPPONENT_THRESHOLD:
            opponent_factor = FAVORITE_FACTOR
        elif rating_gap < -OPPONENT_THRESHOLD:
            opponent_factor = UNDERDOG_FACTOR
        else:
            opponent_factor = EQUAL_FACTOR

        game_value = (
            margin_factor
            * location_factor
            * opponent_factor
        )

        final_ratings[winner_id] += game_value
        final_ratings[loser_id] -= game_value

    return final_ratings