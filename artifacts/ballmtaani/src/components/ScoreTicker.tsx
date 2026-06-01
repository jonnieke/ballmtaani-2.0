import { useEffect, useMemo, useRef, useState } from "react";
import { useMatches } from "../hooks/useData";
import { Link } from "wouter";

export function ScoreTicker() {
  const { data: matches = [] } = useMatches();
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // useMemo gives a stable array reference so the rAF effect doesn't restart every render
  const liveMatches = useMemo(
    () => matches.filter((m: any) => m.minute || m.status === 'LIVE' || m.homeScore !== undefined),
    [matches]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track || liveMatches.length === 0) return;

    let pos = 0;
    let raf: number;

    const animate = () => {
      if (!paused) {
        pos -= 0.5;
        const total = track.scrollWidth / 2;
        if (Math.abs(pos) >= total) pos = 0;
        track.style.transform = `translateX(${pos}px)`;
      }
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [liveMatches, paused]);

  if (liveMatches.length === 0) return null;

  // Duplicate items for seamless loop
  const items = [...liveMatches, ...liveMatches];

  return (
    <div
      className="bg-[#0A0A0A] border-b border-white/5 overflow-hidden relative"
      style={{ height: '36px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

      {/* LIVE badge */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500">Live</span>
      </div>

      {/* Scrolling track */}
      <div ref={trackRef} className="flex items-center h-full pl-20 whitespace-nowrap will-change-transform">
        {items.map((match: any, i: number) => (
          <Link
            key={`${match.id}-${i}`}
            href="/matches"
            className="inline-flex items-center gap-2 px-5 border-r border-white/5 h-full hover:bg-white/5 transition-colors shrink-0"
          >
            {/* Home team */}
            <span className="text-[11px] font-bold text-gray-300 truncate max-w-[60px]">{match.home}</span>

            {/* Score */}
            <span className="text-[11px] font-black text-white tabular-nums">
              {match.homeScore ?? 0}
              <span className="text-gray-600 mx-1">-</span>
              {match.awayScore ?? 0}
            </span>

            {/* Away team */}
            <span className="text-[11px] font-bold text-gray-300 truncate max-w-[60px]">{match.away}</span>

            {/* Minute */}
            {match.minute && (
              <span className="text-[9px] font-black text-[#B30000] bg-[#B30000]/10 px-1.5 py-0.5 rounded">
                {match.minute}'
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
