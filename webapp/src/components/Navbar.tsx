"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Swords, Trophy, LineChart, FileText, Menu, X, Sparkles } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Match Predictor", icon: Swords },
    { href: "/bracket", label: "Bracket Simulator", icon: Trophy },
    { href: "/insights", label: "Model Insights", icon: LineChart },
    { href: "/report", label: "Report", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/50 border-b border-white/20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-emerald-700/60 border border-emerald-400/40 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Sparkles size={22} className="text-yellow-300 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base md:text-lg lg:text-xl chalk-text tracking-wide text-white whitespace-nowrap flex items-center gap-1.5">
              NCAA MARCH <span className="italic font-light opacity-80 text-yellow-200">not-so</span> MADNESS
            </span>
            <span className="text-[10px] md:text-xs text-white/60 font-mono tracking-wider">Needle in a Haystack - HUJI</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 lg:px-4 lg:py-2.5 rounded-xl text-sm lg:text-base font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white/20 text-yellow-300 border border-yellow-300/40 shadow-inner font-semibold"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={18} className={isActive ? "text-yellow-300" : "text-white/70"} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/90 border-b border-white/20 px-4 pt-2 pb-4 space-y-2 animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                  isActive
                    ? "bg-white/20 text-yellow-300 border border-yellow-300/30"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon size={22} className={isActive ? "text-yellow-300" : "text-white/70"} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
