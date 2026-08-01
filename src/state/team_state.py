from collections import deque
from dataclasses import dataclass

LAST_K_RECENT_GAMES = 5


@dataclass(frozen=True)
class GameStats:
    """
    Store one completed game's statistics from one team's perspective.

    These records are kept inside TeamState.recent_games
    for calculating recent-form features.
    """

    won: bool
    location: str

    points_scored: int
    points_allowed: int

    fgm: int
    fga: int
    fgm3: int
    fga3: int
    ftm: int
    fta: int

    offensive_rebounds: int
    defensive_rebounds: int
    assists: int
    turnovers: int
    steals: int
    blocks: int
    personal_fouls: int


class TeamState:
    """
    Store the accumulated regular-season history of one team.

    The state contains:

    1. Full-season cumulative totals.
    2. Location-specific results.
    3. The five most recently completed games.

    All values represent completed games only. Derived statistics such as
    percentages and per-game averages are calculated later.
    """

    def __init__(
        self,
        team_id: int,
        games_played: int = 0,
        wins: int = 0,
        losses: int = 0,
        total_points_scored: int = 0,
        total_points_allowed: int = 0,
        total_fgm: int = 0,
        total_fga: int = 0,
        total_fgm3: int = 0,
        total_fga3: int = 0,
        total_ftm: int = 0,
        total_fta: int = 0,
        total_offensive_rebounds: int = 0,
        total_defensive_rebounds: int = 0,
        total_assists: int = 0,
        total_turnovers: int = 0,
        total_steals: int = 0,
        total_blocks: int = 0,
        total_personal_fouls: int = 0,
        home_games: int = 0,
        home_wins: int = 0,
        away_games: int = 0,
        away_wins: int = 0,
        neutral_games: int = 0,
        neutral_wins: int = 0,
    ):
        self.team_id = team_id

        # Overall results
        self.games_played = games_played
        self.wins = wins
        self.losses = losses

        # Scoring
        self.total_points_scored = total_points_scored
        self.total_points_allowed = total_points_allowed

        # Shooting
        self.total_fgm = total_fgm
        self.total_fga = total_fga
        self.total_fgm3 = total_fgm3
        self.total_fga3 = total_fga3
        self.total_ftm = total_ftm
        self.total_fta = total_fta

        # Other box-score statistics
        self.total_offensive_rebounds = total_offensive_rebounds
        self.total_defensive_rebounds = total_defensive_rebounds
        self.total_assists = total_assists
        self.total_turnovers = total_turnovers
        self.total_steals = total_steals
        self.total_blocks = total_blocks
        self.total_personal_fouls = total_personal_fouls

        # Results by location
        self.home_games = home_games
        self.home_wins = home_wins

        self.away_games = away_games
        self.away_wins = away_wins

        self.neutral_games = neutral_games
        self.neutral_wins = neutral_wins

        # Most recent completed games.
        # When a sixth game is appended, the oldest is removed automatically.
        self.recent_games: deque[GameStats] = deque(maxlen=LAST_K_RECENT_GAMES)

    def update_after_game(
        self,
        points_scored: int,
        points_allowed: int,
        won: bool,
        location: str,
        fgm: int,
        fga: int,
        fgm3: int,
        fga3: int,
        ftm: int,
        fta: int,
        offensive_rebounds: int,
        defensive_rebounds: int,
        assists: int,
        turnovers: int,
        steals: int,
        blocks: int,
        personal_fouls: int,
    ) -> None:
        """
        Update this team's state after one completed game.

        Parameters
        ----------
        location
            Location from this team's perspective:

            H = home
            A = away
            N = neutral
        """
        if location not in {"H", "A", "N"}:
            raise ValueError(
                "location must be 'H', 'A', or 'N'. "
                f"Received: {location!r}"
            )

        # Overall results
        self.games_played += 1

        if won:
            self.wins += 1
        else:
            self.losses += 1

        # Scoring
        self.total_points_scored += points_scored
        self.total_points_allowed += points_allowed

        # Shooting
        self.total_fgm += fgm
        self.total_fga += fga
        self.total_fgm3 += fgm3
        self.total_fga3 += fga3
        self.total_ftm += ftm
        self.total_fta += fta

        # Other box-score statistics
        self.total_offensive_rebounds += offensive_rebounds
        self.total_defensive_rebounds += defensive_rebounds
        self.total_assists += assists
        self.total_turnovers += turnovers
        self.total_steals += steals
        self.total_blocks += blocks
        self.total_personal_fouls += personal_fouls

        # Location-specific results
        if location == "H":
            self.home_games += 1

            if won:
                self.home_wins += 1

        elif location == "A":
            self.away_games += 1

            if won:
                self.away_wins += 1

        else:  # location == "N"
            self.neutral_games += 1

            if won:
                self.neutral_wins += 1

        # Save this individual game for recent-form calculations.
        self.recent_games.append(
            GameStats(
                won=won,
                location=location,
                points_scored=points_scored,
                points_allowed=points_allowed,
                fgm=fgm,
                fga=fga,
                fgm3=fgm3,
                fga3=fga3,
                ftm=ftm,
                fta=fta,
                offensive_rebounds=offensive_rebounds,
                defensive_rebounds=defensive_rebounds,
                assists=assists,
                turnovers=turnovers,
                steals=steals,
                blocks=blocks,
                personal_fouls=personal_fouls,
            )
        )