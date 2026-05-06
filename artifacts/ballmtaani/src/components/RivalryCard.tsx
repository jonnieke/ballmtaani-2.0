import { UserBadge } from "./UserBadge";
import { Swords, Coins, TrendingUp, Trophy } from "lucide-react";

interface RivalryCardProps {
  challenger: {
    name: string;
    interactions: number;
    avatar?: string;
  };
  defender: {
    name: string;
    interactions: number;
    avatar?: string;
  };
  match: {
    home: string;
    away: string;
    homeLogo: string;
    awayLogo: string;
    time: string;
  };
  stake: number;
  status: "pending" | "active" | "completed";
  winner?: string;
  prediction?: string;
}

export function RivalryCard({ challenger, defender, match, stake, status, winner, prediction }: RivalryCardProps) {
  return (
    <div className="bg-[#1B1B1B] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#B30000]/5 to-[#1E6FFF]/5 pointer-events-none" />
      
      {status === 'active' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-600 to-orange-500 animate-pulse" />
      )}

      {/* Stake Banner */}
      <div className="bg-black/40 py-2 border-b border-white/5 flex items-center justify-center gap-2">
        <Coins className="w-4 h-4 text-[#FFD700]" />
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD700]">
          Pot: {stake * 2} MTC
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Challenger */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-16 h-16 rounded-full bg-[#0B0B0B] border-2 border-[#1E6FFF] flex items-center justify-center text-xl font-black mb-2 shadow-[0_0_15px_rgba(30,111,255,0.3)]">
              {challenger.name.substring(0, 1)}
            </div>
            <span className="text-sm font-black text-white truncate w-full">{challenger.name}</span>
            <UserBadge interactions={challenger.interactions} showLabel={false} className="scale-75 mt-1" />
          </div>

          {/* Versus Icon */}
          <div className="flex flex-col items-center gap-1">
            <div className={`p-3 rounded-full ${status === 'active' ? 'bg-red-600 text-white animate-bounce' : 'bg-white/5 text-gray-500'} border border-white/10`}>
              <Swords className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#B30000]">VS</span>
          </div>

          {/* Defender */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className={`w-16 h-16 rounded-full bg-[#0B0B0B] border-2 border-[#B30000] flex items-center justify-center text-xl font-black mb-2 shadow-[0_0_15px_rgba(179,0,0,0.3)] ${status === 'pending' ? 'grayscale opacity-50' : ''}`}>
              {defender.name.substring(0, 1)}
            </div>
            <span className="text-sm font-black text-white truncate w-full">{defender.name}</span>
            <UserBadge interactions={defender.interactions} showLabel={false} className="scale-75 mt-1" />
          </div>
        </div>

        {/* Match Info */}
        <div className="bg-black/50 rounded-xl p-4 border border-white/5 relative">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <img src={match.homeLogo} className="w-6 h-6 object-contain" alt="" />
              <span className="text-[10px] font-bold text-gray-300 uppercase truncate max-w-[60px]">{match.home}</span>
            </div>
            <span className="text-[10px] font-black text-gray-500">vs</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-300 uppercase truncate max-w-[60px]">{match.away}</span>
              <img src={match.awayLogo} className="w-6 h-6 object-contain" alt="" />
            </div>
          </div>
          <div className="text-center text-[10px] font-black text-[#1E6FFF] tracking-widest mt-2 uppercase border-t border-white/5 pt-2">
            {match.time}
          </div>
        </div>

        {/* Prediction / Status */}
        <div className="mt-6 flex flex-col gap-3">
          {status === 'pending' ? (
            <button className="w-full bg-[#1E6FFF] hover:bg-blue-700 text-white font-black uppercase tracking-widest py-3 rounded-lg transition-all shadow-lg active:scale-95">
              Accept Duel
            </button>
          ) : status === 'active' ? (
            <div className="flex items-center justify-center gap-2 text-[#FFD700] bg-[#FFD700]/10 py-3 rounded-lg border border-[#FFD700]/20">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Duel Live</span>
            </div>
          ) : (
            <div className="bg-[#B30000]/10 border border-[#B30000]/20 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-[#B30000] mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Winner: {winner}</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Score: {prediction}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
