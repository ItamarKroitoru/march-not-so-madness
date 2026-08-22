# March Not-So Madness 🏀 **[GitHub](https://github.com/ItamarKroitoru/march-not-so-madness)** 🏀 **[Live App](https://march-not-so-madness.vercel.app/)** 🏀 **[Report](https://march-not-so-madness.vercel.app/final_report.pdf)**

> **NCAA College Basketball Match Predictor**  
> *HUJI A Needle in a Data Haystack Course Final Project*

Welcome to **March Not-So Madness**!
This project uses a Logistic Regression model to predict the outcomes of NCAA college basketball games.
We've built an interactive web application to explore the model's predictions, simulate games, and dig into the statistics.

---

## 👥 Meet the Team
- **Barak Schwartz**
- **Itay Maman**
- **Itamar Kroitoru**

---

### 🚀 Try It Live

**[Launch March Not-So Madness](https://march-not-so-madness.vercel.app/)**

---

## 📖 Project Details & Documentation

<details>
<summary><h3>🌟 Features Overview</h3></summary>

Our web application features four main interactive tools:

#### 🎮 1. The Simulator (`/simulator`)
Watch our Machine Learning model predict real matches from the 2026 NCAA tournament! 
- Simulate games day-by-day.
- View real-time ground truth verdicts.
- Track the model's accuracy streak.

#### 🔮 2. What-If Predictor (`/what-if`)
Ever wondered who would win between the 2015 Kentucky Wildcats and the 2024 UConn Huskies?
- Pit any two teams from 2003 to 2026 against each other.
- See the exact probability of each team winning.
- View a side-by-side breakdown of the model's top predictive factors and team stats.

#### 📊 3. Model Insights (`/insights`)
Look under the hood of our Machine Learning algorithm.
- Explore the Logistic Regression feature weights.
- Understand how factors like Win Percentage, PPG, and Elo impact the model.
- View the model's overall historical accuracy.

#### 📄 4. Project Report (`/report`)
Read our full project report and methodology paper directly in the app.
- Embedded interactive PDF viewer with quick navigation.
- Direct download and open-in-tab options for the complete writeup.

</details>

<details>
<summary><h3>🧠 How the Model Works</h3></summary>

Our prediction engine uses a **Logistic Regression** model. Instead of relying on gut feelings, it analyzes historical data to calculate win probabilities.

**Key Features Evaluated:**
- **Elo Ratings:** A dynamic rating system that tracks a team's strength over time based on who they beat and who they lose to.
- **Efficiency Metrics:** Points Per Game (PPG) and Points Allowed Per Game (PAPG).
- **Home Court Advantage:** Adjustments made based on where the game is played (Home, Away, or Neutral).
- **Margin of Victory:** We factor in not just *if* a team won, but by *how much*.

</details>

<details>
<summary><h3>💻 Running the Notebooks Locally</h3></summary>

To inspect the data pipeline, train the models, or run the orchestrator notebook on your machine:

#### 1. Install Dependencies

Using Python `venv`:
```bash
# Create & activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required dependencies
pip install -r requirements.txt
```

*(Or with **Conda**:)*
```bash
conda create -n march-madness python=3.10 -y
conda activate march-madness
pip install -r requirements.txt
```

#### 2. Launch the Orchestrator Notebook

Launch Jupyter from the repository root:

```bash
jupyter notebook
```

Open **`src/notebooks/notebook_orchestrator.ipynb`** and select **Kernel ➔ Restart & Run All**.

The notebook will automatically:
1. Load historical NCAA match and team data (2003–2026) pre-bundled in `data/`.
2. Compute dynamic Elo ratings and rolling team states.
3. Perform feature engineering, correlation analysis, and feature selection.
4. Train and evaluate our predictive models (Logistic Regression, LightGBM, Ensemble).
5. Export model artifacts.

</details>

<details>
<summary><h3>📂 Project Structure</h3></summary>

Here are the most important files and folders if you want to poke around the code:

- **`webapp/src/app/`**: Contains the main pages for the Web App (`/simulator`, `/what-if`, `/insights`, `/report`).
- **`webapp/src/components/`**: Reusable UI components (like the Match Simulation animations).
- **`src/rating/team_rating_algorithm.py`**: The Python script that originally calculates team Elo ratings from raw Kaggle data.
- **`src/notebooks/notebook_orchestrator.ipynb`**: Our Jupyter notebook orchestrator containing the feature engineering, model training, and evaluation pipeline.
- **`webapp/src/data/`**: The JSON datasets powering the web application.

</details>

---

Enjoy predicting the madness! 🏀


