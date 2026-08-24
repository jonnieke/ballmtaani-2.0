import React, { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Trophy, CheckCircle2, Share2, Sparkles, Flame, User } from "lucide-react";

interface NominatedPlayer {
  id: string;
  name: string;
  team: string;
  position: string;
  votes: number;
}

interface MchezajiBoraVoteProps {
  matchTitle?: string;
  candidates?: NominatedPlayer[];
}

const DEFAULT_CANDIDATES: NominatedPlayer[] = [
  { id: "p1", name: "Derrick Okach", team: "Shabana FC", position: "Defender", votes: 412 },
  { id: "p2", name: "Austine Odhiambo", team: "Gor Mahia FC", position: "Midfielder", votes: 389 },
  { id: "p3", name: "Vincent Oburu", team: "AFC Leopards", position: "Striker", votes: 298 },
  { id: "p4", name: "Brian Otieno", team: "St. Anthony's Kitale", position: "Winger", votes: 245 },
];

export default function MchezajiBoraVote({
  matchTitle = "FKF-PL / Grassroots Feature Match",
  candidates = DEFAULT_CANDIDATES,
}: MchezajiBoraVoteProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [players, setPlayers] = useState<NominatedPlayer[]>(candidates);

  const totalVotes = players.reduce((sum, p) => sum + p.votes, 0);

  const handleVote = (id: string) => {
    if (hasVoted) return;
    setSelectedPlayerId(id);
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, votes: p.votes + 1 } : p))
    );
    setHasVoted(true);
  };

  const handleShareVote = () => {
    const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
    const text = `🗳️ *Nimepiga kura ya Mchezaji Bora (Man of the Match) kwa ${selectedPlayer?.name || "Player"} (${selectedPlayer?.team}) kwenye BallMtaani!*

Piga kura yako sasa na ushinde pointi za MTC:
https://ballmtaani.com/rewards`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="rounded-2xl border border-[#FFD700]/30 bg-gradient-to-r from-amber-950/20 via-[#141414] to-[#121212] p-6 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-amber-500/20 text-[#FFD700] flex items-center justify-center border border-amber-500/30">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              Mchezaji Bora (Man of the Match) Live Vote <Sparkles className="h-3.5 w-3.5 text-[#FFD700]" />
            </h3>
            <p className="text-[11px] text-gray-400">{matchTitle} • Total Votes: {totalVotes}</p>
          </div>
        </div>

        <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 text-[10px]">
          +50 MTC Per Vote
        </Badge>
      </div>

      {/* Candidate List */}
      <div className="space-y-2.5">
        {players.map((player) => {
          const pct = Math.round((player.votes / Math.max(1, totalVotes)) * 100);
          const isSelected = selectedPlayerId === player.id;

          return (
            <div
              key={player.id}
              onClick={() => handleVote(player.id)}
              className={`rounded-xl border p-3.5 transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "border-[#FFD700] bg-amber-950/30 ring-1 ring-[#FFD700]"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {/* Progress Fill if Voted */}
              {hasVoted && (
                <div
                  className="absolute inset-0 bg-[#FFD700]/10 transition-all duration-700 pointer-events-none"
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? "bg-[#FFD700] text-black"
                        : "bg-white/10 text-gray-300"
                    }`}
                  >
                    {isSelected ? <CheckCircle2 className="h-4 w-4" /> : <User className="h-3.5 w-3.5" />}
                  </div>

                  <div>
                    <span className="font-bold text-white text-xs block">{player.name}</span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {player.team} • {player.position}
                    </span>
                  </div>
                </div>

                {hasVoted ? (
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-[#FFD700]">{pct}%</span>
                    <span className="text-[10px] text-gray-400 block font-sans">{player.votes} votes</span>
                  </div>
                ) : (
                  <Button size="sm" className="h-7 text-[11px] bg-white/10 hover:bg-[#FFD700] hover:text-black font-bold">
                    Vote
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasVoted && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> You earned 50 MTC points!
          </span>

          <Button
            onClick={handleShareVote}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs h-7 gap-1"
          >
            <Share2 className="h-3 w-3" /> Share Your Vote
          </Button>
        </div>
      )}
    </div>
  );
}
