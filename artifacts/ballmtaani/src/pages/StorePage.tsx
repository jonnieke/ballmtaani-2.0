import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Coins, Loader2, Info, History, Gift, TrendingUp, Clock } from "lucide-react";
import { getCoinHistory, getTodayEarnings } from "../lib/coin-history";
import { COIN_REWARDS } from "../lib/coins-config";
import { InviteWidget } from "../components/InviteWidget";

type StoreTab = "wallet" | "redeem";

const REDEEM_ITEMS = [
  { id: 1, name: "Gold Profile Frame", cost: 2000, emoji: "Medal", description: "A legendary gold border around your avatar" },
  { id: 2, name: "VIP Fan Zone Access", cost: 5000, emoji: "Crown", description: "Unlock exclusive premium fan zones" },
  { id: 3, name: "Verified Fan Badge", cost: 3000, emoji: "Check", description: "Show your dedication with a verified badge" },
  { id: 4, name: "Match Analyst Badge", cost: 1500, emoji: "Stats", description: "Unlock the analyst title on your profile" },
  { id: 5, name: "Caption the Player Card", cost: 4000, emoji: "Card", description: "Create a custom player card with your photo" },
  { id: 6, name: "Duel Receipt Skin", cost: 1000, emoji: "Duel", description: "Give your fan duel receipts a premium look" },
];

export default function StorePage() {
  const { isLoggedIn, coins, updateCoins } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<StoreTab>("wallet");
  const [redeemedItem, setRedeemedItem] = useState<number | null>(null);

  const history = getCoinHistory();
  const todayEarned = getTodayEarnings();

  const handleRedeem = (itemId: number, cost: number) => {
    if (coins < cost) {
      alert(`You need ${(cost - coins).toLocaleString()} more MTC to redeem this item.`);
      return;
    }
    setRedeemedItem(itemId);
    setTimeout(() => {
      updateCoins(-cost);
      setRedeemedItem(null);
      alert("Item redeemed! Check your profile for your new perk.");
    }, 1500);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center p-4">
        <Coins className="w-16 h-16 text-[#FFD700] mb-4 opacity-50" />
        <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Login Required</h2>
        <p className="text-gray-400 mb-6 text-center">Log in to view your MTC status wallet.</p>
        <button
          onClick={() => { sessionStorage.setItem("auth_return_url", "/store"); setLocation("/login"); }}
          className="bg-[#B30000] hover:bg-red-800 text-white font-bold uppercase tracking-wider px-8 py-3 rounded transition-colors"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pb-20">
      <div className="relative bg-[#111] border-b border-white/5 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1E6FFF]/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 relative z-10">
          <Link href="/" className="inline-flex items-center gap-1 text-gray-400 hover:text-white mb-6 font-bold uppercase text-[10px] tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                MTC Wallet
              </h1>
              <p className="text-gray-400 font-medium">Build status through matchday activity. Redeem cosmetic perks. No cash value.</p>
            </div>

            <div className="bg-black/50 border border-[#FFD700]/30 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_30px_rgba(255,215,0,0.1)] flex items-center gap-6 shrink-0">
              <div className="w-16 h-16 bg-[#FFD700]/10 rounded-full flex items-center justify-center">
                <Coins className="w-8 h-8 text-[#FFD700]" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Your Balance</span>
                <span className="font-black text-4xl text-white">{coins.toLocaleString()}</span>
                <span className="text-[#FFD700] ml-1 font-bold">MTC</span>
                <span className="block text-[10px] text-green-400 font-bold mt-1">+{todayEarned} status today</span>
              </div>
            </div>
          </div>

          <div className="flex gap-1 mt-8 bg-black/30 p-1 rounded-xl w-full max-w-sm">
            {([
              ["wallet", "Wallet", TrendingUp],
              ["redeem", "Redeem", Gift],
            ] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === id ? "bg-[#FFD700] text-black shadow-lg" : "text-gray-500 hover:text-white"}`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {activeTab === "wallet" && (
          <div className="space-y-8">
            <div className="flex items-start gap-3 bg-white/3 border border-white/8 rounded-xl p-4 text-sm text-gray-400">
              <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
              <p>MTC status points are an <strong className="text-white">engagement reward with no monetary value</strong>. They cannot be bought, sold, refunded, or converted to cash. Redeem them for exclusive platform perks.</p>
            </div>

            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">How to Build MTC Status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(COIN_REWARDS).slice(0, 9).map(reward => (
                  <div key={reward.action} className="bg-[#111] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] w-14 shrink-0">{reward.emoji}</span>
                    <div>
                      <p className="text-[11px] font-black text-white leading-tight">{reward.label}</p>
                      <p className="text-[#FFD700] font-black text-xs">+{reward.amount} MTC</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <InviteWidget />

            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <History className="w-4 h-4" /> Recent Activity
              </h2>
              {history.length === 0 ? (
                <div className="bg-[#111] border border-white/5 rounded-xl p-8 text-center text-gray-600">
                  <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-xs font-bold uppercase tracking-widest">No activity yet. Make a call, join a room, or vote in a debate.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 15).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between bg-[#111] border border-white/5 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] w-12">{tx.emoji}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{tx.label}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">
                            {new Date(tx.timestamp).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <span className={`font-black text-base ${tx.amount >= 0 ? "text-[#FFD700]" : "text-red-400"}`}>
                        {tx.amount >= 0 ? "+" : ""}{tx.amount} MTC
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "redeem" && (
          <div className="space-y-6">
            <p className="text-gray-400 text-sm">Redeem earned MTC status points for platform perks. All items are cosmetic - no gambling, no cash value.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {REDEEM_ITEMS.map(item => (
                <div key={item.id} className={`bg-[#111] border rounded-2xl p-5 flex flex-col gap-3 ${coins >= item.cost ? "border-white/10" : "border-white/5 opacity-60"}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-[10px] font-black uppercase tracking-widest text-[#FFD700] shrink-0">{item.emoji}</span>
                    <div>
                      <h3 className="font-black text-sm text-white">{item.name}</h3>
                      <p className="text-gray-500 text-xs">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-[#FFD700]" />
                      <span className="font-black text-[#FFD700]">{item.cost.toLocaleString()} MTC</span>
                    </div>
                    <button
                      onClick={() => handleRedeem(item.id, item.cost)}
                      disabled={coins < item.cost || redeemedItem === item.id}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        coins >= item.cost
                          ? "bg-[#FFD700] text-black hover:shadow-[0_0_15px_rgba(255,215,0,0.4)] active:scale-95"
                          : "bg-white/5 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {redeemedItem === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : coins >= item.cost ? "Redeem" : "Not Enough"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
