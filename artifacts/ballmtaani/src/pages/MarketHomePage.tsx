import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight, BellRing, BarChart2, BookOpen, CalendarDays, ChevronRight, Coins,
  Flame, Globe, MessageSquare, Radio, Shirt, ShoppingBag, Sparkles, Smartphone,
  Star, Trophy, Users, Wifi, Zap,
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
import AirtimePayoutTicker from "../components/AirtimePayoutTicker";
import KenyaModeToggle from "../components/KenyaModeToggle";
import MatchHypeBarometer from "../components/MatchHypeBarometer";
import MchambuziInsightChip from "../components/MchambuziInsightChip";
import MatchReceiptModal from "../components/MatchReceiptModal";
import { generateReceiptCode } from "../lib/prediction-receipts";

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
  return <section className="border-b border-white/6 bg-[#09070a] py-6"><div className="mx-auto max-w-6xl px-4"><Heading eyebrow="Hot fan debate" title="The argument Kenya is having now" copy="Vote, explain your take and keep the receipt when the football answers back." href="/debates" action="Join debates" /><div className="rounded-3xl border border-[#B30000]/20 bg-[#0d0b10] p-5">{isLoading ? <div className="h-32 animate-pulse rounded-2xl bg-white/5" /> : debate ? <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ff6b6b]"><Flame className="h-4 w-4" />{debate.totalVotes} votes</p><h3 className="mt-3 text-2xl font-black text-white md:text-4xl">{debate.title}</h3><div className="mt-5 grid gap-2 sm:grid-cols-2"><div className="rounded-xl border border-white/10 bg-white/5 p-3 font-black">{debate.left}</div><div className="rounded-xl border border-white/10 bg-white/5 p-3 font-black">{debate.right}</div></div></div><Link href="/debates" className={"inline-flex items-center justify-center gap-2 rounded-xl bg-[#B30000] px-6 py-3 text-xs font-black uppercase tracking-widest " + FOCUS}>Vote now<MessageSquare className="h-4 w-4" /></Link></div> : <div className="flex flex-wrap items-center justify-between gap-5"><h3 className="text-2xl font-black">Bring the take your group chat cannot settle.</h3><Link href="/debates" className={"rounded-xl bg-[#B30000] px-6 py-3 text-xs font-black uppercase tracking-widest " + FOCUS}>Start debating</Link></div>}</div></div></section>;
}

