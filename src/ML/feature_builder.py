def build_game_features(team_1_state, team_2_state):
    return {
        "team_1_games_played": team_1_state.games_played,
        "team_1_wins": team_1_state.wins,
        "team_1_losses": team_1_state.losses,
        "team_1_points_scored": team_1_state.total_points_scored,
        "team_1_points_allowed": team_1_state.total_points_allowed,

        "team_2_games_played": team_2_state.games_played,
        "team_2_wins": team_2_state.wins,
        "team_2_losses": team_2_state.losses,
        "team_2_points_scored": team_2_state.total_points_scored,
        "team_2_points_allowed": team_2_state.total_points_allowed,
    }