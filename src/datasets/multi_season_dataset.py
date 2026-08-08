import pandas as pd

from src.data_loading.loaders import (
    get_regular_season_games,
    get_regular_seasons,
    get_teams,
)
from src.datasets.single_season_dataset import build_Xy_dataset
from src.features.team_features import build_team_features


def build_multi_season_dataset(
    seasons: list[int] | None = None,
) -> tuple[pd.DataFrame, pd.Series]:
    """
    Build and combine X and y across multiple seasons.

    Each season is replayed independently, so all TeamState
    objects restart from zero at the beginning of each season.
    """
    if seasons is None:
        seasons = get_regular_seasons()

    X_parts = []
    y_parts = []
    final_state_rows = []

    total_rows_built = 0
    total_raw_games = 0
    total_games_skipped = 0

    teams = get_teams()

    team_name_lookup = dict(
        zip(
            teams["TeamID"],
            teams["TeamName"],
        )
    )

    for season in seasons:
        print(f"Starting season {season}...")

        raw_season_games = get_regular_season_games(season)
        expected_games = len(raw_season_games)

        X_season, y_season, final_team_states = build_Xy_dataset(
            season=season,
            team_name_lookup=team_name_lookup,
        )

        rows_built = len(X_season)
        games_skipped = expected_games - rows_built

        print(
            f"Finished season {season}: "
            f"{rows_built} rows built, "
            f"{games_skipped} skipped, "
            f"{expected_games} raw games"
        )

        assert len(y_season) == rows_built
        assert rows_built + games_skipped == expected_games

        X_parts.append(X_season)
        y_parts.append(y_season)

        total_rows_built += rows_built
        total_raw_games += expected_games
        total_games_skipped += games_skipped

        for team_id, team_state in final_team_states.items():
            final_state_rows.append(
                {
                    "TeamID": team_id,
                    "TeamName": team_name_lookup[team_id],
                    "Season": season,
                    **build_team_features(
                        team_state=team_state,
                        prefix="team",
                    ),
                }
            )

    X = pd.concat(
        X_parts,
        ignore_index=True,
    )

    y = pd.concat(
        y_parts,
        ignore_index=True,
    )

    assert len(X) == total_rows_built
    assert len(y) == total_rows_built
    assert total_rows_built + total_games_skipped == total_raw_games

    print()
    print("All seasons complete.")
    print(f"Seasons processed: {len(seasons)}")
    print(f"Total rows built: {total_rows_built}")
    print(f"Total games skipped: {total_games_skipped}")
    print(f"Total raw games: {total_raw_games}")
    print("All row-count checks passed.")

    final_team_states_df = pd.DataFrame(final_state_rows)

    return X, y, final_team_states_df