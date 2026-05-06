import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Coins, Zap, ShieldCheck, Loader2, Info, History, Gift, TrendingUp, Clock } from "lucide-react";
import { getCoinHistory, getTodayEarnings, getEarningsByCategory } from "../lib/coin-history";
import { COIN_REWARDS } from "../lib/coins-config";
import { InviteWidget } from "../components/InviteWidget";

type StoreTab = 'wallet' | 'redeem' | 'topup';

const REDEEM_ITEMS = [
  { id: 1, name: "Gold Profile Frame", cost: 2000, emoji: "🥇", description: "A legendary gold border around your avatar" },
  { id: 2, name: "VIP Fan Zone Access", cost: 5000, emoji: "👑", description: "Unlock exclusive premium fan zones" },
  { id: 3, name: "Verified Fan Badge", cost: 3000, emoji: "✅", description: "Show your dedication with a verified badge" },
  { id: 4, name: "Match Analyst Badge", cost: 1500, emoji: "📊", description: "Unlock the analyst title on your profile" },
  { id: 5, name: "Caption the Player Card", cost: 4000, emoji: "🃏", description: "Create a custom player card with your photo" },
  { id: 6, name: "Grudge Match Token", cost: 1000, emoji: "⚔️", description: "Start a premium grudge match with any fan" },
];

const PURCHASE_TIERS = [
  { id: 1, ksh: 10, coins: 1000, label: "Starter Pack", color: "from-[#1E6FFF] to-blue-500", popular: false },
  { id: 2, ksh: 50, coins: 7000, label: "Pro Baller", color: "from-[#B30000] to-red-600", popular: true },
  { id: 3, ksh: 100, coins: 20000, label: "Club Legend", color: "from-[#FFD700] to-[#FFA500]", popular: false },
];

