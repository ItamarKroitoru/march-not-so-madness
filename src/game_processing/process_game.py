from src.state.team_state import TeamState


def process_game(
    game,
    team_states: dict[int, TeamState],
) -> None:
    """
    Update the winner and loser TeamState objects
    after one completed detailed-results game.

    Opponent-strength values are captured before either
    team state is updated.
    """
    winner_id = int(game["WTeamID"])
    loser_id = int(game["LTeamID"])

    winner_score = int(game["WScore"])
    loser_score = int(game["LScore"])

    winner_location = str(game["WLoc"])

    if winner_location == "H":
        loser_location = "A"
    elif winner_location == "A":
        loser_location = "H"
    elif winner_location == "N":
        loser_location = "N"
    else:
        raise ValueError(
            "WLoc must be 'H', 'A', or 'N'. "
            f"Received: {winner_location!r}"
        )

    winner_state = team_states[winner_id]
    loser_state = team_states[loser_id]

    # Capture both teams' pregame strength before
    # either state is updated.
    winner_games_played = winner_state.games_played
    loser_games_played = loser_state.games_played

    winner_win_pct = (
        winner_state.wins / winner_games_played
        if winner_games_played > 0
        else 0.0
    )

    loser_win_pct = (
        loser_state.wins / loser_games_played
        if loser_games_played > 0
        else 0.0
    )

    winner_point_diff_pg = (
        (
            winner_state.total_points_scored
            - winner_state.total_points_allowed
        )
        / winner_games_played
        if winner_games_played > 0
        else 0.0
    )

    loser_point_diff_pg = (
        (
            loser_state.total_points_scored
            - loser_state.total_points_allowed
        )
        / loser_games_played
        if loser_games_played > 0
        else 0.0
    )

    winner_state.update_after_game(
        points_scored=winner_score,
        points_allowed=loser_score,
        won=True,
        location=winner_location,
        fgm=int(game["WFGM"]),
        fga=int(game["WFGA"]),
        fgm3=int(game["WFGM3"]),
        fga3=int(game["WFGA3"]),
        ftm=int(game["WFTM"]),
        fta=int(game["WFTA"]),
        offensive_rebounds=int(game["WOR"]),
        defensive_rebounds=int(game["WDR"]),
        assists=int(game["WAst"]),
        turnovers=int(game["WTO"]),
        steals=int(game["WStl"]),
        blocks=int(game["WBlk"]),
        personal_fouls=int(game["WPF"]),

        # The winner's opponent was the loser.
        opponent_games_played=loser_games_played,
        opponent_win_pct=loser_win_pct,
        opponent_point_diff_pg=loser_point_diff_pg,
    )

    loser_state.update_after_game(
        points_scored=loser_score,
        points_allowed=winner_score,
        won=False,
        location=loser_location,
        fgm=int(game["LFGM"]),
        fga=int(game["LFGA"]),
        fgm3=int(game["LFGM3"]),
        fga3=int(game["LFGA3"]),
        ftm=int(game["LFTM"]),
        fta=int(game["LFTA"]),
        offensive_rebounds=int(game["LOR"]),
        defensive_rebounds=int(game["LDR"]),
        assists=int(game["LAst"]),
        turnovers=int(game["LTO"]),
        steals=int(game["LStl"]),
        blocks=int(game["LBlk"]),
        personal_fouls=int(game["LPF"]),

        # The loser's opponent was the winner.
        opponent_games_played=winner_games_played,
        opponent_win_pct=winner_win_pct,
        opponent_point_diff_pg=winner_point_diff_pg,
    )