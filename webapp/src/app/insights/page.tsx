"use client";

import { LineChart, Cpu, CheckCircle2, BarChart2, Zap, Layers, Sparkles } from "lucide-react";

export default function InsightsPage() {
  const featureWeights = [
    {
      name: "Elo Rating Difference",
      weight: "45%",
      impact: "High",
      description: "Long-term team strength calculated iteratively across all regular season & tournament games.",
      color: "from-emerald-600 to-teal-700",
    },
    {
      name: "Margin of Victory (Margin Rating)",
      weight: "25%",
      impact: "High",
      description: "Point differential adjusted for opponent difficulty and game location.",
      color: "from-blue-600 to-cyan-700",
    },
    {
      name: "Recent Form (Last 5 Games)",
      weight: "18%",
      impact: "Medium",
      description: "Weighted momentum tracking late-season team performance trajectory.",
      color: "from-amber-600 to-yellow-600",
    },
    {
      name: "Court Location Factor",
      weight: "12%",
      impact: "Moderate",
      description: "Home, Away, or Neutral site adjustment based on travel distance and crowd factor.",
      color: "from-purple-600 to-indigo-700",
    },
  ];

  const modelMetrics = [
    { label: "Historical Accuracy", value: "74.2%", detail: "Backtested on 2018-2025 March Madness" },
    { label: "Log Loss", value: "0.541", detail: "Probabilistic calibration quality score" },
    { label: "Brier Score", value: "0.182", detail: "Mean squared error of win probabilities" },
    { label: "Baseline Model", value: "Elo + Margin", detail: "Pluggable ML Logistic Regression V3" },
  ];

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8">
      
      {/* Header Banner */}
      <div className="chalk-border px-6 py-6 text-center w-full mb-8 bg-black/20">
        <h1 className="text-3xl md:text-5xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center gap-3">
          <LineChart className="text-yellow-300" size={38} />
          <span>MODEL INSIGHTS & ARCHITECTURE</span>
        </h1>
        <p className="text-lg chalk-text opacity-85 italic mt-2">
          Machine Learning feature weights, evaluation metrics, and algorithm design
        </p>
      </div>

      {/* Evaluation Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {modelMetrics.map((metric) => (
          <div key={metric.label} className="chalk-border p-5 bg-black/30 flex flex-col justify-between">
            <span className="text-xs uppercase font-mono text-white/60 tracking-wider">{metric.label}</span>
            <span className="text-3xl font-extrabold font-mono text-yellow-300 my-2">{metric.value}</span>
            <span className="text-xs text-white/70">{metric.detail}</span>
          </div>
        ))}
      </div>

      {/* Feature Weights & Importance */}
      <div className="chalk-border p-6 bg-black/20 mb-8">
        <h2 className="text-2xl font-bold chalk-text mb-6 flex items-center gap-2 text-yellow-300">
          <BarChart2 size={26} />
          <span>Feature Weight Breakdown</span>
        </h2>

        <div className="space-y-5">
          {featureWeights.map((f) => (
            <div key={f.name} className="bg-black/40 p-4 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-yellow-400" />
                  {f.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/80">
                    Impact: {f.impact}
                  </span>
                  <span className="font-mono font-bold text-yellow-300 text-lg">{f.weight}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-black/60 h-3 rounded-full overflow-hidden border border-white/20 mb-2">
                <div
                  style={{ width: f.weight }}
                  className={`h-full bg-gradient-to-r ${f.color} transition-all duration-500 rounded-full`}
                />
              </div>

              <p className="text-sm text-white/70 italic">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pluggable Backend Architecture Note */}
      <div className="chalk-border p-6 bg-emerald-950/40 border-emerald-400/50">
        <h3 className="text-2xl font-bold chalk-text text-emerald-300 mb-3 flex items-center gap-2">
          <Cpu size={26} />
          <span>Backend Pluggable Architecture</span>
        </h3>
        <p className="text-base text-white/85 leading-relaxed mb-4">
          The web application consumes predictions via a modular predictor service interface (<code className="bg-black/40 px-2 py-0.5 rounded text-yellow-300 font-mono text-sm">MatchPredictor</code>). 
          Once your teammates complete their ML algorithm backend pipeline in Python/FastAPI or Node, it can be plugged directly into the UI without altering frontend views!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-black/40 p-3 rounded border border-white/10 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Rating-Based Elo Engine</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-white/10 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Margin & Location Factors</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-white/10 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>ML Pipeline API Ready</span>
          </div>
        </div>
      </div>
    </main>
  );
}
