import { useEffect, useMemo, useState } from "react";
import { Flame, ShieldCheck, Target, RefreshCw } from "lucide-react";
import AdBanner from "../components/AdBanner";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

type PickSide = "true" | "cap";

const TODAY_KEY = new Date().toISOString().slice(0, 10);

const rumorSet = [
  "Morocco will outlast at least two European giants before bowing out.",
  "Brazil exits before the quarterfinals — South American chaos continues.",
  "USA rides the host advantage to an unlikely semifinal berth.",
];

const lineupSet = [
  "Best tactical system to use against Brazil at WC26?",
  "Who exits the Group of Death first — and why?",
  "What single factor will ultimately decide the WC26 champion?",
];

const receiptSet = [
  "A first-time finalist lifts the trophy at WC26.",
  "European football wins the World Cup for the 5th time in 6 editions.",
  "At least one African side reaches the quarterfinals.",
];

function loadState() {
  try {
    const raw = localStorage.getItem("mtaani_war_room_daily");
    if (!raw) return null;
    return JSON.parse(raw) as {
      day: string;
      rumorPick?: PickSide;
      lineupPick?: string;
      receiptPick?: PickSide;
      streak?: number;
      lastDay?: string;
    };
  } catch {
    return null;
  }
}

export default function WarRoomPage() {
  const { user, isLoggedIn, awardCoins } = useAuth();
  const initial = loadState();
  const [rumorPick, setRumorPick] = useState<PickSide | null>(initial?.day === TODAY_KEY ? (initial.rumorPick || null) : null);
  const [lineupPick, setLineupPick] = useState<string>(initial?.day === TODAY_KEY ? (initial.lineupPick || "") : "");
  const [receiptPick, setReceiptPick] = useState<PickSide | null>(initial?.day === TODAY_KEY ? (initial.receiptPick || null) : null);
  const [streak, setStreak] = useState<number>(initial?.streak || 0);

  const completed = Number(!!rumorPick) + Number(!!lineupPick) + Number(!!receiptPick);
  const progress = Math.round((completed / 3) * 100);

  const daily = useMemo(() => {
    const seed = TODAY_KEY.split("-").join("");
    const n = parseInt(seed, 10);
    return {
      rumor: rumorSet[n % rumorSet.length],
      lineup: lineupSet[(n + 1) % lineupSet.length],
      receipt: receiptSet[(n + 2) % receiptSet.length],
    };
  }, []);

  const persist = (next: { rumor?: PickSide | null; lineup?: string; receipt?: PickSide | null; completedCount?: number }) => {
    const nextCompleted =
      Number(!!(next.rumor ?? rumorPick)) +
      Number(!!(next.lineup ?? lineupPick)) +
      Number(!!(next.receipt ?? receiptPick));
    const shouldIncrement = completed < 3 && nextCompleted === 3;
    const nextStreak = shouldIncrement ? streak + 1 : streak;
    if (shouldIncrement) {
      setStreak(nextStreak);
      awardCoins("war_room_daily_complete");
    }
    const payload = {
      day: TODAY_KEY,
      rumorPick: next.rumor ?? rumorPick ?? undefined,
      lineupPick: next.lineup ?? lineupPick ?? undefined,
      receiptPick: next.receipt ?? receiptPick ?? undefined,
      streak: nextStreak,
      lastDay: TODAY_KEY,
    };
    localStorage.setItem(
      "mtaani_war_room_daily",
      JSON.stringify(payload)
    );

    if (supabase && isLoggedIn && user?.id) {
      supabase.from("war_room_daily").upsert(
        {
          user_id: user.id,
          day_key: TODAY_KEY,
          rumor_pick: payload.rumorPick || null,
          lineup_pick: payload.lineupPick || null,
          receipt_pick: payload.receiptPick || null,
          completed_count: nextCompleted,
          streak: nextStreak,
        },
        { onConflict: "user_id,day_key" }
      ).then(() => {});
    }
  };

  const resetToday = () => {
    setRumorPick(null);
    setLineupPick("");
    setReceiptPick(null);
    localStorage.setItem("mtaani_war_room_daily", JSON.stringify({ day: TODAY_KEY, streak, lastDay: TODAY_KEY }));
  };

  useEffect(() => {
    if (!supabase || !isLoggedIn || !user?.id) return;
    let mounted = true;
    const loadRemote = async () => {
      const { data } = await supabase
        .from("war_room_daily")
        .select("*")
        .eq("user_id", user.id)
        .eq("day_key", TODAY_KEY)
        .maybeSingle();
      if (!mounted || !data) return;
      setRumorPick((data.rumor_pick as PickSide) || null);
      setLineupPick(data.lineup_pick || "");
      setReceiptPick((data.receipt_pick as PickSide) || null);
      setStreak(Number(data.streak || 0));
      localStorage.setItem(
        "mtaani_war_room_daily",
        JSON.stringify({
          day: TODAY_KEY,
          rumorPick: data.rumor_pick || undefined,
          lineupPick: data.lineup_pick || undefined,
          receiptPick: data.receipt_pick || undefined,
          streak: Number(data.streak || 0),
          lastDay: TODAY_KEY,
        })
      );
    };
    loadRemote();
    return () => {
      mounted = false;
    };
  }, [isLoggedIn, user?.id]);

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-4 py-6 md:py-10">
      <SEO title="WC26 War Room | BallMtaani" description="Daily WC26 loop: bold tournament calls, group picks, and World Cup receipts." />
      <div className="mb-6 md:mb-8 border border-white/10 bg-[#111] p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-wider">WC26 War Room</h1>
          <button onClick={resetToday} className="inline-flex items-center gap-2 border border-white/10 bg-black px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white">
            <RefreshCw className="w-3.5 h-3.5" /> Reset Today
          </button>
        </div>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">WC26 daily loop: bold tournament calls, group picks, and World Cup receipts.</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="border border-white/10 bg-black/40 p-2.5 text-center"><p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Done</p><p className="text-sm font-black">{completed}/3</p></div>
          <div className="border border-white/10 bg-black/40 p-2.5 text-center"><p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Streak</p><p className="text-sm font-black text-orange-300 inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{streak}</p></div>
          <div className="border border-white/10 bg-black/40 p-2.5 text-center"><p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Progress</p><p className="text-sm font-black text-accent">{progress}%</p></div>
        </div>
      </div>

      <div className="mb-6">
        <AdBanner label="War Room Sponsor" type="horizontal" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="border border-white/10 bg-[#111] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">True or Cap</p>
          <p className="text-sm font-bold text-white mb-4">{daily.rumor}</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setRumorPick("true"); persist({ rumor: "true" }); }} className={`py-2 text-[10px] font-black uppercase tracking-widest border ${rumorPick === "true" ? "bg-accent/20 border-accent text-white" : "bg-black border-white/10 text-gray-400"}`}>True</button>
            <button onClick={() => { setRumorPick("cap"); persist({ rumor: "cap" }); }} className={`py-2 text-[10px] font-black uppercase tracking-widest border ${rumorPick === "cap" ? "bg-primary/20 border-primary text-white" : "bg-black border-white/10 text-gray-400"}`}>Cap</button>
          </div>
        </div>

        <div className="border border-white/10 bg-[#111] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Lineup Build</p>
          <p className="text-sm font-bold text-white mb-4">{daily.lineup}</p>
          <div className="space-y-2">
            {["Control setup", "High press setup", "Counter setup"].map((opt) => (
              <button key={opt} onClick={() => { setLineupPick(opt); persist({ lineup: opt }); }} className={`w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${lineupPick === opt ? "bg-[#FFD700]/15 border-[#FFD700]/40 text-white" : "bg-black border-white/10 text-gray-400"}`}>{opt}</button>
            ))}
          </div>
        </div>

        <div className="border border-white/10 bg-[#111] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Receipt Pick</p>
          <p className="text-sm font-bold text-white mb-4">{daily.receipt}</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setReceiptPick("true"); persist({ receipt: "true" }); }} className={`py-2 text-[10px] font-black uppercase tracking-widest border ${receiptPick === "true" ? "bg-green-600/20 border-green-500 text-white" : "bg-black border-white/10 text-gray-400"}`}>Back It</button>
            <button onClick={() => { setReceiptPick("cap"); persist({ receipt: "cap" }); }} className={`py-2 text-[10px] font-black uppercase tracking-widest border ${receiptPick === "cap" ? "bg-red-600/20 border-red-500 text-white" : "bg-black border-white/10 text-gray-400"}`}>Fade It</button>
          </div>
        </div>
      </div>

      {completed === 3 && (
        <div className="mt-5 border border-green-500/30 bg-green-600/10 p-3 text-sm font-black uppercase tracking-widest text-green-300 inline-flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Daily war room completed
          <Target className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
