import { Link } from "wouter";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useMemo, useRef } from "react";
import { Trophy, Users, MessageSquare, ChevronRight, Zap, Sparkles, Radio, Calendar, ExternalLink, Smartphone, Wifi, ShirtIcon, TrendingUp, Target, Swords } from "lucide-react";
import { useMatches, useUpcomingFixtures, useRecentMatches, useLeaderboard } from "../hooks/useData";
import { fetchTodaysFixtures, type LiveMatch } from "../lib/football-api";
import { fetchFootballNews, fetchPartnerArticles, timeAgo, type NewsArticle } from "../lib/news-api";
import { fetchSportyVideos, getBlockedVideoIds, markVideoBlocked, pickHeroStream, formatStartTime, SPORTYTV_CHANNEL_URL, type SportyVideo } from "../lib/youtube-api";
import YouTubePlayer from "../components/YouTubePlayer";
import { supabase } from "../lib/supabase";
import TeamLogo from "../components/TeamLogo";
import AdBanner from "../components/AdBanner";
import { SkeletonMatch } from "../components/Skeletons";
import PremiumMatchCard from "../components/PremiumMatchCard";
import SEO from "../components/SEO";
import FloatingMchambuzi from "../components/FloatingMchambuzi";
import DataFreshnessChip from "../components/DataFreshnessChip";
import { formatFreshnessLabel } from "../lib/freshness";
import { motion } from "framer-motion";
import HeroTicker from "../components/HeroTicker";

const WC26_START = new Date("2026-06-11T17:00:00Z");
const WC26_END   = new Date("2026-07-20T00:00:00Z");

const WC26_KW = ["world cup", "wc26", "wc 26", "2026 fifa", "fifa 2026", "world cup final", "usa host", "canada host", "mexico host", "group stage 2026", "world cup squad", "wc26 qualifier"];
const isWC26 = (title: string) => { const t = title.toLowerCase(); return WC26_KW.some(k => t.includes(k)); };

function useWC26() {
  const [cd, setCd] = useState({ days: 0, hours: 0, mins: 0, secs: 0, isLive: false, isOver: false });
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const over = now > WC26_END.getTime();
      const live = !over && now >= WC26_START.getTime();
      const diff = WC26_START.getTime() - now;
      setCd({ days: Math.max(0, Math.floor(diff / 86400000)), hours: Math.max(0, Math.floor((diff % 86400000) / 3600000)), mins: Math.max(0, Math.floor((diff % 3600000) / 60000)), secs: Math.max(0, Math.floor((diff % 60000) / 1000)), isLive: live, isOver: over });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return cd;
}

function progressPct(status: string, minute: string) {
  const m = parseInt(minute) || 0;
  if (status === "HT") return 50;
  if (status === "1H") return Math.min((m / 45) * 50, 50);
  if (status === "2H") return Math.min(50 + ((m - 45) / 45) * 50, 100);
  if (["ET","P"].includes(status)) return 100;
  return 0;
}

function halfLabel(status: string) {
  return ({ "1H":"1st Half","HT":"Half Time","2H":"2nd Half","ET":"Extra Time","P":"Penalties" } as Record<string,string>)[status] || "Live";
}

