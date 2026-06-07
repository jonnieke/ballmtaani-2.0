import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";
import { Loader2, Check, Zap, ChevronLeft } from "lucide-react";
import { getRandomRapidFireSet, RapidFireDebate } from "../data/mockRapidFire";
import { ShareCard } from "../components/ShareCard";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";

// ─── Image helpers (unchanged) ────────────────────────────────────────────────
function fallbackFace(label: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=111111&color=ffffff&size=256&bold=true&format=png`;
}
function resolveDebateImage(label: string, explicit?: string) {
  if (explicit && explicit.trim().length > 0) return explicit;
  const curated: Record<string, string> = {
    "Ivan Toney": "https://ui-avatars.com/api/?name=Ivan+Toney&background=1f2937&color=ffffff&size=256&bold=true&format=png",
    "Bruno Fernandes": "https://ui-avatars.com/api/?name=Bruno+Fernandes&background=7c2d12&color=ffffff&size=256&bold=true&format=png",
  };
  return curated[label] || "";
}

function DebateImage({ label, src }: { label: string; src: string }) {
  const [failed, setFailed] = useState(false);
  const [wikiSrc, setWikiSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const key = `mtaani_rf_img_${label}`;
    const cached = sessionStorage.getItem(key);
    if (cached) { setWikiSrc(cached); return; }
    const aliases: Record<string, string> = {
      "Brumo Fernandes": "Bruno Fernandes", "Trent AA": "Trent Alexander-Arnold",
      "Neuer": "Manuel Neuer", "Courtois": "Thibaut Courtois",
      "Kante": "N'Golo Kante", "Lewa": "Robert Lewandowski",
      "Walker": "Kyle Walker", "Rice": "Declan Rice", "Ozil": "Mesut Ozil",
    };
    const query = aliases[label] || label;
    const run = async () => {
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/\s+/g, "_"))}`);
        if (!res.ok) return;
        const data = await res.json();
        const thumb = data?.thumbnail?.source;
        if (!thumb || cancelled) return;
        setWikiSrc(thumb);
        sessionStorage.setItem(key, thumb);
      } catch { /* ignore */ }
    };
    run();
    return () => { cancelled = true; };
  }, [label]);
  const finalSrc = failed ? (wikiSrc || fallbackFace(label)) : (src || wikiSrc || fallbackFace(label));
  return <img src={finalSrc} alt={label} className="w-full h-full object-cover" loading="lazy" onError={() => setFailed(true)} />;
}

// ─── Floating coin popup ───────────────────────────────────────────────────────
function CoinPop({ id, side }: { id: string; side: "left" | "right" }) {
  return (
    <div
      key={id}
      className={`pointer-events-none absolute bottom-28 z-50 text-[#FFD700] font-black text-xl tracking-widest animate-coin-pop ${side === "left" ? "left-8" : "right-8"}`}
    >
      +10 MTC
    </div>
  );
}

// ─── Combo announcement ────────────────────────────────────────────────────────
function ComboFlash({ streak }: { streak: number }) {
  if (streak === 0 || streak % 5 !== 0) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="px-8 py-4 border-4 border-[#FFD700] bg-black/90 text-center animate-combo-flash">
        <div className="text-[#FFD700] font-black text-4xl tracking-[0.3em] uppercase">Combo!</div>
        <div className="text-white font-black text-2xl tracking-widest mt-1">x{streak} 🔥</div>
      </div>
    </div>
  );
}

