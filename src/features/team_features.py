from collections.abc import Sequence

from src.state.team_state import GameStats, TeamState


def safe_divide(
    numerator: float,
    denominator: float,
) -> float:
    """
    Divide safely, returning 0.0 when the denominator is zero.
    """
    if denominator == 0:
        return 0.0

    return numerator / denominator


def build_season_features(
    team_state: TeamState,
    prefix: str,
) -> dict:
    """
    Build full-season pregame features for one team.
    """
    games_played = team_state.games_played

    return {
        # Experience and record
        f"{prefix}_games_played": games_played,
        f"{prefix}_wins": team_state.wins,
        f"{prefix}_losses": team_state.losses,
        f"{prefix}_win_pct": safe_divide(
            team_state.wins,
            games_played,
        ),

        # Scoring
        f"{prefix}_ppg": safe_divide(
            team_state.total_points_scored,
            games_played,
        ),
        f"{prefix}_papg": safe_divide(
            team_state.total_points_allowed,
            games_played,
        ),

        # Shooting
        f"{prefix}_fg_pct": safe_divide(
            team_state.total_fgm,
            team_state.total_fga,
        ),
        f"{prefix}_fg3_pct": safe_divide(
            team_state.total_fgm3,
            team_state.total_fga3,
        ),
        f"{prefix}_ft_pct": safe_divide(
            team_state.total_ftm,
            team_state.total_fta,
        ),

        # Per-game box-score statistics
        f"{prefix}_off_rebounds_pg": safe_divide(
            team_state.total_offensive_rebounds,
            games_played,
        ),
        f"{prefix}_def_rebounds_pg": safe_divide(
            team_state.total_defensive_rebounds,
            games_played,
        ),
        f"{prefix}_assists_pg": safe_divide(
            team_state.total_assists,
            games_played,
        ),
        f"{prefix}_turnovers_pg": safe_divide(
            team_state.total_turnovers,
            games_played,
        ),
        f"{prefix}_steals_pg": safe_divide(
            team_state.total_steals,
            games_played,
        ),
        f"{prefix}_blocks_pg": safe_divide(
            team_state.total_blocks,
            games_played,
        ),
        f"{prefix}_personal_fouls_pg": safe_divide(
            team_state.total_personal_fouls,
            games_played,
        ),

        # Location performance
        f"{prefix}_home_win_pct": safe_divide(
            team_state.home_wins,
            team_state.home_games,
        ),
        f"{prefix}_away_win_pct": safe_divide(
            team_state.away_wins,
            team_state.away_games,
        ),
        f"{prefix}_neutral_win_pct": safe_divide(
            team_state.neutral_wins,
            team_state.neutral_games,
        ),
    }


def build_recent_window_features(
    recent_games: Sequence[GameStats],
    prefix: str,
    window_size: int,
) -> dict:
    """
    Build recent-form features for one rolling game window.
    """
    games = list(recent_games)[-window_size:]
    games_played = len(games)

    wins = sum(
        int(game.won)
        for game in games
    )

    points_scored = sum(
        game.points_scored
        for game in games
    )
    points_allowed = sum(
        game.points_allowed
        for game in games
    )

    fgm = sum(game.fgm for game in games)
    fga = sum(game.fga for game in games)

    fgm3 = sum(game.fgm3 for game in games)
    fga3 = sum(game.fga3 for game in games)

    ftm = sum(game.ftm for game in games)
    fta = sum(game.fta for game in games)

    offensive_rebounds = sum(
        game.offensive_rebounds
        for game in games
    )
    defensive_rebounds = sum(
        game.defensive_rebounds
        for game in games
    )

    assists = sum(game.assists for game in games)
    turnovers = sum(game.turnovers for game in games)
    steals = sum(game.steals for game in games)
    blocks = sum(game.blocks for game in games)

    personal_fouls = sum(
        game.personal_fouls
        for game in games
    )

    feature_prefix = f"{prefix}_last_{window_size}"

    return {
        f"{feature_prefix}_games_played": games_played,

        f"{feature_prefix}_win_pct": safe_divide(
            wins,
            games_played,
        ),

        f"{feature_prefix}_ppg": safe_divide(
            points_scored,
            games_played,
        ),
        f"{feature_prefix}_papg": safe_divide(
            points_allowed,
            games_played,
        ),

        f"{feature_prefix}_fg_pct": safe_divide(
            fgm,
            fga,
        ),
        f"{feature_prefix}_fg3_pct": safe_divide(
            fgm3,
            fga3,
        ),
        f"{feature_prefix}_ft_pct": safe_divide(
            ftm,
            fta,
        ),

        f"{feature_prefix}_off_rebounds_pg": safe_divide(
            offensive_rebounds,
            games_played,
        ),
        f"{feature_prefix}_def_rebounds_pg": safe_divide(
            defensive_rebounds,
            games_played,
        ),
        f"{feature_prefix}_assists_pg": safe_divide(
            assists,
            games_played,
        ),
        f"{feature_prefix}_turnovers_pg": safe_divide(
            turnovers,
            games_played,
        ),
        f"{feature_prefix}_steals_pg": safe_divide(
            steals,
            games_played,
        ),
        f"{feature_prefix}_blocks_pg": safe_divide(
            blocks,
            games_played,
        ),
        f"{feature_prefix}_personal_fouls_pg": safe_divide(
            personal_fouls,
            games_played,
        ),
    }


