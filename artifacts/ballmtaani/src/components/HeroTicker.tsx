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
import { useState } from "react";
import { Link } from "wouter";
import { Zap, ChevronRight } from "lucide-react";
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
  return Array.from(new Map(out.map((item) => [`${item.type}:${item.href}:${item.label}`, item])).values());
}

const PIN_WIDTH = 135; // px — brand pin width
const RIGHT_PIN_WIDTH = 130; // px - right link width

export default function HeroTicker({ articles, matches }: HeroTickerProps) {
  const [paused, setPaused] = useState(false);

  const items = buildItems(articles, matches);

  if (items.length === 0) return null;

  // Duplicate for seamless CSS loop
  const doubled = [...items, ...items];

  // Speed: total pixels per second ≈ (items × ~200px chip) / duration
  // 1.5s per item gives a brisk but readable pace
  const duration = Math.max(8, items.length * 1.5);

  const Chip = ({ item }: { item: TickerItem }) => (
    <span className="inline-flex h-full shrink-0 cursor-pointer items-center gap-3 px-4 transition-colors hover:bg-white/5">
      {/* Red dot separator before each item */}
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#B30000]" />

      {/* Live ping overlay for live matches */}
      {item.isLive && (
        <span className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-[#B30000] -ml-4 absolute" />
      )}

      {/* Label */}
      <span className={`max-w-[200px] truncate text-[11px] font-semibold sm:max-w-[260px] ${
        item.isLive ? "text-white" : "text-white/70"
      }`}>
        {item.label}
      </span>

      {/* Sub badge for live matches */}
      {item.isLive && item.sub && (
        <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-[#B30000]/15 text-[#B30000]">
          {item.sub}'
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
        .hero-ticker-track {
          animation-name: hero-belt;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-ticker-track {
            animation: none !important;
            transform: translateX(0) !important;
          }
        }
      `}</style>

      <div
        className="relative z-20 border-b border-[#2A2A2A] bg-[#0B0B0B]"
        style={{ height: 36 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* ── Brand pin — absolute overlay, NOT in scroll flow ── */}
        <div
          className="absolute inset-y-0 left-0 z-20 flex items-center justify-center gap-1.5 border-r border-[#B30000] bg-[#B30000]"
          style={{ width: PIN_WIDTH }}
        >
          <Zap className="h-3 w-3 text-white fill-white" />
          <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-white">
            MTAA WIRE
          </span>
        </div>

        {/* ── Right Action Pin ── */}
        <Link
          href="/news"
          className="absolute inset-y-0 right-0 z-20 flex items-center justify-center gap-1 border-l border-[#2A2A2A] bg-[#0B0B0B] text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:text-white transition-colors"
          style={{ width: RIGHT_PIN_WIDTH }}
        >
          VIEW ALL NEWS <ChevronRight className="h-3.5 w-3.5" />
        </Link>

        {/* ── Left/Right fades ── */}
        <div className="pointer-events-none absolute inset-y-0 left-[135px] z-10 w-8 bg-gradient-to-r from-[#0B0B0B] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-[130px] z-10 w-12 bg-gradient-to-l from-[#0B0B0B] to-transparent" />

        {/* ── Clip zone — keeps track behind the brand pin ── */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ paddingLeft: PIN_WIDTH, paddingRight: RIGHT_PIN_WIDTH }}
        >
          {/* ── Animating track — zero padding, pure content width ── */}
          <div
            className="hero-ticker-track flex h-full items-center whitespace-nowrap will-change-transform motion-reduce:will-change-auto"
            style={{
              animationDuration: `${duration}s`,
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
