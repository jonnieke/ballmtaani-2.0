import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Smartphone, CheckCircle2, Zap, ArrowRight, ShieldCheck } from "lucide-react";

interface PayoutEvent {
  id: string;
  name: string;
  location: string;
  network: "Safaricom" | "Airtel" | "Telkom";
  amount: string;
  timeAgo: string;
}

const MOCK_PAYOUTS: PayoutEvent[] = [
  { id: "1", name: "Kevin O.", location: "Kisumu", network: "Safaricom", amount: "100 KES", timeAgo: "2 mins ago" },
  { id: "2", name: "Faith W.", location: "Thika", network: "Airtel", amount: "50 KES Data", timeAgo: "7 mins ago" },
  { id: "3", name: "Dennis M.", location: "Mombasa", network: "Safaricom", amount: "250 KES", timeAgo: "14 mins ago" },
  { id: "4", name: "Mercy N.", location: "Nakuru", network: "Telkom", amount: "500 KES", timeAgo: "23 mins ago" },
  { id: "5", name: "Brian K.", location: "Nairobi", network: "Safaricom", amount: "100 KES", timeAgo: "31 mins ago" },
];

export default function AirtimePayoutTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % MOCK_PAYOUTS.length);
        setVisible(true);
      }, 400);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = MOCK_PAYOUTS[index];

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

        {/* Center Animated Payout Notification */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
          <div className="flex items-center gap-2 truncate justify-center text-center">
            <span className="font-bold text-white truncate">🎉 {current.name} from <span className="text-emerald-300">{current.location}</span></span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="text-emerald-400 font-black shrink-0">{current.amount} {current.network}</span>
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