def build_recent_5_features(
    team_state: TeamState,
    prefix: str,
) -> dict:
    """
    Build features from the five most recent completed games.
    """
    return build_recent_window_features(
        recent_games=team_state.recent_games,
        prefix=prefix,
        window_size=5,
    )


def build_recent_10_features(
    team_state: TeamState,
    prefix: str,
) -> dict:
    """
    Build features from the ten most recent completed games.
    """
    return build_recent_window_features(
        recent_games=team_state.recent_games,
        prefix=prefix,
        window_size=10,
    )


def build_streak_features(
    team_state: TeamState,
    prefix: str,
) -> dict:
    """
    Build current consecutive win/loss streak features.
    """
    return {
        f"{prefix}_current_win_streak":
            team_state.current_win_streak,

        f"{prefix}_current_loss_streak":
            team_state.current_loss_streak,
    }


def build_efficiency_features(
    team_state: TeamState,
    prefix: str,
) -> dict:
    """
    Build derived full-season efficiency and style features.
    """
    games_played = team_state.games_played

    total_rebounds = (
        team_state.total_offensive_rebounds
        + team_state.total_defensive_rebounds
    )

    point_differential = (
        team_state.total_points_scored
        - team_state.total_points_allowed
    )

    effective_fg_pct = safe_divide(
        team_state.total_fgm
        + 0.5 * team_state.total_fgm3,
        team_state.total_fga,
    )

    return {
        f"{prefix}_point_diff_pg": safe_divide(
            point_differential,
            games_played,
        ),

        f"{prefix}_effective_fg_pct": effective_fg_pct,

        f"{prefix}_assist_turnover_ratio": safe_divide(
            team_state.total_assists,
            team_state.total_turnovers,
        ),

        f"{prefix}_total_rebounds_pg": safe_divide(
            total_rebounds,
            games_played,
        ),

        f"{prefix}_fg3_attempt_rate": safe_divide(
            team_state.total_fga3,
            team_state.total_fga,
        ),

        f"{prefix}_ft_attempt_rate": safe_divide(
            team_state.total_fta,
            team_state.total_fga,
        ),

        f"{prefix}_turnover_to_assist_ratio": safe_divide(
            team_state.total_turnovers,
            team_state.total_assists,
        ),
    }


def build_team_features(
    team_state: TeamState,
    prefix: str,
) -> dict:
    """
    Build all current pregame feature families for one team.
    """
    return {
        **build_season_features(
            team_state=team_state,
            prefix=prefix,
        ),
        **build_recent_5_features(
            team_state=team_state,
            prefix=prefix,
        ),
        **build_recent_10_features(
            team_state=team_state,
            prefix=prefix,
        ),
        **build_streak_features(
            team_state=team_state,
            prefix=prefix,
        ),
        **build_efficiency_features(
            team_state=team_state,
            prefix=prefix,
        ),
    }