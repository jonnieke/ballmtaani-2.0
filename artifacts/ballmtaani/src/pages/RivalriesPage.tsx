import { useEffect, useState, useCallback } from "react";
import { Swords, Trophy, Zap, Activity, ScrollText, Plus, X, CheckCircle2, Clock, Share2, Users, Flame } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import AdBanner from "../components/AdBanner";
import SEO from "../components/SEO";

/* ─── Types ───────────────────────────────────────────────────────────────── */
type DuelStatus = "pending" | "active" | "completed";

interface Duel {
  id: string;
  challenger_name: string;
  defender_name: string;
  home_team: string;
  away_team: string;
  prediction: string;
  status: DuelStatus;
  winner_name?: string | null;
  brag_line?: string;
  created_at: string;
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function initials(name: string) { return name.slice(0, 2).toUpperCase(); }
function ago(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/* ─── DuelCard ────────────────────────────────────────────────────────────── */
function DuelCard({ duel, currentUser, onAccept, onSettle }: {
  duel: Duel;
  currentUser: string;
  onAccept: (id: string) => void;
  onSettle: (duel: Duel) => void;
}) {
  const isChallenger = duel.challenger_name === currentUser;
  const isDefender   = duel.defender_name   === currentUser;
  const isMyDuel     = isChallenger || isDefender;
  const share = () => window.open(`https://wa.me/?text=${encodeURIComponent(`⚔️ Fan Duel on BallMtaani!\n${duel.challenger_name} vs ${duel.defender_name}\n${duel.home_team} vs ${duel.away_team}\nMy call: ${duel.prediction}\nhttps://ballmtaani.com/rivalries`)}`, "_blank");

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-[#0a0d14] transition-all duration-200
      ${duel.status === "active" ? "border-[#B30000]/40 shadow-[0_0_24px_rgba(179,0,0,0.12)]" :
        duel.status === "completed" ? "border-[#FFD700]/20" :
        "border-white/8"}`}>

      {/* Active pulse bar */}
      {duel.status === "active" && (
        <div className="absolute inset-x-0 top-0 h-[2px] animate-pulse bg-gradient-to-r from-[#B30000] via-orange-500 to-[#B30000]" />
      )}

      {/* Status chip */}
      <div className="flex items-center justify-between border-b border-white/6 px-4 py-2.5">
        <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em]
          ${duel.status === "active" ? "text-[#B30000]" :
            duel.status === "completed" ? "text-[#FFD700]" : "text-white/30"}`}>
          {duel.status === "active"    ? <><span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#B30000]" /> Duel Live</> :
           duel.status === "completed" ? <><Trophy className="h-3 w-3" /> Settled</> :
           <><Clock className="h-3 w-3" /> Awaiting Response</>}
        </span>
        <span className="text-[9px] text-white/20">{ago(duel.created_at)}</span>
      </div>

      {/* Fighters */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-5">
        {/* Challenger */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-blue-500/50 bg-blue-500/10 text-lg font-black text-white shadow-[0_0_16px_rgba(59,130,246,0.2)]">
            {initials(duel.challenger_name)}
          </div>
          <p className="max-w-[80px] truncate text-[11px] font-black text-white">{duel.challenger_name}</p>
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-blue-400">Challenger</span>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-1">
          <div className={`rounded-full p-2.5 ${duel.status === "active" ? "bg-[#B30000] shadow-[0_0_12px_rgba(179,0,0,0.4)]" : "bg-white/6"}`}>
            <Swords className={`h-5 w-5 ${duel.status === "active" ? "text-white" : "text-white/30"}`} />
          </div>
          <span className="text-[9px] font-black text-[#B30000]">VS</span>
        </div>

        {/* Defender */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 bg-[#B30000]/10 text-lg font-black text-white
            ${duel.status === "pending" ? "border-white/10 opacity-50 grayscale" : "border-[#B30000]/50 shadow-[0_0_16px_rgba(179,0,0,0.2)]"}`}>
            {initials(duel.defender_name)}
          </div>
          <p className="max-w-[80px] truncate text-[11px] font-black text-white">{duel.defender_name}</p>
          <span className="rounded-full bg-[#B30000]/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#B30000]/70">Defender</span>
        </div>
      </div>

      {/* Match + prediction */}
      <div className="mx-4 mb-4 rounded-xl border border-white/6 bg-black/40 px-4 py-3">
        <p className="mb-1 text-center text-[9px] font-black uppercase tracking-widest text-white/25">The Match</p>
        <p className="text-center text-sm font-black text-white">{duel.home_team} <span className="text-white/25">vs</span> {duel.away_team}</p>
        {duel.prediction && (
          <p className="mt-1 text-center text-[10px] font-bold text-[#FFD700]/60">
            Call: <span className="text-[#FFD700]">{duel.prediction}</span>
          </p>
        )}
        {duel.status === "completed" && duel.winner_name && (
          <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-[#FFD700]/8 py-1.5">
            <Trophy className="h-3.5 w-3.5 text-[#FFD700]" />
            <span className="text-[10px] font-black text-[#FFD700]">Winner: {duel.winner_name}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        {duel.status === "pending" && isDefender && (
          <button onClick={() => onAccept(duel.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500 active:scale-95">
            <CheckCircle2 className="h-3.5 w-3.5" /> Accept Duel
          </button>
        )}
        {duel.status === "active" && isMyDuel && (
          <button onClick={() => onSettle(duel)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B30000] py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#cc0000] active:scale-95">
            <Trophy className="h-3.5 w-3.5" /> Settle Receipt
          </button>
        )}
        {duel.status === "completed" && (
          <div className="flex-1 rounded-xl border border-[#FFD700]/20 bg-[#FFD700]/5 py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-[#FFD700]/60">
            Receipt Kept ✓
          </div>
        )}
        <button onClick={share}
          className="rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-white/30 transition-all hover:bg-white/10 hover:text-white">
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── CreateDuelModal ─────────────────────────────────────────────────────── */
function CreateDuelModal({ username, onClose, onCreate }: {
  username: string;
  onClose: () => void;
  onCreate: (d: Omit<Duel, "id" | "created_at">) => void;
}) {
  const [defender, setDefender] = useState("");
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [prediction, setPrediction] = useState("");
  const [brag, setBrag] = useState("");
  const valid = defender.trim() && home.trim() && away.trim() && prediction.trim();

  const submit = () => {
    if (!valid) return;
    onCreate({ challenger_name: username || "You", defender_name: defender.trim(), home_team: home.trim(), away_team: away.trim(), prediction: prediction.trim(), brag_line: brag.trim() || "Direct Challenge", status: "pending", winner_name: null });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md overflow-hidden rounded-t-2xl border border-white/10 bg-[#0d1018] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-[#B30000]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Issue a Duel</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-3 p-5">
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Challenge Who?</label>
            <input value={defender} onChange={e => setDefender(e.target.value)}
              placeholder="Fan username e.g. Wanjiku_KE"
              className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#B30000]/50 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Home Team</label>
              <input value={home} onChange={e => setHome(e.target.value)} placeholder="Arsenal"
                className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#B30000]/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Away Team</label>
              <input value={away} onChange={e => setAway(e.target.value)} placeholder="Chelsea"
                className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#B30000]/50 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Your Score Call *</label>
            <input value={prediction} onChange={e => setPrediction(e.target.value)} placeholder="e.g. Arsenal 2-1"
              className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm font-bold text-white placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none" />
          </div>

          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Brag Line (optional)</label>
            <input value={brag} onChange={e => setBrag(e.target.value)} placeholder="e.g. I'll never let you forget this"
              className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-white/20 focus:outline-none" />
          </div>
        </div>

        <div className="flex gap-2 border-t border-white/6 p-4">
          <button onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white">
            Cancel
          </button>
          <button onClick={submit} disabled={!valid}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B30000] py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#cc0000] disabled:opacity-35 active:scale-95">
            <Swords className="h-3.5 w-3.5" /> Send Challenge
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SettleModal ─────────────────────────────────────────────────────────── */
function SettleModal({ duel, onClose, onConfirm }: { duel: Duel; onClose: () => void; onConfirm: (winner: string, score: string) => void }) {
  const [winner, setWinner] = useState<"challenger" | "defender">("challenger");
  const [score, setScore] = useState(duel.prediction || "2-1");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1018] p-5">
        <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-white">Keep the Receipt</h3>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {(["challenger", "defender"] as const).map(side => (
            <button key={side} onClick={() => setWinner(side)}
              className={`rounded-xl border py-3 text-xs font-black uppercase tracking-widest transition-all
                ${winner === side ? "border-[#B30000] bg-[#B30000]/15 text-white" : "border-white/10 text-white/35 hover:text-white"}`}>
              {side === "challenger" ? duel.challenger_name : duel.defender_name}
              <span className="mt-0.5 block text-[8px] normal-case font-bold opacity-60">{side}</span>
            </button>
          ))}
        </div>

        <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Final Score</label>
        <input value={score} onChange={e => setScore(e.target.value)}
          className="mb-4 w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm font-bold text-white focus:border-[#FFD700]/40 focus:outline-none" />

        <div className="flex gap-2">
          <button onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
          <button onClick={() => onConfirm(winner === "challenger" ? duel.challenger_name : duel.defender_name, score)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFD700] py-2 text-xs font-black uppercase tracking-widest text-black hover:bg-yellow-300">
            <Trophy className="h-3.5 w-3.5" /> Confirm Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function RivalriesPage() {
  const { username, isLoggedIn } = useAuth();
  const [duels, setDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"live" | "all" | "receipts">("live");
  const [showCreate, setShowCreate] = useState(false);
  const [settlingDuel, setSettlingDuel] = useState<Duel | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, settled: 0 });

  const loadDuels = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    try {
      const { data } = await supabase.from("fan_duels").select("*").order("created_at", { ascending: false }).limit(60);
      if (data) {
        setDuels(data as Duel[]);
        setStats({ total: data.length, active: data.filter((d: any) => d.status === "active").length, settled: data.filter((d: any) => d.status === "completed").length });
      }
    } catch { /* table may not exist */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDuels();
    if (!supabase) return;
    let ch: any;
    try {
      ch = supabase.channel("rivalries-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "fan_duels" }, () => loadDuels())
        .subscribe();
    } catch { /* ignore */ }
    return () => { if (ch) supabase.removeChannel(ch); };
  }, [loadDuels]);

  const createDuel = async (payload: Omit<Duel, "id" | "created_at">) => {
    const tempId = `temp-${Date.now()}`;
    const temp: Duel = { ...payload, id: tempId, created_at: new Date().toISOString() };
    setDuels(prev => [temp, ...prev]);
    if (supabase && isLoggedIn) {
      try {
        const { data } = await supabase.from("fan_duels").insert({ challenger_name: payload.challenger_name, defender_name: payload.defender_name, home_team: payload.home_team, away_team: payload.away_team, prediction: payload.prediction, brag_line: payload.brag_line, status: "pending" }).select("*").single();
        if (data) setDuels(prev => prev.map(d => d.id === tempId ? data as Duel : d));
      } catch { /* local only */ }
    }
  };

  const acceptDuel = async (id: string) => {
    setDuels(prev => prev.map(d => d.id === id ? { ...d, status: "active" } : d));
    if (supabase && !id.startsWith("temp-")) await Promise.resolve(supabase.from("fan_duels").update({ status: "active" }).eq("id", id)).catch(() => {});
  };

  const settleDuel = async (winner: string, score: string) => {
    if (!settlingDuel) return;
    const id = settlingDuel.id;
    setDuels(prev => prev.map(d => d.id === id ? { ...d, status: "completed", winner_name: winner, prediction: score } : d));
    if (supabase && !id.startsWith("temp-")) await Promise.resolve(supabase.from("fan_duels").update({ status: "completed", winner_name: winner, prediction: score }).eq("id", id)).catch(() => {});
    setSettlingDuel(null);
    loadDuels();
  };

  const filtered = duels.filter(d => {
    if (tab === "live") return d.status === "pending" || d.status === "active";
    if (tab === "receipts") return d.status === "completed";
    return true;
  });

  return (
    <>
      <SEO title="Fan Duels | BallMtaani" description="Challenge rival fans to score predictions, settle receipts and keep the banter going." path="/rivalries" />

      <div className="min-h-screen bg-[#070a0f] pb-24">

        {/* ── ARENA HERO ──────────────────────────────────────────────── */}
        <div className="relative overflow-hidden border-b border-white/6 bg-[#07080f]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(179,0,0,0.15),transparent)]" />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#B30000]/60 to-transparent" />

          <div className="relative mx-auto max-w-6xl px-4 py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B30000] shadow-[0_0_20px_rgba(179,0,0,0.4)]">
                    <Swords className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-white">
                      Fan <span className="text-[#B30000]">Duels</span>
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Call the score. Keep the receipt.</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-3">
                {[
                  { label: "Total Duels",   value: stats.total,   icon: Users,    color: "text-white" },
                  { label: "Live Now",       value: stats.active,  icon: Flame,    color: "text-[#B30000]" },
                  { label: "Receipts Kept", value: stats.settled, icon: Trophy,   color: "text-[#FFD700]" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl border border-white/8 bg-black/40 px-4 py-3 text-center">
                    <Icon className={`mx-auto mb-1 h-3.5 w-3.5 ${color}`} />
                    <p className={`text-lg font-black tabular-nums ${color}`}>{value}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/25">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { n: "1", label: "Issue Challenge", sub: "Pick a rival fan, name the match, call the score", icon: Swords },
                { n: "2", label: "They Accept", sub: "Rival confirms the duel — both predictions locked in", icon: CheckCircle2 },
                { n: "3", label: "Keep Receipt", sub: "After the final whistle, settle it and keep the receipt", icon: ScrollText },
              ].map(({ n, label, sub, icon: Icon }) => (
                <div key={n} className="rounded-xl border border-white/6 bg-white/3 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B30000]/20 text-[9px] font-black text-[#B30000]">{n}</span>
                    <Icon className="h-3.5 w-3.5 text-white/40" />
                  </div>
                  <p className="text-[11px] font-black text-white">{label}</p>
                  <p className="mt-0.5 text-[9px] text-white/30">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-6">
          <AdBanner label="Fan Duel Sponsor" type="horizontal" />
        </div>

        {/* ── TABS + CREATE ────────────────────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1 rounded-xl border border-white/6 bg-[#0d1018] p-1">
              {([
                { key: "live",     label: "Live & Pending", icon: Activity },
                { key: "all",      label: "All Duels",      icon: Swords },
                { key: "receipts", label: "Receipt Book",   icon: ScrollText },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all
                    ${tab === key ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}>
                  <Icon className="h-3 w-3" /> <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            {isLoggedIn && (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-xl bg-[#B30000] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_16px_rgba(179,0,0,0.3)] transition-all hover:bg-[#cc0000] hover:shadow-[0_0_24px_rgba(179,0,0,0.4)] active:scale-95">
                <Plus className="h-3.5 w-3.5" /> New Duel
              </button>
            )}
          </div>

          {/* ── DUEL FEED ─────────────────────────────────────────────── */}
          <div className="mt-5">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1,2,3].map(i => <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/6 bg-[#0d1018] py-20 text-center">
                {tab === "receipts" ? (
                  <>
                    <ScrollText className="h-10 w-10 text-white/10" />
                    <div>
                      <p className="font-black uppercase tracking-widest text-white/25">Receipt Book Empty</p>
                      <p className="mt-1 text-xs text-white/15">Settled duels appear here. Win a duel to fill it.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Swords className="h-10 w-10 text-white/10" />
                    <div>
                      <p className="font-black uppercase tracking-widest text-white/25">No Active Duels</p>
                      <p className="mt-1 text-xs text-white/15">Be the first to issue a challenge.</p>
                    </div>
                    {isLoggedIn && (
                      <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-xl bg-[#B30000] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000]">
                        <Plus className="h-3.5 w-3.5" /> Issue First Duel
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(duel => (
                  <DuelCard key={duel.id} duel={duel} currentUser={username}
                    onAccept={acceptDuel} onSettle={setSettlingDuel} />
                ))}
              </div>
            )}
          </div>

          {/* Bottom ad */}
          {!loading && filtered.length > 0 && (
            <div className="mt-8">
              <AdBanner label="BallMtaani Fan Partner" type="horizontal" />
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateDuelModal username={username} onClose={() => setShowCreate(false)} onCreate={createDuel} />
      )}
      {settlingDuel && (
        <SettleModal duel={settlingDuel} onClose={() => setSettlingDuel(null)} onConfirm={settleDuel} />
      )}
    </>
  );
}
