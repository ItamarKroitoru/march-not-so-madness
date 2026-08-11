"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ArrowUpDown, Trophy, X, Calendar } from "lucide-react";
import { TeamState } from "../../lib/types";

export default function TeamsPage() {
  const [seasons, setSeasons] = useState<number[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(2026);
  const [teams, setTeams] = useState<TeamState[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"Rating" | "Wins" | "PPG" | "WinPct">("Rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTeam, setSelectedTeam] = useState<TeamState | null>(null);

  // Load Seasons on Mount
  useEffect(() => {
    fetch("/api/seasons")
      .then((res) => res.json())
      .then((data) => {
        if (data.seasons && data.seasons.length > 0) {
          setSeasons(data.seasons);
        }
      })
      .catch((err) => console.error("Failed to load seasons:", err));
  }, []);

  // Fetch Teams when Season Changes
  useEffect(() => {
    setLoading(true);
    fetch(`/api/teams?season=${selectedSeason}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.teams) {
          setTeams(data.teams);
        }
      })
      .catch((err) => console.error("Failed to load teams:", err))
      .finally(() => setLoading(false));
  }, [selectedSeason]);

  const filteredTeams = useMemo(() => {
    return teams
      .filter((team) => team.TeamName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (sortBy === "Rating") {
          valA = a.Rating ?? 0;
          valB = b.Rating ?? 0;
        } else if (sortBy === "Wins") {
          valA = a.team_wins;
          valB = b.team_wins;
        } else if (sortBy === "PPG") {
          valA = a.team_ppg;
          valB = b.team_ppg;
        } else if (sortBy === "WinPct") {
          valA = a.team_win_pct;
          valB = b.team_win_pct;
        }

        return sortOrder === "desc" ? valB - valA : valA - valB;
      });
  }, [teams, search, sortBy, sortOrder]);

  const toggleSort = (field: "Rating" | "Wins" | "PPG" | "WinPct") => {
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
      <div className="chalk-border px-6 py-6 text-center w-full mb-8 bg-black/20 relative">
        <h1 className="text-3xl md:text-5xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center gap-3">
          <Trophy className="text-yellow-300" size={36} />
          <span>TEAMS EXPLORER</span>
        </h1>
        <p className="text-lg chalk-text opacity-85 italic mt-2">
          Inspect multi-season metrics, power ratings, and efficiency stats across 2003 &ndash; 2026
        </p>

        {/* Season Selector */}
        <div className="mt-4 inline-flex items-center gap-2 bg-black/60 border border-amber-400/40 px-4 py-2 rounded-xl">
          <Calendar size={18} className="text-amber-400" />
          <span className="text-xs uppercase font-mono text-white/70 font-bold">Season:</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="bg-transparent text-sm font-mono font-extrabold text-amber-300 focus:outline-none cursor-pointer"
          >
            {seasons.map((yr) => (
              <option key={yr} value={yr} className="bg-slate-900 text-white">
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Controls: Search, Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-black/30 p-4 rounded-xl border border-white/20">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 text-white/50" size={18} />
          <input
            type="text"
            placeholder={`Search ${selectedSeason} team name...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="chalk-input pl-10 pr-4 py-2.5 w-full text-base"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto">
          <span className="text-xs text-white/60 font-mono uppercase shrink-0">Sort by:</span>
          <button
            onClick={() => toggleSort("Rating")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1 shrink-0 ${
              sortBy === "Rating" ? "bg-emerald-600 border-emerald-400 text-white font-bold" : "border-white/20 text-white/80"
            }`}
          >
            Power Rating {sortBy === "Rating" && <ArrowUpDown size={12} />}
          </button>
          <button
            onClick={() => toggleSort("Wins")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1 shrink-0 ${
              sortBy === "Wins" ? "bg-emerald-600 border-emerald-400 text-white font-bold" : "border-white/20 text-white/80"
            }`}
          >
            Wins {sortBy === "Wins" && <ArrowUpDown size={12} />}
          </button>
          <button
            onClick={() => toggleSort("PPG")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1 shrink-0 ${
              sortBy === "PPG" ? "bg-emerald-600 border-emerald-400 text-white font-bold" : "border-white/20 text-white/80"
            }`}
          >
            PPG {sortBy === "PPG" && <ArrowUpDown size={12} />}
          </button>
          <button
            onClick={() => toggleSort("WinPct")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1 shrink-0 ${
              sortBy === "WinPct" ? "bg-emerald-600 border-emerald-400 text-white font-bold" : "border-white/20 text-white/80"
            }`}
          >
            Win % {sortBy === "WinPct" && <ArrowUpDown size={12} />}
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="text-center py-20 font-mono text-amber-300 animate-pulse text-lg">
          Loading {selectedSeason} team data...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTeams.map((team) => (
            <div
              key={team.TeamID}
              onClick={() => setSelectedTeam(team)}
              className="chalk-border p-4 bg-black/20 hover:bg-white/10 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {team.Season} Season
                  </span>
                  <span className="text-xs font-mono text-emerald-300 font-bold">{(team.team_win_pct * 100).toFixed(1)}% Win</span>
                </div>
                
                <h3 className="text-xl font-bold chalk-text group-hover:text-yellow-200 transition-colors">
                  {team.TeamName}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-sm font-mono">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-white/50">PPG / PAPG</span>
                  <span className="font-bold text-white text-xs">{team.team_ppg.toFixed(1)} / {team.team_papg.toFixed(1)}</span>
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase text-white/50">Record</span>
                  <span className="text-emerald-300 font-bold">{team.team_wins}W - {team.team_losses}L</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-400 text-gray-950 font-bold">
                {selectedTeam.Season} Season
              </span>
              <span className="text-sm text-white/70 font-mono">Record: {selectedTeam.team_wins}W - {selectedTeam.team_losses}L</span>
            </div>

            <h2 className="text-3xl font-bold chalk-text mb-4 text-yellow-300">{selectedTeam.TeamName}</h2>

            <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs">
              <div className="bg-white/5 p-3 rounded border border-white/10 flex flex-col">
                <span className="text-[10px] text-white/60 uppercase">Points Per Game</span>
                <span className="text-xl font-bold text-emerald-400">{selectedTeam.team_ppg.toFixed(1)}</span>
              </div>

              <div className="bg-white/5 p-3 rounded border border-white/10 flex flex-col">
                <span className="text-[10px] text-white/60 uppercase">Points Allowed / G</span>
                <span className="text-xl font-bold text-blue-300">{selectedTeam.team_papg.toFixed(1)}</span>
              </div>

              <div className="bg-white/5 p-3 rounded border border-white/10 flex flex-col">
                <span className="text-[10px] text-white/60 uppercase">Field Goal %</span>
                <span className="text-lg font-bold text-white">{(selectedTeam.team_fg_pct * 100).toFixed(1)}%</span>
              </div>

              <div className="bg-white/5 p-3 rounded border border-white/10 flex flex-col">
                <span className="text-[10px] text-white/60 uppercase">3-Point FG %</span>
                <span className="text-lg font-bold text-white">{(selectedTeam.team_fg3_pct * 100).toFixed(1)}%</span>
              </div>

              <div className="bg-white/5 p-3 rounded border border-white/10 flex flex-col">
                <span className="text-[10px] text-white/60 uppercase">Last 5 Games Win %</span>
                <span className="text-lg font-bold text-emerald-300">{(selectedTeam.team_last_5_win_pct * 100).toFixed(1)}%</span>
              </div>

              <div className="bg-white/5 p-3 rounded border border-white/10 flex flex-col">
                <span className="text-[10px] text-white/60 uppercase">Opponent Win %</span>
                <span className="text-lg font-bold text-amber-300">{(selectedTeam.team_avg_opponent_win_pct * 100).toFixed(1)}%</span>
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
