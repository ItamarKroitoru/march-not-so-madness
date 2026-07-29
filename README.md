# 🏀 March Not-So-Madness

> **Probabilistic Forecasting & Match Predictor for the 2026 NCAA College Basketball Tournaments**  
> *HUJI Data Science Course Final Project*

---

## 👥 Team Members
- **Itamar Kroitoru** (ID: 209173533)
- **Barak Schwartz** (ID: 327359592)
- **Itay Maman** (ID: 206554677)

---

## 🎯 Executive Summary & Architecture Overview

The primary objective of this project is to build a robust statistical and machine-learning system capable of forecasting game outcomes and calculating win probabilities for all possible matchups in the men's 2026 NCAA basketball tournament.

The system is designed in **3 decoupled modular phases**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Team Rating Algorithm (src/rating/team_rating_algorithm.py)          │
│ Reads historical game results -> Computes Elo & Efficiency Ratings          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Exports calculated team ratings
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ DATASETS: data/MTeams2026_baseline.csv & webapp/src/data/teams2026.json      │
│ Active 2026 teams with standardized performance rating scores               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Consumed by
                   ┌───────────────────┴───────────────────┐
                   ▼                                       ▼
┌─────────────────────────────────────┐ ┌─────────────────────────────────────┐
│ STEP 2: Python Predictor & CLI      │ │ STEP 3: Next.js Web App Demo UI     │
│ (src/predictors/ & src/cli/)        │ │ (webapp/)                           │
│ Bradley-Terry Logistic Predictor    │ │ Retro "Chalkboard" Interactive UI   │
└─────────────────────────────────────┘ └─────────────────────────────────────┘
```

---

## 📊 Statistical & Mathematical Foundations

This section explains the core statistical formulas used in the project for teammates coming from a statistics or data science background.

### 1. Dynamic Elo Rating Algorithm (`src/rating/team_rating_algorithm.py`)
All active NCAA teams begin with a baseline rating $R = 1500.0$. For every historical regular season match between Winner ($W$) and Loser ($L$), the expected win probability for Team $W$ is:

$$P(W \text{ wins}) = \frac{1}{1 + 10^{\frac{R_L - (R_W + \text{HomeAdj})}{400}}}$$

Where:
- $\text{HomeAdj} = +30$ if Team $W$ played at home, $-30$ if away, $0$ if neutral court.
- **Margin of Victory (MoV) Multiplier**: Smooths blowouts using a logarithmic transformation:
  $$\text{MoV\_Mult} = \ln(| \text{Score}_W - \text{Score}_L | + 1)$$
- **Rating Update**:
  $$R_W \leftarrow R_W + K \cdot \text{MoV\_Mult} \cdot (1 - P(W \text{ wins}))$$
  $$R_L \leftarrow R_L - K \cdot \text{MoV\_Mult} \cdot (1 - P(W \text{ wins}))$$
  *(where $K = 20.0$)*

- **Min-Max Standardized Scale**:
  Raw Elo scores ($\approx 1200 - 2400$) are normalized onto a $[50.0, 100.0]$ scale for downstream models:
  $$\text{Rating} = 50.0 + \frac{\text{Elo} - \text{Elo}_{\min}}{\text{Elo}_{\max} - \text{Elo}_{\min}} \times 50.0$$

---

### 2. Match Win Probability Model (`src/predictors/predictor.py` & `webapp/src/lib/predictor.ts`)
The probability engine uses a **logistic curve** (equivalent to a Bradley-Terry paired comparison model):

$$P(\text{Team 1 wins}) = \frac{1}{1 + 10^{-\frac{\text{Rating}_1 - \text{Rating}_2}{S}}}$$

- **Scaling Factor ($S$)**: Set to $15.0$. A 15-point rating difference yields a **90.9%** estimated win probability for the higher-rated team.

---

## 📂 File & Directory Reference Guide

Every file in the repository serves a specific, documented role:

| Path | Description & Role |
| --- | --- |
| **`main.py`** | Root entry point for running the interactive terminal CLI application. |
| **`src/__init__.py`** | Top-level package exports (`Team`, `TeamRepository`, `BaseMatchPredictor`, `MatchPredictorCLI`). |
| **`src/models/teams.py`** | Defines `Team` dataclass and `TeamRepository` (handles querying, searching, loading team data). |
| **`src/rating/team_rating_algorithm.py`** | **Step 1 Engine**: Calculates team ratings using historical match results and exports `teams2026.json`. |
| **`src/predictors/predictor.py`** | **Step 2 Engine**: Defines `BaseMatchPredictor` abstract class & `RatingMatchPredictor` implementation. |
| **`src/cli/cli.py`** | Terminal UI (`MatchPredictorCLI`): supports team lookup, search by name, and prediction boxes. |
| **`src/data_prep/create_2026_teams_baseline.py`** | Preprocessing script for filtering 2026 active teams (`LastD1Season >= 2026`). |
| **`data/MTeams.csv`** | Kaggle raw dataset of historical NCAA teams. |
| **`data/MRegularSeasonCompactResults.csv`** | Kaggle raw dataset of regular season game outcomes (1985–2026). |
| **`data/MTeams2026_baseline.csv`** | Filtered dataset of active 2026 teams with their calculated rating scores. |
| **`data/teams2026.json`** | JSON export of 2026 team ratings. |
| **`webapp/`** | Next.js 14 Web Application directory (**Step 3**). |
| **`webapp/src/lib/predictor.ts`** | Frontend TypeScript prediction service implementing `MatchPredictor` interface. |
| **`webapp/src/app/page.tsx`** | Main Next.js Web UI ("Chalkboard" March Madness theme with team selectors). |
| **`webapp/src/data/teams2026.json`** | Dataset automatically updated by Step 1 algorithm for web application consumption. |
| **`tests/test_predictor.py`** | Python `unittest` suite for validating team repositories and prediction calculations. |

---

## 💻 How to Run & Update the Project

### 1. Recalculate Team Ratings (Step 1)
To re-run the rating algorithm on historical game results and update all datasets:
```bash
python3 -m src.rating.team_rating_algorithm
```

### 2. Run the Terminal Predictor CLI (Step 2)
- **Interactive Mode**:
  ```bash
  python3 main.py
  ```
  *(Press `s` inside the CLI to search teams by name).*

- **Direct Execution Mode**:
  ```bash
  python3 main.py --team1 1181 --team2 1112
  ```

### 3. Run the Web Application (Step 3)
```bash
cd webapp
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to interact with the retro chalkboard UI!

