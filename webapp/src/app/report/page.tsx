"use client";

import { FileText, Download, ExternalLink } from "lucide-react";

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

      {/* PDF Action Bar */}
      <div className="w-full flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 font-mono text-sm text-white/80">
          <FileText size={18} className="text-yellow-300" />
          <span className="font-bold">Final Project Report</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/final_report.pdf"
            download="March_not_so_Madness_Final_Report_Team41.pdf"
            className="chalk-button flex items-center gap-2 px-4 py-2 text-sm font-mono text-white/90 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            <Download size={16} className="text-yellow-300" />
            <span>Download PDF</span>
          </a>
          <a
            href="/final_report.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="chalk-button flex items-center gap-2 px-4 py-2 text-sm font-mono text-white/90 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            <ExternalLink size={16} className="text-emerald-300" />
            <span>Open in Tab</span>
          </a>
        </div>
      </div>

      {/* PDF Viewer Container */}
      <div className="chalk-border p-3 md:p-6 bg-black/40 rounded-3xl w-full shadow-2xl relative">
        <div className="w-full rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 h-[750px] md:h-[900px]">
          <iframe
            src="/final_report.pdf#toolbar=1&navpanes=0&pagemode=none&view=FitH"
            className="w-full h-full border-0"
            title="March not-so Madness Final Report PDF"
          >
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white font-mono">
              <p className="mb-4 text-base">Your browser does not support embedded PDF viewing.</p>
              <a
                href="/final_report.pdf"
                target="_blank"
                className="chalk-button px-6 py-2.5 rounded-xl text-yellow-300 font-bold inline-flex items-center gap-2"
              >
                <ExternalLink size={16} />
                <span>Open PDF in New Window</span>
              </a>
            </div>
          </iframe>
        </div>
      </div>
    </main>
  );
}
