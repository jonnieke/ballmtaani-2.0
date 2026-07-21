import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight, BellRing, CalendarDays, ChevronRight, Coins, Flame,
  MessageSquare, Radio, Shirt, Sparkles, Smartphone, Trophy, Users, Wifi, Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDebates, useLeaderboard, useMatches, useRecentMatches, useUpcomingFixtures } from "../hooks/useData";
import { fetchTodaysFixtures } from "../lib/football-api";
import { fetchFootballNews, fetchPartnerArticles, timeAgo, type NewsArticle } from "../lib/news-api";
import {
  getCountdownParts, getHomepageMode, LEAGUE_SHORTCUTS, MODE_COPY,
  PREMIER_LEAGUE_OPENING_FIXTURES, PREMIER_LEAGUE_OPENING_KICKOFF,
  selectFeaturedMatch, type HomepageMatch, type HomepageMode,
} from "../lib/home-season";
import DeferredSection from "../components/DeferredSection";
import FloatingMchambuzi from "../components/FloatingMchambuzi";
import GoogleSignInButton from "../components/GoogleSignInButton";
import HeroTicker from "../components/HeroTicker";
import NotificationBell from "../components/NotificationBell";
import SEO from "../components/SEO";
import TeamLogo from "../components/TeamLogo";

const TITLE = "BallMtaani: Live Football Scores, Fixtures & Fan Predictions Kenya";
const DESCRIPTION = "Follow Premier League, Champions League, European and Kenyan football with live scores, fixtures, tables, predictions, fan debates and Mchambuzi AI analysis.";
const HERO_IMAGE = "/images/hero_player_celebration.png";
const ANALYST_IMAGE = "/images/analyst_chalkboard.png";
const FANS_IMAGE = "/images/kenyan_fans.png";
const LIVE_STATUSES = new Set(["1H", "2H", "HT", "ET", "P", "BT", "LIVE"]);
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black";

function kickoffLabel(match: HomepageMatch) {
  const kickoff = Number(match.kickoffAt || match.timestamp || 0);
  if (!kickoff) return String(match.time || match.date || "Kickoff TBC");
  return new Date(kickoff).toLocaleString("en-KE", {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    hour12: true, timeZone: "Africa/Nairobi",
  }) + " EAT";
}

function dedupeNews(articles: NewsArticle[]) {
  const unique = new Map<string, NewsArticle>();
  articles.forEach((article) => {
    const key = [article.slug, article.link, article.title].filter(Boolean).join("|").toLowerCase();
    if (!unique.has(key)) unique.set(key, article);
  });
  return [...unique.values()].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

function isKenyanStory(article: NewsArticle) {
  const text = (article.title + " " + (article.description || "")).toLowerCase();
  return ["kenya", "kenyan", "harambee", "fkf", "gor mahia", "afc leopards", "tusker", "shabana", "caf"].some((word) => text.includes(word));
}

function mchambuziTake(match: HomepageMatch | undefined, mode: HomepageMode, headline?: string) {
  const signature = JSON.stringify({ match: match ? [match.id, match.homeScore, match.awayScore, match.status] : null, mode, headline });
  try {
    const cached = JSON.parse(sessionStorage.getItem("ballmtaani:homepage-take") || "null");
    if (cached?.signature === signature && Date.now() - cached.savedAt < 900_000) return cached.text as string;
  } catch { /* optional cache */ }

  let text = "Pre-season noise is cheap. The useful question is which squads are ready to turn August promises into points.";
  if (mode === "matchday" && match) {
    const score = typeof match.homeScore === "number" && typeof match.awayScore === "number" ? " at " + match.homeScore + "-" + match.awayScore : "";
    text = match.home + " against " + match.away + score + " is the room to watch. Follow the tempo before trusting the loudest timeline take.";
  } else if (match) {
    text = match.home + " versus " + match.away + " is the next receipt. Check the squad news, make the call, then come back after full time.";
  } else if (headline) {
    text = "The football week is being shaped by this story: " + headline + ". Read the details before the group chat turns rumour into fact.";
  }
  try { sessionStorage.setItem("ballmtaani:homepage-take", JSON.stringify({ signature, savedAt: Date.now(), text })); } catch { /* optional cache */ }
  return text;
}

function Heading({ eyebrow, title, copy, href, action }: { eyebrow: string; title: string; copy?: string; href?: string; action?: string }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]/70">{eyebrow}</p>
        <h2 className="text-2xl font-black leading-tight text-white md:text-3xl">{title}</h2>
        {copy && <p className="mt-2 max-w-2xl text-sm leading-6 text-white/48">{copy}</p>}
      </div>
      {href && action && <Link href={href} className={"inline-flex self-start items-center gap-1 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/65 hover:text-white " + FOCUS}>{action}<ChevronRight className="h-3.5 w-3.5" /></Link>}
    </div>
  );
}

