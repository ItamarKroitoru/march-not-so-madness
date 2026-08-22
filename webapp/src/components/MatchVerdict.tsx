import { CheckCircle2, XCircle } from "lucide-react";
import { MatchRecord } from "@/lib/types";

interface MatchVerdictProps {
  selectedMatch: MatchRecord;
}

export function MatchVerdict({ selectedMatch }: MatchVerdictProps) {
  return (
    <div
      className={`p-6 md:p-8 rounded-3xl border-2 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in ${selectedMatch.correct
          ? "bg-emerald-950/70 border-emerald-400 text-emerald-300"
          : "bg-rose-950/70 border-rose-400 text-rose-300"
        }`}
    >
      <div className="flex items-center gap-4 text-left">
        <div className={`p-4 rounded-2xl ${selectedMatch.correct ? "bg-emerald-500/30 text-emerald-300" : "bg-rose-500/30 text-rose-300"}`}>
          {selectedMatch.correct ? <CheckCircle2 size={44} /> : <XCircle size={44} />}
        </div>
        <div>
          <h3 className="text-2xl md:text-4xl font-extrabold text-white chalk-text mt-1">
            {selectedMatch.correct ? "MODEL PREDICTION WAS ACCURATE!" : "UNDERDOG UPSET OCCURRED!"}
          </h3>
        </div>
      </div>

      <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
        <span
          className={`px-4 py-2 rounded-xl text-sm font-mono font-extrabold shadow-lg ${selectedMatch.correct
            ? "bg-emerald-500 text-black border border-emerald-200"
            : "bg-rose-500 text-white border border-rose-200"
            }`}
        >
          {selectedMatch.correct ? "✓ CORRECT PREDICTION" : "✗ MODEL MISS"}
        </span>
      </div>
    </div>
  );
}
