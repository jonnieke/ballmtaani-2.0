import { Link } from "wouter";
import { Coins, Zap } from "lucide-react";

interface AdBannerProps {
  label?: string;
  type?: "horizontal" | "square";
}

const EARN_WAYS = [
  { emoji: "📅", label: "Daily Login", amount: "+50 MTC" },
  { emoji: "⚡", label: "Rapid Fire", amount: "+10 MTC" },
  { emoji: "🏆", label: "Trivia", amount: "+15 MTC" },
  { emoji: "🤝", label: "Invite a Friend", amount: "+500 MTC" },
];

export default function AdBanner({ label = "Earn Free Coins", type = "horizontal" }: AdBannerProps) {
  if (type === "square") {
    return (
      <div className="bg-gradient-to-br from-[#FFD700]/10 to-black border border-[#FFD700]/20 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
        <Coins className="w-8 h-8 text-[#FFD700]" />
        <div>
          <p className="font-black text-sm uppercase tracking-widest text-white mb-1">Earn MTC Coins</p>
          <p className="text-gray-400 text-xs">Play games, debate & invite friends to earn free coins.</p>
        </div>
        <Link href="/store" className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
          Learn More →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-[#FFD700]/8 via-[#FFD700]/5 to-transparent border border-[#FFD700]/15 rounded-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5">
        {/* Left: headline */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#FFD700]" />
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-widest text-white">Earn Free MTC Coins</p>
            <p className="text-gray-500 text-[10px] font-bold">No purchase required. No gambling.</p>
          </div>
        </div>

        {/* Center: earn ways */}
        <div className="hidden md:flex items-center gap-3 flex-1 justify-center flex-wrap">
          {EARN_WAYS.map(w => (
            <div key={w.label} className="flex items-center gap-1.5 bg-black/30 border border-white/5 rounded-lg px-3 py-1.5">
              <span className="text-base">{w.emoji}</span>
              <div>
                <p className="text-[9px] text-gray-500 font-bold uppercase leading-none">{w.label}</p>
                <p className="text-[#FFD700] font-black text-xs leading-none">{w.amount}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: CTA */}
        <Link
          href="/store"
          className="shrink-0 bg-[#FFD700] text-black font-black uppercase tracking-widest text-xs px-5 py-2.5 rounded-xl hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all active:scale-95"
        >
          My Wallet →
        </Link>
      </div>
    </div>
  );
}
