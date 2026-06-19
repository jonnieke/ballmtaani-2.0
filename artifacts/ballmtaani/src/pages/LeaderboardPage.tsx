import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLeaderboard, useWC26Leaderboard } from "../hooks/useData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Trophy, HelpCircle, Clock, Gift, Share2 } from "lucide-react";
import { LeaderboardShareCard } from "../components/LeaderboardShareCard";
import SEO from "../components/SEO";

type Tab = "weekly" | "global" | "wc26" | "country";

const WC26_LIVE = Date.now() >= new Date("2026-06-11T17:00:00Z").getTime() &&
                  Date.now() <  new Date("2026-07-20T00:00:00Z").getTime();

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>(WC26_LIVE ? "wc26" : "weekly");
  const { isLoggedIn, username, user } = useAuth();
  const [timeLeft, setTimeLeft] = useState("");
  const [sharePlayer, setSharePlayer] = useState<any | null>(null);

  const queryClient = useQueryClient();
  const { data: allRecords = [] } = useLeaderboard();
  const { data: wc26Records = [] } = useWC26Leaderboard();

  // ── Realtime: invalidate leaderboard when any profile coin balance changes ──
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("leaderboard-live")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => {
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
        queryClient.invalidateQueries({ queryKey: ["wc26-leaderboard"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Countdown to end of current week
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const nextSunday = new Date();
      nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7 || 7);
      nextSunday.setHours(23, 59, 59, 999);
      const diff = nextSunday.getTime() - now.getTime();
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  // Derive tab-specific record lists
  const userCountry = (user as any)?.user_metadata?.country || "KEN";
  const records: any[] = (() => {
    if (activeTab === "wc26") return wc26Records;
    if (activeTab === "country")
      return allRecords.filter((r: any) => (r.country || "KEN") === userCountry);
    return allRecords; // weekly + global both use the profiles-coin ranking
  })();

  const TABS: { id: Tab; label: string }[] = [
    { id: "weekly",  label: "This Week" },
    { id: "global",  label: "All-Time" },
    { id: "wc26",    label: "🏆 WC26 Calls" },
    { id: "country", label: "My Country" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <SEO
        title="Leaderboard | BallMtaani Fan Rankings"
        description="Kenya's top football predictors ranked by MTC points. Weekly prizes, WC26 call accuracy, and global standings."
        path="/leaderboard"
      />

      {sharePlayer && (
        <LeaderboardShareCard
          rank={sharePlayer.rank}
          username={sharePlayer.name}
          pts={sharePlayer.pts}
          streak={sharePlayer.streak}
          tab={activeTab}
          onClose={() => setSharePlayer(null)}
        />
      )}

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-[#FFD700] mb-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8" /> Leaderboard <Trophy className="w-8 h-8" />
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-wider">
          Kenyan fan status — calls, debates, and matchday receipts
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 sm:px-5 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-all ${
              activeTab === tab.id
                ? "bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                : "bg-[#1B1B1B] text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Weekly info strip */}
      {activeTab === "weekly" && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#B30000]/20 border border-[#B30000]/50 rounded-xl p-4 flex items-center gap-4">
            <Clock className="w-8 h-8 text-[#FFD700] animate-pulse shrink-0" />
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Resets In</div>
              <div className="text-2xl font-black text-white tabular-nums">{timeLeft}</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#FFD700]/20 to-amber-600/20 border border-[#FFD700]/30 rounded-xl p-4 flex items-center gap-4">
            <Gift className="w-8 h-8 text-[#FFD700] shrink-0" />
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Weekly Prizes</div>
              <div className="text-xl font-black text-[#FFD700]">1st 50k · 2nd 20k · 3rd 10k</div>
            </div>
          </div>
        </div>
      )}

      {/* WC26 info strip */}
      {activeTab === "wc26" && (
        <div className="mb-8 rounded-xl border border-[#FFD700]/25 bg-gradient-to-br from-[#110d00] to-[#09080d] px-5 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#FFD700] mb-1">WC26 Prediction Rankings</h2>
          <p className="text-[11px] text-white/40">
            Ranked by correct WC26 calls, then total calls locked in.
            Settle when each tournament phase completes.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1B1B1B] rounded-xl border border-white/10 shadow-2xl overflow-hidden mb-12">
        {records.length === 0 ? (
          <div className="py-16 text-center text-white/25 text-sm font-black uppercase tracking-widest">
            {activeTab === "country" ? `No ${userCountry} fans ranked yet` : "No data yet — be first"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="bg-[#0B0B0B] border-b border-white/10 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-4 py-4 w-16 text-center">Rank</th>
                  <th className="px-4 py-4">Fan</th>
                  <th className="px-4 py-4 text-center">Streak</th>
                  {activeTab === "wc26" ? (
                    <th className="px-4 py-4 text-right">Calls</th>
                  ) : (
                    <th className="px-4 py-4 text-right">MTC</th>
                  )}
                  <th className="px-4 py-4 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map((player: any) => {
                  const isMe = isLoggedIn && player.name === username;
                  const rankColor =
                    player.rank === 1 ? "text-[#FFD700] font-black text-lg"
                    : player.rank === 2 ? "text-gray-300 font-black text-lg"
                    : player.rank === 3 ? "text-[#CD7F32] font-black text-lg"
                    : "text-gray-400";
                  const rankLabel =
                    player.rank === 1 ? "1st"
                    : player.rank === 2 ? "2nd"
                    : player.rank === 3 ? "3rd"
                    : player.rank;
                  const avatarClass =
                    player.rank === 1 ? "bg-gradient-to-br from-[#FFD700] to-yellow-600 text-black"
                    : player.rank === 2 ? "bg-gradient-to-br from-gray-200 to-gray-500 text-black"
                    : player.rank === 3 ? "bg-gradient-to-br from-[#CD7F32] to-amber-800 text-white"
                    : "bg-[#0B0B0B] border border-white/10 text-white";

                  return (
                    <tr
                      key={player.rank}
                      className={`hover:bg-white/5 transition-colors ${isMe ? "bg-[#B30000]/10 border-l-4 border-l-[#B30000]" : ""}`}
                    >
                      <td className={`px-4 py-4 text-center ${rankColor}`}>{rankLabel}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg shrink-0 ${avatarClass}`}>
                            {player.name?.[0] ?? "?"}
                          </div>
                          <div>
                            <span className={`font-bold block ${isMe ? "text-[#B30000]" : "text-white"}`}>
                              {player.name}
                              {isMe && <span className="ml-2 text-[9px] bg-[#B30000] text-white px-1.5 py-0.5 rounded">YOU</span>}
                            </span>
                            <span className="text-[10px] text-gray-500 tracking-widest">{player.country}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {player.streak > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[#B30000] font-black text-xs bg-[#B30000]/10 px-2 py-1 rounded">
                            🔥 {player.streak}
                          </span>
                        ) : (
                          <span className="text-gray-600">–</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {activeTab === "wc26" ? (
                          <div>
                            <span className={`font-black tabular-nums ${player.rank <= 3 ? "text-[#FFD700]" : "text-white"}`}>
                              {player.correct}/{player.total}
                            </span>
                            <div className="text-[9px] text-white/25 mt-0.5">correct / locked</div>
                          </div>
                        ) : (
                          <span className={`font-black tabular-nums ${player.rank <= 3 ? "text-[#FFD700]" : "text-white"}`}>
                            {Number(player.pts).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {isMe && (
                          <button
                            onClick={() => setSharePlayer(player)}
                            className="rounded-lg bg-[#FFD700]/12 border border-[#FFD700]/20 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#FFD700] hover:bg-[#FFD700]/22 transition-all flex items-center gap-1"
                          >
                            <Share2 className="h-3 w-3" /> Share
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* How points work */}
      <div className="bg-[rgba(20,20,25,0.95)] rounded-xl border border-[#1E6FFF]/30 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E6FFF]/10 blur-[60px] rounded-full pointer-events-none" />
        <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
          <HelpCircle className="w-5 h-5 text-[#1E6FFF]" />
          How Points Work
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
          <div className="bg-[#0B0B0B] p-4 rounded-lg border border-white/5">
            <div className="text-[#00FF00] font-black text-xl mb-1">+50 MTC</div>
            <div className="font-bold text-sm text-white mb-2 uppercase tracking-wider">Exact Score</div>
            <p className="text-xs text-gray-400">You predicted 2-1, game ends 2-1. Masterclass.</p>
          </div>
          <div className="bg-[#0B0B0B] p-4 rounded-lg border border-white/5">
            <div className="text-[#FFD700] font-black text-xl mb-1">+20 MTC</div>
            <div className="font-bold text-sm text-white mb-2 uppercase tracking-wider">Correct Result</div>
            <p className="text-xs text-gray-400">Right team wins, wrong scoreline.</p>
          </div>
          <div className="bg-[#0B0B0B] p-4 rounded-lg border border-white/5">
            <div className="text-[#B30000] font-black text-xl mb-1">🔥 Streak</div>
            <div className="font-bold text-sm text-white mb-2 uppercase tracking-wider">Consecutive Wins</div>
            <p className="text-xs text-gray-400">3 correct in a row activates the fire multiplier.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
