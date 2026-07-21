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
const STADIUM_IMAGE = "https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/Football_culture_stadium.jpeg";
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

function Team({ match, side, size = "md" }: { match: HomepageMatch; side: "home" | "away"; size?: "md" | "xl" }) {
  const name = String(match[side]);
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <TeamLogo logo={side === "home" ? match.homeLogo : match.awayLogo} initial={String((side === "home" ? match.homeInitial : match.awayInitial) || name.slice(0, 3)).toUpperCase()} color="#182333" size={size} shadow={size === "xl"} />
      <span className="line-clamp-2 text-sm font-black text-white">{name}</span>
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
    <div className="relative aspect-[16/9] overflow-hidden"><img src={article.thumbnail || STADIUM_IMAGE} alt={article.title} width={640} height={360} loading={eager ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.src = STADIUM_IMAGE; }} /><div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-transparent to-transparent" /></div>
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

    <section className="relative isolate overflow-hidden border-b border-white/8"><img src={STADIUM_IMAGE} alt="" width={1920} height={1080} loading="eager" decoding="async" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40" /><div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,6,9,.98),rgba(5,6,9,.75),rgba(5,6,9,.45))]" /><div className="mx-auto grid max-w-6xl gap-9 px-4 py-14 md:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center"><div><div className="mb-5 flex flex-wrap gap-2"><span className="rounded-full border border-[#FFD700]/24 bg-[#FFD700]/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#FFD700]">{MODE_COPY[mode].eyebrow}</span><span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/55">Premier League first. Kenya always visible.</span></div><h1 className="text-5xl font-black leading-[.9] tracking-[-.045em] md:text-7xl">The season <span className="text-[#B30000]">starts here.</span></h1><p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-white/65 md:text-lg">Live scores, fearless predictions, Kenyan fan debates and real football intelligence—from the Premier League to FKF football.</p><p className="mt-3 text-sm font-black uppercase tracking-widest text-[#FFD700]/75">We predict. We debate. We keep receipts.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/matches" className={"inline-flex items-center gap-2 rounded-xl bg-[#B30000] px-6 py-3.5 text-sm font-black " + FOCUS}>See Upcoming Matches<ArrowRight className="h-4 w-4" /></Link><Link href="/fan-zones" className={"inline-flex items-center gap-2 rounded-xl border border-white/18 bg-black/30 px-6 py-3.5 text-sm font-black " + FOCUS}>Choose Your Club<Users className="h-4 w-4" /></Link></div><p className="mt-5 max-w-xl text-sm leading-6 text-white/42">{MODE_COPY[mode].summary}</p></div><div className="rounded-3xl border border-white/12 bg-[#0a0d14]/90 p-6 backdrop-blur"><div className="mb-5 flex items-center justify-between"><div><p className={"text-[10px] font-black uppercase tracking-widest " + (featuredLive ? "text-[#ff5a5a]" : "text-[#FFD700]")}>{selected.reason}</p><p className="mt-1 text-xs text-white/38">{featured.league}</p></div>{featuredLive ? <Radio className="h-5 w-5 animate-pulse text-[#B30000]" /> : <CalendarDays className="h-5 w-5 text-white/35" />}</div><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4"><Team match={featured} side="home" size="xl" />{typeof featured.homeScore === "number" ? <span className="text-3xl font-black">{featured.homeScore} - {featured.awayScore}</span> : <span className="rounded-xl border border-white/10 px-4 py-2 text-sm font-black text-white/28">VS</span>}<Team match={featured} side="away" size="xl" /></div><p className="mt-5 text-center text-[10px] font-black uppercase tracking-widest text-white/38">{kickoffLabel(featured)}</p><Link href={featuredLive ? "/live-center/" + featured.id : "/predictions"} className={"mt-4 flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-[#FFD700] " + FOCUS}>{featuredLive ? "Join Live Center" : "Make Your Call"}<ChevronRight className="h-4 w-4" /></Link></div></div></section>

    <section className="border-b border-white/6 bg-[#070a10] py-11"><div className="mx-auto max-w-6xl px-4"><Heading eyebrow="Live & upcoming" title="Your matchday desk" copy="Live games lead. Premier League follows. Europe, Kenyan football and the next useful fixture stay close behind." href="/matches" action="All matches" /><div className="flex snap-x gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{(liveLoading || upcomingLoading) && !matches.length ? [1,2,3].map((item) => <div key={item} className="h-48 min-w-[280px] animate-pulse rounded-2xl bg-white/[.03]" />) : matches.map((match: HomepageMatch) => <MatchCard key={String(match.id)} match={match} live={live.some((item: HomepageMatch) => String(item.id) === String(match.id)) || LIVE_STATUSES.has(String(match.status || ""))} />)}</div></div></section>

    <section className="border-b border-white/6 bg-[#08080b] py-11"><div className="mx-auto grid max-w-6xl gap-5 px-4 lg:grid-cols-[1.25fr_.75fr]"><div className="rounded-3xl border border-[#B30000]/18 bg-[#0d0d12] p-7"><p className="text-[10px] font-black uppercase tracking-widest text-[#ff6b6b]">Choose your club</p><h2 className="mt-3 text-3xl font-black">{club && club.toLowerCase() !== "none" ? club + " is your home end." : "Pick the badge you will defend all season."}</h2><p className="mt-3 text-sm leading-6 text-white/48">Your saved favourite team already powers fan-zone discovery and can now lead featured-match priority whenever that club is live.</p><Link href="/fan-zones" className={"mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-widest " + FOCUS}>{club ? "Open your fan zone" : "Choose your club"}<Users className="h-4 w-4" /></Link></div><div className="rounded-3xl border border-white/8 bg-[#0d1017] p-6"><p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">Fan identity</p>{["Follow your club first", "Join debates with context", "Earn MTC across matchday actions"].map((item, index) => <div key={item} className="mt-3 flex items-center gap-3 rounded-xl border border-white/7 bg-white/[.025] p-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#B30000]/18 text-xs font-black text-[#ff6b6b]">{index + 1}</span><span className="text-sm font-bold text-white/66">{item}</span></div>)}</div></div></section>

    <section className="border-b border-[#FFD700]/10 bg-[#0a0904] py-11"><div className="mx-auto grid max-w-6xl gap-7 px-4 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]/70">Premier League opening weekend</p><h2 className="mt-3 text-3xl font-black md:text-4xl">{countdown.complete ? "The 2026/27 season is underway." : "Arsenal and Coventry open the new season."}</h2><p className="mt-3 text-sm leading-6 text-white/48">Friday 21 August, 10:00 PM EAT. Manchester United, Manchester City and Liverpool follow across opening weekend.</p><Link href="/matches?search=Premier%20League" className={"mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#FFD700] " + FOCUS}>Opening fixtures<ArrowRight className="h-4 w-4" /></Link></div>{!countdown.complete && <div className="grid grid-cols-4 gap-2">{[[countdown.days,"Days"],[countdown.hours,"Hours"],[countdown.minutes,"Mins"],[countdown.seconds,"Secs"]].map(([value,label]) => <div key={String(label)} className="rounded-xl border border-[#FFD700]/18 bg-black/35 p-3 text-center"><b className="block text-2xl tabular-nums md:text-3xl">{String(value).padStart(2,"0")}</b><span className="text-[8px] font-black uppercase tracking-widest text-[#FFD700]/55">{label}</span></div>)}</div>}</div></section>

    <section className="border-b border-white/6 bg-[#06090a] py-11"><div className="mx-auto max-w-6xl px-4"><div className="grid gap-6 rounded-3xl border border-green-500/16 bg-[#09100d] p-7 lg:grid-cols-[auto_1fr_auto] lg:items-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10"><Sparkles className="h-6 w-6 text-green-400" /></div><div><p className="text-[10px] font-black uppercase tracking-widest text-green-400">Mchambuzi’s latest take</p><h2 className="mt-2 text-2xl font-black">{MODE_COPY[mode].focus}</h2><p className="mt-3 text-sm leading-6 text-white/55">{take}</p><p className="mt-2 text-[9px] uppercase tracking-widest text-white/24">Reuses current data · cached for 15 minutes · no automatic AI call</p></div><Link href={"/mchambuzi-halisi?q=" + encodeURIComponent("Give me the sharpest football take for today")} className={"inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-black " + FOCUS}>Ask Mchambuzi<ArrowRight className="h-4 w-4" /></Link></div></div></section>

    <DeferredSection minHeight={360}><HotDebate /></DeferredSection>

    <section className="border-b border-white/6 bg-[#070910] py-11"><div className="mx-auto max-w-6xl px-4"><Heading eyebrow="League centres" title="Jump straight to your competition" copy="Premier League leads, with Europe, FKF football, Harambee Stars and CAF one step away." href="/matches" action="Match directory" /><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{LEAGUE_SHORTCUTS.map((league) => <Link key={league.name} href={league.href} className={"rounded-2xl border border-white/8 bg-[#0d1119] p-4 hover:border-white/18 " + FOCUS}><span className="mb-4 block h-1 w-9 rounded-full" style={{ backgroundColor: league.accent }} /><h3 className="text-sm font-black">{league.label}</h3><span className="mt-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/30">Open centre<ChevronRight className="h-3 w-3" /></span></Link>)}</div></div></section>

    <section className="border-b border-white/6 bg-[#08080b] py-11"><div className="mx-auto max-w-6xl px-4"><Heading eyebrow="Original Mtaa Daily stories" title="Reporting, explainers and receipts from BallMtaani" copy="Stories written on BallMtaani stay visible and lead directly to their article pages." href="/news" action="View all stories" />{newsLoading ? <div className="grid gap-3 md:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-white/[.03]" />)}</div> : originals.length ? <div className="grid gap-3 md:grid-cols-3">{originals.slice(0,6).map((article,index) => <StoryCard key={article.slug || article.id || article.link} article={article} eager={index === 0} />)}</div> : <div className="rounded-2xl border border-white/8 bg-white/[.025] p-6 text-sm text-white/48">No published Mtaa Daily story is available in this environment yet.</div>}</div></section>

    <section className="border-b border-green-500/12 bg-[#050b07] py-11"><div className="mx-auto max-w-6xl px-4"><Heading eyebrow="Kenyan football spotlight" title="Local football is not a sidebar" copy="Harambee Stars, FKF Premier League, CAF nights and the clubs shaping Kenyan football culture." href="/matches?tab=africa" action="Kenyan & CAF fixtures" />{kenya.length ? <div className="grid gap-3 md:grid-cols-3">{kenya.map((article) => <StoryCard key={"kenya-" + (article.slug || article.id || article.link)} article={article} />)}</div> : <div className="grid gap-3 sm:grid-cols-3">{[["FKF Premier League","Fixtures, results and table movement."],["Harambee Stars","National-team windows and squad stories."],["CAF nights","Continental football with Kenyan context."]].map(([title,copy]) => <Link key={title} href="/matches?tab=africa" className={"rounded-2xl border border-green-500/14 bg-green-500/[.035] p-5 " + FOCUS}><h3 className="text-lg font-black">{title}</h3><p className="mt-2 text-sm text-white/42">{copy}</p></Link>)}</div>}</div></section>

    <DeferredSection minHeight={620}><Rewards /></DeferredSection>

    <section className="bg-[#070609] py-14"><div className="mx-auto max-w-4xl px-4 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B30000]/12">{isLoggedIn ? <BellRing className="h-6 w-6 text-[#ff6b6b]" /> : <Zap className="h-6 w-6 text-[#ff6b6b]" />}</div><p className="mt-5 text-[10px] font-black uppercase tracking-widest text-[#ff6b6b]">Do not miss the next receipt</p><h2 className="mt-3 text-3xl font-black md:text-5xl">{isLoggedIn ? "Turn on match alerts before kickoff." : "Join the room before the season gets loud."}</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/48">Get matchday prompts, predictions, debates and an MTC record across the 2026/27 season.</p><div className="mt-7 flex flex-wrap items-center justify-center gap-3">{isLoggedIn ? <><NotificationBell /><Link href="/predictions" className={"rounded-xl bg-[#B30000] px-6 py-3 text-xs font-black uppercase tracking-widest " + FOCUS}>Make a prediction</Link></> : <><GoogleSignInButton size="lg" label="Join BallMtaani" /><Link href="/matches" className={"rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-widest " + FOCUS}>Browse matches</Link></>}</div></div></section>
    <FloatingMchambuzi variant="home" />
  </main>;
}
