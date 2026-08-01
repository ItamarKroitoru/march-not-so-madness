from src.state.team_state import TeamState


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
        # Experience
        f"{prefix}_games_played": games_played,

        # Record
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

        # Shooting percentages
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

        # Per-game box score
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


def build_recent_features(
    team_state: TeamState,
    prefix: str,
) -> dict:
    """
    Build recent-form features from the team's last five completed games.

    Before a team has played five games, all available previous games are used.
    """
    recent_games = list(team_state.recent_games)
    recent_games_played = len(recent_games)

    recent_wins = sum(
        int(game.won)
        for game in recent_games
    )

    total_points_scored = sum(
        game.points_scored
        for game in recent_games
    )
    total_points_allowed = sum(
        game.points_allowed
        for game in recent_games
    )

    total_fgm = sum(
        game.fgm
        for game in recent_games
    )
    total_fga = sum(
        game.fga
        for game in recent_games
    )

    total_fgm3 = sum(
        game.fgm3
        for game in recent_games
    )
    total_fga3 = sum(
        game.fga3
        for game in recent_games
    )

    total_ftm = sum(
        game.ftm
        for game in recent_games
    )
    total_fta = sum(
        game.fta
        for game in recent_games
    )

    total_offensive_rebounds = sum(
        game.offensive_rebounds
        for game in recent_games
    )
    total_defensive_rebounds = sum(
        game.defensive_rebounds
        for game in recent_games
    )

    total_assists = sum(
        game.assists
        for game in recent_games
    )
    total_turnovers = sum(
        game.turnovers
        for game in recent_games
    )
    total_steals = sum(
        game.steals
        for game in recent_games
    )
    total_blocks = sum(
        game.blocks
        for game in recent_games
    )
    total_personal_fouls = sum(
        game.personal_fouls
        for game in recent_games
    )

    return {
        f"{prefix}_last_5_games_played": recent_games_played,

        f"{prefix}_last_5_win_pct": safe_divide(
            recent_wins,
            recent_games_played,
        ),

        f"{prefix}_last_5_ppg": safe_divide(
            total_points_scored,
            recent_games_played,
        ),
        f"{prefix}_last_5_papg": safe_divide(
            total_points_allowed,
            recent_games_played,
        ),

        f"{prefix}_last_5_fg_pct": safe_divide(
            total_fgm,
            total_fga,
        ),
        f"{prefix}_last_5_fg3_pct": safe_divide(
            total_fgm3,
            total_fga3,
        ),
        f"{prefix}_last_5_ft_pct": safe_divide(
            total_ftm,
            total_fta,
        ),

        f"{prefix}_last_5_off_rebounds_pg": safe_divide(
            total_offensive_rebounds,
            recent_games_played,
        ),
        f"{prefix}_last_5_def_rebounds_pg": safe_divide(
            total_defensive_rebounds,
            recent_games_played,
        ),
        f"{prefix}_last_5_assists_pg": safe_divide(
            total_assists,
            recent_games_played,
        ),
        f"{prefix}_last_5_turnovers_pg": safe_divide(
            total_turnovers,
            recent_games_played,
        ),
        f"{prefix}_last_5_steals_pg": safe_divide(
            total_steals,
            recent_games_played,
        ),
        f"{prefix}_last_5_blocks_pg": safe_divide(
            total_blocks,
            recent_games_played,
        ),
        f"{prefix}_last_5_personal_fouls_pg": safe_divide(
            total_personal_fouls,
            recent_games_played,
        ),
    }


def build_team_features(
    team_state: TeamState,
    prefix: str,
) -> dict:
    """
    Build all current pregame features for one team.
    """
    return {
        **build_season_features(
            team_state=team_state,
            prefix=prefix,
        ),
        **build_recent_features(
            team_state=team_state,
            prefix=prefix,
        ),
    }