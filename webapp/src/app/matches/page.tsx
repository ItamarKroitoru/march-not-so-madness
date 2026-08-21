"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Swords,
  Trophy,
  CheckCircle2,
  Calendar,
  Flame,
  ChevronLeft,
  ChevronRight,
  Play,
  Zap,
  Activity,
} from "lucide-react";
import { MatchRecord, DailyPerformance } from "@/lib/types";

export default function MatchesAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [dailyPerformance, setDailyPerformance] = useState<DailyPerformance[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  // Step 1: Selected Day of Season
  const [selectedDay, setSelectedDay] = useState<number>(2);

  // Step 2: Selected Match
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);

  // Step 4 & 5: Simulation state
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simQuarter, setSimQuarter] = useState<string>("Pre-Game Warmup");
  const [matchRevealed, setMatchRevealed] = useState<boolean>(false);

  // Load all 2026 matches on mount
  useEffect(() => {
    fetch("/api/matches?limit=6000")
      .then((res) => res.json())
      .then((data) => {
        if (data.dailyPerformance) {
          setDailyPerformance(data.dailyPerformance);
          if (data.dailyPerformance.length > 0) {
            setSelectedDay(data.dailyPerformance[0].dayNum);
          }
        }
        if (data.matches && data.matches.length > 0) {
          setMatches(data.matches);
          // Set default selected match to first game on initial day
          const initialDayGames = data.matches.filter((m: MatchRecord) => m.dayNum === (data.dailyPerformance[0]?.dayNum || 2));
          if (initialDayGames.length > 0) {
            setSelectedMatch(initialDayGames[0]);
          }
        }
      })
      .catch((err) => console.error("Failed to load matches data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Available days with games
  const availableDays = useMemo(() => {
    return dailyPerformance.map((d) => d.dayNum);
  }, [dailyPerformance]);

  // Matches on the currently selected day
  const dayMatches = useMemo(() => {
    return matches.filter((m) => m.dayNum === selectedDay);
  }, [matches, selectedDay]);

  // When day changes, auto-select the first match of that day and reset reveal
  const handleDayChange = (newDay: number) => {
    setSelectedDay(newDay);
    setMatchRevealed(false);
    setSimulating(false);
    const firstGame = matches.find((m) => m.dayNum === newDay);
    if (firstGame) {
      setSelectedMatch(firstGame);
    } else {
      setSelectedMatch(null);
    }
  };

  // Select a match
  const handleSelectMatch = (match: MatchRecord) => {
    setSelectedMatch(match);
    setMatchRevealed(false);
    setSimulating(false);
  };

  // Step 4: Run Game Simulation Animation
  const handleSimulateGame = () => {
    if (!selectedMatch) return;
    setSimulating(true);
    setSimProgress(0);
    setMatchRevealed(false);

    const phases = [
      { progress: 15, text: "🏀 1st Half: Opening Tip-off & Fastbreak Runs..." },
      { progress: 40, text: "🔥 1st Half: Defensive Stops & 3-Point Battles..." },
      { progress: 60, text: "⏸️ Halftime Adjustments & Coaching Talk..." },
      { progress: 80, text: "⚡ 2nd Half: Clutch Free Throws & Lead Changes..." },
      { progress: 95, text: "🚨 Final 30 Seconds: Pressure Possession..." },
      { progress: 100, text: "🏁 FINAL BUZZER!" },
    ];

    let currentPhase = 0;
    const interval = setInterval(() => {
      if (currentPhase < phases.length) {
        setSimProgress(phases[currentPhase].progress);
        setSimQuarter(phases[currentPhase].text);
        currentPhase++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setSimulating(false);
          setMatchRevealed(true);
        }, 500);
      }
    }, 450);
  };

  // Key stats for comparison
  const t1Stats = selectedMatch?.team1Stats;
  const t2Stats = selectedMatch?.team2Stats;

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 max-w-6xl mx-auto">
        <div className="chalk-border p-12 bg-black/60 rounded-3xl text-center font-mono shadow-2xl">
          <div className="animate-spin w-10 h-10 border-4 border-yellow-300 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg text-white font-bold">Loading 2026 Match Simulator Data...</p>
          <p className="text-xs text-white/50 mt-1">Replaying pre-game states &amp; ML inference weights...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 max-w-6xl mx-auto relative overflow-hidden">
      
      {/* Header Banner */}
      <div className="chalk-border px-6 md:px-8 py-5 text-center max-w-4xl w-full mx-auto mb-8 bg-black/40 relative flex flex-col items-center justify-center min-h-[130px] shadow-2xl">
        <h1 className="text-3xl md:text-5xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center flex-wrap gap-3">
          <Swords className="text-yellow-300" size={36} />
          <span>MATCH SIMULATOR &amp; ANALYSIS</span>
        </h1>
        <div className="mt-5 flex flex-col items-center gap-2 font-mono">
          <span className="text-amber-300 font-bold chalk-text text-lg md:text-2xl tracking-wide uppercase">
            Live Next-Season Workflow Demo:
          </span>
          <div className="flex flex-col items-center gap-1.5 text-sm md:text-lg font-bold text-amber-100/90 mt-1">
            <span className="bg-black/60 px-5 py-1.5 rounded-xl border border-white/15 shadow">
              1. Select Date
            </span>
            <span className="text-yellow-400 font-black text-base">↓</span>
            <span className="bg-black/60 px-5 py-1.5 rounded-xl border border-white/15 shadow">
              2. Pick Matchup
            </span>
            <span className="text-yellow-400 font-black text-base">↓</span>
            <span className="bg-black/60 px-5 py-1.5 rounded-xl border border-white/15 shadow">
              3. Pre-Game ML Prediction
            </span>
            <span className="text-yellow-400 font-black text-base">↓</span>
            <span className="bg-black/60 px-5 py-1.5 rounded-xl border border-white/15 shadow">
              4. Play Game
            </span>
            <span className="text-yellow-400 font-black text-base">↓</span>
            <span className="bg-black/60 px-5 py-1.5 rounded-xl border border-white/15 shadow text-emerald-300">
              5. Ground-Truth Reveal
            </span>
          </div>
        </div>
      </div>

      {/* STEP 1: DATE / DAY SELECTOR BAR */}
      <div className="chalk-border p-5 w-full bg-black/50 mb-8 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <span className="text-xs uppercase font-mono text-amber-400 font-bold tracking-wider block">
                Step 1 &bull; Season 2026 Game Day
              </span>
              <h2 className="text-xl md:text-2xl font-bold chalk-text text-white">
                Select Date of the Season
              </h2>
            </div>
          </div>

          {/* Quick Date Stepper and Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                const idx = availableDays.indexOf(selectedDay);
                if (idx > 0) handleDayChange(availableDays[idx - 1]);
              }}
              disabled={availableDays.indexOf(selectedDay) <= 0}
              className="p-2 bg-black/60 border border-white/20 rounded-xl disabled:opacity-30 hover:bg-white/10 text-white cursor-pointer"
              title="Previous Date"
            >
              <ChevronLeft size={20} />
            </button>

            <select
              value={selectedDay}
              onChange={(e) => handleDayChange(Number(e.target.value))}
              className="chalk-input py-2.5 px-4 text-sm md:text-base font-mono font-bold rounded-xl bg-black/70 border border-white/30 text-yellow-300 cursor-pointer flex-1 md:flex-none"
            >
              {availableDays.map((d) => {
                const count = matches.filter((m) => m.dayNum === d).length;
                return (
                  <option key={d} value={d} className="bg-zinc-900 text-white">
                    Day {d} &bull; {count} {count === 1 ? "match" : "matches"}
                  </option>
                );
              })}
            </select>

            <button
              onClick={() => {
                const idx = availableDays.indexOf(selectedDay);
                if (idx >= 0 && idx < availableDays.length - 1) handleDayChange(availableDays[idx + 1]);
              }}
              disabled={availableDays.indexOf(selectedDay) >= availableDays.length - 1}
              className="p-2 bg-black/60 border border-white/20 rounded-xl disabled:opacity-30 hover:bg-white/10 text-white cursor-pointer"
              title="Next Date"
            >
              <ChevronRight size={20} />
            </button>
          </div>

        </div>

        {/* Quick Date Highlights Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs font-mono">
          <span className="text-white/50">Quick Jumps:</span>
          {[
            { label: "Opening Games", day: 2 },
            { label: "Early Season", day: 15 },
            { label: "Mid-Season", day: 65 },
            { label: "Rivalry Week", day: 100 },
            { label: "Tourney Week", day: 130 },
          ].map((preset) => (
            <button
              key={preset.day}
              onClick={() => handleDayChange(preset.day)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedDay === preset.day
                  ? "bg-amber-400 text-black font-bold"
                  : "bg-white/5 text-white/70 hover:bg-white/15"
              }`}
            >
              {preset.label} (Day {preset.day})
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2: MATCH SELECTOR FOR THIS DAY */}
      <div className="chalk-border p-5 w-full bg-black/50 mb-8 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
              <Swords size={20} />
            </div>
            <div>
              <span className="text-xs uppercase font-mono text-blue-300 font-bold tracking-wider block">
                Step 2 &bull; Matchups on Day {selectedDay} ({dayMatches.length} Games)
              </span>
              <h2 className="text-xl md:text-2xl font-bold chalk-text text-white">
                Pick a Match Scheduled for This Day
              </h2>
            </div>
          </div>
        </div>

        {/* Matchup horizontal scroller / grid */}
        {dayMatches.length === 0 ? (
          <div className="p-8 text-center text-white/60 font-mono">No matches found for Day {selectedDay}.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
            {dayMatches.map((m) => {
              const isSelected = selectedMatch?.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMatch(m)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-400/20 border-yellow-300 ring-2 ring-yellow-400 shadow-lg"
                      : "bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-white/60 text-[11px]">{m.locationLabel}</span>
                    {isSelected && (
                      <span className="bg-yellow-400 text-black font-bold text-[10px] px-1.5 py-0.5 rounded">
                        SELECTED
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-sm text-white">
                    <div className="flex justify-between items-center py-0.5">
                      <span>{m.team1Name}</span>
                      <span className="text-xs font-mono text-white/50">{m.team1Stats?.record}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 text-white/90">
                      <span>{m.team2Name}</span>
                      <span className="text-xs font-mono text-white/50">{m.team2Stats?.record}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* STEP 3 & 4 & 5: PRE-GAME PREDICTION, SIMULATION & REVEAL SECTION */}
      {selectedMatch && (
        <div className="chalk-border p-6 md:p-8 w-full bg-black/60 rounded-3xl shadow-2xl relative mb-12">
          
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
            <div>
              <span className="text-xs uppercase font-mono text-emerald-400 font-bold tracking-wider block">
                Step 3 &bull; Pre-Game Model Inference (Zero-Leakage State)
              </span>
              <h2 className="text-2xl md:text-4xl font-bold chalk-text text-white mt-1">
                {selectedMatch.team1Name} vs {selectedMatch.team2Name}
              </h2>
            </div>
            <span className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-xl text-white/80 border border-white/15">
              {selectedMatch.locationLabel} &bull; Day {selectedMatch.dayNum}
            </span>
          </div>

          {/* PRE-GAME MODEL PREDICTION CARD */}
          <div className="bg-emerald-950/30 border border-emerald-500/40 p-6 rounded-3xl mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                  ML Model Predicted Winner
                </span>
                <h3 className="text-2xl md:text-4xl font-extrabold text-amber-300 chalk-text flex items-center gap-2">
                  <Trophy className="text-yellow-400" size={32} />
                  <span>{selectedMatch.predictedWinner}</span>
                </h3>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="bg-black/60 px-3 py-1.5 rounded-xl border border-white/15 text-white/80">
                  Confidence: <strong className="text-yellow-300">{selectedMatch.confidence}</strong>
                </span>
                {selectedMatch.spread && (
                  <span className="bg-black/60 px-3 py-1.5 rounded-xl border border-white/15 text-white/80">
                    Est. Margin: <strong className="text-emerald-400">~{selectedMatch.spread} pts</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Model Estimated Win Probability Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-sm font-mono font-bold mb-2">
                <span className="text-emerald-400">
                  {selectedMatch.team1Name}: {(selectedMatch.probTeam1 * 100).toFixed(1)}%
                </span>
                <span className="text-blue-400">
                  {selectedMatch.team2Name}: {(selectedMatch.probTeam2 * 100).toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-black/60 h-8 rounded-full overflow-hidden flex border-2 border-white/20 font-mono shadow-inner">
                <div
                  style={{ width: `${(selectedMatch.probTeam1 * 100).toFixed(1)}%` }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-sm text-white flex items-center justify-center font-extrabold transition-all duration-700"
                >
                  {(selectedMatch.probTeam1 * 100).toFixed(1)}%
                </div>
                <div
                  style={{ width: `${(selectedMatch.probTeam2 * 100).toFixed(1)}%` }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-sm text-white flex items-center justify-center font-extrabold transition-all duration-700"
                >
                  {(selectedMatch.probTeam2 * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* PRE-GAME TEAM STATS SIDE-BY-SIDE */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
              <table className="w-full text-xs md:text-sm font-mono text-left">
                <thead className="bg-white/10 text-white/70 uppercase border-b border-white/10">
                  <tr>
                    <th className="p-3">Pre-Game Stat (Up to Day {selectedMatch.dayNum})</th>
                    <th className="p-3 text-center text-emerald-400">{selectedMatch.team1Name}</th>
                    <th className="p-3 text-center text-blue-400">{selectedMatch.team2Name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 text-white/80 font-bold">Season Record Before Game</td>
                    <td className="p-3 text-center font-bold">{t1Stats?.record || "—"} ({t1Stats?.winPct}%)</td>
                    <td className="p-3 text-center font-bold">{t2Stats?.record || "—"} ({t2Stats?.winPct}%)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-white/80 font-bold">Points Per Game (PPG)</td>
                    <td className="p-3 text-center">{t1Stats?.ppg || "—"}</td>
                    <td className="p-3 text-center">{t2Stats?.ppg || "—"}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-white/80 font-bold">Points Allowed / Game (PAPG)</td>
                    <td className="p-3 text-center">{t1Stats?.papg || "—"}</td>
                    <td className="p-3 text-center">{t2Stats?.papg || "—"}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-white/80 font-bold">Field Goal % (FG%)</td>
                    <td className="p-3 text-center">{t1Stats?.fgPct}%</td>
                    <td className="p-3 text-center">{t2Stats?.fgPct}%</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-white/80 font-bold">Current Streak</td>
                    <td className="p-3 text-center text-emerald-300 font-bold">{t1Stats?.streak || "—"}</td>
                    <td className="p-3 text-center text-blue-300 font-bold">{t2Stats?.streak || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* STEP 4: LIVE GAME SIMULATION ANIMATION CONTAINER */}
          <div className="flex flex-col items-center justify-center my-6">
            {!simulating && !matchRevealed && (
              <button
                onClick={handleSimulateGame}
                className="chalk-button px-10 py-4 text-xl md:text-2xl font-black flex items-center gap-3 shadow-2xl hover:scale-105 transition-all cursor-pointer rounded-2xl bg-amber-400 text-black border border-amber-300"
              >
                <Play size={28} className="fill-black" />
                <span>STEP 4: PLAY &amp; SIMULATE MATCH</span>
              </button>
            )}

            {/* LIVE MATCH IN PROGRESS ANIMATION */}
            {simulating && (
              <div className="w-full bg-gradient-to-r from-zinc-950 via-black to-zinc-950 border-2 border-yellow-400/80 p-8 rounded-3xl shadow-2xl animate-fade-in text-center flex flex-col items-center">
                
                <div className="flex items-center gap-3 text-yellow-300 font-mono text-sm md:text-base font-extrabold uppercase tracking-widest mb-4">
                  <Activity size={24} className="animate-spin text-yellow-400" />
                  <span>GAME IN PROGRESS &bull; LIVE COURT SIMULATION</span>
                  <Zap size={24} className="animate-bounce text-amber-400" />
                </div>

                {/* Scoreboard Ticker */}
                <div className="flex items-center justify-center gap-8 md:gap-14 my-4 font-mono">
                  <div className="text-center">
                    <span className="text-xs text-emerald-400 font-bold block">{selectedMatch.team1Name}</span>
                    <span className="text-4xl md:text-6xl font-black text-white animate-pulse">
                      {Math.round((simProgress / 100) * (selectedMatch.score?.team1Score || 75))}
                    </span>
                  </div>

                  <div className="text-2xl md:text-4xl font-black text-yellow-400">VS</div>

                  <div className="text-center">
                    <span className="text-xs text-blue-400 font-bold block">{selectedMatch.team2Name}</span>
                    <span className="text-4xl md:text-6xl font-black text-white animate-pulse">
                      {Math.round((simProgress / 100) * (selectedMatch.score?.team2Score || 70))}
                    </span>
                  </div>
                </div>

                {/* Quarter phase text */}
                <p className="text-base md:text-lg font-mono font-bold text-amber-300 my-2">
                  {simQuarter}
                </p>

                {/* Progress bar */}
                <div className="w-full max-w-md bg-white/10 h-3 rounded-full overflow-hidden my-3 border border-white/20">
                  <div
                    style={{ width: `${simProgress}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all duration-300"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 5: REAL OUTCOME REVEAL & GROUND-TRUTH VERDICT */}
          {matchRevealed && (
            <div className="w-full animate-fade-in">
              
              {/* REAL FINAL SCOREBOARD */}
              {selectedMatch.score && (
                <div className="chalk-border p-6 bg-black/60 rounded-3xl mb-6 shadow-xl">
                  <span className="text-xs uppercase font-mono text-white/60 tracking-wider block text-center mb-4">
                    Official Box Score Result
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto font-mono">
                    <div className={`p-4 rounded-2xl border text-center ${
                      selectedMatch.score.team1Score > selectedMatch.score.team2Score
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                        : "bg-black/40 border-white/10 text-white/70"
                    }`}>
                      <span className="text-sm font-bold block">{selectedMatch.team1Name}</span>
                      <span className="text-4xl md:text-5xl font-black text-white mt-1 block">
                        {selectedMatch.score.team1Score}
                      </span>
                      {selectedMatch.score.team1Score > selectedMatch.score.team2Score && (
                        <span className="text-xs text-yellow-300 font-bold mt-1 inline-flex items-center gap-1">
                          <Trophy size={14} /> WINNER
                        </span>
                      )}
                    </div>

                    <div className={`p-4 rounded-2xl border text-center ${
                      selectedMatch.score.team2Score > selectedMatch.score.team1Score
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                        : "bg-black/40 border-white/10 text-white/70"
                    }`}>
                      <span className="text-sm font-bold block">{selectedMatch.team2Name}</span>
                      <span className="text-4xl md:text-5xl font-black text-white mt-1 block">
                        {selectedMatch.score.team2Score}
                      </span>
                      {selectedMatch.score.team2Score > selectedMatch.score.team1Score && (
                        <span className="text-xs text-yellow-300 font-bold mt-1 inline-flex items-center gap-1">
                          <Trophy size={14} /> WINNER
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-center text-xs font-mono text-white/50 mt-4">
                    Margin of Victory: {selectedMatch.score.scoreDiff} pts {selectedMatch.score.numOt > 0 ? `(${selectedMatch.score.numOt} Overtime)` : "(Regulation)"}
                  </p>
                </div>
              )}

              {/* Verdict Announcement Card (Step 5 Final Component) */}
              <div
                className={`p-6 md:p-8 rounded-3xl border-2 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 ${
                  selectedMatch.correct
                    ? "bg-emerald-950/70 border-emerald-400 text-emerald-300"
                    : "bg-rose-950/70 border-rose-400 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`p-4 rounded-2xl ${selectedMatch.correct ? "bg-emerald-500/30 text-emerald-300" : "bg-rose-500/30 text-rose-300"}`}>
                    {selectedMatch.correct ? <CheckCircle2 size={44} /> : <Flame size={44} />}
                  </div>
                  <div>
                    <span className="text-xs uppercase font-mono tracking-widest font-bold block text-white/70">
                      Step 5 &bull; Real Ground-Truth Match Outcome
                    </span>
                    <h3 className="text-2xl md:text-4xl font-extrabold text-white chalk-text mt-1">
                      {selectedMatch.correct ? "MODEL PREDICTION WAS ACCURATE!" : "UNDERDOG UPSET OCCURRED!"}
                    </h3>
                    <p className="text-sm font-mono mt-1 text-white/90">
                      Actual Game Winner: <strong className="text-yellow-300 text-base">{selectedMatch.actualWinner}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
                  <span
                    className={`px-4 py-2 rounded-xl text-sm font-mono font-extrabold shadow-lg ${
                      selectedMatch.correct
                        ? "bg-emerald-500 text-black border border-emerald-200"
                        : "bg-rose-500 text-white border border-rose-200"
                    }`}
                  >
                    {selectedMatch.correct ? "✓ CORRECT PREDICTION" : "✗ MODEL MISS"}
                  </span>
                  <span className="text-xs font-mono text-white/60">
                    Model assigned {(Math.max(selectedMatch.probTeam1, selectedMatch.probTeam2) * 100).toFixed(1)}% to {selectedMatch.predictedWinner}
                  </span>
                </div>
              </div>

              {/* Pick Next Game Action */}
              {dayMatches.length > 1 && (
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => {
                      const currentIdx = dayMatches.findIndex((m) => m.id === selectedMatch.id);
                      const nextMatch = dayMatches[(currentIdx + 1) % dayMatches.length];
                      handleSelectMatch(nextMatch);
                    }}
                    className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-base rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xl hover:scale-105"
                  >
                    <span>Next Match on Day {selectedDay}</span>
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </main>
  );
}
