import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDebates, useLeaderboard, useMatches, useRecentMatches, useUpcomingFixtures } from "../hooks/useData";
import { fetchTodaysFixtures } from "../lib/football-api";
import { fetchFootballNews, fetchPartnerArticles, timeAgo, type NewsArticle } from "../lib/news-api";
import { getHomepageMode, selectFeaturedMatch, type HomepageMatch } from "../lib/home-season";
import SEO from "../components/SEO";
import TeamLogo from "../components/TeamLogo";
import { supabase } from "../lib/supabase";

const DEFAULT_IMAGE = "/images/hero_player_celebration.png";
const ANALYST_IMAGE = "/images/analyst_chalkboard.png";
const FANS_IMAGE = "/images/kenyan_fans.png";
const TITLE = "BALLMTAANI | Football. From where we stand.";
const DESCRIPTION = "Ball Mtaani is a premium Kenyan football publication with live scores, fixtures, tables, Mchambuzi analysis, predictions, debates, and original stories from Mtaa Daily.";

function text(article: Pick<NewsArticle, "title" | "description" | "source">) {
  return `${article.title} ${article.description || ""} ${article.source || ""}`.toLowerCase();
}

const FOOTBALL_TERMS = ["football", "soccer", "premier league", "champions league", "ucl", "epl", "serie a", "la liga", "bundesliga", "transfer", "fixture", "match", "league", "cup", "africa", "caf", "afcon", "kenya", "harambee", "fkf", "gor mahia", "afc leopards", "tusker", "goal", "goals"];
const NON_FOOTBALL_TERMS = ["president", "white house", "senate", "congress", "government", "politics", "election", "supreme court", "court", "war", "tariff", "economy", "economic", "minister", "policy"];

function isFootballStory(article: Pick<NewsArticle, "title" | "description" | "source">) {
  const t = text(article);
  const footballHits = FOOTBALL_TERMS.filter((term) => t.includes(term)).length;
  const nonFootballHits = NON_FOOTBALL_TERMS.filter((term) => t.includes(term)).length;
  return footballHits >= 2 && nonFootballHits === 0;
}

function href(article: NewsArticle) { return article.isInternal ? `/news/${article.slug}` : article.link; }
function category(article: NewsArticle, fallback: string) {
  const t = text(article);
  if (t.includes("kenya") || t.includes("fkf") || t.includes("harambee") || t.includes("gor mahia") || t.includes("afc leopards")) return "Kenya";
  if (t.includes("africa") || t.includes("caf") || t.includes("afcon") || t.includes("east africa")) return "Africa";
  if (t.includes("analysis") || t.includes("opinion") || t.includes("tactics") || t.includes("breakdown") || t.includes("preview")) return "Analysis";
  if (t.includes("transfer")) return "Transfers";
  if (t.includes("premier league") || t.includes("arsenal") || t.includes("chelsea") || t.includes("liverpool") || t.includes("manchester united") || t.includes("man utd")) return "EPL";
  return fallback;
}
function sortStories(list: NewsArticle[]) { return [...list].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()); }
function pickStories(list: NewsArticle[], keywords: string[], limit = 4) {
  const out = list.filter((a) => keywords.some((k) => text(a).includes(k)));
  for (const article of list) { if (out.length >= limit) break; if (!out.includes(article)) out.push(article); }
  return out.slice(0, limit);
}

function normalizeStoryTitle(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function storyKey(article: NewsArticle) {
  const titleKey = normalizeStoryTitle(article.title);
  const sourceKey = normalizeStoryTitle(article.source);
  return [titleKey, sourceKey].filter(Boolean).join("::");
}

function takeUnique(source: NewsArticle[], used: Set<string>, limit: number) {
  const chosen: NewsArticle[] = [];
  for (const article of source) {
    if (chosen.length >= limit) break;
    const key = storyKey(article);
    if (used.has(key)) continue;
    used.add(key);
    chosen.push(article);
  }
  return chosen;
}

function dedupeStories(source: NewsArticle[]) {
  const seen = new Map<string, NewsArticle>();
  for (const article of source) {
    const key = storyKey(article);
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, article);
      continue;
    }
    if (!existing.isInternal && article.isInternal) {
      seen.set(key, article);
    }
  }
  return [...seen.values()];
}

