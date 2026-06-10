import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { CalendarDays, ChevronRight, MapPin, Shield, Sparkles, Trophy, Users, Zap } from "lucide-react";
import SEO from "../components/SEO";
import TeamLogo from "../components/TeamLogo";
import WC26TeamExplorer from "../components/WC26TeamExplorer";
import {
  fetchTournamentFixtures,
  fetchTournamentStandings,
  type TournamentStandingEntry,
} from "../lib/football-api";
import { WC26_GUIDES } from "../data/wc26-guides";

// ─── Static data ─────────────────────────────────────────────
const WC26_START = new Date("2026-06-11T17:00:00Z");
const WC26_END   = new Date("2026-07-20T00:00:00Z");

const TIMELINE = [
  { label: "Group Stage",    date: "Jun 11–27", detail: "72 matches · 12 groups of 4" },
  { label: "Round of 32",   date: "Jun 28–Jul 3", detail: "Top 2 per group + 8 best thirds" },
  { label: "Round of 16",   date: "Jul 4–7",    detail: "Knockout pressure bites" },
  { label: "Quarter-finals",date: "Jul 9–11",   detail: "Eight nations remain" },
  { label: "Semi-finals",   date: "Jul 14–15",  detail: "Two games from immortality" },
  { label: "Final",         date: "Jul 19",     detail: "MetLife Stadium · New Jersey" },
];

const HOSTS = [
  { flag: "🇺🇸", name: "United States", stadiums: 11, cities: "Atlanta · Dallas · LA · Miami · NY/NJ · more" },
  { flag: "🇨🇦", name: "Canada",         stadiums: 2,  cities: "Toronto · Vancouver" },
  { flag: "🇲🇽", name: "Mexico",         stadiums: 3,  cities: "Mexico City · Guadalajara · Monterrey" },
];

const CAF_SPOTS = 9;
const CAF_NATIONS = [
  { flag: "🇲🇦", name: "Morocco" },
  { flag: "🇸🇳", name: "Senegal" },
  { flag: "🇳🇬", name: "Nigeria" },
  { flag: "🇪🇬", name: "Egypt" },
  { flag: "🇨🇲", name: "Cameroon" },
  { flag: "🇿🇦", name: "South Africa" },
  { flag: "🇬🇭", name: "Ghana" },
  { flag: "🇩🇿", name: "Algeria" },
  { flag: "🇹🇳", name: "Tunisia" },
];

const WC26_OPENING_FIXTURES = [
  { home: "Mexico", away: "South Africa", date: "Jun 11", time: "10:00 PM" },
  { home: "USA", away: "Colombia", date: "Jun 12", time: "1:00 AM" },
  { home: "Canada", away: "Venezuela", date: "Jun 12", time: "4:00 PM" },
  { home: "Brazil", away: "Germany", date: "Jun 13", time: "7:00 PM" },
  { home: "Argentina", away: "Morocco", date: "Jun 14", time: "10:00 PM" },
  { home: "France", away: "England", date: "Jun 14", time: "1:00 AM" },
];

