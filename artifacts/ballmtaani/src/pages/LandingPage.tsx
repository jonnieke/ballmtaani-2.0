import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  Goal,
  Home,
  Newspaper,
  Radio,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import SEO from "../components/SEO";
import TeamLogo from "../components/TeamLogo";
import OddspediaCredit from "../components/OddspediaCredit";
import FloatingMchambuzi from "../components/FloatingMchambuzi";
import {
  fetchLeagueFixtures,
  fetchLiveMatches,
  fetchRecentMatches,
  fetchStandings,
  fetchUpcomingFixtures,
  type LiveMatch,
  type StandingEntry,
} from "../lib/football-api";

type DisplayMatch = {
  id: string;
  home: string;
  away: string;
  homeLogo?: string;
  awayLogo?: string;
  homeInitial?: string;
  awayInitial?: string;
  homeScore?: number;
  awayScore?: number;
  league: string;
  date?: string;
  time?: string;
  kickoff?: string;
  status: string;
};

const FEATURE_LINKS = [
  { href: "/matches", label: "Data Center", sub: "Explore Stats", icon: BarChart3, tone: "border-primary/50 text-primary bg-primary/10" },
  { href: "/mchambuzi-halisi", label: "Mchambuzi", sub: "Ask Halisi AI", icon: Bot, tone: "border-emerald-400/50 text-emerald-300 bg-emerald-500/10" },
  { href: "/live-center", label: "Live Pulse", sub: "Live Center", icon: Radio, tone: "border-accent/50 text-accent bg-accent/10" },
  { href: "/predictions", label: "Predictions", sub: "Make Your Call", icon: Goal, tone: "border-cyan-400/50 text-cyan-300 bg-cyan-500/10" },
  { href: "/war-room", label: "War Room", sub: "Transfer Hub", icon: ShieldCheck, tone: "border-green-400/50 text-green-300 bg-green-500/10" },
  { href: "/rapid-fire", label: "Rapid Fire", sub: "Quick Debates", icon: Zap, tone: "border-[#FFD700]/50 text-[#FFD700] bg-[#FFD700]/10" },
  { href: "/debates", label: "Debates", sub: "Hot Topics", icon: Bell, tone: "border-purple-400/50 text-purple-300 bg-purple-500/10" },
  { href: "/rivalries", label: "Rivalries", sub: "Fan Duels", icon: Swords, tone: "border-orange-500/50 text-orange-400 bg-orange-500/10" },
  { href: "/fan-zones", label: "Fan Zones", sub: "Support Clubs", icon: Users, tone: "border-pink-500/50 text-pink-300 bg-pink-500/10" },
];

const WC_FALLBACK: DisplayMatch[] = [
  {
    id: "wc26-opener",
    home: "USA",
    away: "Mexico",
    homeLogo: "https://media.api-sports.io/flags/us.svg",
    awayLogo: "https://media.api-sports.io/flags/mx.svg",
    league: "FIFA World Cup",
    date: "Jun 11 2026",
    time: "9:00 PM",
    status: "Group A",
  },
  {
    id: "wc26-canada",
    home: "Canada",
    away: "Qatar",
    homeLogo: "https://media.api-sports.io/flags/ca.svg",
    awayLogo: "https://media.api-sports.io/flags/qa.svg",
    league: "FIFA World Cup",
    date: "Jun 12 2026",
    time: "12:00 AM",
    status: "Group A",
  },
];

