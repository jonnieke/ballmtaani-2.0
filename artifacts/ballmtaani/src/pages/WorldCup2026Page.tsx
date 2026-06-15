import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { CalendarDays, ChevronRight, MapPin, Shield, Sparkles, Trophy, Users, Zap, Flame, Clock, Star } from "lucide-react";
import SEO from "../components/SEO";
import WC26TeamExplorer from "../components/WC26TeamExplorer";
import {
  fetchTournamentFixtures,
  fetchTournamentStandings,
  type TournamentStandingEntry,
} from "../lib/football-api";
import { WC26_GUIDES } from "../data/wc26-guides";
import { WC26_STADIUMS } from "../data/wc26-teams";

// --- Static data ---
const WC26_START = new Date("2026-06-11T17:00:00Z");
const WC26_END   = new Date("2026-07-20T00:00:00Z");

const TIMELINE = [
  { label: "Group Stage",    date: "Jun 11-27",    detail: "72 matches - 12 groups of 4" },
  { label: "Round of 32",   date: "Jun 28-Jul 3", detail: "Top 2 per group + 8 best thirds" },
  { label: "Round of 16",   date: "Jul 4-7",      detail: "Knockout pressure bites" },
  { label: "Quarter-finals",date: "Jul 9-11",     detail: "Eight nations remain" },
  { label: "Semi-finals",   date: "Jul 14-15",    detail: "Two games from immortality" },
  { label: "Final",         date: "Jul 19",       detail: "MetLife Stadium - New Jersey" },
];

const HOSTS = [
  { flag: "https://media.api-sports.io/flags/us.svg", name: "United States", stadiums: 11, cities: "Atlanta - Dallas - LA - Miami - NY/NJ - Philadelphia - Kansas City - Boston - Seattle - Houston - Santa Clara" },
  { flag: "https://media.api-sports.io/flags/ca.svg", name: "Canada",         stadiums: 2,  cities: "Toronto - Vancouver" },
  { flag: "https://media.api-sports.io/flags/mx.svg", name: "Mexico",         stadiums: 3,  cities: "Mexico City - Guadalajara - Monterrey" },
];

// African nations with proper flag images
const CAF_NATIONS = [
  { logo: "https://media.api-sports.io/flags/ma.svg", name: "Morocco",      group: "C", star: true,  note: "Semi-finalists in 2022" },
  { logo: "https://media.api-sports.io/flags/sn.svg", name: "Senegal",      group: "I", star: true,  note: "AFCON 2021 champions" },
  { logo: "https://media.api-sports.io/flags/ng.svg", name: "Nigeria",      group: "G", star: false, note: "Super Eagles with Osimhen" },
  { logo: "https://media.api-sports.io/flags/eg.svg", name: "Egypt",        group: "G", star: true,  note: "Mo Salah's last dance?" },
  { logo: "https://media.api-sports.io/flags/cm.svg", name: "Cameroon",     group: "F", star: false, note: "Onana & Anguissa lead" },
  { logo: "https://media.api-sports.io/flags/za.svg", name: "South Africa", group: "A", star: false, note: "Bafana making history" },
  { logo: "https://media.api-sports.io/flags/gh.svg", name: "Ghana",        group: "L", star: false, note: "Kudus & Partey shine" },
  { logo: "https://media.api-sports.io/flags/dz.svg", name: "Algeria",      group: "J", star: false, note: "Les Fennecs return" },
  { logo: "https://media.api-sports.io/flags/tn.svg", name: "Tunisia",      group: "F", star: false, note: "Eagles of Carthage" },
];

// Group of Death candidates
const GROUPS_OF_DEATH = [
  { group: "C", teams: ["Brazil", "Morocco", "Haiti", "Scotland"],  reason: "Brazil vs Morocco is a must-watch clash of styles" },
  { group: "E", teams: ["Germany", "Curacao", "Ivory Coast", "Ecuador"], reason: "Germany face AFCON dark horses" },
  { group: "I", teams: ["France", "Senegal", "Iraq", "Norway"],     reason: "Mbappe vs Mane - the African rivalry game" },
  { group: "L", teams: ["England", "Croatia", "Ghana", "Panama"],   reason: "England face Euro 2020 final demons again" },
];

