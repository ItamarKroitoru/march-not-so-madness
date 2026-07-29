from dataclasses import dataclass
from typing import Dict, Optional, List
import pandas as pd

@dataclass
class Team:
    """Represents a NCAA team with ID, name, and rating."""
    team_id: int
    name: str
    rating: float

class TeamRepository:
    """Repository class for managing and looking up team data."""
    def __init__(self, teams: Dict[int, Team]):
        self._teams = teams

    @classmethod
    def load_from_csv(cls, csv_path: str = "data/MTeams2026_baseline.csv") -> "TeamRepository":
        """Loads team data from a CSV file."""
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
        """Returns team by TeamID or None if not found."""
        return self._teams.get(team_id)

    def search_teams(self, query: str) -> List[Team]:
        """Searches teams by name substring (case-insensitive)."""
        query_lower = query.lower()
        return [team for team in self._teams.values() if query_lower in team.name.lower()]

    def list_all(self) -> List[Team]:
        """Returns list of all active teams."""
        return list(self._teams.values())

    def __len__(self) -> int:
        return len(self._teams)