function shortTeamName(name: string): string {
  // Strip common suffixes to keep it short and clean
  return name
    .replace(/\s+(Football Club|FC|SC|AFC|City|United|Rovers|Athletic|Town|Rangers?|Lions?|Stars?)$/i, "")
    .trim();
}

function Team({ match, side, size = "md" }: { match: HomepageMatch; side: "home" | "away"; size?: "md" | "xl" }) {
  const name = String(match[side]);
  const logoSize = size === "md" ? "sm" : size;
  return (
    <div className="flex flex-1 min-w-0 flex-col items-center gap-1 text-center">
      <TeamLogo logo={side === "home" ? match.homeLogo : match.awayLogo} initial={String((side === "home" ? match.homeInitial : match.awayInitial) || name.slice(0, 3)).toUpperCase()} color="#182333" size={logoSize} shadow={size === "xl"} />
      <span className="text-[8px] font-semibold text-white/85 uppercase tracking-wide leading-tight break-words w-full">{name}</span>
    </div>
  );
}

function MatchCard({ match, live }: { match: HomepageMatch; live: boolean }) {
  const scored = typeof match.homeScore === "number" && typeof match.awayScore === "number";
  return (
    <Link href={live ? "/live-center/" + match.id : "/predictions"} className={"group min-w-[280px] snap-start rounded-2xl border p-4 transition hover:-translate-y-0.5 " + (live ? "border-[#B30000]/35 bg-[#13070a]" : "border-white/9 bg-[#0d1119]") + " " + FOCUS}>
      <div className="mb-4 flex items-center justify-between gap-3 text-[9px] font-black uppercase tracking-widest">
        <span className={live ? "text-[#ff5a5a]" : "text-white/35"}>{live ? "Live now" : match.league || "Upcoming"}</span>
        <span className="text-white/30">{live ? String(match.minute || match.status || "Live") : kickoffLabel(match)}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Team match={match} side="home" />
        {scored ? <span className="text-2xl font-black text-white">{match.homeScore} <span className="text-white/25">-</span> {match.awayScore}</span> : <span className="rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-white/28">VS</span>}
        <Team match={match} side="away" />
      </div>
      <span className="mt-4 flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#FFD700]/70">{live ? "Open live center" : "Make your call"}<ArrowRight className="h-3 w-3" /></span>
    </Link>
  );
}

function StoryCard({ article, eager = false }: { article: NewsArticle; eager?: boolean }) {
  const href = article.isInternal ? "/article/" + article.slug : article.link;
  const body = <>
    <div className="relative aspect-[16/9] overflow-hidden"><img src={article.thumbnail || HERO_IMAGE} alt={article.title} width={640} height={360} loading={eager ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.src = HERO_IMAGE; }} /><div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-transparent to-transparent" /></div>
    <div className="flex flex-1 flex-col p-4"><div className="mb-2 flex justify-between gap-3 text-[9px] font-black uppercase tracking-widest text-white/30"><span>{article.source}</span><span>{timeAgo(article.pubDate)}</span></div><h3 className="line-clamp-3 text-base font-black leading-snug text-white">{article.title}</h3><span className="mt-4 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#FFD700]/70">Read story<ArrowRight className="h-3 w-3" /></span></div>
  </>;
  const styles = "group flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0b0e14] transition hover:-translate-y-0.5 hover:border-white/18 " + FOCUS;
  return article.isInternal ? <Link href={href} className={styles}>{body}</Link> : <a href={href} target="_blank" rel="noopener noreferrer" className={styles}>{body}</a>;
}

