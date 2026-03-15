import { Zap, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import TeamLogo from "./TeamLogo";
import { Link } from "wouter";

interface PremiumMatchCardProps {
  match: {
    id: string;
    home: string;
    away: string;
    homeLogo?: string;
    awayLogo?: string;
    homeColor?: string;
    awayColor?: string;
    homeInitial?: string;
    awayInitial?: string;
    homeScore?: number;
    awayScore?: number;
    minute?: string;
    league?: string;
    time?: string;
    date?: string;
    status?: string | 'FT' | 'LIVE';
  };
}

export default function PremiumMatchCard({ match }: PremiumMatchCardProps) {
  const isLive = match.status === 'LIVE' || !!match.minute;
  const isFinished = match.status === 'FT';
  const isUpcoming = !isLive && !isFinished;

  return (
    <Link href={isUpcoming ? "/predictions" : `/live-center/${match.id}`} className="block snap-start group">
      <motion.div 
        whileHover={{ y: -5 }}
        className={`shrink-0 w-[300px] md:w-[340px] rounded-3xl bg-[rgba(20,20,25,0.8)] backdrop-blur-xl border border-white/10 shadow-2xl p-6 relative overflow-hidden transition-all hover:bg-[rgba(30,30,35,0.9)] hover:border-primary/50 group`}
      >
        {/* State Badge */}
        <div className="absolute top-0 right-0 overflow-hidden">
          {isLive ? (
            <div className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              LIVE
            </div>
          ) : isFinished ? (
            <div className="bg-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
              FT
            </div>
          ) : (
            <div className="bg-[#1E6FFF]/20 text-[#1E6FFF] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl border-l border-b border-[#1E6FFF]/20">
              UPCOMING
            </div>
          )}
        </div>

        {/* League Info */}
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
          {match.league || "Premier League"}
          <span className="w-1 h-1 rounded-full bg-gray-700"></span>
          {match.date || (isLive ? "Today" : "Matchday")}
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-between mb-8">
          {/* Home */}
          <div className="flex flex-col items-center gap-3 w-1/3">
            <TeamLogo logo={match.homeLogo} initial={match.homeInitial || ""} color={match.homeColor || "#555"} size="md" shadow />
            <span className="font-black text-xs text-white uppercase tracking-wide text-center leading-tight truncate w-full">
              {match.home}
            </span>
          </div>

          {/* Center: Score or Time */}
          <div className="flex flex-col items-center justify-center gap-1 px-4">
            {isUpcoming ? (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white tracking-tighter">{match.time?.split(' ')[0]}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">{match.time?.split(' ')[1] || "EAT"}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className={`text-4xl font-black ${isFinished ? 'text-gray-400' : 'text-white'}`}>{match.homeScore ?? 0}</span>
                <span className="text-gray-600 text-xl font-black">:</span>
                <span className={`text-4xl font-black ${isFinished ? 'text-gray-400' : 'text-white'}`}>{match.awayScore ?? 0}</span>
              </div>
            )}
            
            {isLive && (
              <span className="text-[10px] font-black text-primary tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 mt-2">
                {match.minute}
              </span>
            )}
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-3 w-1/3">
            <TeamLogo logo={match.awayLogo} initial={match.awayInitial || ""} color={match.awayColor || "#777"} size="md" shadow />
            <span className="font-black text-xs text-white uppercase tracking-wide text-center leading-tight truncate w-full">
              {match.away}
            </span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLive ? (
              <div className="flex items-center gap-1.5 text-[9px] font-black text-[#FFD700] uppercase tracking-widest">
                <Zap className="w-3 h-3" />
                Flash Bounty Active
              </div>
            ) : isUpcoming ? (
              <div className="flex items-center gap-1.5 text-[9px] font-black text-[#1E6FFF] uppercase tracking-widest">
                <TrendingUp className="w-3 h-3" />
                94% Predict Home
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                <Calendar className="w-3 h-3" />
                Match Ended
              </div>
            )}
          </div>
          
          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
            isLive ? 'bg-primary text-white group-hover:bg-red-700' : 
            isUpcoming ? 'bg-[#1E6FFF] text-white group-hover:bg-blue-700' : 
            'bg-white/10 text-gray-400 group-hover:bg-white/20'
          }`}>
            {isLive ? 'Join Live' : isUpcoming ? 'Predict' : 'View Stats'}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