function CountBox({ v, l }: { v: number; l: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[44px] rounded-lg border border-[#FFD700]/20 bg-black/60 px-2.5 py-1.5 text-center backdrop-blur-sm">
        <span className="block text-xl font-black tabular-nums text-white md:text-2xl">{String(v).padStart(2,"0")}</span>
      </div>
      <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-[#FFD700]/50">{l}</span>
    </div>
  );
}

function NewsCard({ article, featured }: { article: NewsArticle; featured?: boolean }) {
  const shareUrl = article.isInternal ? `${window.location.origin}/article/${article.slug}` : article.link;
  const share = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${article.title}\n\n${shareUrl}\n\nShared from BallMtaani`)}`, "_blank");
  const isPartner = article.isInternal;

  return (
    <div className={`group flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${featured ? "border-[#FFD700]/20 bg-[#0a0900]" : "border-white/6 bg-[#0d1018]"}`}>
      <div className="relative h-36 overflow-hidden">
        <img src={article.thumbnail} alt={article.title} loading="lazy" decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/Football_culture_stadium.jpeg"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {featured && <div className="absolute inset-0 bg-[#FFD700]/5" />}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span className="rounded bg-black/70 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white/60 backdrop-blur-sm">{article.source}</span>
          {isPartner && <span className="rounded bg-[#B30000]/80 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white backdrop-blur-sm">Partner</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-white/28">{timeAgo(article.pubDate)}</p>
        <h3 className="mb-3 flex-1 text-[13px] font-black leading-snug text-white line-clamp-2">{article.title}</h3>
        <div className="flex gap-1.5">
          {isPartner ? (
            <Link href={`/article/${article.slug}`}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#B30000]/15 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#ff6b6b] transition-all hover:bg-[#B30000]/25 hover:text-white">
              Read
            </Link>
          ) : (
            <a href={article.link} target="_blank" rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/38 transition-all hover:bg-white/10 hover:text-white">
              <ExternalLink className="h-3 w-3" /> Read
            </a>
          )}
          <button onClick={share} className="rounded-lg bg-[#25D366]/10 px-2.5 py-1.5 text-[#25D366] transition-all hover:bg-[#25D366]/20" title="Share to WhatsApp">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroMatchCard({ kind, match }: { kind: "live" | "upcoming" | "finished"; match: any }) {
  const isLive = kind === "live";
  const config = {
    live:     { label: "Live Now",  frame: "border-[#B30000]/40 bg-[#0d0608]/92 shadow-[0_0_32px_rgba(179,0,0,0.2)]", labelCls: "text-[#B30000]" },
    upcoming: { label: "Up Next",   frame: "border-[#FFD700]/20 bg-[#0c111a]/92", labelCls: "text-[#FFD700]/80" },
    finished: { label: "Full Time", frame: "border-white/10 bg-[#0a0e15]/92", labelCls: "text-white/40" },
  }[kind];

  return (
    <div className={`overflow-hidden rounded-2xl border backdrop-blur-xl ${config.frame}`}>
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <div className="flex items-center gap-2">
          {isLive && <span className="h-2 w-2 rounded-full bg-[#B30000] animate-ping" />}
          <span className={`text-[10px] font-black uppercase tracking-[0.18em] ${config.labelCls}`}>{config.label}</span>
        </div>
        <span className="max-w-[160px] truncate text-[10px] text-white/30">{match.league}</span>
      </div>
      <div className="px-4 py-3.5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <TeamLogo logo={match.homeLogo} initial={match.homeInitial} color={match.homeColor || "#182333"} size="md" />
            <span className="text-xs font-black leading-tight text-white">{match.home}</span>
          </div>
          <div className="text-center">
            {kind === "upcoming" ? (
              <>
                <div className="rounded-lg border border-white/10 px-3 py-1.5 text-base font-black text-white/22">VS</div>
                {match.time && (
                  <div className="mt-1.5 text-[10px] font-black tabular-nums text-[#FFD700]">
                    {match.date ? `${match.date} · ` : ""}{match.time}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={`text-2xl font-black tabular-nums ${kind === "finished" ? "text-white/80" : "text-white"}`}>
                  {match.homeScore}<span className="text-white/25 mx-1">–</span>{match.awayScore}
                </div>
                <div className={`mt-0.5 text-[10px] font-black uppercase ${isLive ? "text-[#B30000]" : "text-white/35"}`}>
                  {isLive ? match.minute : `FT${match.date ? ` · ${match.date}` : ""}`}
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <TeamLogo logo={match.awayLogo} initial={match.awayInitial} color={match.awayColor || "#182333"} size="md" />
            <span className="text-xs font-black leading-tight text-white">{match.away}</span>
          </div>
        </div>

        {match.venue && (
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center">
            <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 text-white/35" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate text-[10px] font-semibold text-white/45">{match.venue}</span>
          </div>
        )}

        {isLive && (
          <div className="mt-2.5">
            <div className="h-1 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-[#B30000] shadow-[0_0_8px_#B30000] transition-all duration-1000"
                style={{ width: `${progressPct(match.status, match.minute)}%` }} />
            </div>
          </div>
        )}

        <Link href={isLive ? `/live-center/${match.id}` : kind === "upcoming" ? "/predictions" : "/matches"}
          className={`mt-3 block w-full rounded-xl py-2.5 text-center text-xs font-black uppercase tracking-[0.12em] transition-all active:scale-[0.98] ${
            isLive ? "bg-[#B30000] text-white shadow-[0_0_18px_rgba(179,0,0,0.4)]"
            : kind === "upcoming" ? "bg-white text-black"
            : "border border-white/12 bg-white/5 text-white/70 hover:bg-white/10"
          }`}>
          {isLive ? "Join Live Center" : kind === "upcoming" ? "Make Your Call" : "All Results"}
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [clockTick, setClockTick] = useState(0);
  const [todaysFixtures, setTodaysFixtures] = useState<any[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const articleScrollRef = useRef<HTMLDivElement>(null);
  const scrollArticles = (dir: "left" | "right") =>
    articleScrollRef.current?.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });

  const { data: liveMatches = [], isLoading: isLoadingMatches } = useMatches();
  const { data: upcomingFixtures = [], isLoading: isLoadingUpcoming } = useUpcomingFixtures();
  const { data: recentMatches = [], isLoading: isLoadingRecent } = useRecentMatches();
  const { data: leaderboard = [] } = useLeaderboard();
  const wc26 = useWC26();

  useEffect(() => {
    if (liveMatches.length || upcomingFixtures.length || recentMatches.length) setLastUpdated(new Date());
  }, [liveMatches, upcomingFixtures, recentMatches]);

  const STADIUM_IMAGE = "https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/World_Cup_stadium_interior_flood.jpeg";
  const [heroSlides, setHeroSlides] = useState<{ url: string; title?: string; excerpt?: string }[]>([{ url: STADIUM_IMAGE }]);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImages = heroSlides.map(s => s.url);

  const [sportyVideos, setSportyVideos] = useState<SportyVideo[]>([]);
  const [blockedVideoIds, setBlockedVideoIds] = useState<Set<string>>(() => getBlockedVideoIds());

  useEffect(() => {
    fetchSportyVideos().then(setSportyVideos);
    fetchTodaysFixtures().then(setTodaysFixtures);
    Promise.all([fetchPartnerArticles(), fetchFootballNews()]).then(([partner, rss]) => {
      // Partner articles first; RSS fills remaining slots up to 9 total
      const partnerIds = new Set(partner.map(a => a.id));
      const rssGap = rss.filter(a => !partnerIds.has(a.id));
      const combined = [...partner, ...rssGap];
      const wc = combined.filter(a => a.isWC26 || isWC26(a.title));
      const rest = combined.filter(a => !a.isWC26 && !isWC26(a.title));
      setNews([...wc, ...rest]);
    }).finally(() => setNewsLoading(false));
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setClockTick(n => n + 1), 60000);
    return () => window.clearInterval(t);
  }, []);

  // Fetch up to 5 latest article thumbnails for hero slider
  useEffect(() => {
    if (!supabase) return;
    void Promise.resolve(
      supabase.from("articles").select("thumbnail_url, title, excerpt")
        .eq("status", "published")
        .not("thumbnail_url", "is", null)
        .order("published_at", { ascending: false })
        .limit(5)
        .then(({ data }) => {
          const slides = (data ?? [])
            .filter((a: any) => a.thumbnail_url)
            .map((a: any) => ({ url: a.thumbnail_url as string, title: a.title as string | undefined, excerpt: a.excerpt as string | undefined }));
          if (slides.length) setHeroSlides(slides);
        })
    ).catch(() => {});
  }, []);

  // Auto-advance hero slide every 6 seconds
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const t = setInterval(() => setHeroIndex(i => (i + 1) % heroImages.length), 6000);
    return () => clearInterval(t);
  }, [heroImages.length]);

  const freshnessLabel = useMemo(() => formatFreshnessLabel(lastUpdated), [lastUpdated, clockTick]);

  // WC26 opener — shown before June 11 when API has no data yet
  const WC26_OPENER = {
    id: "wc26-opener-preview",
    home: "Mexico", homeLogo: "https://media.api-sports.io/flags/mx.svg", homeInitial: "MEX", homeColor: "#006847",
    away: "South Africa", awayLogo: "https://media.api-sports.io/flags/za.svg", awayInitial: "RSA", awayColor: "#007A4D",
    homeScore: 0, awayScore: 0, league: "FIFA World Cup 2026 - Opening Match",
    date: "June 11, 2026",
    time: "10:00 PM EAT", kickoffAt: new Date("2026-06-11T19:00:00Z").getTime(),
    venue: "Estadio Azteca, Mexico City",
  };

  // Group stage fallback — shown when WC26 is live but API returns no fixtures
  const WC26_GROUP_FALLBACK = {
    id: "wc26-group-stage",
    home: "Morocco", homeLogo: "https://media.api-sports.io/flags/ma.svg", homeInitial: "MAR", homeColor: "#C1272D",
    away: "Senegal", awayLogo: "https://media.api-sports.io/flags/sn.svg", awayInitial: "SEN", awayColor: "#00853F",
    time: "Group Stage On",
    league: "FIFA World Cup 2026",
    venue: "USA · Canada · Mexico",
  };

  // Static WC26 match items for the ticker when the API returns empty during tournament
  const wc26TickerFallback = wc26.isLive ? [
    { id: "wc26-t1", home: "Morocco",   away: "Senegal",    time: "WC26" },
    { id: "wc26-t2", home: "Nigeria",   away: "Egypt",      time: "WC26" },
    { id: "wc26-t3", home: "S. Africa", away: "Mexico",     time: "WC26" },
    { id: "wc26-t4", home: "Cameroon",  away: "Brazil",     time: "WC26" },
    { id: "wc26-t5", home: "Tunisia",   away: "Argentina",  time: "WC26" },
  ] : [];

  // Skip videos this viewer can't play (region-restricted or embed-disabled),
  // then pick: free live stream > next free scheduled stream > latest video
  const playableVideos = sportyVideos.filter(v => !blockedVideoIds.has(v.id));
  const heroVideo = pickHeroStream(playableVideos);
  const handleVideoUnavailable = (id: string) => setBlockedVideoIds(new Set(markVideoBlocked(id)));

  const liveMatch   = liveMatches[0] || null;
  const nextFixture = upcomingFixtures[0] || (
    Date.now() < WC26_OPENER.kickoffAt ? WC26_OPENER :
    wc26.isLive ? WC26_GROUP_FALLBACK :
    null
  );
  const lastResult  = recentMatches[0] || null;
  const featuredMatch = liveMatch || nextFixture;
  const isMatchLive   = !!liveMatch;

  const liveStatuses = new Set(["1H","2H","HT","ET","P","BT","LIVE"]);
  const todayUpcoming = todaysFixtures.filter(m => !liveStatuses.has(m.status)).slice(0, 6);

  const wc26News   = news.filter(a => isWC26(a.title)).slice(0, 3);
  const otherNews  = news.filter(a => !isWC26(a.title)).slice(0, 6);

  // Group today's matches by league
  const byLeague = todayUpcoming.reduce((acc: Record<string, any[]>, m) => {
    const k = m.league || "Other";
    if (!acc[k]) acc[k] = [];
    acc[k].push(m);
    return acc;
  }, {});

  return (
    <div className="pb-24">
      <SEO
        title="BallMtaani | Kenyan Football Hub — WC26 Ready"
        description="Kenya's #1 football hub: live UCL scores, World Cup 2026 countdown, today's fixtures, fan predictions and Mchambuzi AI analysis."
        keywords={["BallMtaani","Kenyan football","World Cup 2026","live football scores","UCL final","WC26 Kenya","football predictions"]}
        path="/home"
        breadcrumbs={[{ name: "BallMtaani", url: "/" }, { name: "Home", url: "/home" }]}
      />

      {/* ──────────────────────── HERO TICKER BELT ───────────────────────── */}
      <HeroTicker
        articles={useMemo(() => news.slice(0, 8), [news])}
        matches={useMemo(() => {
          const api = [...liveMatches, ...upcomingFixtures];
          return (api.length > 0 ? api : wc26TickerFallback).slice(0, 8);
        }, [liveMatches, upcomingFixtures, wc26TickerFallback])}
      />

      {/* ─────────────────────────────── HERO ─────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/8 bg-[#040508]">
        {/* Article image slider backdrop */}
        {heroImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${i === heroIndex ? "opacity-55" : "opacity-0"}`}
          />
        ))}
        {/* Cinematic overlays — strong left fade so text always wins */}
        <div className="absolute inset-0 bg-[#040508]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040508]/95 via-[#040508]/70 to-[#040508]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040508] via-transparent to-[#040508]/40" />
        {/* WC26 gold shimmer */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD700]/70 to-transparent" />
        {/* Subtle red glow bottom-left for energy */}
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#B30000]/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:py-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">

            {/* ── LEFT — headline, countdown, CTAs ── */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>

              {/* Top badge */}
              {!wc26.isOver && (
                <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5
                  ${wc26.isLive
                    ? "border-[#FFD700]/50 bg-[#FFD700]/15 shadow-[0_0_16px_rgba(255,214,0,0.2)]"
                    : "border-[#FFD700]/25 bg-[#FFD700]/8"}`}>
                  {wc26.isLive
                    ? <span className="h-2 w-2 animate-pulse rounded-full bg-[#FFD700]" />
                    : <Trophy className="h-3 w-3 text-[#FFD700]" />}
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#FFD700]">
                    {wc26.isLive ? "World Cup 2026 — Live Now" : "FIFA World Cup 2026"}
                  </span>
                </div>
              )}

              {/* ── HEADLINE — fan-first, WC26 spirit ── */}
              <h1 className="mb-3 text-4xl font-black leading-[0.88] tracking-tight text-white md:text-5xl lg:text-6xl">
                {isMatchLive && featuredMatch ? (
                  <>
                    {featuredMatch.home} {featuredMatch.homeScore}
                    <span className="text-white/30">–</span>
                    {featuredMatch.awayScore} {featuredMatch.away}<br />
                    <span className="text-[#B30000]">{featuredMatch.minute}′. Your move.</span>
                  </>
                ) : wc26.isLive ? (
                  <>
                    The World Cup<br />
                    <span className="text-[#FFD700]">Is Live.</span><br />
                    <span className="text-2xl text-white/50 md:text-3xl">Who's your call?</span>
                  </>
                ) : (
                  <>
                    Your group chat,<br />
                    <span className="text-[#B30000]">but with receipts.</span>
                  </>
                )}
              </h1>

              {/* Sub-headline */}
              <p className="mb-4 max-w-md text-sm leading-relaxed text-white/50 md:text-base transition-all duration-700">
                {isMatchLive
                  ? "Pick the final score. Come back at full time. The receipt doesn't lie."
                  : wc26.isLive
                  ? (() => {
                      const slide = heroSlides[heroIndex];
                      return slide?.excerpt || slide?.title || "Live scores, fan predictions and AI analysis for every World Cup match.";
                    })()
                  : "Predict every World Cup match. Debate every goal. Keep the receipt on every Kenyan fan who got it wrong."}
              </p>

              {/* ── COUNTDOWN — centrepiece when active ── */}
              {!wc26.isLive && !wc26.isOver && (
                <div className="mb-6">
                  <p className="mb-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/25">
                    Until Kickoff — Mexico vs South Africa, June 11
                  </p>
                  <div className="flex items-end gap-2">
                    <CountBox v={wc26.days}  l="Days" />
                    <span className="mb-5 text-xl font-black text-[#FFD700]/30">:</span>
                    <CountBox v={wc26.hours} l="Hrs" />
                    <span className="mb-5 text-xl font-black text-[#FFD700]/30">:</span>
                    <CountBox v={wc26.mins}  l="Min" />
                    <span className="mb-5 text-xl font-black text-[#FFD700]/30">:</span>
                    <CountBox v={wc26.secs}  l="Sec" />
                  </div>
                </div>
              )}

              {/* ── CTAs ── */}
              <div className="flex flex-wrap gap-3">
                {!isLoggedIn ? (
                  <>
                    <GoogleSignInButton size="lg" label="Join Free · Make Your Call" />
                    <Link href="/world-cup-2026"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#FFD700]/35 bg-black/40 px-5 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-[#FFD700] backdrop-blur-sm transition-all hover:border-[#FFD700]/65 hover:bg-[#FFD700]/10 active:scale-95">
                      WC26 Hub <ChevronRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    {isMatchLive && featuredMatch ? (
                      <Link href={`/live-center/${featuredMatch.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#B30000] px-6 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-white shadow-[0_0_24px_rgba(179,0,0,0.4)] transition-all hover:shadow-[0_0_36px_rgba(179,0,0,0.6)] active:scale-95">
                        <Radio className="h-4 w-4" /> Join Live Center
                      </Link>
                    ) : (
                      <Link href="/world-cup-2026"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-6 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-black shadow-[0_0_24px_rgba(255,214,0,0.3)] transition-all hover:shadow-[0_0_36px_rgba(255,214,0,0.5)] active:scale-95">
                        🏆 WC26 Hub <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                    <Link href="/predictions"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95">
                      Make Your Call
                    </Link>
                  </>
                )}
              </div>

            </motion.div>

            {/* Right — Match board: live now, up next, latest result */}
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65, delay: 0.15 }}
              className="flex flex-col gap-3">
              {liveMatch && <HeroMatchCard kind="live" match={liveMatch} />}
              {nextFixture && <HeroMatchCard kind="upcoming" match={nextFixture} />}
              {lastResult && <HeroMatchCard kind="finished" match={lastResult} />}
            </motion.div>
          </div>

          {/* Slider dot indicators */}
          {heroImages.length > 1 && (
            <div className="flex justify-center gap-1.5 pb-4 pt-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === heroIndex
                      ? "w-5 h-1.5 bg-[#FFD700]"
                      : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────── REWARDS TEASER ────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/6 bg-[#07080d] py-10 md:py-14">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-1/3 bg-[radial-gradient(ellipse_80%_60%_at_0%_50%,rgba(255,214,0,0.05),transparent)]" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(ellipse_80%_60%_at_100%_50%,rgba(179,0,0,0.06),transparent)]" />
        {/* Fine grid texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative mx-auto max-w-6xl px-4">

          {/* Section header */}
          <div className="mb-8 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2.5">
                <div className="h-px w-6 bg-[#FFD700]/50" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FFD700]/60">News &amp; Live</span>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
                Read, Watch &amp; <span className="text-[#FFD700]">Earn</span>
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/40">
                Top football stories alongside <span className="text-white/65 font-semibold">live SportyTV coverage</span>, side by side.
                Every prediction, duel, and debate you join earns <span className="text-white/65 font-semibold">MTC points</span>.
              </p>
              <Link href="/news" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#FFD700]/70 hover:text-[#FFD700] transition-colors">
                <span className="h-1 w-1 rounded-full bg-[#FFD700]/50" />
                All News &amp; Stories <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex items-center gap-2 md:mb-1">
              <span className="text-[10px] text-white/20 uppercase tracking-widest">Partner</span>
              <div className="flex items-center gap-1.5 rounded-lg border border-[#FFD700]/15 bg-[#FFD700]/6 px-3 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#FFD700] shadow-[0_0_6px_rgba(255,214,0,0.8)]" />
                <span className="text-[10px] font-black tracking-widest text-[#FFD700]/80 uppercase">credoFaster</span>
              </div>
            </div>
          </div>

          {/* Reward cards (stacked) + live match player */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]">

            {/* Left — latest 3 articles */}
            <div className="flex flex-col gap-3">
              {newsLoading
                ? [0, 1, 2].map(i => (
                    <div key={i} className="flex h-[88px] animate-pulse items-stretch overflow-hidden rounded-2xl border border-white/8 bg-[#0c111a]">
                      <div className="w-28 shrink-0 bg-white/5 sm:w-36" />
                      <div className="flex flex-1 flex-col justify-center gap-2 p-4">
                        <div className="h-2 w-16 rounded bg-white/8" />
                        <div className="h-3 rounded bg-white/10" />
                        <div className="h-3 w-3/4 rounded bg-white/8" />
                      </div>
                    </div>
                  ))
                : (news.filter(a => a.isInternal).length > 0 ? news.filter(a => a.isInternal) : news).slice(0, 3).map(article => {
                    const cardCls = "group flex flex-1 items-stretch overflow-hidden rounded-2xl border border-white/8 bg-[#0c111a] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(255,255,255,0.04)]";
                    const inner = (
                      <>
                        <div className="relative w-28 shrink-0 overflow-hidden sm:w-36">
                          <img src={article.thumbnail} alt={article.title} loading="lazy"
                            className="h-full w-full object-cover brightness-70 transition-transform duration-700 group-hover:scale-105"
                            onError={e => { (e.target as HTMLImageElement).src = "https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/Football_culture_stadium.jpeg"; }} />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c111a]" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/28">{article.source}</span>
                            <span className="text-white/15">·</span>
                            <span className="text-[9px] text-white/25">{timeAgo(article.pubDate)}</span>
                            {(article.isWC26 || isWC26(article.title)) && (
                              <span className="rounded-sm bg-[#FFD700]/15 px-1 py-px text-[7px] font-black uppercase tracking-wider text-[#FFD700]">WC26</span>
                            )}
                          </div>
                          <p className="line-clamp-2 text-sm font-black leading-snug text-white">{article.title}</p>
                        </div>
                      </>
                    );
                    return article.isInternal
                      ? <Link key={article.id} href={`/article/${article.slug}`} className={cardCls}>{inner}</Link>
                      : <a key={article.id} href={article.link} target="_blank" rel="noopener noreferrer" className={cardCls}>{inner}</a>;
                  })
              }
            </div>

            {/* Right — live match player via official SportyTV YouTube embed */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black">
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  {heroVideo?.isLive && <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#B30000]" />}
                  <span className={`truncate text-[10px] font-black uppercase tracking-[0.18em] ${heroVideo?.isLive ? "text-[#B30000]" : heroVideo?.isUpcoming ? "text-[#FFD700]/90" : "text-white/55"}`}>
                    {heroVideo?.isLive
                      ? "Live Match — SportyTV"
                      : heroVideo?.isUpcoming && heroVideo.startsAt
                      ? `Next Stream · ${formatStartTime(heroVideo.startsAt)}`
                      : "Watch — SportyTV"}
                  </span>
                </div>
                <Link href="/videos" className="shrink-0 text-[10px] font-black uppercase tracking-widest text-[#FFD700]/80 transition-colors hover:text-[#FFD700]">
                  All Videos →
                </Link>
              </div>
              {heroVideo ? (
                <>
                  <div className="aspect-video w-full">
                    <YouTubePlayer
                      key={heroVideo.id}
                      videoId={heroVideo.id}
                      title={heroVideo.title}
                      className="h-full w-full"
                      onUnavailable={handleVideoUnavailable}
                    />
                  </div>
                  <p className="truncate border-t border-white/8 px-4 py-2.5 text-[11px] font-bold text-white/55">{heroVideo.title}</p>
                </>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-2 px-6 text-center">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Stream loading…</span>
                  <a href={SPORTYTV_CHANNEL_URL} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[#FFD700]/70 hover:text-[#FFD700]">SportyTV on YouTube →</a>
                </div>
              )}
            </div>
          </div>

          {/* Earn rate strip + CTA */}
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/6 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Earn actions */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Target,    label: "Predict Match", pts: "+50 MTC" },
                { icon: Swords,    label: "Win a Duel",    pts: "+200 MTC" },
                { icon: TrendingUp,label: "Daily Login",   pts: "+50 MTC" },
                { icon: MessageSquare, label: "Join Debate", pts: "+30 MTC" },
              ].map(({ icon: Icon, label, pts }) => (
                <div key={label} className="flex items-center gap-1.5 rounded-lg border border-white/6 bg-white/3 px-2.5 py-1.5">
                  <Icon className="h-3 w-3 text-[#FFD700]/60 shrink-0" />
                  <span className="text-[10px] font-bold text-white/50">{label}</span>
                  <span className="text-[10px] font-black text-[#FFD700]/80">{pts}</span>
                </div>
              ))}
            </div>
            {/* CTAs */}
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/store"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/50 transition-all hover:bg-white/10 hover:text-white">
                My Balance
              </Link>
              <Link href="/store"
                className="flex items-center gap-2 rounded-xl bg-[#FFD700] px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(255,214,0,0.25)] transition-all hover:shadow-[0_0_30px_rgba(255,214,0,0.4)] active:scale-[0.98]">
                View All Rewards
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── LATEST ARTICLES SCROLLER ──────────────────────── */}
      {news.filter(a => a.isInternal).length > 0 && (
        <section className="relative border-b border-white/6 bg-[#050709] py-4">
          <div className="mx-auto max-w-6xl px-4">

            {/* Header row */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-3 w-1 rounded-full bg-[#B30000]" />
                <span className="text-[9px] font-black uppercase tracking-[0.28em] text-white/35">Latest from BallMtaani</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => scrollArticles("left")}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
                  aria-label="Scroll left">
                  <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                </button>
                <button onClick={() => scrollArticles("right")}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
                  aria-label="Scroll right">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <Link href="/news"
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white/40 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white">
                  View All <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Scrollable strip */}
            <div ref={articleScrollRef} className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {news.filter(a => a.isInternal).slice(0, 5).map((article, i) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="group relative flex w-[260px] shrink-0 snap-start overflow-hidden rounded-xl border border-white/8 bg-[#0c111a] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/18 sm:w-[300px]"
                >
                  <div className="relative h-full w-24 shrink-0 overflow-hidden sm:w-28">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={e => { (e.target as HTMLImageElement).src = "https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/Football_culture_stadium.jpeg"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c111a]/60" />
                    <div className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#B30000] text-[9px] font-black text-white">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                    <div>
                      {article.isWC26 && (
                        <span className="mb-1 inline-block rounded bg-[#FFD700]/15 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-[#FFD700]">WC26</span>
                      )}
                      <p className="line-clamp-3 text-[12px] font-black leading-snug text-white group-hover:text-white/90">
                        {article.title}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-white/30">{article.source}</span>
                      <span className="text-[9px] text-white/20">{timeAgo(article.pubDate)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ─────────────────────── LIVE + TODAY'S MATCHES ───────────────────────── */}
      {(liveMatches.length > 0 || todayUpcoming.length > 0) && (
        <section className="border-b border-white/6 bg-[#060810] py-8">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-4 md:grid-cols-2">

              {/* Live Now */}
              {liveMatches.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-[#B30000]/35 bg-[#0d0608]/96 shadow-[0_0_20px_rgba(179,0,0,0.12)]">
                  <div className="flex items-center gap-2 border-b border-[#B30000]/18 px-3 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#B30000] animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B30000]">Live Now</span>
                    <span className="ml-auto text-[10px] text-[#B30000]/50">{liveMatches.length} match{liveMatches.length > 1 ? "es" : ""}</span>
                  </div>
                  {liveMatches.map((m: LiveMatch) => {
                    const pct   = progressPct(m.status, m.minute);
                    const hl    = halfLabel(m.status);
                    const isHT  = m.status === "HT";
                    return (
                      <Link key={m.id} href={`/live-center/${m.id}`} className="block border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 pt-3 pb-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <TeamLogo logo={m.homeLogo} initial={m.homeInitial} color="#1a0608" size="sm" />
                            <span className="truncate text-sm font-bold text-white">{m.home}</span>
                          </div>
                          <span className="text-lg font-black tabular-nums text-[#B30000]">{m.homeScore} – {m.awayScore}</span>
                          <div className="flex min-w-0 items-center justify-end gap-2">
                            <span className="truncate text-right text-sm font-bold text-white">{m.away}</span>
                            <TeamLogo logo={m.awayLogo} initial={m.awayInitial} color="#1a0608" size="sm" />
                          </div>
                        </div>
                        <div className="px-3 pb-3">
                          <div className="mb-1.5 flex justify-between">
                            <span className="text-[9px] text-white/28 font-semibold uppercase tracking-widest">{m.league}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isHT ? "text-yellow-400" : "text-[#B30000]"}`}>
                              {isHT ? "Half Time" : m.minute ? `${m.minute} · ${hl}` : hl}
                            </span>
                          </div>
                          <div className="h-1 overflow-hidden rounded-full bg-white/8">
                            <div className={`h-full rounded-full transition-all duration-1000 ${isHT ? "bg-yellow-400" : "bg-[#B30000]"}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                          <div className="relative mt-1 flex justify-between text-[8px] text-white/15 font-semibold">
                            <span>0'</span><span className="absolute left-1/2 -translate-x-1/2">45'</span><span>90'</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Today's Upcoming */}
              {todayUpcoming.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#090d14]/96">
                  <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
                    <Calendar className="h-3.5 w-3.5 text-white/40" />
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/60">Today's Matches</span>
                    <span className="ml-auto text-[10px] text-white/28">{new Date().toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" })}</span>
                  </div>
                  {Object.entries(byLeague).map(([league, matches]: [string, any[]]) => (
                    <div key={league}>
                      <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-3 py-1.5">
                        {matches[0]?.leagueLogo && <img src={matches[0].leagueLogo} alt="" className="h-3.5 w-3.5 object-contain opacity-60" loading="lazy" />}
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/38">{league}</span>
                      </div>
                      {matches.map((m: any) => (
                        <div key={m.id} className="grid grid-cols-[40px_1fr_28px_1fr] items-center gap-2 border-b border-white/5 px-3 py-2.5 last:border-0">
                          <span className="text-xs font-bold tabular-nums text-white/48">{m.time || "TBC"}</span>
                          <div className="flex min-w-0 items-center gap-1.5">
                            <TeamLogo logo={m.homeLogo} initial={m.homeInitial || m.home?.slice(0, 3)} color="#182333" size="sm" />
                            <span className="truncate text-sm font-semibold text-white">{m.home}</span>
                          </div>
                          <span className="text-center text-[10px] font-bold text-white/22">vs</span>
                          <div className="flex min-w-0 items-center justify-end gap-1.5">
                            <span className="truncate text-right text-sm font-semibold text-white">{m.away}</span>
                            <TeamLogo logo={m.awayLogo} initial={m.awayInitial || m.away?.slice(0, 3)} color="#182333" size="sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────── MATCH HUB ───────────────────────────── */}
      <section className="border-b border-white/6 bg-[#0B0B0B] py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="border-l-4 border-[#B30000] pl-4 text-xl font-black uppercase tracking-wide text-white">Match Hub</h2>
              <p className="ml-4 mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Live · Results · Upcoming</p>
              {lastUpdated && <DataFreshnessChip label={freshnessLabel} className="ml-4 mt-1" />}
            </div>
            <Link href="/matches" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#B30000]">
              Full Desk <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {isLoadingMatches || isLoadingUpcoming || isLoadingRecent ? (
              [1, 2, 3].map(i => <SkeletonMatch key={i} />)
            ) : liveMatches.length === 0 && upcomingFixtures.length === 0 && recentMatches.length === 0 ? (
              // Off-season fallback — show WC26 schedule
              <div className="w-full rounded-xl border border-[#FFD700]/20 bg-[#0c0a00]/80 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-4 w-4 text-[#FFD700]" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#FFD700]">WC26 Opening Fixtures</span>
                  <span className="ml-auto text-[10px] text-white/40">June 11 - 14</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { home: "Mexico", away: "South Africa", time: "Jun 11 · 10pm" },
                    { home: "USA", away: "Colombia", time: "Jun 12 · 1am" },
                    { home: "Canada", away: "Venezuela", time: "Jun 12 · 4pm" },
                    { home: "Brazil", away: "Germany", time: "Jun 13 · 7pm" },
                    { home: "Argentina", away: "Morocco", time: "Jun 14 · 10pm" },
                    { home: "France", away: "England", time: "Jun 14 · 1am" },
                  ].map(f => (
                    <Link key={f.home + f.away} href="/predictions"
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-black/40 px-3 py-2.5 hover:border-[#FFD700]/30 transition-all">
                      <span className="text-xs font-black text-white truncate">{f.home}</span>
                      <div className="text-center shrink-0">
                        <div className="text-[9px] text-[#FFD700] font-black">VS</div>
                        <div className="text-[8px] text-white/30">{f.time}</div>
                      </div>
                      <span className="text-xs font-black text-white truncate text-right">{f.away}</span>
                    </Link>
                  ))}
                </div>
                <Link href="/predictions" className="mt-4 block text-center text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:underline">
                  Make Your WC26 Calls
                </Link>
              </div>
            ) : (
              <>
                {liveMatches.map((m: any) => <PremiumMatchCard key={m.id} match={{ ...m, status: "LIVE" }} />)}
                {upcomingFixtures.slice(0, 5).map((m: any) => <PremiumMatchCard key={m.id} match={m} />)}
                {recentMatches.slice(0, 5).map((m: any) => <PremiumMatchCard key={m.id} match={{ ...m, status: "FT" }} />)}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── FUN ZONE (above news) ───────────────────── */}
      <section className="border-b border-white/6 bg-[#0B0B0B] py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white">The <span className="text-[#FFD700]">Fun Zone</span></h2>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">Quizzes · Rapid Fire · Duels · Earn MTC</p>
            </div>
            <Link href="/fun-zone" className="rounded-lg border border-[#FFD700]/30 bg-[#FFD700]/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD700] transition-all hover:bg-[#FFD700]/15">
              All Games →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
            {[
              { href: "/trivia", img: "/funzone/trivia.jpg", label: "Football IQ", sub: "Climb the trivia ladder", cta: "Play Trivia" },
              { href: "/rapid-fire", img: "/funzone/rapid-fire.jpg", label: "Rapid Fire", sub: "Pick a side in seconds", cta: "Play Now" },
              { href: "/predictions", img: "/funzone/predictions.jpg", label: "Predict It", sub: "Call the score. Keep the receipt.", cta: "Make Call" },
              { href: "/mchambuzi-halisi", img: "/funzone/mchambuzi.jpg", label: "Genius Take?", sub: "Let Mchambuzi rate your take", cta: "Ask AI" },
            ].map(({ href, img, label, sub, cta }) => (
              <Link key={href} href={href}
                className="group relative flex h-44 flex-col justify-end overflow-hidden rounded-xl border border-white/8 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD700]/40">
                <img src={img} alt={label} loading="lazy" decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <span className="absolute right-2 top-2 rounded-full bg-black/50 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#FFD700]/80 backdrop-blur-sm">Earn MTC</span>
                <div className="relative p-3">
                  <h3 className="text-xs font-black uppercase tracking-wide text-white">{label}</h3>
                  <p className="mt-0.5 text-[10px] leading-snug text-white/45">{sub}</p>
                  <span className="mt-2 inline-block text-[9px] font-black uppercase tracking-[0.18em] text-[#FFD700]">{cta} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ─────────────────────── NEWS: WC26 FIRST ────────────────────────── */}
      <section className="border-b border-white/6 bg-[#05070b] py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="border-l-4 border-[#FFD700] pl-3 text-lg font-black uppercase tracking-widest text-white">Latest News</h2>
              <p className="ml-4 mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">WC26 First · Breaking Headlines</p>
            </div>
          </div>

          {newsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-white/5 bg-[#111]">
                  <div className="h-36 bg-white/5" />
                  <div className="space-y-2 p-3"><div className="h-2 w-16 rounded bg-white/10" /><div className="h-3 rounded bg-white/10" /><div className="h-3 w-3/4 rounded bg-white/10" /></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {wc26News.length > 0 && (
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Trophy className="h-3 w-3 text-[#FFD700]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#FFD700]">World Cup 2026</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {wc26News.map(a => <NewsCard key={a.id} article={a} featured />)}
                  </div>
                </div>
              )}
              {wc26News.length > 0 && otherNews.length > 0 && (
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/8" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">Football Headlines</span>
                  <div className="h-px flex-1 bg-white/8" />
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {otherNews.map(a => <NewsCard key={a.id} article={a} />)}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ─────────────────────── AFRICA AT WC26 ─────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/6 bg-[#030507] py-12">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-green-950/60 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#FFD700]/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4">

          {/* ── Section header ── */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2.5">
                <div className="h-px w-8 bg-green-500/50" />
                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-green-400/60">CAF · World Cup 2026</span>
              </div>
              <h2 className="text-3xl font-black uppercase leading-none tracking-tight text-white md:text-4xl">
                Africa's <span className="text-[#FFD700]">9</span> at the<br className="sm:hidden" /> World Cup
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/38">
                One continent. Nine nations. Every match carries the weight of 1.4 billion people.
              </p>
            </div>
            <Link href="/world-cup-2026"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-[#FFD700]/30 bg-[#FFD700]/8 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#FFD700] transition-all hover:bg-[#FFD700]/15 sm:self-auto">
              Full WC26 Hub <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* ── 9 Nations grid ── */}
          {(() => {
            const CAF_NATIONS = [
              { code: "ma", name: "Morocco",       group: "D", fixture: "vs Argentina",    date: "Jun 14", time: "22:00", note: "Qatar semi-finalists. Africa's most complete squad.", color: "#C1272D" },
              { code: "sn", name: "Senegal",        group: "H", fixture: "vs Portugal",     date: "Jun 17", time: "19:00", note: "AFCON champions. Mané's farewell tournament?",       color: "#00853F" },
              { code: "eg", name: "Egypt",          group: "D", fixture: "vs Uruguay",      date: "Jun 15", time: "01:00", note: "Salah's biggest stage. Pharaohs hunting history.",    color: "#CE1126" },
              { code: "ng", name: "Nigeria",        group: "F", fixture: "vs Netherlands",  date: "Jun 15", time: "16:00", note: "Super Eagles — dangerous, hungry, unpredictable.",   color: "#008751" },
              { code: "cm", name: "Cameroon",       group: "F", fixture: "vs Sweden",       date: "Jun 16", time: "22:00", note: "Indomitable Lions. Built to upset big nations.",      color: "#007A5E" },
              { code: "za", name: "South Africa",   group: "A", fixture: "vs Mexico",       date: "Jun 11", time: "22:00", note: "First World Cup since 2010. Opened the tournament.", color: "#007A4D" },
              { code: "ci", name: "Côte d'Ivoire",  group: "G", fixture: "vs Germany",      date: "Jun 16", time: "19:00", note: "AFCON holders. The Elephants charge again.",          color: "#F77F00" },
              { code: "ml", name: "Mali",           group: "E", fixture: "vs England",      date: "Jun 15", time: "13:00", note: "Eagles soaring. Tactical, disciplined, dangerous.",   color: "#14B53A" },
              { code: "tn", name: "Tunisia",        group: "B", fixture: "vs Spain",        date: "Jun 14", time: "16:00", note: "Eagles of Carthage facing European giants.",          color: "#E70013" },
            ];
            return (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CAF_NATIONS.map(nation => (
                  <div key={nation.name}
                    className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#080d15] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/18 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    {/* Nation color bar */}
                    <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${nation.color}, transparent)` }} />

                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Flag image */}
                        <div className="h-11 w-16 shrink-0 overflow-hidden rounded border border-white/10 bg-black/30">
                          <img
                            src={`https://media.api-sports.io/flags/${nation.code}.svg`}
                            alt={`${nation.name}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        {/* Name + group chip */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black uppercase tracking-tight text-white">{nation.name}</h3>
                            <span className="rounded px-1.5 py-px text-[9px] font-black uppercase tracking-wider"
                              style={{ color: nation.color, backgroundColor: nation.color + "22", border: `1px solid ${nation.color}40` }}>
                              Grp {nation.group}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] leading-snug text-white/45">{nation.note}</p>
                        </div>
                      </div>

                      {/* Fixture row */}
                      <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-white/6 bg-black/30 px-3 py-2">
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: nation.color }} />
                        <span className="text-[11px] font-bold text-white">{nation.fixture}</span>
                        <span className="ml-auto whitespace-nowrap text-[10px] text-white/35">{nation.date} · {nation.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── Bottom nav strip ── */}
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { label: "CAF Champs League", sub: "Continental club football", href: "/matches", img: "https://media.api-sports.io/football/leagues/20.png" },
              { label: "Harambee Stars",    sub: "Kenya national team",       href: "/matches", img: "https://media.api-sports.io/flags/ke.svg" },
              { label: "Kenyan Fan Zones",  sub: "Gor · Leopards · Tusker",   href: "/fan-zones", img: "https://media.api-sports.io/football/leagues/357.png" },
              { label: "WC26 Africa Hub",   sub: "All group fixtures & news",  href: "/world-cup-2026", img: "https://media.api-sports.io/football/leagues/1.png" },
            ].map(link => (
              <Link key={link.label} href={link.href}
                className="group flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3 transition-all hover:border-white/16 hover:bg-white/5">
                <img src={link.img} alt="" className="h-7 w-7 shrink-0 rounded object-contain" loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-black uppercase tracking-tight text-white">{link.label}</div>
                  <div className="text-[9px] text-white/35">{link.sub}</div>
                </div>
                <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/20 transition-colors group-hover:text-[#FFD700]" />
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* AD */}
      <section className="border-b border-white/6 bg-[#0B0B0B] py-6">
        <div className="mx-auto max-w-6xl px-4">
          <AdBanner label="Matchday Partner" type="horizontal" />
        </div>
      </section>

      {/* ─────────────────────────── COMMUNITY ───────────────────────────── */}
      <section className="border-b border-white/6 bg-[#04060a] py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-white">Keep The <span className="text-[#B30000]">Receipt.</span></h2>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">Challenge. Debate. Come back after full time.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:gap-3">
            {[
              { href: "/rivalries", icon: Zap, label: "Fan Duels", sub: "Challenge a rival, settle the debate", border: "border-[#B30000]/20 hover:border-[#B30000]/45", bg: "bg-[#0d0608]", ic: "text-[#B30000]", ibg: "bg-[#B30000]/10", cta: "Start Duel" },
              { href: "/fan-zones", icon: Users, label: "Fan Zones", sub: "Elite communities for die-hards", border: "border-[#FFD700]/16 hover:border-[#FFD700]/38", bg: "bg-[#080700]", ic: "text-[#FFD700]", ibg: "bg-[#FFD700]/8", cta: "Explore", gold: true },
              { href: "/debates", icon: MessageSquare, label: "Debates", sub: "Takes, receipts and matchday banter", border: "border-blue-500/16 hover:border-blue-500/38", bg: "bg-[#050810]", ic: "text-blue-400", ibg: "bg-blue-500/8", cta: "Join Feed" },
            ].map(({ href, icon: Icon, label, sub, border, bg, ic, ibg, cta, gold }) => (
              <Link key={href} href={href}
                className={`group flex flex-col rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${bg} ${border}`}>
                <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${ibg}`}>
                  <Icon className={`h-4 w-4 ${ic}`} />
                </div>
                <h3 className={`mb-1 text-xs font-black uppercase tracking-wide ${gold ? "text-[#FFD700]" : "text-white"}`}>{label}</h3>
                <p className="mb-3 flex-1 text-[11px] text-white/28">{sub}</p>
                <span className={`text-[9px] font-black uppercase tracking-widest ${ic}`}>{cta} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── LEADERBOARD PREVIEW ─────────────────────── */}
      <section className="bg-[#04060a] py-10">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-1 text-lg font-black uppercase tracking-widest text-white">Hall of <span className="text-[#FFD700]">Fame</span></h2>
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-widest text-white/25">Top fans this week</p>
          <div className="mb-6 overflow-hidden rounded-xl border border-white/6 bg-[#0d0f14]">
            {leaderboard.slice(0, 3).map((p: any, i: number) => (
              <div key={p.rank || i} className="flex items-center justify-between border-b border-white/5 px-4 py-3.5 last:border-0">
                <div className="flex items-center gap-4">
                  <span className={`w-6 text-sm font-black ${p.rank === 1 ? "text-[#FFD700]" : "text-white/25"}`}>#{p.rank}</span>
                  <div className="text-left">
                    <span className="text-sm font-black text-white">{p.name?.startsWith("Fan_") ? "Anonymous Fan" : p.name} {p.country}</span>
                    <div className="text-[9px] font-black uppercase tracking-widest text-[#B30000]">Level {p.streak || 1} Elite Host</div>
                  </div>
                </div>
                <span className="text-sm font-black text-[#FFD700]">{p.pts} pts</span>
              </div>
            ))}
            {!leaderboard.length && (
              <div className="py-8 text-[10px] font-black uppercase tracking-widest text-white/18">Loading...</div>
            )}
          </div>
          <Link href="/leaderboard"
            className="inline-block rounded-full border border-white/10 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white/60 transition-all hover:bg-white/5 hover:text-white">
            Full Leaderboard
          </Link>
        </div>
      </section>

      <FloatingMchambuzi variant="home" />
    </div>
  );
}
