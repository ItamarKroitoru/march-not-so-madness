"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Swords, Trophy, Users, LineChart, FileText, Menu, X, Sparkles } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Match Predictor", icon: Swords },
    { href: "/teams", label: "Teams Explorer", icon: Users },
    { href: "/bracket", label: "Bracket Simulator", icon: Trophy },
    { href: "/insights", label: "Model Insights", icon: LineChart },
    { href: "/report", label: "Report", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/40 border-b border-white/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-lg bg-emerald-700/60 border border-emerald-400/40 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Sparkles size={22} className="text-yellow-300 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg md:text-xl chalk-text tracking-wide text-white flex items-center gap-1.5">
              NCAA MARCH <span className="italic font-light opacity-80 text-yellow-200">not-so</span> MADNESS
            </span>
            <span className="text-xs text-white/60 -mt-1 font-mono tracking-wider">AI PREDICTOR ENGINE</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm md:text-base font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-white/20 text-yellow-300 border border-yellow-300/40 shadow-inner font-semibold"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={16} className={isActive ? "text-yellow-300" : "text-white/70"} />
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
