import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Coins, Loader2, Info, History, Gift, TrendingUp, Clock, Package, CheckCircle2, Phone, MapPin, X } from "lucide-react";
import { getCoinHistory, getTodayEarnings } from "../lib/coin-history";
import { COIN_REWARDS } from "../lib/coins-config";
import { InviteWidget } from "../components/InviteWidget";
import { supabase } from "../lib/supabase";

type StoreTab = "wallet" | "redeem" | "rewards";

interface RewardItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  cost_mtc: number;
  image_url: string | null;
  partner: string | null;
  stock: number | null;
  active: boolean;
}

interface RedemptionForm {
  contact_phone: string;
  delivery_name: string;
  delivery_address: string;
  notes: string;
}

const CATEGORY_EMOJI: Record<string, string> = { airtime: "📱", data: "🌐", merch: "👕", digital: "🎁" };
const CATEGORY_LABEL: Record<string, string> = { airtime: "Airtime", data: "Data Bundle", merch: "Merchandise", digital: "Digital" };

const REDEEM_ITEMS = [
  { id: 1, name: "Gold Profile Frame", cost: 2000, emoji: "Medal", description: "A legendary gold border around your avatar" },
  { id: 2, name: "VIP Fan Zone Access", cost: 5000, emoji: "Crown", description: "Unlock exclusive premium fan zones" },
  { id: 3, name: "Verified Fan Badge", cost: 3000, emoji: "Check", description: "Show your dedication with a verified badge" },
  { id: 4, name: "Match Analyst Badge", cost: 1500, emoji: "Stats", description: "Unlock the analyst title on your profile" },
  { id: 5, name: "Caption the Player Card", cost: 4000, emoji: "Card", description: "Create a custom player card with your photo" },
  { id: 6, name: "Duel Receipt Skin", cost: 1000, emoji: "Duel", description: "Give your fan duel receipts a premium look" },
  { id: 7, name: "WC26 Golden Boot Caller", cost: 3500, emoji: "Boot", description: "For fans who called the WC26 top scorer before kickoff" },
  { id: 8, name: "Africa Goes Far Badge", cost: 1500, emoji: "CAF", description: "Show your African football pride at WC26" },
  { id: 9, name: "WC26 Champion Caller", cost: 5000, emoji: "Trophy", description: "For fans who called the WC26 winner before kickoff" },
  { id: 10, name: "Group Stage Receipts Frame", cost: 1000, emoji: "Receipt", description: "Celebrate every correct WC26 group-stage call" },
];

