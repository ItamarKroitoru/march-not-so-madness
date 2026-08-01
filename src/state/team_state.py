class TeamState:
    def __init__(
        self,
        team_id: int,
        games_played: int = 0,
        wins: int = 0,
        losses: int = 0,
        total_points_scored: int = 0,
        total_points_allowed: int = 0,
    ):
        self.team_id = team_id
        self.games_played = games_played
        self.wins = wins
        self.losses = losses
        self.total_points_scored = total_points_scored
        self.total_points_allowed = total_points_allowed

    def update_after_game(
        self,
        points_scored: int,
        points_allowed: int,
        won: bool,
    ):
        self.games_played += 1
        self.total_points_scored += points_scored
        self.total_points_allowed += points_allowed

        if won:
            self.wins += 1
        else:
            self.losses += 1

    def __repr__(self):
        return (
            f"TeamState("
            f"team_id={self.team_id}, "
            f"games_played={self.games_played}, "
            f"wins={self.wins}, "
            f"losses={self.losses}, "
            f"total_points_scored={self.total_points_scored}, "
            f"total_points_allowed={self.total_points_allowed})"
        )