"use client";

import Link from "next/link";
import { Swords, Trophy, LineChart, FileText, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const parts = [
    {
      title: "Match Predictor",
      href: "/predictor",
      icon: Swords,
      description: "Simulate a head-to-head game outcome between any two NCAA Division I teams (2003–2026).",
      actionText: "Launch Match Predictor",
      accentColor: "text-emerald-400 group-hover:text-amber-300",
    },
    {
      title: "Bracket Simulator",
      href: "/bracket",
      icon: Trophy,
      description: "Simulate the full 68-team March Madness tournament bracket round-by-round.",
      actionText: "Simulate Bracket",
      accentColor: "text-amber-400 group-hover:text-amber-300",
    },
    {
      title: "Model Insights",
      href: "/insights",
      icon: LineChart,
      description: "View feature importance weights, ROC-AUC curves, and machine learning model metrics.",
      actionText: "View Model Insights",
      accentColor: "text-purple-400 group-hover:text-amber-300",
    },
    {
      title: "Methodology & Report",
      href: "/report",
      icon: FileText,
      description: "Read the methodology report on zero-leakage data engineering and model architecture.",
      actionText: "Read Methodology Report",
      accentColor: "text-rose-400 group-hover:text-amber-300",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 max-w-5xl mx-auto">

      {/* Header Title Banner */}
      <div className="chalk-border px-8 py-4 md:py-6 text-center max-w-[928px] w-full mx-auto mb-10 bg-black/40 relative flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px]">
        <h1 className="text-4xl md:text-6xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center flex-wrap gap-3">
          <span>NCAA MARCH</span>
          <span className="text-2xl md:text-3xl opacity-80 font-normal italic lowercase border-b-2 border-white/40 px-3 py-1 my-0.5 bg-white/5 rounded">
            not so
          </span>
          <span>MADNESS</span>
        </h1>

        <p className="text-lg md:text-xl chalk-text opacity-85 italic mt-3">
          What&apos;s in the project? Select a section below to get started.
        </p>
      </div>

      {/* Grid of Parts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
        {parts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="chalk-border p-5 md:p-6 bg-black/40 hover:bg-white/[0.03] transition-all duration-200 group flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold chalk-text text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h2>
                </div>

                <p className="text-xs md:text-sm text-white/85 leading-relaxed font-light mb-4">
                  {item.description}
                </p>
              </div>

              <div className={`flex items-center gap-2 text-xs md:text-sm font-mono font-bold transition-colors pt-3 border-t border-white/15 ${item.accentColor}`}>
                <span>{item.actionText}</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs md:text-sm font-mono text-white/40 border-t border-white/10 pt-6">
        Final Project for Needle in a Haystack Course &bull; HUJI
      </footer>

    </main>
  );
}
