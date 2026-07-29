import pandas as pd
import numpy as np

def create_2026_teams_baseline(
    input_path: str = "data/MTeams.csv",
    output_path: str = "data/MTeams2026_baseline.csv",
    random_seed: int = 42
):
    """
    Filters MTeams.csv for teams active in the 2026 season (LastD1Season >= 2026),
    drops FirstD1Season and LastD1Season columns,
    and assigns a random baseline rating score to each team.
    """
    # Load raw teams dataset
    df_teams = pd.read_csv(input_path)
    
    # Filter teams that played in 2026
    df_2026 = df_teams[df_teams['LastD1Season'] >= 2026].copy()
    
    # Set seed for reproducibility
    np.random.seed(random_seed)
    
    # Assign random rating score (baseline between 50.0 and 100.0 rounded to 2 decimal places)
    df_2026['Rating'] = np.round(np.random.uniform(50.0, 100.0, size=len(df_2026)), 2)
    
    # Drop FirstD1Season and LastD1Season
    df_2026 = df_2026[['TeamID', 'TeamName', 'Rating']]
    
    # Save to output CSV
    df_2026.to_csv(output_path, index=False)
    print(f"Created baseline dataset with {len(df_2026)} teams saved to '{output_path}'.")
    return df_2026

if __name__ == "__main__":
    create_2026_teams_baseline()
