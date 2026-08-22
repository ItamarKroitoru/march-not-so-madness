"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Swords,
  Trophy,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gamepad2,
} from "lucide-react";
import { MatchRecord, DailyPerformance } from "@/lib/types";
import { MatchSimulationResults } from "@/components/MatchSimulationResults";
import { MatchVerdict } from "@/components/MatchVerdict";

export default function MatchesAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [dailyPerformance, setDailyPerformance] = useState<DailyPerformance[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Selected Day of Season
  const [selectedDay, setSelectedDay] = useState<number>(16);

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
        }
        if (data.matches && data.matches.length > 0) {
          setMatches(data.matches);
          // Set default selected match to first game on initial day
          const initialDayGames = data.matches.filter((m: MatchRecord) => m.dayNum === 16);
          if (initialDayGames.length > 0) {
            setSelectedMatch(initialDayGames[0]);
          } else {
            setSelectedMatch(data.matches[0]);
            if (data.matches[0]) {
               setSelectedDay(data.matches[0].dayNum);
            }
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
    setCurrentStep(4);
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
          setCurrentStep(5);
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
          <p className="text-xs text-white/50 mt-1">Replaying pre-game states &amp; inference weights...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 max-w-6xl mx-auto relative overflow-hidden">

      {/* Header Banner */}
      <div className="chalk-border px-8 py-4 md:py-6 text-center max-w-[928px] w-full mx-auto mb-10 bg-black/40 relative flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px] shadow-2xl">
        <h1 className="text-4xl md:text-6xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center flex-wrap gap-3">
          <Gamepad2 className="text-yellow-300" size={40} />
          <span>MATCH SIMULATOR</span>
        </h1>
        <p className="text-lg md:text-xl chalk-text opacity-85 italic mt-3">
          Check the Model's Performance on the 2026 Season Test Set
        </p>
      </div>

      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-center gap-2 mb-8 max-w-lg w-full font-mono text-xs font-bold text-white/50">
         <span className={currentStep >= 1 ? "text-amber-400" : ""}>1. Day</span>
         <span className="text-white/20">→</span>
         <span className={currentStep >= 2 ? "text-amber-400" : ""}>2. Matchup</span>
         <span className="text-white/20">→</span>
         <span className={currentStep >= 3 ? "text-amber-400" : ""}>3. Pre-Game</span>
         <span className="text-white/20">→</span>
         <span className={currentStep >= 4 ? "text-amber-400" : ""}>4. Simulation</span>
         <span className="text-white/20">→</span>
         <span className={currentStep >= 5 ? "text-amber-400" : ""}>5. Verdict</span>
      </div>

      {/* STEP 1: DAY SELECTOR BAR */}
      {currentStep === 1 && (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
          <div className="chalk-border p-5 w-full bg-black/50 mb-8 rounded-3xl shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold chalk-text text-white">
                    Step 1: Select Day of the Season
                  </h2>
                </div>
              </div>

              {/* Quick Day Stepper and Current Selected Indicator */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                <button
                  onClick={() => {
                    const idx = availableDays.indexOf(selectedDay);
                    if (idx > 0) handleDayChange(availableDays[idx - 1]);
                  }}
                  disabled={availableDays.indexOf(selectedDay) <= 0}
                  className="p-2 bg-black/60 border border-white/20 rounded-xl disabled:opacity-30 hover:bg-white/10 text-white cursor-pointer"
                  title="Previous Day"
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="px-4 py-2 bg-black/70 border border-amber-400/40 rounded-xl text-yellow-300 font-mono font-bold text-sm">
                  Day {selectedDay - 1} &bull; {dayMatches.length} {dayMatches.length === 1 ? "game" : "games"}
                </span>

                <button
                  onClick={() => {
                    const idx = availableDays.indexOf(selectedDay);
                    if (idx >= 0 && idx < availableDays.length - 1) handleDayChange(availableDays[idx + 1]);
                  }}
                  disabled={availableDays.indexOf(selectedDay) >= availableDays.length - 1}
                  className="p-2 bg-black/60 border border-white/20 rounded-xl disabled:opacity-30 hover:bg-white/10 text-white cursor-pointer"
                  title="Next Day"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Day Matrix Grid */}
            <div className="bg-black/40 p-3 rounded-2xl border border-white/10 max-h-52 overflow-y-auto">
              <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-18 gap-1.5 font-mono">
                {availableDays.map((d) => {
                  const count = matches.filter((m) => m.dayNum === d).length;
                  const isSelected = selectedDay === d;
                  return (
                    <button
                      key={d}
                      onClick={() => handleDayChange(d)}
                      title={`Day ${d - 1} (${count} ${count === 1 ? "game" : "games"})`}
                      className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${isSelected
                          ? "bg-amber-400 text-black font-extrabold shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-105 border border-yellow-200 z-10"
                          : "bg-black/60 text-white/80 hover:text-white hover:bg-white/20 border border-white/10 hover:border-white/30"
                        }`}
                    >
                      {d - 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
             <button
                onClick={() => setCurrentStep(2)}
                className="chalk-button px-8 py-4 text-xl font-black flex items-center gap-2 rounded-xl"
             >
                Next: Pick Matchup <ChevronRight size={24} />
             </button>
          </div>
        </div>
      )}

      {/* STEP 2: MATCH SELECTOR FOR THIS DAY */}
      {currentStep === 2 && (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
          <div className="chalk-border p-5 w-full bg-black/50 mb-8 rounded-3xl shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Swords size={20} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold chalk-text text-white">
                    Step 2: Pick a Scheduled Match
                  </h2>
                </div>
              </div>

              {/* Selected Day Indicator Badge */}
              <div className="font-mono text-xs md:text-sm">
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-yellow-300 font-bold inline-flex items-center shadow-sm">
                  Day {selectedDay - 1}
                </span>
              </div>
            </div>

            {/* Matchup horizontal scroller / grid */}
            {dayMatches.length === 0 ? (
              <div className="p-8 text-center text-white/60 font-mono">No matches found for Day {selectedDay - 1}.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1.5">
                {dayMatches.map((m) => {
                  const isSelected = selectedMatch?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMatch(m)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected
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

          <div className="flex justify-between items-center">
             <button
               onClick={() => setCurrentStep(1)}
               className="chalk-button px-8 py-4 text-xl font-black flex items-center gap-2 rounded-xl cursor-pointer"
             >
               <ChevronLeft size={24} /> Back to Days
             </button>
             <button
                onClick={() => setCurrentStep(3)}
                disabled={!selectedMatch}
                className="chalk-button px-8 py-4 text-xl font-black flex items-center gap-2 rounded-xl disabled:opacity-50"
             >
                Next: Pre-Game Analysis <ChevronRight size={24} />
             </button>
          </div>
        </div>
      )}

      {/* STEP 3: PRE-GAME PREDICTION */}
      {currentStep === 3 && selectedMatch && (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
          <div className="chalk-border p-6 md:p-8 w-full bg-black/60 rounded-3xl shadow-2xl relative mb-8">

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/15 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold chalk-text text-white">
                    Step 3: Pre-Game Prediction
                  </h2>
                </div>
              </div>
              {/* Selected Matchup Badge */}
              <div className="font-mono text-xs md:text-sm">
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-yellow-300 font-bold inline-flex items-center shadow-sm">
                  {selectedMatch.team1Name} vs {selectedMatch.team2Name}
                </span>
              </div>
            </div>

            {/* PRE-GAME MODEL PREDICTION CARD */}
            <div className="bg-emerald-950/30 border border-emerald-500/40 p-6 rounded-3xl mb-8 shadow-xl">
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <span className="text-xs font-mono uppercase tracking-widest text-white/70 font-bold block mb-1">
                  Model Predicted Winner
                </span>
                <h3
                  className={`text-2xl md:text-4xl font-extrabold chalk-text flex items-center justify-center gap-2 ${selectedMatch.predictedWinner === selectedMatch.team1Name
                      ? "text-teal-300"
                      : "text-blue-500"
                    }`}
                >
                  <Trophy
                    className={
                      selectedMatch.predictedWinner === selectedMatch.team1Name
                        ? "text-teal-300"
                        : "text-blue-500"
                    }
                    size={32}
                  />
                  <span>{selectedMatch.predictedWinner}</span>
                </h3>
              </div>

              {/* Model Estimated Win Probability Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-sm font-mono font-bold mb-2">
                  <span className="text-teal-300">
                    {selectedMatch.team1Name}: {(selectedMatch.probTeam1 * 100).toFixed(1)}%
                  </span>
                  <span className="text-blue-400">
                    {selectedMatch.team2Name}: {(selectedMatch.probTeam2 * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-black/60 h-8 rounded-full overflow-hidden flex border-2 border-white/20 font-mono shadow-inner">
                  <div
                    style={{ width: `${(selectedMatch.probTeam1 * 100).toFixed(1)}%` }}
                    className="bg-gradient-to-r from-teal-400 to-cyan-300 text-sm text-black flex items-center justify-center font-extrabold transition-all duration-700"
                  >
                    {(selectedMatch.probTeam1 * 100).toFixed(1)}%
                  </div>
                  <div
                    style={{ width: `${(selectedMatch.probTeam2 * 100).toFixed(1)}%` }}
                    className="bg-gradient-to-r from-blue-700 to-indigo-900 text-sm text-white flex items-center justify-center font-extrabold transition-all duration-700"
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
                      <th className="p-3">Pre-Game Stat (Up to Day {selectedMatch.dayNum - 1})</th>
                      <th className="p-3 text-center text-teal-300">{selectedMatch.team1Name}</th>
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
                      <td className="p-3 text-center font-bold text-white">
                        {t1Stats?.streak || "—"}
                      </td>
                      <td className="p-3 text-center font-bold text-white">
                        {t2Stats?.streak || "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
             <button
               onClick={() => setCurrentStep(2)}
               className="chalk-button px-8 py-4 text-xl font-black flex items-center gap-2 rounded-xl cursor-pointer"
             >
               <ChevronLeft size={24} /> Back to Matchups
             </button>
             <button
               onClick={handleSimulateGame}
               className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xl rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] cursor-pointer hover:scale-105"
             >
               RUN SIMULATION <Gamepad2 size={24} />
             </button>
          </div>
        </div>
      )}

      {/* STEP 4: LIVE GAME SIMULATION ANIMATION CONTAINER */}
      {currentStep === 4 && selectedMatch && (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
          <div className="mb-4 font-mono text-center text-amber-300 font-bold text-lg">Step 4: Live Simulation</div>
          <MatchSimulationResults
            selectedMatch={selectedMatch}
            simulating={simulating}
            simProgress={simProgress}
            simQuarter={simQuarter}
            matchRevealed={matchRevealed}
            onSimulate={handleSimulateGame}
          />
        </div>
      )}

      {/* STEP 5: REAL OUTCOME REVEAL & GROUND-TRUTH VERDICT */}
      {currentStep === 5 && selectedMatch && matchRevealed && (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
          <div className="mb-4 font-mono text-center text-amber-300 font-bold text-lg">Step 5: Match Verdict</div>
          
          <MatchVerdict selectedMatch={selectedMatch} />
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => {
                setCurrentStep(1);
                setMatchRevealed(false);
              }}
              className="chalk-button px-8 py-4 text-xl font-black flex items-center justify-center gap-2 rounded-xl w-full sm:w-auto cursor-pointer"
            >
              <ChevronLeft size={24} /> Start Over
            </button>

            {/* Pick Next Game Action */}
            {dayMatches.length > 1 && (
              <button
                onClick={() => {
                  const currentIdx = dayMatches.findIndex((m) => m.id === selectedMatch.id);
                  const nextMatch = dayMatches[(currentIdx + 1) % dayMatches.length];
                  handleSelectMatch(nextMatch);
                  setCurrentStep(3); // Go straight to Pre-Game for the next match
                }}
                className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-105 w-full sm:w-auto"
              >
                <span>Simulate Next Match on Day {selectedDay - 1}</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
