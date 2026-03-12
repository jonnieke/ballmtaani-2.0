import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "wouter";
import { LIVE_MATCHES, UPCOMING_FIXTURES } from "../data/mockData";

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<"live" | "fixtures">("live");
  const { isLoggedIn, openLoginModal } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 border-b border-white/10">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-6 border-l-4 border-[#B30000] pl-4">
          Match Center
        </h1>
        
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab("live")}
            className={`pb-3 text-sm md:text-base font-black uppercase tracking-widest transition-colors relative ${activeTab === "live" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Live Actions
            {activeTab === "live" && <span className="absolute bottom-0 left-0 w-full h-1 bg-[#B30000] rounded-t"></span>}
          </button>
          <button 
            onClick={() => setActiveTab("fixtures")}
            className={`pb-3 text-sm md:text-base font-black uppercase tracking-widest transition-colors relative ${activeTab === "fixtures" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Fixtures
            {activeTab === "fixtures" && <span className="absolute bottom-0 left-0 w-full h-1 bg-[#B30000] rounded-t"></span>}
          </button>
        </div>
      </div>

      {activeTab === "live" ? (
        <div className="space-y-6">
          {LIVE_MATCHES.map(match => (
            <div key={match.id} className="bg-[rgba(20,20,25,0.95)] rounded-xl border-l-4 border-[#B30000] border-y border-r border-white/5 p-5 md:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B30000]/5 blur-[50px] rounded-full pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{match.league}</span>
                <span className="bg-[#B30000] text-white text-[10px] md:text-xs font-black uppercase px-2 py-1 rounded flex items-center gap-2">
                  LIVE <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> {match.minute}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4 w-1/3">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg md:text-2xl font-black text-white shrink-0 shadow-lg" style={{ backgroundColor: match.homeColor }}>
                    {match.homeInitial}
                  </div>
                  <span className="font-bold text-sm md:text-lg truncate">{match.home}</span>
                </div>
                
                <div className="flex items-center justify-center w-1/3 gap-3 md:gap-6">
                  <span className="text-4xl md:text-5xl font-black">{match.homeScore}</span>
                  <span className="text-xl md:text-2xl font-black text-gray-600">-</span>
                  <span className="text-4xl md:text-5xl font-black">{match.awayScore}</span>
                </div>
                
                <div className="flex items-center justify-end gap-3 md:gap-4 w-1/3">
                  <span className="font-bold text-sm md:text-lg truncate text-right">{match.away}</span>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg md:text-2xl font-black text-white shrink-0 shadow-lg" style={{ backgroundColor: match.awayColor }}>
                    {match.awayInitial}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center md:text-left">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Possession</span>
                  <span className="text-xs font-bold">{match.possession}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Goals</span>
                  <span className="text-xs font-bold text-gray-300">{match.scorers}</span>
                </div>
                <div className="text-center md:text-right">
                  <Link 
                    href="/predictions"
                    className="inline-block bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors"
                  >
                    Predict Final Score
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {["Today", "Tomorrow"].map(date => (
            <div key={date}>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-600"></div> {date}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {UPCOMING_FIXTURES.filter(f => f.date === date).map(fixture => (
                  <div key={fixture.id} className="bg-[#1B1B1B] rounded-xl border border-white/5 p-4 shadow-lg hover:border-white/10 transition-colors flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{fixture.league}</span>
                      <span className="bg-[#0B0B0B] border border-white/10 text-gray-300 text-[10px] font-bold uppercase px-2 py-1 rounded">
                        {fixture.time}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-5 flex-1">
                      <div className="flex flex-col items-center gap-2 w-[40%]">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white" style={{ backgroundColor: fixture.homeColor }}>{fixture.homeInitial}</div>
                        <span className="font-bold text-sm text-center w-full truncate">{fixture.home}</span>
                      </div>
                      
                      <div className="text-sm font-black text-gray-600">VS</div>
                      
                      <div className="flex flex-col items-center gap-2 w-[40%]">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white" style={{ backgroundColor: fixture.awayColor }}>{fixture.awayInitial}</div>
                        <span className="font-bold text-sm text-center w-full truncate">{fixture.away}</span>
                      </div>
                    </div>
                    
                    <Link href="/predictions" className="block w-full text-center bg-[#B30000] hover:bg-red-800 text-white font-bold uppercase tracking-wider text-xs py-2.5 rounded transition-colors mt-auto">
                      Predict Score
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
