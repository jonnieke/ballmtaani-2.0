import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Radio,
  Table2,
  Trophy,
} from "lucide-react";
import { useMatches, useRecentMatches, useStandings, useUpcomingFixtures } from "../hooks/useData";
import TeamLogo from "./TeamLogo";

type FeedMode = "all" | "live" | "upcoming" | "results";
type MatchVariant = Exclude<FeedMode, "all">;

const MODE_LABELS: Array<{ id: FeedMode; label: string }> = [
  { id: "all", label: "All matches" },
  { id: "live", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "results", label: "Results" },
];

function leagueKey(name?: string) {
  if (!name) return "";
  if (/world cup/i.test(name)) return "World Cup 2026";
  if (/champions league/i.test(name)) return "UEFA Champions League";
  if (/europa league/i.test(name)) return "UEFA Europa League";
  return name;
}

function matchTime(match: any, variant: MatchVariant) {
  if (variant === "live") return match.minute || "Live";
  if (variant === "results") return match.status || "FT";
  return match.time || "TBC";
}

function MatchdayTeam({ name, logo }: { name: string; logo?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <TeamLogo logo={logo} initial={name.slice(0, 1)} color="#17212a" size="sm" />
      <span className="truncate text-xs font-bold text-white/82">{name}</span>
    </div>
  );
}

