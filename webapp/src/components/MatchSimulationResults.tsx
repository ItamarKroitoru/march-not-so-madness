import { Activity, Zap, Trophy, Sparkles } from "lucide-react";
import { MatchRecord } from "@/lib/types";

interface MatchSimulationResultsProps {
  selectedMatch: MatchRecord;
  simulating: boolean;
  simProgress: number;
  simQuarter: string;
  matchRevealed: boolean;
  onSimulate: () => void;
}

export function MatchSimulationResults({
  selectedMatch,
  simulating,
  simProgress,
  simQuarter,
  matchRevealed,
  onSimulate,
}: MatchSimulationResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center my-6 w-full">
      {!simulating && !matchRevealed && (
        <button
          onClick={onSimulate}
          className="relative group p-[2px] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(236,72,153,0.7)] transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          {/* Animated Magic AI Gradient Ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-2xl animate-pulse group-hover:opacity-100 opacity-90 transition-opacity" />

          {/* Button Inner Content */}
          <div className="relative px-8 md:px-12 py-4 bg-zinc-950/90 rounded-[14px] flex items-center gap-4 backdrop-blur-md">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 text-white shadow-lg group-hover:rotate-12 transition-transform">
              <Sparkles size={26} className="text-yellow-200 fill-yellow-200" />
            </div>
            <span className="text-xl md:text-2xl font-black chalk-text text-white tracking-wide">
              SIMULATE MATCH
            </span>
          </div>
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
              <span className="text-xs text-teal-300 font-bold block">{selectedMatch.team1Name}</span>
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

      {/* REAL FINAL SCOREBOARD */}
      {matchRevealed && selectedMatch.score && (
        <div className="w-full animate-fade-in mb-6">
          <div className="chalk-border p-6 bg-black/60 rounded-3xl shadow-xl w-full">
            <span className="text-xs uppercase font-mono text-yellow-400 tracking-wider block text-center mb-4">
              FINAL RESULTS
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto font-mono">
              <div className={`p-4 rounded-2xl border text-center ${selectedMatch.score.team1Score > selectedMatch.score.team2Score
                  ? "bg-teal-950/40 border-teal-500/50 text-teal-300"
                  : "bg-black/40 border-white/10 text-white/70"
                }`}>
                <span className="text-sm font-bold block">{selectedMatch.team1Name}</span>
                <span className="text-4xl md:text-5xl font-black text-white mt-1 block">
                  {selectedMatch.score.team1Score}
                </span>
                {selectedMatch.score.team1Score > selectedMatch.score.team2Score && (
                  <span className="text-xs text-teal-300 font-bold mt-1 inline-flex items-center gap-1">
                    <Trophy size={14} /> WINNER
                  </span>
                )}
              </div>

              <div className={`p-4 rounded-2xl border text-center ${selectedMatch.score.team2Score > selectedMatch.score.team1Score
                  ? "bg-blue-950/60 border-blue-600/50 text-blue-300"
                  : "bg-black/40 border-white/10 text-white/70"
                }`}>
                <span className="text-sm font-bold block">{selectedMatch.team2Name}</span>
                <span className="text-4xl md:text-5xl font-black text-white mt-1 block">
                  {selectedMatch.score.team2Score}
                </span>
                {selectedMatch.score.team2Score > selectedMatch.score.team1Score && (
                  <span className="text-xs text-blue-400 font-bold mt-1 inline-flex items-center gap-1">
                    <Trophy size={14} /> WINNER
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
