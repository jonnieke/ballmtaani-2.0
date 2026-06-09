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
  const [paused, setPaused] = useState(false);

  // Stable items — only rebuild when data actually changes
  const items = useMemo(
    () => buildItems(articles, matches),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [articles.length, matches.length]
  );

  if (items.length === 0) return null;

  // Duplicate the list — CSS animates from 0 → -50% for a seamless loop
  const doubled = [...items, ...items];

  // ~2.5s per item (2× faster than original)
  const duration = Math.max(12, items.length * 2.5);

  return (
    <>
      {/* Inject the keyframe once — no external CSS file needed */}
      <style>{`
        @keyframes hero-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      <div
        className="relative z-20 overflow-hidden border-b border-white/6 bg-black/80 backdrop-blur-sm"
        style={{ height: 36 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Brand pin — anchored left, above the scrolling track */}
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center gap-2 border-r border-white/8 bg-[#B30000] px-3">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-white whitespace-nowrap">
            BallMtaani
          </span>
        </div>

        {/* Right fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-black/90 to-transparent" />

        {/* Scrolling track — pure CSS animation, no rAF, no position state */}
        <div
          className="flex h-full items-center whitespace-nowrap will-change-transform"
          style={{
            paddingLeft: 120,
            animation: `hero-ticker ${duration}s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {doubled.map((item, i) => {
            const isExternal = !item.href.startsWith("/");

            const chip = (
              <span
                className="inline-flex h-full shrink-0 cursor-pointer items-center gap-2 border-r border-white/6 px-5 transition-colors hover:bg-white/5"
              >
                {/* Indicator */}
                {item.isLive ? (
                  <span className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-[#B30000]" />
                ) : item.type === "article" ? (
                  <span className="text-[9px] text-white/25">📰</span>
                ) : (
                  <span className="text-[9px] text-white/25">⚽</span>
                )}

                {/* Label */}
                <span className={`text-[11px] font-bold ${item.isLive ? "text-white" : "text-white/65"}`}>
                  {item.label}
                </span>

                {/* Badge */}
                {item.sub && (
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                    item.isLive
                      ? "bg-[#B30000]/15 text-[#B30000]"
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
              <a
                key={`${item.id}-${i}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-full shrink-0 items-center"
              >
                {chip}
              </a>
            ) : (
              <Link
                key={`${item.id}-${i}`}
                href={item.href}
                className="inline-flex h-full shrink-0 items-center"
              >
                {chip}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
