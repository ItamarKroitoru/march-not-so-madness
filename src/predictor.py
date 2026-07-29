from abc import ABC, abstractmethod
from dataclasses import dataclass
import math
from src.teams import Team

@dataclass
class MatchPrediction:
    """Encapsulates the predicted outcome of a match between two teams."""
    team1: Team
    team2: Team
    winner: Team
    loser: Team
    win_probability_team1: float
    win_probability_team2: float
    rating_diff: float
    summary: str

class BaseMatchPredictor(ABC):
    """Abstract base class for match predictor implementations."""
    
    @abstractmethod
    def predict(self, team1: Team, team2: Team) -> MatchPrediction:
        """Predict the outcome between team1 and team2."""
        pass

class RatingMatchPredictor(BaseMatchPredictor):
    """
    Baseline Predictor: Predicts game outcomes based on team ratings.
    Uses a logistic function on rating differences to estimate win probabilities.
    """
    def __init__(self, scaling_factor: float = 15.0):
        """
        :param scaling_factor: Controls how steeply rating differences affect win probability.
        """
        self.scaling_factor = scaling_factor

    def predict(self, team1: Team, team2: Team) -> MatchPrediction:
        rating_diff = team1.rating - team2.rating
        
        # Logistic win probability formula
        # P(team1 wins) = 1 / (1 + 10^(-rating_diff / scaling_factor))
        prob_team1 = 1.0 / (1.0 + math.pow(10, -rating_diff / self.scaling_factor))
        prob_team2 = 1.0 - prob_team1
        
        if team1.rating >= team2.rating:
            winner = team1
            loser = team2
        else:
            winner = team2
            loser = team1
            
        summary = (
            f"Predicted Winner: {winner.name} (Rating: {winner.rating:.2f}) "
            f"over {loser.name} (Rating: {loser.rating:.2f}) "
            f"with {max(prob_team1, prob_team2)*100:.1f}% estimated probability."
        )
        
        return MatchPrediction(
            team1=team1,
            team2=team2,
            winner=winner,
            loser=loser,
            win_probability_team1=prob_team1,
            win_probability_team2=prob_team2,
            rating_diff=abs(rating_diff),
            summary=summary
        )
