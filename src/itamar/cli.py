"""
===============================================================================
CLI USER INTERFACE MODULE
===============================================================================
This module provides a Command-Line Interface (CLI) for running NCAA match 
predictions directly in the terminal.

Features:
---------
1. Interactive Mode: Prompts user for Team 1 ID and Team 2 ID with search functionality.
2. Direct Mode: Pass `--team1 <ID> --team2 <ID>` flags for instant headless predictions.
3. Decoupled Architecture: Interacts purely with TeamRepository and BaseMatchPredictor.
===============================================================================
"""

import sys
import argparse
from src.models.teams import TeamRepository, Team
from src.predictors.predictors import BaseMatchPredictor, RatingMatchPredictor, MatchPrediction


class MatchPredictorCLI:
    """
    Terminal User Interface Controller for NCAA Match Prediction.
    """
    def __init__(self, repo: TeamRepository, predictor: BaseMatchPredictor):
        """
        Parameters:
        -----------
        repo : TeamRepository
            Repository containing active 2026 team data.
        predictor : BaseMatchPredictor
            Prediction engine instance.
        """
        self.repo = repo
        self.predictor = predictor

    def display_header(self):
        """Displays formatted CLI header."""
        print("=" * 60)
        print("   🏀 NCAA MATCH PREDICTOR - TERMINAL INTERFACE 🏀   ")
        print("=" * 60)
        print(f" Loaded {len(self.repo)} active teams for the 2026 season.")
        print("-" * 60)

    def prompt_team_id(self, prompt_label: str) -> Team:
        """
        Interactively prompts the user for a valid Kaggle Team ID.
        Supports searching team names by typing 's'.

        Parameters:
        -----------
        prompt_label : str
            Label string ("First" or "Second").

        Returns:
        --------
        Team
            Selected Team object.
        """
        while True:
            raw_input = input(f"\n👉 Enter {prompt_label} Team ID (or 's' to search by name): ").strip()
            
            if raw_input.lower() == 's':
                search_query = input("🔍 Enter team name search query: ").strip()
                matches = self.repo.search_teams(search_query)
                if not matches:
                    print("❌ No matching teams found. Try again.")
                else:
                    print(f"\nSearch results ({len(matches)} found):")
                    for team in matches[:10]:
                        print(f"  ID: {team.team_id:4d} | Name: {team.name:<20} | Rating: {team.rating:.2f}")
                    if len(matches) > 10:
                        print(f"  ... and {len(matches) - 10} more.")
                continue

            if not raw_input.isdigit():
                print("❌ Invalid input! Please enter a numeric Team ID.")
                continue
                
            team_id = int(raw_input)
            team = self.repo.get_team(team_id)
            if team is None:
                print(f"❌ Team ID {team_id} not found in the 2026 dataset! Try again.")
            else:
                print(f"✅ Selected: [{team.team_id}] {team.name} (Rating: {team.rating:.2f})")
                return team

    def print_prediction_result(self, prediction: MatchPrediction):
        """Prints a styled summary box of the prediction result."""
        print("\n" + "=" * 60)
        print("             📊 MATCH PREDICTION RESULT 📊             ")
        print("=" * 60)
        print(f"  Team 1: {prediction.team1.name:<20} (ID: {prediction.team1.team_id}) | Rating: {prediction.team1.rating:6.2f}")
        print(f"  Team 2: {prediction.team2.name:<20} (ID: {prediction.team2.team_id}) | Rating: {prediction.team2.rating:6.2f}")
        print("-" * 60)
        print(f"  🏆 PREDICTED WINNER: {prediction.winner.name}")
        print(f"  📈 Win Probability (Team 1 - {prediction.team1.name}): {prediction.win_probability_team1 * 100:.1f}%")
        print(f"  📈 Win Probability (Team 2 - {prediction.team2.name}): {prediction.win_probability_team2 * 100:.1f}%")
        print(f"  📏 Rating Difference: {prediction.rating_diff:.2f}")
        print("=" * 60 + "\n")

    def run_interactive(self):
        """Runs the interactive prediction CLI loop."""
        self.display_header()
        while True:
            team1 = self.prompt_team_id("First")
            
            while True:
                team2 = self.prompt_team_id("Second")
                if team2.team_id == team1.team_id:
                    print("❌ Team 2 cannot be the same as Team 1! Choose a different team.")
                else:
                    break
            
            prediction = self.predictor.predict(team1, team2)
            self.print_prediction_result(prediction)

            cont = input("🔄 Would you like to predict another matchup? (y/n): ").strip().lower()
            if cont != 'y' and cont != 'yes':
                print("\n👋 Thank you for using the NCAA Match Predictor!\n")
                break

    def run_direct(self, team1_id: int, team2_id: int):
        """Runs single prediction directly given two team IDs."""
        self.display_header()
        team1 = self.repo.get_team(team1_id)
        team2 = self.repo.get_team(team2_id)

        if not team1:
            print(f"❌ Error: Team ID {team1_id} not found in 2026 dataset.")
            sys.exit(1)
        if not team2:
            print(f"❌ Error: Team ID {team2_id} not found in 2026 dataset.")
            sys.exit(1)

        prediction = self.predictor.predict(team1, team2)
        self.print_prediction_result(prediction)


def main():
    """Main CLI entrypoint parser."""
    parser = argparse.ArgumentParser(description="NCAA Match Predictor CLI")
    parser.add_argument("--team1", type=int, help="ID of Team 1")
    parser.add_argument("--team2", type=int, help="ID of Team 2")
    parser.add_argument("--data", type=str, default="data/MTeams2026_baseline.csv", help="Path to 2026 teams dataset")
    args = parser.parse_args()

    repo = TeamRepository.load_from_csv(args.data)
    predictor = RatingMatchPredictor()
    cli = MatchPredictorCLI(repo, predictor)

    if args.team1 is not None and args.team2 is not None:
        cli.run_direct(args.team1, args.team2)
    else:
        cli.run_interactive()

if __name__ == "__main__":
    main()