const WC26_GROUPS: Record<string, TournamentStandingEntry[]> = {
  "Group A": [
    { rank: 1, team: "Mexico", logo: "https://media.api-sports.io/flags/mx.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
    { rank: 2, team: "South Africa", logo: "https://media.api-sports.io/flags/za.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
    { rank: 3, team: "USA", logo: "https://media.api-sports.io/flags/us.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
    { rank: 4, team: "Colombia", logo: "https://media.api-sports.io/flags/co.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
  ],
  "Group B": [
    { rank: 1, team: "Canada", logo: "https://media.api-sports.io/flags/ca.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
    { rank: 2, team: "Venezuela", logo: "https://media.api-sports.io/flags/ve.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
    { rank: 3, team: "Spain", logo: "https://media.api-sports.io/flags/es.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
    { rank: 4, team: "Costa Rica", logo: "https://media.api-sports.io/flags/cr.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
  ],
  "Group C": [
    { rank: 1, team: "Brazil", logo: "https://media.api-sports.io/flags/br.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "C" },
    { rank: 2, team: "Germany", logo: "https://media.api-sports.io/flags/de.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "C" },
    { rank: 3, team: "Japan", logo: "https://media.api-sports.io/flags/jp.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "C" },
    { rank: 4, team: "Morocco", logo: "https://media.api-sports.io/flags/ma.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "C" },
  ],
  "Group D": [
    { rank: 1, team: "Argentina", logo: "https://media.api-sports.io/flags/ar.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "D" },
    { rank: 2, team: "Uruguay", logo: "https://media.api-sports.io/flags/uy.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "D" },
    { rank: 3, team: "Paraguay", logo: "https://media.api-sports.io/flags/py.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "D" },
    { rank: 4, team: "Egypt", logo: "https://media.api-sports.io/flags/eg.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "D" },
  ],
  "Group E": [
    { rank: 1, team: "France", logo: "https://media.api-sports.io/flags/fr.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "E" },
    { rank: 2, team: "England", logo: "https://media.api-sports.io/flags/gb-eng.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "E" },
    { rank: 3, team: "Belgium", logo: "https://media.api-sports.io/flags/be.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "E" },
    { rank: 4, team: "Slovakia", logo: "https://media.api-sports.io/flags/sk.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "E" },
  ],
  "Group F": [
    { rank: 1, team: "Netherlands", logo: "https://media.api-sports.io/flags/nl.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "F" },
    { rank: 2, team: "Sweden", logo: "https://media.api-sports.io/flags/se.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "F" },
    { rank: 3, team: "Austria", logo: "https://media.api-sports.io/flags/at.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "F" },
    { rank: 4, team: "Cameroon", logo: "https://media.api-sports.io/flags/cm.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "F" },
  ],
  "Group G": [
    { rank: 1, team: "Spain", logo: "https://media.api-sports.io/flags/es.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "G" },
    { rank: 2, team: "Italy", logo: "https://media.api-sports.io/flags/it.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "G" },
    { rank: 3, team: "Denmark", logo: "https://media.api-sports.io/flags/dk.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "G" },
    { rank: 4, team: "Serbia", logo: "https://media.api-sports.io/flags/rs.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "G" },
  ],
  "Group H": [
    { rank: 1, team: "Portugal", logo: "https://media.api-sports.io/flags/pt.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "H" },
    { rank: 2, team: "Poland", logo: "https://media.api-sports.io/flags/pl.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "H" },
    { rank: 3, team: "Czech Republic", logo: "https://media.api-sports.io/flags/cz.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "H" },
    { rank: 4, team: "South Korea", logo: "https://media.api-sports.io/flags/kr.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "H" },
  ],
};

// ─── Countdown hook ───────────────────────────────────────────
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
      <div className="min-w-[52px] rounded-xl border border-[#FFD700]/25 bg-black/60 px-3 py-2 text-center shadow-[inset_0_1px_0_rgba(255,215,0,0.1)] backdrop-blur-xl">
        <span className="block text-2xl font-black tabular-nums leading-none text-white md:text-3xl">{String(v).padStart(2,"0")}</span>
      </div>
      <span className="mt-1 text-[8px] font-black uppercase tracking-[0.2em] text-[#FFD700]/55">{l}</span>
    </div>
  );
}

function FixtureRow({ fixture }: { fixture: any }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-white/6 px-3 py-3 last:border-0">
      <div className="flex min-w-0 items-center gap-2">
        <TeamLogo logo={fixture.homeLogo} initial={fixture.homeInitial} color="#182333" size="sm" />
        <span className="truncate text-sm font-semibold text-white">{fixture.home}</span>
      </div>
      <div className="text-center">
        <div className="text-[11px] font-black text-[#FFD700]">{fixture.date}</div>
        <div className="text-[9px] uppercase tracking-[0.12em] text-white/38">{fixture.time} EAT</div>
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2">
        <span className="truncate text-right text-sm font-semibold text-white">{fixture.away}</span>
        <TeamLogo logo={fixture.awayLogo} initial={fixture.awayInitial} color="#182333" size="sm" />
      </div>
    </div>
  );
}

function GroupTable({ name, rows }: { name: string; rows: TournamentStandingEntry[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-[#0b1119]/90">
      <div className="flex items-center justify-between border-b border-white/6 px-3 py-2">
        <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white">{name}</h3>
        <span className="text-[9px] font-black uppercase tracking-widest text-[#FFD700]/60">Live</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5 text-[9px] font-bold uppercase tracking-widest text-white/30">
              <th className="px-3 py-1.5 text-left">#</th>
              <th className="px-3 py-1.5 text-left">Team</th>
              <th className="px-3 py-1.5 text-center">P</th>
              <th className="px-3 py-1.5 text-center">W</th>
              <th className="px-3 py-1.5 text-center">GD</th>
              <th className="px-3 py-1.5 text-center font-black text-[#FFD700]/50">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.team} className={`border-b border-white/4 last:border-0 ${i < 2 ? "bg-[#FFD700]/4" : ""}`}>
                <td className={`px-3 py-2 font-bold ${i < 2 ? "text-[#FFD700]" : "text-white/35"}`}>{r.rank}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <img src={r.logo} alt={r.team} className="h-4 w-4 object-contain" loading="lazy" />
                    <span className="font-medium text-white">{r.team}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-center text-white/45">{r.played}</td>
                <td className="px-3 py-2 text-center text-white/45">{r.won}</td>
                <td className="px-3 py-2 text-center text-white/45">{r.gd}</td>
                <td className="px-3 py-2 text-center font-black text-[#FFD700]">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function WorldCup2026Page() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [standings, setStandings] = useState<Record<string, TournamentStandingEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const cd = useCountdown();

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchTournamentFixtures(1, 2026), fetchTournamentStandings(1, 2026)]).then(([f, s]) => {
      if (!mounted) return;
      setFixtures(f);
      setStandings(s);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const nextFixtures = useMemo(() => fixtures.slice(0, 6), [fixtures]);
  const groupEntries = useMemo(() => Object.entries(standings).slice(0, 12), [standings]);
  const hasGroups    = groupEntries.length > 0;

  return (
    <div className="min-h-screen bg-[#05070b] pb-32 text-white">
      <SEO
        title="World Cup 2026 | BallMtaani WC26 Hub — Groups, Fixtures & Fan Predictions"
        description="Track FIFA World Cup 2026 live: groups, fixtures, stadiums, African nations and fan predictions. Kenya's WC26 command center on BallMtaani."
        keywords={["World Cup 2026","FIFA WC26","WC26 groups","WC26 fixtures","World Cup Africa","BallMtaani WC26","WC26 predictions Kenya"]}
        path="/world-cup-2026"
        structuredData={{ "@context":"https://schema.org","@type":"SportsEvent","name":"FIFA World Cup 2026","sport":"Football","startDate":"2026-06-11","endDate":"2026-07-19" }}
      />

      {/* ── CINEMATIC HERO ── */}
      <section className="relative overflow-hidden border-b border-[#FFD700]/15">
        <img src="https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/World_Cup_stadium_interior_flood.jpeg" alt="" decoding="async" loading="eager"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_10%,rgba(5,7,11,0.7)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-[#05070b]/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 flex h-[3px]">
          <div className="flex-1 bg-[#3C3B6E]" /><div className="flex-1 bg-white/30" /><div className="flex-1 bg-[#B22234]" />
          <div className="flex-1 bg-[#B22234]" /><div className="flex-1 bg-white/30" /><div className="flex-1 bg-[#B22234]" />
          <div className="flex-1 bg-[#006847]" /><div className="flex-1 bg-white/30" /><div className="flex-1 bg-[#CE1126]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-14 text-center md:py-20">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-5 py-2 backdrop-blur-sm">
            {cd.live && <span className="h-2 w-2 rounded-full bg-[#FFD700] animate-pulse" />}
            <Trophy className="h-4 w-4 text-[#FFD700]" />
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FFD700]">
              {cd.live ? "World Cup 2026 — Live Now" : "FIFA World Cup 2026"}
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
            48 nations · 104 matches · {cd.live ? "Running until Jul 19 · All times EAT" : "Jun 11 – Jul 19 · All times EAT"}
          </p>

          {/* Countdown or Live badge */}
          {!cd.live && !cd.over && (
            <div className="mb-8 flex items-end justify-center gap-2 md:gap-3">
              <CDBlock v={cd.d} l="Days" />
              <span className="mb-6 text-2xl font-black text-[#FFD700]/35 md:text-3xl">:</span>
              <CDBlock v={cd.h} l="Hours" />
              <span className="mb-6 text-2xl font-black text-[#FFD700]/35 md:text-3xl">:</span>
              <CDBlock v={cd.m} l="Min" />
              <span className="mb-6 text-2xl font-black text-[#FFD700]/35 md:text-3xl">:</span>
              <CDBlock v={cd.s} l="Sec" />
            </div>
          )}

          {/* Host nations */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            {HOSTS.map(h => (
              <span key={h.name} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60 backdrop-blur-sm">
                <span className="text-base">{h.flag}</span> {h.name}
              </span>
            ))}
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/predictions"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-6 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-black shadow-[0_0_28px_rgba(255,214,0,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,214,0,0.7)] active:scale-95">
              {cd.live ? "Call the Scoreline" : "Make Your Group Stage Call"}
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/mchambuzi-halisi"
              className="inline-flex items-center gap-2 rounded-xl border border-[#FFD700]/35 bg-black/40 px-6 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-[#FFD700] backdrop-blur-sm transition-all hover:border-[#FFD700]/70 hover:bg-[#FFD700]/10 active:scale-95">
              <Sparkles className="h-4 w-4" /> Ask Mchambuzi
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-b border-white/6 bg-[#07090e]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-white/6 md:grid-cols-4">
          {[
            { icon: Users, v: "48", l: "Nations" },
            { icon: Shield, v: "12", l: "Groups" },
            { icon: MapPin, v: "16", l: "Stadiums" },
            { icon: CalendarDays, v: "104", l: "Matches" },
          ].map(({ icon: Icon, v, l }) => (
            <div key={l} className="flex flex-col items-center gap-1 py-5">
              <Icon className="mb-1 h-4 w-4 text-[#FFD700]/60" />
              <span className="text-2xl font-black text-white">{v}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">{l}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white">WC26 Knowledge Base</h2>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/34">
                Format, stadiums, Africa watch and squad logic
              </p>
            </div>
            <Link href="/world-cup-2026/format" className="hidden rounded-full border border-[#FFD700]/20 bg-[#FFD700]/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFD700] sm:inline-flex">
              Start with format
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WC26_GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/world-cup-2026/${guide.slug}`}
                className="group rounded-2xl border border-white/8 bg-[#090d14] p-4 transition-all hover:-translate-y-0.5 hover:border-[#FFD700]/28 hover:bg-[#101622]"
              >
                <div className="mb-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#FFD700]/52">{guide.eyebrow}</div>
                <h3 className="text-sm font-black uppercase leading-snug tracking-[0.08em] text-white">{guide.title}</h3>
                <p className="mt-3 line-clamp-3 text-xs leading-6 text-white/48">{guide.deck}</p>
                <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-white/34">
                  Read guide
                  <ChevronRight className="h-3.5 w-3.5 text-[#FFD700] transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── FIXTURES + TIMELINE ── */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Next fixtures */}
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
              <div className="space-y-2">
                {WC26_OPENING_FIXTURES.map((f, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 px-4 py-3 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black uppercase tracking-widest text-white">{f.home} vs {f.away}</div>
                      <div className="text-[10px] text-white/30 mt-0.5">{f.date} · {f.time} EAT</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tournament roadmap */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#080d14]/90">
            <div className="border-b border-white/6 px-4 py-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Tournament Roadmap</h2>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">Jun 11 – Jul 19, 2026</p>
            </div>
            <div className="divide-y divide-white/5">
              {TIMELINE.map((item, i) => (
                <div key={item.label} className={`flex items-start gap-3 px-4 py-3 ${i === TIMELINE.length - 1 ? "bg-[#FFD700]/5" : ""}`}>
                  <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${i === TIMELINE.length - 1 ? "bg-[#FFD700]" : "bg-white/20"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-xs font-black uppercase ${i === TIMELINE.length - 1 ? "text-[#FFD700]" : "text-white"}`}>{item.label}</span>
                      <span className="text-[9px] font-bold text-white/35">{item.date}</span>
                    </div>
                    <p className="text-[11px] text-white/40">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AFRICAN NATIONS AT WC26 ── */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-[#006600]/28 bg-[#040a04]/95">
          <div className="flex items-center gap-3 border-b border-[#006600]/18 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#006600]/15 text-lg">🌍</div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Africa at WC26</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#22c55e]/60">{CAF_SPOTS} CAF spots · Most African nations ever</p>
            </div>
            <Link href="/predictions" className="ml-auto inline-flex items-center gap-1 rounded-lg border border-[#22c55e]/25 bg-[#22c55e]/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#22c55e] transition-all hover:bg-[#22c55e]/16">
              Back a team <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-0 divide-x divide-y divide-[#006600]/10 sm:grid-cols-5 lg:grid-cols-9">
            {CAF_NATIONS.map(n => (
              <div key={n.name} className="flex flex-col items-center gap-1 px-3 py-4 text-center transition-colors hover:bg-[#006600]/8">
                <span className="text-2xl">{n.flag}</span>
                <span className="text-[10px] font-black text-white/70">{n.name}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#006600]/10 px-4 py-3">
            <p className="text-[10px] text-white/28">
              No Kenya at WC26 — but Harambee Stars are building. Back an African team and keep the receipt when they go deep.
            </p>
          </div>
        </section>

        {/* ── TEAM EXPLORER ── */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-black uppercase tracking-widest text-white">Explore Teams</h2>
            <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">
              Search by name · View fixtures · Check squads and stadiums
            </p>
          </div>
          <WC26TeamExplorer />
        </section>

        {/* ── GROUP STAGE ── */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white">Group Stage</h2>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">
                {hasGroups ? "Live standings · Top 2 advance" : "Kicks off June 11 · Tables update in real time"}
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
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(WC26_GROUPS).map(([name, rows]) => (
                  <GroupTable key={name} name={name} rows={rows} />
                ))}
              </div>
              <p className="text-center text-[10px] text-white/30">Live standings update as the tournament progresses · Tap to make group stage predictions</p>
            </div>
          )}
        </section>

        {/* ── HOST NATIONS ── */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-black uppercase tracking-widest text-white">3 Host Nations · 16 Stadiums</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {HOSTS.map(h => (
              <div key={h.name} className="overflow-hidden rounded-2xl border border-white/8 bg-[#0d0f14]/90">
                <div className="border-b border-white/6 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{h.flag}</span>
                    <div>
                      <div className="text-sm font-black text-white">{h.name}</div>
                      <div className="text-[10px] text-white/35">{h.stadiums} stadium{h.stadiums > 1 ? "s" : ""}</div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 text-[11px] text-white/40 leading-relaxed">{h.cities}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAN COMMAND CENTER ── */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-white/8 bg-[#080d14]/90">
          <div className="border-b border-white/6 px-4 py-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Your WC26 Command Center</h2>
            <p className="text-[10px] text-white/30">Everything a Kenyan fan needs — live, on BallMtaani.</p>
          </div>
          <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-white/6 lg:grid-cols-4">
            {[
              { href: "/predictions", color: "text-[#B30000]", border: "hover:bg-[#B30000]/6", icon: Zap, label: "Call the Score", sub: "Pick every group match. Earn MTC." },
              { href: "/mchambuzi-halisi", color: "text-[#FFD700]", border: "hover:bg-[#FFD700]/5", icon: Sparkles, label: "Ask Mchambuzi", sub: "WC26 AI analysis. Fan-first tone." },
              { href: "/live-center", color: "text-blue-400", border: "hover:bg-blue-500/6", icon: Trophy, label: "Live Center", sub: "Stats, events, lineups as they happen." },
              { href: "/debates", color: "text-purple-400", border: "hover:bg-purple-500/6", icon: Users, label: "Debates Room", sub: "Group of death takes. Banter receipts." },
            ].map(({ href, color, border, icon: Icon, label, sub }) => (
              <Link key={href} href={href} className={`flex flex-col p-4 transition-all ${border}`}>
                <Icon className={`mb-2 h-5 w-5 ${color}`} />
                <div className={`mb-1 text-xs font-black uppercase ${color}`}>{label}</div>
                <p className="text-[11px] text-white/35">{sub}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── PREDICTION CTA ── */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-[#FFD700]/25 bg-gradient-to-br from-[#1a1200] to-[#07090e]">
          <div className="px-6 py-8 text-center md:px-10">
            <Trophy className="mx-auto mb-4 h-10 w-10 text-[#FFD700]" />
            <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
              Call the WC26 Winner
            </h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-white/50">
              Pick your champion before the group stage starts. Every correct call earns MTC status. The receipt doesn't lie.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/predictions"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-8 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_30px_rgba(255,214,0,0.4)] transition-all hover:shadow-[0_0_45px_rgba(255,214,0,0.6)] active:scale-95">
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
          <div>Data: API-Football · Tournament structure: FIFA WC2026</div>
        </footer>
      </div>
    </div>
  );
}
