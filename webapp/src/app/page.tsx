"use client";

import { useState } from "react";
import { Trophy, Swords, Calculator, Sparkles } from "lucide-react";
import { enrichedTeams, EnrichedTeam } from "../lib/teamsData";
import { PredictionResult, defaultPredictor } from "../lib/predictor";

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

    const team1 = enrichedTeams.find((t) => t.TeamID.toString() === team1Id) as EnrichedTeam;
    const team2 = enrichedTeams.find((t) => t.TeamID.toString() === team2Id) as EnrichedTeam;

    const result = defaultPredictor.predict(team1, team2);
    setPrediction(result);
  };

  return (
    <main className="flex flex-col items-center p-4 md:p-8 max-w-5xl mx-auto">
      <div className="w-full flex flex-col items-center">

        {/* Hero Header */}
        <div className="chalk-border px-8 py-6 md:py-8 text-center w-full mb-8 bg-black/20">
          <h1 className="text-3xl md:text-5xl font-bold chalk-text uppercase tracking-wider text-center">
            Match Predictor
          </h1>
        </div>



        {/* Team Selectors */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full justify-between items-end mb-8 bg-black/20 p-6 rounded-xl border border-white/20">
          
          {/* Home Team */}
          <div className="flex flex-col flex-1 w-full gap-2">
            <label className="text-xl chalk-text font-semibold flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-400" />
              <span>Team 1 (Home)</span>
            </label>
            <select
              value={team1Id}
              onChange={(e) => setTeam1Id(e.target.value)}
              className="chalk-input p-3.5 text-lg w-full"
            >
              <option value="" disabled className="text-gray-900 bg-gray-200">Select Team...</option>
              {enrichedTeams.map((team) => (
                <option key={team.TeamID} value={team.TeamID} className="text-gray-900 bg-gray-100">
                  #{team.Seed} {team.TeamName} ({team.Region})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex pb-3 text-3xl chalk-text px-2 items-center justify-center opacity-80">
            <Swords size={38} className="text-yellow-400" />
          </div>

          {/* Away Team */}
          <div className="flex flex-col flex-1 w-full gap-2">
            <label className="text-xl chalk-text font-semibold flex items-center gap-2">
              <Sparkles size={18} className="text-blue-400" />
              <span>Team 2 (Away)</span>
            </label>
            <select
              value={team2Id}
              onChange={(e) => setTeam2Id(e.target.value)}
              className="chalk-input p-3.5 text-lg w-full"
            >
              <option value="" disabled className="text-gray-900 bg-gray-200">Select Team...</option>
              {enrichedTeams.map((team) => (
                <option key={team.TeamID} value={team.TeamID} className="text-gray-900 bg-gray-100">
                  #{team.Seed} {team.TeamName} ({team.Region})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handlePredict}
          className="chalk-button px-9 py-3.5 text-xl font-bold flex items-center gap-3 mb-8 shadow-lg bg-yellow-400/20 text-yellow-300 border-yellow-400/60 hover:bg-yellow-400/30"
        >
          <Calculator size={28} />
          PREDICT MATCHUP
        </button>

        {/* Prediction Results Component */}
        {prediction && (
          <div className="chalk-border p-6 w-full max-w-2xl bg-black/30 animate-fade-in relative">
            <h2 className="text-3xl text-center chalk-text mb-4 flex justify-center items-center gap-3 text-yellow-300">
              <Trophy className="text-yellow-400" size={32} />
              <span>{prediction.winner.TeamName} Favored!</span>
              <Trophy className="text-yellow-400" size={32} />
            </h2>

            {/* Win Probability Bar */}
            <div className="w-full bg-black/50 h-7 rounded-full overflow-hidden mb-6 flex border border-white/30 font-mono">
              <div
                style={{ width: `${(prediction.probTeam1 * 100).toFixed(1)}%` }}
                className="bg-emerald-600/80 text-xs text-white flex items-center justify-center font-bold transition-all duration-500"
              >
                {prediction.team1.TeamName}: {(prediction.probTeam1 * 100).toFixed(1)}%
              </div>
              <div
                style={{ width: `${(prediction.probTeam2 * 100).toFixed(1)}%` }}
                className="bg-blue-600/80 text-xs text-white flex items-center justify-center font-bold transition-all duration-500"
              >
                {prediction.team2.TeamName}: {(prediction.probTeam2 * 100).toFixed(1)}%
              </div>
            </div>

            {/* 3-Column Team Breakdown */}
            <div className="flex flex-col space-y-3 text-lg md:text-xl chalk-text">
              <div className="grid grid-cols-12 text-xs uppercase tracking-wider text-white/50 pb-1 border-b border-white/10 font-sans">
                <span className="col-span-6">Team</span>
                <span className="col-span-3 text-center">Elo Rating</span>
                <span className="col-span-3 text-right">Win Prob</span>
              </div>

              <div className="grid grid-cols-12 items-center border-b border-white/10 pb-2">
                <span className="col-span-6 font-semibold">{prediction.team1.TeamName}</span>
                <span className="col-span-3 text-center font-mono opacity-90">{prediction.team1.Rating}</span>
                <span className="col-span-3 text-right font-mono font-bold text-emerald-300">{(prediction.probTeam1 * 100).toFixed(1)}%</span>
              </div>

              <div className="grid grid-cols-12 items-center border-b border-white/10 pb-2">
                <span className="col-span-6 font-semibold">{prediction.team2.TeamName}</span>
                <span className="col-span-3 text-center font-mono opacity-90">{prediction.team2.Rating}</span>
                <span className="col-span-3 text-right font-mono font-bold text-blue-300">{(prediction.probTeam2 * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Informative Stats Breakdown */}
            <div className="grid grid-cols-2 gap-4 pt-4 text-base md:text-lg opacity-90">
              <div className="flex flex-col bg-white/5 p-3 rounded border border-white/10">
                <span className="text-xs uppercase tracking-wider text-white/60">Expected Point Spread</span>
                <span className="font-bold text-lg text-emerald-300">
                  {prediction.winner.TeamName} <span className="font-mono">-{prediction.spread.toFixed(1)}</span> pts
                </span>
              </div>
              <div className="flex flex-col bg-white/5 p-3 rounded border border-white/10">
                <span className="text-xs uppercase tracking-wider text-white/60">Matchup Confidence</span>
                <span className="font-bold text-lg text-yellow-300">
                  {prediction.confidence}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
