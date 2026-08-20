import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BellRing,
  Coins,
  Flame,
  Gift,
  LockKeyhole,
  MessageCircle,
  Radio,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import SEO from "../components/SEO";
import SponsorSlot from "../components/SponsorSlot";
import TeamLogo from "../components/TeamLogo";
import MatchdayDataHub from "../components/MatchdayDataHub";
import { useAuth } from "../context/AuthContext";
import { useDebates, useLeaderboard, useMatches, useProfile, useRecentMatches, useUpcomingFixtures } from "../hooks/useData";
import { fetchFootballNews, fetchPartnerArticles, timeAgo, type NewsArticle } from "../lib/news-api";
import { askMchambuziHalisi } from "../lib/mchambuzi-halisi";
import { supabase } from "../lib/supabase";


const card = "border border-white/[0.09] bg-[#0a1014]/95 shadow-[0_18px_50px_rgba(0,0,0,0.28)]";

// ─── Match of the Day helpers ─────────────────────────────────
const isWCMatch = (m: any) => m?.leagueId === 1 || /world cup/i.test(m?.league || "");

// WC26 knockout calendar — derive the round label from today's date
function wc26RoundLabel(kickoffAt?: number): string | null {
  const now = kickoffAt ? new Date(kickoffAt) : new Date();
  const t = now.getTime();
  const at = (iso: string) => new Date(iso).getTime();
  if (t > at("2026-07-20T00:00:00Z") || t < at("2026-06-11T00:00:00Z")) return null;
  if (t >= at("2026-07-19T00:00:00Z")) return "The Final";
  if (t >= at("2026-07-18T00:00:00Z")) return "3rd Place Play-off";
  if (t >= at("2026-07-13T00:00:00Z")) return "Semi-Final";
  if (t >= at("2026-07-08T00:00:00Z")) return "Quarter-Final";
  if (t >= at("2026-07-04T00:00:00Z")) return "Round of 16";
  if (t >= at("2026-06-28T00:00:00Z")) return "Round of 32";
  return "Group Stage";
}

