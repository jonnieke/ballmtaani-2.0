import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useDebates } from "../hooks/useData";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";
import { MessageSquarePlus, Check, Loader2, ShieldAlert, Share2, Facebook, Twitter, MessageCircle } from "lucide-react";
import AdBanner from "../components/AdBanner";
import { SkeletonDebate } from "../components/Skeletons";
import { UserBadge } from "../components/UserBadge";

export default function DebatesPage() {
  const { isLoggedIn, updateCoins } = useAuth();
  const [, setLocation] = useLocation();
  const { data: debates = [], refetch, isLoading } = useDebates();
  
  // Track voted states locally for immediate UI feedback: debateId -> 'left' | 'right'
  const [localVotes, setLocalVotes] = useState<Record<string, 'left' | 'right'>>({});
  const [isVoting, setIsVoting] = useState<string | null>(null);
  
  // Track new debate input
  const [newDebate, setNewDebate] = useState("");

  // Fan Vote Raids state
  const [raidPrompt, setRaidPrompt] = useState<string | null>(null);
  const [showShareLinks, setShowShareLinks] = useState<string | null>(null);

  const handleVote = async (debateId: string, side: 'left' | 'right') => {
    if (!isLoggedIn) {
      setLocation('/login');
      return;
    }

    if (localVotes[debateId]) return;

    setIsVoting(debateId);
    
    // Optimistic update
    setLocalVotes(prev => ({ ...prev, [debateId]: side }));

    // Update Supabase
    const field = side === 'left' ? 'left_votes' : 'right_votes';
    const { error } = await supabase.rpc('increment_vote', { 
      debate_id: debateId, 
      vote_field: field 
    });

    // Fallback if RPC doesn't exist yet (simpler update)
    // Fake logic for UI since RPC might fail in mock environments
    if (error) {
      const debate = debates.find((d: any) => d.id === debateId);
      if (debate) {
        await supabase.from("debates").update({
          [side === 'left' ? 'left_votes' : 'right_votes']: (side === 'left' ? debate.leftVotes : debate.rightVotes) + 1,
          total_votes: (parseInt(debate.totalVotes.replace(',', '')) || 0) + 1
        }).eq("id", debateId);
      }
    }

    // Check if the user's chosen side is losing for Fan Vote Raid
    const currDebate = debates.find((d: any) => d.id === debateId);
    if (currDebate) {
        const lVotes = side === 'left' ? currDebate.leftVotes + 1 : currDebate.leftVotes;
        const rVotes = side === 'right' ? currDebate.rightVotes + 1 : currDebate.rightVotes;
        if ((side === 'left' && lVotes < rVotes) || (side === 'right' && rVotes < lVotes)) {
            setRaidPrompt(debateId);
        }
    }

    setIsVoting(null);
    updateCoins(10); // Award Mtaani Coins for debating
    refetch(); // Refresh data from server
  };

  const handleStartDebate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setLocation('/login');
      return;
    }
    // Mock submit for now or connect to Supabase
    setNewDebate("");
    alert("Debate submitted for review!");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-2">
          FAN <span className="text-accent">DEBATE</span> ZONE
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-wider">Vote. Argue. Settle It.</p>
      </div>

      {/* Start Debate Form */}
      <div className="max-w-2xl mx-auto bg-[#1B1B1B] rounded-xl border border-white/5 p-6 shadow-xl mb-12">
        <h3 className="text-xl font-black uppercase tracking-widest mb-2 flex items-center gap-2">
          <MessageSquarePlus className="w-5 h-5 text-accent" />
          Start a Debate
        </h3>
        <p className="text-gray-400 text-sm mb-6">Got a hot take? Drop it below and let the community decide.</p>
        
        <form onSubmit={handleStartDebate}>
          <textarea 
            value={newDebate}
            onChange={(e) => setNewDebate(e.target.value)}
            className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-accent transition-colors resize-none mb-4"
            rows={3}
            placeholder="e.g. Is prime Yaya Touré better than prime Kevin De Bruyne?"
            required
          ></textarea>
          <button 
            type="submit"
            className="bg-accent hover:bg-blue-700 text-white font-black uppercase tracking-widest px-6 py-3 rounded-lg transition-colors shadow-lg"
          >
            Submit for Review
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <SkeletonDebate key={i} />)
        ) : debates.map((debate: any, index: number) => {
          const userVote = localVotes[debate.id];
          
          const totalVotesRaw = parseInt(debate.totalVotes.replace(',', '')) || 0;
          const leftVotes = debate.leftVotes || 0;
          const rightVotes = debate.rightVotes || 0;

          const total = leftVotes + rightVotes || 1;
          const finalLeft = Math.round((leftVotes / total) * 100);
          const finalRight = 100 - finalLeft;

          return (
            <div key={debate.id} className="contents">
              <div className="bg-[#1B1B1B] rounded-xl border border-white/5 p-6 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-6 px-2">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-black">{debate.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">By {debate.author}</span>
                      <UserBadge interactions={debate.interactionCount || 0} showLabel={false} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-4 px-2">
                  <div className="flex flex-col items-center gap-3 w-[45%]">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 border border-white/10 shadow-lg shrink-0">
                      {debate.leftImage ? (
                        <img src={debate.leftImage} alt={debate.left} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-accent text-2xl bg-[#1B1B1B]">{debate.left.charAt(0)}</div>
                      )}
                    </div>
                    <span className={`font-bold text-sm sm:text-base text-center leading-tight ${userVote === 'left' ? 'text-white' : 'text-gray-300'}`}>
                      {debate.left}
                    </span>
                  </div>

                  <div className="text-[12px] font-black text-gray-600 pb-10">VS</div>

                  <div className="flex flex-col items-center gap-3 w-[45%]">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 border border-white/10 shadow-lg shrink-0">
                      {debate.rightImage ? (
                        <img src={debate.rightImage} alt={debate.right} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-primary text-2xl bg-[#1B1B1B]">{debate.right.charAt(0)}</div>
                      )}
                    </div>
                    <span className={`font-bold text-sm sm:text-base text-center leading-tight ${userVote === 'right' ? 'text-white' : 'text-gray-300'}`}>
                      {debate.right}
                    </span>
                  </div>
                </div>
                
                {/* Vote Bars */}
                <div className="h-10 w-full bg-white/5 rounded-lg overflow-hidden flex relative mb-6 border border-white/10 shadow-inner">
                  <div 
                    className={`h-full flex items-center px-3 transition-all duration-1000 ${userVote === 'left' ? 'bg-accent shadow-[0_0_15px_rgba(30,111,255,0.5)]' : 'bg-accent/80'}`} 
                    style={{ width: `${finalLeft}%` }}
                  >
                    <span className="font-black text-white text-sm">{finalLeft}%</span>
                  </div>
                  <div 
                    className={`h-full flex items-center justify-end px-3 transition-all duration-1000 ${userVote === 'right' ? 'bg-primary shadow-[0_0_15px_rgba(179,0,0,0.5)]' : 'bg-primary/80'}`} 
                    style={{ width: `${finalRight}%` }}
                  >
                    <span className="font-black text-white text-sm">{finalRight}%</span>
                  </div>
                  
                  {/* Center marker */}
                  <div className="absolute top-0 left-1/2 bottom-0 w-px bg-white/30 transform -translate-x-1/2"></div>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleVote(debate.id, 'left')}
                    disabled={userVote !== undefined || isVoting === debate.id}
                    className={`flex-1 py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all flex flex-col items-center justify-center gap-1
                      ${userVote === 'left' ? 'bg-accent text-white shadow-[0_0_15px_rgba(30,111,255,0.4)]' : 
                        userVote === 'right' ? 'bg-white/5 text-gray-500 opacity-50' : 
                        'bg-white/5 hover:bg-accent/20 text-gray-300 border border-white/10 hover:border-accent/50'}`}
                  >
                    {isVoting === debate.id ? <Loader2 className="w-4 h-4 animate-spin" /> : userVote === 'left' ? <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Voted</span> : (
                      <>
                        <span>Vote Left</span>
                        <span className="text-[9px] text-[#FFD700] tracking-widest">+10 Coins</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => handleVote(debate.id, 'right')}
                    disabled={userVote !== undefined || isVoting === debate.id}
                    className={`flex-1 py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all flex flex-col items-center justify-center gap-1
                      ${userVote === 'right' ? 'bg-primary text-white shadow-[0_0_15px_rgba(179,0,0,0.4)]' : 
                        userVote === 'left' ? 'bg-white/5 text-gray-500 opacity-50' : 
                        'bg-white/5 hover:bg-primary/20 text-gray-300 border border-white/10 hover:border-primary/50'}`}
                  >
                    {isVoting === debate.id ? <Loader2 className="w-4 h-4 animate-spin" /> : userVote === 'right' ? <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Voted</span> : (
                      <>
                        <span>Vote Right</span>
                        <span className="text-[9px] text-[#FFD700] tracking-widest">+10 Coins</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-6 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {totalVotesRaw} Total Votes
                </div>

                {/* FAN VOTE RAIDS UI */}
                {raidPrompt === debate.id && (
                  <div className="mt-6 border-t border-white/5 pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {!showShareLinks || showShareLinks !== debate.id ? (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-5 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-red-500/10 blur-xl group-hover:bg-red-500/20 transition-colors pointer-events-none"></div>
                        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-3 animate-pulse relative z-10" />
                        <h4 className="text-red-500 font-black uppercase tracking-widest text-sm mb-2 relative z-10">Your Side is Losing!</h4>
                        <p className="text-gray-300 text-xs mb-5 relative z-10">Call your fans to vote and turn the tide of this debate.</p>
                        <button 
                          onClick={() => setShowShareLinks(debate.id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-3 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all relative z-10"
                        >
                          Defend Your Side
                        </button>
                      </div>
                    ) : (
                      <div className="bg-[#111] border border-[#FFD700]/30 rounded-xl p-5 text-center shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                        <Share2 className="w-6 h-6 text-[#FFD700] mx-auto mb-2" />
                        <h4 className="text-[#FFD700] font-black uppercase tracking-widest text-sm mb-4">Recruit Backup</h4>
                        
                        <div className="flex bg-black/50 border border-white/10 rounded-lg p-2 mb-4 items-center justify-between">
                          <span className="text-gray-400 text-xs truncate max-w-[200px] select-all">
                            ballmtaani.com/debates?id={debate.id}&ref=user
                          </span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`https://ballmtaani.com/debates?id=${debate.id}&ref=user`);
                              alert('Link copied!');
                            }}
                            className="text-accent text-xs font-bold uppercase hover:text-blue-400"
                          >
                            Copy
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                          <button className="bg-[#25D366]/20 hover:bg-[#25D366]/40 text-[#25D366] p-3 rounded-lg flex justify-center transition-colors">
                            <MessageCircle className="w-5 h-5" />
                          </button>
                          <button className="bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/40 text-[#1DA1F2] p-3 rounded-lg flex justify-center transition-colors">
                            <Twitter className="w-5 h-5" />
                          </button>
                          <button className="bg-[#1877F2]/20 hover:bg-[#1877F2]/40 text-[#1877F2] p-3 rounded-lg flex justify-center transition-colors">
                            <Facebook className="w-5 h-5" />
                          </button>
                          <button className="bg-[#0088cc]/20 hover:bg-[#0088cc]/40 text-[#0088cc] p-3 rounded-lg flex justify-center transition-colors">
                            <Share2 className="w-5 h-5" />
                          </button>
                        </div>
                        <button 
                          onClick={() => setRaidPrompt(null)}
                          className="mt-4 text-[10px] text-gray-500 hover:text-white uppercase font-bold tracking-widest"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* AdBanner interspersed after every 2 debates */}
              {(index + 1) % 2 === 0 && index !== debates.length - 1 && (
                <div className="col-span-full py-4">
                  <AdBanner label="BallMtaani Debate Sponsor" />
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
