import { useRef, useMemo, useEffect } from "react";
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
  const items: TickerItem[] = [];
  matches.forEach(m => {
    const isLive = !!(m.minute || m.status === "LIVE" || m.homeScore !== undefined);
    items.push({
      id: `match-${m.id}`,
      type: isLive ? "match" : "upcoming",
      label: `${m.home}  ${m.homeScore ?? "–"}  ·  ${m.awayScore ?? "–"}  ${m.away}`,
      sub: isLive ? `${m.minute ?? ""}` : (m.time ?? ""),
      href: isLive ? `/live-center/${m.id}` : "/matches",
      isLive,
    });
  });
  articles.forEach(a => {
    items.push({
      id: `article-${a.id}`,
      type: "article",
      label: a.title,
      sub: a.source,
      href: a.isInternal ? `/article/${a.slug}` : a.link,
      isLive: false,
    });
  });
  return items;
}

export default function HeroTicker({ articles, matches }: HeroTickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Use refs so the animation loop never needs to restart for pause/resume
  const posRef   = useRef(0);
  const pauseRef = useRef(false);
  const rafRef   = useRef<number>(0);

  // Stable items list — only recompute when data actually changes
  const items = useMemo(() => buildItems(articles, matches), [articles, matches]);

  // Single animation loop — only restarts when items change (data update)
  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    // Reset position when items list changes
    posRef.current = 0;
    track.style.transform = "translateX(0px)";

    const step = () => {
      if (!pauseRef.current) {
        posRef.current -= 0.6;
        // Read scrollWidth inside the loop so it's always current
        const half = track.scrollWidth / 2;
        if (half > 0 && posRef.current <= -half) {
          posRef.current = 0;
        }
        track.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [items]); // ← NO `paused` here — that's what caused the glitch

  const pause   = () => { pauseRef.current = true; };
  const unpause = () => { pauseRef.current = false; };

  if (items.length === 0) return null;

  // Double the list for a seamless infinite loop
  const doubled = [...items, ...items];

  return (
    <div
      className="relative z-20 overflow-hidden border-b border-white/6 bg-black/80 backdrop-blur-sm"
      style={{ height: 36 }}
      onMouseEnter={pause}
      onMouseLeave={unpause}
      onTouchStart={pause}
      onTouchEnd={unpause}
    >
      {/* Left brand pin */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center gap-2 border-r border-white/8 bg-[#B30000] px-3">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        <span className="text-[9px] font-black uppercase tracking-[0.22em] text-white whitespace-nowrap">BallMtaani</span>
      </div>

      {/* Right fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-black/90 to-transparent" />

      {/* Track — paddingLeft keeps content clear of the brand pin */}
      <div
        ref={trackRef}
        className="flex h-full items-center will-change-transform whitespace-nowrap"
        style={{ paddingLeft: 120 }}
      >
        {doubled.map((item, i) => {
          const isExternal = !item.href.startsWith("/");
          const inner = (
            <span className="inline-flex h-full shrink-0 cursor-pointer items-center gap-2 border-r border-white/6 px-5 transition-colors hover:bg-white/5">
              {item.isLive ? (
                <span className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-[#B30000]" />
              ) : item.type === "article" ? (
                <span className="text-[9px] text-white/25">📰</span>
              ) : (
                <span className="text-[9px] text-white/25">⚽</span>
              )}

              <span className={`text-[11px] font-bold ${item.isLive ? "text-white" : "text-white/65"}`}>
                {item.label}
              </span>

              {item.sub && (
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                  item.isLive
                    ? "bg-[#B30000]/12 text-[#B30000]"
                    : item.type === "article"
                    ? "bg-[#FFD700]/8 text-[#FFD700]/60"
                    : "text-white/30"
                }`}>
                  {item.isLive ? `${item.sub}'` : item.sub}
                </span>
              )}
            </span>
          );

          return isExternal ? (
            <a key={`${item.id}-${i}`} href={item.href} target="_blank" rel="noopener noreferrer"
              className="inline-flex h-full shrink-0 items-center">
              {inner}
            </a>
          ) : (
            <Link key={`${item.id}-${i}`} href={item.href}
              className="inline-flex h-full shrink-0 items-center">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
