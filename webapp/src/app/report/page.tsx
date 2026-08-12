"use client";

import { FileText } from "lucide-react";

export default function ReportPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="chalk-border px-8 py-4 md:py-6 text-center max-w-[928px] w-full mx-auto mb-10 bg-black/40 relative flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px]">
        <h1 className="text-4xl md:text-6xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center gap-3">
          <FileText className="text-yellow-300" size={40} />
          <span>PROJECT REPORT</span>
        </h1>
        <p className="text-lg md:text-xl chalk-text opacity-85 italic mt-3">
          Methodology report &amp; project documentation
        </p>
      </div>

      {/* Empty PDF Viewer Container */}
      <div className="chalk-border p-12 bg-black/40 rounded-3xl text-center flex flex-col items-center justify-center min-h-[450px]">
        <FileText size={56} className="text-white/20 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold chalk-text text-white/70 mb-2">Report PDF Placeholder</h2>
        <p className="text-sm font-mono text-white/40 max-w-md">
          The project PDF report will be embedded directly in this container.
        </p>
      </div>

    </main>
  );
}
