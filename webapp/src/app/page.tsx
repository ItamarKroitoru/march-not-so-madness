"use client";

import { useState, useEffect } from "react";
import { Trophy, Swords, Calculator, Calendar, MapPin, Sparkles, TrendingUp } from "lucide-react";
import { TeamState, PredictionResult } from "../lib/types";

export default function Home() {
  const [seasons, setSeasons] = useState<number[]>([]);
  
  // Team 1 Selection
  const [season1, setSeason1] = useState<number>(2026);
  const [teams1, setTeams1] = useState<TeamState[]>([]);
  const [team1Name, setTeam1Name] = useState<string>("");

  // Team 2 Selection
  const [season2, setSeason2] = useState<number>(2026);
  const [teams2, setTeams2] = useState<TeamState[]>([]);
  const [team2Name, setTeam2Name] = useState<string>("");

  // Matchup Location Parameter: 1 = Team 1 Home, 0 = Neutral, -1 = Team 1 Away
  const [location, setLocation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  // Load Seasons on Mount
  useEffect(() => {
    fetch("/api/seasons")
      .then((res) => res.json())
      .then((data) => {
        if (data.seasons && data.seasons.length > 0) {
          setSeasons(data.seasons);
        }
      })
      .catch((err) => console.error("Failed to load seasons:", err));
  }, []);

  // Fetch Teams for Season 1
  useEffect(() => {
    fetch(`/api/teams?season=${season1}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.teams) {
          setTeams1(data.teams);
          if (data.teams.length > 0) {
            setTeam1Name(data.teams[0].TeamName);
          }
        }
      })
      .catch((err) => console.error("Failed to load season 1 teams:", err));
  }, [season1]);

  // Fetch Teams for Season 2
  useEffect(() => {
    fetch(`/api/teams?season=${season2}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.teams) {
          setTeams2(data.teams);
          if (data.teams.length > 0) {
            setTeam2Name(data.teams[data.teams.length > 1 ? 1 : 0].TeamName);
          }
        }
      })
      .catch((err) => console.error("Failed to load season 2 teams:", err));
  }, [season2]);

  const handlePredict = async () => {
    if (!team1Name || !team2Name) {
      alert("Please select both teams!");
      return;
    }

    if (season1 === season2 && team1Name === team2Name) {
      alert("Please select two different teams or different seasons!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team1Name,
          team1Season: season1,
          team2Name,
          team2Season: season2,
          location,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPrediction(data);
      } else {
        alert(data.error || "Failed to make prediction");
      }
    } catch (err) {
      console.error("Prediction request failed:", err);
      alert("An error occurred while making prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 pt-4 md:pt-6 relative overflow-hidden">
      <div className="z-10 max-w-5xl w-full flex flex-col items-center">

        {/* Header Title Banner */}
        <div className="chalk-border px-6 py-5 md:py-6 text-center w-full mb-6 bg-black/40 relative">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Sparkles className="text-yellow-400" size={20} />
            <span className="text-xs font-mono tracking-widest text-emerald-400 font-bold uppercase">
              Multi-Season ML Logistic Predictor Engine
            </span>
            <Sparkles className="text-yellow-400" size={20} />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center flex-wrap gap-2">
            <span>NCAA MARCH</span>
            <span className="text-xl md:text-2xl opacity-80 font-normal italic lowercase border-b-2 border-white/40 px-2 py-0.5 my-0.5 bg-white/5 rounded">
              not so
            </span>
            <span>MADNESS</span>
          </h1>

          <p className="text-base md:text-lg chalk-text opacity-85 italic mt-1.5">
            Historical &ldquo;What-If&rdquo; Matchup Predictor (2003 &ndash; 2026)
          </p>
        </div>

        {/* Home Court Selector Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 bg-white/5 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-1.5 text-white/90 font-medium text-xs md:text-sm">
            <MapPin size={16} className="text-amber-400" />
            <span className="font-bold">Home Court:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLocation(1)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                location === 1
                  ? "bg-emerald-500/90 text-black border border-emerald-300 shadow-md"
                  : "bg-black/40 text-white/70 hover:bg-white/10"
              }`}
            >
              Team 1
            </button>

            <button
              onClick={() => setLocation(0)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                location === 0
                  ? "bg-amber-500/90 text-black border border-amber-300 shadow-md"
                  : "bg-black/40 text-white/70 hover:bg-white/10"
              }`}
            >
              Neutral
            </button>

            <button
              onClick={() => setLocation(-1)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                location === -1
                  ? "bg-blue-500/90 text-white border border-blue-300 shadow-md"
                  : "bg-black/40 text-white/70 hover:bg-white/10"
              }`}
            >
              Team 2
            </button>
          </div>
        </div>

        {/* Team & Season Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 md:gap-5 w-full items-center mb-8">
          
          {/* TEAM 1 SELECTOR CARD */}
          <div className="md:col-span-5 bg-emerald-950/40 border border-emerald-500/30 p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <span className="text-lg font-bold chalk-text text-emerald-300 flex items-center gap-2">
                <Trophy size={18} className="text-emerald-400" />
                Team 1 {location === 1 ? "(Home)" : location === -1 ? "(Away)" : "(Neutral)"}
              </span>

              {/* Season Selector */}
              <div className="flex items-center gap-1.5 bg-black/50 border border-white/20 px-2.5 py-1 rounded-lg">
                <Calendar size={14} className="text-emerald-400" />
                <select
                  value={season1}
                  onChange={(e) => setSeason1(Number(e.target.value))}
                  className="bg-transparent text-xs font-mono font-bold text-emerald-300 focus:outline-none cursor-pointer"
                >
                  {seasons.map((yr) => (
                    <option key={yr} value={yr} className="bg-slate-900 text-white">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Team Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/60 font-mono">Select Team 1 ({season1}):</label>
              <select
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                className="chalk-input p-3 text-base font-semibold w-full cursor-pointer"
              >
                {teams1.map((team) => (
                  <option key={team.TeamID} value={team.TeamName} className="text-gray-900 bg-gray-100">
                    {team.TeamName} ({team.team_wins}-{team.team_losses})
                  </option>
                ))}
              </select>
            </div>

            {/* Team 1 Quick Stats Preview */}
            {teams1.length > 0 && team1Name && (() => {
              const selected = teams1.find(t => t.TeamName === team1Name);
              if (!selected) return null;
              return (
                <div className="grid grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-xl border border-white/10 text-center text-xs font-mono">
                  <div>
                    <span className="text-white/50 block text-[10px]">Win %</span>
                    <span className="font-bold text-emerald-300 text-sm">{(selected.team_win_pct * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[10px]">PPG</span>
                    <span className="font-bold text-white text-sm">{selected.team_ppg.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[10px]">PAPG</span>
                    <span className="font-bold text-white text-sm">{selected.team_papg.toFixed(1)}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* VS Divider */}
          <div className="md:col-span-1 flex items-center justify-center py-2">
            <div className="w-12 h-12 rounded-full bg-black/60 border border-white/30 flex items-center justify-center text-yellow-400 font-black font-mono shadow-lg">
              <Swords size={24} />
            </div>
          </div>

          {/* TEAM 2 SELECTOR CARD */}
          <div className="md:col-span-5 bg-blue-950/40 border border-blue-500/30 p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
              <span className="text-lg font-bold chalk-text text-blue-300 flex items-center gap-2">
                <Trophy size={18} className="text-blue-400" />
                Team 2 {location === 1 ? "(Away)" : location === -1 ? "(Home)" : "(Neutral)"}
              </span>

              {/* Season Selector */}
              <div className="flex items-center gap-1.5 bg-black/50 border border-white/20 px-2.5 py-1 rounded-lg">
                <Calendar size={14} className="text-blue-400" />
                <select
                  value={season2}
                  onChange={(e) => setSeason2(Number(e.target.value))}
                  className="bg-transparent text-xs font-mono font-bold text-blue-300 focus:outline-none cursor-pointer"
                >
                  {seasons.map((yr) => (
                    <option key={yr} value={yr} className="bg-slate-900 text-white">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Team Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/60 font-mono">Select Team 2 ({season2}):</label>
              <select
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                className="chalk-input p-3 text-base font-semibold w-full cursor-pointer"
              >
                {teams2.map((team) => (
                  <option key={team.TeamID} value={team.TeamName} className="text-gray-900 bg-gray-100">
                    {team.TeamName} ({team.team_wins}-{team.team_losses})
                  </option>
                ))}
              </select>
            </div>

            {/* Team 2 Quick Stats Preview */}
            {teams2.length > 0 && team2Name && (() => {
              const selected = teams2.find(t => t.TeamName === team2Name);
              if (!selected) return null;
              return (
                <div className="grid grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-xl border border-white/10 text-center text-xs font-mono">
                  <div>
                    <span className="text-white/50 block text-[10px]">Win %</span>
                    <span className="font-bold text-blue-300 text-sm">{(selected.team_win_pct * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[10px]">PPG</span>
                    <span className="font-bold text-white text-sm">{selected.team_ppg.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[10px]">PAPG</span>
                    <span className="font-bold text-white text-sm">{selected.team_papg.toFixed(1)}</span>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>

        {/* Predict Action Button */}
        <button
          onClick={handlePredict}
          disabled={loading}
          className="chalk-button px-10 py-3.5 text-xl font-extrabold flex items-center gap-3 mb-10 shadow-xl hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer tracking-wider"
        >
          <Calculator size={28} className="text-yellow-400" />
          {loading ? "RUNNING ML INFERENCE..." : "PREDICT MATCHUP"}
        </button>

        {/* PREDICTION RESULTS SECTION */}
        {prediction && (
          <div className="chalk-border p-6 md:p-8 w-full bg-black/40 animate-fade-in relative shadow-2xl rounded-3xl">
            
            {/* WINNER HEADER */}
            <div className="text-center border-b border-white/15 pb-6 mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
                Predicted Winner: {prediction.winner.TeamName} ({prediction.winner.Season})
              </span>

              <h2 className="text-3xl md:text-5xl font-black text-amber-300 chalk-text flex items-center justify-center gap-3 my-2">
                <Trophy className="text-yellow-400 animate-bounce" size={40} />
                <span>{prediction.winner.TeamName} ({prediction.winner.Season})</span>
                <Trophy className="text-yellow-400 animate-bounce" size={40} />
              </h2>

              <p className="text-sm font-mono text-white/70">
                {prediction.team1.TeamName} {prediction.team1.Season} vs {prediction.team2.TeamName} {prediction.team2.Season} &bull;{" "}
                <span className="text-yellow-200">
                  {prediction.location === 1 ? `${prediction.team1.TeamName} Home` : prediction.location === -1 ? `${prediction.team2.TeamName} Home` : "Neutral Site"}
                </span>
              </p>
            </div>

            {/* MODEL ESTIMATED WIN PROBABILITY BAR */}
            <div className="mb-8">
              <span className="text-xs uppercase font-mono tracking-wider text-white/60 block mb-2 text-center">
                Model-Estimated Win Probability
              </span>

              <div className="flex justify-between items-center text-sm font-mono font-bold mb-2">
                <span className="text-emerald-400">
                  {prediction.team1.TeamName} {prediction.team1.Season}: {(prediction.probTeam1 * 100).toFixed(1)}%
                </span>
                <span className="text-blue-400">
                  {prediction.team2.TeamName} {prediction.team2.Season}: {(prediction.probTeam2 * 100).toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-black/60 h-8 rounded-full overflow-hidden flex border-2 border-white/20 font-mono shadow-inner">
                <div
                  style={{ width: `${(prediction.probTeam1 * 100).toFixed(1)}%` }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-sm text-white flex items-center justify-center font-extrabold transition-all duration-700"
                >
                  {(prediction.probTeam1 * 100).toFixed(1)}%
                </div>
                <div
                  style={{ width: `${(prediction.probTeam2 * 100).toFixed(1)}%` }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-sm text-white flex items-center justify-center font-extrabold transition-all duration-700"
                >
                  {(prediction.probTeam2 * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* 2-COLUMN SUMMARY METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col">
                <span className="text-xs uppercase font-mono tracking-wider text-white/60">Expected Point Spread</span>
                <span className="font-extrabold text-xl text-emerald-300 mt-1">
                  {prediction.winner.TeamName} <span className="font-mono text-amber-300">-{prediction.spread.toFixed(1)} pts</span>
                </span>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col">
                <span className="text-xs uppercase font-mono tracking-wider text-white/60">Matchup Confidence Level</span>
                <span className="font-extrabold text-xl text-yellow-300 mt-1">
                  {prediction.confidence}
                </span>
              </div>
            </div>

            {/* KEY PREDICTIVE FACTORS (ML IMPORTS) */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 mb-8">
              <h3 className="text-lg font-bold chalk-text text-amber-300 mb-3 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-400" />
                Top Model Predictive Factors
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                {prediction.keyFactors.slice(0, 6).map((factor) => {
                  const isPositiveT1 = factor.impact > 0;
                  return (
                    <div key={factor.featureName} className="bg-black/40 p-2.5 rounded-lg border border-white/10 flex justify-between items-center">
                      <span className="text-white/80">{factor.label}</span>
                      <span className={`font-bold ${isPositiveT1 ? "text-emerald-400" : "text-blue-400"}`}>
                        {isPositiveT1 ? `+${factor.diff.toFixed(2)} (Favors ${prediction.team1.TeamName})` : `${factor.diff.toFixed(2)} (Favors ${prediction.team2.TeamName})`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STATISTICAL COMPARISON TABLE */}
            <div>
              <h3 className="text-lg font-bold chalk-text text-white mb-3">Side-by-Side Stat Comparison</h3>

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30">
                <table className="w-full text-xs md:text-sm font-mono text-left">
                  <thead className="bg-white/10 text-white/70 uppercase border-b border-white/10">
                    <tr>
                      <th className="p-3">Stat Metric</th>
                      <th className="p-3 text-center text-emerald-400">{prediction.team1.TeamName} ({prediction.team1.Season})</th>
                      <th className="p-3 text-center text-blue-400">{prediction.team2.TeamName} ({prediction.team2.Season})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="p-3 text-white/80 font-bold">Season Record</td>
                      <td className="p-3 text-center font-bold">{prediction.team1.team_wins}-{prediction.team1.team_losses} ({(prediction.team1.team_win_pct * 100).toFixed(1)}%)</td>
                      <td className="p-3 text-center font-bold">{prediction.team2.team_wins}-{prediction.team2.team_losses} ({(prediction.team2.team_win_pct * 100).toFixed(1)}%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white/80 font-bold">Points Per Game (PPG)</td>
                      <td className="p-3 text-center">{prediction.team1.team_ppg.toFixed(1)}</td>
                      <td className="p-3 text-center">{prediction.team2.team_ppg.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white/80 font-bold">Points Allowed / Game (PAPG)</td>
                      <td className="p-3 text-center">{prediction.team1.team_papg.toFixed(1)}</td>
                      <td className="p-3 text-center">{prediction.team2.team_papg.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white/80 font-bold">Field Goal % (FG%)</td>
                      <td className="p-3 text-center">{(prediction.team1.team_fg_pct * 100).toFixed(1)}%</td>
                      <td className="p-3 text-center">{(prediction.team2.team_fg_pct * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white/80 font-bold">3-Point FG %</td>
                      <td className="p-3 text-center">{(prediction.team1.team_fg3_pct * 100).toFixed(1)}%</td>
                      <td className="p-3 text-center">{(prediction.team2.team_fg3_pct * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white/80 font-bold">Last 5 Games Win %</td>
                      <td className="p-3 text-center">{(prediction.team1.team_last_5_win_pct * 100).toFixed(1)}%</td>
                      <td className="p-3 text-center">{(prediction.team2.team_last_5_win_pct * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white/80 font-bold">Opponent Strength (Win %)</td>
                      <td className="p-3 text-center">{(prediction.team1.team_avg_opponent_win_pct * 100).toFixed(1)}%</td>
                      <td className="p-3 text-center">{(prediction.team2.team_avg_opponent_win_pct * 100).toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
