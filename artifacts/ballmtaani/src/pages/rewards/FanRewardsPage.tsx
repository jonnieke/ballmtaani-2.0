import React, { useState } from "react";
import { Link } from "wouter";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Trophy, Gift, Sparkles, CheckCircle2, Ticket, Smartphone, ShoppingBag, HelpCircle, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import MchezajiBoraVote from "../../components/rewards/MchezajiBoraVote";
import RouteSEO from "../../components/RouteSEO";

interface RewardItem {
  id: string;
  title: string;
  category: "ticket" | "merch" | "airtime";
  pointsCost: number;
  description: string;
  stock: number;
  badge: string;
}

const REWARD_CATALOG: RewardItem[] = [
  {
    id: "r1",
    title: "Shabana FC Home Match Ticket (Gusii Stadium)",
    category: "ticket",
    pointsCost: 1200,
    description: "Regular terrace matchday ticket for any upcoming Shabana FC home game at Gusii Stadium.",
    stock: 25,
    badge: "Tore Bobe Matchday",
  },
  {
    id: "r2",
    title: "Mashemeji Derby VIP Match Ticket (Nyayo Stadium)",
    category: "ticket",
    pointsCost: 2500,
    description: "VIP access ticket for Gor Mahia vs AFC Leopards at Nyayo National Stadium.",
    stock: 10,
    badge: "Derby VIP",
  },
  {
    id: "r3",
    title: "Official Shabana FC / Gor Mahia Fan Scarf",
    category: "merch",
    pointsCost: 1800,
    description: "High quality knit supporter scarf delivered to your nearest Nairobi/Gusii pickup point.",
    stock: 18,
    badge: "Official Merch",
  },
  {
    id: "r4",
    title: "Safaricom KES 100 Instant Airtime Voucher",
    category: "airtime",
    pointsCost: 800,
    description: "Direct instant airtime top-up sent to your Safaricom mobile phone number.",
    stock: 150,
    badge: "Instant Topup",
  },
];

export default function FanRewardsPage() {
  const [userPoints, setUserPoints] = useState(1450);
  const [redeemedItem, setRedeemedItem] = useState<RewardItem | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedQuizOpt, setSelectedQuizOpt] = useState<number | null>(null);

  const handleRedeem = (item: RewardItem) => {
    if (userPoints >= item.pointsCost) {
      setUserPoints((p) => p - item.pointsCost);
      setRedeemedItem(item);
    }
  };

  const handleQuizSubmit = (optIndex: number) => {
    if (quizAnswered) return;
    setSelectedQuizOpt(optIndex);
    setQuizAnswered(true);
    if (optIndex === 1) {
      setUserPoints((p) => p + 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      <RouteSEO path="/rewards" />

      {/* Hero Section with MTC Points Wallet */}
      <div className="border-b border-white/10 bg-gradient-to-b from-[#1a1400] via-[#121212] to-[#0A0A0A] px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl text-center space-y-4">
          <Badge className="mx-auto inline-flex border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-xs font-bold text-[#FFD700]">
            <Gift className="h-3.5 w-3.5 mr-1" /> Mtaa Fan Rewards Vault
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Turn Your Football Knowledge,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-amber-200 to-emerald-400">
              Into Match Tickets, Jerseys &amp; Airtime.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-gray-300">
            Earn MTC (Mtaa Coins) by predicting match outcomes, voting for Mchezaji Bora, and completing grassroots quizzes.
          </p>

          {/* User Points Card */}
          <div className="pt-3">
            <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-black/60 border border-[#FFD700]/30 shadow-2xl">
              <div className="text-left">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Your Wallet Balance</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#FFD700] font-mono">
                  {userPoints.toLocaleString()} <span className="text-xs text-gray-300 font-sans">MTC</span>
                </span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                Active Fan Level
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Matchday Trivia / Quiz Box */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                ?
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Matchday Grassroots Trivia</h3>
                <p className="text-[11px] text-gray-400">Answer correctly to earn +100 MTC</p>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
              +100 MTC
            </Badge>
          </div>

          <div className="space-y-3">
            <p className="text-xs sm:text-sm font-bold text-gray-200">
              Which famous school produced Kenya's all-time top scorer Michael Olunga?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                "Kakamega High School",
                "Upper Hill School (Nairobi)",
                "St. Anthony's Boys Kitale",
                "Highway Secondary",
              ].map((opt, idx) => {
                const isSelected = selectedQuizOpt === idx;
                const isCorrect = idx === 1;

                return (
                  <button
                    key={idx}
                    disabled={quizAnswered}
                    onClick={() => handleQuizSubmit(idx)}
                    className={`p-3 rounded-xl border text-left font-medium transition-all ${
                      quizAnswered
                        ? isCorrect
                          ? "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold"
                          : isSelected
                          ? "bg-red-950/40 border-red-500 text-red-300"
                          : "bg-white/5 border-white/5 text-gray-500"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-200"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {quizAnswered && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Correct answer! Upper Hill School nurtured Michael Olunga. +100 MTC awarded to your wallet.
              </div>
            )}
          </div>
        </div>

        {/* Mchezaji Bora Voting Section */}
        <MchezajiBoraVote />

        {/* Rewards Redemption Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Redemption Catalog</h2>
              <p className="text-xs text-gray-400">Claim match tickets, team scarves and airtime directly with your MTC points</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {REWARD_CATALOG.map((item) => {
              const canAfford = userPoints >= item.pointsCost;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-[#121212] p-5 space-y-4 hover:border-[#FFD700]/40 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 text-[10px]">
                        {item.badge}
                      </Badge>
                      <span className="text-xs text-gray-400 font-mono">{item.stock} left</span>
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="font-mono">
                      <span className="text-[10px] text-gray-400 block font-sans">Price</span>
                      <span className="text-lg font-black text-[#FFD700]">
                        {item.pointsCost.toLocaleString()} MTC
                      </span>
                    </div>

                    <Button
                      disabled={!canAfford}
                      onClick={() => handleRedeem(item)}
                      className={`font-bold text-xs h-9 px-4 ${
                        canAfford
                          ? "bg-[#FFD700] text-black hover:bg-[#E6C200] shadow-md"
                          : "bg-white/10 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {canAfford ? "Redeem Reward" : "Need More MTC"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Redemption Confirmation Modal */}
      {redeemedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#121212] border border-[#FFD700]/40 rounded-2xl p-6 shadow-2xl space-y-5 text-center text-white">
            <div className="h-14 w-14 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center mx-auto border border-[#FFD700]/40">
              <Gift className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Reward Claimed!</h3>
              <p className="text-xs text-emerald-400 font-bold">{redeemedItem.title}</p>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Your voucher code and redemption instructions have been prepared. Our operations team will disburse your ticket/airtime to your verified phone number.
            </p>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-[#FFD700]">
              Voucher Code: <strong>BM-REWARD-{Math.floor(100000 + Math.random() * 900000)}</strong>
            </div>

            <Button
              onClick={() => setRedeemedItem(null)}
              className="w-full bg-[#FFD700] hover:bg-[#E6C200] text-black font-bold text-xs h-10"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
