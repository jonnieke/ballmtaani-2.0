import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useData";
import { Redirect } from "wouter";
import { LogOut, Trophy, Settings, Flame, Target } from "lucide-react";

export default function ProfilePage() {
  const { isLoggedIn, user, username, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"predictions" | "debates" | "badges">("predictions");

  const { data: profile } = useProfile(user?.id);

  if (!isLoggedIn) {
    return <Redirect to="/" />;
  }

  const displayUsername = profile?.username || username || "Fan";
  const points = profile?.points || 0;
  const streak = profile?.streak || 0;
  const country = profile?.country || "Kenya 🇰🇪";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Profile Header */}
      <div className="bg-[#1B1B1B] rounded-2xl border border-white/10 shadow-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-[#B30000] via-[#FFD700] to-[#1E6FFF]"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#0B0B0B] border-4 border-[#B30000] flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-[0_0_20px_rgba(179,0,0,0.4)] shrink-0">
            {displayUsername.substring(0, 2).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-widest uppercase mb-1">{displayUsername}</h1>
            <p className="text-[#FFD700] font-bold text-sm tracking-wider uppercase mb-4">@{displayUsername.toLowerCase()} • {country}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded">
                Joined Mar 2025
              </span>
              <span className="bg-[#B30000]/10 border border-[#B30000]/30 text-[#B30000] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Rank --
              </span>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors md:self-start border border-transparent hover:border-white/10 px-3 py-2 rounded"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
          <div className="text-center">
            <span className="block text-3xl font-black text-[#FFD700]">{points}</span>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Points</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-black text-white">--</span>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Predictions</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-black text-green-500">--</span>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Correct</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-black text-[#B30000] flex items-center justify-center gap-1">
              {streak} <Flame className="w-5 h-5" />
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Current Streak</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6 overflow-x-auto hide-scrollbar">
        {[
          { id: "predictions", label: "History" },
          { id: "debates", label: "My Debates" },
          { id: "badges", label: "Badges" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-4 font-black uppercase tracking-widest text-sm whitespace-nowrap transition-colors relative
              ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#B30000]"></div>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === "predictions" && (
          <div className="space-y-4">
            <div className="bg-[#1B1B1B] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between opacity-50">
              <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">No prediction history yet</div>
            </div>
          </div>
        )}

        {activeTab === "debates" && (
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-[#1B1B1B] border border-white/5 rounded-xl p-5 opacity-50">
              <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">No debates joined yet</div>
            </div>
          </div>
        )}

        {activeTab === "badges" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0B0B0B] border border-white/5 rounded-xl p-6 flex flex-col items-center text-center opacity-50 grayscale">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h4 className="font-black uppercase text-sm text-white mb-1">Sharpshooter</h4>
              <p className="text-[10px] text-gray-400 uppercase">Locked</p>
            </div>
            
            <div className="bg-[#0B0B0B] border border-white/5 rounded-xl p-6 flex flex-col items-center text-center opacity-50 grayscale">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mb-4">
                <Flame className="w-8 h-8" />
              </div>
              <h4 className="font-black uppercase text-sm text-white mb-1">On Fire</h4>
              <p className="text-[10px] text-gray-400 uppercase">Locked</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
