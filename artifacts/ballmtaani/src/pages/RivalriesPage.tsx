import { useEffect, useState } from "react";
import { GrudgeMatchFeed, type RivalryItem } from "../components/GrudgeMatchFeed";
import { Swords, Trophy, Activity, History, MessageCircle, TrendingUp, PlayCircle, ShieldCheck, ScrollText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import AdBanner from "../components/AdBanner";

export default function RivalriesPage() {
  const { username, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<"active" | "global" | "history">("active");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "completed">("all");
  const [duelTarget, setDuelTarget] = useState("");
  const [duelMatch, setDuelMatch] = useState("");
  const [duelCall, setDuelCall] = useState("");
  const [duelSent, setDuelSent] = useState(false);
  const [createdDuels, setCreatedDuels] = useState<RivalryItem[]>([]);
  const [settleTargetId, setSettleTargetId] = useState<string | number | null>(null);
  const [settleWinner, setSettleWinner] = useState<"challenger" | "defender">("challenger");
  const [settleScore, setSettleScore] = useState("2-1");

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    const mapRowToRivalry = (row: any): RivalryItem => ({
      id: row.id,
      challenger: { name: row.challenger_name || "Fan A", interactions: 0 },
      defender: { name: row.defender_name || "Fan B", interactions: 0 },
      match: {
        home: row.home_team || "Home",
        away: row.away_team || "Away",
        homeLogo: row.home_logo || "https://media.api-sports.io/football/teams/42.png",
        awayLogo: row.away_logo || "https://media.api-sports.io/football/teams/49.png",
        time: row.status === "completed" ? "Final Result" : row.status === "active" ? "Duel Live" : "Pending Response",
      },
      bragLine: row.brag_line || "Direct challenge",
      status: (row.status || "pending") as RivalryItem["status"],
      prediction: row.prediction || "",
      winner: row.winner_name || undefined,
    });

    const loadInitial = async () => {
      const { data, error } = await supabase
        .from("fan_duels")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error || !data || !mounted) return;
      setCreatedDuels(data.map(mapRowToRivalry));
    };

    loadInitial();

    const channel = supabase
      .channel("fan-duels-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "fan_duels" }, (payload: any) => {
        const row = (payload.new || payload.old) as any;
        if (!row?.id) return;
        const mapped = mapRowToRivalry(row);
        setCreatedDuels((prev) => {
          const without = prev.filter((d) => String(d.id) !== String(mapped.id));
          if (payload.eventType === "DELETE") return without;
          return [mapped, ...without];
        });
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const sendDuel = async () => {
    if (!duelTarget || !duelMatch || !duelCall) return;
    const [homeRaw, awayRaw] = duelMatch.split(/vs|VS|v/);
    const home = (homeRaw || "Home").trim();
    const away = (awayRaw || "Away").trim();

    const localId = `local-${Date.now()}`;
    const newDuel: RivalryItem = {
      id: localId,
      challenger: { name: username || "You", interactions: 0 },
      defender: { name: duelTarget.trim(), interactions: 0 },
      match: {
        home,
        away,
        homeLogo: "https://media.api-sports.io/football/teams/42.png",
        awayLogo: "https://media.api-sports.io/football/teams/49.png",
        time: "Pending Response",
      },
      bragLine: "Direct challenge",
      status: "pending",
      prediction: duelCall.trim(),
    };
    setCreatedDuels((prev) => [newDuel, ...prev]);

    if (supabase && isLoggedIn) {
      const { data } = await supabase.from("fan_duels").insert({
        challenger_name: newDuel.challenger.name,
        defender_name: newDuel.defender.name,
        home_team: newDuel.match.home,
        away_team: newDuel.match.away,
        home_logo: newDuel.match.homeLogo,
        away_logo: newDuel.match.awayLogo,
        prediction: newDuel.prediction,
        status: "pending",
        brag_line: newDuel.bragLine,
      }).select("*").single();

      if (data?.id) {
        setCreatedDuels((prev) =>
          prev.map((d) => (String(d.id) === localId ? { ...d, id: data.id } : d))
        );
      }
    }

    setDuelSent(true);
    setTimeout(() => setDuelSent(false), 2500);
    setDuelTarget("");
    setDuelMatch("");
    setDuelCall("");
  };

  const acceptDuel = async (id?: string | number) => {
    if (!id) return;
    setCreatedDuels((prev) =>
      prev.map((d) => (String(d.id) === String(id) ? { ...d, status: "active", match: { ...d.match, time: "Duel Live" } } : d))
    );
    if (supabase && !String(id).startsWith("local-")) {
      await supabase.from("fan_duels").update({ status: "active" }).eq("id", id);
    }
  };

  const settleDuel = async (id?: string | number, winnerOverride?: string, scoreOverride?: string) => {
    if (!id) return;
    const duel = createdDuels.find((d) => String(d.id) === String(id));
    const winnerName = winnerOverride || username || "You";
    const finalScore = scoreOverride || duel?.prediction || "2-1";
    setCreatedDuels((prev) =>
      prev.map((d) =>
        String(d.id) === String(id)
          ? { ...d, status: "completed", winner: winnerName, prediction: finalScore, match: { ...d.match, time: "Final Result" } }
          : d
      )
    );
    if (supabase && !String(id).startsWith("local-")) {
      await supabase.from("fan_duels").update({ status: "completed", winner_name: winnerName, prediction: finalScore }).eq("id", id);
    }
  };

  const openSettle = (id?: string | number) => {
    if (!id) return;
    setSettleTargetId(id);
    setSettleWinner("challenger");
    setSettleScore("2-1");
  };

  const confirmSettle = async () => {
    if (!settleTargetId) return;
    const duel = createdDuels.find((d) => String(d.id) === String(settleTargetId));
    const winnerName =
      settleWinner === "challenger"
        ? duel?.challenger.name || username || "You"
        : duel?.defender.name || "Opponent";
    await settleDuel(settleTargetId, winnerName, settleScore);
    setSettleTargetId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-5 md:gap-8 mb-8 md:mb-10 bg-[#1B1B1B] rounded-xl md:rounded-2xl border border-white/10 p-4 md:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none" />

        <div className="relative z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <Swords className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(179,0,0,0.5)]" />
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
              FAN <span className="text-[#FFD700]">DUELS</span>
            </h1>
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-wider text-[11px] md:text-xs">Call the score. Keep the receipt.</p>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 relative z-10 w-full md:w-auto">
          <div className="bg-black/60 border border-white/10 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
            <span className="block text-lg md:text-2xl font-black text-white">12-4</span>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">H2H Record</span>
          </div>
          <div className="bg-black/60 border border-[#FFD700]/30 rounded-lg md:rounded-xl p-3 md:p-4 text-center shadow-[0_0_20px_rgba(255,215,0,0.1)]">
            <span className="block text-lg md:text-2xl font-black text-[#FFD700]">48</span>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Receipts Kept</span>
          </div>
          <div className="bg-black/60 border border-accent/30 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
            <span className="block text-lg md:text-2xl font-black text-accent">1.4k</span>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Interactions</span>
          </div>
        </div>
      </div>

      <div className="mb-6 md:mb-8">
        <AdBanner label="Rivalry Sponsor" type="horizontal" />
      </div>

      <div className="mb-8 border border-white/10 bg-[#111] p-4 md:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm md:text-base font-black uppercase tracking-widest text-white">Create Duel</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Fast Challenge</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            value={duelTarget}
            onChange={(e) => setDuelTarget(e.target.value)}
            placeholder="Fan username"
            className="bg-black border border-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary"
          />
          <input
            value={duelMatch}
            onChange={(e) => setDuelMatch(e.target.value)}
            placeholder="Match (e.g. Arsenal vs Chelsea)"
            className="bg-black border border-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary"
          />
          <input
            value={duelCall}
            onChange={(e) => setDuelCall(e.target.value)}
            placeholder="Your score call (e.g. 2-1)"
            className="bg-black border border-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary"
          />
          <button
            onClick={sendDuel}
            className="border border-primary bg-primary/20 text-white px-3 py-2 text-xs font-black uppercase tracking-widest hover:bg-primary/30 transition-colors"
          >
            Send Duel
          </button>
        </div>
        {duelSent && (
          <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-accent">
            Duel sent. Waiting for acceptance.
          </p>
        )}
      </div>

      <div className="mb-6 md:mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
        <button className="border border-primary/30 bg-primary/10 p-4 text-left hover:bg-primary/20 transition-colors">
          <div className="flex items-center gap-2 mb-1"><PlayCircle className="w-4 h-4 text-primary" /><p className="text-xs font-black uppercase tracking-widest text-white">Start Here</p></div>
          <p className="text-[11px] font-bold text-gray-300">Accept pending duel or open one live rivalry room.</p>
        </button>
        <button className="border border-white/10 bg-[#111] p-4 text-left hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4 text-accent" /><p className="text-xs font-black uppercase tracking-widest text-white">How To Win</p></div>
          <p className="text-[11px] font-bold text-gray-300">Make your call before kickoff, then keep the receipt.</p>
        </button>
        <button className="border border-white/10 bg-[#111] p-4 text-left hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2 mb-1"><ScrollText className="w-4 h-4 text-[#FFD700]" /><p className="text-xs font-black uppercase tracking-widest text-white">Receipt Mode</p></div>
          <p className="text-[11px] font-bold text-gray-300">Track past wins/losses and settle fan banter fast.</p>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-8 bg-black/40 p-2 rounded-2xl border border-white/5 w-fit max-w-full overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "active" ? "bg-primary text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
        >
          <Activity className="w-4 h-4" /> Play Now
        </button>
        <button
          onClick={() => setActiveTab("global")}
          className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "global" ? "bg-accent text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
        >
          <TrendingUp className="w-4 h-4" /> Discover
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "history" ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
        >
          <History className="w-4 h-4" /> Receipts
        </button>
      </div>

      <div className="min-h-[500px]">
        {activeTab === "active" || activeTab === "global" ? (
          <div className="space-y-8">
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "active", "completed"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${
                    statusFilter === status ? "bg-white/10 border-white/30 text-white" : "bg-[#111] border-white/10 text-gray-500 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            {activeTab === "active" && (
              <div className="bg-orange-950/20 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-4 mb-6">
                <MessageCircle className="w-6 h-6 text-orange-500" />
                <p className="text-orange-200 text-sm font-bold">You have 1 pending duel from <span className="text-white">Wanjiku KE</span>. Reply before kickoff.</p>
              </div>
            )}
            <GrudgeMatchFeed
              scope={activeTab === "active" ? "active" : "all"}
              statusFilter={statusFilter}
              extraRivalries={createdDuels}
              onAcceptDuel={acceptDuel}
              onSettleDuel={openSettle}
            />
            <AdBanner label="Duel Feed Partner" type="horizontal" />
          </div>
        ) : (
          <div className="bg-[#1B1B1B] rounded-2xl border border-white/5 p-12 text-center opacity-50 grayscale">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase tracking-widest text-gray-500">Receipt Book Empty</h3>
            <p className="text-sm text-gray-600 font-bold mt-2 uppercase">Completed fan duels will appear here.</p>
          </div>
        )}
      </div>

      {settleTargetId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md border border-white/10 bg-[#111] p-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Settle Duel</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setSettleWinner("challenger")}
                className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${settleWinner === "challenger" ? "bg-primary/20 border-primary text-white" : "bg-black border-white/10 text-gray-400"}`}
              >
                Challenger Wins
              </button>
              <button
                onClick={() => setSettleWinner("defender")}
                className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${settleWinner === "defender" ? "bg-primary/20 border-primary text-white" : "bg-black border-white/10 text-gray-400"}`}
              >
                Defender Wins
              </button>
            </div>
            <input
              value={settleScore}
              onChange={(e) => setSettleScore(e.target.value)}
              placeholder="Final score e.g. 2-1"
              className="w-full bg-black border border-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setSettleTargetId(null)} className="flex-1 border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300">Cancel</button>
              <button onClick={confirmSettle} className="flex-1 border border-primary bg-primary/20 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white">Confirm Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
