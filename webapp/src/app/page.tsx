"use client";

import Link from "next/link";
import { Swords, LineChart, FileText, ArrowRight, Gamepad2, Sparkles } from "lucide-react";

export default function Dashboard() {
  const modules = [
    {
      title: "What-If Predictor",
      href: "/predictor",
      icon: Swords,
      color: "group-hover:text-amber-300",
    },
    {
      title: "Match Simulator",
      href: "/matches",
      icon: Gamepad2,
      color: "group-hover:text-amber-300",
    },
    {
      title: "Model Insights",
      href: "/insights",
      icon: LineChart,
      color: "group-hover:text-amber-300",
    },
    {
      title: "Project Report",
      href: "/report",
      icon: FileText,
      color: "group-hover:text-amber-300",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 max-w-7xl mx-auto relative overflow-hidden">

      {/* Header Title Banner */}
      <div className="chalk-border px-8 py-4 md:py-6 text-center max-w-[928px] w-full mx-auto mb-6 bg-black/40 relative flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px] shadow-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center flex-wrap gap-2 md:gap-3">
          <Sparkles className="text-yellow-300 shrink-0" size={36} />
          <span>
            NCAA MARCH <span className="text-lg sm:text-xl md:text-3xl font-light italic lowercase text-yellow-200/90 tracking-normal mx-1.5">not-so</span> MADNESS
          </span>
        </h1>
        <p className="text-lg md:text-xl chalk-text opacity-85 italic mt-3">
          Final Project &bull; Needle in a Haystack &bull; HUJI
        </p>
      </div>

      {/* Where do I start? Quick Guide Card */}
      <div className="bg-yellow-100 text-black rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-3xl w-full mx-auto mb-10 shadow-2xl border-4 border-amber-400 text-center flex flex-col items-center gap-3.5">
        <h3 className="text-sm md:text-base font-mono font-extrabold text-black uppercase tracking-widest bg-amber-300 px-4 py-1 rounded-full border border-amber-400 shadow-sm">
          Where do I start?
        </h3>

        <p className="text-sm md:text-base text-black font-sans leading-relaxed">
          Start with the <span className="font-bold">Match Simulator</span> - the core feature demonstrating real-world model deployment. Since 2027 hasn&apos;t happened yet, we simulate live use with our test set (the <span className="font-bold">2026 season</span>, which the model was <span className="font-bold">never trained on</span>) to evaluate how well it predicts actual game outcomes.
        </p>

        <div className="text-xs md:text-sm text-black font-sans leading-relaxed flex flex-col gap-1.5 pt-2 border-t border-black/10 w-full text-left sm:text-center">
          <p>
            &bull; <span className="font-bold">What-If Predictor:</span> Simulate hypothetical cross-season matchups between any two teams from different years and venues.
          </p>
          <p>
            &bull; <span className="font-bold">Model Insights:</span> Explore feature importance weights, model architecture, and day-by-day accuracy on the 2026 test set.
          </p>
          <p>
            &bull; <span className="font-bold">Project Report:</span> View the complete methodology report, research findings, and project documentation.
          </p>
        </div>
      </div>

      {/* 4 Action Cards in 1 Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xl:gap-4 w-full mb-12">
        {modules.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="chalk-border px-4 py-3.5 xl:px-5 xl:py-4 bg-black/40 hover:bg-white/[0.06] transition-all duration-200 group flex items-center justify-between gap-2.5 shadow-xl rounded-2xl border border-white/20 hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner group-hover:scale-110 transition-transform shrink-0">
                  <Icon size={19} />
                </div>
                <h2 className={`text-base md:text-lg font-bold chalk-text text-white ${item.color} transition-colors leading-tight whitespace-nowrap`}>
                  {item.title}
                </h2>
              </div>

              <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-white/5 group-hover:bg-amber-400/20 border border-white/10 group-hover:border-amber-400/40 flex items-center justify-center text-white/50 group-hover:text-amber-300 transition-all shrink-0">
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
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
