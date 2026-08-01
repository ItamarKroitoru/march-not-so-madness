from collections.abc import Mapping


def predict_winner(
    team_a_id: int,
    team_b_id: int,
    ratings: Mapping[int, float],
) -> int | None:
    """
    Predict that the team with the higher rating will win.

    Parameters
    ----------
    team_a_id
        Identifier of the first team.
    team_b_id
        Identifier of the second team.
    ratings
        Mapping from TeamID to rating.

    Returns
    -------
    int | None
        Predicted winning TeamID.

        Returns None when both teams have the same rating.

    Raises
    ------
    KeyError
        If either team does not have a rating.
    """
    if team_a_id not in ratings:
        raise KeyError(
            f"Team {team_a_id} does not have a rating."
        )

    if team_b_id not in ratings:
        raise KeyError(
            f"Team {team_b_id} does not have a rating."
        )

    team_a_rating = ratings[team_a_id]
    team_b_rating = ratings[team_b_id]

    if team_a_rating > team_b_rating:
        return team_a_id

    if team_b_rating > team_a_rating:
        return team_b_id

    return None