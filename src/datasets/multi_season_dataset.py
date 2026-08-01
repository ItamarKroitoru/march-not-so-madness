import pandas as pd

from src.data_loading.loaders import (
    get_regular_season_games,
    get_regular_seasons,
)
from src.datasets.single_season_dataset import build_Xy_dataset


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

    total_rows_built = 0
    total_raw_games = 0

    for season in seasons:
        print(f"Starting season {season}...")

        raw_season_games = get_regular_season_games(season)
        expected_games = len(raw_season_games)

        X_season, y_season = build_Xy_dataset(season)

        rows_built = len(X_season)

        print(
            f"Finished season {season}: "
            f"{rows_built} rows built, "
            f"{expected_games} raw games"
        )

        assert rows_built == expected_games
        assert len(y_season) == expected_games

        X_parts.append(X_season)
        y_parts.append(y_season)

        total_rows_built += rows_built
        total_raw_games += expected_games

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
    assert total_rows_built == total_raw_games

    print()
    print("All seasons complete.")
    print(f"Seasons processed: {len(seasons)}")
    print(f"Total rows built: {total_rows_built}")
    print(f"Total raw games: {total_raw_games}")
    print("All row-count checks passed.")

    return X, y