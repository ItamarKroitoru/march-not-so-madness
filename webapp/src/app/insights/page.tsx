"use client";

import { useState, useEffect, useMemo } from "react";
import { LineChart, Cpu, Sparkles, Database, Calculator, CheckCircle2, ArrowRight, BarChart3 } from "lucide-react";
import { MODEL_WEIGHTS, FEATURE_LABELS } from "@/lib/predictor";
import { DailyPerformance, MatchAnalysisSummary } from "@/lib/types";

export default function InsightsPage() {
  const [dailyPerformance, setDailyPerformance] = useState<DailyPerformance[]>([]);
  const [summary, setSummary] = useState<MatchAnalysisSummary | null>(null);
  const [hoveredDay, setHoveredDay] = useState<DailyPerformance | null>(null);

  useEffect(() => {
    fetch("/api/matches?summaryOnly=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.dailyPerformance) setDailyPerformance(data.dailyPerformance);
        if (data.summary) setSummary(data.summary);
      })
      .catch((err) => console.error("Failed to load insights daily performance:", err));
  }, []);

  const maxDailyGames = useMemo(() => {
    if (dailyPerformance.length === 0) return 100;
    return Math.max(...dailyPerformance.map((d) => d.total));
  }, [dailyPerformance]);

  // Sort features by weight
  const sortedFeatures = Object.entries(MODEL_WEIGHTS)
    .map(([key, weight]) => ({
      key,
      label: FEATURE_LABELS[key] || key,
      weight,
    }))
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  const flowSteps = [
    {
      step: "01",
      title: "Team Data",
      icon: Database,
      desc: "Fetch season state metrics for both teams.",
    },
    {
      step: "02",
      title: "Stat Differentials",
      icon: Sparkles,
      desc: "Calculate Team 1 − Team 2 metric differences.",
    },
    {
      step: "03",
      title: "Logistic Model",
      icon: Calculator,
      desc: "Apply trained ML weights to calculate log-odds.",
    },
    {
      step: "04",
      title: "Win Probability",
      icon: CheckCircle2,
      desc: "Convert log-odds to 0–100% win chance.",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="chalk-border px-8 py-4 md:py-6 text-center max-w-[928px] w-full mx-auto mb-10 bg-black/40 relative flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px]">
        <h1 className="text-4xl md:text-6xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center gap-3">
          <LineChart className="text-yellow-300" size={40} />
          <span>MODEL INSIGHTS</span>
        </h1>
        <p className="text-lg md:text-xl chalk-text opacity-85 italic mt-2.5">
          General prediction pipeline &amp; key feature weights
        </p>
      </div>

      {/* MATCHUP PIPELINE */}
      <div className="chalk-border p-8 md:p-10 bg-black/40 mb-10 rounded-3xl w-full">
        <div className="flex items-center gap-3 mb-6">
          <Cpu className="text-emerald-400" size={28} />
          <h2 className="text-2xl md:text-3xl font-bold chalk-text text-white">
            Prediction Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flowSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="bg-emerald-950/20 border border-white/20 p-6 rounded-2xl flex flex-col justify-between shadow-lg relative">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/30">
                        Step {s.step}
                      </span>
                      {idx < flowSteps.length - 1 && (
                        <ArrowRight size={16} className="text-white/30 hidden lg:inline" />
                      )}
                    </div>
                    <Icon size={24} className="text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-white/80 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP FEATURE WEIGHTS */}
      <div className="chalk-border p-8 md:p-10 bg-black/40 mb-10 rounded-3xl w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="text-blue-400" size={28} />
            <h2 className="text-2xl md:text-3xl font-bold chalk-text text-white">
              Top 10 Impactful Features
            </h2>
          </div>
          <p className="text-xs md:text-sm font-mono text-white/60 max-w-md">
            Features with the highest absolute WEIGHTS
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {sortedFeatures.slice(0, 10).map((f) => {
            const isPositive = f.weight > 0;
            return (
              <div key={f.key} className="bg-black/50 p-4 rounded-xl border border-white/10 flex justify-between items-center group hover:bg-black/70 transition-colors">
                <span className="text-base font-semibold text-white group-hover:text-white/90">{f.label}</span>
                <span className={`font-mono font-bold text-sm px-3 py-1 rounded-lg border ${
                  isPositive 
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" 
                    : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                }`}>
                  {isPositive ? "+" : ""}{f.weight.toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK SUMMARY SNAPSHOT */}
      <div className="chalk-border p-6 bg-black/40 grid grid-cols-1 md:grid-cols-3 gap-6 text-center font-mono rounded-3xl w-full mb-10">
        <div>
          <span className="text-xs text-white/50 block uppercase tracking-wider">Algorithm</span>
          <span className="text-xl font-bold text-emerald-300 mt-1 block">Logistic Regression</span>
        </div>
        <div>
          <span className="text-xs text-white/50 block uppercase tracking-wider">Feature Set</span>
          <span className="text-xl font-bold text-amber-300 mt-1 block">33 Differentials</span>
        </div>
        <div>
          <span className="text-xs text-white/50 block uppercase tracking-wider">Data Span</span>
          <span className="text-xl font-bold text-yellow-300 mt-1 block">2003 &ndash; 2026</span>
        </div>
      </div>

      {/* DAILY PREDICTION PERFORMANCE PLOT (LR Results Analysis Cell 9) */}
      <div className="chalk-border p-6 md:p-8 bg-black/40 rounded-3xl w-full shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <BarChart3 className="text-amber-400" size={24} />
              <h2 className="text-xl md:text-2xl font-bold chalk-text text-white">
                Daily Prediction Performance Throughout the 2026 Season
              </h2>
            </div>
            <p className="text-xs md:text-sm font-mono text-emerald-300 font-bold mt-1">
              Overall Test Accuracy: {summary ? `${summary.overallAccuracy}% (${summary.correctCount.toLocaleString()}/${summary.totalGames.toLocaleString()} games)` : "71.1%"}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-white/90">Correct</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-rose-500 inline-block" />
              <span className="text-white/90">Incorrect</span>
            </div>
          </div>
        </div>

        {/* Chart Box */}
        <div className="w-full bg-black/60 p-4 rounded-2xl border border-white/10 relative">
          
          {/* Active Hover Tooltip Display */}
          <div className="min-h-[30px] mb-3 flex items-center justify-between text-xs font-mono">
            {hoveredDay ? (
              <span className="text-amber-300 font-bold bg-white/10 px-3 py-1 rounded-lg border border-white/15">
                Day {hoveredDay.dayNum}: {hoveredDay.correct} Correct, {hoveredDay.incorrect} Incorrect &bull; {hoveredDay.total} Total Games ({hoveredDay.accuracy}% Accuracy)
              </span>
            ) : (
              <span className="text-white/50 italic">Hover over any day bar below to inspect that day&apos;s results</span>
            )}
          </div>

          {/* Stacked Bar Visualizer */}
          <div className="h-48 md:h-56 w-full flex items-end gap-[2px] md:gap-[3px] overflow-x-auto pb-2 pt-4">
            {dailyPerformance.map((day) => {
              const correctHeight = (day.correct / maxDailyGames) * 100;
              const incorrectHeight = (day.incorrect / maxDailyGames) * 100;

              return (
                <div
                  key={day.dayNum}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="flex-1 min-w-[5px] md:min-w-[7px] max-w-[14px] flex flex-col justify-end h-full group cursor-pointer transition-all duration-150 hover:opacity-80"
                >
                  {/* Incorrect / Upset (Top Red Portion) */}
                  <div
                    style={{ height: `${incorrectHeight}%` }}
                    className="w-full bg-rose-500/90 rounded-t-sm"
                  />
                  {/* Correct (Bottom Green Portion) */}
                  <div
                    style={{ height: `${correctHeight}%` }}
                    className="w-full bg-emerald-500/90"
                  />
                </div>
              );
            })}
          </div>

          {/* X Axis Range Labels */}
          <div className="flex justify-between items-center text-[11px] font-mono text-white/50 border-t border-white/10 pt-2 px-1 mt-1">
            <span>Day 2 (Season Start)</span>
            <span>Day 65 (Mid-Season)</span>
            <span>Day 132 (Conference Tournaments)</span>
          </div>
        </div>

        <p className="text-xs text-white/60 font-mono text-center mt-4">
          Each stacked bar represents all games played on a given day. Bar height indicates the total number of games.
        </p>
      </div>

    </main>
  );
}

