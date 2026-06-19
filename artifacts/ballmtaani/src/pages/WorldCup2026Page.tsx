import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { CalendarDays, ChevronRight, MapPin, MessageCircle, Shield, Sparkles, Trophy, Users, Zap, Flame, Clock, Star } from "lucide-react";
import SEO from "../components/SEO";
import WC26TeamExplorer from "../components/WC26TeamExplorer";
import OddspediaWidgetSlot from "../components/OddspediaWidgetSlot";
import {
  fetchTournamentFixtures,
  fetchTournamentStandings,
  fetchWC26TopScorers,
  type TournamentStandingEntry,
} from "../lib/football-api";
import { WC26_GUIDES } from "../data/wc26-guides";
import { WC26_STADIUMS, WC26_TEAMS, type WC26TeamData } from "../data/wc26-teams";
import { supabase } from "../lib/supabase";

const REACTION_EMOJIS = ["🔥", "❤️", "😱", "🤣"] as const;

// --- Static data ---
const WC26_START = new Date("2026-06-11T17:00:00Z");
const WC26_END   = new Date("2026-07-20T00:00:00Z");

const ODDSPEDIA_WC26_STANDINGS = {
  widgetKey: "wc26-standings",
  title: "Verified WC26 Standings",
  description: "Live World Cup 2026 group tables from the Oddspedia standings widget. BallMtaani keeps API-Football's unverified WC26 table payload hidden.",
  preferredWidget: "Oddspedia standings",
  selector: "oddspedia-widget-standings-league-id-3",
  globalName: "oddspediaWidgetStandingsLeagueId3",
  widgetId: "oddspediaWidgetStandingsLeagueId3",
  config: {
    api_token: "351d6b26a32409cc0db279adb48300f55efdb08627bdd3a653c84cedd297",
    type: "standings",
    domain: "ballmtaani.com",
    selector: "oddspedia-widget-standings-league-id-3",
    width: "350px",
    theme: "1",
    language: "en",
    primary_color: "#0369C7",
    accent_color: "#000000",
    font: "Roboto",
    league_id: "3",
    visible_results: "4",
  },
};

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