export default function StorePage() {
  const { isLoggedIn, coins, updateCoins } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<StoreTab>('wallet');
  const [processingTier, setProcessingTier] = useState<number | null>(null);
  const [redeemedItem, setRedeemedItem] = useState<number | null>(null);

  const history = getCoinHistory();
  const todayEarned = getTodayEarnings();
  const earningsByCategory = getEarningsByCategory();

  const handlePurchase = (tierId: number, coinAmount: number) => {
    setProcessingTier(tierId);
    setTimeout(() => {
      updateCoins(coinAmount);
      setProcessingTier(null);
      alert(`Success! ${coinAmount.toLocaleString()} Mtaani Coins added to your wallet.`);
    }, 2000);
  };

  const handleRedeem = (itemId: number, cost: number) => {
    if (coins < cost) {
      alert(`You need ${(cost - coins).toLocaleString()} more MTC to redeem this item.`);
      return;
    }
    setRedeemedItem(itemId);
    setTimeout(() => {
      updateCoins(-cost);
      setRedeemedItem(null);
      alert(`Item redeemed! Check your profile for your new perk. 🎉`);
    }, 1500);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center p-4">
        <Coins className="w-16 h-16 text-[#FFD700] mb-4 opacity-50" />
        <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Login Required</h2>
        <p className="text-gray-400 mb-6 text-center">Log in to view your Mtaani Coin Wallet.</p>
        <button
          onClick={() => { sessionStorage.setItem("auth_return_url", "/store"); setLocation('/login'); }}
          className="bg-[#B30000] hover:bg-red-800 text-white font-bold uppercase tracking-wider px-8 py-3 rounded transition-colors"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pb-20">
      {/* HEADER */}
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
              <p className="text-gray-400 font-medium">Earn by playing. Spend on perks. No cash value.</p>
            </div>

            <div className="bg-black/50 border border-[#FFD700]/30 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_30px_rgba(255,215,0,0.1)] flex items-center gap-6 shrink-0">
              <div className="w-16 h-16 bg-[#FFD700]/10 rounded-full flex items-center justify-center">
                <Coins className="w-8 h-8 text-[#FFD700]" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Your Balance</span>
                <span className="font-black text-4xl text-white">{coins.toLocaleString()}</span>
                <span className="text-[#FFD700] ml-1 font-bold">MTC</span>
                <span className="block text-[10px] text-green-400 font-bold mt-1">+{todayEarned} earned today</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-8 bg-black/30 p-1 rounded-xl w-full max-w-sm">
            {([['wallet', 'Wallet', TrendingUp], ['redeem', 'Redeem', Gift], ['topup', 'Top Up', Zap]] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === id ? 'bg-[#FFD700] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* ── WALLET TAB ── */}
        {activeTab === 'wallet' && (
          <div className="space-y-8">
            {/* BCLB Notice */}
            <div className="flex items-start gap-3 bg-white/3 border border-white/8 rounded-xl p-4 text-sm text-gray-400">
              <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
              <p>Mtaani Coins are an <strong className="text-white">engagement reward with no monetary value</strong>. They cannot be converted to cash. Spend them on exclusive platform perks.</p>
            </div>

            {/* Earn more ways */}
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">How to Earn MTC</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(COIN_REWARDS).slice(0, 9).map(reward => (
                  <div key={reward.action} className="bg-[#111] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-xl">{reward.emoji}</span>
                    <div>
                      <p className="text-[11px] font-black text-white leading-tight">{reward.label}</p>
                      <p className="text-[#FFD700] font-black text-xs">+{reward.amount} MTC</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite widget */}
            <InviteWidget />

            {/* Transaction history */}
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <History className="w-4 h-4" /> Recent Activity
              </h2>
              {history.length === 0 ? (
                <div className="bg-[#111] border border-white/5 rounded-xl p-8 text-center text-gray-600">
                  <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-xs font-bold uppercase tracking-widest">No activity yet. Start playing to earn!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 15).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between bg-[#111] border border-white/5 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{tx.emoji}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{tx.label}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">
                            {new Date(tx.timestamp).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className={`font-black text-base ${tx.amount >= 0 ? 'text-[#FFD700]' : 'text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount} MTC
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REDEEM TAB ── */}
        {activeTab === 'redeem' && (
          <div className="space-y-6">
            <p className="text-gray-400 text-sm">Spend your coins on exclusive platform perks. All items are cosmetic — no gambling, no cash.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {REDEEM_ITEMS.map(item => (
                <div key={item.id} className={`bg-[#111] border rounded-2xl p-5 flex flex-col gap-3 ${coins >= item.cost ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
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
                          ? 'bg-[#FFD700] text-black hover:shadow-[0_0_15px_rgba(255,215,0,0.4)] active:scale-95'
                          : 'bg-white/5 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {redeemedItem === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : coins >= item.cost ? 'Redeem' : 'Not Enough'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TOP UP TAB ── */}
        {activeTab === 'topup' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300">
              <Info className="w-5 h-5 text-gray-400" />
              <span>Top up coins to spend on platform perks faster. <strong className="text-white">Coins have no cash value</strong> and cannot be refunded.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PURCHASE_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`bg-[#111] rounded-3xl border ${tier.popular ? 'border-[#FFD700]/50 shadow-[0_0_40px_rgba(255,215,0,0.15)] scale-105 z-10' : 'border-white/5 shadow-xl'} relative overflow-hidden flex flex-col`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-center py-1.5 font-black uppercase tracking-[0.2em] text-[10px]">
                      Most Popular
                    </div>
                  )}
                  <div className={`p-8 ${tier.popular ? 'pt-10' : ''} flex flex-col items-center flex-1`}>
                    <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-6 text-center">{tier.label}</h3>
                    <div className="relative mb-8">
                      <div className={`absolute inset-0 bg-gradient-to-r ${tier.color} blur-2xl opacity-20`} />
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${tier.color} p-[2px] shadow-2xl`}>
                        <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                          <Coins className={`w-10 h-10 ${tier.popular ? 'text-[#FFD700]' : 'text-white'}`} />
                        </div>
                      </div>
                    </div>
                    <div className="text-center mb-8">
                      <span className="block text-4xl font-black text-white mb-2">{tier.coins.toLocaleString()} <span className="text-sm">Coins</span></span>
                      <span className="bg-white/5 px-4 py-1.5 rounded-full text-sm font-bold border border-white/5">Ksh {tier.ksh}</span>
                    </div>
                    <button
                      onClick={() => handlePurchase(tier.id, tier.coins)}
                      disabled={processingTier !== null}
                      className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all flex justify-center items-center gap-2 mt-auto ${
                        tier.popular
                          ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:scale-105'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {processingTier === tier.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Zap className="w-4 h-4" /> Purchase</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center text-xs font-bold text-gray-500 flex flex-col items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-green-500/50" />
              <p>Secure payments via M-Pesa. Transactions verify instantly.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
