# 🏀 March Not So Madness

**Probabilistic Forecasting & Match Predictor for the 2026 NCAA College Basketball Tournaments.**

This repository contains the codebase for the Data Science Final Project by:
- **Itamar Kroitoru**
- **Barak Schwartz**
- **Itay Maman**

---

## 📌 Project Overview
The primary objective of this project is to build a robust predictive system capable of forecasting the outcomes and win probabilities for all potential matchups in the men's 2026 NCAA college basketball tournament.

The project consists of 3 main phases:
1. **Team Rating Algorithm**: Statistical and ML models evaluating team performance, efficiency metrics, and historical data.
2. **Match Predictor**: Probabilistic model predicting game outcomes based on team ratings and features.
3. **Web Application**: Interactive web interface demonstrating match predictions.

---

## 📁 Repository Structure
```text
march-not-so-madness/
├── data/
│   ├── MTeams.csv                       # Historical NCAA teams data
│   ├── MTeams2026_baseline.csv          # Filtered 2026 active teams with baseline ratings
│   ├── MRegularSeasonCompactResults.csv # Historical game results
│   └── MNCAATourneyDetailedResults.csv  # Detailed box scores
├── src/
│   ├── create_2026_teams_baseline.py    # Script to filter 2026 teams
│   ├── teams.py                         # Team data model & TeamRepository
│   ├── predictor.py                     # Match predictor interfaces & implementations
│   └── cli.py                           # Interactive terminal UI
├── tests/
│   └── test_predictor.py                # Unit test suite
├── main.py                              # CLI application entrypoint
└── README.md
```

---

## 🚀 Quick Start & CLI Usage

### Prerequisites
- Python 3.9+
- `pandas`, `numpy`

### Running the Match Predictor (Interactive Mode)
To run the interactive terminal UI:
```bash
python3 main.py
```
*Follow the on-screen prompts to enter Team IDs or search teams by name (press `s`).*

### Running via Command Line Arguments
Predict outcome for specific Team IDs (e.g. Abilene Christian vs Air Force):
```bash
python3 main.py --team1 1101 --team2 1102
```

### Running Unit Tests
```bash
python3 -m unittest discover -s tests
```
