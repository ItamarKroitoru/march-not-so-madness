"use client";

import { useState, useMemo } from "react";
import { enrichedTeams, EnrichedTeam } from "../../lib/teamsData";
import { Search, Filter, ArrowUpDown, Shield, Flame, Trophy, X } from "lucide-react";

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"Rating" | "Seed" | "Wins" | "OffenseRating">("Rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTeam, setSelectedTeam] = useState<EnrichedTeam | null>(null);

  const filteredTeams = useMemo(() => {
    return enrichedTeams
      .filter((team) => {
        const matchesSearch = team.TeamName.toLowerCase().includes(search.toLowerCase());
        const matchesRegion = selectedRegion === "All" || team.Region === selectedRegion;
        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        const valA = (a[sortBy as keyof EnrichedTeam] as number) ?? 0;
        const valB = (b[sortBy as keyof EnrichedTeam] as number) ?? 0;
        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "desc" ? valB - valA : valA - valB;
        }
        return 0;
      });
  }, [search, selectedRegion, sortBy, sortOrder]);

  const toggleSort = (field: "Rating" | "Seed" | "Wins" | "OffenseRating") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8">
      
      {/* Header */}
      <div className="chalk-border px-6 py-6 text-center w-full mb-8 bg-black/20">
        <h1 className="text-3xl md:text-5xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center gap-3">
          <Trophy className="text-yellow-300" size={36} />
          <span>2026 TEAMS EXPLORER</span>
        </h1>
        <p className="text-lg chalk-text opacity-85 italic mt-2">
          Inspect Elo ratings, offensive/defensive efficiency, and tournament seeds
        </p>
      </div>

      {/* Controls: Search, Region Filter, Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-black/30 p-4 rounded-xl border border-white/20">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 text-white/50" size={18} />
          <input
            type="text"
            placeholder="Search team name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="chalk-input pl-10 pr-4 py-2.5 w-full text-base"
          />
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter size={18} className="text-white/60 hidden md:block" />
          {["All", "East", "West", "South", "Midwest"].map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedRegion === region
                  ? "bg-yellow-400 text-gray-950 font-bold shadow"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-white/60 font-mono uppercase">Sort by:</span>
          <button
            onClick={() => toggleSort("Rating")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1 ${
              sortBy === "Rating" ? "bg-emerald-600 border-emerald-400 text-white" : "border-white/20 text-white/80"
            }`}
          >
            Elo {sortBy === "Rating" && <ArrowUpDown size={12} />}
          </button>
          <button
            onClick={() => toggleSort("Seed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1 ${
              sortBy === "Seed" ? "bg-emerald-600 border-emerald-400 text-white" : "border-white/20 text-white/80"
            }`}
          >
            Seed {sortBy === "Seed" && <ArrowUpDown size={12} />}
          </button>
          <button
            onClick={() => toggleSort("Wins")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1 ${
              sortBy === "Wins" ? "bg-emerald-600 border-emerald-400 text-white" : "border-white/20 text-white/80"
            }`}
          >
            Wins {sortBy === "Wins" && <ArrowUpDown size={12} />}
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTeams.map((team) => (
          <div
            key={team.TeamID}
            onClick={() => setSelectedTeam(team)}
            className="chalk-border p-4 bg-black/20 hover:bg-white/10 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                  #{team.Seed} {team.Region}
                </span>
                <span className="text-xs font-mono text-white/60">{team.Conference}</span>
              </div>
              
              <h3 className="text-xl font-bold chalk-text group-hover:text-yellow-200 transition-colors">
                {team.TeamName}
              </h3>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-white/50 font-mono">Elo Rating</span>
                <span className="font-mono font-bold text-emerald-300 text-lg">{team.Rating}</span>
              </div>

              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase text-white/50 font-mono">Record</span>
                <span className="font-mono text-white/90">{team.Wins}-{team.Losses}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="chalk-border p-6 bg-slate-900 w-full max-w-lg relative animate-fade-in">
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-mono px-2.5 py-1 rounded bg-yellow-400 text-gray-950 font-bold">
                #{selectedTeam.Seed} Seed
              </span>
              <span className="text-sm text-white/70 font-mono">{selectedTeam.Region} Region &bull; {selectedTeam.Conference}</span>
            </div>

            <h2 className="text-3xl font-bold chalk-text mb-4 text-yellow-300">{selectedTeam.TeamName}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-3 rounded border border-white/10 flex flex-col">
                <span className="text-xs text-white/60 uppercase font-mono">Elo Power Rating</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">{selectedTeam.Rating}</span>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10 flex flex-col">
                <span className="text-xs text-white/60 uppercase font-mono">Season Record</span>
                <span className="text-2xl font-bold font-mono text-white">{selectedTeam.Wins}W - {selectedTeam.Losses}L</span>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10 flex flex-col">
                <span className="text-xs text-white/60 uppercase font-mono flex items-center gap-1">
                  <Flame size={14} className="text-orange-400" /> Offense Rating
                </span>
                <span className="text-xl font-bold font-mono text-orange-300">{selectedTeam.OffenseRating}</span>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10 flex flex-col">
                <span className="text-xs text-white/60 uppercase font-mono flex items-center gap-1">
                  <Shield size={14} className="text-blue-400" /> Defense Rating
                </span>
                <span className="text-xl font-bold font-mono text-blue-300">{selectedTeam.DefenseRating}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTeam(null)}
              className="chalk-button w-full py-2.5 text-center font-bold"
            >
              CLOSE DETAILS
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