// ─── Breaking news ticker — the daily-fresh strip at the very top ──
function BreakingTicker({ items }: { items: NewsArticle[] }) {
  if (!items.length) return null;
  const loop = [...items, ...items]; // duplicated for seamless marquee wrap
  return (
    <div className="overflow-hidden border-b border-[#F7B500]/20 bg-[#0b0a04]">
      <style>{`@keyframes bmTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      <div className="flex items-stretch">
        <span className="z-10 flex shrink-0 items-center gap-1.5 bg-[#F7B500] px-3 text-[10px] font-black uppercase tracking-[0.2em] text-black">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-black" />
          </span>
          Mtaa Wire
        </span>
        <div className="flex min-w-0 flex-1 items-center overflow-hidden">
          <div className="flex whitespace-nowrap will-change-transform" style={{ animation: "bmTicker 45s linear infinite" }}>
            {loop.map((a, i) => {
              const inner = (
                <>
                  <span className="text-[8px] text-[#F7B500]">●</span>
                  {a.title}
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-white/30">{timeAgo(a.pubDate)}</span>
                </>
              );
              const cls = "mx-5 inline-flex items-center gap-2 py-2 text-xs font-bold text-white/75 transition-colors hover:text-[#F7B500]";
              return a.isInternal && a.slug ? (
                <Link key={`${a.id}-${i}`} href={`/article/${a.slug}`} className={cls}>{inner}</Link>
              ) : (
                <a key={`${a.id}-${i}`} href={a.link} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchTeam({ match, side }: { match: any; side: "home" | "away" }) {
  const name = match?.[side] || (side === "home" ? "Home" : "Away");
  const logo = match?.[`${side}Logo`];
  return (
    <div className="min-w-0 text-center">
      <TeamLogo logo={logo} initial={String(name).slice(0, 1)} color="#182333" size="lg" />
      <p className="mt-2 truncate text-xs font-black text-white">{name}</p>
    </div>
  );
}

function MatchPanel({ match, isLive, predictionCount, roundLabel }: { match: any; isLive: boolean; predictionCount: number; roundLabel?: string | null }) {
  const [homePick, setHomePick] = useState(1);
  const [awayPick, setAwayPick] = useState(0);
  const hasScore = match?.homeScore !== undefined && match?.awayScore !== undefined;
  const hasMatch = Boolean(match);

  return (
    <aside className="relative flex h-full min-h-[500px] flex-col overflow-hidden rounded-lg border border-[#F7B500]/45 bg-[#081015]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,.55),0_0_30px_rgba(247,181,0,.12)] backdrop-blur-xl lg:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(247,181,0,.14),transparent_32%)]" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F7B500]">
              {isLive ? "World Cup live" : isWCMatch(match) ? "World Cup tonight" : "Match of the day"}
            </p>
            <h2 className="mt-1 text-xs font-bold uppercase text-white/55">{roundLabel || match?.league || "World Cup 2026"}</h2>
          </div>
          <Link href="/matches" className="text-[10px] font-black uppercase tracking-wider text-[#F7B500]">View all</Link>
        </div>

        {hasMatch ? (
          <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <MatchTeam match={match} side="home" />
            <div className="text-center">
              {isLive || hasScore ? (
                <div className="text-2xl font-black text-white">{match?.homeScore ?? 0}<span className="mx-2 text-white/24">-</span>{match?.awayScore ?? 0}</div>
              ) : (
                <div className="text-sm font-black text-white/38">VS</div>
              )}
              <div className={`mt-1 text-[9px] font-black uppercase tracking-widest ${isLive ? "text-red-400" : "text-white/45"}`}>
                {isLive ? match?.minute || "Live" : [match?.date, match?.time].filter(Boolean).join(" | ") || "Upcoming"}
              </div>
            </div>
            <MatchTeam match={match} side="away" />
          </div>
        ) : (
          <div className="mt-7 rounded-md border border-dashed border-[#F7B500]/24 bg-black/24 p-5 text-center">
            <p className="text-sm font-black uppercase text-white">WC26 match feed syncing</p>
            <p className="mt-2 text-xs leading-5 text-white/45">Fixtures will appear here as soon as the verified feed resolves.</p>
            <Link href="/world-cup-2026" className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-[#F7B500] px-4 text-[10px] font-black uppercase tracking-wider text-black">Open WC26 hub</Link>
          </div>
        )}

        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/75">Lock your score</p>
            <span className="rounded-full border border-[#F7B500]/35 bg-[#F7B500]/8 px-2.5 py-1 text-[8px] font-black text-[#F7B500]">+50 MTC if correct</span>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <button onClick={() => setHomePick(v => (v + 1) % 6)} className="h-14 rounded-md border border-white/12 bg-black/40 text-2xl font-black text-white transition hover:border-[#F7B500]/45" aria-label="Increase home score">{homePick}</button>
            <span className="text-white/28">-</span>
            <button onClick={() => setAwayPick(v => (v + 1) % 6)} className="h-14 rounded-md border border-white/12 bg-black/40 text-2xl font-black text-white transition hover:border-[#F7B500]/45" aria-label="Increase away score">{awayPick}</button>
          </div>
          <Link href="/predictions" className="mt-3 flex h-12 items-center justify-center gap-2 rounded-md bg-[#F7B500] text-[11px] font-black uppercase tracking-wider text-black shadow-[0_10px_28px_rgba(247,181,0,.2)] transition hover:bg-[#ffc928]" aria-label="Lock in your WC26 prediction">
            <LockKeyhole className="h-4 w-4" /> Lock in prediction
          </Link>
        </div>

        <div className="mt-auto pt-5 text-center">
          <p className="text-sm font-bold text-white/78">{predictionCount > 0 ? `${predictionCount.toLocaleString()} fans have predicted` : "Be first to lock a receipt"}</p>
          {predictionCount > 0 && (
            <div className="mt-3 flex items-center justify-center -space-x-2" aria-hidden="true">
              {["B", "M", "K", "N", "J"].map((avatar) => <span key={avatar} className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#0a1014] bg-[#F7B500] text-[10px] font-black text-black">{avatar}</span>)}
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#0a1014] bg-white/10 text-[9px] font-black text-white">+{Math.max(0, predictionCount - 5).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}


function PulseCard({ debate }: { debate: any }) {
  const [vote, setVote] = useState<"left" | "right" | null>(null);
  if (!debate) {
    return (
      <article className={`${card} rounded-lg p-4`}>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <span className="rounded bg-red-500 px-1.5 py-0.5 text-white">Live</span>
          <span className="text-white">Fan pulse</span>
        </div>
        <p className="mt-4 text-sm font-bold text-white">No live debate is active in the feed yet.</p>
        <p className="mt-2 text-xs leading-5 text-white/45">As soon as the debate feed has a real WC26 topic, it will appear here.</p>
      </article>
    );
  }

  const leftVotes = Number(debate.leftVotes || 0);
  const rightVotes = Number(debate.rightVotes || 0);
  const totalVotes = Number(debate.totalVotes || leftVotes + rightVotes || 0);
  const leftPct = totalVotes > 0 ? Math.round((leftVotes / totalVotes) * 100) : 0;
  const rightPct = totalVotes > 0 ? Math.max(0, 100 - leftPct) : 0;
  const leftLabel = debate.left || "Left side";
  const rightLabel = debate.right || "Right side";
  return (
    <article className={`${card} relative overflow-hidden rounded-lg p-4`}>
      <img aria-hidden="true" loading="lazy" decoding="async" src="/bm-market-hero.png" alt="" className="absolute right-0 top-0 h-32 w-36 object-cover object-center opacity-55" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#0a1014_0%,rgba(10,16,20,.92)_60%,rgba(10,16,20,.28)_100%)]" />
      <div className="relative">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <span className="rounded bg-red-500 px-1.5 py-0.5 text-white">Live</span>
          <span className="text-white">Fan pulse</span>
          <span className="text-[#F7B500]">{totalVotes.toLocaleString()} votes</span>
        </div>
        <p className="mt-3 text-sm font-bold text-white">{debate.title || "WC26 live debate"}</p>
        <div className="mt-3 space-y-2 rounded-md border border-[#F7B500]/12 bg-[#181304]/70 p-3">
          {[
            { label: leftLabel, pct: leftPct, key: "left" as const },
            { label: rightLabel, pct: rightPct, key: "right" as const },
          ].map((item) => (
            <button key={item.key} onClick={() => setVote(item.key)} className="block w-full text-left">
              <div className="grid grid-cols-[1fr_1fr_36px] items-center gap-2 text-[10px]">
                <span className="font-bold text-white/76">{item.label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${vote === item.key ? "bg-white" : "bg-[#F7B500]"}`} style={{ width: `${item.pct}%` }} />
                </div>
                <span className="text-right text-white/62">{item.pct}%</span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-white/45">{totalVotes.toLocaleString()} live votes</span>
          <button onClick={() => setVote(vote || "left")} className="h-9 rounded-md bg-[#F7B500] px-5 text-[10px] font-black uppercase text-black">Vote now</button>
        </div>
      </div>
    </article>
  );
}


