import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LEADERBOARD } from "../data/mockData";
import { Trophy, HelpCircle } from "lucide-react";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"global" | "weekly" | "country">("global");
  const { isLoggedIn, username } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-[#FFD700] mb-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8" /> Leaderboard <Trophy className="w-8 h-8" />
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-wider">Top predictors across the continent</p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-4 mb-8">
        {[
          { id: "global", label: "Global Top 50" },
          { id: "weekly", label: "This Week" },
          { id: "country", label: "My Country" }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 sm:px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs sm:text-sm transition-all
              ${activeTab === tab.id ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 'bg-[#1B1B1B] text-gray-400 border border-white/10 hover:text-white hover:border-white/20'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#1B1B1B] rounded-xl border border-white/10 shadow-2xl overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#0B0B0B] border-b border-white/10 text-gray-500 text-[10px] sm:text-xs uppercase tracking-widest font-bold">
                <th className="px-4 py-4 w-16 text-center">Rank</th>
                <th className="px-4 py-4">Player</th>
                <th className="px-4 py-4 text-center">Correct</th>
                <th className="px-4 py-4 text-center">Streak</th>
                <th className="px-4 py-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {LEADERBOARD.map((player) => {
                const isMe = isLoggedIn && player.name === username;
                let rankStyle = "text-gray-400";
                if (player.rank === 1) rankStyle = "text-[#FFD700] font-black text-lg";
                if (player.rank === 2) rankStyle = "text-gray-300 font-black text-lg";
                if (player.rank === 3) rankStyle = "text-[#CD7F32] font-black text-lg";

                return (
                  <tr key={player.rank} className={`hover:bg-white/5 transition-colors ${isMe ? 'bg-[#B30000]/10 border-l-4 border-l-[#B30000]' : ''}`}>
                    <td className={`px-4 py-4 text-center ${rankStyle}`}>
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg ${
                          player.rank === 1 ? 'bg-gradient-to-br from-[#FFD700] to-yellow-600 text-black' :
                          player.rank === 2 ? 'bg-gradient-to-br from-gray-200 to-gray-500 text-black' :
                          player.rank === 3 ? 'bg-gradient-to-br from-[#CD7F32] to-amber-800 text-white' :
                          'bg-[#0B0B0B] border border-white/10 text-white'
                        }`}>
                          {player.name[0]}
                        </div>
                        <div>
                          <span className={`font-bold block ${isMe ? 'text-[#B30000]' : 'text-white'}`}>
                            {player.name} {isMe && <span className="text-[10px] bg-[#B30000] text-white px-1.5 py-0.5 rounded ml-2">YOU</span>}
                          </span>
                          <span className="text-[10px] text-gray-500 tracking-widest">{player.country}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-medium text-gray-300">{player.correct}</td>
                    <td className="px-4 py-4 text-center">
                      {player.streak > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[#B30000] font-black text-xs bg-[#B30000]/10 px-2 py-1 rounded">
                          🔥 {player.streak}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-black tracking-wider ${player.rank <= 3 ? 'text-[#FFD700]' : 'text-white'}`}>
                        {player.pts}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules Section */}
      <div className="bg-[rgba(20,20,25,0.95)] rounded-xl border border-[#1E6FFF]/30 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E6FFF]/10 blur-[60px] rounded-full pointer-events-none"></div>
        
        <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
          <HelpCircle className="w-5 h-5 text-[#1E6FFF]" />
          How Points Work
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
          <div className="bg-[#0B0B0B] p-4 rounded-lg border border-white/5">
            <div className="text-[#00FF00] font-black text-xl mb-1">+10 Points</div>
            <div className="font-bold text-sm text-white mb-2 uppercase tracking-wider">Exact Score</div>
            <p className="text-xs text-gray-400">You predicted 2-1, game ends 2-1. Masterclass.</p>
          </div>
          
          <div className="bg-[#0B0B0B] p-4 rounded-lg border border-white/5">
            <div className="text-[#FFD700] font-black text-xl mb-1">+5 Points</div>
            <div className="font-bold text-sm text-white mb-2 uppercase tracking-wider">Correct Result</div>
            <p className="text-xs text-gray-400">You predicted Arsenal to win, they win but with a different score.</p>
          </div>
          
          <div className="bg-[#0B0B0B] p-4 rounded-lg border border-white/5">
            <div className="text-[#B30000] font-black text-xl mb-1">+2 Bonus</div>
            <div className="font-bold text-sm text-white mb-2 uppercase tracking-wider">Streak Multiplier</div>
            <p className="text-xs text-gray-400">Get 3 correct results in a row to activate the fire multiplier.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