// Derive static group tables from WC26_TEAMS. WC26_TEAMS is the single source
// of truth for squad data — build the zero-stat fallback from it so we don't
// maintain a separate (and inevitably stale) duplicate list.
// Only the first 4 entries per group letter are taken because the data file has
// some overflow entries from an incomplete edit (extra teams appended to G & H).
const WC26_GROUPS: Record<string, TournamentStandingEntry[]> = (() => {
  const acc: Record<string, WC26TeamData[]> = {};
  for (const t of WC26_TEAMS) {
    const key = `Group ${t.group.toUpperCase()}`;
    if (!acc[key]) acc[key] = [];
    if (acc[key].length < 4) acc[key].push(t);
  }
  const result: Record<string, TournamentStandingEntry[]> = {};
  for (const [groupName, teams] of Object.entries(acc).sort(([a], [b]) => a.localeCompare(b))) {
    result[groupName] = teams.map((t, i) => ({
      rank: i + 1, team: t.name, logo: t.logo,
      points: 0, played: 0, won: 0, draw: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, gd: "0", form: [],
      group: t.group,
    }));
  }
  return result;
})();

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
              <th className="px-2 py-1.5 text-left">#</th>
              <th className="px-2 py-1.5 text-left">Team</th>
              <th className="px-2 py-1.5 text-center">P</th>
              <th className="px-2 py-1.5 text-center">W</th>
              <th className="px-2 py-1.5 text-center">D</th>
              <th className="px-2 py-1.5 text-center">L</th>
              <th className="px-2 py-1.5 text-center">GD</th>
              <th className="px-2 py-1.5 text-center font-black text-[#FFD700]/40">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const gd = Number(r.gd);
              return (
              <tr key={r.team} className={`border-b border-white/4 last:border-0 transition-colors hover:bg-white/3 ${i < 2 ? "bg-[#FFD700]/3" : ""}`}>
                <td className="pl-2 pr-1 py-2">
                  <span className={`text-[11px] font-bold ${i < 2 ? "text-[#FFD700]" : "text-white/30"}`}>{r.rank}</span>
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1.5">
                    <img src={r.logo} alt="" aria-hidden="true" className="h-4 w-4 object-contain" loading="lazy" />
                    <span className={`font-semibold text-[11px] ${i < 2 ? "text-white" : "text-white/75"}`}>{r.team}</span>
                  </div>
                </td>
                <td className="px-2 py-2 text-center text-white/38">{r.played}</td>
                <td className="px-2 py-2 text-center text-white/38">{r.won}</td>
                <td className="px-2 py-2 text-center text-white/38">{r.draw}</td>
                <td className="px-2 py-2 text-center text-white/38">{r.lost}</td>
                <td className={`px-2 py-2 text-center text-[11px] font-semibold ${gd > 0 ? "text-emerald-400/75" : gd < 0 ? "text-red-400/65" : "text-white/38"}`}>
                  {gd > 0 ? `+${gd}` : gd}
                </td>
                <td className={`px-2 py-2 text-center font-black ${i < 2 ? "text-[#FFD700]" : "text-white/80"}`}>{r.points}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Page ---
// Round label → short tab name
const ROUND_TABS: Record<string, string> = {
  "Group Stage - Matchday 1": "MD 1",
  "Group Stage - Matchday 2": "MD 2",
  "Group Stage - Matchday 3": "MD 3",
  "Round of 32":   "R32",
  "Round of 16":   "R16",
  "Quarter-finals":"QF",
  "Semi-finals":   "SF",
  "3rd Place Final":"3rd",
  "Final":         "Final",
};
const ROUND_ORDER = Object.keys(ROUND_TABS);

function shortRound(round: string): string {
  return ROUND_TABS[round] ?? round.replace("Group Stage - ", "").slice(0, 8);
}

const LIVE_STATUSES = new Set(["1H","2H","HT","ET","P","BT","LIVE"]);
const DONE_STATUSES = new Set(["FT","AET","PEN"]);

export default function WorldCup2026Page() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [standings, setStandings] = useState<Record<string, TournamentStandingEntry[]>>(WC26_GROUPS);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [standingsSyncedAt, setStandingsSyncedAt] = useState<string | null>(null);
  const [scheduleTab, setScheduleTab] = useState("Group Stage - Matchday 1");
  const [aiInsights, setAiInsights] = useState<Record<string, { text: string; loading: boolean }>>({});
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [myReactions, setMyReactions] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem("bm_reactions") || "{}"); } catch { return {}; }
  });
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [myRatings, setMyRatings] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem("bm_ratings") || "{}"); } catch { return {}; }
  });
  const fingerprint = useMemo(() => {
    let fp = localStorage.getItem("bm_fp");
    if (!fp) { fp = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("bm_fp", fp); }
    return fp;
  }, []);
  const cd = useCountdown();

  // Must be declared before the useEffects that reference it in their dep arrays
  const fixturesByRound = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const f of fixtures) {
      if (!map[f.round]) map[f.round] = [];
      map[f.round].push(f);
    }
    return map;
  }, [fixtures]);

  // Load reaction counts for fixtures visible in the current schedule tab
  useEffect(() => {
    if (!supabase) return;
    const keys = (fixturesByRound[scheduleTab] ?? []).map((f: any) => `wc26_${f.id}`);
    if (!keys.length) return;
    void Promise.resolve(
      supabase.from("match_reactions").select("match_key, emoji")
        .in("match_key", keys)
        .then(({ data }) => {
          if (!data) return;
          const counts: Record<string, Record<string, number>> = {};
          for (const row of data) {
            if (!counts[row.match_key]) counts[row.match_key] = {};
            counts[row.match_key][row.emoji] = (counts[row.match_key][row.emoji] || 0) + 1;
          }
          setReactions(prev => ({ ...prev, ...counts }));
        })
    ).catch(() => {});
  }, [scheduleTab, fixturesByRound]);

  const react = (matchKey: string, emoji: string) => {
    const current = myReactions[matchKey];
    if (current === emoji) return;
    const updated = { ...myReactions, [matchKey]: emoji };
    setMyReactions(updated);
    localStorage.setItem("bm_reactions", JSON.stringify(updated));
    setReactions(prev => {
      const slot = { ...(prev[matchKey] ?? {}) };
      if (current) slot[current] = Math.max(0, (slot[current] || 0) - 1);
      slot[emoji] = (slot[emoji] || 0) + 1;
      return { ...prev, [matchKey]: slot };
    });
    if (!supabase) return;
    void Promise.resolve(
      supabase.from("match_reactions")
        .upsert({ match_key: matchKey, emoji, fingerprint }, { onConflict: "match_key,fingerprint" })
        .then()
    ).catch(() => {});
  };

  // Load match ratings for completed fixtures in the current schedule tab
  useEffect(() => {
    if (!supabase) return;
    const keys = (fixturesByRound[scheduleTab] ?? [])
      .filter((f: any) => DONE_STATUSES.has(f.status))
      .map((f: any) => `wc26_${f.id}`);
    if (!keys.length) return;
    void Promise.resolve(
      supabase.from("match_ratings").select("match_key, rating")
        .in("match_key", keys)
        .then(({ data }) => {
          if (!data) return;
          const agg: Record<string, { sum: number; count: number }> = {};
          for (const row of data) {
            if (!agg[row.match_key]) agg[row.match_key] = { sum: 0, count: 0 };
            agg[row.match_key].sum += row.rating;
            agg[row.match_key].count += 1;
          }
          setRatings(prev => {
            const next = { ...prev };
            for (const [k, v] of Object.entries(agg)) {
              next[k] = { avg: v.sum / v.count, count: v.count };
            }
            return next;
          });
        })
    ).catch(() => {});
  }, [scheduleTab, fixturesByRound]);

  const rate = (matchKey: string, stars: number) => {
    const updated = { ...myRatings, [matchKey]: stars };
    setMyRatings(updated);
    localStorage.setItem("bm_ratings", JSON.stringify(updated));
    setRatings(prev => {
      const old = prev[matchKey];
      const prevMine = myRatings[matchKey];
      if (old) {
        const oldSum = old.avg * old.count;
        const newSum = prevMine ? oldSum - prevMine + stars : oldSum + stars;
        const newCount = prevMine ? old.count : old.count + 1;
        return { ...prev, [matchKey]: { avg: newSum / newCount, count: newCount } };
      }
      return { ...prev, [matchKey]: { avg: stars, count: 1 } };
    });
    if (!supabase) return;
    void Promise.resolve(
      supabase.from("match_ratings")
        .upsert({ match_key: matchKey, rating: stars, fingerprint }, { onConflict: "match_key,fingerprint" })
        .then()
    ).catch(() => {});
  };

  const calendarLink = (f: { home: string; away: string; timestamp?: number; venue?: string; city?: string }) => {
    const start = f.timestamp ? new Date(f.timestamp) : new Date();
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const loc = [f.venue, f.city].filter(Boolean).join(", ");
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `WC26: ${f.home} vs ${f.away}`,
      dates: `${fmt(start)}/${fmt(end)}`,
      details: `Watch on BallMtaani → https://ballmtaani.com/world-cup-2026`,
      location: loc || "World Cup 2026",
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  };

  const waShare = (home: string, away: string, date?: string, time?: string, venue?: string) => {
    const lines = [
      `⚽ WC26: ${home} vs ${away}`,
      date || time ? `📅 ${[date, time ? `${time} EAT` : ""].filter(Boolean).join(" · ")}` : null,
      venue ? `🏟️ ${venue}` : null,
      ``,
      `Watch with your people 👇`,
      `https://ballmtaani.com/world-cup-2026`,
    ].filter(l => l !== null).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
  };

  const askAI = async (key: string, home: string, away: string, group?: string) => {
    if (aiInsights[key]?.text || aiInsights[key]?.loading) return;
    setAiInsights(prev => ({ ...prev, [key]: { text: "", loading: true } }));
    try {
      const q = `WC26 match preview in 2 lines: ${home} vs ${away}${group ? ` (Group ${group})` : ""}. Who has the edge and why?`;
      const res = await fetch("/api/mchambuzi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = res.ok ? await res.json() : null;
      const text = data?.answer ?? "Mchambuzi ni busy — try again.";
      setAiInsights(prev => ({ ...prev, [key]: { text, loading: false } }));
    } catch {
      setAiInsights(prev => ({ ...prev, [key]: { text: "Mchambuzi ni busy — try again.", loading: false } }));
    }
  };

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      fetchTournamentFixtures(1, 2026),
      fetchTournamentStandings(1, 2026),
      fetchWC26TopScorers(),
    ]).then(([fixturesRes, standingsRes, scorersRes]) => {
      if (!mounted) return;
      if (fixturesRes.status === "fulfilled" && fixturesRes.value.length > 0) {
        setFixtures(fixturesRes.value);
        // Auto-select the first round that has live or upcoming matches
        const liveRound = fixturesRes.value.find((f: any) => LIVE_STATUSES.has(f.status))?.round;
        const nextRound = fixturesRes.value.find((f: any) => !DONE_STATUSES.has(f.status))?.round;
        if (liveRound) setScheduleTab(liveRound);
        else if (nextRound) setScheduleTab(nextRound);
      }
      if (standingsRes.status === "fulfilled" && Object.keys(standingsRes.value).length > 0) {
        setStandings(standingsRes.value);
        setStandingsSyncedAt(new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" }));
      }
      if (scorersRes.status === "fulfilled") setTopScorers(scorersRes.value);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  // Derived fixture slices
  const liveFixtures   = useMemo(() => fixtures.filter(f => LIVE_STATUSES.has(f.status)), [fixtures]);
  const todayFixtures  = useMemo(() => {
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return fixtures.filter(f => f.date === today);
  }, [fixtures]);
  const completedCount = useMemo(() => fixtures.filter(f => DONE_STATUSES.has(f.status)).length, [fixtures]);

  const roundTabs = useMemo(() => {
    const keys = Object.keys(fixturesByRound);
    // Sort by canonical order, unknown rounds go last
    return keys.sort((a, b) => {
      const ai = ROUND_ORDER.indexOf(a), bi = ROUND_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [fixturesByRound]);

  // Tournament pulse stats (computed from completed fixtures)
  const pulse = useMemo(() => {
    const done = fixtures.filter(f => DONE_STATUSES.has(f.status));
    const totalGoals = done.reduce((s, f) => s + (f.homeScore ?? 0) + (f.awayScore ?? 0), 0);
    const cleanSheets = done.filter(f => f.homeScore === 0 || f.awayScore === 0).length;
    let biggestWin = { home: "", away: "", diff: 0, score: "" };
    for (const f of done) {
      const diff = Math.abs((f.homeScore ?? 0) - (f.awayScore ?? 0));
      if (diff > biggestWin.diff) biggestWin = { home: f.home, away: f.away, diff, score: `${f.homeScore}–${f.awayScore}` };
    }
    return {
      played: done.length,
      totalGoals,
      goalsPerGame: done.length ? (totalGoals / done.length).toFixed(2) : "–",
      cleanSheets,
      biggestWin,
    };
  }, [fixtures]);

  const groupEntries = useMemo(() => Object.entries(standings), [standings]);

  // Map each CAF nation to its live standing entry (if standings are available)
  const cafLiveData = useMemo(() => {
    const map: Record<string, TournamentStandingEntry | null> = {};
    for (const nation of CAF_NATIONS) {
      const groupKey = `Group ${nation.group}`;
      const rows = standings[groupKey] ?? [];
      map[nation.name] = rows.find(r => r.team.toLowerCase() === nation.name.toLowerCase()) ?? null;
    }
    return map;
  }, [standings]);

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

        {/* -- TODAY / LIVE -- */}
        {(liveFixtures.length > 0 || todayFixtures.length > 0) && (
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              {liveFixtures.length > 0 && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                {liveFixtures.length > 0 ? "Live Now" : "Today at WC26"}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(liveFixtures.length > 0 ? liveFixtures : todayFixtures).map(f => {
                const isLive = LIVE_STATUSES.has(f.status);
                const isDone = DONE_STATUSES.has(f.status);
                return (
                  <div key={f.id} className={`rounded-2xl border p-4 ${isLive ? "border-red-500/35 bg-red-950/20" : "border-white/8 bg-[#0b0f18]"}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{f.round?.replace("Group Stage - ","")}</span>
                      {isLive ? (
                        <span className="flex items-center gap-1 rounded-full bg-red-600/20 px-2 py-0.5 text-[9px] font-black text-red-400 uppercase tracking-widest">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />{f.minute ? `${f.minute}'` : "Live"}
                        </span>
                      ) : isDone ? (
                        <span className="text-[9px] font-black text-white/25 uppercase tracking-widest">FT</span>
                      ) : (
                        <span className="text-[9px] font-bold text-[#FFD700]/60">{f.time} EAT</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {f.homeLogo && <img src={f.homeLogo} alt="" className="h-7 w-7 shrink-0 object-contain" loading="lazy" />}
                        <span className="truncate text-sm font-black text-white">{f.home}</span>
                      </div>
                      <div className="shrink-0 text-center">
                        {(isLive || isDone) && f.homeScore !== null ? (
                          <span className={`text-xl font-black tabular-nums ${isLive ? "text-red-400" : "text-white"}`}>
                            {f.homeScore} – {f.awayScore}
                          </span>
                        ) : (
                          <span className="text-sm font-black text-white/20">vs</span>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                        <span className="truncate text-right text-sm font-black text-white">{f.away}</span>
                        {f.awayLogo && <img src={f.awayLogo} alt="" className="h-7 w-7 shrink-0 object-contain" loading="lazy" />}
                      </div>
                    </div>
                    <div className="mt-2 text-[9px] text-white/25">{f.venue}{f.city ? `, ${f.city}` : ""}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* -- TOURNAMENT PULSE -- */}
        {pulse.played > 0 && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-[#FFD700]/18 bg-[#09090e]">
            <div className="border-b border-[#FFD700]/10 px-5 py-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Tournament Pulse</h2>
              <p className="text-[9px] text-white/30 font-semibold uppercase tracking-widest">Live stats from {pulse.played} matches played</p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-white/5 md:grid-cols-4">
              {[
                { label: "Total Goals",    value: String(pulse.totalGoals),       sub: `${completedCount} of ${fixtures.length} matches done` },
                { label: "Goals / Game",   value: pulse.goalsPerGame,             sub: "Average this tournament" },
                { label: "Clean Sheets",   value: String(pulse.cleanSheets),      sub: "Zero goals conceded" },
                { label: "Biggest Win",    value: pulse.biggestWin.score || "–",  sub: pulse.biggestWin.diff > 0 ? `${pulse.biggestWin.home} v ${pulse.biggestWin.away}` : "No data yet" },
              ].map(stat => (
                <div key={stat.label} className="px-5 py-4">
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/30">{stat.label}</div>
                  <div className="mt-1 text-2xl font-black text-[#FFD700]">{stat.value}</div>
                  <div className="mt-0.5 text-[9px] text-white/25 leading-tight">{stat.sub}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* -- GROUP STAGE -- */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white">Group Stage</h2>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">
                {standingsSyncedAt
                  ? `Source: API-Football — synced ${standingsSyncedAt} EAT`
                  : loading
                    ? "Fetching live standings…"
                    : "Static draw — live standings pending"}
              </p>
            </div>
            </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupEntries.map(([name, rows]) => <GroupTable key={name} name={name} rows={rows} />)}
          </div>
        </section>

        {/* -- FULL SCHEDULE -- */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white">Full Schedule</h2>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">
                {fixtures.length > 0 ? `${fixtures.length} matches · Jun 11 – Jul 19` : "Group Stage · Jun 11 – Jun 22"}
              </p>
            </div>
          </div>

          {/* Round tabs */}
          <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(roundTabs.length > 0 ? roundTabs : ROUND_ORDER.slice(0, 3)).map(round => (
              <button
                key={round}
                onClick={() => setScheduleTab(round)}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  scheduleTab === round
                    ? "bg-[#FFD700] text-black shadow-[0_0_12px_rgba(255,215,0,0.35)]"
                    : "border border-white/10 bg-white/4 text-white/50 hover:bg-white/8"
                }`}
              >
                {shortRound(round)}
              </button>
            ))}
          </div>

          {/* Match grid */}
          {fixtures.length === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {WC26_OPENING_FIXTURES.map((f, i) => {
                const key = `static-${i}`;
                const insight = aiInsights[key];
                return (
                  <div key={i} className="rounded-xl border border-white/8 bg-[#0b0f18] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex-1 truncate text-xs font-bold text-white">{f.home}</span>
                      <div className="shrink-0 text-center">
                        <div className="text-[10px] font-black text-[#FFD700]/70">{f.date}</div>
                        <div className="text-[9px] text-white/30">{f.time} EAT</div>
                      </div>
                      <span className="flex-1 truncate text-right text-xs font-bold text-white">{f.away}</span>
                    </div>
                    {insight?.text ? (
                      <>
                        <div className="mt-2 rounded-lg border border-[#FFD700]/15 bg-[#FFD700]/5 px-3 py-2">
                          <div className="mb-1 flex items-center gap-1.5">
                            <Zap className="h-2.5 w-2.5 shrink-0 text-[#FFD700]" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#FFD700]/60">Mchambuzi AI</span>
                          </div>
                          <p className="text-[10px] leading-relaxed text-white/70">{insight.text}</p>
                        </div>
                        <button
                          onClick={() => waShare(f.home, f.away, f.date, f.time)}
                          className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#25D366]/20 bg-[#25D366]/6 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#25D366]/70 transition-all hover:bg-[#25D366]/14 hover:text-[#25D366]"
                        >
                          <MessageCircle className="h-2.5 w-2.5" />Share on WhatsApp
                        </button>
                      </>
                    ) : (
                      <div className="mt-2 flex gap-1.5">
                        <button
                          onClick={() => askAI(key, f.home, f.away)}
                          disabled={insight?.loading}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#FFD700]/20 bg-[#FFD700]/6 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#FFD700]/70 transition-all hover:bg-[#FFD700]/12 hover:text-[#FFD700] disabled:opacity-50"
                        >
                          {insight?.loading ? (
                            <><span className="h-2 w-2 animate-spin rounded-full border border-[#FFD700]/50 border-t-[#FFD700]" />Analysing...</>
                          ) : (
                            <><Zap className="h-2.5 w-2.5" />AI Pick</>
                          )}
                        </button>
                        <button
                          onClick={() => waShare(f.home, f.away, f.date, f.time)}
                          className="flex shrink-0 items-center justify-center rounded-lg border border-[#25D366]/20 bg-[#25D366]/6 px-2.5 py-1.5 text-[#25D366]/70 transition-all hover:bg-[#25D366]/14 hover:text-[#25D366]"
                          title="Share on WhatsApp"
                        >
                          <MessageCircle className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {/* Reactions */}
                    <div className="mt-2 flex items-center gap-1 border-t border-white/5 pt-2">
                      {REACTION_EMOJIS.map(e => {
                        const count = reactions[key]?.[e] ?? 0;
                        const mine = myReactions[key] === e;
                        return (
                          <button
                            key={e}
                            onClick={() => react(key, e)}
                            className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] transition-all ${mine ? "bg-white/15 ring-1 ring-white/20 scale-110" : "bg-white/4 hover:bg-white/10"}`}
                          >
                            {e}{count > 0 && <span className="text-[8px] font-bold text-white/45 tabular-nums ml-0.5">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (fixturesByRound[scheduleTab] ?? []).length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-[#0b0f18] px-5 py-10 text-center text-xs text-white/30">
              No matches scheduled for this round yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(fixturesByRound[scheduleTab] ?? []).map((f: any) => {
                const isLive = LIVE_STATUSES.has(f.status);
                const isDone = DONE_STATUSES.has(f.status);
                const key = String(f.id);
                const insight = aiInsights[key];
                return (
                  <div
                    key={f.id}
                    className={`rounded-xl border px-4 py-3 transition-colors ${
                      isLive ? "border-red-500/30 bg-red-950/15" : "border-white/8 bg-[#0b0f18] hover:bg-white/2"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Home */}
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {f.homeLogo && <img src={f.homeLogo} alt="" className="h-6 w-6 shrink-0 object-contain" loading="lazy" />}
                        <span className="truncate text-xs font-bold text-white">{f.home}</span>
                      </div>
                      {/* Score or kickoff */}
                      <div className="shrink-0 px-2 text-center">
                        {(isLive || isDone) && f.homeScore !== null ? (
                          <div className={`text-sm font-black tabular-nums ${isLive ? "text-red-400" : "text-white"}`}>
                            {f.homeScore}–{f.awayScore}
                            {isLive && f.minute ? <span className="ml-0.5 text-[9px] text-red-400/70">{f.minute}'</span> : null}
                          </div>
                        ) : (
                          <button
                            onClick={() => window.open(calendarLink(f), "_blank")}
                            title="Add to Google Calendar"
                            className="group flex flex-col items-center gap-0.5"
                          >
                            <div className="text-[10px] font-black text-[#FFD700]/70 group-hover:text-[#FFD700] transition-colors">{f.date}</div>
                            <div className="text-[9px] text-white/30">{f.time}</div>
                            <CalendarDays className="h-2.5 w-2.5 text-white/15 group-hover:text-[#FFD700]/60 transition-colors mt-0.5" />
                          </button>
                        )}
                      </div>
                      {/* Away */}
                      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                        <span className="truncate text-right text-xs font-bold text-white">{f.away}</span>
                        {f.awayLogo && <img src={f.awayLogo} alt="" className="h-6 w-6 shrink-0 object-contain" loading="lazy" />}
                      </div>
                    </div>
                    {f.venue && (
                      <div className="mt-1.5 flex items-center gap-1 text-[9px] text-white/20">
                        <MapPin className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{f.venue}</span>
                      </div>
                    )}
                    {insight?.text ? (
                      <>
                        <div className="mt-2 rounded-lg border border-[#FFD700]/15 bg-[#FFD700]/5 px-3 py-2">
                          <div className="mb-1 flex items-center gap-1.5">
                            <Zap className="h-2.5 w-2.5 shrink-0 text-[#FFD700]" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#FFD700]/60">Mchambuzi AI</span>
                          </div>
                          <p className="text-[10px] leading-relaxed text-white/70">{insight.text}</p>
                        </div>
                        <button
                          onClick={() => waShare(f.home, f.away, f.date, f.time, f.venue)}
                          className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#25D366]/20 bg-[#25D366]/6 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#25D366]/70 transition-all hover:bg-[#25D366]/14 hover:text-[#25D366]"
                        >
                          <MessageCircle className="h-2.5 w-2.5" />Share on WhatsApp
                        </button>
                      </>
                    ) : (
                      <div className="mt-2 flex gap-1.5">
                        <button
                          onClick={() => askAI(key, f.home, f.away, f.group)}
                          disabled={insight?.loading}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#FFD700]/20 bg-[#FFD700]/6 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#FFD700]/70 transition-all hover:bg-[#FFD700]/12 hover:text-[#FFD700] disabled:opacity-50"
                        >
                          {insight?.loading ? (
                            <><span className="h-2 w-2 animate-spin rounded-full border border-[#FFD700]/50 border-t-[#FFD700]" />Analysing...</>
                          ) : (
                            <><Zap className="h-2.5 w-2.5" />AI Pick</>
                          )}
                        </button>
                        <button
                          onClick={() => waShare(f.home, f.away, f.date, f.time, f.venue)}
                          className="flex shrink-0 items-center justify-center rounded-lg border border-[#25D366]/20 bg-[#25D366]/6 px-2.5 py-1.5 text-[#25D366]/70 transition-all hover:bg-[#25D366]/14 hover:text-[#25D366]"
                          title="Share on WhatsApp"
                        >
                          <MessageCircle className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {/* Reactions (upcoming/live) OR Star rating (completed) */}
                    <div className="mt-2 border-t border-white/5 pt-2">
                      {isDone ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(star => (
                              <button
                                key={star}
                                onClick={() => rate(key, star)}
                                className="p-0.5 transition-transform hover:scale-125 active:scale-110"
                                title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                              >
                                <svg className="h-4 w-4" viewBox="0 0 20 20">
                                  <path
                                    fill={star <= (myRatings[key] ?? 0) ? "#FFD700" : "rgba(255,255,255,0.12)"}
                                    d="M10 1l2.39 4.84 5.34.78-3.86 3.76.91 5.32L10 13.27l-4.78 2.51.91-5.32L2.27 6.62l5.34-.78z"
                                  />
                                </svg>
                              </button>
                            ))}
                          </div>
                          {ratings[key] ? (
                            <span className="text-[9px] font-bold text-white/35 tabular-nums">
                              ★ {ratings[key].avg.toFixed(1)} · {ratings[key].count.toLocaleString()} ratings
                            </span>
                          ) : (
                            <span className="text-[9px] text-white/20">Rate this match</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {REACTION_EMOJIS.map(e => {
                            const count = reactions[key]?.[e] ?? 0;
                            const mine = myReactions[key] === e;
                            return (
                              <button
                                key={e}
                                onClick={() => react(key, e)}
                                className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] transition-all ${mine ? "bg-white/15 ring-1 ring-white/20 scale-110" : "bg-white/4 hover:bg-white/10"}`}
                              >
                                {e}{count > 0 && <span className="text-[8px] font-bold text-white/45 tabular-nums ml-0.5">{count}</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tournament roadmap strip */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/6 bg-[#080d14]">
            <div className="flex overflow-x-auto scrollbar-none">
              {TIMELINE.map((item, i) => (
                <div key={item.label} className={`shrink-0 border-r border-white/5 px-5 py-3 last:border-0 ${i === TIMELINE.length - 1 ? "bg-[#FFD700]/5" : ""}`}>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${i === TIMELINE.length - 1 ? "text-[#FFD700]" : "text-white"}`}>{item.label}</div>
                  <div className="text-[9px] text-[#FFD700]/50 mt-0.5">{item.date}</div>
                  <div className="text-[9px] text-white/28 mt-0.5">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- GOLDEN BOOT -- */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-[#FFD700]" />
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white">Golden Boot Race</h2>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">
                {topScorers.length > 0 ? "Top scorers — API-Football live" : "Top scorers — standings update as matches complete"}
              </p>
            </div>
          </div>
          {topScorers.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0b0f18]">
              {topScorers.map((s, i) => (
                <div key={s.name} className={`flex items-center gap-4 px-4 py-3 border-b border-white/4 last:border-0 transition-colors hover:bg-white/3 ${i === 0 ? "bg-[#FFD700]/4" : ""}`}>
                  <span className={`w-5 shrink-0 text-center text-xs font-black ${i === 0 ? "text-[#FFD700]" : "text-white/25"}`}>{i + 1}</span>
                  {s.photo ? (
                    <img src={s.photo} alt={s.name} className="h-9 w-9 shrink-0 rounded-full object-cover bg-white/5" loading="lazy" />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/8 text-[10px] font-black text-white/40">
                      {s.name.slice(0,2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-white">{s.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {s.teamLogo && <img src={s.teamLogo} alt="" className="h-3.5 w-3.5 object-contain" loading="lazy" />}
                      <span className="text-[10px] text-white/40">{s.team}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-4 text-right">
                    <div>
                      <div className={`text-lg font-black tabular-nums ${i === 0 ? "text-[#FFD700]" : "text-white"}`}>{s.goals}</div>
                      <div className="text-[8px] uppercase tracking-widest text-white/25">Goals</div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-black tabular-nums text-white/50">{s.assists}</div>
                      <div className="text-[8px] uppercase tracking-widest text-white/25">Ast</div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-black tabular-nums text-white/30">{s.played}</div>
                      <div className="text-[8px] uppercase tracking-widest text-white/25">GP</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-[#0b0f18] px-5 py-10 text-center">
              <Trophy className="mx-auto mb-3 h-8 w-8 text-[#FFD700]/30" />
              <p className="text-xs text-white/30">Scorers data loads as the group stage progresses.</p>
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

        {/* -- KNOCKOUT BRACKET -- */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-black uppercase tracking-widest text-white">Knockout Path</h2>
            <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">R32 → R16 → QF → SF → Final · Jul 19 · MetLife</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/8 bg-[#0b0f18] p-4">
            <div className="flex min-w-[640px] items-start gap-2">
              {[
                { label: "R32", slots: 16, color: "border-white/10 text-white/50" },
                { label: "R16", slots: 8,  color: "border-[#FFD700]/15 text-[#FFD700]/50" },
                { label: "QF",  slots: 4,  color: "border-[#FFD700]/25 text-[#FFD700]/70" },
                { label: "SF",  slots: 2,  color: "border-[#FFD700]/40 text-[#FFD700]/90" },
                { label: "Final",slots: 1, color: "border-[#FFD700] text-[#FFD700]" },
              ].map(col => {
                const colFixtures = fixturesByRound[
                  ROUND_ORDER.find(r => shortRound(r) === col.label || r === col.label) ?? ""
                ] ?? [];
                return (
                  <div key={col.label} className="flex flex-1 flex-col gap-2">
                    <div className="mb-1 text-center text-[9px] font-black uppercase tracking-widest text-white/30">{col.label}</div>
                    {Array.from({ length: col.slots }).map((_, si) => {
                      const f = colFixtures[si];
                      const isDone = f && DONE_STATUSES.has(f.status);
                      const isLive = f && LIVE_STATUSES.has(f.status);
                      return (
                        <div key={si} className={`rounded-xl border px-2 py-2 text-center text-[9px] font-bold ${col.color} ${f ? "bg-white/3" : "bg-transparent"}`}>
                          {f ? (
                            <div>
                              <div className="truncate text-white/70">{f.home}</div>
                              {(isDone || isLive) && f.homeScore !== null ? (
                                <div className={`my-0.5 text-[10px] font-black tabular-nums ${isLive ? "text-red-400" : "text-white"}`}>
                                  {f.homeScore} – {f.awayScore}
                                </div>
                              ) : (
                                <div className="my-0.5 text-white/20">vs</div>
                              )}
                              <div className="truncate text-white/70">{f.away}</div>
                            </div>
                          ) : (
                            <span className="text-white/15">TBD</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

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

          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {CAF_NATIONS.map(n => {
              const live = cafLiveData[n.name];
              const rank = live?.rank ?? null;
              const qualifying = rank !== null && rank <= 2;
              const thirdBest = rank === 3;
              const eliminated = rank !== null && rank > 3;
              const hasStats = live && live.played > 0;

              const statusColor = qualifying
                ? "border-[#22c55e]/40 bg-[#22c55e]/5"
                : thirdBest
                  ? "border-amber-500/30 bg-amber-500/5"
                  : eliminated
                    ? "border-red-600/20 bg-red-900/5"
                    : "border-[#006600]/20 bg-transparent";

              const rankBadgeColor = qualifying
                ? "bg-[#22c55e]/20 text-[#22c55e]"
                : thirdBest
                  ? "bg-amber-500/20 text-amber-400"
                  : eliminated
                    ? "bg-red-900/20 text-red-400"
                    : "bg-white/5 text-white/30";

              return (
                <div key={n.name} className={`flex gap-3 border-b border-r border-[#006600]/10 px-4 py-4 last:border-b-0 transition-all hover:bg-[#006600]/8 ${statusColor} rounded-none`}>
                  {/* Flag + star */}
                  <div className="relative shrink-0 pt-0.5">
                    <img src={n.logo} alt={n.name} className="h-9 w-9 rounded-sm object-contain shadow-[0_2px_8px_rgba(0,0,0,0.5)]" loading="lazy" />
                    {n.star && (
                      <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#FFD700] flex items-center justify-center">
                        <Star className="h-2 w-2 text-black" fill="currentColor" />
                      </div>
                    )}
                  </div>

                  {/* Name + group + note */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white leading-tight">{n.name}</span>
                      {rank !== null && (
                        <span className={`rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${rankBadgeColor}`}>
                          {qualifying ? `${rank === 1 ? "1st" : "2nd"} ✓` : thirdBest ? "3rd" : `${rank}th`}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[9px] text-[#22c55e]/55 font-bold uppercase tracking-wider">Group {n.group}</div>
                    <div className="mt-1 text-[10px] text-white/38 leading-snug">{n.note}</div>

                    {/* Live stats row */}
                    {hasStats ? (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex gap-2 text-[9px] font-bold text-white/50 tabular-nums">
                          <span title="Played">{live!.played}P</span>
                          <span title="Won" className="text-[#22c55e]/70">{live!.won}W</span>
                          <span title="Drawn">{live!.draw}D</span>
                          <span title="Lost" className="text-red-400/60">{live!.lost}L</span>
                          <span title="Points" className={`font-black ${qualifying ? "text-[#22c55e]" : "text-white/70"}`}>{live!.points}pts</span>
                        </div>
                        {live!.form.length > 0 && (
                          <div className="flex gap-0.5">
                            {live!.form.slice(-5).map((r, i) => (
                              <span key={i} className={`h-2 w-2 rounded-full ${r === "W" ? "bg-[#22c55e]" : r === "D" ? "bg-amber-400" : "bg-red-500"}`} title={r} />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 text-[9px] text-white/20 italic">Awaiting kick-off</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#006600]/10 px-5 py-3 flex items-center justify-between gap-4">
            <p className="text-[10px] text-white/28">
              No Kenya at WC26 — but Harambee Stars are building. Back an African team and keep the receipt when they go deep.
            </p>
            <div className="flex items-center gap-3 shrink-0 text-[9px] font-bold text-white/25">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#22c55e]" />Qualifying</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />3rd place</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Eliminated</span>
            </div>
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
