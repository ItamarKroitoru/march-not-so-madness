"use client";

import { useState } from "react";
import { enrichedTeams, EnrichedTeam } from "../../lib/teamsData";
import { defaultPredictor } from "../../lib/predictor";
import { Trophy, Play, RefreshCw, Zap } from "lucide-react";

interface Matchup {
  id: string;
  roundName: string;
  team1: EnrichedTeam;
  team2: EnrichedTeam;
  winner?: EnrichedTeam;
  prob1?: number;
  prob2?: number;
}

export default function BracketPage() {
  const [selectedRegion, setSelectedRegion] = useState<"East" | "West" | "South" | "Midwest">("East");
  const [simulated, setSimulated] = useState(false);
  const [simulatedMatchups, setSimulatedMatchups] = useState<Record<string, Matchup[]>>({});
  const [champion, setChampion] = useState<EnrichedTeam | null>(null);

  const handleSimulate = () => {
    const regionNames: Array<"East" | "West" | "South" | "Midwest"> = ["East", "West", "South", "Midwest"];
    const results: Record<string, Matchup[]> = {};
    const regionalWinners: EnrichedTeam[] = [];

    regionNames.forEach((region) => {
      const regionTeams = enrichedTeams.filter((t) => t.Region === region).sort((a, b) => a.Seed - b.Seed);
      
      // First round matchups (Seed 1 vs 16, 8 vs 9, 5 vs 12, etc.)
      const round1Pairs: [number, number][] = [
        [1, 16], [8, 9], [5, 12], [4, 13],
        [6, 11], [3, 14], [7, 10], [2, 15]
      ];

      let currentRoundTeams: EnrichedTeam[] = [];
      const matchups: Matchup[] = [];

      // Round of 64
      round1Pairs.forEach(([seedA, seedB], idx) => {
        const teamA = regionTeams.find((t) => t.Seed === seedA) || regionTeams[0];
        const teamB = regionTeams.find((t) => t.Seed === seedB) || regionTeams[regionTeams.length - 1];

        const pred = defaultPredictor.predict(teamA, teamB);
        const winner = pred.probTeam1 >= pred.probTeam2 ? teamA : teamB;

        currentRoundTeams.push(winner);
        matchups.push({
          id: `${region}-R1-${idx}`,
          roundName: "Round of 64",
          team1: teamA,
          team2: teamB,
          winner,
          prob1: pred.probTeam1,
          prob2: pred.probTeam2,
        });
      });

      // Round of 32
      const round2Teams: EnrichedTeam[] = [];
      for (let i = 0; i < currentRoundTeams.length; i += 2) {
        const teamA = currentRoundTeams[i];
        const teamB = currentRoundTeams[i + 1];
        const pred = defaultPredictor.predict(teamA, teamB);
        const winner = pred.probTeam1 >= pred.probTeam2 ? teamA : teamB;
        round2Teams.push(winner);
        matchups.push({
          id: `${region}-R2-${i / 2}`,
          roundName: "Round of 32",
          team1: teamA,
          team2: teamB,
          winner,
          prob1: pred.probTeam1,
          prob2: pred.probTeam2,
        });
      }

      // Sweet 16
      const s16Teams: EnrichedTeam[] = [];
      for (let i = 0; i < round2Teams.length; i += 2) {
        const teamA = round2Teams[i];
        const teamB = round2Teams[i + 1];
        const pred = defaultPredictor.predict(teamA, teamB);
        const winner = pred.probTeam1 >= pred.probTeam2 ? teamA : teamB;
        s16Teams.push(winner);
        matchups.push({
          id: `${region}-S16-${i / 2}`,
          roundName: "Sweet 16",
          team1: teamA,
          team2: teamB,
          winner,
          prob1: pred.probTeam1,
          prob2: pred.probTeam2,
        });
      }

      // Elite 8 (Regional Final)
      const teamA = s16Teams[0];
      const teamB = s16Teams[1];
      const pred = defaultPredictor.predict(teamA, teamB);
      const regWinner = pred.probTeam1 >= pred.probTeam2 ? teamA : teamB;
      matchups.push({
        id: `${region}-E8-0`,
        roundName: "Elite 8",
        team1: teamA,
        team2: teamB,
        winner: regWinner,
        prob1: pred.probTeam1,
        prob2: pred.probTeam2,
      });

      regionalWinners.push(regWinner);
      results[region] = matchups;
    });

    // Final Four Simulation
    const ff1 = defaultPredictor.predict(regionalWinners[0], regionalWinners[1]);
    const ffWinner1 = ff1.probTeam1 >= ff1.probTeam2 ? regionalWinners[0] : regionalWinners[1];

    const ff2 = defaultPredictor.predict(regionalWinners[2], regionalWinners[3]);
    const ffWinner2 = ff2.probTeam1 >= ff2.probTeam2 ? regionalWinners[2] : regionalWinners[3];

    // Championship Game
    const champPred = defaultPredictor.predict(ffWinner1, ffWinner2);
    const tournamentChamp = champPred.probTeam1 >= champPred.probTeam2 ? ffWinner1 : ffWinner2;

    setSimulatedMatchups(results);
    setChampion(tournamentChamp);
    setSimulated(true);
  };

  const currentMatchups = simulatedMatchups[selectedRegion] || [];

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8">
      
      {/* Header Banner */}
      <div className="chalk-border px-6 py-6 text-center w-full mb-8 bg-black/20">
        <h1 className="text-3xl md:text-5xl font-bold chalk-text uppercase tracking-wider flex items-center justify-center gap-3">
          <Trophy className="text-yellow-400" size={40} />
          <span>TOURNAMENT BRACKET SIMULATOR</span>
        </h1>
        <p className="text-lg chalk-text opacity-85 italic mt-2">
          Simulate all 63 tournament matchups using Elo rating win probabilities
        </p>

        <button
          onClick={handleSimulate}
          className="chalk-button px-8 py-3 text-xl font-bold mt-4 inline-flex items-center gap-3 shadow-lg bg-yellow-400/20 text-yellow-300 border-yellow-400/60 hover:bg-yellow-400/30"
        >
          {simulated ? <RefreshCw size={24} /> : <Play size={24} />}
          {simulated ? "RE-SIMULATE BRACKET" : "SIMULATE FULL TOURNAMENT"}
        </button>
      </div>

      {/* Champion Banner */}
      {champion && (
        <div className="chalk-border p-6 mb-8 text-center bg-gradient-to-r from-yellow-900/40 via-amber-800/40 to-yellow-900/40 border-yellow-400/60 animate-fade-in">
          <span className="text-xs uppercase font-mono tracking-widest text-yellow-300">PREDICTED 2026 NATIONAL CHAMPION</span>
          <h2 className="text-4xl font-extrabold chalk-text text-yellow-300 my-2 flex items-center justify-center gap-3">
            <Trophy size={36} className="text-yellow-400 animate-bounce" />
            {champion.TeamName}
            <Trophy size={36} className="text-yellow-400 animate-bounce" />
          </h2>
          <p className="text-white/80 font-mono">
            #{champion.Seed} Seed &bull; {champion.Region} Region &bull; Power Rating: {champion.Rating}
          </p>
        </div>
      )}

      {/* Region Selector Tabs */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {(["East", "West", "South", "Midwest"] as const).map((region) => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            className={`px-5 py-2.5 rounded-lg text-lg font-bold transition-all ${
              selectedRegion === region
                ? "bg-emerald-600 text-white border-2 border-emerald-400 shadow-md"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            {region} Region
          </button>
        ))}
      </div>

      {/* Region Matchups Display */}
      {!simulated ? (
        <div className="chalk-border p-12 text-center bg-black/20">
          <Zap size={48} className="mx-auto text-yellow-400 mb-4 opacity-80" />
          <h3 className="text-2xl font-bold chalk-text mb-2">Bracket Ready to Simulate</h3>
          <p className="text-white/70 max-w-md mx-auto">
            Click the &quot;SIMULATE FULL TOURNAMENT&quot; button above to simulate all 4 region brackets and predict the 2026 Champion.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {["Round of 64", "Round of 32", "Sweet 16", "Elite 8"].map((round) => {
            const matches = currentMatchups.filter((m) => m.roundName === round);
            return (
              <div key={round} className="bg-black/30 p-5 rounded-xl border border-white/20">
                <h3 className="text-2xl font-bold chalk-text text-yellow-300 border-b border-white/10 pb-2 mb-4">
                  {round} &bull; {selectedRegion}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="chalk-border p-3.5 bg-black/40 flex flex-col justify-between"
                    >
                      {/* Team 1 */}
                      <div
                        className={`flex justify-between items-center p-2 rounded ${
                          m.winner?.TeamID === m.team1.TeamID
                            ? "bg-emerald-800/60 font-bold border border-emerald-400/50"
                            : "opacity-75"
                        }`}
                      >
                        <span className="font-mono text-sm">
                          <span className="text-yellow-300 font-bold mr-1.5">#{m.team1.Seed}</span>
                          {m.team1.TeamName}
                        </span>
                        <span className="font-mono text-xs text-emerald-300 font-bold">
                          {((m.prob1 || 0) * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="text-center text-[10px] text-white/40 my-1 font-mono uppercase">VS</div>

                      {/* Team 2 */}
                      <div
                        className={`flex justify-between items-center p-2 rounded ${
                          m.winner?.TeamID === m.team2.TeamID
                            ? "bg-emerald-800/60 font-bold border border-emerald-400/50"
                            : "opacity-75"
                        }`}
                      >
                        <span className="font-mono text-sm">
                          <span className="text-yellow-300 font-bold mr-1.5">#{m.team2.Seed}</span>
                          {m.team2.TeamName}
                        </span>
                        <span className="font-mono text-xs text-blue-300 font-bold">
                          {((m.prob2 || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
