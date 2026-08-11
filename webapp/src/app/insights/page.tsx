"use client";

import { LineChart, Cpu, Sparkles, ArrowRight, Database, Calculator, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import { MODEL_WEIGHTS, FEATURE_LABELS, MODEL_INTERCEPT } from "@/lib/predictor";

export default function InsightsPage() {
  // Sort features by weight magnitude
  const allFeatures = Object.entries(MODEL_WEIGHTS).map(([key, weight]) => ({
    key,
    label: FEATURE_LABELS[key] || key,
    weight,
    absWeight: Math.abs(weight),
  }));

  const positiveFeatures = allFeatures
    .filter((f) => f.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  const negativeFeatures = allFeatures
    .filter((f) => f.weight < 0)
    .sort((a, b) => a.weight - b.weight)
    .slice(0, 5);

  const flowSteps = [
    {
      step: "01",
      title: "Team State Lookup",
      icon: Database,
      desc: "Fetch regular season end-state metrics for Team 1 & Team 2.",
      detail: "data/final_team_states.csv",
    },
    {
      step: "02",
      title: "Differential Vectors",
      icon: Sparkles,
      desc: "Subtract Team 2 stats from Team 1 across 33 metrics + Court Location.",
      detail: "Diff_i = Team1_i - Team2_i",
    },
    {
      step: "03",
      title: "Logistic Log-Odds",
      icon: Calculator,
      desc: "Multiply differential features by fitted model weights z = β₀ + Σ(βᵢ · Diffᵢ).",
      detail: "joblib trained LogisticRegression",
    },
    {
      step: "04",
      title: "Win Probability",
      icon: CheckCircle2,
      desc: "Apply Sigmoid P = 1 / (1 + e⁻ᶻ) to calculate win percentages.",
      detail: "Probabilities sum to 100%",
    },
  ];

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8">
      
      {/* Header Banner */}
      <div className="chalk-border px-6 py-6 text-center w-full mb-8 bg-black/40 relative">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="text-yellow-400" size={22} />
          <span className="text-xs font-mono tracking-widest text-emerald-400 font-bold uppercase">
            System Architecture &amp; ML Model Specification
          </span>
          <Sparkles className="text-yellow-400" size={22} />
        </div>

        <h1 className="text-3xl md:text-5xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center gap-3">
          <LineChart className="text-yellow-300" size={36} />
          <span>PREDICTION FLOW &amp; MODEL INSIGHTS</span>
        </h1>
        <p className="text-sm md:text-base chalk-text opacity-85 italic mt-2">
          How the 33-feature Logistic Regression model estimates matchup probabilities
        </p>
      </div>

      {/* STEP-BY-STEP FLOW PIPELINE */}
      <div className="chalk-border p-6 md:p-8 bg-black/40 mb-8 rounded-3xl">
        <h2 className="text-2xl font-bold chalk-text mb-2 text-yellow-300 flex items-center gap-2">
          <Cpu className="text-emerald-400" size={24} />
          <span>Matchup Prediction Pipeline</span>
        </h2>
        <p className="text-xs font-mono text-white/60 mb-6">
          Step-by-step inference flow executed on every matchup calculation
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {flowSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="bg-emerald-950/20 border border-white/20 p-5 rounded-2xl flex flex-col justify-between shadow-xl relative">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                      Step {s.step}
                    </span>
                    <Icon size={22} className="text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-base text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-white/75 leading-relaxed mb-4">{s.desc}</p>
                </div>

                <div className="bg-black/60 p-2 rounded-lg border border-white/10 text-[11px] font-mono text-emerald-300 text-center">
                  {s.detail}
                </div>

                {idx < flowSteps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-white/30">
                    <ArrowRight size={18} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP POSITIVE VS NEGATIVE FEATURE WEIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* POSITIVE FACTORS CARD */}
        <div className="chalk-border p-6 bg-emerald-950/30 border-emerald-500/40">
          <h3 className="text-xl font-bold chalk-text text-emerald-300 mb-2 flex items-center gap-2">
            <TrendingUp size={22} className="text-emerald-400" />
            Top Advantage Drivers (+ Weight)
          </h3>
          <p className="text-xs font-mono text-white/60 mb-4">
            Higher differential increases Team 1 win odds
          </p>

          <div className="space-y-3">
            {positiveFeatures.map((f) => (
              <div key={f.key} className="bg-black/50 p-3 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                <span className="text-sm font-medium text-white">{f.label}</span>
                <span className="font-mono font-bold text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-400/30">
                  +{f.weight.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* NEGATIVE FACTORS CARD */}
        <div className="chalk-border p-6 bg-amber-950/30 border-amber-500/40">
          <h3 className="text-xl font-bold chalk-text text-amber-300 mb-2 flex items-center gap-2">
            <TrendingDown size={22} className="text-amber-400" />
            Top Penalty Drivers (- Weight)
          </h3>
          <p className="text-xs font-mono text-white/60 mb-4">
            Negative differential penalizes Team 1 win odds
          </p>

          <div className="space-y-3">
            {negativeFeatures.map((f) => (
              <div key={f.key} className="bg-black/50 p-3 rounded-xl border border-amber-500/20 flex justify-between items-center">
                <span className="text-sm font-medium text-white">{f.label}</span>
                <span className="font-mono font-bold text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/30">
                  {f.weight.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SYSTEM METRICS SUMMARY BAR */}
      <div className="chalk-border p-5 bg-black/40 grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
        <div>
          <span className="text-xs text-white/50 block">Seasons Included</span>
          <span className="text-lg font-bold text-emerald-300 mt-1 block">2003 &ndash; 2026</span>
        </div>
        <div>
          <span className="text-xs text-white/50 block">Model Engine</span>
          <span className="text-lg font-bold text-amber-300 mt-1 block">Logistic Regression</span>
        </div>
        <div>
          <span className="text-xs text-white/50 block">Input Features</span>
          <span className="text-lg font-bold text-yellow-300 mt-1 block">33 Differential</span>
        </div>
        <div>
          <span className="text-xs text-white/50 block">Model Intercept</span>
          <span className="text-lg font-bold text-blue-300 mt-1 block">{MODEL_INTERCEPT.toExponential(2)}</span>
        </div>
      </div>

    </main>
  );
}
