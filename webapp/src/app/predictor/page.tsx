"use client";

import { useState, useEffect } from "react";
import { Trophy, Swords, Calculator, Calendar, MapPin, TrendingUp, CheckCircle2, XCircle, Sparkles, ExternalLink, ChevronDown } from "lucide-react";
import Link from "next/link";
import { TeamState, PredictionResult, MatchRecord } from "../../lib/types";

export default function MatchupPredictorPage() {
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
  const [historicalMatch, setHistoricalMatch] = useState<MatchRecord | null>(null);

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

  // Check for Ground-Truth Real Historical Match in Dataset (LR Results Analysis)
  useEffect(() => {
    if (season1 === season2 && team1Name && team2Name && team1Name !== team2Name) {
      fetch(`/api/matches?lookup=1&team1=${encodeURIComponent(team1Name)}&team2=${encodeURIComponent(team2Name)}&season=${season1}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.found && data.match) {
            setHistoricalMatch(data.match);
          } else {
            setHistoricalMatch(null);
          }
        })
        .catch(() => setHistoricalMatch(null));
    } else {
      setHistoricalMatch(null);
    }
  }, [season1, season2, team1Name, team2Name]);

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
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 max-w-5xl mx-auto relative overflow-hidden">
      <div className="z-10 w-full flex flex-col items-center">

        {/* Header Title Banner */}
        <div className="chalk-border px-8 py-4 md:py-6 text-center max-w-[928px] w-full mx-auto mb-10 bg-black/40 relative flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px]">
          <h1 className="text-4xl md:text-6xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center flex-wrap gap-3">
            <Swords className="text-yellow-300" size={40} />
            <span>WHAT-IF PREDICTOR</span>
          </h1>

          <p className="text-lg md:text-xl chalk-text opacity-85 italic mt-3">
            Historical &ldquo;What-If&rdquo; Matchup Predictor &bull; Seasons 2003 - 2026
          </p>
        </div>

        {/* Home Court Selector Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4 bg-white/5 border border-white/15 px-6 py-3 rounded-2xl backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-2 text-white/90 font-medium text-sm md:text-base">
            <MapPin size={18} className="text-amber-400" />
            <span className="font-bold">Home Court:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation(1)}
              className={`px-5 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                location === 1
                  ? "bg-teal-500/90 text-white border border-teal-300 shadow-md"
                  : "bg-black/40 text-white/70 hover:bg-white/10"
              }`}
            >
              Team 1 Home
            </button>

            <button
              onClick={() => setLocation(0)}
              className={`px-5 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                location === 0
                  ? "bg-slate-500/90 text-white border border-slate-300 shadow-md"
                  : "bg-black/40 text-white/70 hover:bg-white/10"
              }`}
            >
              Neutral Site
            </button>

            <button
              onClick={() => setLocation(-1)}
              className={`px-5 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                location === -1
                  ? "bg-blue-500/90 text-white border border-blue-300 shadow-md"
                  : "bg-black/40 text-white/70 hover:bg-white/10"
              }`}
            >
              Team 2 Home
            </button>
          </div>
        </div>

        {/* Team & Season Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-5 md:gap-6 w-full items-center mb-10">
          
          {/* TEAM 1 SELECTOR CARD (Teal) */}
          <div className="md:col-span-5 bg-teal-950/30 border border-teal-500/30 p-6 md:p-7 rounded-3xl flex flex-col gap-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-teal-500/20 pb-3">
              <span className="text-xl md:text-2xl font-bold chalk-text text-teal-300 flex items-center gap-2.5">
                <Trophy size={22} className="text-teal-400" />
                Team 1
              </span>

              {/* Season Selector */}
              <div className="flex items-center gap-2 bg-black/50 border border-white/20 px-3 py-1.5 rounded-xl">
                <Calendar size={16} className="text-teal-400" />
                <select
                  value={season1}
                  onChange={(e) => setSeason1(Number(e.target.value))}
                  className="bg-transparent text-sm font-mono font-bold text-teal-300 focus:outline-none cursor-pointer"
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
            <div className="flex flex-col gap-2 relative">
              <select
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                className="chalk-input appearance-none px-6 pr-12 py-3.5 text-base md:text-lg font-semibold w-full cursor-pointer rounded-xl"
              >
                {teams1.map((team) => (
                  <option key={team.TeamID} value={team.TeamName} className="text-gray-900 bg-gray-100">
                    {team.TeamName}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-white/70">
                <ChevronDown size={22} />
              </div>
            </div>

            {/* Team 1 Quick Stats Preview */}
            {teams1.length > 0 && team1Name && (() => {
              const selected = teams1.find(t => t.TeamName === team1Name);
              if (!selected) return null;
              return (
                <div className="grid grid-cols-3 gap-3 bg-black/40 p-3 rounded-2xl border border-white/10 text-center font-mono">
                  <div>
                    <span className="text-white/50 block text-[11px]">Win %</span>
                    <span className="font-bold text-teal-300 text-base">{(selected.team_win_pct * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[11px]">PPG</span>
                    <span className="font-bold text-white text-base">{selected.team_ppg.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[11px]">PAPG</span>
                    <span className="font-bold text-white text-base">{selected.team_papg.toFixed(1)}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* VS Divider */}
          <div className="md:col-span-1 flex items-center justify-center py-2">
            <div className="w-14 h-14 rounded-full bg-black/60 border border-white/30 flex items-center justify-center text-yellow-400 font-black font-mono shadow-lg">
              <Swords size={28} />
            </div>
          </div>

          {/* TEAM 2 SELECTOR CARD */}
          <div className="md:col-span-5 bg-blue-950/40 border border-blue-500/30 p-6 md:p-7 rounded-3xl flex flex-col gap-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <span className="text-xl md:text-2xl font-bold chalk-text text-blue-300 flex items-center gap-2.5">
                <Trophy size={22} className="text-blue-400" />
                Team 2
              </span>

              {/* Season Selector */}
              <div className="flex items-center gap-2 bg-black/50 border border-white/20 px-3 py-1.5 rounded-xl">
                <Calendar size={16} className="text-blue-400" />
                <select
                  value={season2}
                  onChange={(e) => setSeason2(Number(e.target.value))}
                  className="bg-transparent text-sm font-mono font-bold text-blue-300 focus:outline-none cursor-pointer"
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
            <div className="flex flex-col gap-2 relative">
              <select
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                className="chalk-input appearance-none px-6 pr-12 py-3.5 text-base md:text-lg font-semibold w-full cursor-pointer rounded-xl"
              >
                {teams2.map((team) => (
                  <option key={team.TeamID} value={team.TeamName} className="text-gray-900 bg-gray-100">
                    {team.TeamName}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-white/70">
                <ChevronDown size={22} />
              </div>
            </div>

            {/* Team 2 Quick Stats Preview */}
            {teams2.length > 0 && team2Name && (() => {
              const selected = teams2.find(t => t.TeamName === team2Name);
              if (!selected) return null;
              return (
                <div className="grid grid-cols-3 gap-3 bg-black/40 p-3 rounded-2xl border border-white/10 text-center font-mono">
                  <div>
                    <span className="text-white/50 block text-[11px]">Win %</span>
                    <span className="font-bold text-blue-300 text-base">{(selected.team_win_pct * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[11px]">PPG</span>
                    <span className="font-bold text-white text-base">{selected.team_ppg.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[11px]">PAPG</span>
                    <span className="font-bold text-white text-base">{selected.team_papg.toFixed(1)}</span>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>

        {/* Ground-Truth Historical Match Alert if available */}
        {historicalMatch && (
          <div className="w-full bg-emerald-950/40 border border-emerald-400/40 p-4 rounded-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Sparkles size={22} />
              </div>
              <div>
                <span className="text-xs uppercase font-mono font-bold text-amber-300 block">
                  Ground-Truth Matchup Found ({historicalMatch.season} Season &bull; Day {historicalMatch.dayNum})
                </span>
                <span className="text-sm text-white font-mono">
                  Actual Winner: <strong className="text-emerald-300">{historicalMatch.actualWinner}</strong> &bull; Model Predicted: <strong className="text-yellow-300">{historicalMatch.predictedWinner}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLocation(historicalMatch.location)}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                title="Apply court location from the real game"
              >
                Use Real Location ({historicalMatch.location === 1 ? "Team 1 Home" : historicalMatch.location === -1 ? "Team 2 Home" : "Neutral"})
              </button>
              <Link
                href={`/matches?team=${encodeURIComponent(historicalMatch.team1Name)}&day=${historicalMatch.dayNum}`}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/30 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>View in Match Analysis</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* Predict Action Button */}
        <button
          onClick={handlePredict}
          disabled={loading}
          className="chalk-button px-12 py-4 text-xl md:text-2xl font-black flex items-center gap-3 mb-10 shadow-2xl hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer tracking-wider rounded-2xl"
        >
          <Calculator size={30} className="text-yellow-400" />
          {loading ? "RUNNING ML INFERENCE..." : "PREDICT MATCHUP"}
        </button>

        {/* PREDICTION RESULTS SECTION */}
        {prediction && (
          <div className="chalk-border p-6 md:p-8 w-full bg-black/40 animate-fade-in relative shadow-2xl rounded-3xl">
            
            {/* Ground-Truth Evaluation Comparison (From LR Results Analysis) */}
            {historicalMatch && (
              <div
                className={`p-4 rounded-2xl mb-6 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md ${
                  historicalMatch.correct
                    ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                    : "bg-rose-950/60 border-rose-500/50 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  {historicalMatch.correct ? (
                    <CheckCircle2 size={32} className="text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={32} className="text-rose-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs uppercase font-mono font-bold block text-white/80">
                      Ground-Truth Evaluation (LR Results Analysis)
                    </span>
                    <span className="text-base font-bold text-white font-mono">
                      Actual Game Winner: <span className="text-amber-300">{historicalMatch.actualWinner}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className={`px-3 py-1 rounded-lg font-extrabold flex items-center gap-1 ${
                      historicalMatch.correct
                        ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400"
                        : "bg-rose-500/30 text-rose-200 border border-rose-400"
                    }`}
                  >
                    {historicalMatch.correct ? "✓ CORRECT PREDICTION" : "✗ UPSET / INCORRECT"}
                  </span>
                </div>
              </div>
            )}

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
                <span className="text-amber-400">
                  {prediction.team1.TeamName} {prediction.team1.Season}: {(prediction.probTeam1 * 100).toFixed(1)}%
                </span>
                <span className="text-blue-400">
                  {prediction.team2.TeamName} {prediction.team2.Season}: {(prediction.probTeam2 * 100).toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-black/60 h-8 rounded-full overflow-hidden flex border-2 border-white/20 font-mono shadow-inner">
                <div
                  style={{ width: `${(prediction.probTeam1 * 100).toFixed(1)}%` }}
                  className="bg-gradient-to-r from-amber-500 to-orange-400 text-sm text-black flex items-center justify-center font-extrabold transition-all duration-700"
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
                <span className="font-extrabold text-xl text-yellow-300 mt-1">
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
                <TrendingUp size={20} className="text-amber-400" />
                Top Model Predictive Factors
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                {prediction.keyFactors.slice(0, 6).map((factor) => {
                  const isPositiveT1 = factor.impact > 0;
                  return (
                    <div key={factor.featureName} className="bg-black/40 p-2.5 rounded-lg border border-white/10 flex justify-between items-center">
                      <span className="text-white/80">{factor.label}</span>
                      <span className={`font-bold ${isPositiveT1 ? "text-amber-400" : "text-blue-400"}`}>
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
                      <th className="p-3 text-center text-amber-400">{prediction.team1.TeamName} ({prediction.team1.Season})</th>
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
