"use client";

import { useState } from "react";
import { Trophy, Swords, Calculator } from "lucide-react";
import teamsData from "../data/teams2026.json";
import { Team, PredictionResult, defaultPredictor } from "../lib/predictor";

export default function Home() {
  const [team1Id, setTeam1Id] = useState<string>("");
  const [team2Id, setTeam2Id] = useState<string>("");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const handlePredict = () => {
    if (!team1Id || !team2Id) {
      alert("Please select both teams!");
      return;
    }
    if (team1Id === team2Id) {
      alert("Please select two different teams.");
      return;
    }

    const team1 = teamsData.find((t) => t.TeamID.toString() === team1Id) as Team;
    const team2 = teamsData.find((t) => t.TeamID.toString() === team2Id) as Team;

    // Use modular predictor service (easily pluggable with ML algorithms in the future)
    const result = defaultPredictor.predict(team1, team2);
    setPrediction(result);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 relative overflow-hidden">
      <div className="z-10 max-w-4xl w-full flex flex-col items-center">
        
        <div className="chalk-border p-6 md:p-12 text-center w-full mb-12">
          <h1 className="text-4xl md:text-6xl font-bold chalk-text mb-4 uppercase tracking-wider">
            NCAA Match Predictor
          </h1>
          <p className="text-xl md:text-2xl chalk-text opacity-90 italic">
            &quot;March Not-So-Madness&quot; Baseline Demo
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 w-full justify-between items-end mb-12">
          {/* Team 1 Selector */}
          <div className="flex flex-col flex-1 w-full gap-2">
            <label className="text-2xl chalk-text ml-2">Home Team</label>
            <select
              value={team1Id}
              onChange={(e) => setTeam1Id(e.target.value)}
              className="chalk-input p-4 text-xl w-full"
            >
              <option value="" disabled className="text-gray-900 bg-gray-200">Select Team...</option>
              {teamsData.map((team) => (
                <option key={team.TeamID} value={team.TeamID} className="text-gray-900 bg-gray-100">
                  {team.TeamName}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex pb-4 text-4xl chalk-text px-4 items-center justify-center opacity-80">
            <Swords size={48} />
          </div>

          {/* Team 2 Selector */}
          <div className="flex flex-col flex-1 w-full gap-2">
            <label className="text-2xl chalk-text ml-2">Away Team</label>
            <select
              value={team2Id}
              onChange={(e) => setTeam2Id(e.target.value)}
              className="chalk-input p-4 text-xl w-full"
            >
              <option value="" disabled className="text-gray-900 bg-gray-200">Select Team...</option>
              {teamsData.map((team) => (
                <option key={team.TeamID} value={team.TeamID} className="text-gray-900 bg-gray-100">
                  {team.TeamName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handlePredict}
          className="chalk-button px-10 py-4 text-2xl font-bold flex items-center gap-3 mb-12"
        >
          <Calculator size={32} />
          PREDICT MATCHUP
        </button>

        {prediction && (
          <div className="chalk-border p-8 w-full max-w-2xl bg-black/10 animate-fade-in relative mt-4">
            <h2 className="text-4xl text-center chalk-text mb-8 flex justify-center items-center gap-4">
              <Trophy className="text-yellow-400" size={40} />
              {prediction.winner.TeamName} Wins!
              <Trophy className="text-yellow-400" size={40} />
            </h2>

            <div className="flex flex-col space-y-6 text-xl md:text-2xl chalk-text">
              <div className="flex justify-between items-center border-b-2 border-white/20 pb-4">
                <span>{prediction.team1.TeamName}</span>
                <span className="font-bold">{(prediction.probTeam1 * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center border-b-2 border-white/20 pb-4">
                <span>{prediction.team2.TeamName}</span>
                <span className="font-bold">{(prediction.probTeam2 * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center opacity-80 text-lg md:text-xl pt-2">
                <span>Rating Differential</span>
                <span>{prediction.ratingDiff.toFixed(2)} pts</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
