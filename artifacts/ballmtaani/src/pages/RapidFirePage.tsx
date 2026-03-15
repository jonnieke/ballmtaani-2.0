import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useDebates } from "../hooks/useData";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";
import { Loader2, Check, Zap, ArrowDown, ChevronLeft } from "lucide-react";
import { getRandomRapidFireSet, RapidFireDebate } from "../data/mockRapidFire";
import { UserBadge } from "../components/UserBadge";
import { Link } from "wouter";

export default function RapidFirePage() {
  const { isLoggedIn, updateCoins } = useAuth();
  const [, setLocation] = useLocation();
  
  // Initialize with 100 random debates on every visit
  const [debates] = useState<RapidFireDebate[]>(() => getRandomRapidFireSet(100));
  const [localVotes, setLocalVotes] = useState<Record<string, 'left' | 'right'>>({});
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleVote = async (debateId: string, side: 'left' | 'right', index: number) => {
    if (!isLoggedIn) {
      sessionStorage.setItem("auth_return_url", window.location.pathname);
      setLocation('/login');
      return;
    }
    if (localVotes[debateId]) return;

    setIsVoting(debateId);
    setLocalVotes(prev => ({ ...prev, [debateId]: side }));

    // For Rapid Fire arcade, we use the local state and award coins.
    // We don't necessarily sync all 100+ mock debates to a global DB table.
    
    setIsVoting(null);
    updateCoins(5); // +5 Coins for rapid fire

    // Auto-scroll to next after delay
    setTimeout(() => {
      if (containerRef.current) {
        const nextHeader = document.getElementById(`debate-${index + 1}`);
        if (nextHeader) {
          nextHeader.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 1500);
  };

  // Rapid Fire is now always ready with mock data
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-primary">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black fixed inset-0 z-50 flex flex-col">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold text-sm uppercase">Exit</span>
          </Link>
        </div>
        <div className="text-center w-full absolute top-6 left-0 pointer-events-none">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/50 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(179,0,0,0.5)]">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-black text-white uppercase tracking-widest text-sm">Rapid Fire</span>
          </div>
        </div>
      </div>

      {/* Snap Scroll Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative"
        style={{ scrollBehavior: 'smooth' }}
      >
        {debates.map((debate: any, index: number) => {
          const userVote = localVotes[debate.id];
          const totalVotesRaw = parseInt(debate.totalVotes.replace(',', '')) || 0;
          const leftVotes = debate.leftVotes || 0;
          const rightVotes = debate.rightVotes || 0;
          const total = leftVotes + rightVotes || 1;
          const finalLeft = Math.round((leftVotes / total) * 100);
          const finalRight = 100 - finalLeft;

          return (
            <div 
              key={debate.id} 
              id={`debate-${index}`}
              className="w-full h-full snap-start snap-always flex flex-col items-center justify-center relative p-6 bg-[#0B0B0B]"
            >
              {/* Background Glow */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] rounded-full blur-[100px] pointer-events-none opacity-20 transition-colors duration-1000 ${userVote === 'left' ? 'bg-[#1E6FFF]' : userVote === 'right' ? 'bg-primary' : 'bg-white/10'}`} />

              <div className="max-w-md w-full relative z-10 flex flex-col items-center">
                <h2 className="text-2xl md:text-3xl font-black text-center mb-8 drop-shadow-lg">{debate.title}</h2>

                <div className="flex justify-between items-end mb-8 w-full">
                  <div className="flex flex-col items-center gap-4 w-[45%]">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white/5 border border-white/10 shadow-lg shrink-0">
                      {debate.leftImage ? (
                        <img src={debate.leftImage} alt={debate.left} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-[#1E6FFF] text-4xl bg-[#1B1B1B]">{debate.left.charAt(0)}</div>
                      )}
                    </div>
                    <span className={`font-black text-lg text-center leading-tight drop-shadow-md ${userVote === 'left' ? 'text-white' : 'text-gray-300'}`}>
                      {debate.left}
                    </span>
                  </div>

                  <div className="text-sm font-black text-gray-500 pb-12">VS</div>

                  <div className="flex flex-col items-center gap-4 w-[45%]">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white/5 border border-white/10 shadow-lg shrink-0">
                      {debate.rightImage ? (
                        <img src={debate.rightImage} alt={debate.right} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-primary text-4xl bg-[#1B1B1B]">{debate.right.charAt(0)}</div>
                      )}
                    </div>
                    <span className={`font-black text-lg text-center leading-tight drop-shadow-md ${userVote === 'right' ? 'text-white' : 'text-gray-300'}`}>
                      {debate.right}
                    </span>
                  </div>
                </div>

                {/* Vote Bars */}
                <div className="h-12 w-full bg-white/10 rounded-xl overflow-hidden flex relative mb-8 border border-white/5 shadow-inner backdrop-blur-md">
                  <div 
                    className={`h-full flex items-center px-4 transition-all duration-1000 ${userVote === 'left' ? 'bg-[#1E6FFF] shadow-[0_0_20px_rgba(30,111,255,0.6)]' : 'bg-[#1E6FFF]/50'}`} 
                    style={{ width: userVote ? `${finalLeft}%` : '50%' }}
                  >
                    {userVote && <span className="font-black text-white text-base drop-shadow-md">{finalLeft}%</span>}
                  </div>
                  <div 
                    className={`h-full flex items-center justify-end px-4 transition-all duration-1000 ${userVote === 'right' ? 'bg-primary shadow-[0_0_20px_rgba(179,0,0,0.6)]' : 'bg-primary/50'}`} 
                    style={{ width: userVote ? `${finalRight}%` : '50%' }}
                  >
                    {userVote && <span className="font-black text-white text-base drop-shadow-md">{finalRight}%</span>}
                  </div>
                  
                  {/* Center marker */}
                  {!userVote && <div className="absolute top-0 left-1/2 bottom-0 w-1 bg-black/50 transform -translate-x-1/2"></div>}
                </div>

                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => handleVote(debate.id, 'left', index)}
                    disabled={userVote !== undefined || isVoting === debate.id}
                    className={`flex-1 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-sm md:text-base transition-all flex flex-col items-center justify-center gap-1
                      ${userVote === 'left' ? 'bg-[#1E6FFF] text-white shadow-[0_0_30px_rgba(30,111,255,0.5)] scale-105' : 
                        userVote === 'right' ? 'bg-white/5 text-gray-500 opacity-30 blur-[1px]' : 
                        'bg-white/10 hover:bg-[#1E6FFF]/30 text-white border border-white/20 hover:border-[#1E6FFF]/50 backdrop-blur-md hover:scale-105 shadow-xl'}`}
                  >
                    {isVoting === debate.id ? <Loader2 className="w-5 h-5 animate-spin" /> : userVote === 'left' ? <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Voted Left</span> : (
                      <>
                        <span>Vote Left</span>
                        <span className="text-[10px] text-[#FFD700] tracking-widest">+5 Coins</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => handleVote(debate.id, 'right', index)}
                    disabled={userVote !== undefined || isVoting === debate.id}
                    className={`flex-1 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-sm md:text-base transition-all flex flex-col items-center justify-center gap-1
                      ${userVote === 'right' ? 'bg-primary text-white shadow-[0_0_30px_rgba(179,0,0,0.5)] scale-105' : 
                        userVote === 'left' ? 'bg-white/5 text-gray-500 opacity-30 blur-[1px]' : 
                        'bg-white/10 hover:bg-primary/30 text-white border border-white/20 hover:border-primary/50 backdrop-blur-md hover:scale-105 shadow-xl'}`}
                  >
                    {isVoting === debate.id ? <Loader2 className="w-5 h-5 animate-spin" /> : userVote === 'right' ? <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Voted Right</span> : (
                      <>
                        <span>Vote Right</span>
                        <span className="text-[10px] text-[#FFD700] tracking-widest">+5 Coins</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-8 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {totalVotesRaw} Total Votes
                </div>

                {index < debates.length - 1 && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-gray-500 animate-bounce">
                    <span className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Swipe Down</span>
                    <ArrowDown className="w-5 h-5 opacity-50" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
