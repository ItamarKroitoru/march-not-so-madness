"use client";

import { useState } from "react";
import { enrichedTeams, EnrichedTeam } from "../../lib/teamsData";
import { predictMatchup } from "../../lib/predictor";
import { Trophy, Play, RefreshCw, Shield, MapPin, Tv, Eye, ChevronRight } from "lucide-react";

interface Matchup {
  id: string;
  roundName: string;
  region: "East" | "West" | "South" | "Midwest";
  team1: EnrichedTeam;
  team2: EnrichedTeam;
  winner?: EnrichedTeam;
  prob1?: number;
  prob2?: number;
}

const REGION_CITIES: Record<string, string> = {
  South: "LOUISVILLE",
  East: "NEW YORK",
  Midwest: "KANSAS CITY",
  West: "LAS VEGAS",
};

const ROUND1_PAIRS: [number, number][] = [
  [1, 16], [8, 9], [5, 12], [4, 13],
  [6, 11], [3, 14], [7, 10], [2, 15]
];

export default function BracketPage() {
  const [simulated, setSimulated] = useState(false);
  const [simulatedMatchups, setSimulatedMatchups] = useState<Record<string, Matchup[]>>({});
  const [finalFour, setFinalFour] = useState<{
    southWinner?: EnrichedTeam;
    eastWinner?: EnrichedTeam;
    midwestWinner?: EnrichedTeam;
    westWinner?: EnrichedTeam;
    semi1Winner?: EnrichedTeam;
    semi2Winner?: EnrichedTeam;
    semi1Prob1?: number;
    semi1Prob2?: number;
    semi2Prob1?: number;
    semi2Prob2?: number;
    champProb1?: number;
    champProb2?: number;
  }>({});
  const [champion, setChampion] = useState<EnrichedTeam | null>(null);
  const [viewMode, setViewMode] = useState<string>("full");

  const handleSimulate = () => {
    // Simulate 4 Regions
    const regionNames: Array<"South" | "East" | "Midwest" | "West"> = ["South", "East", "Midwest", "West"];
    const results: Record<string, Matchup[]> = {};
    const regionalWinnersMap: Record<string, EnrichedTeam> = {};

    regionNames.forEach((region) => {
      const regionTeams = enrichedTeams.filter((t) => t.Region === region).sort((a, b) => a.Seed - b.Seed);
      const currentRoundTeams: EnrichedTeam[] = [];
      const matchups: Matchup[] = [];

      // Round 1 (Round of 64) - 8 pairs
      ROUND1_PAIRS.forEach(([seedA, seedB], idx) => {
        const teamA = regionTeams.find((t) => t.Seed === seedA) || regionTeams[0];
        const teamB = regionTeams.find((t) => t.Seed === seedB) || regionTeams[regionTeams.length - 1];

        const pred = predictMatchup(teamA, teamB);
        const winner = pred.probTeam1 >= pred.probTeam2 ? teamA : teamB;

        currentRoundTeams.push(winner);
        matchups.push({
          id: `${region}-R1-${idx}`,
          roundName: "Round of 64",
          region,
          team1: teamA,
          team2: teamB,
          winner,
          prob1: pred.probTeam1,
          prob2: pred.probTeam2,
        });
      });

      // Round 2 (Round of 32) - 4 pairs
      const round2Teams: EnrichedTeam[] = [];
      for (let i = 0; i < currentRoundTeams.length; i += 2) {
        const teamA = currentRoundTeams[i];
        const teamB = currentRoundTeams[i + 1];
        const pred = predictMatchup(teamA, teamB);
        const winner = pred.probTeam1 >= pred.probTeam2 ? teamA : teamB;
        round2Teams.push(winner);
        matchups.push({
          id: `${region}-R2-${i / 2}`,
          roundName: "Round of 32",
          region,
          team1: teamA,
          team2: teamB,
          winner,
          prob1: pred.probTeam1,
          prob2: pred.probTeam2,
        });
      }

      // Round 3 (Sweet 16) - 2 pairs
      const s16Teams: EnrichedTeam[] = [];
      for (let i = 0; i < round2Teams.length; i += 2) {
        const teamA = round2Teams[i];
        const teamB = round2Teams[i + 1];
        const pred = predictMatchup(teamA, teamB);
        const winner = pred.probTeam1 >= pred.probTeam2 ? teamA : teamB;
        s16Teams.push(winner);
        matchups.push({
          id: `${region}-S16-${i / 2}`,
          roundName: "Sweet 16",
          region,
          team1: teamA,
          team2: teamB,
          winner,
          prob1: pred.probTeam1,
          prob2: pred.probTeam2,
        });
      }

      // Round 4 (Elite 8) - 1 pair
      const teamA = s16Teams[0];
      const teamB = s16Teams[1];
      const pred = predictMatchup(teamA, teamB);
      const regWinner = pred.probTeam1 >= pred.probTeam2 ? teamA : teamB;
      matchups.push({
        id: `${region}-E8-0`,
        roundName: "Elite 8",
        region,
        team1: teamA,
        team2: teamB,
        winner: regWinner,
        prob1: pred.probTeam1,
        prob2: pred.probTeam2,
      });

      regionalWinnersMap[region] = regWinner;
      results[region] = matchups;
    });

    // 3. Final Four & Championship
    const southWinner = regionalWinnersMap["South"];
    const eastWinner = regionalWinnersMap["East"];
    const midwestWinner = regionalWinnersMap["Midwest"];
    const westWinner = regionalWinnersMap["West"];

    const semi1 = predictMatchup(southWinner, eastWinner);
    const semi1Winner = semi1.probTeam1 >= semi1.probTeam2 ? southWinner : eastWinner;

    const semi2 = predictMatchup(midwestWinner, westWinner);
    const semi2Winner = semi2.probTeam1 >= semi2.probTeam2 ? midwestWinner : westWinner;

    const champPred = predictMatchup(semi1Winner, semi2Winner);
    const champWinner = champPred.probTeam1 >= champPred.probTeam2 ? semi1Winner : semi2Winner;

    setSimulatedMatchups(results);
    setFinalFour({
      southWinner,
      eastWinner,
      midwestWinner,
      westWinner,
      semi1Winner,
      semi2Winner,
      semi1Prob1: semi1.probTeam1,
      semi1Prob2: semi1.probTeam2,
      semi2Prob1: semi2.probTeam1,
      semi2Prob2: semi2.probTeam2,
      champProb1: champPred.probTeam1,
      champProb2: champPred.probTeam2,
    });
    setChampion(champWinner);
    setSimulated(true);
  };

  // Render individual team box in bracket line
  const renderTeamBox = (team?: EnrichedTeam, isWinner?: boolean, prob?: number, align: "left" | "right" = "left") => {
    if (!team) {
      return (
        <div className="h-7 bg-white/5 border border-white/10 rounded px-2 flex items-center justify-between text-xs text-white/30 italic">
          TBD
        </div>
      );
    }

    return (
      <div
        className={`h-7 px-2 border rounded flex items-center justify-between transition-all duration-200 text-xs font-mono select-none ${
          isWinner
            ? "team-slot-winner bg-emerald-950/80 border-emerald-400 text-white font-extrabold shadow-sm"
            : "bg-black/40 border-white/20 text-white/80 hover:bg-black/60"
        }`}
      >
        <div className={`flex items-center gap-1.5 overflow-hidden ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
          <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-1 rounded border border-amber-400/30">
            {team.Seed}
          </span>
          <span className="truncate font-semibold tracking-tight text-[11px]">
            {team.TeamName}
          </span>
        </div>
        {simulated && prob !== undefined && (
          <span className={`text-[10px] font-mono px-1 rounded ml-1 ${isWinner ? "text-emerald-300 font-bold" : "text-white/40"}`}>
            {(prob * 100).toFixed(0)}%
          </span>
        )}
      </div>
    );
  };

  // Render Region Tree Column Group
  const renderRegionTree = (region: "South" | "East" | "Midwest" | "West", direction: "left" | "right") => {
    const matchups = simulatedMatchups[region] || [];
    const r1 = matchups.filter((m) => m.roundName === "Round of 64");
    const r2 = matchups.filter((m) => m.roundName === "Round of 32");
    const s16 = matchups.filter((m) => m.roundName === "Sweet 16");
    const e8 = matchups.filter((m) => m.roundName === "Elite 8");

    // If not simulated yet, fallback to default seed pairings
    const regionTeams = enrichedTeams.filter((t) => t.Region === region).sort((a, b) => a.Seed - b.Seed);

    const isLeft = direction === "left";

    return (
      <div className="flex-1 flex flex-col justify-between py-2 bg-black/15 rounded-xl border border-white/10 p-3 shadow-inner">
        {/* Region Title Banner */}
        <div className={`flex items-center justify-between border-b border-amber-400/30 pb-2 mb-2 ${isLeft ? "" : "flex-row-reverse"}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-amber-400 uppercase tracking-widest font-mono chalk-text">
              {region}
            </span>
            <span className="text-[11px] text-white/60 font-mono bg-white/10 px-2 py-0.5 rounded uppercase flex items-center gap-1">
              <MapPin size={10} className="text-amber-400" />
              {REGION_CITIES[region]}
            </span>
          </div>
          <span className="text-[10px] font-mono text-white/40 uppercase">REGIONAL BRACKET</span>
        </div>

        {/* 4 Columns for R1, R2, S16, E8 */}
        <div className={`grid grid-cols-4 gap-2 flex-1 items-stretch ${isLeft ? "" : "direction-rtl"}`}>
          {/* ROUND 1 */}
          <div className="flex flex-col justify-between space-y-2">
            {ROUND1_PAIRS.map(([seedA, seedB], idx) => {
              const m = r1[idx];
              const teamA = m ? m.team1 : regionTeams.find((t) => t.Seed === seedA);
              const teamB = m ? m.team2 : regionTeams.find((t) => t.Seed === seedB);
              const isWinnerA = m?.winner?.TeamID === teamA?.TeamID;
              const isWinnerB = m?.winner?.TeamID === teamB?.TeamID;

              return (
                <div key={`r1-${region}-${idx}`} className="flex flex-col justify-center space-y-1 relative my-auto">
                  {renderTeamBox(teamA, isWinnerA, m?.prob1, isLeft ? "left" : "right")}
                  {renderTeamBox(teamB, isWinnerB, m?.prob2, isLeft ? "left" : "right")}
                </div>
              );
            })}
          </div>

          {/* ROUND 2 */}
          <div className="flex flex-col justify-around py-4 space-y-4">
            {[0, 1, 2, 3].map((idx) => {
              const m = r2[idx];
              const isWinnerA = m?.winner?.TeamID === m?.team1?.TeamID;
              const isWinnerB = m?.winner?.TeamID === m?.team2?.TeamID;

              return (
                <div key={`r2-${region}-${idx}`} className="flex flex-col justify-center space-y-1.5 relative my-auto">
                  {renderTeamBox(m?.team1, isWinnerA, m?.prob1, isLeft ? "left" : "right")}
                  {renderTeamBox(m?.team2, isWinnerB, m?.prob2, isLeft ? "left" : "right")}
                </div>
              );
            })}
          </div>

          {/* SWEET 16 */}
          <div className="flex flex-col justify-around py-8 space-y-8">
            {[0, 1].map((idx) => {
              const m = s16[idx];
              const isWinnerA = m?.winner?.TeamID === m?.team1?.TeamID;
              const isWinnerB = m?.winner?.TeamID === m?.team2?.TeamID;

              return (
                <div key={`s16-${region}-${idx}`} className="flex flex-col justify-center space-y-2 relative my-auto">
                  {renderTeamBox(m?.team1, isWinnerA, m?.prob1, isLeft ? "left" : "right")}
                  {renderTeamBox(m?.team2, isWinnerB, m?.prob2, isLeft ? "left" : "right")}
                </div>
              );
            })}
          </div>

          {/* ELITE 8 */}
          <div className="flex flex-col justify-center py-12 my-auto">
            {(() => {
              const m = e8[0];
              const isWinnerA = m?.winner?.TeamID === m?.team1?.TeamID;
              const isWinnerB = m?.winner?.TeamID === m?.team2?.TeamID;

              return (
                <div className="flex flex-col justify-center space-y-2 relative">
                  <div className="text-[10px] text-center font-mono text-amber-300/80 mb-1 uppercase font-bold">
                    E8 FINALIST
                  </div>
                  {renderTeamBox(m?.team1, isWinnerA, m?.prob1, isLeft ? "left" : "right")}
                  {renderTeamBox(m?.team2, isWinnerB, m?.prob2, isLeft ? "left" : "right")}
                  {m?.winner && (
                    <div className="mt-2 text-center bg-amber-500/20 border border-amber-400/40 rounded p-1">
                      <span className="text-[10px] font-mono text-amber-300 uppercase block">REGIONAL CHAMP</span>
                      <span className="text-xs font-bold text-white truncate block">
                        #{m.winner.Seed} {m.winner.TeamName}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-[1600px] mx-auto p-2 sm:p-4 text-white">

      {/* TOP CHAMPIONSHIP TITLE BANNER (OFFICIAL NCAA STYLE) */}
      <div className="ncaa-header-gradient rounded-xl p-4 sm:p-6 mb-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Trophy size={260} className="text-amber-400" />
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-xs font-mono uppercase tracking-widest mb-1">
              <Shield size={14} className="text-red-400" /> Official Tournament Bracket Layout
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-mono tracking-tight text-white uppercase chalk-text flex items-center gap-3">
              <span>2026 NCAA DIVISION I MEN&apos;S BASKETBALL CHAMPIONSHIP</span>
            </h1>
            <p className="text-sm text-slate-300 font-mono mt-1 flex items-center justify-center lg:justify-start gap-4">
              <span>64 Teams &bull; 4 Regions &bull; Elo Predictor Engine</span>
            </p>
          </div>

          {/* Action Simulation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulate}
              className="chalk-button px-6 py-3 text-lg font-bold inline-flex items-center gap-2.5 shadow-xl bg-amber-500/30 text-amber-300 border-amber-400/80 hover:bg-amber-500/40 rounded-xl"
            >
              {simulated ? <RefreshCw size={22} className="animate-spin-slow" /> : <Play size={22} />}
              {simulated ? "RE-SIMULATE BRACKET" : "SIMULATE TOURNAMENT"}
            </button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center justify-between border-t border-white/10 mt-5 pt-3 flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
            <span className="text-xs font-mono text-white/50 px-2 uppercase flex items-center gap-1">
              <Eye size={12} /> View:
            </span>
            <button
              onClick={() => setViewMode("full")}
              className={`px-3 py-1 rounded text-xs font-bold font-mono transition-all ${
                viewMode === "full" ? "bg-amber-500 text-black shadow" : "text-white/70 hover:text-white"
              }`}
            >
              Full Poster Bracket
            </button>
            {(["South", "East", "Midwest", "West"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setViewMode(r)}
                className={`px-3 py-1 rounded text-xs font-bold font-mono transition-all ${
                  viewMode === r ? "bg-emerald-600 text-white shadow" : "text-white/70 hover:text-white"
                }`}
              >
                {r} Region
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-white/60">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Higher Seed</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Predicted Winner</span>
          </div>
        </div>
      </div>

      {/* TOP ROUND HEADERS BAR */}
      <div className="hidden lg:grid grid-cols-11 gap-2 bg-black/40 border border-white/10 p-2 rounded-lg mb-4 text-center text-xs font-mono font-bold uppercase text-amber-300">
        <div className="col-span-2 text-left pl-2">FIRST ROUND</div>
        <div className="col-span-1">SECOND ROUND</div>
        <div className="col-span-1">SWEET 16</div>
        <div className="col-span-1">ELITE 8</div>
        <div className="col-span-3 text-center text-amber-400 font-extrabold text-sm">FINAL FOUR & CHAMPIONSHIP</div>
        <div className="col-span-1">ELITE 8</div>
        <div className="col-span-1">SWEET 16</div>
        <div className="col-span-1">SECOND ROUND</div>
        <div className="col-span-1 text-right pr-2">FIRST ROUND</div>
      </div>

      {/* FULL POSTER BRACKET VIEW (2 LEFT REGIONS, CENTERPIECE, 2 RIGHT REGIONS) */}
      {viewMode === "full" ? (
        <div className="overflow-x-auto pb-6">
          <div className="bracket-container flex flex-col gap-6">

            {/* MAIN TOURNAMENT BOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch min-w-[1280px]">
              
              {/* LEFT HALF (SOUTH & EAST REGIONS) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* SOUTH REGION (TOP LEFT) */}
                {renderRegionTree("South", "left")}

                {/* EAST REGION (BOTTOM LEFT) */}
                {renderRegionTree("East", "left")}
              </div>

              {/* CENTERPIECE COLUMN (FINAL FOUR & CHAMPIONSHIP) */}
              <div className="lg:col-span-3 flex flex-col justify-between items-center bg-slate-950/70 border-2 border-amber-400/40 rounded-2xl p-4 shadow-2xl relative">
                
                {/* FINAL FOUR LOGO BADGE */}
                <div className="text-center border-b border-amber-400/30 pb-4 w-full">
                  <div className="w-16 h-16 mx-auto bg-amber-400/20 border-2 border-amber-400 rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <Trophy size={32} className="text-amber-400 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-extrabold font-mono tracking-widest text-amber-400 uppercase chalk-text">
                    NCAA FINAL FOUR
                  </h2>
                  <p className="text-xs font-mono text-white/60">INDIANAPOLIS, IN &bull; APRIL 2026</p>
                </div>

                {/* NATIONAL SEMIFINAL 1 (LEFT SIDE) */}
                <div className="w-full bg-black/60 border border-slate-700 rounded-xl p-3 my-3">
                  <div className="flex justify-between items-center text-xs font-mono text-amber-300 font-bold border-b border-white/10 pb-1.5 mb-2">
                    <span>SEMIFINAL 1</span>
                    <span className="text-[10px] text-white/50">SOUTH vs EAST</span>
                  </div>
                  <div className="space-y-1.5">
                    {renderTeamBox(
                      finalFour.southWinner,
                      finalFour.semi1Winner?.TeamID === finalFour.southWinner?.TeamID,
                      finalFour.semi1Prob1
                    )}
                    {renderTeamBox(
                      finalFour.eastWinner,
                      finalFour.semi1Winner?.TeamID === finalFour.eastWinner?.TeamID,
                      finalFour.semi1Prob2
                    )}
                  </div>
                </div>

                {/* NATIONAL CHAMPIONSHIP BOX */}
                <div className="w-full bg-gradient-to-b from-amber-950/80 via-slate-900/90 to-amber-950/80 border-2 border-amber-400 p-4 rounded-xl text-center shadow-xl relative overflow-hidden">
                  <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-widest block mb-1">
                    NATIONAL CHAMPIONSHIP GAME
                  </span>

                  <div className="grid grid-cols-2 gap-2 my-2">
                    <div className="bg-black/50 border border-white/20 p-2 rounded">
                      <span className="text-[10px] font-mono text-white/40 block">LEFT FINALIST</span>
                      <span className="text-xs font-bold truncate block text-amber-300">
                        {finalFour.semi1Winner ? `#${finalFour.semi1Winner.Seed} ${finalFour.semi1Winner.TeamName}` : "TBD"}
                      </span>
                    </div>
                    <div className="bg-black/50 border border-white/20 p-2 rounded">
                      <span className="text-[10px] font-mono text-white/40 block">RIGHT FINALIST</span>
                      <span className="text-xs font-bold truncate block text-amber-300">
                        {finalFour.semi2Winner ? `#${finalFour.semi2Winner.Seed} ${finalFour.semi2Winner.TeamName}` : "TBD"}
                      </span>
                    </div>
                  </div>

                  {/* PREDICTED CHAMPION HIGHLIGHT */}
                  {champion ? (
                    <div className="mt-3 pt-3 border-t border-amber-400/40 bg-emerald-950/90 border border-emerald-400 p-3 rounded-lg animate-fade-in shadow-inner">
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-300 tracking-wider block">
                        2026 PREDICTED NATIONAL CHAMPION
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-amber-300 font-mono my-1 flex items-center justify-center gap-2">
                        <Trophy size={20} className="text-amber-400" />
                        {champion.TeamName}
                      </h3>
                      <p className="text-[11px] text-white/80 font-mono">
                        #{champion.Seed} Seed &bull; {champion.Region} Region &bull; Power Rating: {champion.Rating}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs font-mono text-white/40 italic py-2">
                      Simulate tournament to reveal predicted champion
                    </div>
                  )}
                </div>

                {/* NATIONAL SEMIFINAL 2 (RIGHT SIDE) */}
                <div className="w-full bg-black/60 border border-slate-700 rounded-xl p-3 my-3">
                  <div className="flex justify-between items-center text-xs font-mono text-amber-300 font-bold border-b border-white/10 pb-1.5 mb-2">
                    <span>SEMIFINAL 2</span>
                    <span className="text-[10px] text-white/50">MIDWEST vs WEST</span>
                  </div>
                  <div className="space-y-1.5">
                    {renderTeamBox(
                      finalFour.midwestWinner,
                      finalFour.semi2Winner?.TeamID === finalFour.midwestWinner?.TeamID,
                      finalFour.semi2Prob1
                    )}
                    {renderTeamBox(
                      finalFour.westWinner,
                      finalFour.semi2Winner?.TeamID === finalFour.westWinner?.TeamID,
                      finalFour.semi2Prob2
                    )}
                  </div>
                </div>

                {/* NETWORK & SPONSOR LOGOS FOOTER */}
                <div className="w-full border-t border-slate-800 pt-3 flex items-center justify-around text-white/40 text-[10px] font-mono">
                  <div className="flex items-center gap-1 font-extrabold text-white/60">
                    <Tv size={12} className="text-amber-400" /> CBS SPORTS
                  </div>
                  <span>&bull;</span>
                  <div className="font-bold text-white/60">TBS</div>
                  <span>&bull;</span>
                  <div className="font-bold text-white/60">TNT</div>
                  <span>&bull;</span>
                  <div className="font-bold text-white/60">truTV</div>
                </div>
              </div>

              {/* RIGHT HALF (MIDWEST & WEST REGIONS) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* MIDWEST REGION (TOP RIGHT) */}
                {renderRegionTree("Midwest", "right")}

                {/* WEST REGION (BOTTOM RIGHT) */}
                {renderRegionTree("West", "right")}
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* SINGLE REGION ZOOMED VIEW */
        <div className="bg-black/30 p-4 rounded-xl border border-white/20">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
            <h2 className="text-2xl font-bold font-mono text-amber-300">
              {viewMode} Region Detailed View
            </h2>
            <button
              onClick={() => setViewMode("full")}
              className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
            >
              Back to Full Poster Bracket <ChevronRight size={14} />
            </button>
          </div>
          {renderRegionTree(viewMode as "East" | "West" | "South" | "Midwest", viewMode === "South" || viewMode === "East" ? "left" : "right")}
        </div>
      )}

    </main>
  );
}