function DebateCard({ debate }: { debate: any }) {
  const [side, setSide] = useState<"left" | "right" | null>(null);
  const title = debate?.title || "Which nation has looked strongest in the WC26 knockout rounds?";
  return (
    <article className={`${card} rounded-lg p-4`}>
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="flex items-center gap-1.5 text-white"><Flame className="h-4 w-4 text-red-400" /> Hot debate</span>
        <span className="text-white/35">{debate?.totalVotes || "Live"}</span>
      </div>
      <h3 className="mt-5 min-h-[58px] text-lg font-black leading-tight text-white">{title}</h3>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={() => setSide("left")} className={`h-10 rounded-md text-xs font-black uppercase ${side === "left" ? "bg-[#F7B500] text-black" : "border border-[#F7B500]/55 text-[#F7B500]"}`}>{debate?.left || "Back it"}</button>
        <button onClick={() => setSide("right")} className={`h-10 rounded-md text-xs font-black uppercase ${side === "right" ? "bg-[#F7B500] text-black" : "border border-white/14 text-white/70"}`}>{debate?.right || "Not yet"}</button>
      </div>
      <Link href="/debates" className="mt-4 flex items-center justify-between text-[10px] font-bold text-white/38">Bring backup to your side <ArrowRight className="h-3.5 w-3.5 text-[#F7B500]" /></Link>
    </article>
  );
}