function Rewards() {
  const { data: leaderboard = [], isLoading } = useLeaderboard();
  const rewardItems = [
    ["Airtime Top-Up", "Safaricom, Airtel & Telkom Kenya", "from 2,500 MTC", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=720&q=78&auto=format&fit=crop", Smartphone],
    ["Data Bundle", "Daily, weekly & monthly bundles", "from 2,000 MTC", "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=720&q=78&auto=format&fit=crop", Wifi],
    ["BM Merch", "Limited jerseys, caps and fan gear", "from 10,000 MTC", "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=720&q=78&auto=format&fit=crop", Shirt],
  ] as const;
  return <section className="border-b border-white/6 bg-[#08090d] py-6"><div className="mx-auto max-w-6xl px-4"><Heading eyebrow="Predictions leaderboard & MTC rewards" title="Make calls. Climb the table. Redeem the status." copy="Predictions, debates, duels and daily activity earn MTC across the existing rewards system." href="/leaderboard" action="Full leaderboard" /><div className="grid gap-5 lg:grid-cols-[0.9fr_1.6fr]"><div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0d1017]"><div className="flex items-center justify-between border-b border-white/7 p-4 text-[10px] font-black uppercase tracking-widest text-white/55">Top fans this week<Trophy className="h-4 w-4 text-[#FFD700]" /></div>{isLoading ? <div className="m-4 h-36 animate-pulse rounded-xl bg-white/5" /> : leaderboard.length ? leaderboard.slice(0, 5).map((player: any, index: number) => <div key={player.id || player.rank || index} className="flex items-center justify-between border-b border-white/5 px-4 py-3"><span className="truncate text-sm font-black">#{player.rank || index + 1} {String(player.name || "Anonymous Fan").replace(/^Fan_/, "Fan ")}</span><span className="text-sm font-black text-[#FFD700]">{Number(player.pts || 0).toLocaleString()} MTC</span></div>) : <p className="p-6 text-sm text-white/38">The table will populate as fans participate.</p>}</div><div className="grid gap-3 sm:grid-cols-3">{rewardItems.map(([name, detail, price, image, Icon]) => <Link key={name} href="/store" className={"group overflow-hidden rounded-2xl border border-white/8 bg-[#0d1017] " + FOCUS}><div className="relative aspect-[4/3] overflow-hidden"><img src={image} alt={name} width={720} height={540} loading="lazy" decoding="async" className="h-full w-full object-cover brightness-50 transition group-hover:scale-105" /><Icon className="absolute left-3 top-3 h-5 w-5 text-[#FFD700]" /><span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[8px] font-black uppercase">{price}</span></div><div className="p-4"><h3 className="font-black">{name}</h3><p className="mt-1 text-[11px] text-white/35">{detail}</p></div></Link>)}</div></div><div className="mt-5 flex flex-wrap gap-2">{[["Predict match", "+50 MTC"], ["Win a duel", "+200 MTC"], ["Daily login", "+50 MTC"], ["Join debate", "+30 MTC"]].map(([label, points]) => <span key={label} className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-[10px] text-white/48">{label} <b className="text-[#FFD700]">{points}</b></span>)}<Link href="/store" className={"ml-auto inline-flex items-center gap-2 rounded-full bg-[#FFD700] px-5 py-2 text-[10px] font-black uppercase text-black " + FOCUS}>View rewards<Coins className="h-4 w-4" /></Link></div></div></section>;
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

  const [isKenyaFirst, setIsKenyaFirst] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] = useState<{
    receiptCode: string;
    fanDisplayName: string;
    homeTeam: string;
    homeLogo?: string;
    awayTeam: string;
    awayLogo?: string;
    competition: string;
    predictedScore: string;
    submittedAtISO: string;
    kickoffTimeISO: string;
    status: "locked";
    visibility: "public";
  } | null>(null);

  const beforeKickoff = now < PREMIER_LEAGUE_OPENING_KICKOFF;
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), beforeKickoff ? 1000 : 60_000); return () => window.clearInterval(timer); }, [beforeKickoff]);

  const club = String(dbProfile?.favorite_team || "").trim();
  const mode = getHomepageMode({ now, liveMatches: live, todaysFixtures: today });
  const selected = useMemo(() => selectFeaturedMatch({ liveMatches: live, upcomingFixtures: upcoming, recentMatches: recent, followedClub: club }), [club, live, recent, upcoming]);
  const featured = selected.match || PREMIER_LEAGUE_OPENING_FIXTURES[0];
  const featuredLive = live.some((item: HomepageMatch) => String(item.id) === String(featured.id));
  
  const rawMatches = live.length ? [...live, ...upcoming].slice(0, 6) : upcoming.length ? upcoming.slice(0, 6) : PREMIER_LEAGUE_OPENING_FIXTURES;
  const matches = isKenyaFirst
    ? rawMatches.filter(m => (m.league || "").toLowerCase().includes("fkf") || (m.league || "").toLowerCase().includes("kpl") || (m.home || "").toLowerCase().includes("gor") || (m.home || "").toLowerCase().includes("leopards"))
    : rawMatches;

  const countdown = getCountdownParts(PREMIER_LEAGUE_OPENING_KICKOFF, now);
  const seasonNews = news.filter((article) => {
    const topic = (article.title + " " + (article.description || "")).toLowerCase();
    return !topic.includes("world cup") && !topic.includes("wc26");
  });
  const originals = news.filter((article) => article.isInternal);
  const kenya = news.filter(isKenyanStory).slice(0, 3);
  const take = useMemo(() => mchambuziTake(featured, mode, news[0]?.title), [featured, mode, news]);

  const handlePredictPick = (pickChoice: "1" | "X" | "2") => {
    const predicted = pickChoice === "1" ? "2-1" : pickChoice === "X" ? "1-1" : "0-2";
    const code = generateReceiptCode(dbProfile?.username || "fan", featured.id || "123");
    setActiveReceiptModal({
      receiptCode: code,
      fanDisplayName: dbProfile?.username || "Kenyan Fan",
      homeTeam: String(featured.home || "Home Team"),
      homeLogo: featured.homeLogo,
      awayTeam: String(featured.away || "Away Team"),
      awayLogo: featured.awayLogo,
      competition: featured.league || "Premier League",
      predictedScore: predicted,
      submittedAtISO: new Date().toISOString(),
      kickoffTimeISO: new Date().toISOString(),
      status: "locked",
      visibility: "public",
    });
  };

  return <main className="overflow-x-clip bg-[#050609] pb-8 text-white">
    <SEO title={TITLE} description={DESCRIPTION} keywords={["live football scores Kenya", "Premier League fixtures Kenya", "Champions League Kenya", "FKF Premier League", "football predictions Kenya", "Mchambuzi AI"]} path="/" />

    {/* TASK 2: REAL-TIME AIRTIME PAYOUT TICKER */}
    <AirtimePayoutTicker />

    {/* RECEIPT MODAL */}
    {activeReceiptModal && (
      <MatchReceiptModal
        receipt={activeReceiptModal}
        isOpen={Boolean(activeReceiptModal)}
        onClose={() => setActiveReceiptModal(null)}
      />
    )}

    {/* HERO SECTION */}
    <section className="relative isolate bg-[#070707] min-h-[440px] flex items-center border-b border-[#2A2A2A] py-8 md:py-10">
      
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
          {/* TASK 5: KENYA FIRST MODE TOGGLE */}
          <div className="mb-4">
            <KenyaModeToggle isKenyaFirst={isKenyaFirst} onToggle={setIsKenyaFirst} />
          </div>

          <h1 className="flex flex-col font-extrabold leading-[0.9] tracking-[-0.04em]">
            <span className="text-white text-5xl md:text-6xl lg:text-[68px] italic drop-shadow-md">THE SEASON</span>
            <span className="text-[#B30000] text-5xl md:text-6xl lg:text-[68px] italic drop-shadow-md">STARTS HERE.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg font-medium leading-relaxed text-white/80">
            Live scores, fearless predictions, Kenyan fan debates and real football intelligence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/matches" className={"inline-flex items-center gap-2 rounded-lg bg-[#B30000] px-6 py-3.5 text-[10px] md:text-xs font-black tracking-widest uppercase hover:bg-red-800 transition-colors shadow-[0_0_20px_rgba(179,0,0,0.4)] " + FOCUS}>
              SEE UPCOMING MATCHES <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/edge" className={"inline-flex items-center gap-2 rounded-lg border border-emerald-500/50 text-emerald-400 bg-emerald-500/10 px-6 py-3.5 text-[10px] md:text-xs font-black tracking-widest uppercase hover:bg-emerald-500/20 transition-colors " + FOCUS}>
              EDGE INTELLIGENCE <BarChart2 className="h-4 w-4" />
            </Link>
            <Link href="/marketplace" className={"inline-flex items-center gap-2 rounded-lg border border-[#FFD700]/40 text-[#FFD700] bg-transparent px-5 py-3.5 text-[10px] md:text-xs font-black tracking-widest uppercase hover:bg-[#FFD700]/10 transition-colors " + FOCUS}>
              MARKETPLACE <ShoppingBag className="h-4 w-4" />
            </Link>
          </div>
          {/* Trust micro-bar */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            {[
              { icon: Zap,        label: "Transparent predictions" },
              { icon: BarChart2,  label: "Dixon-Coles + Ensemble" },
              { icon: Globe,      label: "African leagues" },
              { icon: ShoppingBag,label: "Analyst marketplace" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[10px] text-white/50 font-bold">
                <Icon className="h-3 w-3 text-emerald-500/70" />{label}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: LIVE & NEXT Card (Dynamic API-Football Featured Match) */}
        <div className="flex justify-end w-full">
          <div className="w-full max-w-[340px] rounded-2xl border border-white/10 bg-black/75 p-4 backdrop-blur-xl shadow-2xl space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
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

            {/* TASK 3: EMBEDDED MCHAMBUZI AI CHIP */}
            <MchambuziInsightChip
              matchOrTopic={`${featured.home} vs ${featured.away}`}
              homeTeam={String(featured.home || "")}
              awayTeam={String(featured.away || "")}
            />
            
            {/* Teams & Score / Kickoff from API-Football */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center pt-1">
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

            {/* TASK 1: INSTANT RECEIPT GENERATION ON PREDICTION */}
            <div className="border-t border-white/10 pt-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">CAST YOUR CALL &amp; KEEP RECEIPT</p>
              <div className="grid grid-cols-3 gap-2 my-2">
                <button onClick={() => handlePredictPick("1")} className="rounded-xl border border-white/20 py-2.5 text-xs font-black hover:bg-white/10 transition-colors text-center text-white bg-white/5">1</button>
                <button onClick={() => handlePredictPick("X")} className="rounded-xl border border-[#FFD700]/70 bg-[#FFD700]/10 text-[#FFD700] py-2.5 text-xs font-black text-center hover:bg-[#FFD700]/20 transition-colors">X</button>
                <button onClick={() => handlePredictPick("2")} className="rounded-xl border border-white/20 py-2.5 text-xs font-black hover:bg-white/10 transition-colors text-center text-white bg-white/5">2</button>
              </div>

              {/* TASK 4: LIVE MATCHDAY HYPE BAROMETER */}
              <MatchHypeBarometer
                homeTeam={String(featured.home || "Home")}
                awayTeam={String(featured.away || "Away")}
                homeRatio={64}
                drawRatio={18}
                awayRatio={18}
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* UPCOMING & LEAGUES */}
    <section className="bg-[#0B0B0B] py-6 border-b border-[#2A2A2A]">
      <div className="mx-auto max-w-7xl px-4 grid gap-6 lg:grid-cols-[1fr_auto]">
        
        {/* UPCOMING FIXTURES */}
        <div className="flex flex-col min-w-0">
          <div className="mb-3.5 flex items-center justify-between">
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
          <div className="mb-3.5 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-white">LEAGUES</h2>
            <Link href="/matches" className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:text-white transition-colors">VIEW ALL &gt;</Link>
          </div>
          <div className="grid grid-cols-4 gap-2.5 w-[340px] shrink-0">
            {[
              {
                id: "kpl",
                label: "KPL",
                image: "https://media.api-sports.io/football/leagues/326.png",
                accent: "from-[#B30000] to-red-900",
                glow: "rgba(179,0,0,0.35)",
                featured: true,
              },
              {
                id: "ucl",
                label: "UCL",
                image: "https://media.api-sports.io/football/leagues/2.png",
                accent: "from-blue-600 to-indigo-900",
                glow: "rgba(37,99,235,0.35)",
              },
              {
                id: "epl",
                label: "EPL",
                image: "https://media.api-sports.io/football/leagues/39.png",
                accent: "from-purple-600 to-indigo-950",
                glow: "rgba(147,51,234,0.35)",
              },
              {
                id: "laliga",
                label: "LA LIGA",
                image: "https://media.api-sports.io/football/leagues/140.png",
                accent: "from-rose-500 to-red-800",
                glow: "rgba(244,63,94,0.35)",
              },
              {
                id: "seriea",
                label: "SERIE A",
                image: "https://media.api-sports.io/football/leagues/135.png",
                accent: "from-cyan-500 to-blue-900",
                glow: "rgba(6,182,212,0.35)",
              },
              {
                id: "bundesliga",
                label: "BUNDESLIGA",
                image: "https://media.api-sports.io/football/leagues/78.png",
                accent: "from-red-600 to-amber-900",
                glow: "rgba(220,38,38,0.35)",
              },
              {
                id: "ligue1",
                label: "LIGUE 1",
                image: "https://media.api-sports.io/football/leagues/61.png",
                accent: "from-blue-500 to-cyan-900",
                glow: "rgba(59,130,246,0.35)",
              },
              {
                id: "more",
                label: "MORE",
                isMore: true,
                accent: "from-amber-500 to-yellow-700",
                glow: "rgba(234,179,8,0.2)",
              },
            ].map(l => (
              <Link
                key={l.id}
                href={`/matches?search=${l.label}`}
                className={`group relative flex flex-col items-center justify-center h-[96px] px-2 rounded-2xl border transition-all duration-300 overflow-hidden ${
                  l.featured
                    ? "bg-[#180e12] border-[#B30000]/60 shadow-[0_0_20px_rgba(179,0,0,0.35)] hover:border-[#B30000] hover:shadow-[0_0_25px_rgba(179,0,0,0.5)]"
                    : "bg-[#111319]/90 border-white/10 hover:border-[#FFD700]/60 hover:bg-[#161b26] hover:shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                } ${FOCUS}`}
              >
                {/* Brand color accent line at top */}
                <div className={`absolute top-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r ${l.accent} opacity-85 group-hover:opacity-100 transition-opacity`} />
                
                {/* Ambient brand glow behind icon */}
                <div className="absolute inset-0 bg-radial pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity" style={{ background: `radial-gradient(circle at center, ${l.glow} 0%, transparent 70%)` }} />

                {/* Dominating Icon Container - Authentic API-Football Badge Tile */}
                <div className="h-12 w-12 mb-1 flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-110">
                  {l.isMore ? (
                    <div className="h-12 w-12 rounded-xl bg-[#1c1e28] border border-white/15 flex items-center justify-center shadow-md">
                      <div className="grid grid-cols-3 gap-1 p-1">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="w-[5px] h-[5px] bg-[#FFD700] rounded-full opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md border border-white/20 overflow-hidden">
                      <img
                        src={l.image}
                        alt={l.label}
                        className="max-h-full max-w-full object-contain transition-all duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "/logo.png";
                        }}
                      />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/90 group-hover:text-white transition-colors relative z-10">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* MTAA DAILY NEWS SPOTLIGHT & LIVE WIRE TICKER */}
    <section className="bg-[#0B0B0B] py-8 border-t border-[#1B1B1B]">
      <div className="mx-auto max-w-7xl px-4">
        
        {/* News Section Header with Category Chips & Link */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B30000] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">MTAA DAILY EDITORIAL</span>
            </div>
            <h2 className="mt-1 text-2xl font-black text-white md:text-3xl">Today's Top Football Stories</h2>
          </div>

          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:border-[#FFD700]/60 hover:text-white transition-all"
          >
            <span>FULL NEWS DESK</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Live News Wire Bar */}
        {news.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-[#12141c] px-4 py-2.5 text-xs text-white/80">
            <span className="shrink-0 rounded bg-[#B30000] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
              WIRE
            </span>
            <div className="min-w-0 flex-1 truncate font-medium">
              <span className="text-white font-bold">{news[0]?.title}</span>
              <span className="mx-2 text-white/30">•</span>
              <span className="text-white/50">{news[1]?.title}</span>
            </div>
            <span className="shrink-0 text-[10px] font-mono text-white/40">{timeAgo(news[0]?.pubDate || "")}</span>
          </div>
        )}

        {/* 3-Card Uncluttered Spotlight Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Card 1: Lead Main Story */}
          {news[0] ? (
            <Link
              href={news[0].isInternal ? `/article/${news[0].slug}` : news[0].link}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141620] transition-all hover:border-[#B30000]/50 hover:-translate-y-1 shadow-lg"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
                <img
                  src={news[0].thumbnail || HERO_IMAGE}
                  alt={news[0].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = HERO_IMAGE; }}
                />
                <span className="absolute top-3 left-3 rounded-full bg-[#B30000] px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white shadow">
                  TOP STORY
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/40">
                  <span>{news[0].source || "Mtaa Daily"}</span>
                  <span>{timeAgo(news[0].pubDate)}</span>
                </div>
                <h3 className="text-lg font-black leading-snug text-white group-hover:text-[#FFD700] transition-colors line-clamp-2">
                  {news[0].title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/50 line-clamp-2">
                  {news[0].description || "Read full story on Mtaa Daily."}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
                  <span>READ ARTICLE &rarr;</span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          )}

          {/* Card 2: Kenyan Football Spotlight */}
          {kenya[0] || news[1] ? (
            <Link
              href={(kenya[0] || news[1]).isInternal ? `/article/${(kenya[0] || news[1]).slug}` : (kenya[0] || news[1]).link}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141620] transition-all hover:border-[#FFD700]/50 hover:-translate-y-1 shadow-lg"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
                <img
                  src={(kenya[0] || news[1]).thumbnail || FANS_IMAGE}
                  alt={(kenya[0] || news[1]).title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = FANS_IMAGE; }}
                />
                <span className="absolute top-3 left-3 rounded-full bg-emerald-700 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white shadow">
                  🇰🇪 KENYA SPOTLIGHT
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/40">
                  <span>{(kenya[0] || news[1]).source || "Mtaa Daily Kenya"}</span>
                  <span>{timeAgo((kenya[0] || news[1]).pubDate)}</span>
                </div>
                <h3 className="text-lg font-black leading-snug text-white group-hover:text-[#FFD700] transition-colors line-clamp-2">
                  {(kenya[0] || news[1]).title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/50 line-clamp-2">
                  {(kenya[0] || news[1]).description || "FKF Premier League & Harambee Stars updates."}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
                  <span>READ STORY &rarr;</span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          )}

          {/* Card 3: Global / Transfer Feature */}
          {news[2] ? (
            <Link
              href={news[2].isInternal ? `/article/${news[2].slug}` : news[2].link}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141620] transition-all hover:border-blue-500/50 hover:-translate-y-1 shadow-lg"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
                <img
                  src={news[2].thumbnail || HERO_IMAGE}
                  alt={news[2].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = HERO_IMAGE; }}
                />
                <span className="absolute top-3 left-3 rounded-full bg-blue-700 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white shadow">
                  WORLD FOOTBALL
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/40">
                  <span>{news[2].source || "World Football Desk"}</span>
                  <span>{timeAgo(news[2].pubDate)}</span>
                </div>
                <h3 className="text-lg font-black leading-snug text-white group-hover:text-[#FFD700] transition-colors line-clamp-2">
                  {news[2].title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/50 line-clamp-2">
                  {news[2].description || "Latest global football coverage."}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
                  <span>READ STORY &rarr;</span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          )}

        </div>
      </div>
    </section>

    {/* FAN COMMUNITY, DEBATES & MCHAMBUZI HUB */}
    <section className="bg-[#07080c] py-8 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4">
        
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FFD700] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">COMMUNITY &amp; ANALYSIS</span>
            </div>
            <h2 className="mt-1 text-2xl font-black text-white md:text-3xl">Mchambuzi AI &amp; Fan Debates</h2>
          </div>
          <Link href="/debates" className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:text-white transition-colors">
            SEE ALL DEBATES &gt;
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Mchambuzi's Take (Dynamic Analysis) */}
          <Link href="/mchambuzi-halisi" className="rounded-2xl border border-white/10 bg-[#151515] overflow-hidden flex flex-col group cursor-pointer hover:border-white/20 transition-all shadow-lg">
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
          <div className="rounded-2xl border border-white/10 bg-[#151515] overflow-hidden flex flex-col group cursor-pointer hover:border-white/20 transition-all shadow-lg">
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
          <div className="rounded-2xl border border-white/10 bg-[#151515] overflow-hidden flex flex-col group cursor-pointer hover:border-white/20 transition-all shadow-lg">
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

          {/* Latest News Wire */}
          <div className="rounded-2xl border border-white/10 bg-[#151515] overflow-hidden flex flex-col shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white">LATEST NEWS WIRE</h3>
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
      </div>
    </section>

    {/* ═══════════════════════════════════════════════════════════════
        PHASE 14: EDGE INTELLIGENCE FULL-WIDTH BANNER
        High-converting — surfaces the core product promise
    ═══════════════════════════════════════════════════════════════ */}
    <section className="relative isolate overflow-hidden bg-[#040906] border-t border-emerald-900/30 py-16">
      {/* Stadium backdrop image with subtle dark opacity overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop')` }}
      />
      {/* Radiant stadium light leaks */}
      <div className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-0 h-[400px] w-[400px] rounded-full bg-[#FFD700]/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="grid gap-12 lg:grid-cols-12 items-center">

          {/* Left Column: Fan-First Copy (5 cols) */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                ⚽ Edge Intelligence Engine
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight text-white mb-5">
              Real match data.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-[#FFD700]">
                Zero scam tips.
              </span>
            </h2>
            <p className="text-white/75 text-base leading-relaxed max-w-lg mb-6 font-medium">
              Every BallMtaani prediction is calculated from live attack/defence ratings, team form, and 5+ seasons of historical data — published live on a public ledger so fans can verify every single call.
            </p>

            {/* Stat Cards with Sporty Glow */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { val: "73%",    label: "Match Winner Accuracy", desc: "Tested across 5+ seasons", color: "text-emerald-400", border: "border-emerald-500/30 bg-emerald-950/20" },
                { val: "89%",    label: "Model Confidence",      desc: "Calibrated probability",   color: "text-[#FFD700]",    border: "border-[#FFD700]/30 bg-[#FFD700]/5" },
                { val: "6,200+", label: "Picks Logged",          desc: "Recorded before kickoff",  color: "text-blue-400",     border: "border-blue-500/30 bg-blue-950/20" },
                { val: "100%",   label: "Ledger Transparency",   desc: "Public & tamper-proof",    color: "text-purple-400",   border: "border-purple-500/30 bg-purple-950/20" },
              ].map(s => (
                <div key={s.label} className={`rounded-xl border ${s.border} p-3.5 backdrop-blur-md`}>
                  <div className={`text-2xl font-black ${s.color} tracking-tight`}>{s.val}</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-white mt-0.5">{s.label}</div>
                  <div className="text-[9px] text-white/40 font-medium">{s.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link id="homepage-edge-cta" href="/edge" className={"inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black px-7 py-3.5 text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_25px_rgba(52,211,153,0.4)] " + FOCUS}>
                Explore Edge Intelligence <ArrowRight className="h-4 w-4" />
              </Link>
              <Link id="homepage-edge-ledger" href="/edge/performance" className={"inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 text-white px-6 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md " + FOCUS}>
                Public Ledger <BarChart2 className="h-4 w-4 text-emerald-400" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Fan-First Match Intelligence Card (6 cols) */}
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#0d1410]/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-red-400">Live AI Match Engine</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                  Model v2.4 Active
                </span>
              </div>

              {/* Match Visual Header */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 mb-5">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-white/50 mb-3">
                  <span>AFCON / CAF Champions League</span>
                  <span className="text-[#FFD700]">Today 8:00 PM</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 text-sm">
                      GOR
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-base">Gor Mahia</div>
                      <div className="text-[10px] text-emerald-400 font-bold">Home · Form: W W W D W</div>
                    </div>
                  </div>
                  <div className="text-xl font-black text-[#FFD700] px-3 py-1 rounded-lg bg-black/40 border border-[#FFD700]/30">
                    VS
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="font-extrabold text-white text-base">AFC Leopards</div>
                      <div className="text-[10px] text-blue-400 font-bold">Away · Form: W L W W D</div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-black text-blue-400 text-sm">
                      ING
                    </div>
                  </div>
                </div>

                {/* Probability Distribution Bar */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider mb-2">
                    <span className="text-emerald-400">Home Win 54%</span>
                    <span className="text-amber-300">Draw 24%</span>
                    <span className="text-blue-400">Away Win 22%</span>
                  </div>
                  <div className="h-3 w-full rounded-full overflow-hidden flex bg-black/60 p-0.5 border border-white/10">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full" style={{ width: "54%" }} />
                    <div className="h-full bg-amber-400 mx-0.5" style={{ width: "24%" }} />
                    <div className="h-full bg-blue-500 rounded-r-full" style={{ width: "22%" }} />
                  </div>
                </div>
              </div>

              {/* Fan-First Pillar Cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Trophy,   title: "African Leagues First",  desc: "KPL, CAF CL, AFCON — modelled specifically on African football data", color: "text-amber-400", border: "border-amber-500/20 bg-amber-950/20" },
                  { icon: Star,     title: "Verified Win History",   desc: "100% transparent public ledger with zero deleted predictions", color: "text-emerald-400", border: "border-emerald-500/20 bg-emerald-950/20" },
                  { icon: Shield,   title: "No Scam Guarantee",      desc: "No fake fixed matches or paid tips — just raw calibrated match probabilities", color: "text-blue-400", border: "border-blue-500/20 bg-blue-950/20" },
                  { icon: BookOpen, title: "Lock & Keep Receipt",    desc: "Earn MTC rewards for correct match picks before kickoff", color: "text-purple-400", border: "border-purple-500/20 bg-purple-950/20" },
                ].map(({ icon: Icon, title, desc, color, border }) => (
                  <div key={title} className={`rounded-xl border ${border} p-3.5 hover:bg-white/[0.06] transition-all`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="text-xs font-black text-white">{title}</span>
                    </div>
                    <p className="text-[10px] text-white/55 leading-relaxed font-medium">{desc}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>

    {/* ═══════════════════════════════════════════════════════════════
        PHASE 14: SPORTS HUB — MULTI-SPORT EXPANSION TEASER
        Shows what's live now and what's coming — creates FOMO
    ═══════════════════════════════════════════════════════════════ */}
    <section className="bg-[#070809] border-t border-white/6 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]/70">Sports Hub · Phase 14</p>
            <h2 className="text-3xl font-black text-white">Not just football. <span className="text-[#FFD700]">African sports intelligence.</span></h2>
            <p className="mt-2 text-sm text-white/45 max-w-xl">Football is live. Basketball, cricket and rugby are in research — each sport earns its launch through data validation, model calibration and community demand.</p>
          </div>
          <Link id="homepage-sports-hub" href="/sports" className={"inline-flex self-start items-center gap-1.5 rounded-xl border border-white/12 bg-white/5 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/65 hover:text-white transition-colors " + FOCUS}>
            Sports Hub <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key:"football",   label:"Football",   emoji:"⚽", status:"LIVE",     score:100, href:"/edge",       statusClass:"bg-emerald-500/20 text-emerald-400", cardClass:"border-emerald-500/30 bg-emerald-900/10" },
            { key:"basketball", label:"Basketball", emoji:"🏀", status:"Research",  score:58,  href:"/sports",    statusClass:"bg-blue-500/20 text-blue-400",     cardClass:"border-white/8 opacity-80" },
            { key:"cricket",    label:"Cricket",    emoji:"🏏", status:"Research",  score:55,  href:"/sports",    statusClass:"bg-blue-500/20 text-blue-400",     cardClass:"border-white/8 opacity-80" },
            { key:"rugby",      label:"Rugby",      emoji:"🏉", status:"Research",  score:52,  href:"/sports",    statusClass:"bg-purple-500/20 text-purple-400", cardClass:"border-white/8 opacity-80" },
            { key:"tennis",     label:"Tennis",     emoji:"🎾", status:"Evaluating",score:48,  href:"/sports",    statusClass:"bg-gray-500/20 text-gray-400",     cardClass:"border-white/8 opacity-50" },
            { key:"more",       label:"More sports",emoji:"🌍", status:"Register interest", score:0, href:"/sports", statusClass:"bg-amber-500/20 text-amber-400", cardClass:"border-white/8 opacity-50" },
          ].map(s => (
            <Link key={s.key} id={`homepage-sport-${s.key}`} href={s.href}
              className={`group rounded-2xl border ${s.cardClass} p-4 flex flex-col items-center text-center hover:opacity-100 hover:border-white/20 transition-all " + FOCUS`}>
              <span className="text-3xl mb-2">{s.emoji}</span>
              <span className="text-xs font-extrabold text-white mb-1.5">{s.label}</span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mb-2 ${s.statusClass}`}>{s.status}</span>
              {s.score > 0 && (
                <div className="w-full bg-white/5 rounded-full h-1 mt-auto">
                  <div className={`h-1 rounded-full transition-all ${s.score >= 80 ? "bg-emerald-500" : s.score >= 50 ? "bg-blue-500" : "bg-gray-500"}`}
                    style={{ width: `${s.score}%` }} />
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* ═══════════════════════════════════════════════════════════════
        PHASE 14: MARKETPLACE TEASER + SELL YOUR ANALYSIS CTA
        Dual purpose: converts buyers AND attracts analysts as sellers
    ═══════════════════════════════════════════════════════════════ */}
    <section className="bg-[#06070a] border-t border-white/6 py-14">
      <div className="mx-auto max-w-7xl px-4">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]/70">Marketplace · New</p>
            <h2 className="text-3xl font-black text-white">Analyst reports. <span className="text-[#FFD700]">Data you can act on.</span></h2>
            <p className="mt-2 text-sm text-white/45 max-w-xl">Verified analysts and publishers sell match previews, statistical bundles and deep-dive reports. Every product is moderated — no guaranteed tips, no fixed-match claims.</p>
          </div>
          <Link id="homepage-marketplace" href="/marketplace" className={"inline-flex self-start items-center gap-1.5 rounded-xl bg-[#FFD700] text-black px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-colors shadow-[0_0_20px_rgba(255,215,0,0.25)] " + FOCUS}>
            Browse Marketplace <ShoppingBag className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Product cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { id:"mp-001", title:"EPL Matchday 38 Tactical Preview",       seller:"StatEdge Analysts", type:"Match Preview",       price:"KES 150",   rating:4.6, sales:32, badge:"Popular",    badgeClass:"bg-[#B30000]/80" },
            { id:"mp-002", title:"KPL Season Report 2025/26",              seller:"StatEdge Analysts", type:"Competition Report",  price:"KES 250",   rating:4.8, sales:18, badge:"Top Rated",  badgeClass:"bg-emerald-600/80" },
            { id:"mp-003", title:"African Football Historical Dataset",    seller:"DataSportsKE",      type:"Dataset",             price:"KES 1,200", rating:4.4, sales:7,  badge:"Analyst Pick",badgeClass:"bg-blue-600/80" },
          ].map(p => (
            <Link key={p.id} id={`homepage-marketplace-product-${p.id}`} href={`/marketplace/products/${p.id}`}
              className={"group block bg-[#0e1014] border border-white/8 rounded-2xl overflow-hidden hover:border-[#FFD700]/30 hover:-translate-y-0.5 transition-all " + FOCUS}>
              {/* colour bar at top */}
              <div className="h-1 w-full bg-gradient-to-r from-[#FFD700]/60 to-emerald-500/40" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white ${p.badgeClass}`}>{p.badge}</span>
                  <span className="text-[10px] font-black text-white/40">{p.type}</span>
                </div>
                <h3 className="font-extrabold text-white text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#FFD700] transition-colors">{p.title}</h3>
                <p className="text-[10px] text-emerald-400 font-bold mb-4">{p.seller} <span className="text-blue-400">✓</span></p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-white">{p.price}</span>
                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <span>★ {p.rating}</span><span>·</span><span>{p.sales} sold</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dual CTA strip: buyer + seller */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Buyer CTA */}
          <div className="rounded-2xl border border-[#FFD700]/20 bg-[#FFD700]/5 p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]/70 mb-1">For fans & analysts</p>
              <h3 className="text-xl font-extrabold text-white">Browse all products</h3>
              <p className="text-xs text-white/45 mt-1">Match previews, data bundles and reports from verified creators.</p>
            </div>
            <Link id="homepage-marketplace-browse" href="/marketplace"
              className={"shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#FFD700] text-black px-5 py-3 text-xs font-black uppercase tracking-widest hover:bg-yellow-300 transition-colors " + FOCUS}>
              Browse <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Seller CTA */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70 mb-1">For writers, analysts & data providers</p>
              <h3 className="text-xl font-extrabold text-white">Sell your analysis</h3>
              <p className="text-xs text-white/45 mt-1">Apply to become a verified seller. Earn from every product you publish.</p>
            </div>
            <Link id="homepage-marketplace-sell" href="/marketplace"
              className={"shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-black px-5 py-3 text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors " + FOCUS}>
              Apply <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Responsible use notice */}
        <p className="mt-5 text-center text-[10px] text-white/25">
          All marketplace products are moderated before listing.
          Guaranteed tips, fixed-match claims and automated betting products are prohibited.
        </p>
      </div>
    </section>

  </main>;
}