function takeMatchingUnique(source: NewsArticle[], used: Set<string>, keywords: string[], limit: number) {
  const ranked = sortStories(source).filter((article) => keywords.some((keyword) => text(article).includes(keyword)));
  const fallback = sortStories(source);
  const chosen: NewsArticle[] = [];
  for (const article of ranked) {
    if (chosen.length >= limit) break;
    const key = storyKey(article);
    if (used.has(key)) continue;
    used.add(key);
    chosen.push(article);
  }
  for (const article of fallback) {
    if (chosen.length >= limit) break;
    const key = storyKey(article);
    if (used.has(key)) continue;
    used.add(key);
    chosen.push(article);
  }
  return chosen.slice(0, limit);
}
function kickoff(match?: HomepageMatch) { return match?.time || (match?.kickoffAt ? new Date(match.kickoffAt).toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Nairobi" }) : "Kickoff TBC"); }
function short(name: string) { return name.replace(/\s+(FC|SC|AFC|City|United|Town|Rovers|Athletic|Stars?)$/i, "").trim(); }

function SectionTitle({ eyebrow, title, copy, href: to, action }: { eyebrow: string; title: string; copy?: string; href?: string; action?: string }) {
  return <div className="mb-2.5 flex items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#B30000]">{eyebrow}</p><h2 className="mt-2 font-serif text-lg text-white md:text-[1.6rem]">{title}</h2>{copy && <p className="mt-2 max-w-2xl text-xs leading-6 text-white/45">{copy}</p>}</div>{to && action && <Link href={to} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white">{action}<ChevronRight className="h-3.5 w-3.5" /></Link>}</div>;
}

function StoryCard({ article, compact = false }: { article: NewsArticle; compact?: boolean }) {
  return <Link href={href(article)} className={`group block transition ${compact ? "grid grid-cols-[82px_minmax(0,1fr)] gap-2.5 border-b border-white/[0.07] pb-3 hover:border-white/[0.12]" : "hover:translate-y-[-1px]"}`}>
    <div className={`${compact ? "aspect-[4/3] rounded-[0.8rem]" : "aspect-[16/10] rounded-[1rem]"} relative overflow-hidden bg-black/40`}>
      <img src={article.thumbnail || DEFAULT_IMAGE} alt={article.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }} />
      {!compact && <div className="absolute inset-0 bg-gradient-to-t from-black via-black/22 to-transparent" />}
    </div>
    <div className={compact ? "pt-0.5" : "p-3.5"}>
      <div className="mb-2 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.22em] text-white/33"><span>{category(article, article.isInternal ? "Mtaa Daily" : article.source)}</span><span>{timeAgo(article.pubDate)}</span></div>
      <h3 className={`${compact ? "text-[0.88rem]" : "text-[1.02rem]"} font-black leading-snug text-white transition group-hover:text-[#FFD700]`}>{article.title}</h3>
      {!compact && article.description && <p className="mt-2 line-clamp-2 text-xs leading-6 text-white/48">{article.description}</p>}
    </div>
  </Link>;
}

function FixtureCard({ match }: { match: HomepageMatch }) {
  const scored = typeof match.homeScore === "number" && typeof match.awayScore === "number";
  return <div className="bg-[#0d1016] px-4 py-4 ring-1 ring-white/[0.06]">
    <div className="mb-3 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.22em] text-white/35"><span>{match.league || "Football"}</span><span>{kickoff(match)}</span></div>
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2"><TeamLogo logo={match.homeLogo} initial={short(match.home).slice(0, 3).toUpperCase()} color={match.homeColor || "#1f2937"} size="xs" /><span className="truncate text-sm font-bold text-white">{match.home}</span></div>
      <div className="px-2 text-lg font-black text-white">{scored ? `${match.homeScore}•${match.awayScore}` : "vs"}</div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2"><span className="truncate text-right text-sm font-bold text-white">{match.away}</span><TeamLogo logo={match.awayLogo} initial={short(match.away).slice(0, 3).toUpperCase()} color={match.awayColor || "#1f2937"} size="xs" /></div>
    </div>
    <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#FFD700]/75"><span>{match.status || "Kickoff"}</span><span>{scored ? "Receipt" : "Preview"}</span></div>
  </div>;
}

export default function PublicationHomePage() {
  const { dbProfile } = useAuth();
  const { data: live = [] } = useMatches();
  const { data: upcoming = [] } = useUpcomingFixtures();
  const { data: recent = [] } = useRecentMatches();
  const { data: debates = [] } = useDebates();
  const { data: leaderboard = [] } = useLeaderboard();
  const [todayFixtures, setTodayFixtures] = useState<HomepageMatch[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchTodaysFixtures().then((fixtures) => { if (!cancelled) setTodayFixtures(fixtures); }).catch(() => undefined);
    Promise.allSettled([fetchPartnerArticles(), fetchFootballNews()]).then(([partnerResult, wireResult]) => {
      if (cancelled) return;
      const partner = partnerResult.status === "fulfilled" ? partnerResult.value : [];
      const wire = wireResult.status === "fulfilled" ? wireResult.value : [];
      setNews(sortStories([...partner, ...wire]));
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 60_000); return () => window.clearInterval(timer); }, []);

  const allStories = useMemo(() => dedupeStories(sortStories(news)), [news]);
  const footballStories = useMemo(() => allStories.filter((article) => isFootballStory(article)), [allStories]);
  const internal = useMemo(() => footballStories.filter((article) => article.isInternal), [footballStories]);
  const external = useMemo(() => allStories.filter((article) => !article.isInternal), [allStories]);
  const footballExternal = useMemo(() => external.filter((article) => isFootballStory(article)), [external]);
  const storyPool = footballStories.length ? footballStories : allStories;
  const wirePool = footballExternal.length ? footballExternal : external;
  const usedStories = new Set<string>();
  const lead = internal[0] || footballStories[0] || allStories[0];
  if (lead) usedStories.add(storyKey(lead));
  const rail = takeUnique(storyPool, usedStories, 3);
  const kenya = takeMatchingUnique(storyPool, usedStories, ["kenya", "harambee", "fkf", "gor mahia", "afc leopards", "tusker", "east africa"], 3);
  const epl = takeMatchingUnique(storyPool, usedStories, ["premier league", "arsenal", "chelsea", "liverpool", "manchester united", "man utd", "spurs"], 3);
  const analysis = takeMatchingUnique(storyPool, usedStories, ["analysis", "opinion", "tactical", "tactics", "preview", "breakdown"], 3);
  const africa = takeMatchingUnique(storyPool, usedStories, ["africa", "caf", "afcon", "east africa", "national team"], 3);
  const wire = takeUnique(wirePool, usedStories, 3);
  const featured = useMemo(() => selectFeaturedMatch({ liveMatches: live, upcomingFixtures: upcoming, recentMatches: recent, followedClub: dbProfile?.favorite_team || null }).match, [dbProfile?.favorite_team, live, recent, upcoming]);
  const mode = getHomepageMode({ now, liveMatches: live, todaysFixtures: todayFixtures });
  const liveLine = featured || live[0] || upcoming[0] || recent[0];
  const topDebate = debates[0];
  const topFan = leaderboard[0];
  const todayCards = (todayFixtures.length ? todayFixtures : [...live, ...upcoming].slice(0, 4)).slice(0, 4);
  const author = lead?.source || "Mtaa Daily Desk";
  const take = useMemo(() => {
    if (featured) {
      const score = typeof featured.homeScore === "number" && typeof featured.awayScore === "number" ? ` at ${featured.homeScore}•${featured.awayScore}` : "";
      return `${featured.home} vs ${featured.away}${score} is the room to watch. ${lead ? `Follow the line through ${lead.title}.` : "Read the shape of the match before the timeline hardens into a take."}`;
    }
    return lead ? `This week runs through ${lead.title}. Read the detail before the group chat rewrites it.` : "The useful calls live in the margins: team news, tempo and the one detail everyone else is missing.";
  }, [featured, lead]);

  const submitNewsletter = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = newsletterEmail.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setNewsletterError("Please enter a valid email address."); setNewsletterState("error"); return; }
    setNewsletterState("submitting");
    setNewsletterError(null);
    try {
      if (supabase) {
        const { error } = await supabase.from("newsletter_subscribers").insert({ email, source_page: "homepage", consent_timestamp: new Date().toISOString(), favorite_club: dbProfile?.favorite_team || null, created_at: new Date().toISOString() });
        if (error) throw error;
      }
      setNewsletterEmail("");
      setNewsletterState("success");
    } catch {
      setNewsletterState("error");
      setNewsletterError("We could not save your subscription right now. Please try again later.");
    }
  };

  const badge = mode === "matchday" ? "MATCHDAY" : mode === "pre-season" ? "PRE-SEASON" : "FOOTBALL WEEK";

  return (
    <main className="bg-[#060606] text-white">
      <SEO title={TITLE} description={DESCRIPTION} keywords={["BallMtaani", "Mtaa Daily", "live scores Kenya", "Kenyan football publication", "African football", "Mchambuzi"]} path="/" canonicalUrl="/" image={lead?.thumbnail || DEFAULT_IMAGE} />

      <section id="mtaa-daily" className="bg-black">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:py-6">
          <div className="grid gap-3 lg:grid-cols-[1.38fr_0.62fr]">
            {lead ? <Link href={href(lead)} className="group relative min-h-[390px] overflow-hidden bg-[#0b0b0b] ring-1 ring-white/[0.05] md:min-h-[460px]">
              <img src={lead.thumbnail || DEFAULT_IMAGE} alt={lead.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }} />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5 lg:p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-white/60"><span className="rounded-sm bg-[#B30000] px-2 pt-0.5 text-white">{badge}</span><span>{author}</span><span>•</span><span>{timeAgo(lead.pubDate)}</span></div>
                <p className="mb-3 max-w-md text-xs font-bold uppercase tracking-[0.24em] text-[#FFD700]/80">{category(lead, "Mtaa Daily")}</p>
                <h1 className="max-w-lg font-serif text-3xl leading-[0.92] text-white sm:text-[2.45rem] lg:text-[2.85rem]">{lead.title}</h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/78 sm:text-[0.98rem] sm:leading-7">{lead.description || "The front page story, told cleanly."}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/75">Read story <ArrowRight className="h-3.5 w-3.5" /></span><span className="text-[10px] uppercase tracking-[0.24em] text-white/35">Original reporting</span></div>
              </div>
            </Link> : <div className="flex min-h-[460px] items-end border border-white/[0.05] bg-white/[0.02] p-5 text-sm text-white/45">More front-page stories will appear here once the newsroom fills.</div>}
            <aside className="space-y-3">{rail.length ? rail.slice(0, 3).map((article) => <StoryCard key={article.slug || article.link || article.id} article={article} compact />) : <p className="px-1 py-3 text-xs text-white/45">More top stories will appear here as fresh reporting arrives.</p>}<Link href="/news" className="flex items-center justify-between border-b border-white/[0.1] px-1 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#FFD700]/80 transition-colors hover:text-white">More top stories <ChevronRight className="h-4 w-4" /></Link></aside>
          </div>
        </div>
      </section>

      <section className="bg-transparent"><div className="mx-auto max-w-7xl px-4 py-4"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#FFD700]/80">Today in football</p><h2 className="mt-1 font-serif text-lg text-white">The newspaper scoreboard</h2></div><Link href="/matches" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white">View all fixtures <ChevronRight className="h-3.5 w-3.5" /></Link></div><div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">{todayCards.length ? todayCards.map((match) => <FixtureCard key={String(match.id)} match={match} />) : <p className="px-1 py-3 text-xs text-white/45">Fixtures will appear here when today's slate is available.</p>}</div></div></section>

      <section className="bg-transparent"><div className="mx-auto max-w-7xl px-4 py-5 lg:py-6"><div className="grid gap-3 lg:grid-cols-[1.02fr_0.98fr]"><div className="py-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#B30000]">Live match centre</p><h2 className="mt-1 font-serif text-lg text-white">The live desk.</h2></div><Link href="/live-center" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55 hover:text-white">Open live centre</Link></div>{liveLine ? <div className="grid gap-4 rounded-2xl bg-black/25 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center"><div className="flex items-center gap-3"><TeamLogo logo={liveLine.homeLogo} initial={short(liveLine.home).slice(0,3).toUpperCase()} color="#101820" size="md" /><div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/35">{liveLine.league || "Match centre"}</p><h3 className="mt-1 text-xl font-black text-white">{liveLine.home}</h3></div></div><div className="text-center"><div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]/80">{liveLine.status || "LIVE"}</div><div className="my-2 text-5xl font-black leading-none text-white sm:text-6xl">{typeof liveLine.homeScore === "number" && typeof liveLine.awayScore === "number" ? `${liveLine.homeScore}•${liveLine.awayScore}` : "VS"}</div><div className="text-[10px] uppercase tracking-[0.22em] text-white/45">{kickoff(liveLine)}</div></div><div className="flex items-center gap-3 sm:justify-end"><div className="text-right"><p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/35">{liveLine.time || liveLine.date || "Kickoff"}</p><h3 className="mt-1 text-lg font-black text-white">{liveLine.away}</h3></div><TeamLogo logo={liveLine.awayLogo} initial={short(liveLine.away).slice(0,3).toUpperCase()} color="#101820" size="md" /></div></div> : <div className="h-[242px] animate-pulse bg-white/5" />}</div><div className="bg-[#0c0d12]/90 p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#FFD700]/80">Mtaa intelligence</p><h2 className="mt-1 font-serif text-2xl text-white">Mchambuzi&apos;s read</h2></div><span className="rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 pt-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-[#FFD700]">AI</span></div><div className="grid gap-4 md:grid-cols-[1fr_112px] md:items-end"><div className="space-y-3"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#B30000]">Mchambuzi&apos;s read</p><p className="max-w-xl text-sm leading-6 text-white/75">{take}</p><div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-white/40"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Game state</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Tempo</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Fan read</span></div><Link href="/mchambuzi-halisi" className="inline-flex items-center gap-2 rounded-full bg-[#B30000] px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white">Ask Mchambuzi <ArrowRight className="h-3.5 w-3.5" /></Link></div><img src={ANALYST_IMAGE} alt="Mchambuzi analysis" className="hidden w-full rounded-2xl object-cover md:block" /></div></div></div></div></section>
      <section id="kenya" className="bg-transparent"><div className="mx-auto max-w-7xl px-4 py-5 lg:py-6">{SectionTitle({ eyebrow: "Kenya & East Africa", title: "The local game", href: "/news", action: "View all" })}<div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">{kenya[0] ? <StoryCard article={kenya[0]} /> : <div className="min-h-[340px] animate-pulse bg-white/5" />}<div className="space-y-0">{kenya.slice(1,4).map((article) => <StoryCard key={article.slug || article.link || article.id} article={article} compact />)}</div></div></div></section>

      <section id="epl" className="bg-transparent"><div className="mx-auto max-w-7xl px-4 py-5 lg:py-6">{SectionTitle({ eyebrow: "Premier League", title: "Premier League", href: "/news", action: "View all" })}<div className="grid gap-4 lg:grid-cols-[1.16fr_0.84fr]">{epl[0] && <StoryCard article={epl[0]} /> }<div className="grid gap-2">{epl.slice(1,4).map((article) => <StoryCard key={article.slug || article.link || article.id} article={article} compact />)}</div></div></div></section>

      <section id="analysis" className="bg-transparent"><div className="mx-auto max-w-7xl px-4 py-5 lg:py-6">{SectionTitle({ eyebrow: "Analysis & Opinion", title: "Analysis / Opinion", href: "/articles", action: "Long reads" })}<div className="grid gap-4 lg:grid-cols-[1.14fr_0.86fr]">{analysis[0] ? <StoryCard article={analysis[0]} /> : <div className="rounded-xl bg-white/[0.02] px-4 py-3 text-xs text-white/45">Analysis will appear here once enough editorial pieces are available.</div>}<div className="grid gap-2">{analysis.slice(1,4).map((article) => <StoryCard key={article.slug || article.link || article.id} article={article} compact />)}</div></div></div></section>

      <section className="bg-transparent"><div className="mx-auto max-w-7xl px-4 py-5 lg:py-6"><div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]"><div className="py-4"><p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#FFD700]/80">The Mtaa Brief</p><h2 className="mt-2 font-serif text-2xl text-white">Morning football, in one clean read.</h2><p className="mt-3 max-w-xl text-xs leading-6 text-white/55">For Kenya, Africa, EPL, transfers and today&apos;s matches</p><form onSubmit={submitNewsletter} className="mt-5 space-y-3"><div className="grid gap-3 sm:grid-cols-[1fr_auto]"><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="you@email.com" className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#FFD700] focus:outline-none" /><button type="submit" disabled={newsletterState === "submitting"} className="rounded-xl bg-[#B30000] px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#cf1b1b] disabled:opacity-60">{newsletterState === "submitting" ? "Joining..." : "Join free"}</button></div><div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-white/40"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Kenya</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Africa</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">EPL</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Transfers</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Today&apos;s matches</span></div>{newsletterError && <p className="text-sm text-red-300">{newsletterError}</p>}{newsletterState === "success" && <p className="text-sm text-emerald-300">You&apos;re in. We&apos;ll send the next edition to your inbox.</p>}</form></div><div className="grid gap-4 sm:grid-cols-2"><div id="africa" className="py-4">{SectionTitle({ eyebrow: "Africa", title: "Africa", href: "/news", action: "View all" })}{africa[0] ? <StoryCard article={africa[0]} /> : <div className="rounded-xl bg-white/[0.02] px-4 py-3 text-xs text-white/45">Africa coverage will appear here as stories arrive.</div>}</div><div id="fan-zone" className="py-4"><div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#FFD700]/80">Fan Zone</p><h3 className="mt-1 font-serif text-2xl text-white">The argument people keep reopening.</h3></div><Link href="/debates" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55 hover:text-white">Join debate</Link></div>{topDebate ? <div className="space-y-0"><p className="text-xs leading-6 text-white/70">{topDebate.title}</p><div className="grid gap-2"><div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">{topDebate.left}</div><div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">{topDebate.right}</div></div><div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-white/45"><span>{topDebate.totalVotes} votes</span><span>{topFan ? `${String(topFan.name)} leads` : "Community pulse"}</span></div></div> : <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/45">Community takes and polls appear here once a live debate is active.</div>}</div><div id="predictions" className="py-4"><p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#B30000]">Predictions</p><h3 className="mt-1 font-serif text-2xl text-white">Predict the score, keep the receipt.</h3>{liveLine ? <div className="mt-4 space-y-4"><div className="text-sm text-white/65">{liveLine.home} vs {liveLine.away}</div><div className="grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white"><Link href="/predictions" className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-center hover:bg-white/10">Home</Link><Link href="/predictions" className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-center hover:bg-white/10">Draw</Link><Link href="/predictions" className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-center hover:bg-white/10">Away</Link></div><p className="text-xs text-[#FFD700]/75">Community prediction • MTC points only</p><Link href="/predictions" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white">Open predictions <ArrowRight className="h-3.5 w-3.5" /></Link></div> : <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/45">Predictions appear when the match desk is live.</div>}</div>
<div id="wire" className="sm:col-span-2 py-4"><div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#FFD700]/80">The Wire</p><h3 className="mt-1 font-serif text-2xl text-white">External football news</h3></div><Link href="/news" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55 hover:text-white">View all</Link></div><div className="grid gap-2 md:grid-cols-3">{wire.length ? wire.map((article) => <Link key={article.slug || article.link || article.id} href={href(article)} target={article.isInternal ? undefined : "_blank"} rel={article.isInternal ? undefined : "noopener noreferrer"} className="group flex gap-3 border-b border-white/[0.06] pb-3 transition hover:border-white/[0.12]"><img src={article.thumbnail || FANS_IMAGE} alt={article.title} className="h-16 w-16 flex-none object-cover" onError={(e) => { e.currentTarget.src = FANS_IMAGE; }} /><div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/35">{article.source}</p><h4 className="mt-1 line-clamp-3 text-sm font-bold text-white group-hover:text-[#FFD700]">{article.title}</h4><p className="mt-1 text-[10px] text-white/30">{timeAgo(article.pubDate)}</p></div></Link>) : <div className="rounded-xl bg-white/[0.02] px-4 py-3 text-xs text-white/45">The wire is still loading.</div>}</div></div></div></div></div></section>

      <footer className="border-t border-white/8 bg-black"><div className="mx-auto max-w-7xl px-4 py-8 lg:py-10"><div className="grid gap-8 lg:grid-cols-[1.1fr_repeat(4,minmax(0,1fr))]"><div><p className="font-serif text-4xl font-black tracking-tight text-white">BALLMTAANI</p><p className="mt-4 max-w-sm text-sm leading-7 text-white/50">Kenya&apos;s football fan platform for news, analysis, live scores, and the tools people keep coming back for.</p></div><div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">BallMtaani</p><ul className="mt-4 space-y-3 text-sm text-white/60"><li><Link href="/about" className="hover:text-white">About</Link></li><li><Link href="/contact" className="hover:text-white">Contact</Link></li><li><Link href="/news" className="hover:text-white">Editorial</Link></li></ul></div><div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Support</p><ul className="mt-4 space-y-3 text-sm text-white/60"><li><Link href="/contact" className="hover:text-white">Help</Link></li><li><Link href="/privacy" className="hover:text-white">Privacy</Link></li><li><Link href="/terms" className="hover:text-white">Terms</Link></li></ul></div><div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Tools</p><ul className="mt-4 space-y-3 text-sm text-white/60"><li><Link href="/mchambuzi-halisi" className="hover:text-white">Mchambuzi</Link></li><li><Link href="/predictions" className="hover:text-white">Predictions</Link></li><li><Link href="/leaderboard" className="hover:text-white">Leaderboard</Link></li></ul></div><div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Community</p><ul className="mt-4 space-y-3 text-sm text-white/60"><li><Link href="/debates" className="hover:text-white">Debates</Link></li><li><Link href="/fan-zones" className="hover:text-white">Fan Zone</Link></li><li><Link href="/profile" className="hover:text-white">My Club</Link></li></ul></div></div><div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-4 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} BallMtaani. Football. From where we stand.</p><p>Publication first • tools second • community third</p></div></div></footer>
    </main>
  );
}
















