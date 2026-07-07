import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Coins,
  Flame,
  Gift,
  LockKeyhole,
  MessageCircle,
  Radio,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import SEO from "../components/SEO";
import SponsorSlot from "../components/SponsorSlot";
import TeamLogo from "../components/TeamLogo";
import { useAuth } from "../context/AuthContext";
import { useDebates, useLeaderboard, useMatches, useProfile, useRecentMatches, useUpcomingFixtures } from "../hooks/useData";
import { fetchFootballNews, fetchPartnerArticles, timeAgo, type NewsArticle } from "../lib/news-api";
import { askMchambuziHalisi } from "../lib/mchambuzi-halisi";


const card = "border border-white/[0.09] bg-[#0a1014]/95 shadow-[0_18px_50px_rgba(0,0,0,0.28)]";

function MatchTeam({ match, side }: { match: any; side: "home" | "away" }) {
  const name = match?.[side] || (side === "home" ? "Home" : "Away");
  const logo = match?.[`${side}Logo`];
  return (
    <div className="min-w-0 text-center">
      <TeamLogo logo={logo} initial={String(name).slice(0, 1)} color="#182333" size="lg" />
      <p className="mt-2 truncate text-xs font-black text-white">{name}</p>
    </div>
  );
}function PhoneClubMark({ logo, name, fallback, color, accent }: { logo?: string; name: string; fallback: string; color: string; accent: string }) {
  if (logo) {
    return (
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white p-1.5 shadow-[0_0_24px_rgba(255,255,255,.14)]">
        <img src={logo} alt={name} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto grid h-12 w-12 place-items-center overflow-hidden border border-white/25 shadow-[0_0_24px_rgba(255,255,255,.12)]"
      style={{ background: `linear-gradient(145deg, ${color}, #070b10 78%)`, clipPath: "polygon(50% 0%, 92% 16%, 86% 76%, 50% 100%, 14% 76%, 8% 16%)" }}
      aria-label={name}
    >
      <div className="absolute inset-1 border border-white/18" style={{ clipPath: "polygon(50% 0%, 92% 16%, 86% 76%, 50% 100%, 14% 76%, 8% 16%)" }} />
      <div className="absolute -right-4 top-1 h-12 w-12 rounded-full opacity-70 blur-md" style={{ backgroundColor: accent }} />
      <div className="absolute inset-x-2 top-2 h-1 rounded-full bg-white/50" />
      <span className="relative text-[13px] font-black tracking-tight text-white drop-shadow-[0_2px_5px_rgba(0,0,0,.8)]">{fallback}</span>
      <div className="absolute bottom-2 h-1.5 w-5 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  );
}

function MatchPanel({ match, isLive, fanCount }: { match: any; isLive: boolean; fanCount: number }) {
  const [homePick, setHomePick] = useState(1);
  const [awayPick, setAwayPick] = useState(0);
  const hasScore = match?.homeScore !== undefined && match?.awayScore !== undefined;
  const hasMatch = Boolean(match);
  return (
    <aside className={`${card} flex h-full flex-col rounded-lg p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/42">{isLive ? "Live at WC26" : "Next big match"}</p>
          <h2 className="mt-1 text-sm font-black uppercase text-white">{match?.league || "World Cup 2026"}</h2>
        </div>
        <Link href="/matches" className="text-[10px] font-black uppercase tracking-wider text-[#F7B500]">View all</Link>
      </div>

      {hasMatch ? (
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <MatchTeam match={match} side="home" />
          <div className="text-center">
            {isLive || hasScore ? (
              <div className="text-2xl font-black text-white">{match?.homeScore ?? 0}<span className="mx-2 text-white/24">-</span>{match?.awayScore ?? 0}</div>
            ) : (
              <div className="text-sm font-black text-white/38">VS</div>
            )}
            <div className={`mt-1 text-[9px] font-black uppercase tracking-widest ${isLive ? "text-red-400" : "text-white/36"}`}>
              {isLive ? match?.minute || "Live" : match?.date || "Upcoming"}
            </div>
          </div>
          <MatchTeam match={match} side="away" />
        </div>
      ) : (
        <div className="mt-5 rounded-md border border-dashed border-[#F7B500]/24 bg-black/24 p-5 text-center">
          <p className="text-sm font-black uppercase text-white">WC26 match feed syncing</p>
          <p className="mt-2 text-xs leading-5 text-white/45">Open the tournament hub for fixtures, live cards, tables and verified updates as the feed refreshes.</p>
          <Link href="/world-cup-2026" className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-[#F7B500] px-4 text-[10px] font-black uppercase tracking-wider text-black">Open WC26 hub</Link>
        </div>
      )}

      <div className="mt-5 border-t border-white/8 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Lock your prediction</p>
          <span className="rounded-full border border-[#F7B500]/24 px-2 py-1 text-[8px] font-black text-[#F7B500]">+50 MTC</span>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button onClick={() => setHomePick(v => (v + 1) % 6)} className="h-12 rounded-md border border-white/10 bg-black/35 text-xl font-black text-white">{homePick}</button>
          <span className="text-white/28">-</span>
          <button onClick={() => setAwayPick(v => (v + 1) % 6)} className="h-12 rounded-md border border-white/10 bg-black/35 text-xl font-black text-white">{awayPick}</button>
        </div>
        <Link href="/predictions" className="mt-3 flex h-11 items-center justify-center gap-2 rounded-md bg-[#F7B500] text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-[#ffc928]">
          <LockKeyhole className="h-4 w-4" /> Lock in prediction
        </Link>
      </div>

      <div className="mt-auto pt-4 text-center">
        <p className="text-sm font-bold text-white/78">{fanCount ? `${fanCount.toLocaleString()} fans on the board` : "Live fan count not available"}</p>
        <div className="mt-3 flex items-center justify-center -space-x-2">
          {["P", "J", "M", "A", "K", "S"].map((avatar) => <span key={avatar} className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#0a1014] bg-[#F7B500] text-[10px] font-black text-black">{avatar}</span>)}
          <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#0a1014] bg-white/10 text-[10px] font-black text-white">+99</span>
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
      <img src="/bm-market-hero.png" alt="" className="absolute right-0 top-0 h-32 w-36 object-cover object-center opacity-55" />
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
      <img src="/bm-mchambuzi.png" alt="Mchambuzi Halisi analyst" className="absolute bottom-0 right-0 h-full w-[48%] object-cover object-center opacity-95" />
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

function NewsCarousel({ articles, loading }: { articles: NewsArticle[]; loading: boolean }) {
  const rail = useRef<HTMLDivElement>(null);
  const move = (direction: number) => rail.current?.scrollBy({ left: direction * 360, behavior: "smooth" });
  return (
    <section className="border-t border-white/8 bg-[#060a0d] py-8">
      <div className="mx-auto max-w-[1800px] px-4 md:px-7">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#F7B500]">Mtaa Daily</p><h2 className="mt-1 text-xl font-black uppercase text-white">Latest WC26 and football news</h2></div>
          <div className="flex gap-2"><button onClick={() => move(-1)} title="Previous stories" className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-white/60 hover:border-[#F7B500]/40 hover:text-[#F7B500]"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => move(1)} title="Next stories" className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-white/60 hover:border-[#F7B500]/40 hover:text-[#F7B500]"><ChevronRight className="h-4 w-4" /></button></div>
        </div>
        <div ref={rail} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-56 min-w-[290px] animate-pulse rounded-lg bg-white/5" />) : articles.slice(0, 10).map(article => {
            const href = article.isInternal ? `/article/${article.slug}` : article.link;
            const body = <><div className="relative h-32 overflow-hidden"><img src={article.thumbnail} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#080d10] to-transparent" /><span className="absolute bottom-2 left-2 rounded bg-[#F7B500] px-2 py-0.5 text-[8px] font-black uppercase text-black">{article.isWC26 ? "WC26" : article.source}</span></div><div className="p-3"><h3 className="line-clamp-2 text-sm font-black leading-snug text-white">{article.title}</h3><p className="mt-2 text-[9px] uppercase tracking-wider text-white/34">{timeAgo(article.pubDate)}</p></div></>;
            return article.isInternal ? <Link key={article.id} href={href} className={`${card} group min-w-[290px] max-w-[290px] snap-start overflow-hidden rounded-lg`}>{body}</Link> : <a key={article.id} href={href} target="_blank" rel="noopener noreferrer" className={`${card} group min-w-[290px] max-w-[290px] snap-start overflow-hidden rounded-lg`}>{body}</a>;
          })}
        </div>
        <Link href="/news" className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F7B500]">All news <ArrowRight className="h-3.5 w-3.5" /></Link>
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

  useEffect(() => {
    Promise.all([fetchPartnerArticles(), fetchFootballNews({ network: true, fallback: false })]).then(([partner, feed]) => {
      const seen = new Set<string>();
      const combined = [...partner, ...feed].filter(item => !seen.has(item.id) && seen.add(item.id));
      setNews(combined.sort((a, b) => Number(Boolean(b.isWC26)) - Number(Boolean(a.isWC26))));
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


  const featuredMatch = liveMatches[0] || upcoming[0] || recent[0] || null;
  const isLive = liveMatches.length > 0;
  
  const statItems = useMemo(() => [
    { icon: Users, value: Number(profile?.points || coins || 0).toLocaleString(), label: "MTC balance" },
    { icon: ReceiptText, value: upcoming.length.toString(), label: "Upcoming fixtures" },
    { icon: MessageCircle, value: debates.length.toString(), label: "Live debates" },
    { icon: Radio, value: String(liveMatches.length + recent.length), label: "Live + recent" },
  ], [profile?.points, coins, upcoming.length, debates.length, liveMatches.length, recent.length]);


  return (
    <main className="min-h-screen bg-[#05080a] text-white">
      <SEO title="BallMtaani | World Cup 2026 Fan Command Center" description="Live World Cup 2026 scores, predictions, debates, news and fan rewards for Kenya's football community." path="/home" />

      <section className="relative overflow-hidden border-b border-white/8 bg-[#030607]">
        <img src="/bm-market-hero.png" alt="BallMtaani World Cup fan and live match phone" className="absolute inset-0 h-full w-full object-cover object-center opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#030607_0%,rgba(3,6,7,.78)_25%,rgba(3,6,7,.22)_50%,rgba(3,6,7,.78)_75%,#030607_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,6,7,.08)_0%,rgba(3,6,7,.38)_64%,#030607_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_42%,rgba(247,181,0,.16),transparent_34%)]" />
        <div className="relative mx-auto max-w-[1800px] px-4 py-5 md:px-7 lg:py-6">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr_1fr] lg:items-stretch">
            <div className="flex flex-col justify-center py-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-md border border-white/12 bg-black/45 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/86"><span>KE</span> Kenya's home of football fans</div>
              <h1 className="mt-5 text-[clamp(2.8rem,4.2vw,5.5rem)] font-black uppercase leading-[0.9] tracking-[0] text-white">We predict.<br />We debate.<br /><span className="text-[#F7B500]">We keep receipts.</span></h1>
              <p className="mt-5 max-w-[34rem] text-[1.05rem] leading-7 text-white/86">Join thousands of fans making bold calls, backing their teams and earning MTC for being on point.</p>
              <div className="mt-5 flex flex-wrap gap-3"><Link href="/predictions" className="inline-flex h-12 min-w-[15.5rem] items-center justify-center gap-2 rounded-md bg-[#F7B500] px-5 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_22px_rgba(247,181,0,.18)]"><Target className="h-4 w-4" /> Make your prediction</Link><Link href="/fan-zones" className="inline-flex h-12 min-w-[12.5rem] items-center justify-center gap-2 rounded-md border border-[#F7B500]/65 bg-black/45 px-5 text-xs font-black uppercase tracking-wider text-white"><Users className="h-4 w-4" /> Join your tribe</Link></div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{statItems.map(({ icon: Icon, value, label }) => <div key={label} className="flex items-center gap-2"><Icon className="h-5 w-5 shrink-0 text-[#F7B500]" /><div><div className="text-xs font-black text-white">{value}</div><div className="text-[9px] text-white/40">{label}</div></div></div>)}</div>
            </div>

            
<div className="relative hidden min-h-[510px] lg:block">
              <div className="absolute bottom-4 left-1/2 h-[92%] w-[78%] -translate-x-1/2 rounded-full bg-[#F7B500]/10 blur-3xl" />
              <div className="absolute bottom-5 right-0 w-[60%] rotate-[6deg] rounded-[36px] border-[6px] border-[#1e252b] bg-[#04080b] p-3 shadow-[0_28px_70px_rgba(0,0,0,.8),0_0_42px_rgba(247,181,0,.14)]">
                <div className="pointer-events-none absolute -inset-3 rounded-[42px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,.2),transparent_22%),linear-gradient(120deg,transparent_8%,rgba(247,181,0,.16)_43%,transparent_56%)] opacity-70" />
                <div className="relative overflow-hidden rounded-[25px] border border-white/10 bg-[#071015] p-4 shadow-inner">
                  <img src="/bm-market-hero.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-[.12] blur-[1px]" />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.16)_0%,transparent_28%,rgba(247,181,0,.08)_54%,transparent_68%)]" />
                  <div className="absolute -right-10 -top-8 h-28 w-28 rounded-full bg-[#F7B500]/16 blur-2xl" />
                  <div className="relative mx-auto mb-3 h-4 w-20 rounded-full bg-black/80 ring-1 ring-white/8" />
                  {featuredMatch ? (
                    <>
                      <div className="relative flex items-center justify-between text-[9px] font-black uppercase text-white/62">
                        <span>{isLive ? "Live Match" : "Upcoming Match"}</span>
                        <span className="rounded bg-red-500 px-1.5 py-0.5 text-white shadow-[0_0_14px_rgba(239,68,68,.45)]">{isLive ? "Live" : "WC26"}</span>
                        <span className="text-[#F7B500]">{featuredMatch.minute || featuredMatch.date || featuredMatch.time || "WC26"}</span>
                      </div>
                      <div className="relative mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <div className="text-center">
                          <PhoneClubMark logo={featuredMatch.homeLogo} name={featuredMatch.home} fallback={String(featuredMatch.home || "").slice(0, 3).toUpperCase() || "H"} color="#8b1118" accent="#f6d04d" />
                          <p className="mt-1 truncate text-[9px] font-bold text-white/76">{featuredMatch.home}</p>
                        </div>
                        <div className="text-2xl font-black text-white drop-shadow-[0_2px_14px_rgba(255,255,255,.22)]">{featuredMatch.homeScore !== undefined && featuredMatch.awayScore !== undefined ? `${featuredMatch.homeScore} - ${featuredMatch.awayScore}` : "VS"}</div>
                        <div className="text-center">
                          <PhoneClubMark logo={featuredMatch.awayLogo} name={featuredMatch.away} fallback={String(featuredMatch.away || "").slice(0, 3).toUpperCase() || "A"} color="#123f92" accent="#ffffff" />
                          <p className="mt-1 truncate text-[9px] font-bold text-white/76">{featuredMatch.away}</p>
                        </div>
                      </div>
                      <div className="relative mt-4 flex gap-4 border-b border-white/8 pb-2 text-[8px] font-bold text-white/42"><span className="text-[#F7B500]">{featuredMatch.status || "Feed"}</span><span>{featuredMatch.league || "WC26"}</span><span>Venue</span><span>Updates</span></div>
                      <div className="relative mt-3 space-y-2 text-[8px] text-white/62">
                        <p className="rounded-md border border-white/5 bg-white/[.055] p-2"><span className="font-black text-[#F7B500]">Status</span> {featuredMatch.status || featuredMatch.date || "Live feed syncing"}</p>
                        {featuredMatch.scorers ? <p className="rounded-md border border-white/5 bg-white/[.055] p-2"><span className="font-black text-[#F7B500]">Scorers</span> {featuredMatch.scorers}</p> : null}
                        {featuredMatch.venue ? <p className="rounded-md border border-white/5 bg-white/[.055] p-2"><span className="font-black text-[#F7B500]">Venue</span> {featuredMatch.venue}</p> : null}
                      </div>
                      <div className="relative mt-4 rounded-md border border-white/8 bg-white/[.06] p-3"><div className="flex justify-between text-[8px] text-white/65"><span>{featuredMatch.home || "Home"}</span><span>{featuredMatch.away || "Away"}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-blue-600"><div className="h-full w-[64%] bg-red-600" /></div></div>
                    </>
                  ) : (
                    <div className="relative mt-6 rounded-[25px] border border-dashed border-white/12 bg-black/35 p-6 text-center">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-white">WC26 feed syncing</p>
                      <p className="mt-3 text-[10px] leading-5 text-white/48">Real match data will appear here once the live or upcoming feed resolves.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <MatchPanel match={featuredMatch} isLive={isLive} fanCount={leaderboard.length} />

          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><PulseCard debate={debates[0]} /><DebateCard debate={debates[0]} /><AnalystCard answer={mchambuziAnswer} /><LeaderboardCard rows={leaderboard} /></div>

          <div className="mt-4 grid gap-4 rounded-lg border border-[#F7B500]/30 bg-[#0b0e0c]/95 p-4 md:grid-cols-[1.25fr_3fr_auto] md:items-center">
            <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-md bg-[#F7B500]/12"><Gift className="h-6 w-6 text-[#F7B500]" /></div><div><h2 className="text-sm font-black uppercase text-white">Earn MTC daily</h2><p className="text-[10px] text-white/40">Predict. Debate. Share. Win.</p></div></div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[{ icon: BellRing, label: "Daily login", value: "+10" },{ icon: Target, label: "Correct call", value: "+50" },{ icon: Users, label: "Join debate", value: "+20" },{ icon: ShieldCheck, label: "Share receipt", value: "+30" }].map(({ icon: Icon, label, value }) => <div key={label} className="flex items-center gap-2 border-l border-white/8 px-3"><Icon className="h-4 w-4 text-[#F7B500]" /><div><p className="text-[9px] text-white/46">{label}</p><p className="text-xs font-black text-[#F7B500]">{value} MTC</p></div></div>)}</div>
            <Link href="/store" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#F7B500] px-5 text-[10px] font-black uppercase tracking-wider text-[#F7B500] shadow-[0_0_22px_rgba(247,181,0,.14)]"><Coins className="h-4 w-4" /> {Number(profile?.points || coins || 0).toLocaleString()} MTC</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1800px] px-4 py-4 md:px-7"><SponsorSlot placement="homepage-hero" /></div>
      <NewsCarousel articles={news} loading={newsLoading} />
    </main>
  );
}
