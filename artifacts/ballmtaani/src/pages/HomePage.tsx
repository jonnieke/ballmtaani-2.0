import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Share2, MessageSquare, ChevronRight, Trophy } from "lucide-react";
import { LIVE_MATCHES, UPCOMING_FIXTURES, AI_PREDICTIONS, DEBATES, BANTER_TWEETS, LEADERBOARD } from "../data/mockData";

export default function HomePage() {
  const { isLoggedIn, openLoginModal } = useAuth();
  
  return (
    <div className="pb-12">
      {/* HERO BANNER */}
      <section className="relative w-full bg-[#0B0B0B] border-b border-[#1B1B1B] overflow-hidden">
        {/* Abstract dark red glow background */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#B30000]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#1E6FFF]/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
        
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Main Hero Card */}
            <div className="lg:col-span-2 rounded-2xl bg-[rgba(20,20,25,0.95)] border-l-4 border-[#B30000] border-y border-r border-white/10 shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-white/5 opacity-50 pointer-events-none"></div>
              <div className="p-6 md:p-8 relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <span className="bg-[#B30000] text-white font-black text-[10px] md:text-xs tracking-widest uppercase px-3 py-1 rounded">Matchday 28</span>
                  <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Today 20:00 EAT</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#EF0107] flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-[0_0_20px_rgba(239,1,7,0.4)] border-2 border-white/20">A</div>
                    <span className="font-black text-xl md:text-2xl tracking-wide">ARSENAL</span>
                  </div>
                  
                  <div className="text-center px-4">
                    <div className="text-gray-500 font-black text-2xl md:text-3xl mb-1">VS</div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#034694] flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-[0_0_20px_rgba(3,70,148,0.4)] border-2 border-white/20">C</div>
                    <span className="font-black text-xl md:text-2xl tracking-wide">CHELSEA</span>
                  </div>
                </div>
                
                <div className="mt-10 flex justify-center">
                  <Link 
                    href="/predictions" 
                    className="bg-[#B30000] hover:bg-red-800 text-white font-black uppercase tracking-widest px-8 py-4 rounded-lg shadow-[0_4px_20px_rgba(179,0,0,0.4)] transition-all hover:scale-105"
                  >
                    Predict Score
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Side Mini Cards */}
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-[#1B1B1B] border border-white/5 p-4 shadow-lg flex-1 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#6CABDD]/10 blur-2xl"></div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3 text-center">Upcoming Blockbuster</div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#6CABDD] flex items-center justify-center text-white text-sm font-black">M</div>
                    <span className="font-bold text-sm">MCI</span>
                  </div>
                  <span className="text-xs text-gray-400 font-bold">15:30 EAT</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">LIV</span>
                    <div className="w-8 h-8 rounded-full bg-[#C8102E] flex items-center justify-center text-white text-sm font-black">L</div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl bg-[#1B1B1B] border border-white/5 p-4 shadow-lg flex-1 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#FEBE10]/10 blur-2xl"></div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3 text-center">El Clásico Preview</div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#FEBE10] flex items-center justify-center text-white text-sm font-black text-black">R</div>
                    <span className="font-bold text-sm">RMA</span>
                  </div>
                  <span className="text-xs text-gray-400 font-bold">23:00 EAT</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">BAR</span>
                    <div className="w-8 h-8 rounded-full bg-[#A50044] flex items-center justify-center text-white text-sm font-black">B</div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* LIVE MATCHES */}
      <section className="py-10 border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="uppercase font-black tracking-widest border-l-4 border-[#B30000] pl-3 mb-6 text-xl flex items-center gap-3">
            Live Action
            <span className="bg-[#B30000] w-2 h-2 rounded-full animate-pulse"></span>
          </h2>
          
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {LIVE_MATCHES.map((match) => (
              <div key={match.id} className="snap-start shrink-0 w-[300px] rounded-xl bg-[rgba(20,20,25,0.95)] border-l-[3px] border-[#B30000] border-y border-r border-white/10 shadow-lg p-4 relative overflow-hidden group hover:bg-[#1f1f25] transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{match.league}</span>
                  <span className="bg-[#B30000] text-white font-black text-[10px] uppercase px-2 py-0.5 rounded flex items-center gap-1">
                    LIVE <span className="animate-pulse">{match.minute}</span>
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: match.homeColor }}>{match.homeInitial}</div>
                      <span className="font-bold text-sm truncate max-w-[80px]">{match.home}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: match.awayColor }}>{match.awayInitial}</div>
                      <span className="font-bold text-sm truncate max-w-[80px]">{match.away}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-2xl font-black">{match.homeScore}</span>
                    <span className="text-2xl font-black">{match.awayScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TODAY'S FIXTURES */}
      <section className="py-10 border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <h2 className="uppercase font-black tracking-widest border-l-4 border-[#B30000] pl-3 text-xl">Today's Fixtures</h2>
            <Link href="/matches" className="text-xs font-bold text-[#1E6FFF] hover:text-blue-400 uppercase tracking-wider flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {UPCOMING_FIXTURES.map((fixture) => (
              <div key={fixture.id} className="rounded-xl bg-[#1B1B1B] border border-white/5 p-4 shadow-lg hover:border-white/10 transition-colors">
                <div className="text-center mb-4">
                  <span className="bg-white/5 text-gray-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">{fixture.time}</span>
                </div>
                
                <div className="flex justify-between items-center mb-5">
                  <div className="flex flex-col items-center gap-1 w-[40%]">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white" style={{ backgroundColor: fixture.homeColor }}>{fixture.homeInitial}</div>
                    <span className="font-bold text-xs text-center truncate w-full">{fixture.home}</span>
                  </div>
                  
                  <div className="text-xs font-black text-gray-600">VS</div>
                  
                  <div className="flex flex-col items-center gap-1 w-[40%]">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white" style={{ backgroundColor: fixture.awayColor }}>{fixture.awayInitial}</div>
                    <span className="font-bold text-xs text-center truncate w-full">{fixture.away}</span>
                  </div>
                </div>
                
                <Link href="/predictions" className="block w-full text-center border border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-wider text-xs py-2 rounded transition-colors">
                  Predict
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI PREDICTIONS STRIP */}
      <section className="py-10 bg-[#0B0B0B] border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <h2 className="uppercase font-black tracking-widest border-l-4 border-[#FFD700] pl-3 text-xl flex items-center gap-2">
              <span className="text-[#FFD700]">AI</span> Predictions
            </h2>
            <Link href="/predictions" className="text-xs font-bold text-[#FFD700] hover:text-yellow-400 uppercase tracking-wider flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AI_PREDICTIONS.map((pred) => (
              <div key={pred.id} className="rounded-xl bg-[#1B1B1B] border border-white/5 p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#FFD700] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">AI Intel</div>
                
                <h3 className="font-bold text-sm mb-4 pt-1">{pred.match}</h3>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#0B0B0B] border border-white/10 px-4 py-2 rounded flex-1 text-center">
                    <span className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Most Likely Score</span>
                    <span className="font-black text-xl text-[#FFD700]">{pred.predScore}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-gray-400">Home ({pred.homeProb}%)</span>
                    <span className="text-gray-400">Away ({pred.awayProb}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                    <div className="h-full bg-white transition-all" style={{ width: `${pred.homeProb}%` }}></div>
                    <div className="h-full bg-gray-600 transition-all" style={{ width: `${pred.drawProb}%` }}></div>
                    <div className="h-full bg-[#1E6FFF] transition-all" style={{ width: `${pred.awayProb}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING DEBATES */}
      <section className="py-10 border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <h2 className="uppercase font-black tracking-widest border-l-4 border-[#1E6FFF] pl-3 text-xl">Trending Debates</h2>
            <Link href="/debates" className="hidden md:flex text-xs font-bold text-[#1E6FFF] hover:text-blue-400 uppercase tracking-wider items-center gap-1">
              Join All Debates <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {DEBATES.slice(0, 3).map((debate) => (
              <div key={debate.id} className="rounded-xl bg-[#1B1B1B] border border-white/5 p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-lg mb-4 text-center">{debate.title}</h3>
                  
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-sm text-gray-300">{debate.left}</span>
                    <span className="font-bold text-sm text-gray-300">{debate.right}</span>
                  </div>
                  
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex mb-2">
                    <div className="h-full bg-[#B30000] transition-all" style={{ width: `${debate.leftVotes}%` }}></div>
                    <div className="h-full bg-[#1E6FFF] transition-all" style={{ width: `${debate.rightVotes}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between text-[10px] font-bold text-gray-500">
                    <span>{debate.leftVotes}%</span>
                    <span>{debate.rightVotes}%</span>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">{debate.totalVotes} votes</span>
                  <button 
                    onClick={() => !isLoggedIn ? openLoginModal() : null}
                    className="bg-[#1E6FFF] hover:bg-blue-700 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded transition-colors"
                  >
                    Vote Now
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Link href="/debates" className="mt-6 md:hidden w-full flex justify-center text-xs font-bold text-[#1E6FFF] hover:text-blue-400 uppercase tracking-wider items-center gap-1 bg-white/5 py-3 rounded-lg">
            Join All Debates <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BANTER FEED */}
        <section className="lg:col-span-2">
          <h2 className="uppercase font-black tracking-widest border-l-4 border-[#B30000] pl-3 mb-6 text-xl flex items-center gap-2">
            Mtaani Banter
            <MessageSquare className="w-5 h-5 text-[#B30000]" />
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BANTER_TWEETS.slice(0, 2).map((banter, i) => (
              <div key={i} className="rounded-xl bg-[#1B1B1B] border border-white/5 p-5 shadow-lg relative">
                <div className="absolute top-4 right-4 text-white/10">
                  <MessageSquare className="w-8 h-8 fill-current" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B30000] to-[#1E6FFF] flex items-center justify-center text-white text-xs font-black">AI</div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">BanterBot</span>
                </div>
                <p className="text-sm font-medium leading-relaxed mb-4 relative z-10">"{banter}"</p>
                <div className="flex gap-2">
                  <button className="text-[10px] uppercase font-bold text-gray-400 hover:text-white flex items-center gap-1 border border-white/10 px-3 py-1.5 rounded hover:bg-white/5 transition-colors">
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LEADERBOARD PREVIEW */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="uppercase font-black tracking-widest border-l-4 border-[#FFD700] pl-3 text-xl flex items-center gap-2">
              Top Fans
              <Trophy className="w-5 h-5 text-[#FFD700]" />
            </h2>
          </div>
          
          <div className="rounded-xl bg-[#1B1B1B] border border-white/5 shadow-lg overflow-hidden">
            <div className="divide-y divide-white/5">
              {LEADERBOARD.slice(0, 5).map((player) => (
                <div key={player.rank} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-center font-black text-sm ${player.rank === 1 ? 'text-[#FFD700]' : player.rank === 2 ? 'text-gray-300' : player.rank === 3 ? 'text-[#CD7F32]' : 'text-gray-600'}`}>
                      {player.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#0B0B0B] border border-white/10 flex items-center justify-center text-white text-xs font-black">
                      {player.name.substring(0, 1)}
                    </div>
                    <span className="font-bold text-sm">{player.name} {player.country}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-sm text-[#FFD700]">{player.pts} pts</span>
                    {player.streak > 2 && <span className="text-[9px] uppercase font-bold text-[#B30000]">🔥 {player.streak} streak</span>}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/leaderboard" className="block w-full p-3 text-center text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider bg-white/5 hover:bg-white/10 transition-colors">
              View Full Leaderboard
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