function AnalystCard({ answer }: { answer: string }) {
  return (
    <article className={`${card} relative overflow-hidden rounded-lg p-4`}>
      <img loading="lazy" decoding="async" src="/bm-mchambuzi.png" alt="Mchambuzi Halisi analyst" className="absolute bottom-0 right-0 h-full w-[48%] object-cover object-center opacity-95" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#0a1014_0%,rgba(10,16,20,.92)_56%,rgba(10,16,20,.18)_100%)]" />
      <div className="relative max-w-[56%] pr-2">
        <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white"><Sparkles className="h-4 w-4 text-[#F7B500]" /> Mchambuzi Halisi</span><span className="rounded bg-[#F7B500] px-1.5 py-0.5 text-[8px] font-black text-black">New</span></div>
        <blockquote className="mt-5 line-clamp-4 text-[0.88rem] font-semibold leading-5 text-white/84">{answer || "Mchambuzi is reading the live feeds right now."}</blockquote>
        <Link href="/mchambuzi-halisi" className="relative mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-[#F7B500] px-4 text-[10px] font-black uppercase tracking-wider text-black">Ask Mchambuzi <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
    </article>
  );
}


function LeaderboardCard({ rows }: { rows: any[] }) {
  return (
    <article className={`${card} rounded-lg p-4`}>
      <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white"><Trophy className="h-4 w-4 text-[#F7B500]" /> WC26 top callers</h3><Link href="/leaderboard" className="text-[9px] font-black uppercase text-[#F7B500]">Full table</Link></div>
      <div className="mt-3 space-y-1">
        {rows.length ? rows.slice(0, 5).map((row, i) => (
          <div key={`${row.name}-${i}`} className={`grid grid-cols-[24px_1fr_auto] items-center gap-2 rounded-md px-2 py-2 text-xs ${i === 0 ? "border border-[#F7B500]/55 bg-[#F7B500]/6" : "border border-transparent border-b-white/6"}`}>
            <span className="font-black text-[#F7B500]">{row.rank || i + 1}</span><span className="truncate font-bold text-white/76">{row.name || "Mtaani fan"}</span><span className="font-black tabular-nums text-white/58">{Number(row.pts || 0).toLocaleString()}</span>
          </div>
        )) : <div className="flex min-h-[150px] items-center justify-center text-center text-xs text-white/38">The live WC26 leaderboard is warming up.</div>}
      </div>
    </article>
  );
}

function cleanArticleText(value?: string): string {
  if (!value) return "";
  if (typeof DOMParser === "undefined") return value;
  const parsed = new DOMParser().parseFromString(value, "text/html");
  return (parsed.body.textContent || "").replace(/\s+/g, " ").trim();
}

function articleReadTime(article: NewsArticle): number {
  const words = `${article.title} ${cleanArticleText(article.description)}`.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function LatestNewsGrid({ articles, loading }: { articles: NewsArticle[]; loading: boolean }) {
  const latest = articles.slice(0, 6);

  return (
    <section className="border-t border-white/8 bg-[#060a0d] py-9 lg:py-11" aria-labelledby="latest-football-fire">
      <div className="mx-auto max-w-[1800px] px-4 md:px-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#F7B500]">Mtaa Daily</p>
            <h2 id="latest-football-fire" className="mt-1 text-2xl font-black uppercase text-white">Latest football fire</h2>
            <p className="mt-1 text-sm text-[#A5B0B8]">Fresh stories from the football world.</p>
          </div>
          <Link href="/news" className="inline-flex h-10 items-center gap-2 rounded-md border border-[#F7B500]/45 px-4 text-[10px] font-black uppercase tracking-widest text-[#F7B500] transition hover:border-[#F7B500] hover:bg-[#F7B500]/8">
            View all news <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading && Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[310px] animate-pulse rounded-lg border border-white/8 bg-white/5" />)}
          {!loading && latest.map((article) => {
            const href = article.isInternal && article.slug ? `/article/${article.slug}` : article.link;
            const excerpt = cleanArticleText(article.description);
            const category = article.isWC26 ? "World Cup" : article.source || "Football";
            const content = (
              <>
                <div className="relative h-40 overflow-hidden bg-[#101820]">
                  <img src={article.thumbnail} loading="lazy" decoding="async" alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1116] via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded bg-[#F7B500] px-2 py-1 text-[8px] font-black uppercase text-black">{category}</span>
                </div>
                <div className="flex min-h-[168px] flex-col p-4">
                  <h3 className="line-clamp-2 text-base font-black leading-snug text-white">{article.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#A5B0B8]">{excerpt || "Open the story for the latest football update and fan reaction."}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/35">{timeAgo(article.pubDate)} | {articleReadTime(article)} min read</span>
                    <span className="rounded-md border border-[#F7B500]/55 px-3 py-2 text-[9px] font-black uppercase text-[#F7B500] transition group-hover:bg-[#F7B500] group-hover:text-black">Read & React</span>
                  </div>
                </div>
              </>
            );

            const className = "group overflow-hidden rounded-lg border border-white/[0.08] bg-[#0B1116] shadow-[0_18px_40px_rgba(0,0,0,.22)] transition duration-300 hover:-translate-y-0.5 hover:border-[#F7B500]/70 hover:shadow-[0_20px_50px_rgba(0,0,0,.35),0_0_22px_rgba(247,181,0,.1)]";
            return article.isInternal && article.slug ? (
              <Link key={article.id} href={href} className={className}>{content}</Link>
            ) : (
              <a key={article.id} href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
            );
          })}
        </div>

        {!loading && latest.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/12 bg-[#0B1116] px-6 py-12 text-center">
            <p className="text-sm font-black uppercase text-white">Latest stories are syncing</p>
            <p className="mt-2 text-xs text-white/45">The homepage only publishes verified feed items. Visit the news archive while the feed refreshes.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function MarketHomePage() {
  const { user, coins } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: liveMatches = [] } = useMatches();
  const { data: upcoming = [] } = useUpcomingFixtures();
  const { data: recent = [] } = useRecentMatches();
  const { data: debates = [] } = useDebates();
  const { data: leaderboard = [] } = useLeaderboard();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [mchambuziAnswer, setMchambuziAnswer] = useState("");
  const [predictionCount, setPredictionCount] = useState(0);

  useEffect(() => {
    Promise.all([fetchPartnerArticles(), fetchFootballNews({ network: true, fallback: false })]).then(([partner, feed]) => {
      const seen = new Set<string>();
      const combined = [...partner, ...feed].filter(item => !seen.has(item.id) && seen.add(item.id));
      setNews(combined.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()).slice(0, 6));
    }).finally(() => setNewsLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    askMchambuziHalisi("Give the current WC26 read in one short paragraph.", { live: liveMatches, upcoming, recent })
      .then(({ answer }) => {
        if (!cancelled) setMchambuziAnswer(answer);
      })
      .catch(() => {
        if (!cancelled) setMchambuziAnswer("");
      });

    return () => {
      cancelled = true;
    };
  }, [liveMatches, upcoming, recent]);


  // Match of the Day — WC26 takes priority over everything else
  const featuredMatch =
    liveMatches.find(isWCMatch) ||
    upcoming.find(isWCMatch) ||
    liveMatches[0] ||
    upcoming[0] ||
    recent.find(isWCMatch) ||
    recent[0] ||
    null;
  const isLive = liveMatches.length > 0 && liveMatches.includes(featuredMatch);
  const roundLabel = featuredMatch && isWCMatch(featuredMatch) ? wc26RoundLabel(featuredMatch.kickoffAt) : wc26RoundLabel();

  useEffect(() => {
    let cancelled = false;
    const matchId = featuredMatch?.id ? String(featuredMatch.id) : "";
    if (!supabase || !matchId) {
      setPredictionCount(0);
      return;
    }

    supabase
      .from("predictions")
      .select("id", { count: "exact", head: true })
      .eq("match_id", matchId)
      .then(({ count, error }) => {
        if (!cancelled) setPredictionCount(error ? 0 : count || 0);
      });

    return () => {
      cancelled = true;
    };
  }, [featuredMatch?.id]);

  const activityDebate = debates[0];
  const leftBacking = Number(activityDebate?.leftVotes || 0);
  const rightBacking = Number(activityDebate?.rightVotes || 0);
  const leftBackingLabel = activityDebate?.left || featuredMatch?.home || "the home side";
  const rightBackingLabel = activityDebate?.right || featuredMatch?.away || "the away side";
  
  const statItems = useMemo(() => [
    { icon: Users, value: Number(profile?.points || coins || 0).toLocaleString(), label: "MTC balance" },
    { icon: ReceiptText, value: upcoming.length.toString(), label: "Upcoming fixtures" },
    { icon: MessageCircle, value: debates.length.toString(), label: "Live debates" },
    { icon: Radio, value: String(liveMatches.length + recent.length), label: "Live + recent" },
  ], [profile?.points, coins, upcoming.length, debates.length, liveMatches.length, recent.length]);


  return (
    <main className="min-h-screen bg-[#05080a] text-white">
      <SEO title="BallMtaani | World Cup 2026 Fan Command Center" description="Live World Cup 2026 scores, predictions, debates, news and fan rewards for Kenya's football community." path="/home" />

      {/* ── Mtaa Wire — breaking headlines, refreshes with every publish ── */}
      <BreakingTicker items={news.slice(0, 5)} />

      <section className="relative overflow-hidden border-b border-white/8 bg-[#030607]">
        <img fetchPriority="high" loading="eager" decoding="async" src="/bm-market-hero.png" alt="BallMtaani football fan celebrating on matchday" className="absolute inset-0 h-full w-full object-cover object-[58%_center] opacity-95" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#030607_0%,rgba(3,6,7,.94)_23%,rgba(3,6,7,.2)_42%,rgba(3,6,7,.08)_64%,rgba(3,6,7,.82)_80%,#030607_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,6,7,.06)_0%,rgba(3,6,7,.18)_52%,#030607_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_42%,rgba(247,181,0,.2),transparent_36%)]" />

        <div className="relative mx-auto max-w-[1800px] px-4 py-6 md:px-7 lg:py-8">
          <div className="grid gap-6 lg:min-h-[560px] lg:grid-cols-[minmax(500px,.95fr)_minmax(300px,.7fr)_minmax(350px,.72fr)] lg:items-center">
            <div className="relative z-10 flex max-w-[670px] flex-col justify-center py-4 lg:py-8">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-md border border-white/12 bg-black/50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/86"><span>KE</span> Kenya's home of football fans</div>
                {roundLabel && (
                  <Link href="/world-cup-2026" className="inline-flex w-fit items-center gap-2 rounded-md border border-[#F7B500]/45 bg-[#F7B500]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#F7B500]">
                    <Trophy className="h-3.5 w-3.5" /> WC26 | {roundLabel}
                  </Link>
                )}
              </div>
              <h1 className="mt-6 max-w-[760px] text-[clamp(3.1rem,4.55vw,5.5rem)] font-black uppercase leading-[0.88] tracking-[0] text-white drop-shadow-[0_10px_28px_rgba(0,0,0,.6)]">We predict.<br />We debate.<br /><span className="text-[#F7B500]">We keep receipts.</span></h1>
              <p className="mt-5 max-w-[36rem] text-base leading-7 text-white/82 lg:text-lg">Make the call before kickoff. Back your side, rep your tribe, and keep the receipt when the final whistle lands.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/predictions" className="inline-flex h-[52px] min-w-[16rem] items-center justify-center gap-2 rounded-md bg-[#F7B500] px-6 text-xs font-black uppercase tracking-wider text-black shadow-[0_12px_32px_rgba(247,181,0,.24)] transition hover:bg-[#FFC928]"><Target className="h-4 w-4" /> Lock your prediction</Link>
                <Link href="/fan-zones" className="inline-flex h-[52px] min-w-[12.5rem] items-center justify-center gap-2 rounded-md border border-[#F7B500]/65 bg-black/50 px-5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#F7B500]/10"><Users className="h-4 w-4" /> Join your tribe</Link>
              </div>
              <div className="mt-7 grid max-w-[670px] grid-cols-2 gap-3 sm:grid-cols-4">
                {statItems.map(({ icon: Icon, value, label }) => <div key={label} className="flex items-center gap-2"><Icon className="h-5 w-5 shrink-0 text-[#F7B500]" /><div><div className="text-sm font-black text-white">{value}</div><div className="text-[9px] text-white/44">{label}</div></div></div>)}
              </div>
            </div>

            <div aria-hidden="true" className="hidden min-h-[520px] lg:block" />
            <MatchPanel match={featuredMatch} isLive={isLive} predictionCount={predictionCount} roundLabel={roundLabel} />
          </div>

          <div className="mx-auto mt-1 grid max-w-[940px] overflow-hidden rounded-lg border border-[#F7B500]/38 bg-[#070b0d]/92 shadow-[0_0_28px_rgba(247,181,0,.1)] backdrop-blur-xl md:grid-cols-3">
            <div className="flex min-h-14 items-center justify-center gap-3 border-b border-white/8 px-5 py-3 md:border-b-0 md:border-r">
              <Flame className="h-5 w-5 text-[#F7B500]" />
              <div><p className="text-sm font-black text-white">{leftBacking > 0 ? leftBacking.toLocaleString() : "Live"}</p><p className="text-[10px] text-white/55">fans backing {leftBackingLabel}</p></div>
            </div>
            <div className="flex min-h-14 items-center justify-center gap-3 border-b border-white/8 px-5 py-3 md:border-b-0 md:border-r">
              <Swords className="h-5 w-5 text-[#F7B500]" />
              <div><p className="text-sm font-black text-white">{rightBacking > 0 ? rightBacking.toLocaleString() : "Live"}</p><p className="text-[10px] text-white/55">fans backing {rightBackingLabel}</p></div>
            </div>
            <div className="flex min-h-14 items-center justify-center gap-3 px-5 py-3">
              <ReceiptText className="h-5 w-5 text-[#F7B500]" />
              <div><p className="text-sm font-black text-white">Receipts drop</p><p className="text-[10px] text-white/55">after full-time</p></div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <PulseCard debate={debates[0]} />
            <DebateCard debate={debates[0]} />
            <AnalystCard answer={mchambuziAnswer} />
            <LeaderboardCard rows={leaderboard} />
          </div>
        </div>
      </section>

      <LatestNewsGrid articles={news} loading={newsLoading} />

      <MatchdayDataHub />

      <section className="border-t border-white/8 bg-[#05080a] py-5" aria-label="MTC daily rewards">
        <div className="mx-auto max-w-[1800px] px-4 md:px-7">
          <div className="grid gap-4 rounded-lg border border-[#F7B500]/35 bg-[#0B1116]/95 p-4 shadow-[0_0_30px_rgba(247,181,0,.08)] md:grid-cols-[1.2fr_3fr_auto] md:items-center">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-[#F7B500]/12 shadow-[0_0_18px_rgba(247,181,0,.1)]"><Gift className="h-7 w-7 text-[#F7B500]" /></div>
              <div><h2 className="text-base font-black uppercase text-white">Earn MTC daily!</h2><p className="text-[10px] text-white/40">Predict. Debate. Share. Win.</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[{ icon: BellRing, label: "Daily login", value: "+10" }, { icon: Target, label: "Correct prediction", value: "+50" }, { icon: Users, label: "Join debate", value: "+20" }, { icon: ShieldCheck, label: "Share receipt", value: "+30" }].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex min-h-12 items-center gap-2 border-l border-white/8 px-3"><Icon className="h-5 w-5 shrink-0 text-[#F7B500]" /><div><p className="text-[9px] text-white/46">{label}</p><p className="text-xs font-black text-[#F7B500]">{value} MTC</p></div></div>
              ))}
            </div>
            <Link href="/store" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#F7B500] px-5 text-[10px] font-black uppercase tracking-wider text-[#F7B500] shadow-[0_0_22px_rgba(247,181,0,.12)] transition hover:bg-[#F7B500] hover:text-black"><Coins className="h-4 w-4" /> See all rewards</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1800px] px-4 py-4 md:px-7"><SponsorSlot placement="homepage-hero" /></div>
    </main>
  );
}


