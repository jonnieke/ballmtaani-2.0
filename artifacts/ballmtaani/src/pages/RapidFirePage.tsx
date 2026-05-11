import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";
import { Loader2, Check, Zap, ArrowDown, ChevronLeft, Flame, Target, Gauge } from "lucide-react";
import { getRandomRapidFireSet, RapidFireDebate } from "../data/mockRapidFire";
import { ShareCard } from "../components/ShareCard";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";

function fallbackFace(label: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=111111&color=ffffff&size=256&bold=true&format=png`;
}

function resolveDebateImage(label: string, explicit?: string) {
  if (explicit && explicit.trim().length > 0) return explicit;
  const curated: Record<string, string> = {
    "Ivan Toney": "https://ui-avatars.com/api/?name=Ivan+Toney&background=1f2937&color=ffffff&size=256&bold=true&format=png",
    "Bruno Fernandes": "https://ui-avatars.com/api/?name=Bruno+Fernandes&background=7c2d12&color=ffffff&size=256&bold=true&format=png",
  };
  if (curated[label]) return curated[label];
  return "";
}

function DebateImage({ label, src }: { label: string; src: string }) {
  const [failed, setFailed] = useState(false);
  const [wikiSrc, setWikiSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const key = `mtaani_rf_img_${label}`;
    const cached = sessionStorage.getItem(key);
    if (cached) {
      setWikiSrc(cached);
      return;
    }

    const aliases: Record<string, string> = {
      "Brumo Fernandes": "Bruno Fernandes",
      "Trent AA": "Trent Alexander-Arnold",
      "Neuer": "Manuel Neuer",
      "Courtois": "Thibaut Courtois",
      "Kante": "N'Golo Kante",
      "Lewa": "Robert Lewandowski",
      "Walker": "Kyle Walker",
      "Rice": "Declan Rice",
      "Ozil": "Mesut Ozil",
    };
    const query = aliases[label] || label;

    const run = async () => {
      try {
        const title = encodeURIComponent(query.replace(/\s+/g, "_"));
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
        if (!res.ok) return;
        const data = await res.json();
        const thumb = data?.thumbnail?.source;
        if (!thumb || cancelled) return;
        setWikiSrc(thumb);
        sessionStorage.setItem(key, thumb);
      } catch {
        // ignore and keep fallback chain
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [label]);

  const finalSrc = failed ? (wikiSrc || fallbackFace(label)) : (src || wikiSrc || fallbackFace(label));
  return (
    <img
      src={finalSrc}
      alt={label}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function RapidFirePage() {
  const { isLoggedIn, awardCoins, username } = useAuth();
  const [, setLocation] = useLocation();
  
  // Initialize with 100 random debates on every visit
  const [debates] = useState<RapidFireDebate[]>(() => getRandomRapidFireSet(100));
  const [localVotes, setLocalVotes] = useState<Record<string, 'left' | 'right'>>({});
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const [voteStreak, setVoteStreak] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [liveVoteMap, setLiveVoteMap] = useState<Record<string, { leftVotes: number; rightVotes: number; totalVotes: number }>>({});
  const [updatedAtMap, setUpdatedAtMap] = useState<Record<string, number>>({});
  const [pulseMap, setPulseMap] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const votedCount = Object.keys(localVotes).length;
  const progress = Math.round((votedCount / debates.length) * 100);

  useEffect(() => {
    if (!supabase || debates.length === 0) return;
    let cancelled = false;

    const syncVotes = async () => {
      const ids = debates.map((d) => d.id);
      const { data, error } = await supabase
        .from("rapid_fire_votes")
        .select("debate_id,left_votes,right_votes,total_votes,updated_at")
        .in("debate_id", ids);

      if (error || !data || cancelled) return;
      const nextVotes: Record<string, { leftVotes: number; rightVotes: number; totalVotes: number }> = {};
      const nextUpdatedAt: Record<string, number> = {};
      for (const row of data as any[]) {
        nextVotes[row.debate_id] = {
          leftVotes: row.left_votes || 0,
          rightVotes: row.right_votes || 0,
          totalVotes: row.total_votes || 0,
        };
        nextUpdatedAt[row.debate_id] = row.updated_at ? new Date(row.updated_at).getTime() : Date.now();
      }
      setLiveVoteMap((prev) => ({ ...prev, ...nextVotes }));
      setUpdatedAtMap((prev) => ({ ...prev, ...nextUpdatedAt }));
    };

    syncVotes();
    const timer = window.setInterval(syncVotes, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [debates]);

  useEffect(() => {
    if (!supabase || debates.length === 0) return;
    const debateIds = new Set(debates.map((d) => d.id));

    const channel = supabase
      .channel("rapid-fire-votes-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rapid_fire_votes" },
        (payload: any) => {
          const row = (payload.new || payload.old) as any;
          if (!row?.debate_id || !debateIds.has(row.debate_id)) return;
          setLiveVoteMap((prev) => ({
            ...prev,
            [row.debate_id]: {
              leftVotes: row.left_votes || 0,
              rightVotes: row.right_votes || 0,
              totalVotes: row.total_votes || 0,
            },
          }));
          setUpdatedAtMap((prev) => ({
            ...prev,
            [row.debate_id]: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
          }));
          triggerPulse(row.debate_id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [debates]);

  const freshnessLabel = (debateId: string) => {
    const ts = updatedAtMap[debateId];
    if (!ts) return "local";
    const age = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (age <= 5) return "updated now";
    if (age < 60) return `updated ${age}s ago`;
    const mins = Math.floor(age / 60);
    return `updated ${mins}m ago`;
  };

  const triggerPulse = (debateId: string) => {
    setPulseMap((prev) => ({ ...prev, [debateId]: true }));
    window.setTimeout(() => {
      setPulseMap((prev) => ({ ...prev, [debateId]: false }));
    }, 650);
  };

  const handleVote = async (debateId: string, side: 'left' | 'right', index: number) => {
    if (!isLoggedIn) {
      sessionStorage.setItem("auth_return_url", window.location.pathname);
      setLocation('/login');
      return;
    }
    if (localVotes[debateId]) return;

    setIsVoting(debateId);
    await new Promise((resolve) => setTimeout(resolve, 220));
    setLocalVotes(prev => ({ ...prev, [debateId]: side }));
    setIsVoting(null);

    setLiveVoteMap((prev) => {
      const current = prev[debateId] || { leftVotes: 0, rightVotes: 0, totalVotes: 0 };
      return {
        ...prev,
        [debateId]: {
          leftVotes: current.leftVotes + (side === "left" ? 1 : 0),
          rightVotes: current.rightVotes + (side === "right" ? 1 : 0),
          totalVotes: current.totalVotes + 1,
        },
      };
    });
    setUpdatedAtMap((prev) => ({ ...prev, [debateId]: Date.now() }));
    triggerPulse(debateId);

    if (supabase) {
      const vote_side = side;
      const { error } = await supabase.rpc("increment_rapid_fire_vote", {
        p_debate_id: debateId,
        p_side: vote_side,
      });

      if (error) {
        const current = liveVoteMap[debateId] || { leftVotes: 0, rightVotes: 0, totalVotes: 0 };
        await supabase.from("rapid_fire_votes").upsert(
          {
            debate_id: debateId,
            left_votes: current.leftVotes + (side === "left" ? 1 : 0),
            right_votes: current.rightVotes + (side === "right" ? 1 : 0),
            total_votes: current.totalVotes + 1,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "debate_id" }
        );
      }
    }

    awardCoins('rapid_fire_vote');
    const newStreak = voteStreak + 1;
    setVoteStreak(newStreak);
    if (newStreak % 5 === 0) {
      awardCoins('rapid_fire_streak_5');
    }
    
    // Show share card at milestones
    if (newStreak > 0 && newStreak % 10 === 0) {
      setTimeout(() => setShowShare(true), 1000);
    }

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
      <div className="absolute top-0 left-0 w-full p-3 md:p-4 z-10 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white bg-black/50 border border-white/15 backdrop-blur-md px-3 py-1.5 hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold text-sm uppercase">Exit</span>
          </Link>
          </div>
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 px-2.5 py-1.5">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-black text-white uppercase tracking-widest text-xs">Rapid Fire</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="border border-white/10 bg-black/40 px-2 py-1.5 text-center">
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black">Streak</p>
            <p className="text-sm text-white font-black inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" />{voteStreak}</p>
          </div>
          <div className="border border-white/10 bg-black/40 px-2 py-1.5 text-center">
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black">Done</p>
            <p className="text-sm text-white font-black inline-flex items-center gap-1"><Target className="w-3.5 h-3.5 text-blue-400" />{votedCount}/{debates.length}</p>
          </div>
          <div className="border border-white/10 bg-black/40 px-2 py-1.5 text-center">
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black">Pace</p>
            <p className="text-sm text-white font-black inline-flex items-center gap-1"><Gauge className="w-3.5 h-3.5 text-green-400" />{progress}%</p>
          </div>
        </div>
        <div className="mt-2 h-1.5 border border-white/10 bg-white/5 overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Snap Scroll Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative pt-[130px] md:pt-[150px]"
        style={{ scrollBehavior: 'smooth' }}
      >
        {debates.map((debate: any, index: number) => {
          const userVote = localVotes[debate.id];
          const fallbackTotalVotes = parseInt(debate.totalVotes.replace(',', '')) || 0;
          const live = liveVoteMap[debate.id];
          const leftVotes = live ? live.leftVotes : (debate.leftVotes || 0);
          const rightVotes = live ? live.rightVotes : (debate.rightVotes || 0);
          const totalVotesRaw = live ? live.totalVotes : fallbackTotalVotes;
          const leftImage = resolveDebateImage(debate.left, debate.leftImage);
          const rightImage = resolveDebateImage(debate.right, debate.rightImage);
          const total = leftVotes + rightVotes || 1;
          const finalLeft = Math.round((leftVotes / total) * 100);
          const finalRight = 100 - finalLeft;

          return (
            <div 
              key={debate.id} 
              id={`debate-${index}`}
              className="w-full min-h-[calc(100dvh-130px)] md:min-h-[calc(100dvh-150px)] snap-start snap-always flex flex-col items-center justify-center relative p-3 md:p-6 bg-[#0B0B0B]"
            >
              {/* Background Glow */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] rounded-full blur-[100px] pointer-events-none opacity-20 transition-colors duration-1000 ${userVote === 'left' ? 'bg-[#1E6FFF]' : userVote === 'right' ? 'bg-primary' : 'bg-white/10'}`} />

              <div className="max-w-lg w-full relative z-10 flex flex-col items-center">
                <div className="mb-3 border border-white/15 bg-black/50 px-2.5 py-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Debate {index + 1}</p>
                </div>
                <h2 className="text-xl md:text-3xl font-black text-center mb-4 md:mb-6 drop-shadow-lg leading-tight">{debate.title}</h2>

                <div className="flex justify-between items-end mb-4 md:mb-6 w-full">
                  <div className="flex flex-col items-center gap-4 w-[45%]">
                    <div className="w-20 h-20 md:w-32 md:h-32 overflow-hidden bg-white/5 border border-white/10 shadow-lg shrink-0">
                      <DebateImage label={debate.left} src={leftImage} />
                    </div>
                    <span className={`font-black text-sm md:text-lg text-center leading-tight drop-shadow-md ${userVote === 'left' ? 'text-white' : 'text-gray-300'}`}>
                      {debate.left}
                    </span>
                  </div>

                  <div className="text-sm font-black text-gray-500 pb-12">VS</div>

                  <div className="flex flex-col items-center gap-4 w-[45%]">
                    <div className="w-20 h-20 md:w-32 md:h-32 overflow-hidden bg-white/5 border border-white/10 shadow-lg shrink-0">
                      <DebateImage label={debate.right} src={rightImage} />
                    </div>
                    <span className={`font-black text-sm md:text-lg text-center leading-tight drop-shadow-md ${userVote === 'right' ? 'text-white' : 'text-gray-300'}`}>
                      {debate.right}
                    </span>
                  </div>
                </div>

                {/* Vote Bars */}
                <div className={`h-10 md:h-11 w-full bg-white/10 overflow-hidden flex relative mb-4 md:mb-6 border border-white/5 shadow-inner backdrop-blur-md transition-all duration-500 ${pulseMap[debate.id] ? "ring-2 ring-primary/60" : ""}`}>
                  <div 
                    className={`h-full flex items-center px-4 transition-all duration-1000 ${userVote === 'left' ? 'bg-[#1E6FFF] shadow-[0_0_20px_rgba(30,111,255,0.6)]' : 'bg-[#1E6FFF]/50'} ${pulseMap[debate.id] ? "brightness-110" : ""}`} 
                    style={{ width: userVote ? `${finalLeft}%` : '50%' }}
                  >
                    {userVote && <span className="font-black text-white text-base drop-shadow-md">{finalLeft}%</span>}
                  </div>
                  <div 
                    className={`h-full flex items-center justify-end px-4 transition-all duration-1000 ${userVote === 'right' ? 'bg-primary shadow-[0_0_20px_rgba(179,0,0,0.6)]' : 'bg-primary/50'} ${pulseMap[debate.id] ? "brightness-110" : ""}`} 
                    style={{ width: userVote ? `${finalRight}%` : '50%' }}
                  >
                    {userVote && <span className="font-black text-white text-base drop-shadow-md">{finalRight}%</span>}
                  </div>
                  
                  {/* Center marker */}
                  {!userVote && <div className="absolute top-0 left-1/2 bottom-0 w-1 bg-black/50 transform -translate-x-1/2"></div>}
                </div>

                <div className="flex gap-2 md:gap-3 w-full">
                  <button 
                    onClick={() => handleVote(debate.id, 'left', index)}
                    disabled={userVote !== undefined || isVoting === debate.id}
                    className={`flex-1 py-3 md:py-5 font-black uppercase tracking-wider md:tracking-widest text-xs md:text-base transition-all flex flex-col items-center justify-center gap-1
                      ${userVote === 'left' ? 'bg-[#1E6FFF] text-white shadow-[0_0_30px_rgba(30,111,255,0.5)] scale-105' : 
                        userVote === 'right' ? 'bg-white/5 text-gray-500 opacity-30 blur-[1px]' : 
                        'bg-white/10 hover:bg-[#1E6FFF]/30 text-white border border-white/20 hover:border-[#1E6FFF]/50 backdrop-blur-md hover:scale-105 shadow-xl'}`}
                  >
                    {isVoting === debate.id ? <Loader2 className="w-5 h-5 animate-spin" /> : userVote === 'left' ? <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Voted Left</span> : (
                      <>
                        <span>Vote Left</span>
                        <span className="text-[10px] text-[#FFD700] tracking-widest">See fan split</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => handleVote(debate.id, 'right', index)}
                    disabled={userVote !== undefined || isVoting === debate.id}
                    className={`flex-1 py-3 md:py-5 font-black uppercase tracking-wider md:tracking-widest text-xs md:text-base transition-all flex flex-col items-center justify-center gap-1
                      ${userVote === 'right' ? 'bg-primary text-white shadow-[0_0_30px_rgba(179,0,0,0.5)] scale-105' : 
                        userVote === 'left' ? 'bg-white/5 text-gray-500 opacity-30 blur-[1px]' : 
                        'bg-white/10 hover:bg-primary/30 text-white border border-white/20 hover:border-primary/50 backdrop-blur-md hover:scale-105 shadow-xl'}`}
                  >
                    {isVoting === debate.id ? <Loader2 className="w-5 h-5 animate-spin" /> : userVote === 'right' ? <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Voted Right</span> : (
                      <>
                        <span>Vote Right</span>
                        <span className="text-[10px] text-[#FFD700] tracking-widest">See fan split</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-6 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {totalVotesRaw} Total Votes
                </div>
                <div className="mt-1 text-center text-[9px] font-black text-gray-600 uppercase tracking-widest">
                  {freshnessLabel(debate.id)}
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

      {showShare && (
        <ShareCard
          achievement={`Rapid Fire Streak: ${voteStreak} Votes!`}
          subtitle="I just ran through a stack of football debates."
          coinsEarned={voteStreak * 10 + Math.floor(voteStreak / 5) * 25}
          emoji="RF"
          shareUrl={`https://ballmtaani20.vercel.app/?ref=${username || 'fan'}`}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
