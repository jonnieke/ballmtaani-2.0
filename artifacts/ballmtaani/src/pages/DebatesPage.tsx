import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useDebates } from "../hooks/useData";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";
import { MessageSquarePlus, Check, Loader2, ShieldAlert, Share2, Facebook, Twitter, MessageCircle } from "lucide-react";
import AdBanner from "../components/AdBanner";
import { SkeletonDebate } from "../components/Skeletons";
import { UserBadge } from "../components/UserBadge";
import SEO from "../components/SEO";
import { AD_STRATEGY, shouldShowFeedAd } from "../lib/adStrategy";

export default function DebatesPage() {
  const { isLoggedIn, awardCoins } = useAuth();
  const [, setLocation] = useLocation();
  const { data: debates = [], refetch, isLoading } = useDebates();
  
  // Track voted states locally for immediate UI feedback: debateId -> 'left' | 'right'
  const [localVotes, setLocalVotes] = useState<Record<string, 'left' | 'right'>>({});
  const [isVoting, setIsVoting] = useState<string | null>(null);
  
  // Track new debate input
  const [newDebate, setNewDebate] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"hot" | "new" | "close">("hot");
  const [unvotedOnly, setUnvotedOnly] = useState(false);

  // Group-chat backup prompt state
  const [raidPrompt, setRaidPrompt] = useState<string | null>(null);
  const [showShareLinks, setShowShareLinks] = useState<string | null>(null);

  const visibleDebates = useMemo(() => {
    const searched = debates.filter((d: any) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        String(d.title || "").toLowerCase().includes(q) ||
        String(d.left || "").toLowerCase().includes(q) ||
        String(d.right || "").toLowerCase().includes(q)
      );
    });
    const filtered = searched.filter((d: any) => (unvotedOnly ? !localVotes[d.id] : true));

    return [...filtered].sort((a: any, b: any) => {
      const aTotal = parseInt(String(a.totalVotes || "0").replace(",", "")) || 0;
      const bTotal = parseInt(String(b.totalVotes || "0").replace(",", "")) || 0;
      const aGap = Math.abs((a.leftVotes || 0) - (a.rightVotes || 0));
      const bGap = Math.abs((b.leftVotes || 0) - (b.rightVotes || 0));
      if (sortBy === "new") return String(b.id).localeCompare(String(a.id));
      if (sortBy === "close") return aGap - bGap;
      return bTotal - aTotal;
    });
  }, [debates, search, sortBy, unvotedOnly, localVotes]);

  const debateInsights = useMemo(() => {
    if (!visibleDebates.length) {
      return { hotNow: "None", closestFight: "None", myVotes: 0 };
    }
    const hot = [...visibleDebates].sort((a: any, b: any) => {
      const aTotal = parseInt(String(a.totalVotes || "0").replace(",", "")) || 0;
      const bTotal = parseInt(String(b.totalVotes || "0").replace(",", "")) || 0;
      return bTotal - aTotal;
    })[0];
    const close = [...visibleDebates].sort((a: any, b: any) => {
      const aGap = Math.abs((a.leftVotes || 0) - (a.rightVotes || 0));
      const bGap = Math.abs((b.leftVotes || 0) - (b.rightVotes || 0));
      return aGap - bGap;
    })[0];
    return {
      hotNow: hot?.title || "None",
      closestFight: close?.title || "None",
      myVotes: Object.keys(localVotes).length,
    };
  }, [visibleDebates, localVotes]);

  const handleVote = async (debateId: string, side: 'left' | 'right') => {
    if (!isLoggedIn) {
      sessionStorage.setItem("auth_return_url", window.location.pathname);
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

    // Prompt sharing when a user's side needs backup.
    const currDebate = debates.find((d: any) => d.id === debateId);
    if (currDebate) {
        const lVotes = side === 'left' ? currDebate.leftVotes + 1 : currDebate.leftVotes;
        const rVotes = side === 'right' ? currDebate.rightVotes + 1 : currDebate.rightVotes;
        if ((side === 'left' && lVotes < rVotes) || (side === 'right' && rVotes < lVotes)) {
            setRaidPrompt(debateId);
        }
    }

    setIsVoting(null);
    awardCoins('debate_vote');
    refetch(); // Refresh data from server
  };

  const handleStartDebate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      sessionStorage.setItem("auth_return_url", window.location.pathname);
      setLocation('/login');
      return;
    }
    // Mock submit for now or connect to Supabase
    setNewDebate("");
    alert("Debate submitted for review!");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <SEO 
        title="Fan Debates & Hot Takes | BallMtaani"
        description="Vote on football debates, bring backup from your group chat, and keep receipts with Kenyan fans."
      />
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-2">
          FAN <span className="text-accent">DEBATE</span> ZONE
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-wider">Vote. Argue. Settle It.</p>
      </div>

      <div className="mb-8 border border-white/10 bg-[#111] p-4">
        <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search debates (Messi, Arsenal, VAR...)"
            className="w-full md:max-w-md bg-black border border-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-accent"
          />
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <button onClick={() => setSortBy("hot")} className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${sortBy === "hot" ? "bg-accent/20 border-accent text-white" : "bg-black border-white/10 text-gray-400"}`}>Hot</button>
            <button onClick={() => setSortBy("close")} className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${sortBy === "close" ? "bg-accent/20 border-accent text-white" : "bg-black border-white/10 text-gray-400"}`}>Too Close</button>
            <button onClick={() => setSortBy("new")} className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${sortBy === "new" ? "bg-accent/20 border-accent text-white" : "bg-black border-white/10 text-gray-400"}`}>Latest</button>
            <button onClick={() => setUnvotedOnly((v) => !v)} className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${unvotedOnly ? "bg-primary/20 border-primary text-white" : "bg-black border-white/10 text-gray-400"}`}>Unvoted Only</button>
            <button onClick={() => { setSearch(""); setSortBy("hot"); setUnvotedOnly(false); }} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest border bg-black border-white/10 text-gray-400">
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="border border-white/10 bg-[#111] p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Hot Now</p>
          <p className="text-xs font-black uppercase tracking-widest text-white truncate">{debateInsights.hotNow}</p>
        </div>
        <div className="border border-white/10 bg-[#111] p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Closest Fight</p>
          <p className="text-xs font-black uppercase tracking-widest text-white truncate">{debateInsights.closestFight}</p>
        </div>
        <div className="border border-white/10 bg-[#111] p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">My Votes</p>
          <p className="text-xs font-black uppercase tracking-widest text-accent">{debateInsights.myVotes}</p>
        </div>
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
            placeholder="e.g. Is prime Yaya Toure better than prime Kevin De Bruyne?"
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

      <div className="max-w-6xl mx-auto mb-10 w-full">
        <AdBanner label="Debate Sponsor" type="horizontal" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <SkeletonDebate key={i} />)
        ) : visibleDebates.map((debate: any, index: number) => {
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
                        <span className="text-[9px] text-[#FFD700] tracking-widest">Counts for status</span>
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
                        <span className="text-[9px] text-[#FFD700] tracking-widest">Counts for status</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-6 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {totalVotesRaw} Total Votes
                </div>

                {/* Group-chat backup UI */}
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
              
              {/* AdBanner interspersed with capped density */}
              {shouldShowFeedAd(index, AD_STRATEGY.debatesFeedInterval, visibleDebates.length) && (
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