export default function StorePage() {
  const { isLoggedIn, user, username, coins, updateCoins } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<StoreTab>("rewards");
  const [redeemedItem, setRedeemedItem] = useState<number | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<number | null>(null);

  // Real rewards state
  const [rewardItems, setRewardItems] = useState<RewardItem[]>([]);
  const [rewardLoading, setRewardLoading] = useState(true);
  const [redeemingItem, setRedeemingItem] = useState<RewardItem | null>(null);
  const [redeemForm, setRedeemForm] = useState<RedemptionForm>({ contact_phone: "", delivery_name: "", delivery_address: "", notes: "" });
  const [redeemSubmitting, setRedeemSubmitting] = useState(false);
  const [redeemDone, setRedeemDone] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) { setRewardLoading(false); return; }
    supabase.from("reward_items").select("*").eq("active", true).order("sort_order").then(({ data }) => {
      setRewardItems((data as RewardItem[]) || []);
      setRewardLoading(false);
    });
  }, []);

  const needsAddress = (cat: string) => cat === "merch";
  const needsPhone   = (cat: string) => cat === "airtime" || cat === "data";

  const resetRedeemModal = () => {
    setRedeemingItem(null);
    setRedeemForm({ contact_phone: "", delivery_name: "", delivery_address: "", notes: "" });
    setRedeemError(null);
  };

  async function submitRedemption() {
    if (!redeemingItem || !user || !supabase) return;
    setRedeemSubmitting(true);
    setRedeemError(null);

    // Airtime & data: server-side API handles Credofaster call + atomic coin deduction
    if (needsPhone(redeemingItem.category)) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) { setRedeemSubmitting(false); setRedeemError("Session expired — please log in again."); return; }

        const res = await fetch("/api/redeem-airtime", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ itemId: redeemingItem.id, phone: redeemForm.contact_phone, notes: redeemForm.notes || null }),
        });
        const data = await res.json() as any;

        if (res.ok) {
          updateCoins(-redeemingItem.cost_mtc);
          setRedeemDone(true);
          setTimeout(resetRedeemModal, 3500);
        } else {
          setRedeemError(data?.error ?? "Redemption failed — please try again.");
        }
      } catch {
        setRedeemError("Network error — check your connection and try again.");
      }
      setRedeemSubmitting(false);
      return;
    }

    // Merch: direct Supabase insert (fulfilled manually by admin within 3–7 days)
    await supabase.from("reward_redemptions").insert({
      user_id: user.id,
      user_email: user.email || null,
      display_name: username || null,
      item_id: redeemingItem.id,
      item_name: redeemingItem.name,
      item_category: redeemingItem.category,
      cost_mtc: redeemingItem.cost_mtc,
      contact_phone: redeemForm.contact_phone || null,
      delivery_name: redeemForm.delivery_name || null,
      delivery_address: redeemForm.delivery_address || null,
      notes: redeemForm.notes || null,
      status: "pending",
    });
    updateCoins(-redeemingItem.cost_mtc);
    setRedeemSubmitting(false);
    setRedeemDone(true);
    setTimeout(resetRedeemModal, 3500);
  }

  const history = getCoinHistory();
  const todayEarned = getTodayEarnings();

  const redeemed = (): number[] => {
    try { return JSON.parse(localStorage.getItem("mtaani_redeemed_items") || "[]"); }
    catch { return []; }
  };

  const handleRedeem = (itemId: number, cost: number) => {
    if (coins < cost) return; // button is already disabled; guard just in case
    setRedeemedItem(itemId);
    setTimeout(() => {
      updateCoins(-cost);
      const already = redeemed();
      localStorage.setItem("mtaani_redeemed_items", JSON.stringify([...already, itemId]));
      setRedeemedItem(null);
      setRedeemSuccess(itemId);
      setTimeout(() => setRedeemSuccess(null), 4000);
    }, 1000);
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
    <>
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

          <div className="flex gap-1 mt-8 bg-black/30 p-1 rounded-xl w-full">
            {([
              ["rewards", "Real Rewards", Package],
              ["wallet",  "Wallet",       TrendingUp],
              ["redeem",  "Perks",        Gift],
            ] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === id ? "bg-[#FFD700] text-black shadow-lg" : "text-gray-500 hover:text-white"}`}
              >
                <Icon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{label}</span><span className="sm:hidden">{label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* ── REAL REWARDS ── */}
        {activeTab === "rewards" && (
          <div className="space-y-6">
            {/* credoFaster banner */}
            <div className="flex items-center gap-3 rounded-2xl border border-[#FFD700]/20 bg-[#FFD700]/5 px-4 py-3">
              <span className="text-2xl">🤝</span>
              <div>
                <p className="text-xs font-black text-[#FFD700]">In partnership with credoFaster</p>
                <p className="text-[10px] text-white/40">Airtime &amp; data bundles delivered instantly to your Kenyan number</p>
              </div>
            </div>

            {/* Category sections */}
            {rewardLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">{[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />)}</div>
            ) : (
              (["airtime", "data", "merch"] as const).map(cat => {
                const catItems = rewardItems.filter(r => r.category === cat);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-base">{CATEGORY_EMOJI[cat]}</span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white/60">{CATEGORY_LABEL[cat]}</h3>
                      {cat !== "merch" && <span className="rounded-full border border-[#FFD700]/15 bg-[#FFD700]/6 px-2 py-0.5 text-[8px] font-black uppercase text-[#FFD700]/60">credoFaster</span>}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {catItems.map(item => {
                        const canAfford = coins >= item.cost_mtc;
                        return (
                          <div key={item.id} className={`rounded-2xl border p-4 transition-all ${canAfford ? "border-white/10 bg-[#111]" : "border-white/5 bg-[#0d0d0d] opacity-60"}`}>
                            <div className="mb-3 flex items-start justify-between gap-2">
                              <div>
                                <p className="font-black text-sm text-white">{item.name}</p>
                                {item.description && <p className="mt-0.5 text-[11px] text-white/40">{item.description}</p>}
                              </div>
                              {item.stock != null && item.stock < 20 && (
                                <span className="shrink-0 rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[8px] font-black text-orange-400">
                                  {item.stock} left
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Coins className="h-4 w-4 text-[#FFD700]" />
                                <span className="font-black text-[#FFD700]">{item.cost_mtc.toLocaleString()}</span>
                                <span className="text-[10px] text-white/30">MTC</span>
                              </div>
                              <button
                                onClick={() => { if (canAfford) setRedeemingItem(item); }}
                                disabled={!canAfford}
                                className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${canAfford ? "bg-[#FFD700] text-black hover:shadow-[0_0_16px_rgba(255,214,0,0.3)]" : "cursor-not-allowed bg-white/5 text-white/25"}`}>
                                {canAfford ? "Redeem" : "Need More"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}

            <p className="text-center text-[10px] text-white/20">
              Earn MTC by predicting matches, winning duels and participating in debates. Airtime delivered instantly · Merch ships within 3–7 days.
            </p>
          </div>
        )}

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
              {REDEEM_ITEMS.map(item => {
                const alreadyOwned = redeemed().includes(item.id);
                const isSuccess = redeemSuccess === item.id;
                return (
                  <div key={item.id} className={`bg-[#111] border rounded-2xl p-5 flex flex-col gap-3 transition-all ${
                    isSuccess ? "border-green-500/40 bg-green-500/5" :
                    alreadyOwned ? "border-[#FFD700]/30" :
                    coins >= item.cost ? "border-white/10" : "border-white/5 opacity-60"
                  }`}>
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
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-green-400">
                          ✓ Redeemed
                        </span>
                      ) : alreadyOwned ? (
                        <span className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-[#FFD700] border border-[#FFD700]/30 bg-[#FFD700]/8">
                          Owned
                        </span>
                      ) : (
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
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* ── Redemption modal ── */}
    {redeemingItem && (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-4" onClick={e => e.target === e.currentTarget && resetRedeemModal()}>
        <div className="w-full max-w-md overflow-hidden rounded-t-2xl border border-white/10 bg-[#0d1018] sm:rounded-2xl">
          {redeemDone ? (
            <div className="flex flex-col items-center gap-4 py-12 px-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-400" />
              <div>
                <p className="text-lg font-black text-white">Redemption Confirmed!</p>
                <p className="mt-1 text-sm text-white/50">Your request is being processed. We'll contact you within 24 hours.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{CATEGORY_EMOJI[redeemingItem.category]}</span>
                  <h2 className="text-sm font-black text-white">{redeemingItem.name}</h2>
                </div>
                <button onClick={resetRedeemModal} className="text-white/30 hover:text-white"><X className="h-4 w-4" /></button>
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between rounded-xl border border-[#FFD700]/20 bg-[#FFD700]/6 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-[#FFD700]" />
                    <span className="font-black text-[#FFD700]">{redeemingItem.cost_mtc.toLocaleString()} MTC</span>
                  </div>
                  <span className="text-[10px] text-white/40">Balance after: <span className="font-black text-white">{(coins - redeemingItem.cost_mtc).toLocaleString()}</span></span>
                </div>

                {needsPhone(redeemingItem.category) && (
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/35">
                      <Phone className="h-3 w-3" /> Phone Number *
                    </label>
                    <input value={redeemForm.contact_phone} onChange={e => setRedeemForm(f => ({ ...f, contact_phone: e.target.value }))}
                      placeholder="07XX XXX XXX — any Kenyan network"
                      className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none" />
                  </div>
                )}

                {needsAddress(redeemingItem.category) && (
                  <>
                    <div>
                      <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Full Name *</label>
                      <input value={redeemForm.delivery_name} onChange={e => setRedeemForm(f => ({ ...f, delivery_name: e.target.value }))}
                        placeholder="Name for delivery"
                        className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/35">
                        <MapPin className="h-3 w-3" /> Delivery Address *
                      </label>
                      <input value={redeemForm.delivery_address} onChange={e => setRedeemForm(f => ({ ...f, delivery_address: e.target.value }))}
                        placeholder="Town, estate, building — Kenya only"
                        className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Phone Number</label>
                      <input value={redeemForm.contact_phone} onChange={e => setRedeemForm(f => ({ ...f, contact_phone: e.target.value }))}
                        placeholder="07XX XXX XXX"
                        className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none" />
                    </div>
                  </>
                )}

                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Notes (optional)</label>
                  <input value={redeemForm.notes} onChange={e => setRedeemForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={redeemingItem.category === "merch" ? "e.g. Size L, green if available" : "Any special instructions"}
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none" />
                </div>

                <p className="text-[10px] text-white/25">
                  {needsPhone(redeemingItem.category) ? "Airtime delivered instantly via credoFaster to any Kenyan network." : "Delivery within Kenya only. Allow 3–7 business days."}
                </p>

                {redeemError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-400 font-bold">
                    ⚠ {redeemError}
                  </div>
                )}
              </div>

              <div className="flex gap-2 border-t border-white/6 p-4">
                <button onClick={resetRedeemModal} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
                <button onClick={submitRedemption} disabled={redeemSubmitting ||
                  (needsPhone(redeemingItem.category) && !redeemForm.contact_phone) ||
                  (needsAddress(redeemingItem.category) && (!redeemForm.delivery_name || !redeemForm.delivery_address))}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFD700] py-2.5 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-yellow-300 disabled:opacity-35 active:scale-95">
                  {redeemSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gift className="h-3.5 w-3.5" />}
                  {redeemSubmitting ? "Processing…" : `Confirm · ${redeemingItem.cost_mtc.toLocaleString()} MTC`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}
