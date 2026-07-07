import { useEffect, useMemo, useRef, useState } from "react";
import { useMatches, useUpcomingFixtures } from "../hooks/useData";
import { Link } from "wouter";

export function ScoreTicker() {
  const { data: matches = [] } = useMatches();
  const { data: upcoming = [] } = useUpcomingFixtures();
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const wc26Items = useMemo(() => {
    const isWc26 = (match: any) => {
      const league = String(match?.league || "").toLowerCase();
      return league.includes("world cup") || league.includes("fifa world cup") || match?.leagueId === 1;
    };

    const live = matches.filter((match: any) => isWc26(match) && (match.minute || match.status === "LIVE" || match.homeScore !== undefined));
    const upcomingWc26 = upcoming.filter((match: any) => isWc26(match));
    const source = live.length > 0 ? live : upcomingWc26;

    const items = source.slice(0, 6).map((match: any) => ({
      id: String(match.id || `${match.home}-${match.away}`),
      href: "/world-cup-2026",
      home: match.home || "WC26",
      away: match.away || "Hub",
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      minute: match.minute,
      status: match.status,
      date: match.date || match.time,
    }));

    if (items.length === 0) {
      items.push({
        id: "wc26-hub",
        href: "/world-cup-2026",
        home: "World Cup 2026",
        away: "Standings, fixtures, live scores",
        homeScore: null,
        awayScore: null,
        minute: null,
        status: "WC26 Hub",
        date: null,
      });
    }

    return items;
  }, [matches, upcoming]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || wc26Items.length === 0) return;

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
  }, [wc26Items, paused]);

  const items = [...wc26Items, ...wc26Items];

  return (
    <div
      className="overflow-hidden border-b border-[#FFD700]/15 bg-[#0A0A0A] relative"
      style={{ height: '38px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

      <div className="absolute left-3 top-1/2 z-20 flex -translate-y-1/2 items-center gap-2">
        <Link href="/world-cup-2026" className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#FFD700] hover:bg-[#FFD700]/16 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
          WC26 Belt
        </Link>
      </div>

      <div ref={trackRef} className="flex items-center h-full pl-28 whitespace-nowrap will-change-transform">
        {items.map((match: any, i: number) => (
          <Link
            key={`${match.id}-${i}`}
            href={match.href || "/world-cup-2026"}
            className="inline-flex items-center gap-2 px-5 border-r border-white/5 h-full hover:bg-white/5 transition-colors shrink-0"
            aria-label={`Open ${match.home} ${match.away} World Cup 2026 page`}
          >
            <span className="rounded bg-[#FFD700]/12 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#FFD700]">
              {match.status || (match.minute ? `Live ${match.minute}` : "WC26")}
            </span>
            <span className="text-[11px] font-bold text-gray-300 truncate max-w-[72px]">{match.home}</span>
            <span className="text-[11px] font-black text-white tabular-nums">
              {match.homeScore ?? ""}
              {match.homeScore !== undefined && match.awayScore !== undefined ? <span className="text-gray-600 mx-1">-</span> : <span className="text-gray-600 mx-1">vs</span>}
              {match.awayScore ?? ""}
            </span>
            <span className="text-[11px] font-bold text-gray-300 truncate max-w-[72px]">{match.away}</span>
            <span className="text-[9px] font-black text-white/45 uppercase tracking-[0.18em]">World Cup 2026</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

