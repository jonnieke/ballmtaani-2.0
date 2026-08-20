import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { ArrowRight, ShieldCheck } from "lucide-react";

interface PayoutEvent {
  id: string;
  name: string;
  location: string;
  amount: string;
  timeAgo: string;
}

const FIRST_NAMES = [
  "Emmanuel M.", "Grace A.", "Victor O.", "Shadrack K.", "Esther W.", "Caleb M.",
  "Joy N.", "Peter K.", "Phyllis M.", "Hillary O.", "Vivian C.", "Felix K.",
  "Jane A.", "Collins O.", "Brenda W.", "Jackson M.", "Ruth N.", "Kevin O.",
  "Faith W.", "Dennis M.", "Mercy N.", "Brian K.", "Sharon A.", "Daniel K.",
  "Lilian M.", "David O.", "Beatrice N.", "Moses K.", "Caroline W.", "Paul O."
];

const TOWNS = [
  "Nairobi", "Kisumu", "Mombasa", "Nakuru", "Eldoret", "Thika", "Nyeri",
  "Machakos", "Meru", "Kakamega", "Kericho", "Malindi", "Kitale", "Naivasha",
  "Garissa", "Bomet", "Kajiado", "Embu", "Vihiga", "Busia"
];

const AMOUNTS = ["50 KES Airtime", "100 KES Airtime", "100 KES Airtime", "250 KES Airtime", "500 KES Airtime"];

const TIME_AGOS = ["3 mins ago", "8 mins ago", "14 mins ago", "22 mins ago", "35 mins ago", "47 mins ago", "1 hr ago"];

// Simple deterministic pseudo-random generator based on seed
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate daily dynamic payout stream
function generateDailyPayouts(): PayoutEvent[] {
  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let seed = 0;
  for (let i = 0; i < todayStr.length; i++) {
    seed += todayStr.charCodeAt(i);
  }

  const list: PayoutEvent[] = [];
  const count = 10;

  for (let i = 0; i < count; i++) {
    const nameIdx = Math.floor(seededRandom(seed + i * 7) * FIRST_NAMES.length);
    const townIdx = Math.floor(seededRandom(seed + i * 13) * TOWNS.length);
    const amtIdx = Math.floor(seededRandom(seed + i * 19) * AMOUNTS.length);
    const timeIdx = Math.floor(seededRandom(seed + i * 23) * TIME_AGOS.length);

    list.push({
      id: `payout-${todayStr}-${i}`,
      name: FIRST_NAMES[nameIdx],
      location: TOWNS[townIdx],
      amount: AMOUNTS[amtIdx],
      timeAgo: TIME_AGOS[timeIdx],
    });
  }

  return list;
}

export default function AirtimePayoutTicker() {
  const payouts = useMemo(() => generateDailyPayouts(), []);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % payouts.length);
        setVisible(true);
      }, 400);
    }, 5500);
    return () => clearInterval(timer);
  }, [payouts.length]);

  const current = payouts[index] || payouts[0];

  return (
    <aside className="w-full bg-gradient-to-r from-[#0d160e] via-[#09120a] to-[#0d160e] border-y border-emerald-500/20 py-2 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Left Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> RECENT AIRTIME PAYOUTS
          </span>
        </div>

        {/* Center Animated Payout Notification (No Telcos mentioned, just KES Airtime) */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
          <div className="flex items-center gap-2 truncate justify-center text-center">
            <span className="font-bold text-white truncate">🎉 {current.name} from <span className="text-emerald-300">{current.location}</span></span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="text-emerald-400 font-black shrink-0">{current.amount}</span>
            <span className="text-[10px] text-white/40 shrink-0">({current.timeAgo})</span>
          </div>
        </div>

        {/* Right CTA to MTC Store */}
        <Link href="/store" className="shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:text-white transition-colors">
          <span>REDEEM MTC</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </aside>
  );
}
