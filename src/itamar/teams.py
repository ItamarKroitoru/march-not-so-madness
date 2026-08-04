"""
===============================================================================
DATA MODEL MODULE: TEAMS & REPOSITORY
===============================================================================
This module defines the domain model (`Team`) and data access layer (`TeamRepository`)
used across both the CLI interface and Python test suites.

Architecture Design Pattern:
----------------------------
- Repository Pattern: `TeamRepository` decouples raw data persistence (CSV/JSON)
  from business logic (predictors, CLI). This ensures that swapping datasets or 
  storage formats does not break prediction logic.
===============================================================================
"""

from dataclasses import dataclass
from typing import Dict, Optional, List
import pandas as pd


@dataclass
class Team:
    """
    Represents an NCAA Men's Basketball Team.

    Attributes:
    -----------
    team_id : int
        Kaggle 4-digit unique identifier for the team (e.g., 1101 for Abilene Chr).
    name : str
        Human-readable team name (e.g., "Duke", "Gonzaga").
    rating : float
        Current rating score calculated by Step 1 algorithm (range 50.0 to 100.0).
    """
    team_id: int
    name: str
    rating: float


class TeamRepository:
    """
    In-memory Repository for looking up, querying, and managing team entities.
    """
    def __init__(self, teams: Dict[int, Team]):
        """
        Parameters:
        -----------
        teams : Dict[int, Team]
            Dictionary mapping TeamID -> Team instance.
        """
        self._teams = teams

    @classmethod
    def load_from_csv(cls, csv_path: str = "data/MTeams2026_baseline.csv") -> "TeamRepository":
        """
        Factory method to construct a TeamRepository from a CSV dataset.

        Parameters:
        -----------
        csv_path : str
            Path to team ratings CSV file.

        Returns:
        --------
        TeamRepository
            Initialized repository populated with Team instances.
        """
        df = pd.read_csv(csv_path)
        teams = {}
        for _, row in df.iterrows():
            team_id = int(row['TeamID'])
            teams[team_id] = Team(
                team_id=team_id,
                name=str(row['TeamName']),
                rating=float(row['Rating'])
            )
        return cls(teams)

    def get_team(self, team_id: int) -> Optional[Team]:
        """
        Retrieves a team by its Kaggle TeamID.

        Parameters:
        -----------
        team_id : int
            4-digit team ID.

        Returns:
        --------
        Optional[Team]
            Matching Team object, or None if team_id is not in the active dataset.
        """
        return self._teams.get(team_id)

    def search_teams(self, query: str) -> List[Team]:
        """
        Performs a case-insensitive substring search on team names.

        Parameters:
        -----------
        query : str
            Search text (e.g., "Duke", "Mich").

        Returns:
        --------
        List[Team]
            List of matching Team objects.
        """
        query_lower = query.lower()
        return [team for team in self._teams.values() if query_lower in team.name.lower()]

    def list_all(self) -> List[Team]:
        """Returns a list of all active teams loaded in memory."""
        return list(self._teams.values())

    def __len__(self) -> int:
        """Returns total count of active teams."""
        return len(self._teams)
