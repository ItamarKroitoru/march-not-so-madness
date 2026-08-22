#!/usr/bin/env python3
"""
Generate comprehensive ground-truth match results, pregame states, and ML predictions
for the 2026 season. Exports webapp/src/data/matches2026.json.
"""

from pathlib import Path
import json
import numpy as np
import pandas as pd
import joblib

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
WEBAPP_DATA_DIR = PROJECT_ROOT / "webapp" / "src" / "data"

import sys
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.data_loading.loaders import get_regular_season_games, get_teams
from src.state.team_state import TeamState
from src.features.team_features import build_team_features
from src.game_processing.process_game import process_game
from src.features.game_features import build_game_feature_row
from src.preprocessing.preprocess import preprocess_X


def generate_matches_2026():
    print("Replaying season 2026 to extract pre-game states and actual scores...")
    teams = get_teams()
    team_name_lookup = dict(zip(teams["TeamID"], teams["TeamName"]))

    season_games = get_regular_season_games(2026)
    winner_ids = set(season_games["WTeamID"])
    loser_ids = set(season_games["LTeamID"])
    team_ids = winner_ids | loser_ids

    team_states = {int(tid): TeamState(team_id=int(tid)) for tid in team_ids}

    feature_rows = []
    game_metadata = []

    for _, game in season_games.iterrows():
        winner_id = int(game["WTeamID"])
        loser_id = int(game["LTeamID"])
        winner_location = str(game["WLoc"])
        w_score = int(game["WScore"])
        l_score = int(game["LScore"])
        num_ot = int(game["NumOT"])

        team_1_id = min(winner_id, loser_id)
        team_2_id = max(winner_id, loser_id)
        label = int(team_1_id == winner_id)

        if winner_location == "N":
            team_1_location = 0
        elif team_1_id == winner_id:
            team_1_location = 1 if winner_location == "H" else -1
        else:
            team_1_location = -1 if winner_location == "H" else 1

        team_1_state = team_states[team_1_id]
        team_2_state = team_states[team_2_id]

        if team_1_state.games_played > 0 and team_2_state.games_played > 0:
            feature_row = build_game_feature_row(
                team_1_state=team_1_state,
                team_2_state=team_2_state,
                team_name_lookup=team_name_lookup,
                season=int(game["Season"]),
                day_num=int(game["DayNum"]),
                team_1_location=team_1_location,
            )
            feature_rows.append(feature_row)

            team_1_score = w_score if team_1_id == winner_id else l_score
            team_2_score = l_score if team_1_id == winner_id else w_score

            t1_feat = build_team_features(team_1_state, prefix="team")
            t2_feat = build_team_features(team_2_state, prefix="team")

            t1_streak = f"W{team_1_state.current_win_streak}" if team_1_state.current_win_streak > 0 else f"L{team_1_state.current_loss_streak}"
            t2_streak = f"W{team_2_state.current_win_streak}" if team_2_state.current_win_streak > 0 else f"L{team_2_state.current_loss_streak}"

            game_metadata.append({
                "season": int(game["Season"]),
                "dayNum": int(game["DayNum"]),
                "team1Id": team_1_id,
                "team1Name": team_name_lookup[team_1_id],
                "team2Id": team_2_id,
                "team2Name": team_name_lookup[team_2_id],
                "location": team_1_location,
                "yTrue": label,
                "team1Score": team_1_score,
                "team2Score": team_2_score,
                "wScore": w_score,
                "lScore": l_score,
                "numOt": num_ot,
                "t1_stats": {
                    "gamesPlayed": team_1_state.games_played,
                    "wins": team_1_state.wins,
                    "losses": team_1_state.losses,
                    "record": f"{team_1_state.wins}-{team_1_state.losses}",
                    "winPct": round(t1_feat.get("team_win_pct", 0) * 100, 1),
                    "ppg": round(t1_feat.get("team_ppg", 0), 1),
                    "papg": round(t1_feat.get("team_papg", 0), 1),
                    "fgPct": round(t1_feat.get("team_fg_pct", 0) * 100, 1),
                    "fg3Pct": round(t1_feat.get("team_fg3_pct", 0) * 100, 1),
                    "ftPct": round(t1_feat.get("team_ft_pct", 0) * 100, 1),
                    "offReb": round(t1_feat.get("team_off_rebounds_pg", 0), 1),
                    "defReb": round(t1_feat.get("team_def_rebounds_pg", 0), 1),
                    "ast": round(t1_feat.get("team_assists_pg", 0), 1),
                    "to": round(t1_feat.get("team_turnovers_pg", 0), 1),
                    "stl": round(t1_feat.get("team_steals_pg", 0), 1),
                    "blk": round(t1_feat.get("team_blocks_pg", 0), 1),
                    "streak": t1_streak,
                    "pointDiff": round(t1_feat.get("team_point_diff_pg", 0), 1),
                    "last5WinPct": round(t1_feat.get("team_last_5_win_pct", 0) * 100, 1),
                    "avgOpponentWinPct": round(t1_feat.get("team_avg_opponent_win_pct", 0) * 100, 1),
                },
                "t2_stats": {
                    "gamesPlayed": team_2_state.games_played,
                    "wins": team_2_state.wins,
                    "losses": team_2_state.losses,
                    "record": f"{team_2_state.wins}-{team_2_state.losses}",
                    "winPct": round(t2_feat.get("team_win_pct", 0) * 100, 1),
                    "ppg": round(t2_feat.get("team_ppg", 0), 1),
                    "papg": round(t2_feat.get("team_papg", 0), 1),
                    "fgPct": round(t2_feat.get("team_fg_pct", 0) * 100, 1),
                    "fg3Pct": round(t2_feat.get("team_fg3_pct", 0) * 100, 1),
                    "ftPct": round(t2_feat.get("team_ft_pct", 0) * 100, 1),
                    "offReb": round(t2_feat.get("team_off_rebounds_pg", 0), 1),
                    "defReb": round(t2_feat.get("team_def_rebounds_pg", 0), 1),
                    "ast": round(t2_feat.get("team_assists_pg", 0), 1),
                    "to": round(t2_feat.get("team_turnovers_pg", 0), 1),
                    "stl": round(t2_feat.get("team_steals_pg", 0), 1),
                    "blk": round(t2_feat.get("team_blocks_pg", 0), 1),
                    "streak": t2_streak,
                    "pointDiff": round(t2_feat.get("team_point_diff_pg", 0), 1),
                    "last5WinPct": round(t2_feat.get("team_last_5_win_pct", 0) * 100, 1),
                    "avgOpponentWinPct": round(t2_feat.get("team_avg_opponent_win_pct", 0) * 100, 1),
                }
            })

        process_game(game=game, team_states=team_states)

    raw_X_2026 = pd.DataFrame(feature_rows)

    print("Preprocessing differentials...")
    X_2026 = preprocess_X(
        raw_X_2026,
        prefix1="team_1_",
        prefix2="team_2_",
        diff_suffix="_diff",
        drop_base_features=True,
    )

    with open(ARTIFACTS_DIR / "feature_columns.json") as f:
        feature_columns = json.load(f)

    X_2026 = X_2026[feature_columns]

    print("Running logistic regression predictions...")
    model = joblib.load(ARTIFACTS_DIR / "logistic_model.joblib")
    y_pred = model.predict(X_2026).astype(int)
    y_prob = model.predict_proba(X_2026)

    prob_t1 = np.round(y_prob[:, 1], 4)
    prob_t2 = np.round(y_prob[:, 0], 4)

    matches = []
    for i, meta in enumerate(game_metadata):
        t1_name = meta["team1Name"]
        t2_name = meta["team2Name"]
        t1_id = meta["team1Id"]
        t2_id = meta["team2Id"]
        day_num = meta["dayNum"]
        season = meta["season"]
        loc = meta["location"]
        yt = meta["yTrue"]
        yp = int(y_pred[i])
        p1 = float(prob_t1[i])
        p2 = float(prob_t2[i])
        is_correct = bool(yt == yp)

        actual_winner = t1_name if yt == 1 else t2_name
        actual_loser = t2_name if yt == 1 else t1_name
        predicted_winner = t1_name if yp == 1 else t2_name
        predicted_loser = t2_name if yp == 1 else t1_name

        max_p = max(p1, p2)
        if max_p >= 0.75:
            conf = "Heavy Favorite"
        elif max_p >= 0.65:
            conf = "Moderate Favorite"
        elif max_p >= 0.54:
            conf = "Slight Advantage"
        else:
            conf = "Toss-Up"

        loc_label = "Neutral Site"
        if loc == 1:
            loc_label = f"{t1_name} Home"
        elif loc == -1:
            loc_label = f"{t2_name} Home"

        # Key differentials
        diff_ppg = round(meta["t1_stats"]["ppg"] - meta["t2_stats"]["ppg"], 1)
        diff_papg = round(meta["t1_stats"]["papg"] - meta["t2_stats"]["papg"], 1)
        diff_fg = round(meta["t1_stats"]["fgPct"] - meta["t2_stats"]["fgPct"], 1)
        diff_win_pct = round(meta["t1_stats"]["winPct"] - meta["t2_stats"]["winPct"], 1)

        key_factors = [
            {
                "label": "Win Rate Diff",
                "val": f"{'+' if diff_win_pct > 0 else ''}{diff_win_pct}%",
                "favors": t1_name if diff_win_pct > 0 else t2_name,
            },
            {
                "label": "Scoring Offense (PPG)",
                "val": f"{'+' if diff_ppg > 0 else ''}{diff_ppg} pts",
                "favors": t1_name if diff_ppg > 0 else t2_name,
            },
            {
                "label": "Scoring Defense (PAPG)",
                "val": f"{'+' if diff_papg < 0 else ''}{diff_papg} pts",
                "favors": t1_name if diff_papg < 0 else t2_name,
            },
            {
                "label": "Field Goal %",
                "val": f"{'+' if diff_fg > 0 else ''}{diff_fg}%",
                "favors": t1_name if diff_fg > 0 else t2_name,
            },
        ]

        matches.append({
            "id": f"{season}_d{day_num}_{t1_id}_{t2_id}_{i}",
            "season": season,
            "dayNum": day_num,
            "team1Id": t1_id,
            "team1Name": t1_name,
            "team2Id": t2_id,
            "team2Name": t2_name,
            "location": loc,
            "locationLabel": loc_label,
            "yTrue": yt,
            "yPred": yp,
            "probTeam1": p1,
            "probTeam2": p2,
            "actualWinner": actual_winner,
            "actualLoser": actual_loser,
            "predictedWinner": predicted_winner,
            "predictedLoser": predicted_loser,
            "correct": is_correct,
            "isUpset": not is_correct and max_p >= 0.60,
            "confidence": conf,
            "spread": round(abs(float(np.log(max(1e-5, p1) / max(1e-5, p2)))) * 4.5, 1),
            "score": {
                "team1Score": meta["team1Score"],
                "team2Score": meta["team2Score"],
                "winnerScore": meta["wScore"],
                "loserScore": meta["lScore"],
                "numOt": meta["numOt"],
                "scoreDiff": abs(meta["team1Score"] - meta["team2Score"]),
            },
            "team1Stats": meta["t1_stats"],
            "team2Stats": meta["t2_stats"],
            "keyFactors": key_factors,
        })

    df_matches = pd.DataFrame(matches)

    # Daily aggregation for stacked performance bar chart
    daily_stats = []
    for day, group in df_matches.groupby("dayNum"):
        corr_cnt = int(group["correct"].sum())
        total_cnt = len(group)
        incorr_cnt = total_cnt - corr_cnt
        acc = round(corr_cnt / total_cnt * 100, 1)
        daily_stats.append({
            "dayNum": int(day),
            "correct": corr_cnt,
            "incorrect": incorr_cnt,
            "total": total_cnt,
            "accuracy": acc,
        })

    daily_stats.sort(key=lambda d: d["dayNum"])

    # Overall Summary
    total_games = len(matches)
    total_correct = int(df_matches["correct"].sum())
    total_incorrect = total_games - total_correct
    overall_accuracy = round(total_correct / total_games * 100, 2)

    home_games = df_matches[df_matches["location"] == 1]
    away_games = df_matches[df_matches["location"] == -1]
    neutral_games = df_matches[df_matches["location"] == 0]

    summary = {
        "season": 2026,
        "totalGames": total_games,
        "correctCount": total_correct,
        "incorrectCount": total_incorrect,
        "overallAccuracy": overall_accuracy,
        "homeAccuracy": round(home_games["correct"].mean() * 100, 1) if len(home_games) > 0 else 0,
        "awayAccuracy": round(away_games["correct"].mean() * 100, 1) if len(away_games) > 0 else 0,
        "neutralAccuracy": round(neutral_games["correct"].mean() * 100, 1) if len(neutral_games) > 0 else 0,
        "heavyFavoriteAccuracy": round(df_matches[df_matches["confidence"] == "Heavy Favorite"]["correct"].mean() * 100, 1),
        "totalUpsets": int(df_matches["isUpset"].sum()),
        "availableDays": [d["dayNum"] for d in daily_stats],
    }

    output_data = {
        "summary": summary,
        "dailyPerformance": daily_stats,
        "matches": matches,
    }

    WEBAPP_DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_path = WEBAPP_DATA_DIR / "matches2026.json"
    with open(out_path, "w") as f:
        json.dump(output_data, f, indent=2)

    print(f"Successfully exported {len(matches)} matches to {out_path}")
    print(f"Overall Accuracy: {overall_accuracy}% ({total_correct}/{total_games})")


if __name__ == "__main__":
    generate_matches_2026()