function HotDebate() {
  const { data: debates = [], isLoading } = useDebates();
  const debate = debates[0];
  return <section className="border-b border-white/6 bg-[#09070a] py-12"><div className="mx-auto max-w-6xl px-4"><Heading eyebrow="Hot fan debate" title="The argument Kenya is having now" copy="Vote, explain your take and keep the receipt when the football answers back." href="/debates" action="Join debates" /><div className="rounded-3xl border border-[#B30000]/20 bg-[#0d0b10] p-6">{isLoading ? <div className="h-32 animate-pulse rounded-2xl bg-white/5" /> : debate ? <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ff6b6b]"><Flame className="h-4 w-4" />{debate.totalVotes} votes</p><h3 className="mt-3 text-2xl font-black text-white md:text-4xl">{debate.title}</h3><div className="mt-5 grid gap-2 sm:grid-cols-2"><div className="rounded-xl border border-white/10 bg-white/5 p-3 font-black">{debate.left}</div><div className="rounded-xl border border-white/10 bg-white/5 p-3 font-black">{debate.right}</div></div></div><Link href="/debates" className={"inline-flex items-center justify-center gap-2 rounded-xl bg-[#B30000] px-6 py-3 text-xs font-black uppercase tracking-widest " + FOCUS}>Vote now<MessageSquare className="h-4 w-4" /></Link></div> : <div className="flex flex-wrap items-center justify-between gap-5"><h3 className="text-2xl font-black">Bring the take your group chat cannot settle.</h3><Link href="/debates" className={"rounded-xl bg-[#B30000] px-6 py-3 text-xs font-black uppercase tracking-widest " + FOCUS}>Start debating</Link></div>}</div></div></section>;
}

function Rewards() {
  const { data: leaderboard = [], isLoading } = useLeaderboard();
  const rewardItems = [
    ["Airtime Top-Up", "Safaricom, Airtel & Telkom Kenya", "from 2,500 MTC", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=720&q=78&auto=format&fit=crop", Smartphone],
    ["Data Bundle", "Daily, weekly & monthly bundles", "from 2,000 MTC", "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=720&q=78&auto=format&fit=crop", Wifi],
    ["BM Merch", "Limited jerseys, caps and fan gear", "from 10,000 MTC", "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=720&q=78&auto=format&fit=crop", Shirt],
  ] as const;
  return <section className="border-b border-white/6 bg-[#08090d] py-12"><div className="mx-auto max-w-6xl px-4"><Heading eyebrow="Predictions leaderboard & MTC rewards" title="Make calls. Climb the table. Redeem the status." copy="Predictions, debates, duels and daily activity earn MTC across the existing rewards system." href="/leaderboard" action="Full leaderboard" /><div className="grid gap-5 lg:grid-cols-[0.9fr_1.6fr]"><div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0d1017]"><div className="flex items-center justify-between border-b border-white/7 p-4 text-[10px] font-black uppercase tracking-widest text-white/55">Top fans this week<Trophy className="h-4 w-4 text-[#FFD700]" /></div>{isLoading ? <div className="m-4 h-36 animate-pulse rounded-xl bg-white/5" /> : leaderboard.length ? leaderboard.slice(0, 5).map((player: any, index: number) => <div key={player.id || player.rank || index} className="flex items-center justify-between border-b border-white/5 px-4 py-3"><span className="truncate text-sm font-black">#{player.rank || index + 1} {String(player.name || "Anonymous Fan").replace(/^Fan_/, "Fan ")}</span><span className="text-sm font-black text-[#FFD700]">{Number(player.pts || 0).toLocaleString()} MTC</span></div>) : <p className="p-6 text-sm text-white/38">The table will populate as fans participate.</p>}</div><div className="grid gap-3 sm:grid-cols-3">{rewardItems.map(([name, detail, price, image, Icon]) => <Link key={name} href="/store" className={"group overflow-hidden rounded-2xl border border-white/8 bg-[#0d1017] " + FOCUS}><div className="relative aspect-[4/3] overflow-hidden"><img src={image} alt={name} width={720} height={540} loading="lazy" decoding="async" className="h-full w-full object-cover brightness-50 transition group-hover:scale-105" /><Icon className="absolute left-3 top-3 h-5 w-5 text-[#FFD700]" /><span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[8px] font-black uppercase">{price}</span></div><div className="p-4"><h3 className="font-black">{name}</h3><p className="mt-1 text-[11px] text-white/35">{detail}</p></div></Link>)}</div></div><div className="mt-5 flex flex-wrap gap-2">{[["Predict match", "+50 MTC"], ["Win a duel", "+200 MTC"], ["Daily login", "+50 MTC"], ["Join debate", "+30 MTC"]].map(([label, points]) => <span key={label} className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-[10px] text-white/48">{label} <b className="text-[#FFD700]">{points}</b></span>)}<Link href="/store" className={"ml-auto inline-flex items-center gap-2 rounded-full bg-[#FFD700] px-5 py-2 text-[10px] font-black uppercase text-black " + FOCUS}>View rewards<Coins className="h-4 w-4" /></Link></div></div></section>;
}

export default function MarketHomePage() {
  const { isLoggedIn, dbProfile } = useAuth();
  const [today, setToday] = useState<HomepageMatch[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const { data: live = [], isLoading: liveLoading } = useMatches();
  const { data: upcoming = [], isLoading: upcomingLoading } = useUpcomingFixtures();
  const { data: debates = [] } = useDebates();
  const needsRecent = !liveLoading && !upcomingLoading && !live.length && !upcoming.length;
  const { data: recent = [] } = useRecentMatches({ enabled: needsRecent });

  useEffect(() => {
    let cancelled = false;
    fetchTodaysFixtures().then((items) => { if (!cancelled) setToday(items); }).catch(() => undefined);
    Promise.allSettled([fetchPartnerArticles(), fetchFootballNews()]).then(([partnerResult, newsResult]) => {
      if (cancelled) return;
      const partner = partnerResult.status === "fulfilled" ? partnerResult.value : [];
      const headlines = newsResult.status === "fulfilled" ? newsResult.value : [];
      setNews(dedupeNews([...partner, ...headlines]).slice(0, 18));
    }).finally(() => { if (!cancelled) setNewsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const beforeKickoff = now < PREMIER_LEAGUE_OPENING_KICKOFF;
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), beforeKickoff ? 1000 : 60_000); return () => window.clearInterval(timer); }, [beforeKickoff]);

  const club = String(dbProfile?.favorite_team || "").trim();
  const mode = getHomepageMode({ now, liveMatches: live, todaysFixtures: today });
  const selected = useMemo(() => selectFeaturedMatch({ liveMatches: live, upcomingFixtures: upcoming, recentMatches: recent, followedClub: club }), [club, live, recent, upcoming]);
  const featured = selected.match || PREMIER_LEAGUE_OPENING_FIXTURES[0];
  const featuredLive = live.some((item: HomepageMatch) => String(item.id) === String(featured.id));
  const matches = live.length ? [...live, ...upcoming].slice(0, 6) : upcoming.length ? upcoming.slice(0, 6) : PREMIER_LEAGUE_OPENING_FIXTURES;
  const countdown = getCountdownParts(PREMIER_LEAGUE_OPENING_KICKOFF, now);
  const seasonNews = news.filter((article) => {
    const topic = (article.title + " " + (article.description || "")).toLowerCase();
    return !topic.includes("world cup") && !topic.includes("wc26");
  });
  const originals = news.filter((article) => article.isInternal);
  const kenya = news.filter(isKenyanStory).slice(0, 3);
  const take = useMemo(() => mchambuziTake(featured, mode, news[0]?.title), [featured, mode, news]);

  return <main className="overflow-x-clip bg-[#050609] pb-24 text-white">
    <SEO title={TITLE} description={DESCRIPTION} keywords={["live football scores Kenya", "Premier League fixtures Kenya", "Champions League Kenya", "FKF Premier League", "football predictions Kenya", "Mchambuzi AI"]} path="/" />
    <HeroTicker articles={seasonNews.slice(0, 8)} matches={matches.slice(0, 8)} />

    {/* HERO SECTION */}
    <section className="relative isolate bg-[#070707] min-h-[600px] flex items-center border-b border-[#2A2A2A] py-16">
      
      {/* Background Image with crafted masks */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute top-0 bottom-0 right-0 w-full md:w-[90%] lg:w-[85%] h-full">
          <img src={HERO_IMAGE} alt="Hero" className="w-full h-full object-cover object-center md:object-[35%_center]" />
          {/* Gradient mask to fade image into the left dark background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/70 to-transparent w-[50%]" />
          {/* Bottom fade to seamlessly blend with next section */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent opacity-90" />
        </div>
      </div>
      
      <div className="mx-auto w-full max-w-7xl px-4 grid gap-8 lg:gap-12 lg:grid-cols-[auto_1fr] items-center relative z-10">
        
        {/* Left Side: Typography & CTAs */}
        <div className="flex flex-col max-w-xl">
          <h1 className="flex flex-col font-extrabold leading-[0.9] tracking-[-0.04em]">
            <span className="text-white text-5xl md:text-6xl lg:text-[68px] italic drop-shadow-md">THE SEASON</span>
            <span className="text-[#B30000] text-5xl md:text-6xl lg:text-[68px] italic drop-shadow-md">STARTS HERE.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg font-medium leading-relaxed text-white/80">
            Live scores, fearless predictions, Kenyan fan debates and real football intelligence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/matches" className={"inline-flex items-center gap-2 rounded-lg bg-[#B30000] px-6 py-3.5 text-[10px] md:text-xs font-black tracking-widest uppercase hover:bg-red-800 transition-colors shadow-[0_0_20px_rgba(179,0,0,0.4)] " + FOCUS}>
              SEE UPCOMING MATCHES <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/fan-zones" className={"inline-flex items-center gap-2 rounded-lg border border-[#FFD700]/50 text-[#FFD700] bg-transparent px-6 py-3.5 text-[10px] md:text-xs font-black tracking-widest uppercase hover:bg-[#FFD700]/10 transition-colors " + FOCUS}>
              CHOOSE YOUR CLUB <Users className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-2">
            <div className="flex h-6 w-6 rounded-full items-center justify-center bg-[#B30000]/20">
              <Zap className="h-3 w-3 fill-[#B30000] text-[#B30000]" />
            </div>
            <p className="text-sm font-black tracking-widest">
              <span className="text-white/60">We predict. We debate. </span><span className="text-[#FFD700]">We keep receipts.</span>
            </p>
          </div>
        </div>

        {/* Right Side: LIVE & NEXT Card (Dynamic API-Football Featured Match) */}
        <div className="flex justify-end w-full">
          <div className="w-full max-w-[340px] rounded-2xl border border-white/10 bg-black/75 p-4 backdrop-blur-xl shadow-2xl">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${featuredLive ? "bg-emerald-500" : "bg-[#B30000]"} animate-pulse`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">
                  {featuredLive ? "LIVE NOW" : "FEATURED MATCH"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                <Trophy className="h-3 w-3 text-white/50 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70 truncate">{featured.league || "Premier League"}</span>
              </div>
            </div>
            
            {/* Teams & Score / Kickoff from API-Football */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
              <div className="flex flex-col items-center gap-2 min-w-0">
                <TeamLogo logo={featured.homeLogo} initial={featured.homeInitial || (featured.home || "HOM").slice(0, 3).toUpperCase()} color="#182333" size="lg" shadow />
                <span className="text-[10px] font-black uppercase tracking-wider text-white leading-tight break-words line-clamp-2 w-full">{featured.home}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 shrink-0 px-1">
                {featuredLive || (typeof featured.homeScore === "number" && typeof featured.awayScore === "number") ? (
                  <>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{featured.minute ? `${featured.minute}'` : "LIVE"}</span>
                    <span className="text-[2rem] font-black text-white leading-none">{featured.homeScore ?? 0} - {featured.awayScore ?? 0}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Full Time / Live</span>
                  </>
                ) : (
                  <>
                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Kickoff</span>
                    <span className="text-[1.5rem] xl:text-[1.8rem] font-black text-white leading-none">{featured.time ? String(featured.time).replace(/\s?[A-Z]{2,4}$/, "") : "TBC"}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">EAT</span>
                  </>
                )}
              </div>
              <div className="flex flex-col items-center gap-2 min-w-0">
                <TeamLogo logo={featured.awayLogo} initial={featured.awayInitial || (featured.away || "AWY").slice(0, 3).toUpperCase()} color="#182333" size="lg" shadow />
                <span className="text-[10px] font-black uppercase tracking-wider text-white leading-tight break-words line-clamp-2 w-full">{featured.away}</span>
              </div>
            </div>

            {/* Prediction */}
            <div className="mt-4 border-t border-white/10 pt-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">WHO WILL WIN?</p>
              <p className="text-[9px] font-medium text-white/40 mb-3">Cast your prediction</p>
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-1.5 items-center">
                <Link href={`/predictions?match=${featured.id}`} className="rounded-lg border border-white/20 py-2 text-xs font-black hover:bg-white/5 transition-colors text-center block">1</Link>
                <Link href={`/predictions?match=${featured.id}`} className="rounded-lg border border-[#FFD700]/70 bg-[#FFD700]/10 text-[#FFD700] py-2 text-xs font-black text-center block">X</Link>
                <Link href={`/predictions?match=${featured.id}`} className="rounded-lg border border-white/20 py-2 text-xs font-black hover:bg-white/5 transition-colors text-center block">2</Link>
                <div className="ml-1 flex flex-col items-end">
                  <span className="text-sm font-black text-white">Live</span>
                  <span className="text-[7px] font-bold uppercase text-white/40 leading-tight">Fans<br/>Predicting</span>
                </div>
              </div>

              {/* Fan Pulse */}
              <div className="mt-4 flex flex-col gap-1.5">
                <span className="text-[9px] font-black tracking-widest uppercase text-white/50 text-left">FAN PULSE</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[#B30000]">65%</span>
                  <svg className="flex-1 h-3" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 L20,5 L25,1 L30,9 L35,5 L70,5 L75,2 L80,8 L85,5 L100,5" stroke="#B30000" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <span className="text-sm font-black text-[#FFD700]">35%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* UPCOMING & LEAGUES */}
    <section className="bg-[#0B0B0B] py-12 border-b border-[#2A2A2A]">
      <div className="mx-auto max-w-7xl px-4 grid gap-8 lg:grid-cols-[1fr_auto]">
        
        {/* UPCOMING FIXTURES */}
        <div className="flex flex-col min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-white">UPCOMING FIXTURES</h2>
            <Link href="/matches" className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:text-white transition-colors">VIEW ALL &gt;</Link>
          </div>
          <div className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {matches.length === 0 ? <div className="h-32 min-w-[200px] animate-pulse rounded-2xl bg-white/5" /> : matches.slice(0, 4).map((match: HomepageMatch, idx: number) => {
              const rawDate = match.date ? new Date(match.date) : null;
              const dateLabel = rawDate && !isNaN(rawDate.getTime())
                ? rawDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                : match.date ? String(match.date).slice(0, 10) : "Upcoming";
              // Show only time digits, strip timezone suffix
              const timeLabel = match.time ? String(match.time).replace(/\s?[A-Z]{2,4}$/, "").trim() : "TBC";
              return (
                <div key={idx} className="group w-[200px] shrink-0 snap-start rounded-2xl border border-white/10 bg-[#151515] p-3 hover:border-white/20 transition-all cursor-pointer">
                  <div className="mb-3 flex justify-between items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
                    <span className="flex items-center gap-1 min-w-0">
                      <Trophy className="w-3 h-3 shrink-0"/>
                      <span className="truncate">{match.league || "KPL"}</span>
                    </span>
                    <span className="shrink-0 text-[8px] whitespace-nowrap">{dateLabel}</span>
                  </div>
                  <div className="flex items-start justify-between w-full">
                    <Team match={match} side="home" />
                    <span className="text-sm font-black text-white shrink-0 px-1 mt-2.5">{timeLabel}</span>
                    <Team match={match} side="away" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LEAGUES */}
        <div className="flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-white">LEAGUES</h2>
            <Link href="/matches" className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:text-white transition-colors">VIEW ALL &gt;</Link>
          </div>
          <div className="grid grid-cols-4 gap-2.5 w-[340px] shrink-0">
            {[
              { id: "kpl", label: "KPL", image: "https://media.api-sports.io/football/leagues/326.png", color: "bg-gradient-to-b from-[#b52626] to-[#7a1010] shadow-lg shadow-red-900/20", imgClass: "brightness-0 invert" },
              { id: "ucl", label: "UCL", image: "https://media.api-sports.io/football/leagues/2.png", color: "bg-gradient-to-b from-[#1a237e] to-[#0d1254]", imgClass: "brightness-0 invert" },
              { id: "epl", label: "EPL", image: "https://media.api-sports.io/football/leagues/39.png", color: "bg-gradient-to-b from-[#38003c] to-[#220025]", imgClass: "brightness-0 invert" },
              { id: "laliga", label: "LA LIGA", image: "https://media.api-sports.io/football/leagues/140.png", color: "bg-gradient-to-b from-[#FF4B44] to-[#b52626]", imgClass: "brightness-0 invert" },
              { id: "seriea", label: "SERIE A", image: "https://media.api-sports.io/football/leagues/135.png", color: "bg-gradient-to-b from-[#0a0a2e] to-[#050515]", imgClass: "" },
              { id: "bundesliga", label: "BUNDESLIGA", image: "https://media.api-sports.io/football/leagues/78.png", color: "bg-gradient-to-b from-[#d00027] to-[#8a0019]", imgClass: "brightness-0 invert" },
              { id: "ligue1", label: "LIGUE 1", image: "https://media.api-sports.io/football/leagues/61.png", color: "bg-gradient-to-b from-[#004899] to-[#002d6b]", imgClass: "brightness-0 invert" },
              { id: "more", label: "MORE", isMore: true, color: "bg-[#1f1f1f]" },
            ].map(l => (
              <Link key={l.id} href={`/matches?search=${l.label}`} className={`group flex flex-col items-center justify-center py-4 px-2 rounded-2xl hover:bg-white/10 transition-colors ${l.color} ${FOCUS}`}>
                <div className="h-8 w-8 mb-2 flex items-center justify-center">
                  {l.isMore ? (
                    <div className="grid grid-cols-3 gap-[3px]">
                      {[...Array(9)].map((_, i) => <div key={i} className="w-[5px] h-[5px] bg-white rounded-full opacity-80" />)}
                    </div>
                  ) : (
                    <img src={l.image} alt={l.label} className={`max-h-full max-w-full object-contain ${l.imgClass} transition-transform group-hover:scale-110`} />
                  )}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wide text-white">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* CONTENT GRID */}
    <section className="bg-[#0B0B0B] py-16">
      <div className="mx-auto max-w-7xl px-4 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Mchambuzi's Take (Dynamic Analysis) */}
        <Link href="/mchambuzi-halisi" className="rounded-2xl border border-white/10 bg-[#151515] overflow-hidden flex flex-col group cursor-pointer hover:border-white/20 transition-all">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">MCHAMBUZI'S TAKE</h3>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#FFD700]">VIEW ALL &gt;</span>
          </div>
          <div className="relative aspect-square">
            <img src={ANALYST_IMAGE} alt="Mchambuzi" className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h4 className="text-base font-black leading-tight text-white line-clamp-3">
                {featured ? `${featured.home} vs ${featured.away}: Tactical Breakdown` : (news[0]?.title || "Match Analysis & Tactical Preview")}
              </h4>
              <p className="mt-2 text-[10px] font-bold text-white/60">By Mchambuzi AI</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded bg-[#FFD700]/10 border border-[#FFD700]/30 px-2 py-1 text-[8px] font-black tracking-widest text-[#FFD700] uppercase">AI ANALYSIS</span>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-white/40 uppercase">3 min read</span>
                  <div className="h-8 w-8 rounded-full bg-[#B30000] flex items-center justify-center shadow-lg"><Zap className="h-4 w-4 text-white" /></div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Hot Debate (Dynamic from useDebates API) */}
        <div className="rounded-2xl border border-white/10 bg-[#151515] overflow-hidden flex flex-col group cursor-pointer hover:border-white/20 transition-all">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">HOT DEBATE</h3>
            <Link href="/debates" className="text-[9px] font-black uppercase tracking-widest text-[#FFD700]">VIEW ALL &gt;</Link>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h4 className="text-xl font-black leading-tight text-white">
              {debates[0]?.title || (featured ? `Who takes 3 points in ${featured.home} vs ${featured.away}?` : "Which squad is ready to contend this season?")}
            </h4>
            <p className="mt-4 text-sm font-medium text-white/50">
              {debates[0]?.left ? `${debates[0].left} OR ${debates[0].right}` : "Drop your take and join the debate."}
            </p>
            <div className="mt-auto pt-8 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-[10px] font-bold text-[#FFD700]">🔥 {debates[0]?.totalVotes ? `${debates[0].totalVotes} votes` : "Active debate"}</span>
              </div>
              <Link href="/debates" className="rounded-lg bg-[#B30000] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-800 transition-colors">JOIN DEBATE</Link>
            </div>
          </div>
        </div>

        {/* Kenyan Football (Dynamic RSS / News API) */}
        <div className="rounded-2xl border border-white/10 bg-[#151515] overflow-hidden flex flex-col group cursor-pointer hover:border-white/20 transition-all">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">KENYAN FOOTBALL</h3>
            <Link href="/news" className="text-[9px] font-black uppercase tracking-widest text-[#FFD700]">VIEW ALL &gt;</Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <img src={kenya[0]?.thumbnail || FANS_IMAGE} alt="Kenyan Football" className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.src = FANS_IMAGE; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h4 className="text-base font-black leading-tight text-white line-clamp-2">
                {kenya[0]?.title || "Kenyan Premier League & Harambee Stars Coverage"}
              </h4>
              <p className="mt-1 text-[10px] font-medium text-white/60 line-clamp-2">
                {kenya[0]?.source || "BallMtaani Special"} • {kenya[0]?.pubDate ? timeAgo(kenya[0].pubDate) : "Latest"}
              </p>
              {kenya[0] ? (
                kenya[0].isInternal ? (
                  <Link href={`/article/${kenya[0].slug}`} className="mt-3 inline-block rounded-lg bg-[#FFD700] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black hover:bg-yellow-400 transition-colors">READ STORY</Link>
                ) : (
                  <a href={kenya[0].link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-lg bg-[#FFD700] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black hover:bg-yellow-400 transition-colors">READ STORY</a>
                )
              ) : (
                <Link href="/news" className="mt-3 inline-block rounded-lg bg-[#FFD700] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black hover:bg-yellow-400 transition-colors">READ STORY</Link>
              )}
            </div>
          </div>
        </div>

        {/* Latest News */}
        <div className="rounded-2xl border border-white/10 bg-[#151515] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">LATEST NEWS</h3>
            <Link href="/news" className="text-[9px] font-black uppercase tracking-widest text-[#FFD700]">VIEW ALL &gt;</Link>
          </div>
          <div className="p-4 flex flex-col gap-4">
            {news.slice(0, 3).map((article, i) => (
              <Link key={i} href={article.isInternal ? `/article/${article.slug}` : article.link} className="group grid grid-cols-[80px_1fr] gap-3 items-start">
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#2A2A2A]">
                  <img src={article.thumbnail || FANS_IMAGE} alt="" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-snug text-white line-clamp-3 group-hover:text-[#FFD700] transition-colors">{article.title}</h4>
                  <p className="mt-1 text-[9px] font-medium text-white/40">{timeAgo(article.pubDate)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>

  </main>;
}
