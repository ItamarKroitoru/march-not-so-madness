import unittest
from src.models import Team, TeamRepository
from src.predictors.predictors import RatingMatchPredictor


class TestMatchPredictor(unittest.TestCase):

    def setUp(self):
        self.team_strong = Team(team_id=1, name="Strong Team", rating=90.0)
        self.team_weak = Team(team_id=2, name="Weak Team", rating=60.0)
        self.predictor = RatingMatchPredictor()

    def test_prediction_winner(self):
        prediction = self.predictor.predict(self.team_strong, self.team_weak)
        self.assertEqual(prediction.winner.team_id, self.team_strong.team_id)
        self.assertGreater(prediction.win_probability_team1, prediction.win_probability_team2)

    def test_repository_search(self):
        repo = TeamRepository.load_from_csv("data/MTeams2026_baseline.csv")
        self.assertGreater(len(repo), 0)
        
        matches = repo.search_teams("Abilene")
        self.assertTrue(any(team.name == "Abilene Chr" for team in matches))

if __name__ == "__main__":
    unittest.main()
