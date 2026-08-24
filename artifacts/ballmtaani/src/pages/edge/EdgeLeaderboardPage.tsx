import React, { useState } from "react";
import { Link } from "wouter";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Trophy, Medal, Flame, CheckCircle, ArrowRight, Share2, Sparkles, User, Award, ShieldCheck, History } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";
import TelegramNotificationBridge from "../../components/edge/TelegramNotificationBridge";

interface LeaderboardUser {
  rank: number;
  name: string;
  location: string;
  accuracy: number;
  totalReceipts: number;
  wonReceipts: number;
  points: number;
  badge: string;
  badgeColor: string;
  streak: number;
}

const TOP_KENYAN_PROGNOSTICATORS: LeaderboardUser[] = [
  {
    rank: 1,
    name: "Otieno 'K'Ogalo Master'",
    location: "Nairobi (Eastlands)",
    accuracy: 82.4,
    totalReceipts: 34,
    wonReceipts: 28,
    points: 3450,
    badge: "Mashemeji Derby King",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    streak: 6,
  },
  {
    rank: 2,
    name: "Mwangi 'The Tactician'",
    location: "Kiambu / Thika",
    accuracy: 78.8,
    totalReceipts: 52,
    wonReceipts: 41,
    points: 3120,
    badge: "EPL Sharp Analyst",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    streak: 4,
  },
  {
    rank: 3,
    name: "Kipchumba 'Data Kip'",
    location: "Eldoret",
    accuracy: 76.5,
    totalReceipts: 40,
    wonReceipts: 31,
    points: 2890,
    badge: "Poisson Master",
    badgeColor: "bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30",
    streak: 5,
  },
  {
    rank: 4,
    name: "Amina 'Coastal Queen'",
    location: "Mombasa",
    accuracy: 74.3,
    totalReceipts: 35,
    wonReceipts: 26,
    points: 2450,
    badge: "FKF Scout",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    streak: 3,
  },
  {
    rank: 5,
    name: "Juma 'UCL Wizard'",
    location: "Kisumu",
    accuracy: 72.0,
    totalReceipts: 50,
    wonReceipts: 36,
    points: 2310,
    badge: "Champions League Pro",
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    streak: 2,
  },
];

export default function EdgeLeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "my_receipts">("leaderboard");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      <RouteSEO path="/edge/leaderboard" />

      {/* Hero Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-[#121212] via-[#0A0A0A] to-[#0A0A0A] px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-5xl text-center space-y-4">
          <Badge className="mx-auto inline-flex border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-xs font-bold text-[#FFD700]">
            <Trophy className="h-3.5 w-3.5 mr-1" /> Mtaa Prediction Community Leaderboard
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Kenya's Sharpest Football Fans,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Ranked by Prediction Accuracy.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-gray-300">
            Keep your matchday prediction receipts, test your football instincts against the Dixon-Coles model, and climb the weekly Kenyan leaderboard to win MTC engagement points.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "leaderboard"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              Weekly Leaderboard
            </button>
            <button
              onClick={() => setActiveTab("my_receipts")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "my_receipts"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              My Saved Receipts
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Telegram Alert Bridge Banner */}
        <TelegramNotificationBridge variant="banner" />

        {activeTab === "leaderboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#FFD700]" /> Top Prognosticators This Week
                </h2>
                <p className="text-xs text-gray-400">Ranked by verified prediction strike-rate (%) and settled receipts</p>
              </div>

              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                Updated Live
              </Badge>
            </div>

            {/* Leaderboard Cards */}
            <div className="space-y-3">
              {TOP_KENYAN_PROGNOSTICATORS.map((user) => (
                <div
                  key={user.rank}
                  className={`rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    user.rank === 1
                      ? "border-[#FFD700]/40 bg-gradient-to-r from-amber-950/20 via-[#141414] to-[#121212] shadow-xl"
                      : "border-white/10 bg-[#121212] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Circle */}
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-extrabold font-mono text-sm shrink-0 ${
                        user.rank === 1
                          ? "bg-[#FFD700] text-black shadow-lg"
                          : user.rank === 2
                          ? "bg-slate-300 text-black"
                          : user.rank === 3
                          ? "bg-amber-700 text-white"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      #{user.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{user.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${user.badgeColor}`}>
                          {user.badge}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 block">{user.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5 font-mono text-xs">
                    <div className="text-center sm:text-right">
                      <span className="text-[10px] text-gray-400 block font-sans">Strike Rate</span>
                      <span className="text-base font-bold text-emerald-400">{user.accuracy}%</span>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className="text-[10px] text-gray-400 block font-sans">Receipts</span>
                      <span className="text-sm font-bold text-white">{user.wonReceipts} / {user.totalReceipts}</span>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className="text-[10px] text-gray-400 block font-sans">Win Streak</span>
                      <span className="text-sm font-bold text-[#FFD700] flex items-center justify-center sm:justify-end gap-1">
                        <Flame className="h-3.5 w-3.5 fill-current" /> {user.streak}W
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-sans">MTC Points</span>
                      <span className="text-base font-extrabold text-[#FFD700]">{user.points}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "my_receipts" && (
          <div className="rounded-xl border border-white/10 bg-[#121212] p-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <History className="h-8 w-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-bold text-white">Your Prediction Receipts Ledger</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Save match prediction receipts on any fixture across BallMtaani Edge. We automatically track your record against the model once the final whistle blows.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-4">
              <Link href="/edge">
                <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs">
                  Explore Today's Matches <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