### 4. Run Automated Unit Tests
```bash
python3 -m unittest discover -s tests
```

---

## 🤖 Guide for Teammates & AI Coding Agents

If you or your AI agent are extending the codebase:
1. **Adding a New Rating Feature (Step 1)**:
   - Edit [src/rating/team_rating_algorithm.py](file:///Users/itamarkr/Documents/HUJI/Needle/march-not-so-madness/src/rating/team_rating_algorithm.py).
   - `calculate_team_ratings()` will automatically refresh both CSV and WebApp JSON datasets.
2. **Adding a New ML Predictor Model (Step 2)**:
   - Subclass `BaseMatchPredictor` in [src/predictors/predictor.py](file:///Users/itamarkr/Documents/HUJI/Needle/march-not-so-madness/src/predictors/predictor.py).
   - Implement `predict(team1, team2) -> MatchPrediction`.
3. **Updating the Web UI (Step 3)**:
   - Implement the `MatchPredictor` interface in [webapp/src/lib/predictor.ts](file:///Users/itamarkr/Documents/HUJI/Needle/march-not-so-madness/webapp/src/lib/predictor.ts).
   - The UI in [webapp/src/app/page.tsx](file:///Users/itamarkr/Documents/HUJI/Needle/march-not-so-madness/webapp/src/app/page.tsx) delegates all prediction calculations directly to `predictor.ts`.
