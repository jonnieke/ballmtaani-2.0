/**
 * HeroTicker — continuous right-to-left news belt
 *
 * Layout structure (critical for seamless loop):
 *   <outer>                  overflow:hidden, full width
 *     <brand-pin>            absolute left overlay — NOT in the scroll flow
 *     <clip-zone>            absolute, inset-0, paddingLeft=pin width, overflow:hidden
 *       <track>              animating div — NO padding, pure content width
 *         [item][item]...    one full set
 *         [item][item]...    exact duplicate (seamless loop via translateX(-50%))
 *
 * The CSS animation goes from translateX(0) → translateX(-50%).
 * Because the track has NO padding, -50% = exactly one content set.
 * At -50% the visual is identical to 0 → seamless jump.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import type { NewsArticle } from "../lib/news-api";

interface TickerMatch {
  id: string | number;
  home: string;
  away: string;
  homeScore?: number;
  awayScore?: number;
  minute?: string;
  status?: string;
  time?: string;
}

interface HeroTickerProps {
  articles: NewsArticle[];
  matches: TickerMatch[];
}

interface TickerItem {
  id: string;
  type: "article" | "match" | "upcoming";
  label: string;
  sub?: string;
  href: string;
  isLive?: boolean;
}

function buildItems(articles: NewsArticle[], matches: TickerMatch[]): TickerItem[] {
  const out: TickerItem[] = [];
  matches.forEach(m => {
    const isLive = !!(m.minute || m.status === "LIVE" || m.homeScore !== undefined);
    out.push({
      id: `m-${m.id}`,
      type: isLive ? "match" : "upcoming",
      label: `${m.home} ${m.homeScore ?? "–"} · ${m.awayScore ?? "–"} ${m.away}`,
      sub: isLive ? `${m.minute ?? ""}` : (m.time ?? ""),
      href: isLive ? `/live-center/${m.id}` : "/matches",
      isLive,
    });
  });
  articles.forEach(a => {
    out.push({
      id: `a-${a.id}`,
      type: "article",
      label: a.title,
      sub: a.source,
      href: a.isInternal ? `/article/${a.slug}` : a.link,
      isLive: false,
    });
  });
  return out;
}

const PIN_WIDTH = 110; // px — brand pin width

export default function HeroTicker({ articles, matches }: HeroTickerProps) {
  const [paused, setPaused] = useState(false);

  const items = useMemo(
    () => buildItems(articles, matches),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [articles.length, matches.length],
  );

  if (items.length === 0) return null;

  // Duplicate for seamless CSS loop
  const doubled = [...items, ...items];

  // Speed: total pixels per second ≈ (items × ~200px chip) / duration
  // 1.5s per item gives a brisk but readable pace
  const duration = Math.max(8, items.length * 1.5);

  const Chip = ({ item }: { item: TickerItem }) => (
    <span className="inline-flex h-full shrink-0 cursor-pointer items-center gap-2 border-r border-white/8 px-4 transition-colors hover:bg-white/5">
      {/* Indicator */}
      {item.isLive ? (
        <span className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-[#B30000]" />
      ) : item.type === "article" ? (
        <span className="shrink-0 text-[9px] text-white/20">📰</span>
      ) : (
        <span className="shrink-0 text-[9px] text-white/20">⚽</span>
      )}

      {/* Label — truncated so multiple items are visible */}
      <span className={`max-w-[180px] truncate text-[11px] font-bold sm:max-w-[240px] ${item.isLive ? "text-white" : "text-white/65"}`}>
        {item.label}
      </span>

      {/* Sub badge */}
      {item.sub && (
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${
          item.isLive        ? "bg-[#B30000]/15 text-[#B30000]" :
          item.type === "article" ? "bg-[#FFD700]/8 text-[#FFD700]/60" :
          "text-white/25"
        }`}>
          {item.isLive ? `${item.sub}'` : item.sub}
        </span>
      )}
    </span>
  );

  return (
    <>
      <style>{`
        @keyframes hero-belt {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      <div
        className="relative z-20 border-b border-white/6 bg-black/80 backdrop-blur-sm"
        style={{ height: 36 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* ── Brand pin — absolute overlay, NOT in scroll flow ── */}
        <div
          className="absolute inset-y-0 left-0 z-20 flex items-center gap-2 border-r border-white/8 bg-[#B30000]"
          style={{ width: PIN_WIDTH, paddingLeft: 10, paddingRight: 10 }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.2em] text-white">
            BallMtaani
          </span>
        </div>

        {/* ── Right fade ── */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-black/80 to-transparent" />

        {/* ── Clip zone — keeps track behind the brand pin ── */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ paddingLeft: PIN_WIDTH }}
        >
          {/* ── Animating track — zero padding, pure content width ── */}
          <div
            className="flex h-full items-center whitespace-nowrap will-change-transform"
            style={{
              animation: `hero-belt ${duration}s linear infinite`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {doubled.map((item, i) => {
              const isExternal = !item.href.startsWith("/");
              return isExternal ? (
                <a key={`${item.id}-${i}`} href={item.href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-full shrink-0 items-center">
                  <Chip item={item} />
                </a>
              ) : (
                <Link key={`${item.id}-${i}`} href={item.href}
                  className="inline-flex h-full shrink-0 items-center">
                  <Chip item={item} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