export default function MatchdayDataHub() {
  const [mode, setMode] = useState<FeedMode>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: live = [], isFetching: liveLoading } = useMatches();
  const { data: upcoming = [], isFetching: upcomingLoading } = useUpcomingFixtures();
  const { data: results = [], isFetching: resultsLoading } = useRecentMatches();
  const { data: standings = {}, isFetching: standingsLoading } = useStandings();

  const tagged = useMemo(() => {
    const seen = new Set<string>();
    const rows: Array<{ match: any; variant: MatchVariant }> = [];
    const add = (items: any[], variant: MatchVariant) => {
      for (const match of items) {
        const id = String(match.id);
        if (seen.has(id)) continue;
        seen.add(id);
        rows.push({ match, variant });
      }
    };
    add(live, "live");
    add(upcoming, "upcoming");
    add(results, "results");
    return rows;
  }, [live, upcoming, results]);

  const visible = useMemo(
    () => tagged.filter(row => mode === "all" || row.variant === mode).slice(0, 12),
    [tagged, mode],
  );

  const selected = visible.find(row => String(row.match.id) === selectedId) || visible[0] || null;
  const selectedLeague = leagueKey(selected?.match?.league);
  const tableEntries = Object.entries(standings as Record<string, any[]>).filter(([, rows]) => rows?.length > 0);
  const table = (standings as Record<string, any[]>)[selectedLeague] || tableEntries[0]?.[1] || [];
  const tableName = (standings as Record<string, any[]>)[selectedLeague] ? selectedLeague : tableEntries[0]?.[0] || "Standings";
  const competitionCount = new Set(tagged.map(row => row.match.league).filter(Boolean)).size;
  const loading = liveLoading || upcomingLoading || resultsLoading;

  const groups = useMemo(() => {
    const grouped = new Map<string, Array<{ match: any; variant: MatchVariant }>>();
    for (const row of visible) {
      const name = row.match.league || "Other competitions";
      grouped.set(name, [...(grouped.get(name) || []), row]);
    }
    return Array.from(grouped.entries());
  }, [visible]);

  return (
    <section className="border-t border-white/8 bg-[#070b0e] py-7" aria-labelledby="matchday-data-title">
      <div className="mx-auto max-w-[1800px] px-4 md:px-7">
        <div className="flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-[#F7B500]">
              <Activity className="h-3.5 w-3.5" /> Ball Mtaani data desk
            </div>
            <h2 id="matchday-data-title" className="mt-1 text-2xl font-black uppercase text-white">Matchday data centre</h2>
            <p className="mt-1 text-xs text-white/45">Scores, schedules and league context from the verified football feed.</p>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/8 bg-white/8 sm:grid-cols-4">
            {[
              { label: "Live now", value: live.length, icon: Radio, live: true },
              { label: "Upcoming", value: upcoming.length, icon: CalendarDays },
              { label: "Results", value: results.length, icon: Trophy },
              { label: "Competitions", value: competitionCount, icon: Table2 },
            ].map(({ label, value, icon: Icon, live: liveMetric }) => (
              <div key={label} className="flex min-w-[128px] items-center gap-2 bg-[#0b1116] px-3 py-2.5">
                <Icon className={`h-4 w-4 ${liveMetric && value > 0 ? "text-red-400" : "text-[#F7B500]"}`} />
                <div><p className="text-sm font-black tabular-nums text-white">{value}</p><p className="text-[8px] font-bold uppercase tracking-wider text-white/35">{label}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Match feed filters">
          {MODE_LABELS.map(item => {
            const count = item.id === "all" ? tagged.length : item.id === "live" ? live.length : item.id === "upcoming" ? upcoming.length : results.length;
            return (
              <button key={item.id} onClick={() => setMode(item.id)} className={`flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-[10px] font-black uppercase tracking-wider transition ${mode === item.id ? "border-[#F7B500]/55 bg-[#F7B500]/12 text-[#F7B500]" : "border-white/8 bg-[#0b1116] text-white/42 hover:border-white/18 hover:text-white"}`}>
                {item.label}<span className="rounded bg-white/8 px-1.5 py-0.5 text-[8px] tabular-nums">{count}</span>
              </button>
            );
          })}
          <Link href="/matches" className="ml-auto hidden h-9 shrink-0 items-center gap-2 rounded-md border border-white/10 px-4 text-[10px] font-black uppercase tracking-wider text-white/60 transition hover:border-[#F7B500]/45 hover:text-[#F7B500] sm:flex">Open full hub <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>

        <div className="mt-3 grid overflow-hidden rounded-lg border border-white/9 bg-[#0b1116] shadow-[0_20px_60px_rgba(0,0,0,.24)] xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,.55fr)]">
          <div className="min-w-0 border-b border-white/8 xl:border-b-0 xl:border-r">
            {groups.length > 0 ? groups.map(([league, rows]) => (
              <div key={league}>
                <div className="flex items-center gap-2 border-b border-white/[0.05] bg-[#0e171d] px-4 py-2.5">
                  {rows[0]?.match?.leagueLogo && <img src={rows[0].match.leagueLogo} alt="" className="h-4 w-4 object-contain" />}
                  <h3 className="truncate text-[10px] font-black uppercase tracking-wider text-white/66">{league}</h3>
                  <span className="ml-auto text-[9px] text-white/28">{rows.length} {rows.length === 1 ? "match" : "matches"}</span>
                </div>
                {rows.map(({ match, variant }) => {
                  const active = selected && String(selected.match.id) === String(match.id);
                  return (
                    <button key={`${variant}-${match.id}`} onClick={() => setSelectedId(String(match.id))} className={`grid w-full grid-cols-[62px_minmax(0,1fr)_auto_minmax(0,1fr)_24px] items-center gap-2 border-b border-white/[0.045] px-3 py-3 text-left transition last:border-b-0 hover:bg-white/[0.025] sm:grid-cols-[82px_minmax(0,1fr)_auto_minmax(0,1fr)_28px] ${active ? "bg-[#F7B500]/[0.055]" : ""}`}>
                      <div className="text-center">
                        <p className={`text-[10px] font-black tabular-nums ${variant === "live" ? "text-red-400" : "text-white/50"}`}>{matchTime(match, variant)}</p>
                        <p className="mt-0.5 truncate text-[8px] uppercase text-white/22">{match.date || (variant === "live" ? "Now" : variant)}</p>
                      </div>
                      <MatchdayTeam name={match.home || "Home"} logo={match.homeLogo} />
                      <div className="min-w-[42px] text-center text-sm font-black tabular-nums text-white">
                        {variant === "upcoming" ? <span className="text-[9px] text-white/22">VS</span> : <>{match.homeScore ?? "-"}<span className="mx-1 text-white/18">:</span>{match.awayScore ?? "-"}</>}
                      </div>
                      <MatchdayTeam name={match.away || "Away"} logo={match.awayLogo} />
                      <ChevronRight className={`h-4 w-4 justify-self-end ${active ? "text-[#F7B500]" : "text-white/18"}`} />
                    </button>
                  );
                })}
              </div>
            )) : (
              <div className="grid min-h-[300px] place-items-center px-6 py-12 text-center">
                <div><Clock3 className="mx-auto h-7 w-7 text-[#F7B500]/55" /><p className="mt-3 text-sm font-black uppercase text-white">No verified matches in this view</p><p className="mt-2 text-xs text-white/38">The feed will populate automatically when fixtures are available.</p></div>
              </div>
            )}
            {loading && <div className="border-t border-white/5 px-4 py-2 text-[9px] font-bold uppercase tracking-wider text-white/28">Refreshing verified match data...</div>}
          </div>

          <aside className="bg-[#091016]">
            {selected ? (
              <div className="border-b border-white/8 p-5">
                <div className="flex items-center justify-between gap-3"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#F7B500]">Match focus</p><span className={`rounded px-2 py-1 text-[8px] font-black uppercase ${selected.variant === "live" ? "bg-red-500/15 text-red-400" : "bg-white/6 text-white/40"}`}>{selected.variant}</span></div>
                <p className="mt-2 truncate text-[10px] font-bold uppercase tracking-wider text-white/35">{selected.match.league}</p>
                <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="text-center"><TeamLogo logo={selected.match.homeLogo} initial={String(selected.match.home || "H").slice(0, 1)} color="#17212a" size="lg" /><p className="mt-2 truncate text-xs font-black text-white">{selected.match.home}</p></div>
                  <div className="text-center"><p className="text-lg font-black tabular-nums text-white">{selected.variant === "upcoming" ? "VS" : `${selected.match.homeScore ?? "-"} - ${selected.match.awayScore ?? "-"}`}</p><p className={`mt-1 text-[9px] font-black uppercase ${selected.variant === "live" ? "text-red-400" : "text-white/34"}`}>{matchTime(selected.match, selected.variant)}</p></div>
                  <div className="text-center"><TeamLogo logo={selected.match.awayLogo} initial={String(selected.match.away || "A").slice(0, 1)} color="#17212a" size="lg" /><p className="mt-2 truncate text-xs font-black text-white">{selected.match.away}</p></div>
                </div>
                {selected.match.venue && <p className="mt-4 truncate text-center text-[9px] text-white/30">{selected.match.venue}</p>}
                <Link href={`/live-center/${selected.match.id}`} className="mt-4 flex h-10 items-center justify-center gap-2 rounded-md bg-[#F7B500] text-[10px] font-black uppercase tracking-wider text-black transition hover:bg-[#FFC928]">Match intelligence <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            ) : null}

            <div>
              <div className="flex items-center gap-2 border-b border-white/[0.05] px-4 py-3"><Table2 className="h-4 w-4 text-[#F7B500]" /><h3 className="truncate text-[10px] font-black uppercase tracking-wider text-white/65">{tableName}</h3><Link href="/matches?tab=tables" className="ml-auto text-[9px] font-black text-[#F7B500]">Full table</Link></div>
              {table.length > 0 ? table.slice(0, 7).map((team: any) => (
                <div key={`${team.rank}-${team.team}`} className="grid grid-cols-[20px_22px_minmax(0,1fr)_32px_34px] items-center gap-2 border-b border-white/[0.04] px-4 py-2 last:border-0">
                  <span className="text-[10px] tabular-nums text-white/26">{team.rank}</span><img src={team.logo} alt="" className="h-5 w-5 object-contain" /><span className="truncate text-[11px] font-bold text-white/62">{team.team}</span><span className="text-center text-[9px] text-white/30">{team.played}</span><span className="text-right text-xs font-black tabular-nums text-white">{team.points}</span>
                </div>
              )) : <div className="px-5 py-8 text-center"><p className="text-xs font-bold text-white/44">Standings are syncing.</p><p className="mt-1 text-[9px] text-white/25">No table is shown until the verified feed responds.</p></div>}
              {standingsLoading && <p className="border-t border-white/5 px-4 py-2 text-[8px] uppercase tracking-wider text-white/25">Refreshing table...</p>}
            </div>
          </aside>
        </div>

        <Link href="/matches" className="mt-3 flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 text-[10px] font-black uppercase tracking-wider text-white/58 sm:hidden">Open full football hub <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
    </section>
  );
}
