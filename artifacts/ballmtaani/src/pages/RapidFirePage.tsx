import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";
import { Check, ChevronLeft, Flame, Zap } from "lucide-react";
import { getRandomRapidFireSet, RapidFireDebate } from "../data/mockRapidFire";
import { ShareCard } from "../components/ShareCard";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";

// ─── Image resolution ──────────────────────────────────────────────────────────
function resolveDebateImage(label: string, explicit?: string) {
  if (explicit && explicit.trim()) return explicit;
  return "";
}

function useDebateImage(label: string, src: string) {
  const [resolved, setResolved] = useState<string>(src || "");
  const [failed, setFailed]     = useState(false);

  useEffect(() => {
    if (src) { setResolved(src); return; }
    const key = `mtaani_rf_img_${label}`;
    const cached = sessionStorage.getItem(key);
    if (cached) { setResolved(cached); return; }
    const aliases: Record<string, string> = {
      "Trent AA": "Trent Alexander-Arnold", "Neuer": "Manuel Neuer",
      "Courtois": "Thibaut Courtois", "Kante": "N'Golo Kante",
      "Lewa": "Robert Lewandowski", "Walker": "Kyle Walker",
      "Rice": "Declan Rice", "Ozil": "Mesut Ozil",
    };
    const query = aliases[label] || label;
    let cancelled = false;
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/\s+/g, "_"))}`)
      .then(r => r.json())
      .then(data => {
        const thumb = data?.thumbnail?.source;
        if (thumb && !cancelled) { setResolved(thumb); sessionStorage.setItem(key, thumb); }
      }).catch(() => {});
    return () => { cancelled = true; };
  }, [label, src]);

  return { url: failed ? "" : resolved, onError: () => setFailed(true) };
}

// ─── Side panel (left or right) ────────────────────────────────────────────────
function FighterPanel({
  label, imgSrc, side, voted, isMyPick, pct, onClick, disabled,
}: {
  label: string; imgSrc: string; side: "left" | "right";
  voted: boolean; isMyPick: boolean; pct: number;
  onClick: () => void; disabled: boolean;
}) {
  const { url: imgUrl, onError } = useDebateImage(label, imgSrc);
  const isLeft    = side === "left";
  const hasImage  = !!imgUrl;
  const baseColor = isLeft ? "#0047FF" : "#FF1744";
  const glowColor = isLeft ? "rgba(0,71,255,0.6)" : "rgba(255,23,68,0.6)";
  const initial   = label.trim().slice(0, 2).toUpperCase();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative overflow-hidden flex flex-col items-center justify-end select-none focus:outline-none transition-all duration-700"
      style={{
        flex: voted ? `${isMyPick ? pct : 100 - pct} 1 0%` : "1 1 0%",
        background: isLeft
          ? "linear-gradient(135deg, #000820 0%, #001147 50%, #000820 100%)"
          : "linear-gradient(225deg, #1a0000 0%, #3d0000 50%, #1a0000 100%)",
        boxShadow: isMyPick ? `inset 0 0 120px ${glowColor}` : "none",
      }}
    >
      {/* ── Background: image OR jersey-number fallback ───────────────────── */}
      {hasImage ? (
        <img
          src={imgUrl}
          alt={label}
          onError={onError}
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ opacity: voted ? (isMyPick ? 0.5 : 0.12) : 0.38 }}
          loading="lazy"
        />
      ) : (
        /* Jersey-number style fallback — looks intentional not broken */
        <div
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
          style={{ opacity: voted ? (isMyPick ? 0.18 : 0.06) : 0.12 }}
        >
          <span
            className="font-black uppercase leading-none tracking-tighter"
            style={{
              fontSize: "clamp(5rem, 22vw, 16rem)",
              color: baseColor,
              textShadow: `0 0 60px ${glowColor}`,
              fontStyle: "italic",
            }}
          >
            {initial}
          </span>
        </div>
      )}

      {/* ── Depth gradient ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isLeft
            ? "linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.1) 100%), linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 30%, transparent 65%)"
            : "linear-gradient(to left,  rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.1) 100%), linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 30%, transparent 65%)",
        }}
      />

      {/* ── Neon edge ─────────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 bottom-0 w-[3px] pointer-events-none transition-all duration-500"
        style={{
          [isLeft ? "right" : "left"]: 0,
          background: `linear-gradient(to bottom, transparent 5%, ${baseColor} 45%, ${baseColor} 55%, transparent 95%)`,
          boxShadow: isMyPick ? `0 0 24px 6px ${glowColor}` : "none",
          opacity: voted ? (isMyPick ? 1 : 0.15) : 0.4,
        }}
      />

      {/* ── Hover shimmer ─────────────────────────────────────────────────── */}
      {!voted && !disabled && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at ${isLeft ? "25% 65%" : "75% 65%"}, ${glowColor} 0%, transparent 55%)` }}
        />
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div
        className={`relative z-10 pb-8 md:pb-12 px-5 w-full ${isLeft ? "text-left" : "text-right"}`}
      >
        {!voted && (
          <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-2.5" style={{ color: baseColor }}>
            {isLeft ? "← tap to pick" : "tap to pick →"}
          </p>
        )}

        <h3
          className="font-black leading-[0.9] uppercase text-white"
          style={{
            fontSize: "clamp(1.6rem, 5.5vw, 3.5rem)",
            textShadow: isMyPick ? `0 0 40px ${glowColor}, 0 2px 20px rgba(0,0,0,0.8)` : "0 2px 20px rgba(0,0,0,0.8)",
          }}
        >
          {label}
        </h3>

        {voted && (
          <div className="mt-3">
            <span
              className="font-black tabular-nums leading-none block"
              style={{
                fontSize: "clamp(3rem, 12vw, 6rem)",
                color: isMyPick ? baseColor : "rgba(255,255,255,0.18)",
                textShadow: isMyPick ? `0 0 60px ${glowColor}` : "none",
              }}
            >
              {pct}%
            </span>
          </div>
        )}

        {isMyPick && (
          <div
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 font-black text-[9px] uppercase tracking-[0.28em]"
            style={{ background: `${baseColor}20`, border: `1px solid ${baseColor}50`, color: baseColor }}
          >
            <Check className="w-3 h-3" /> Your pick
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Intro splash screen ────────────────────────────────────────────────────────
function IntroScreen({ firstDebate, onStart, totalDebates }: {
  firstDebate: RapidFireDebate | undefined;
  onStart: () => void;
  totalDebates: number;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#050508] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: "#0047FF" }} />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: "#FF1744" }} />
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#0047FF]" />
          <Zap className="w-6 h-6 text-[#0047FF]" />
          <span className="font-black text-2xl uppercase tracking-[0.4em] text-white">Rapid Fire</span>
          <Zap className="w-6 h-6 text-[#FF1744]" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#FF1744]" />
        </div>
        <p className="text-white/40 font-bold text-sm tracking-[0.2em] uppercase">
          Hot takes. No thinking. Just pick.
        </p>
      </div>

      {/* First debate preview */}
      {firstDebate && (
        <div className="relative z-10 w-full max-w-sm mb-8">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/30 mb-3">Up first</p>
          <div className="border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="bg-black/50 px-4 py-2 border-b border-white/8">
              <p className="text-xs font-black text-white truncate">{firstDebate.title}</p>
            </div>
            <div className="flex h-20">
              <div className="flex-1 flex items-center justify-center bg-[#0047FF]/15 border-r border-white/8">
                <span className="font-black text-[#0047FF] text-sm uppercase tracking-wide text-center px-2">{firstDebate.left}</span>
              </div>
              <div className="flex items-center justify-center px-3 bg-black/20">
                <span className="text-white/30 font-black text-xs">VS</span>
              </div>
              <div className="flex-1 flex items-center justify-center bg-[#FF1744]/15">
                <span className="font-black text-[#FF1744] text-sm uppercase tracking-wide text-center px-2">{firstDebate.right}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="relative z-10 flex items-center gap-6 mb-8">
        {[
          { value: totalDebates, label: "debates" },
          { value: "+10", label: "MTC each vote" },
          { value: "+25", label: "MTC per 5 streak" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="text-xl font-black text-[#FFD700]">{value}</div>
            <div className="text-[8px] font-black uppercase tracking-widest text-white/30">{label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="relative z-10 w-full max-w-xs">
        <button
          onClick={onStart}
          className="w-full py-4 font-black uppercase tracking-[0.35em] text-sm text-black bg-[#FFD700] hover:bg-yellow-400 active:scale-[0.97] transition-all shadow-[0_0_40px_rgba(255,215,0,0.3)]"
        >
          Enter the Arena ⚡
        </button>
        <p className="mt-3 text-[9px] font-bold uppercase tracking-widest text-white/20">
          No fence-sitting. Take a stand.
        </p>
      </div>

      {/* Quit */}
      <Link href="/" className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-2 border border-white/10 bg-white/[0.03] text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Quit
      </Link>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
export default function RapidFirePage() {
  const { isLoggedIn, awardCoins, username } = useAuth();
  const [, setLocation] = useLocation();

  const [gameStarted, setGameStarted] = useState(false);
  const [debates] = useState<RapidFireDebate[]>(() => getRandomRapidFireSet(100));
  const [localVotes, setLocalVotes]   = useState<Record<string, "left" | "right">>({});
  const [isVoting, setIsVoting]       = useState<string | null>(null);
  const [voteStreak, setVoteStreak]   = useState(0);
  const [showShare, setShowShare]     = useState(false);
  const [showCombo, setShowCombo]     = useState(0);
  const [coinPop, setCoinPop]         = useState<{ key: string; side: "left" | "right" } | null>(null);
  const [liveVoteMap, setLiveVoteMap] = useState<Record<string, { leftVotes: number; rightVotes: number; totalVotes: number }>>({});
  const [updatedAtMap, setUpdatedAtMap] = useState<Record<string, number>>({});
  const [pulseMap, setPulseMap]       = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const votedCount = Object.keys(localVotes).length;
  const progress   = Math.round((votedCount / debates.length) * 100);
  const score      = votedCount * 10 + Math.floor(voteStreak / 5) * 25;

  // ── Live Supabase sync ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase || !debates.length) return;
    let cancelled = false;
    const sync = async () => {
      const { data, error } = await supabase.from("rapid_fire_votes")
        .select("debate_id,left_votes,right_votes,total_votes,updated_at")
        .in("debate_id", debates.map(d => d.id));
      if (error || !data || cancelled) return;
      const vMap: Record<string, { leftVotes: number; rightVotes: number; totalVotes: number }> = {};
      const aMap: Record<string, number> = {};
      for (const r of data as any[]) {
        vMap[r.debate_id] = { leftVotes: r.left_votes || 0, rightVotes: r.right_votes || 0, totalVotes: r.total_votes || 0 };
        aMap[r.debate_id] = r.updated_at ? new Date(r.updated_at).getTime() : Date.now();
      }
      setLiveVoteMap(p => ({ ...p, ...vMap }));
      setUpdatedAtMap(p => ({ ...p, ...aMap }));
    };
    sync();
    const t = window.setInterval(sync, 30_000);
    return () => { cancelled = true; window.clearInterval(t); };
  }, [debates]);

  useEffect(() => {
    if (!supabase || !debates.length) return;
    const ids = new Set(debates.map(d => d.id));
    const ch = supabase.channel("rf-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "rapid_fire_votes" }, (payload: any) => {
        const r = (payload.new || payload.old) as any;
        if (!r?.debate_id || !ids.has(r.debate_id)) return;
        setLiveVoteMap(p => ({ ...p, [r.debate_id]: { leftVotes: r.left_votes || 0, rightVotes: r.right_votes || 0, totalVotes: r.total_votes || 0 } }));
        setUpdatedAtMap(p => ({ ...p, [r.debate_id]: Date.now() }));
        setPulseMap(p => ({ ...p, [r.debate_id]: true }));
        setTimeout(() => setPulseMap(p => ({ ...p, [r.debate_id]: false })), 600);
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [debates]);

  // ── Vote handler ─────────────────────────────────────────────────────────────
  const handleVote = async (debateId: string, side: "left" | "right", index: number) => {
    if (!isLoggedIn) {
      sessionStorage.setItem("auth_return_url", window.location.pathname);
      setLocation("/login");
      return;
    }
    if (localVotes[debateId] || isVoting) return;

    setIsVoting(debateId);
    await new Promise(r => setTimeout(r, 120));
    setLocalVotes(p => ({ ...p, [debateId]: side }));
    setIsVoting(null);

    setLiveVoteMap(p => {
      const c = p[debateId] || { leftVotes: 0, rightVotes: 0, totalVotes: 0 };
      return { ...p, [debateId]: { leftVotes: c.leftVotes + (side === "left" ? 1 : 0), rightVotes: c.rightVotes + (side === "right" ? 1 : 0), totalVotes: c.totalVotes + 1 } };
    });

    // Coin pop
    const popKey = `${debateId}-${Date.now()}`;
    setCoinPop({ key: popKey, side });
    setTimeout(() => setCoinPop(null), 900);

    // Supabase write
    if (supabase) {
      const { error } = await supabase.rpc("increment_rapid_fire_vote", { p_debate_id: debateId, p_side: side });
      if (error) {
        const c = liveVoteMap[debateId] || { leftVotes: 0, rightVotes: 0, totalVotes: 0 };
        await supabase.from("rapid_fire_votes").upsert(
          { debate_id: debateId, left_votes: c.leftVotes + (side === "left" ? 1 : 0), right_votes: c.rightVotes + (side === "right" ? 1 : 0), total_votes: c.totalVotes + 1, updated_at: new Date().toISOString() },
          { onConflict: "debate_id" }
        );
      }
    }

    awardCoins("rapid_fire_vote");
    const ns = voteStreak + 1;
    setVoteStreak(ns);
    if (ns % 5 === 0) {
      awardCoins("rapid_fire_streak_5");
      setShowCombo(ns);
      setTimeout(() => setShowCombo(0), 1500);
    }
    if (ns > 0 && ns % 10 === 0) setTimeout(() => setShowShare(true), 800);

    // Auto-advance after 1.6s
    setTimeout(() => {
      const next = document.getElementById(`rf-${index + 1}`);
      if (next) next.scrollIntoView({ behavior: "smooth" });
    }, 1600);
  };

  if (!gameStarted) {
    return (
      <IntroScreen
        firstDebate={debates[0]}
        onStart={() => setGameStarted(true)}
        totalDebates={debates.length}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">

      {/* ── COMBO FLASH ────────────────────────────────────────────────────── */}
      {showCombo > 0 && (
        <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
          <div className="animate-combo-flash text-center">
            <div className="text-[#FFD700] font-black tracking-[0.3em] uppercase" style={{ fontSize: "clamp(2.5rem,8vw,5rem)" }}>
              COMBO!
            </div>
            <div className="text-white font-black tracking-widest" style={{ fontSize: "clamp(1.5rem,5vw,3rem)" }}>
              🔥 x{showCombo}
            </div>
          </div>
        </div>
      )}

      {/* ── COIN POP ───────────────────────────────────────────────────────── */}
      {coinPop && (
        <div
          key={coinPop.key}
          className={`pointer-events-none fixed z-[55] text-[#FFD700] font-black text-2xl tracking-widest animate-coin-pop ${coinPop.side === "left" ? "left-[20%]" : "right-[20%]"} bottom-40`}
        >
          +10 MTC
        </div>
      )}

      {/* ── HEADER BAR ─────────────────────────────────────────────────────── */}
      <div className="relative z-30 flex-shrink-0 flex items-center justify-between gap-2 px-3 py-2 bg-black/95 border-b border-white/8">
        <Link href="/" className="flex items-center gap-1.5 px-3 py-2 border border-white/10 bg-white/[0.04] text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
          Quit
        </Link>

        <div className="flex items-center gap-2 px-3 py-2 border border-[#0047FF]/50 bg-[#0047FF]/10">
          <Zap className="w-4 h-4 text-[#0047FF]" />
          <span className="text-[#0047FF] font-black uppercase tracking-[0.3em] text-[11px]">Rapid Fire</span>
          <span className="text-white/30 text-[10px] font-black">
            {String(votedCount + 1).padStart(2, "0")}/{String(debates.length).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {voteStreak > 0 && (
            <div className="flex items-center gap-1 text-orange-400 font-black text-sm">
              <Flame className="w-4 h-4" />{voteStreak}
            </div>
          )}
          <div className="text-right">
            <div className="text-[8px] font-black uppercase tracking-widest text-white/25">Score</div>
            <div className="text-sm font-black text-[#FFD700] tabular-nums">{String(score).padStart(4, "0")}</div>
          </div>
        </div>
      </div>

      {/* ── THIN PROGRESS BAR ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0 h-[3px] bg-white/5">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: "linear-gradient(to right, #0047FF, #7B2FFF, #FF1744)" }}
        />
      </div>

      {/* ── SNAP SCROLL ARENA ──────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {debates.map((debate: any, index: number) => {
          const voted     = localVotes[debate.id];
          const live      = liveVoteMap[debate.id];
          const leftV     = live ? live.leftVotes  : (debate.leftVotes  || 0);
          const rightV    = live ? live.rightVotes : (debate.rightVotes || 0);
          const totalV    = live ? live.totalVotes : (parseInt(debate.totalVotes?.replace(",", "") || "0"));
          const total     = leftV + rightV || 1;
          const leftPct   = Math.round((leftV  / total) * 100);
          const rightPct  = 100 - leftPct;
          const leftImg   = resolveDebateImage(debate.left,  debate.leftImage);
          const rightImg  = resolveDebateImage(debate.right, debate.rightImage);

          return (
            <div
              key={debate.id}
              id={`rf-${index}`}
              className="w-full snap-start snap-always flex flex-col"
              style={{ height: "calc(100dvh - 56px)" }}
            >
              {/* ── Question bar ─────────────────────────────────────────── */}
              <div className="flex-shrink-0 bg-black/90 backdrop-blur border-b border-white/8 px-4 py-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/30 mb-1">
                  {debate.emoji || "⚡"} Stage {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="text-base md:text-xl font-black text-white leading-tight">
                  {debate.title}
                </h2>
              </div>

              {/* ── Full-height split arena ───────────────────────────────── */}
              <div className="flex-1 flex relative overflow-hidden">
                <FighterPanel
                  label={debate.left}
                  imgSrc={leftImg}
                  side="left"
                  voted={!!voted}
                  isMyPick={voted === "left"}
                  pct={leftPct}
                  onClick={() => handleVote(debate.id, "left", index)}
                  disabled={!!voted || isVoting === debate.id}
                />

                {/* ── VS divider ─────────────────────────────────────────── */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
                  <div className="bg-black border border-white/20 px-2.5 py-3 my-2">
                    <span className="text-white/60 font-black text-[11px] uppercase tracking-[0.2em] [writing-mode:vertical-rl]">VS</span>
                  </div>
                  <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
                </div>

                <FighterPanel
                  label={debate.right}
                  imgSrc={rightImg}
                  side="right"
                  voted={!!voted}
                  isMyPick={voted === "right"}
                  pct={rightPct}
                  onClick={() => handleVote(debate.id, "right", index)}
                  disabled={!!voted || isVoting === debate.id}
                />

                {/* ── Vote count overlay (post-vote) ────────────────────── */}
                {voted && (
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-4 z-10 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur border border-white/10 px-4 py-2 text-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                        {totalV.toLocaleString()} fans voted
                      </span>
                    </div>
                  </div>
                )}

                {/* ── Swipe hint (pre-vote) ─────────────────────────────── */}
                {!voted && index < debates.length - 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 pointer-events-none">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/15 animate-bounce">
                      vote · then swipe down
                    </span>
                  </div>
                )}

                {/* ── Login wall ────────────────────────────────────────── */}
                {!isLoggedIn && (
                  <div className="absolute inset-0 z-30 flex items-end justify-center pb-8 bg-black/50 backdrop-blur-sm">
                    <div className="text-center px-6">
                      <div className="text-[#FFD700] font-black text-xl tracking-widest uppercase mb-3">
                        INSERT COIN
                      </div>
                      <p className="text-white/50 text-xs font-bold mb-4">Sign in to vote and earn MTC</p>
                      <Link
                        href="/login"
                        className="inline-block bg-[#FFD700] text-black font-black uppercase tracking-widest text-xs px-8 py-3 hover:bg-yellow-400 transition-colors"
                      >
                        Sign In Free
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Next stage button (post-vote) ─────────────────────────── */}
              {voted && index < debates.length - 1 && (
                <div className="flex-shrink-0 bg-black border-t border-white/8">
                  <button
                    onClick={() => {
                      const next = document.getElementById(`rf-${index + 1}`);
                      if (next) next.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-3.5 font-black uppercase tracking-[0.3em] text-[11px] text-white/40 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Next Stage →
                  </button>
                </div>
              )}

              {voted && index === debates.length - 1 && (
                <div className="flex-shrink-0 bg-black border-t border-[#FFD700]/30 text-center py-4">
                  <div className="text-[#FFD700] font-black text-lg tracking-widest">
                    GAME OVER
                  </div>
                  <div className="text-white/40 text-xs font-bold mt-1 tracking-widest">
                    {votedCount} votes · {score} MTC earned
                  </div>
                  <Link href="/" className="mt-3 inline-block text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                    Return to BallMtaani
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showShare && (
        <ShareCard
          achievement={`Rapid Fire: ${voteStreak} in a row!`}
          subtitle="I just torched a stack of football debates on BallMtaani."
          coinsEarned={score}
          emoji="RF"
          shareUrl={`https://ballmtaani.com/rapid-fire?ref=${username || "fan"}`}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
