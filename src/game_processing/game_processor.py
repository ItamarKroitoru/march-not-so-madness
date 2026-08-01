from src.state.team_state import TeamState


def process_game(
    game,
    team_states: dict[int, TeamState],
) -> None:
    winner_id = int(game["WTeamID"])
    loser_id = int(game["LTeamID"])

    winner_score = int(game["WScore"])
    loser_score = int(game["LScore"])

    winner_state = team_states[winner_id]
    loser_state = team_states[loser_id]

    winner_state.update_after_game(
        points_scored=winner_score,
        points_allowed=loser_score,
        won=True,
    )

    loser_state.update_after_game(
        points_scored=loser_score,
        points_allowed=winner_score,
        won=False,
    )