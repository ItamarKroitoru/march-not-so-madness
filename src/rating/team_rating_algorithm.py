"""
===============================================================================
STEP 1: TEAM RATING ALGORITHM MODULE
===============================================================================
This module processes historical NCAA game data to calculate dynamic rating 
scores for every Division I team playing in the 2026 season.

Statistical Background for Developers / Stats Specialists:
-----------------------------------------------------------
1. Elo Rating System:
   - Every team starts with a baseline rating of 1500.0.
   - For every historical match between Team W (winner) and Team L (loser),
     we calculate the expected probability of Team W winning:
         P(W wins) = 1 / (1 + 10 ** ((Elo_L - Elo_W_adjusted) / 400))
   
2. Home Court Advantage Adjustment:
   - Playing at home adds +30 Elo points to the home team's effective rating.
   - Playing away subtracts -30 Elo points. Neutral courts have 0 adjustment.

3. Margin of Victory (MoV) Scaling:
   - A larger point differential yields a larger rating adjustment, smoothed
     by a logarithmic transformation:
         MoV_multiplier = ln(|WScore - LScore| + 1)

4. Rating Update Formula:
   - Winner Elo increases:  Elo_W += K * MoV_multiplier * (1 - P(W wins))
   - Loser Elo decreases:  Elo_L -= K * MoV_multiplier * (1 - P(W wins))
   where K = 20.0 (the K-factor scaling constant).

5. Min-Max Normalization:
   - Raw Elo scores (~1200 to ~2400) are mapped onto a standardized 
     [50.0, 100.0] scale for easy consumption by downstream models:
         Rating = 50.0 + (Elo - Min_Elo) / (Max_Elo - Min_Elo) * 50.0
===============================================================================
"""

import os
import json
import pandas as pd
import numpy as np


def calculate_team_ratings(
    games_path: str = "data/MRegularSeasonCompactResults.csv",
    teams_path: str = "data/MTeams.csv",
    output_csv_path: str = "data/MTeams2026_baseline.csv",
    output_json_path: str = "data/teams2026.json",
    webapp_json_path: str = "webapp/src/data/teams2026.json",
    k_factor: float = 20.0
) -> pd.DataFrame:
    """
    Calculates team ratings from historical game data and updates datasets.

    Parameters:
    -----------
    games_path : str
        Path to historical regular season game results CSV.
    teams_path : str
        Path to raw master teams dataset CSV.
    output_csv_path : str
        Target file path for outputting 2026 team ratings CSV.
    output_json_path : str
        Target file path for root JSON dataset.
    webapp_json_path : str
        Target file path for frontend WebApp dataset.
    k_factor : float
        Elo update sensitivity weight (default 20.0).

    Returns:
    --------
    pd.DataFrame
        DataFrame with columns ['TeamID', 'TeamName', 'Rating'].
    """
    # 1. Read input datasets
    df_teams = pd.read_csv(teams_path)
    df_games = pd.read_csv(games_path)

    # 2. Initialize baseline Elo ratings (1500.0) for all historical teams
    elos = {team_id: 1500.0 for team_id in df_teams['TeamID']}

    # 3. Process historical games chronologically
    for _, row in df_games.iterrows():
        w = int(row['WTeamID'])
        l = int(row['LTeamID'])
        loc = str(row['WLoc'])

        w_elo = elos[w]
        l_elo = elos[l]

        # Home court advantage adjustment
        w_adj = w_elo + (30.0 if loc == 'H' else (-30.0 if loc == 'A' else 0.0))

        # Expected win probability for winner (Logistic curve over 400 Elo scale)
        exp_w = 1.0 / (1.0 + 10.0 ** ((l_elo - w_adj) / 400.0))
        
        # Log-transformed margin of victory
        mov_mult = np.log(abs(row['WScore'] - row['LScore']) + 1)

        # Update Elo scores
        shift = k_factor * mov_mult * (1.0 - exp_w)
        elos[w] += shift
        elos[l] -= shift

    # 4. Filter for teams playing in the 2026 season (LastD1Season >= 2026)
    active_2026 = df_teams[df_teams['LastD1Season'] >= 2026].copy()
    active_2026['RawElo'] = active_2026['TeamID'].map(elos)

    # 5. Perform Min-Max normalization to [50.0, 100.0] range
    min_elo = active_2026['RawElo'].min()
    max_elo = active_2026['RawElo'].max()
    active_2026['Rating'] = np.round(50.0 + (active_2026['RawElo'] - min_elo) / (max_elo - min_elo) * 50.0, 2)

    # Clean dataset columns
    result_df = active_2026[['TeamID', 'TeamName', 'Rating']].copy()

    # 6. Export updated rating data to CSV and JSON targets
    if output_csv_path:
        result_df.to_csv(output_csv_path, index=False)

    if output_json_path:
        result_df.to_json(output_json_path, orient="records", indent=2)

    if webapp_json_path:
        os.makedirs(os.path.dirname(webapp_json_path), exist_ok=True)
        result_df.to_json(webapp_json_path, orient="records", indent=2)

    print(f"✅ Successfully calculated team ratings for {len(result_df)} active 2026 teams.")
    print(f"Top 5 rated teams:\n{result_df.sort_values(by='Rating', ascending=False).head(5).to_string(index=False)}")
    
    return result_df

if __name__ == "__main__":
    calculate_team_ratings()