export default function RapidFirePage() {
  const { isLoggedIn, awardCoins, username } = useAuth();
  const [, setLocation] = useLocation();

  const [debates] = useState<RapidFireDebate[]>(() => getRandomRapidFireSet(100));
  const [localVotes, setLocalVotes] = useState<Record<string, "left" | "right">>({});
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const [voteStreak, setVoteStreak] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [showCombo, setShowCombo] = useState(0);
  const [coinPops, setCoinPops] = useState<{ id: string; side: "left" | "right" }[]>([]);
  const [liveVoteMap, setLiveVoteMap] = useState<Record<string, { leftVotes: number; rightVotes: number; totalVotes: number }>>({});
  const [updatedAtMap, setUpdatedAtMap] = useState<Record<string, number>>({});
  const [pulseMap, setPulseMap] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const votedCount = Object.keys(localVotes).length;
  const progress = Math.round((votedCount / debates.length) * 100);
  const score = votedCount * 10 + Math.floor(voteStreak / 5) * 25;

  // ── Supabase sync (logic unchanged) ──────────────────────────────────────────
  useEffect(() => {
    if (!supabase || debates.length === 0) return;
    let cancelled = false;
    const syncVotes = async () => {
      const ids = debates.map((d) => d.id);
      const { data, error } = await supabase.from("rapid_fire_votes").select("debate_id,left_votes,right_votes,total_votes,updated_at").in("debate_id", ids);
      if (error || !data || cancelled) return;
      const nextVotes: Record<string, { leftVotes: number; rightVotes: number; totalVotes: number }> = {};
      const nextUpdatedAt: Record<string, number> = {};
      for (const row of data as any[]) {
        nextVotes[row.debate_id] = { leftVotes: row.left_votes || 0, rightVotes: row.right_votes || 0, totalVotes: row.total_votes || 0 };
        nextUpdatedAt[row.debate_id] = row.updated_at ? new Date(row.updated_at).getTime() : Date.now();
      }
      setLiveVoteMap((prev) => ({ ...prev, ...nextVotes }));
      setUpdatedAtMap((prev) => ({ ...prev, ...nextUpdatedAt }));
    };
    syncVotes();
    const timer = window.setInterval(syncVotes, 30000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [debates]);

  useEffect(() => {
    if (!supabase || debates.length === 0) return;
    const debateIds = new Set(debates.map((d) => d.id));
    const channel = supabase.channel("rapid-fire-votes-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "rapid_fire_votes" }, (payload: any) => {
        const row = (payload.new || payload.old) as any;
        if (!row?.debate_id || !debateIds.has(row.debate_id)) return;
        setLiveVoteMap((prev) => ({ ...prev, [row.debate_id]: { leftVotes: row.left_votes || 0, rightVotes: row.right_votes || 0, totalVotes: row.total_votes || 0 } }));
        setUpdatedAtMap((prev) => ({ ...prev, [row.debate_id]: row.updated_at ? new Date(row.updated_at).getTime() : Date.now() }));
        triggerPulse(row.debate_id);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [debates]);

  const triggerPulse = (debateId: string) => {
    setPulseMap((prev) => ({ ...prev, [debateId]: true }));
    window.setTimeout(() => setPulseMap((prev) => ({ ...prev, [debateId]: false })), 650);
  };

  const handleVote = async (debateId: string, side: "left" | "right", index: number) => {
    if (!isLoggedIn) {
      sessionStorage.setItem("auth_return_url", window.location.pathname);
      setLocation("/login");
      return;
    }
    if (localVotes[debateId]) return;
    setIsVoting(debateId);
    await new Promise((resolve) => setTimeout(resolve, 180));
    setLocalVotes((prev) => ({ ...prev, [debateId]: side }));
    setIsVoting(null);
    setLiveVoteMap((prev) => {
      const current = prev[debateId] || { leftVotes: 0, rightVotes: 0, totalVotes: 0 };
      return { ...prev, [debateId]: { leftVotes: current.leftVotes + (side === "left" ? 1 : 0), rightVotes: current.rightVotes + (side === "right" ? 1 : 0), totalVotes: current.totalVotes + 1 } };
    });
    setUpdatedAtMap((prev) => ({ ...prev, [debateId]: Date.now() }));
    triggerPulse(debateId);

    // Coin pop animation
    const popId = `${debateId}-${Date.now()}`;
    setCoinPops((prev) => [...prev.slice(-3), { id: popId, side }]);
    setTimeout(() => setCoinPops((prev) => prev.filter((p) => p.id !== popId)), 1000);

    if (supabase) {
      const { error } = await supabase.rpc("increment_rapid_fire_vote", { p_debate_id: debateId, p_side: side });
      if (error) {
        const current = liveVoteMap[debateId] || { leftVotes: 0, rightVotes: 0, totalVotes: 0 };
        await supabase.from("rapid_fire_votes").upsert(
          { debate_id: debateId, left_votes: current.leftVotes + (side === "left" ? 1 : 0), right_votes: current.rightVotes + (side === "right" ? 1 : 0), total_votes: current.totalVotes + 1, updated_at: new Date().toISOString() },
          { onConflict: "debate_id" }
        );
      }
    }

    awardCoins("rapid_fire_vote");
    const newStreak = voteStreak + 1;
    setVoteStreak(newStreak);
    if (newStreak % 5 === 0) {
      awardCoins("rapid_fire_streak_5");
      setShowCombo(newStreak);
      setTimeout(() => setShowCombo(0), 1400);
    }
    if (newStreak > 0 && newStreak % 10 === 0) {
      setTimeout(() => setShowShare(true), 1000);
    }
    setTimeout(() => {
      const nextEl = document.getElementById(`debate-${index + 1}`);
      if (nextEl) nextEl.scrollIntoView({ behavior: "smooth" });
    }, 1200);
  };

  return (
    <div className="bg-[#050508] fixed inset-0 z-50 flex flex-col overflow-hidden">

      {/* ── Scanline overlay ───────────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)", backgroundSize: "100% 4px" }}
      />

      {/* ── Combo flash ───────────────────────────────────────────────────── */}
      {showCombo > 0 && <ComboFlash streak={showCombo} />}

      {/* ── Arcade cabinet header ─────────────────────────────────────────── */}
      <div className="relative z-20 flex-shrink-0 bg-black border-b-2 border-[#00CFFF]/40 px-3 py-2.5">
        {/* top row */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
            Quit
          </Link>

          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#00CFFF]/50 bg-[#00CFFF]/10">
            <Zap className="w-4 h-4 text-[#00CFFF]" />
            <span className="font-black text-[#00CFFF] uppercase tracking-[0.3em] text-xs">Rapid Fire</span>
          </div>

          <div className="text-right">
            <div className="text-[8px] font-black uppercase tracking-widest text-white/30">Score</div>
            <div className="text-sm font-black text-[#FFD700] tabular-nums">{String(score).padStart(4, "0")}</div>
          </div>
        </div>

        {/* stats row */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="border border-white/10 bg-white/[0.03] px-2 py-1.5 text-center">
            <div className="text-[8px] font-black uppercase tracking-widest text-white/30">Stage</div>
            <div className="text-xs font-black text-white tabular-nums">{String(votedCount + 1).padStart(2, "0")}<span className="text-white/25">/{String(debates.length).padStart(2, "0")}</span></div>
          </div>
          <div className="border border-orange-500/30 bg-orange-500/5 px-2 py-1.5 text-center">
            <div className="text-[8px] font-black uppercase tracking-widest text-orange-400/60">Combo</div>
            <div className="text-xs font-black text-orange-400 tabular-nums">x{voteStreak} 🔥</div>
          </div>
          <div className="border border-[#FFD700]/20 bg-[#FFD700]/5 px-2 py-1.5 text-center">
            <div className="text-[8px] font-black uppercase tracking-widest text-[#FFD700]/60">MTC</div>
            <div className="text-xs font-black text-[#FFD700] tabular-nums">+{score}</div>
          </div>
        </div>

        {/* EXP progress bar */}
        <div className="relative h-2 bg-white/5 border border-white/10 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00CFFF] to-[#7B2FFF] transition-all duration-500 shadow-[0_0_8px_rgba(0,207,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[7px] font-black uppercase tracking-widest text-white/50">
            {progress}% complete
          </div>
        </div>
      </div>

      {/* ── Snap scroll arena ─────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative"
        style={{ scrollBehavior: "smooth" }}
      >
        {debates.map((debate: any, index: number) => {
          const userVote = localVotes[debate.id];
          const fallbackTotal = parseInt(debate.totalVotes?.replace(",", "") || "0");
          const live = liveVoteMap[debate.id];
          const leftVotes = live ? live.leftVotes : (debate.leftVotes || 0);
          const rightVotes = live ? live.rightVotes : (debate.rightVotes || 0);
          const totalVotesRaw = live ? live.totalVotes : fallbackTotal;
          const leftImage = resolveDebateImage(debate.left, debate.leftImage);
          const rightImage = resolveDebateImage(debate.right, debate.rightImage);
          const total = leftVotes + rightVotes || 1;
          const finalLeft = Math.round((leftVotes / total) * 100);
          const finalRight = 100 - finalLeft;
          const voted = userVote !== undefined;

          return (
            <div
              key={debate.id}
              id={`debate-${index}`}
              className="w-full min-h-[calc(100dvh-110px)] snap-start snap-always flex flex-col items-center justify-center relative px-4 py-6"
            >
              {/* arena glow */}
              <div className={`absolute inset-0 transition-all duration-700 pointer-events-none ${
                userVote === "left"  ? "bg-[radial-gradient(ellipse_at_30%_50%,rgba(0,150,255,0.12),transparent_60%)]" :
                userVote === "right" ? "bg-[radial-gradient(ellipse_at_70%_50%,rgba(255,40,40,0.12),transparent_60%)]" :
                "bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,255,255,0.03),transparent_60%)]"
              }`} />

              {/* coin pops */}
              {coinPops.map((p) => <CoinPop key={p.id} id={p.id} side={p.side} />)}

              <div className="max-w-md w-full relative z-10 flex flex-col items-center gap-4">

                {/* stage badge */}
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-[#00CFFF]/40" />
                  <span className="text-[9px] font-black uppercase tracking-[0.35em] text-[#00CFFF]/70">
                    Stage {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="h-px w-8 bg-[#00CFFF]/40" />
                </div>

                {/* question */}
                <h2 className="text-xl md:text-3xl font-black text-center leading-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                  {debate.title}
                </h2>

                {/* fighter portraits */}
                <div className="flex items-end justify-between w-full gap-3">
                  {/* Left fighter */}
                  <div className={`flex flex-col items-center gap-2 w-[44%] transition-all duration-300 ${voted && userVote !== "left" ? "opacity-30 scale-95" : ""}`}>
                    <div className={`w-full aspect-square overflow-hidden border-2 transition-all duration-300 ${
                      userVote === "left" ? "border-[#00CFFF] shadow-[0_0_24px_rgba(0,207,255,0.6)]" : "border-white/15"
                    }`}>
                      <DebateImage label={debate.left} src={leftImage} />
                    </div>
                    <span className="text-xs md:text-sm font-black text-center text-white leading-tight uppercase tracking-wide">
                      {debate.left}
                    </span>
                    {userVote === "left" && (
                      <div className="flex items-center gap-1 text-[#00CFFF] text-[10px] font-black uppercase tracking-widest">
                        <Check className="w-3 h-3" /> Your Pick
                      </div>
                    )}
                  </div>

                  {/* VS */}
                  <div className="flex flex-col items-center gap-1 pb-8 shrink-0">
                    <div className="text-[10px] font-black text-white/20 tracking-widest">⚡</div>
                    <span className="text-xl font-black text-white/60 tracking-widest">VS</span>
                    <div className="text-[10px] font-black text-white/20 tracking-widest">⚡</div>
                  </div>

                  {/* Right fighter */}
                  <div className={`flex flex-col items-center gap-2 w-[44%] transition-all duration-300 ${voted && userVote !== "right" ? "opacity-30 scale-95" : ""}`}>
                    <div className={`w-full aspect-square overflow-hidden border-2 transition-all duration-300 ${
                      userVote === "right" ? "border-[#FF2828] shadow-[0_0_24px_rgba(255,40,40,0.6)]" : "border-white/15"
                    }`}>
                      <DebateImage label={debate.right} src={rightImage} />
                    </div>
                    <span className="text-xs md:text-sm font-black text-center text-white leading-tight uppercase tracking-wide">
                      {debate.right}
                    </span>
                    {userVote === "right" && (
                      <div className="flex items-center gap-1 text-[#FF2828] text-[10px] font-black uppercase tracking-widest">
                        <Check className="w-3 h-3" /> Your Pick
                      </div>
                    )}
                  </div>
                </div>

                {/* Fighting-game HP bars */}
                <div className={`w-full transition-all duration-300 ${pulseMap[debate.id] ? "brightness-125" : ""}`}>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#00CFFF]/70 w-8 text-left">{voted ? `${finalLeft}%` : ""}</span>
                    <div className="flex-1 h-3 bg-white/5 border border-white/10 overflow-hidden flex">
                      {/* Left HP — fills from left */}
                      <div
                        className={`h-full transition-all duration-1000 ${userVote === "left" ? "bg-[#00CFFF] shadow-[0_0_10px_rgba(0,207,255,0.8)]" : "bg-[#00CFFF]/40"}`}
                        style={{ width: voted ? `${finalLeft}%` : "50%" }}
                      />
                      {/* Right HP — fills from right */}
                      <div
                        className={`h-full transition-all duration-1000 ${userVote === "right" ? "bg-[#FF2828] shadow-[0_0_10px_rgba(255,40,40,0.8)]" : "bg-[#FF2828]/40"}`}
                        style={{ width: voted ? `${finalRight}%` : "50%" }}
                      />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#FF2828]/70 w-8 text-right">{voted ? `${finalRight}%` : ""}</span>
                  </div>
                  {voted && (
                    <div className="text-center text-[9px] font-black uppercase tracking-widest text-white/25 mt-1">
                      {totalVotesRaw.toLocaleString()} fans voted
                    </div>
                  )}
                </div>

                {/* Vote buttons */}
                {!voted ? (
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => handleVote(debate.id, "left", index)}
                      disabled={isVoting === debate.id}
                      className="flex-1 py-4 md:py-5 font-black uppercase tracking-widest text-sm border-2 border-[#00CFFF]/50 bg-[#00CFFF]/10 text-[#00CFFF] hover:bg-[#00CFFF]/25 hover:border-[#00CFFF] hover:shadow-[0_0_20px_rgba(0,207,255,0.4)] active:scale-95 transition-all duration-150 flex flex-col items-center gap-1"
                    >
                      {isVoting === debate.id
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <>
                            <span className="text-xs text-[#00CFFF]/60 font-black tracking-widest">Pick This</span>
                            <span className="leading-tight text-center">{debate.left}</span>
                          </>
                      }
                    </button>
                    <button
                      onClick={() => handleVote(debate.id, "right", index)}
                      disabled={isVoting === debate.id}
                      className="flex-1 py-4 md:py-5 font-black uppercase tracking-widest text-sm border-2 border-[#FF2828]/50 bg-[#FF2828]/10 text-[#FF2828] hover:bg-[#FF2828]/25 hover:border-[#FF2828] hover:shadow-[0_0_20px_rgba(255,40,40,0.4)] active:scale-95 transition-all duration-150 flex flex-col items-center gap-1"
                    >
                      {isVoting === debate.id
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <>
                            <span className="text-xs text-[#FF2828]/60 font-black tracking-widest">Pick This</span>
                            <span className="leading-tight text-center">{debate.right}</span>
                          </>
                      }
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const nextEl = document.getElementById(`debate-${index + 1}`);
                      if (nextEl) nextEl.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-3.5 font-black uppercase tracking-[0.3em] text-xs border border-white/15 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Next Stage →
                  </button>
                )}

                {/* logged-out prompt */}
                {!isLoggedIn && (
                  <div className="w-full border border-[#FFD700]/30 bg-[#FFD700]/5 px-4 py-3 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
                      Insert Coin — Sign in to vote and earn MTC
                    </span>
                  </div>
                )}
              </div>

              {/* scroll hint */}
              {!voted && index < debates.length - 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-[8px] font-black uppercase tracking-widest text-white/15 animate-bounce">
                  swipe down
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showShare && (
        <ShareCard
          achievement={`Rapid Fire Streak: ${voteStreak} Votes!`}
          subtitle="I just ran through a stack of football debates."
          coinsEarned={score}
          emoji="RF"
          shareUrl={`https://ballmtaani.com/?ref=${username || "fan"}`}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
