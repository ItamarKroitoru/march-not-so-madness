# 🏀 March Not-So-Madness

> **Probabilistic Forecasting & Match Predictor for NCAA College Basketball**  
> *HUJI Data Science Course Final Project*

Welcome to **March Not-So-Madness**! This project uses a Logistic Regression model to predict the outcomes of NCAA college basketball games. We've built an interactive, retro chalkboard-themed web application to explore the model's predictions, simulate games, and dig into the statistics.

---

## 👥 Meet the Team
- **Itamar Kroitoru**
- **Barak Schwartz**
- **Itay Maman**

---

## 🚀 Try It Live

The application is fully deployed online and ready to play with!

👉 **[Launch March Not-So-Madness on Vercel](https://march-not-so-madness.vercel.app/)** 👈

---

## 🌟 Features Overview

Our web application features three main interactive tools:

### 🎮 1. The Simulator (`/simulator`)
Watch our Machine Learning model predict real matches from the 2026 NCAA tournament! 
- Simulate games day-by-day.
- View real-time ground truth verdicts.
- Track the model's accuracy streak.

### 🔮 2. What-If Predictor (`/what-if`)
Ever wondered who would win between the 2015 Kentucky Wildcats and the 2024 UConn Huskies?
- Pit any two teams from 2003 to 2026 against each other.
- See the exact probability of each team winning.
- View a side-by-side breakdown of the model's top predictive factors and team stats.

### 📊 3. Model Insights (`/insights`)
Look under the hood of our Machine Learning algorithm.
- Explore the Logistic Regression feature weights.
- Understand how factors like Win Percentage, PPG, and Elo impact the model.
- View the model's overall historical accuracy.

---

## 🧠 How the Model Works

Our prediction engine uses a **Logistic Regression** model. Instead of relying on gut feelings, it analyzes historical data to calculate win probabilities.

**Key Features Evaluated:**
- **Elo Ratings:** A dynamic rating system that tracks a team's strength over time based on who they beat and who they lose to.
- **Efficiency Metrics:** Points Per Game (PPG) and Points Allowed Per Game (PAPG).
- **Home Court Advantage:** Adjustments made based on where the game is played (Home, Away, or Neutral).
- **Margin of Victory:** We factor in not just *if* a team won, but by *how much*.

---

## 📂 Project Structure

Here are the most important files and folders if you want to poke around the code:

- **`webapp/src/app/`**: Contains the main pages for the Web App (`/simulator`, `/what-if`, `/insights`).
- **`webapp/src/components/`**: Reusable UI components (like the Match Simulation animations).
- **`src/rating/team_rating_algorithm.py`**: The Python script that originally calculates team Elo ratings from raw Kaggle data.
- **`src/notebooks/LR_results_analysis.ipynb`**: Our Jupyter notebook containing the deep-dive training and evaluation of the Logistic Regression model.
- **`webapp/src/data/`**: The JSON datasets powering the web application.

Enjoy predicting the madness! 🏀