// Static fallback fixtures (opening round)
const WC26_OPENING_FIXTURES = [
  { home: "Mexico",    away: "South Africa", date: "Jun 11", time: "10:00 PM" },
  { home: "USA",       away: "Colombia",     date: "Jun 12", time: "1:00 AM"  },
  { home: "Canada",    away: "Venezuela",    date: "Jun 12", time: "4:00 PM"  },
  { home: "Brazil",    away: "Morocco",      date: "Jun 14", time: "1:00 AM"  },
  { home: "Argentina", away: "Algeria",      date: "Jun 17", time: "4:00 AM"  },
  { home: "France",    away: "Senegal",      date: "Jun 17", time: "7:00 PM"  },
];

const WC26_GROUPS: Record<string, TournamentStandingEntry[]> = {
  "Group A": [
    { rank: 1, team: "Mexico",       logo: "https://media.api-sports.io/flags/mx.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
    { rank: 2, team: "South Africa", logo: "https://media.api-sports.io/flags/za.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
    { rank: 3, team: "USA",          logo: "https://media.api-sports.io/flags/us.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
    { rank: 4, team: "Colombia",     logo: "https://media.api-sports.io/flags/co.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
  ],
  "Group B": [
    { rank: 1, team: "Canada",      logo: "https://media.api-sports.io/flags/ca.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
    { rank: 2, team: "Venezuela",   logo: "https://media.api-sports.io/flags/ve.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
    { rank: 3, team: "Spain",       logo: "https://media.api-sports.io/flags/es.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
    { rank: 4, team: "Costa Rica",  logo: "https://media.api-sports.io/flags/cr.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
  ],
};

// --- Countdown hook ---
function useCountdown() {
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0, live: false, over: false });
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const over = now > WC26_END.getTime();
      const live = !over && now >= WC26_START.getTime();
      const diff = WC26_START.getTime() - now;
      setCd({
        d: Math.max(0, Math.floor(diff / 86400000)),
        h: Math.max(0, Math.floor((diff % 86400000) / 3600000)),
        m: Math.max(0, Math.floor((diff % 3600000) / 60000)),
        s: Math.max(0, Math.floor((diff % 60000) / 1000)),
        live, over,
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return cd;
}

function CDBlock({ v, l }: { v: number; l: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[56px] rounded-2xl border border-[#FFD700]/30 bg-black/70 px-3 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,215,0,0.15),0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <span className="block text-3xl font-black tabular-nums leading-none text-white md:text-4xl">{String(v).padStart(2,"0")}</span>
      </div>
      <span className="mt-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-[#FFD700]/55">{l}</span>
    </div>
  );
}

function FixtureRow({ fixture }: { fixture: any }) {
  const isLive = fixture.status?.short === "1H" || fixture.status?.short === "2H" || fixture.status?.short === "HT";
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-white/6 px-3 py-3.5 last:border-0 hover:bg-white/3 transition-colors">
      <div className="flex min-w-0 items-center gap-2">
        {fixture.homeLogo ? (
          <img src={fixture.homeLogo} alt={fixture.home} className="h-6 w-6 object-contain" loading="lazy" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-black text-white/50">
            {(fixture.home || "").slice(0, 2).toUpperCase()}
          </div>
        )}
        <span className="truncate text-sm font-bold text-white">{fixture.home}</span>
      </div>
      <div className="text-center min-w-[70px]">
        {isLive ? (
          <div className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black text-white">{fixture.score || "LIVE"}</span>
          </div>
        ) : (
          <>
            <div className="text-[11px] font-black text-[#FFD700]">{fixture.date}</div>
            <div className="text-[9px] uppercase tracking-[0.1em] text-white/38">{fixture.time} EAT</div>
          </>
        )}
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2">
        <span className="truncate text-right text-sm font-bold text-white">{fixture.away}</span>
        {fixture.awayLogo ? (
          <img src={fixture.awayLogo} alt={fixture.away} className="h-6 w-6 object-contain" loading="lazy" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-black text-white/50">
            {(fixture.away || "").slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupTable({ name, rows }: { name: string; rows: TournamentStandingEntry[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0b1119]/90 transition-all hover:border-white/14">
      <div className="flex items-center justify-between border-b border-white/6 px-3 py-2.5 bg-white/2">
        <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white">{name}</h3>
        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#22c55e]/70">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />API-Football
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5 text-[9px] font-bold uppercase tracking-widest text-white/25">
              <th className="px-3 py-1.5 text-left">#</th>
              <th className="px-3 py-1.5 text-left">Team</th>
              <th className="px-3 py-1.5 text-center">P</th>
              <th className="px-3 py-1.5 text-center">W</th>
              <th className="px-3 py-1.5 text-center">GD</th>
              <th className="px-3 py-1.5 text-center font-black text-[#FFD700]/40">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.team} className={`border-b border-white/4 last:border-0 transition-colors hover:bg-white/3 ${i < 2 ? "bg-[#FFD700]/3" : ""}`}>
                <td className={`px-3 py-2 font-bold ${i < 2 ? "text-[#FFD700]" : "text-white/30"}`}>{r.rank}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <img src={r.logo} alt="" aria-hidden="true" className="h-4 w-4 object-contain" loading="lazy" />
                    <span className="font-semibold text-white text-[11px]">{r.team}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-center text-white/40">{r.played}</td>
                <td className="px-3 py-2 text-center text-white/40">{r.won}</td>
                <td className="px-3 py-2 text-center text-white/40">{r.gd}</td>
                <td className="px-3 py-2 text-center font-black text-[#FFD700]">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Page ---
export default function WorldCup2026Page() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [standings, setStandings] = useState<Record<string, TournamentStandingEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [standingsSyncedAt, setStandingsSyncedAt] = useState<string | null>(null);
  const cd = useCountdown();

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([fetchTournamentFixtures(1, 2026), fetchTournamentStandings(1, 2026)]).then(([fixturesResult, standingsResult]) => {
      if (!mounted) return;

      if (fixturesResult.status === "fulfilled") setFixtures(fixturesResult.value);

      if (standingsResult.status === "fulfilled") {
        setStandings(standingsResult.value);
        setStandingsError(null);
        setStandingsSyncedAt(new Date().toLocaleTimeString("en-KE", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Africa/Nairobi",
        }));
      } else {
        setStandings({});
        setStandingsError("API-Football standings are temporarily unavailable.");
        setStandingsSyncedAt(null);
      }

      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const nextFixtures = useMemo(() => fixtures.slice(0, 8), [fixtures]);
  const groupEntries = useMemo(() => Object.entries(standings), [standings]);
  const hasGroups    = groupEntries.length > 0;

  // Featured stadiums  -  top 8 for the showcase
  const featuredStadiums = WC26_STADIUMS.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#05070b] pb-32 text-white">
      <SEO
        title="World Cup 2026 | BallMtaani WC26 Hub  -  Groups, Fixtures & Fan Predictions"
        description="Track FIFA World Cup 2026 live: groups, fixtures, stadiums, African nations and fan predictions. Kenya's WC26 command center on BallMtaani."
        keywords={["World Cup 2026","FIFA WC26","WC26 groups","WC26 fixtures","World Cup Africa","BallMtaani WC26","WC26 predictions Kenya"]}
        path="/world-cup-2026"
        structuredData={{ "@context":"https://schema.org","@type":"SportsEvent","name":"FIFA World Cup 2026","sport":"Football","startDate":"2026-06-11","endDate":"2026-07-19" }}
      />

      {/* -- CINEMATIC HERO -- */}
      <section className="relative overflow-hidden border-b border-[#FFD700]/15">
        <img src="https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/World_Cup_stadium_interior_flood.jpeg" alt="" decoding="async" loading="eager"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_10%,rgba(5,7,11,0.75)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-[#05070b]/20 to-transparent" />
        {/* Animated top glow */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent" />
        {/* Host country stripe */}
        <div className="absolute bottom-0 left-0 right-0 flex h-[3px]">
          <div className="flex-1 bg-[#3C3B6E]" /><div className="flex-1 bg-white/30" /><div className="flex-1 bg-[#B22234]" />
          <div className="flex-1 bg-[#B22234]" /><div className="flex-1 bg-white/30" /><div className="flex-1 bg-[#B22234]" />
          <div className="flex-1 bg-[#006847]" /><div className="flex-1 bg-white/30" /><div className="flex-1 bg-[#CE1126]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-5 py-2 backdrop-blur-sm">
            {cd.live && <span className="h-2 w-2 rounded-full bg-[#FFD700] animate-pulse" />}
            <Trophy className="h-4 w-4 text-[#FFD700]" />
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FFD700]">
              {cd.live ? "World Cup 2026  -  Live Now" : "FIFA World Cup 2026"}
            </span>
            <Trophy className="h-4 w-4 text-[#FFD700]" />
          </div>

          {/* Headline */}
          <h1
            className="mb-4 text-5xl font-black italic leading-[0.88] tracking-tight md:text-7xl lg:text-8xl"
            style={{
              color: "#FFE033",
              WebkitTextStroke: "1px #C47200",
              textShadow: [
                "1px 1px 0 #EAA800","2px 2px 0 #D09000","3px 3px 0 #B87800",
                "4px 4px 0 #A06200","5px 5px 0 #884E00","6px 6px 0 #703C00",
                "7px 7px 12px rgba(0,0,0,0.9)","0 0 40px rgba(255,215,0,0.3)",
              ].join(", "),
            }}
          >
            {cd.live ? <>The World Cup<br />Is Live</> : <>The Biggest<br />World Cup Ever</>}
          </h1>

          <p className="mx-auto mb-8 max-w-lg rounded-full border border-white/18 bg-black/55 px-5 py-2 text-sm font-bold text-white backdrop-blur-md">
            48 nations  -  104 matches  -  {cd.live ? "Running until Jul 19  -  All times EAT" : "Jun 11 - Jul 19  -  All times EAT"}
          </p>

          {/* Countdown or Live badge */}
          {!cd.live && !cd.over && (
            <div className="mb-8 flex items-end justify-center gap-3">
              <CDBlock v={cd.d} l="Days" />
              <span className="mb-8 text-3xl font-black text-[#FFD700]/30">:</span>
              <CDBlock v={cd.h} l="Hours" />
              <span className="mb-8 text-3xl font-black text-[#FFD700]/30">:</span>
              <CDBlock v={cd.m} l="Min" />
              <span className="mb-8 text-3xl font-black text-[#FFD700]/30">:</span>
              <CDBlock v={cd.s} l="Sec" />
            </div>
          )}

          {cd.live && (
            <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-950/60 px-6 py-3 backdrop-blur-sm">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-black uppercase tracking-widest text-red-400">Tournament in Progress</span>
              <Clock className="h-4 w-4 text-red-400" />
            </div>
          )}

          {/* Host nations */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            {HOSTS.map(h => (
              <span key={h.name} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <img src={h.flag} alt={h.name} className="h-4 w-4 object-contain rounded-sm" />
                {h.name}
              </span>
            ))}
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/predictions"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-7 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-black shadow-[0_0_28px_rgba(255,214,0,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_45px_rgba(255,214,0,0.7)] active:scale-95">
              {cd.live ? "Call the Scoreline" : "Make Your Group Stage Call"}
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/mchambuzi-halisi"
              className="inline-flex items-center gap-2 rounded-xl border border-[#FFD700]/35 bg-black/40 px-7 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-[#FFD700] backdrop-blur-sm transition-all hover:border-[#FFD700]/70 hover:bg-[#FFD700]/10 active:scale-95">
              <Sparkles className="h-4 w-4" /> Ask Mchambuzi
            </Link>
          </div>
        </div>
      </section>

      {/* -- STATS STRIP -- */}
      <section className="border-b border-white/6 bg-[#07090e]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-white/6 md:grid-cols-4">
          {[
            { icon: Users,       v: "48",  l: "Nations" },
            { icon: Shield,      v: "12",  l: "Groups"  },
            { icon: MapPin,      v: "16",  l: "Stadiums" },
            { icon: CalendarDays,v: "104", l: "Matches"  },
          ].map(({ icon: Icon, v, l }) => (
            <div key={l} className="flex flex-col items-center gap-1 py-5 hover:bg-white/2 transition-colors">
              <Icon className="mb-1 h-4 w-4 text-[#FFD700]/55" />
              <span className="text-2xl font-black text-white">{v}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{l}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">

        {/* -- GROUP STAGE -- */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white">Group Stage</h2>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">
                {hasGroups
                  ? `Source: API-Football standings${standingsSyncedAt ? ` - synced ${standingsSyncedAt} EAT` : ""}`
                  : "Waiting for API-Football standings"}
              </p>
            </div>
            {!hasGroups && (
              <div className="rounded-full border border-[#FFD700]/25 bg-[#FFD700]/8 px-3 py-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
                  {cd.d}d {cd.h}h away
                </span>
              </div>
            )}
          </div>

          {hasGroups ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupEntries.map(([name, rows]) => <GroupTable key={name} name={name} rows={rows} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#FFD700]/18 bg-[#090d14] px-5 py-8 text-center">
              <Trophy className="mx-auto mb-3 h-8 w-8 text-[#FFD700]/55" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                Live standings loading
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-white/45">
                {loading
                  ? "Fetching the official World Cup 2026 tables from API-Football."
                  : standingsError || "API-Football has not returned group standings for this view yet."}
              </p>
            </div>
          )}
        </section>

        {/* -- WC26 KNOWLEDGE BASE -- */}
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white">WC26 Knowledge Base</h2>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/34">
                Format, stadiums, Africa watch and squad logic
              </p>
            </div>
            <Link href="/world-cup-2026/format" className="hidden rounded-full border border-[#FFD700]/20 bg-[#FFD700]/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFD700] sm:inline-flex hover:bg-[#FFD700]/15 transition-colors">
              Start with format
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WC26_GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/world-cup-2026/${guide.slug}`}
                className="group rounded-2xl border border-white/8 bg-[#090d14] p-4 transition-all hover:-translate-y-1 hover:border-[#FFD700]/28 hover:bg-[#101622] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              >
                <div className="mb-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#FFD700]/52">{guide.eyebrow}</div>
                <h3 className="text-sm font-black uppercase leading-snug tracking-[0.08em] text-white">{guide.title}</h3>
                <p className="mt-3 line-clamp-3 text-xs leading-6 text-white/45">{guide.deck}</p>
                <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-white/34">
                  Read guide
                  <ChevronRight className="h-3.5 w-3.5 text-[#FFD700] transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* -- FIXTURES + TOURNAMENT ROADMAP -- */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Fixtures */}
          <div className="overflow-hidden rounded-2xl border border-[#FFD700]/20 bg-[#0c0e0a]/90">
            <div className="flex items-center justify-between border-b border-[#FFD700]/12 px-4 py-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">WC26 Fixtures</h2>
                <p className="text-[10px] text-[#FFD700]/55 font-semibold uppercase tracking-widest">Live tournament feed</p>
              </div>
              <Trophy className="h-5 w-5 text-[#FFD700]/50" />
            </div>
            {loading ? (
              <div className="p-8 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Loading feed...</div>
            ) : nextFixtures.length > 0 ? (
              nextFixtures.map(f => <FixtureRow key={f.id} fixture={f} />)
            ) : (
              <div className="space-y-0">
                {WC26_OPENING_FIXTURES.map((f, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-white/5 px-4 py-3.5 last:border-0 hover:bg-white/3 transition-colors">
                    <span className="text-xs font-bold text-white">{f.home}</span>
                    <div className="text-center">
                      <div className="text-[11px] font-black text-[#FFD700]">{f.date}</div>
                      <div className="text-[9px] text-white/30">{f.time} EAT</div>
                    </div>
                    <span className="text-right text-xs font-bold text-white">{f.away}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tournament roadmap */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#080d14]/90">
            <div className="border-b border-white/6 px-4 py-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Tournament Roadmap</h2>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">Jun 11 - Jul 19, 2026</p>
            </div>
            <div className="divide-y divide-white/5">
              {TIMELINE.map((item, i) => (
                <div key={item.label} className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${i === TIMELINE.length - 1 ? "bg-[#FFD700]/6" : "hover:bg-white/2"}`}>
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${i === TIMELINE.length - 1 ? "bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.6)]" : "bg-white/20"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-xs font-black uppercase ${i === TIMELINE.length - 1 ? "text-[#FFD700]" : "text-white"}`}>{item.label}</span>
                      <span className="text-[9px] font-bold text-white/35">{item.date}</span>
                    </div>
                    <p className="text-[11px] text-white/38 mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* -- AFRICA AT WC26  -  PREMIUM SECTION -- */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-[#006600]/35 bg-[#030804]/95">
          <div className="flex items-center gap-3 border-b border-[#006600]/20 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#006600]/20 text-xl"></div>
            <div className="flex-1">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Africa at WC26</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#22c55e]/65">9 CAF spots  -  Most African nations ever at a World Cup</p>
            </div>
            <Link href="/predictions" className="ml-auto inline-flex items-center gap-1 rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#22c55e] transition-all hover:bg-[#22c55e]/20">
              Back a team <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-0 sm:grid-cols-5 lg:grid-cols-9">
            {CAF_NATIONS.map(n => (
              <div key={n.name} className="group flex flex-col items-center gap-2 px-2 py-5 text-center transition-all hover:bg-[#006600]/12 cursor-pointer border-r border-b border-[#006600]/10 last:border-r-0">
                <div className="relative">
                  <img src={n.logo} alt={n.name} className="h-10 w-10 object-contain rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.5)]" loading="lazy" />
                  {n.star && (
                    <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#FFD700] flex items-center justify-center">
                      <Star className="h-2.5 w-2.5 text-black" fill="currentColor" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-black text-white/85 leading-tight">{n.name}</div>
                  <div className="text-[8px] text-[#22c55e]/60 font-bold uppercase mt-0.5">Grp {n.group}</div>
                </div>
                {/* hover tooltip */}
                <div className="hidden group-hover:block absolute mt-16 z-20 rounded-lg border border-[#22c55e]/20 bg-[#040d04]/95 px-2 py-1.5 text-[9px] text-white/70 leading-tight max-w-[100px] text-center shadow-xl backdrop-blur-sm pointer-events-none">
                  {n.note}
                </div>
              </div>
            ))}
          </div>

          {/* African team notes strip */}
          <div className="flex items-center gap-4 overflow-x-auto px-5 py-3 border-t border-[#006600]/10 scrollbar-none">
            {CAF_NATIONS.map(n => (
              <div key={n.name} className="flex items-center gap-2 shrink-0">
                <img src={n.logo} alt={n.name} className="h-4 w-4 object-contain" loading="lazy" />
                <span className="text-[10px] text-white/40">{n.note}</span>
                <span className="text-white/10"> - </span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#006600]/10 px-5 py-3">
            <p className="text-[10px] text-white/28">
              No Kenya at WC26  -  but Harambee Stars are building. Back an African team and keep the receipt when they go deep.
            </p>
          </div>
        </section>

        {/* -- GROUPS OF DEATH -- */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white">Groups of Death</h2>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">The most dangerous pools to escape</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {GROUPS_OF_DEATH.map(g => (
              <div key={g.group} className="group rounded-2xl border border-orange-500/20 bg-[#0d0804]/90 p-4 transition-all hover:border-orange-500/40 hover:bg-[#140c04]/90 hover:-translate-y-0.5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/15 text-sm font-black text-orange-400">
                    {g.group}
                  </div>
                  <Flame className="h-4 w-4 text-orange-500/60" />
                </div>
                <div className="mb-2 flex flex-wrap gap-1">
                  {g.teams.map(t => (
                    <span key={t} className="inline-block rounded-full bg-white/6 px-2 py-0.5 text-[10px] font-bold text-white/70">{t}</span>
                  ))}
                </div>
                <p className="text-[10px] text-orange-400/70 leading-relaxed">{g.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* -- TEAM EXPLORER -- */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-black uppercase tracking-widest text-white">Explore Teams</h2>
            <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">
              Search by name  -  View fixtures  -  Check squads and stadiums
            </p>
          </div>
          <WC26TeamExplorer />
        </section>

        {/* -- STADIUMS SHOWCASE -- */}
        <section className="mb-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white">3 Host Nations  -  16 Stadiums</h2>
              <p className="mt-1 text-[10px] text-white/30 font-semibold uppercase tracking-widest">
                From the Azteca to MetLife  -  the stages of WC26
              </p>
            </div>
          </div>

          {/* Host nation overviews */}
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {HOSTS.map(h => (
              <div key={h.name} className="overflow-hidden rounded-2xl border border-white/8 bg-[#0d0f14]/90 p-4 hover:border-white/15 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <img src={h.flag} alt={h.name} className="h-8 w-8 object-contain rounded shadow-sm" loading="lazy" />
                  <div>
                    <div className="text-sm font-black text-white">{h.name}</div>
                    <div className="text-[10px] text-white/35">{h.stadiums} stadium{h.stadiums > 1 ? "s" : ""}</div>
                  </div>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{h.cities}</p>
              </div>
            ))}
          </div>

          {/* Stadium image grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredStadiums.map(s => (
              <div key={s.name} className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#0d0f14] transition-all hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] via-[#0d0f14]/30 to-transparent" />
                  {s.finalVenue && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-[#FFD700] px-2 py-0.5">
                      <Trophy className="h-2.5 w-2.5 text-black" />
                      <span className="text-[8px] font-black text-black uppercase">Final</span>
                    </div>
                  )}
                  {s.note && !s.finalVenue && (
                    <div className="absolute top-2 right-2 rounded-full bg-orange-500/90 px-2 py-0.5 text-[8px] font-black text-white">
                      {s.note}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs font-black text-white leading-tight">{s.name}</div>
                  <div className="mt-0.5 text-[10px] text-white/45">{s.city}  -  {s.country}</div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9px] text-white/30">
                      <Users className="h-2.5 w-2.5" />
                      {s.capacity.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-[#FFD700]/50 font-bold">{s.matchCount} matches</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* -- FAN COMMAND CENTER -- */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-white/8 bg-[#080d14]/90">
          <div className="border-b border-white/6 px-5 py-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Your WC26 Command Center</h2>
            <p className="text-[10px] text-white/30">Everything a Kenyan fan needs  -  live, on BallMtaani.</p>
          </div>
          <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-white/6 lg:grid-cols-4">
            {[
              { href: "/predictions",     color: "text-[#B30000]", border: "hover:bg-[#B30000]/8", icon: Zap,      label: "Call the Score",   sub: "Pick every group match. Earn MTC." },
              { href: "/mchambuzi-halisi",color: "text-[#FFD700]", border: "hover:bg-[#FFD700]/5", icon: Sparkles, label: "Ask Mchambuzi",    sub: "WC26 AI analysis. Fan-first tone." },
              { href: "/live-center",     color: "text-blue-400",  border: "hover:bg-blue-500/8",  icon: Trophy,   label: "Live Center",      sub: "Stats, events, lineups as they happen." },
              { href: "/debates",         color: "text-purple-400",border: "hover:bg-purple-500/8",icon: Users,    label: "Debates Room",     sub: "Group of death takes. Banter receipts." },
            ].map(({ href, color, border, icon: Icon, label, sub }) => (
              <Link key={href} href={href} className={`flex flex-col p-5 transition-all ${border}`}>
                <Icon className={`mb-3 h-5 w-5 ${color}`} />
                <div className={`mb-1 text-xs font-black uppercase ${color}`}>{label}</div>
                <p className="text-[11px] text-white/35">{sub}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* -- PREDICTION CTA -- */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-[#FFD700]/25 bg-gradient-to-br from-[#1a1200] via-[#0f0d02] to-[#07090e]">
          <div className="px-6 py-10 text-center md:px-10">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-[#FFD700] drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]" />
            <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
              Call the WC26 Winner
            </h2>
            <p className="mx-auto mb-7 max-w-md text-sm text-white/50">
              Pick your champion before the group stage starts. Every correct call earns MTC status. The receipt doesn't lie.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/predictions"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-8 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_30px_rgba(255,214,0,0.4)] transition-all hover:shadow-[0_0_50px_rgba(255,214,0,0.6)] hover:scale-105 active:scale-95">
                Make My Call <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/leaderboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-white/70 transition-all hover:bg-white/10 active:scale-95">
                See Leaderboard
              </Link>
            </div>
          </div>
        </section>

        <footer className="text-center text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">
          <div>Data: API-Football  -  Tournament structure: FIFA WC2026</div>
        </footer>
      </div>
    </div>
  );
}