function StatCard({
  icon: Icon,
  value,
  label,
  sub,
  tone,
  href,
}: {
  icon: typeof Goal;
  value: string | number;
  label: string;
  sub: string;
  tone: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="absolute inset-x-4 top-0 h-px bg-current/70" />
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-current/10 blur-2xl" />
      <div className="relative mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-current bg-current/10 shadow-[0_0_18px_currentColor] md:h-12 md:w-12">
        <Icon className="h-5 w-5 md:h-6 md:w-6" />
      </div>
      <div className="relative text-3xl font-bold leading-none text-white md:text-[2.55rem]">{value}</div>
      <div className="relative mt-1 text-sm font-medium text-white/90">{label}</div>
      <div className="relative mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-current md:text-[10px]">{sub}</div>
    </>
  );

  const className = `relative min-h-[118px] overflow-hidden rounded-[22px] border bg-[#0b1119]/82 p-3 text-center shadow-[0_14px_42px_rgba(0,0,0,0.42)] transition-transform hover:-translate-y-0.5 md:min-h-[132px] md:p-4 ${tone}`;

  if (href) {
    return (
      <Link href={href} className={className} aria-label={`${value} ${label}`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  actionHref = "/matches",
  tone = "text-primary",
  children,
}: {
  title: string;
  subtitle?: string;
  action: string;
  actionHref?: string;
  tone?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-white/16 bg-[#080d14]/92 p-2.5 shadow-[0_16px_54px_rgba(0,0,0,0.48)] md:p-3">
      <div className="mb-2.5 flex items-center justify-between px-2 pt-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`h-3 w-3 shrink-0 rounded-full shadow-[0_0_16px_currentColor] ${tone === "text-[#FFD700]" ? "bg-[#FFD700] text-[#FFD700]" : tone === "text-purple-300" ? "bg-purple-400 text-purple-300" : "bg-primary text-primary"}`} />
          <div>
            <h2 className="text-lg font-bold uppercase tracking-normal text-white">{title}</h2>
            {subtitle ? <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-500">{subtitle}</p> : null}
          </div>
        </div>
        <Link href={actionHref} className={`shrink-0 text-[11px] font-bold uppercase tracking-[0.16em] ${tone}`}>
          {action}
        </Link>
      </div>
      {children}
    </section>
  );
}

function MatchRow({ match }: { match: DisplayMatch }) {
  const hasScore = typeof match.homeScore === "number" && typeof match.awayScore === "number";
  const dateLabel = match.date || "Today";
  const timeLabel = match.kickoff || match.time || "TBC";
  return (
    <div className="grid grid-cols-[64px_1px_1fr_44px_38px] items-center gap-2.5 border-b border-white/6 bg-gradient-to-r from-[#111823]/95 to-[#0c121b]/95 px-3 py-2.5 last:border-0 first:rounded-t-[18px] last:rounded-b-[18px] md:grid-cols-[70px_1px_1fr_54px_42px]">
      <div className="text-center">
        <div className="text-[10px] font-semibold uppercase leading-tight text-gray-500">{dateLabel}</div>
        <div className="text-xs font-medium text-gray-300">{timeLabel}</div>
        <div className="text-xs font-bold uppercase text-primary">{match.status}</div>
      </div>
      <div className="h-12 bg-white/12" />
      <div className="min-w-0 space-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <TeamLogo logo={match.homeLogo} initial={match.homeInitial || match.home.slice(0, 3)} color="#182333" size="sm" />
          <span className="truncate text-base font-medium text-white">{match.home}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <TeamLogo logo={match.awayLogo} initial={match.awayInitial || match.away.slice(0, 3)} color="#182333" size="sm" />
          <span className="truncate text-base font-medium text-white/78">{match.away}</span>
        </div>
      </div>
      <div className="space-y-1 text-right">
        <div className="text-xl font-bold text-primary">{hasScore ? match.homeScore : "-"}</div>
        <div className="text-xl font-bold text-white">{hasScore ? match.awayScore : "-"}</div>
      </div>
      <button aria-label="Set alert" className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/10 text-indigo-300 md:h-10 md:w-10">
        <Bell className="h-4 w-4" />
      </button>
    </div>
  );
}

function StandingRow({ row }: { row: StandingEntry }) {
  return (
    <div className="grid grid-cols-[30px_1fr_30px_30px_30px_40px_40px] items-center border-b border-white/5 px-3 py-2 text-sm last:border-0 md:grid-cols-[34px_1fr_34px_34px_34px_44px_44px]">
      <div className="font-semibold text-gray-400">{row.rank}</div>
      <div className="flex min-w-0 items-center gap-2">
        <img src={row.logo} alt={row.team} className="h-6 w-6 shrink-0 object-contain" />
        <span className="truncate font-medium text-white">{row.team}</span>
      </div>
      <div className="text-center text-gray-400">{row.played}</div>
      <div className="text-center text-gray-400">{row.won}</div>
      <div className="text-center text-gray-400">{row.lost}</div>
      <div className="text-center text-gray-400">{row.gd}</div>
      <div className="text-center font-bold text-purple-300">{row.points}</div>
    </div>
  );
}

function WorldCupRow({ match }: { match: DisplayMatch }) {
  return (
    <div className="grid grid-cols-[62px_1fr_54px_1fr_28px] items-center gap-2 border-b border-[#FFD700]/10 px-3 py-2.5 last:border-0 md:grid-cols-[72px_1fr_64px_1fr_34px]">
      <div className="text-center text-[10px] font-semibold uppercase leading-tight text-gray-400 md:text-[11px]">{match.date}</div>
      <div className="flex min-w-0 items-center gap-2">
        <TeamLogo logo={match.homeLogo} initial={match.home.slice(0, 3)} color="#182333" size="sm" />
        <span className="truncate text-sm font-bold text-white">{match.home}</span>
      </div>
      <div className="text-center">
        <div className="text-sm font-bold text-white">{match.time}</div>
        <div className="text-[9px] font-bold uppercase text-[#FFD700]">{match.status}</div>
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2">
        <span className="truncate text-right text-sm font-bold text-white">{match.away}</span>
        <TeamLogo logo={match.awayLogo} initial={match.away.slice(0, 3)} color="#182333" size="sm" />
      </div>
      <Star className="h-5 w-5 text-white/80" />
    </div>
  );
}

export default function LandingPage() {
  const [live, setLive] = useState<LiveMatch[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [worldCup, setWorldCup] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        const [liveData, recentData, upcomingData, tableData, wcData] = await Promise.all([
          fetchLiveMatches(),
          fetchRecentMatches(),
          fetchUpcomingFixtures(),
          fetchStandings(39),
          fetchLeagueFixtures(1, 2026, 6),
        ]);
        if (!mounted) return;
        setLive(Array.isArray(liveData) ? liveData.slice(0, 8) : []);
        setRecent(Array.isArray(recentData) ? recentData.slice(0, 5) : []);
        setUpcoming(Array.isArray(upcomingData) ? upcomingData.slice(0, 12) : []);
        setStandings(Array.isArray(tableData) ? tableData.slice(0, 4) : []);
        setWorldCup(Array.isArray(wcData) ? wcData.slice(0, 4) : []);
      } catch (error) {
        if (mounted) {
          setLive([]);
          setRecent([]);
          setUpcoming([]);
          setStandings([]);
          setWorldCup([]);
        }
        console.error("Live Hub fetch failed:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    const timer = window.setInterval(run, 30000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const displayMatches: DisplayMatch[] = useMemo(() => {
    if (live.length > 0) {
      return live.slice(0, 3).map((m) => ({
        ...m,
        status: m.status || "LIVE",
      }));
    }
    if (recent.length > 0) {
      return recent.slice(0, 3).map((m: any) => ({ ...m, status: "FT" }));
    }
    return upcoming.slice(0, 3).map((m: any) => ({ ...m, status: m.date || "NS" }));
  }, [live, recent, upcoming]);

  const wcMatches: DisplayMatch[] = (worldCup.length > 0 ? worldCup : WC_FALLBACK).slice(0, 2);
  const now = new Date();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black pb-24 text-white">
      <SEO
        title="BallMtaani Live Hub | Kenyan Football Intelligence"
        description="BallMtaani Live Hub brings Kenyan fans live scores, fixtures, Premier League standings, World Cup 2026 tracking, Mchambuzi Halisi AI and football debate routes."
        keywords={[
          "BallMtaani live hub",
          "Kenyan football live scores",
          "football data center Kenya",
          "World Cup 2026 tracker",
          "Mchambuzi Halisi",
          "Premier League Kenya",
        ]}
        path="/"
        breadcrumbs={[{ name: "BallMtaani", url: "/" }]}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "BallMtaani football intelligence features",
            "itemListElement": FEATURE_LINKS.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.label,
              "url": `https://ballmtaani.com${item.href}`,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "SportsOrganization",
            "name": "BallMtaani",
            "sport": "Football",
            "url": "https://ballmtaani.com/",
            "areaServed": "Kenya",
          },
        ]}
      />

      <div className="fixed inset-0 z-0 bg-black">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1800&q=85"
          alt=""
          className="h-full w-full scale-105 object-cover opacity-70"
        />
        <img
          src="https://images.unsplash.com/photo-1614632537197-38a17061c2bd?auto=format&fit=crop&w=900&q=85"
          alt=""
          className="absolute right-[-130px] top-12 h-[270px] w-[390px] rotate-[-8deg] rounded-full object-cover opacity-75 mix-blend-screen md:right-[-30px] md:top-16 md:h-[410px] md:w-[560px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,34,42,0.82),transparent_21%),radial-gradient(circle_at_18%_28%,rgba(30,111,255,0.28),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.18),rgba(5,7,11,0.62)_42%,#05070b_88%)]" />
        <div className="absolute inset-x-0 top-0 h-[380px] bg-[linear-gradient(112deg,transparent_0%,rgba(239,35,48,0.46)_35%,rgba(255,110,20,0.14)_48%,transparent_68%)] opacity-95" />
        <div className="absolute left-0 top-[11%] h-44 w-full bg-[radial-gradient(circle,rgba(255,70,70,0.85)_0_1px,transparent_2px)] bg-[length:34px_34px] opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),transparent_36%,rgba(0,0,0,0.38)_64%,rgba(0,0,0,0.92))]" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-3 pt-3 md:px-5 md:pt-6">
        <div className="pointer-events-none absolute left-3 right-3 top-0 -z-10 h-[420px] rounded-b-[42px] bg-[linear-gradient(180deg,rgba(5,7,11,0.08),rgba(5,7,11,0.38)_54%,rgba(5,7,11,0.84))]" />
        <header className="mb-4 flex items-start justify-between gap-3">
          <Link href="/home" aria-label="Go to app home" className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/90 backdrop-blur-md transition-colors hover:border-primary/60 hover:text-primary">
            <Home className="h-5 w-5" />
          </Link>
          <div className="min-w-0 text-center">
            <h1 className="text-[2rem] font-bold italic leading-none tracking-tight text-white md:text-5xl">
              BallMtaani <span className="text-primary">Live Hub</span>
            </h1>
          </div>
          <button aria-label="Alerts" className="relative mt-2 text-white/90">
            <Bell className="h-7 w-7 md:h-8 md:w-8" />
            <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-primary" />
          </button>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-primary bg-primary/15 px-4 py-2.5 shadow-[0_0_22px_rgba(239,35,48,0.65)]">
            <span className="h-3 w-3 rounded-full bg-white shadow-[0_0_10px_white]" />
            <span className="text-lg font-bold uppercase">Live</span>
          </div>
          <div className="text-base font-medium text-gray-200 md:text-lg">
            {now.toLocaleDateString("en-KE", { weekday: "long", day: "2-digit", month: "short" })}
            <span className="mx-2 text-gray-500">.</span>
            <span className="text-blue-200">{now.toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true })}</span>
          </div>
        </div>

        <section className="mb-3 grid grid-cols-2 gap-2.5 md:mb-4 md:grid-cols-4 md:gap-3">
          <StatCard icon={Goal} value={live.length || displayMatches.length} label="Live Matches" sub={live.length ? "In Play Now" : "Latest Feed"} tone="border-primary/70 text-primary" />
          <StatCard icon={CalendarDays} value={upcoming.length} label="Upcoming" sub="Next 7 Days" tone="border-accent/70 text-accent" />
          <StatCard icon={Trophy} value="WC26" label="Tracker" sub="Road to 2026" tone="border-[#FFD700]/70 text-[#FFD700]" href="/world-cup-2026" />
          <StatCard icon={Sparkles} value="Live" label="Matchday Engine" sub="Now Syncing" tone="border-purple-400/70 text-purple-300" />
        </section>

        <div className="grid gap-3 md:grid-cols-[1.08fr_0.92fr] md:items-start">
          <Panel title={live.length ? "Live Scores" : "Latest Scores"} action="View All">
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#111823]">
              {loading ? (
                <div className="p-5 text-center text-xs font-bold uppercase tracking-widest text-gray-500">Syncing latest matchday feed...</div>
              ) : displayMatches.length > 0 ? (
                displayMatches.map((match) => <MatchRow key={match.id} match={match} />)
              ) : (
                <div className="p-5 text-center text-xs font-bold uppercase tracking-widest text-gray-500">No fresh scoreline feed right now.</div>
              )}
            </div>
          </Panel>

          <Panel title="Premier League" subtitle="Standings" action="View Table" tone="text-purple-300">
            <div className="overflow-hidden rounded-2xl bg-[#111823]">
              <div className="grid grid-cols-[30px_1fr_30px_30px_30px_40px_40px] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 md:grid-cols-[34px_1fr_34px_34px_34px_44px_44px]">
                <span />
                <span />
                <span className="text-center">P</span>
                <span className="text-center">W</span>
                <span className="text-center">L</span>
                <span className="text-center">GD</span>
                <span className="text-center">Pts</span>
              </div>
              {standings.length > 0 ? (
                standings.map((row) => <StandingRow key={row.team} row={row} />)
              ) : (
                <div className="p-5 text-center text-xs font-bold uppercase tracking-widest text-gray-500">Table update pending. Check back shortly.</div>
              )}
            </div>
          </Panel>
        </div>

        <div className="mt-3">
          <Panel title="WC26" subtitle="World Cup 2026" action="Explore Guide" actionHref="/world-cup-2026" tone="text-[#FFD700]">
            <div className="overflow-hidden rounded-2xl border border-[#FFD700]/20 bg-[#151307]/80">
              {wcMatches.map((match) => <WorldCupRow key={match.id} match={match} />)}
            </div>
          </Panel>
        </div>

        <section className="mt-3 grid grid-cols-2 gap-2.5 md:mt-4 md:grid-cols-4 md:gap-3">
          {FEATURE_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`relative overflow-hidden rounded-xl border p-3 text-center transition-transform hover:-translate-y-0.5 md:p-4 ${item.tone}`}>
                <div className="absolute inset-x-3 top-0 h-px bg-current/50" />
                <Icon className="mx-auto mb-1.5 h-6 w-6 md:h-7 md:w-7" />
                <div className="text-[13px] font-bold uppercase tracking-normal text-white md:text-sm">{item.label}</div>
                <div className="text-xs font-medium text-gray-300">{item.sub}</div>
              </Link>
            );
          })}
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0d121b]/95 px-2 pb-3 pt-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
          <Link href="/matches" className="flex flex-col items-center gap-1 text-[11px] font-bold text-primary">
            <Goal className="h-6 w-6" />
            Football
          </Link>
          <Link href="/fan-zones" className="flex flex-col items-center gap-1 text-[11px] font-bold text-gray-400">
            <Star className="h-6 w-6" />
            Favourites
          </Link>
          <Link href="/world-cup-2026" className="-mt-7 flex flex-col items-center gap-1 text-[11px] font-bold text-white">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-[#1b2331] shadow-[0_0_28px_rgba(255,255,255,0.18)]">
              <Trophy className="h-8 w-8 text-[#FFD700]" />
            </span>
            WC26
          </Link>
          <Link href="/live-center" className="flex flex-col items-center gap-1 text-[11px] font-bold text-gray-400">
            <Newspaper className="h-6 w-6" />
            Feed
          </Link>
          <Link href="/predictions" className="flex flex-col items-center gap-1 text-[11px] font-bold text-gray-400">
            <Shirt className="h-6 w-6" />
            Fantasy
          </Link>
        </div>
      </nav>

      <footer className="relative z-10 mx-auto mt-6 max-w-5xl px-3 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-white/45 md:px-5">
        <div>Powered by API-Football.</div>
        <div className="mt-3">
          <OddspediaCredit />
        </div>
      </footer>
      <FloatingMchambuzi variant="landing" />
    </div>
  );
}
