import { useState } from "react";
import { GrudgeMatchFeed } from "../components/GrudgeMatchFeed";
import { Swords, Trophy, Activity, History, Coins, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function RivalriesPage() {
  const { coins } = useAuth();
  const [activeTab, setActiveTab] = useState<"active" | "global" | "history">("active");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header & Stats Summary */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12 bg-[#1B1B1B] rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none" />
        
        <div className="relative z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <Swords className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(179,0,0,0.5)]" />
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
              GRUDGE <span className="text-[#FFD700]">MATCHES</span>
            </h1>
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Settle the score. Earn Mtaani Coins.</p>
        </div>

        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 flex-1 md:min-w-[140px] text-center">
            <span className="block text-2xl font-black text-white">12-4</span>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">H2H Record</span>
          </div>
          <div className="bg-black/60 border border-[#FFD700]/30 rounded-2xl p-4 flex-1 md:min-w-[140px] text-center shadow-[0_0_20px_rgba(255,215,0,0.1)]">
            <span className="block text-2xl font-black text-[#FFD700]">+24.5k</span>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Coins Won</span>
          </div>
          <div className="bg-black/60 border border-accent/30 rounded-2xl p-4 flex-1 md:min-w-[140px] text-center">
            <span className="block text-2xl font-black text-accent">1.4k</span>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Interactions</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-black/40 p-2 rounded-2xl border border-white/5 w-fit">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          <Activity className="w-4 h-4" /> My Active Duels
        </button>
        <button
          onClick={() => setActiveTab("global")}
          className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'global' ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          <TrendingUp className="w-4 h-4" /> Global Feed
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          <History className="w-4 h-4" /> Hall of Shame
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === "active" || activeTab === "global" ? (
          <div className="space-y-8">
            {activeTab === "active" && (
              <div className="bg-orange-950/20 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-4 mb-6">
                <Coins className="w-6 h-6 text-orange-500 animate-bounce" />
                <p className="text-orange-200 text-sm font-bold">You have 1 pending challenge from <span className="text-white">Wanjiku 🇰🇪</span> Worth 500 Coins!</p>
              </div>
            )}
            <GrudgeMatchFeed />
          </div>
        ) : (
          <div className="bg-[#1B1B1B] rounded-2xl border border-white/5 p-12 text-center opacity-50 grayscale">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase tracking-widest text-gray-500">History Empty</h3>
            <p className="text-sm text-gray-600 font-bold mt-2 uppercase">Your conquests will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
