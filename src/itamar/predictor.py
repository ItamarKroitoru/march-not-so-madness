"""
===============================================================================
STEP 2: MATCH PREDICTOR MODULE
===============================================================================
This module defines the abstract prediction interface (BaseMatchPredictor) 
and concrete probabilistic match predictor implementations.

Statistical Background:
-----------------------
The win probability model uses a logistic function (equivalent to a 
Bradley-Terry paired-comparison model):

    P(Team 1 wins) = 1 / (1 + 10 ** (-(Rating_1 - Rating_2) / ScalingFactor))

Where:
- Rating_1, Rating_2 are the team performance rating scores calculated in Step 1.
- ScalingFactor (default 15.0) determines the slope of the sigmoid curve.
  A 15-point rating differential yields a ~90.9% win probability for the higher-rated team.
- P(Team 2 wins) = 1 - P(Team 1 wins)
===============================================================================
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
import math
from src.itamar.teams import Team


@dataclass
class MatchPrediction:
    """
    Data structure containing the output of a match prediction.

    Attributes:
    -----------
    team1 : Team
        The first team in the matchup.
    team2 : Team
        The second team in the matchup.
    winner : Team
        The team predicted to win.
    loser : Team
        The team predicted to lose.
    win_probability_team1 : float
        Estimated probability (0.0 to 1.0) that Team 1 wins.
    win_probability_team2 : float
        Estimated probability (0.0 to 1.0) that Team 2 wins.
    rating_diff : float
        Absolute difference between the ratings of both teams.
    summary : str
        Human-readable summary of the prediction result.
    """
    team1: Team
    team2: Team
    winner: Team
    loser: Team
    win_probability_team1: float
    win_probability_team2: float
    rating_diff: float
    summary: str


class BaseMatchPredictor(ABC):
    """
    Abstract Base Class for Match Predictors.
    All future machine learning / advanced statistical match predictor models 
    should inherit from this class and implement the `predict` method.
    """
    
    @abstractmethod
    def predict(self, team1: Team, team2: Team) -> MatchPrediction:
        """
        Calculates win probabilities and predicts the match winner between two teams.

        Parameters:
        -----------
        team1 : Team
            First team.
        team2 : Team
            Second team.

        Returns:
        --------
        MatchPrediction
            Structured prediction result.
        """
        pass


class RatingMatchPredictor(BaseMatchPredictor):
    """
    Rating-Based Logistic Predictor.
    Predicts game outcome probabilities based on team rating differences 
    using a sigmoid (logistic) function.
    """
    def __init__(self, scaling_factor: float = 15.0):
        """
        Parameters:
        -----------
        scaling_factor : float
            Controls how steeply rating differences affect win probability.
        """
        self.scaling_factor = scaling_factor

    def predict(self, team1: Team, team2: Team) -> MatchPrediction:
        rating_diff = team1.rating - team2.rating
        
        # Logistic probability equation: P(A wins) = 1 / (1 + 10^(-delta / scaling_factor))
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
