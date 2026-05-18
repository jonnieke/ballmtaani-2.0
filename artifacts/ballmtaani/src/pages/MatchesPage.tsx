import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock3,
  Goal,
  LayoutGrid,
  Radio,
  RotateCw,
  Search,
  Table2,
  Trophy,
} from "lucide-react";
import { useMatches, useRecentMatches, useUpcomingFixtures, useStandings } from "../hooks/useData";
import TeamLogo from "../components/TeamLogo";
import AdBanner from "../components/AdBanner";
import SEO from "../components/SEO";

type HubView = "overview" | "live" | "fixtures" | "results" | "tables";

const FEATURE_LINKS = [
  { href: "/live-center", label: "Live Center", sub: "Open match pulse", icon: Radio, tone: "text-primary border-primary/35 bg-primary/10" },
  { href: "/market-watch", label: "Market Watch", sub: "Football signals", icon: BarChart3, tone: "text-green-300 border-green-400/35 bg-green-500/10" },
  { href: "/world-cup-2026", label: "WC26", sub: "Road to 2026", icon: Trophy, tone: "text-[#FFD700] border-[#FFD700]/35 bg-[#FFD700]/10" },
  { href: "/predictions", label: "Predictions", sub: "Make your call", icon: Goal, tone: "text-cyan-300 border-cyan-400/35 bg-cyan-500/10" },
];

const TOP_LEAGUES = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "KPL"];

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function StatPill({ icon: Icon, value, label, tone }: { icon: typeof Activity; value: string | number; label: string; tone: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-[#0d131c]/86 p-4 ${tone}`}>
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-current/10 blur-2xl" />
      <Icon className="relative mb-3 h-5 w-5" />
      <div className="relative text-3xl font-bold text-white">{value}</div>
      <div className="relative mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">{label}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/14 bg-white/[0.03] p-6 text-center">
      <div className="text-sm font-bold uppercase tracking-[0.18em] text-white">{title}</div>
      <p className="mt-2 text-sm text-white/48">{body}</p>
    </div>
  );
}

function MatchCard({ match, variant = "fixture" }: { match: any; variant?: "live" | "fixture" | "result" }) {
  const isResult = variant === "result";
  const isLive = variant === "live";
  const status = isLive ? match.minute || match.status || "LIVE" : isResult ? "FT" : match.date || "Upcoming";
  const time = match.kickoff || match.time || "";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#101721]/88 p-3 transition-colors hover:border-primary/45 hover:bg-[#121d2a]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">{match.league || "Football"}</div>
          <div className="mt-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
            {isLive ? <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_currentColor]" /> : null}
            {status}
          </div>
        </div>
        {time ? <div className="shrink-0 text-right text-[11px] font-bold text-white/62">{time}</div> : null}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="min-w-0 text-center">
          <TeamLogo logo={match.homeLogo} initial={match.homeInitial || String(match.home || "H").slice(0, 3)} color={match.homeColor || "#182333"} size="sm" className="mx-auto mb-2" />
          <div className="truncate text-sm font-semibold text-white">{match.home}</div>
        </div>
        <div className="min-w-[58px] text-center">
          {isResult || isLive ? (
            <div className="text-2xl font-bold text-white">
              <span className={Number(match.homeScore) > Number(match.awayScore) ? "text-primary" : ""}>{match.homeScore ?? 0}</span>
              <span className="mx-1 text-white/25">-</span>
              <span className={Number(match.awayScore) > Number(match.homeScore) ? "text-primary" : ""}>{match.awayScore ?? 0}</span>
            </div>
          ) : (
            <div className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/44">VS</div>
          )}
        </div>
        <div className="min-w-0 text-center">
          <TeamLogo logo={match.awayLogo} initial={match.awayInitial || String(match.away || "A").slice(0, 3)} color={match.awayColor || "#182333"} size="sm" className="mx-auto mb-2" />
          <div className="truncate text-sm font-semibold text-white">{match.away}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/8 pt-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">{match.date || "Matchday"}</div>
        <Link href={isLive ? `/live-center/${match.id}` : "/live-center"} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
          Details <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function StandingMiniTable({ league, rows }: { league: string; rows: any[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c]/88">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold uppercase text-white">{league}</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">Top table</p>
        </div>
        <Table2 className="h-5 w-5 text-primary" />
      </div>
      <div className="px-3 py-2">
        {rows.slice(0, 5).map((team: any) => (
          <div key={`${league}-${team.rank}-${team.team}`} className="grid grid-cols-[26px_1fr_36px_42px] items-center border-b border-white/6 py-2 text-sm last:border-0">
            <span className="text-white/40">{team.rank}</span>
            <span className="flex min-w-0 items-center gap-2">
              <img src={team.logo} alt={team.team} className="h-5 w-5 shrink-0 object-contain" />
              <span className="truncate font-medium text-white">{team.team}</span>
            </span>
            <span className="text-center text-white/42">{team.played}</span>
            <span className="text-center font-bold text-primary">{team.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const [view, setView] = useState<HubView>("overview");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [tableLeague, setTableLeague] = useState("Premier League");

  const { data: liveMatches = [], isFetching: liveFetching } = useMatches();
  const { data: recentMatches = [], isFetching: recentFetching } = useRecentMatches();
  const { data: upcomingFixtures = [], isFetching: upcomingFetching } = useUpcomingFixtures();
  const { data: standings = {} as Record<string, any[]>, isFetching: standingsFetching } = useStandings();

  const availableLeagues = useMemo(() => {
    const names = [
      ...liveMatches.map((m: any) => m.league),
      ...upcomingFixtures.map((m: any) => m.league),
      ...recentMatches.map((m: any) => m.league),
      ...Object.keys(standings),
    ].filter(Boolean);
    return Array.from(new Set(names));
  }, [liveMatches, upcomingFixtures, recentMatches, standings]);

  const filtered = (items: any[]) =>
    items.filter((item) => {
      const matchesLeague = leagueFilter === "all" || item.league === leagueFilter;
      const haystack = `${item.home || ""} ${item.away || ""} ${item.league || ""}`;
      const matchesQuery = !query.trim() || normalizeText(haystack).includes(normalizeText(query));
      return matchesLeague && matchesQuery;
    });

  const live = useMemo(() => filtered(liveMatches), [liveMatches, leagueFilter, query]);
  const fixtures = useMemo(() => filtered(upcomingFixtures), [upcomingFixtures, leagueFilter, query]);
  const results = useMemo(() => filtered(recentMatches), [recentMatches, leagueFilter, query]);
  const selectedStandings = standings[tableLeague] || [];
  const fetching = liveFetching || recentFetching || upcomingFetching || standingsFetching;

  const featuredFixtures = fixtures.slice(0, 6);
  const featuredResults = results.slice(0, 4);
  const tableEntries = Object.entries(standings).filter(([, rows]) => rows?.length > 0);

  const navItems: { id: HubView; label: string; icon: typeof Activity; count?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "live", label: "Live", icon: Activity, count: live.length },
    { id: "fixtures", label: "Fixtures", icon: CalendarDays, count: fixtures.length },
    { id: "results", label: "Results", icon: Clock3, count: results.length },
    { id: "tables", label: "Tables", icon: Table2, count: tableEntries.length },
  ];

  return (
    <div className="min-h-screen bg-[#070a0f] pb-24 text-white">
      <SEO
        title="Football Data Center | BallMtaani"
        description="A one-stop football hub for Kenyan fans with live matches, fixtures, results, standings and World Cup routes powered by API-Football."
      />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1800&q=80"
            alt=""
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(239,35,48,0.48),transparent_24%),linear-gradient(180deg,rgba(7,10,15,0.35),#070a0f_82%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-9">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-primary">BallMtaani data center</p>
              <h1 className="max-w-3xl text-3xl font-bold italic leading-none md:text-5xl">Every match route in one place.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/66 md:text-base md:leading-7">
                Live scores, fixtures, recent results, league tables, WC26 and match detail paths, built for fans who do not want to leave the site for basic football data.
              </p>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = view === item.id;
                  return (
                    <button
                      key={`hero-${item.id}`}
                      onClick={() => setView(item.id)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors md:px-4 ${
                        active ? "border-primary bg-primary/18 text-white" : "border-white/14 bg-black/24 text-white/58 hover:text-white"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatPill icon={Activity} value={live.length} label="Live Now" tone="border-primary/45 text-primary" />
              <StatPill icon={CalendarDays} value={fixtures.length} label="Upcoming" tone="border-blue-400/45 text-blue-300" />
              <StatPill icon={Clock3} value={results.length} label="Recent Results" tone="border-green-400/45 text-green-300" />
              <StatPill icon={Table2} value={tableEntries.length} label="Tables" tone="border-purple-400/45 text-purple-300" />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
                    active ? "border-primary bg-primary/18 text-white" : "border-white/10 bg-white/[0.03] text-white/48 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {typeof item.count === "number" ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{item.count}</span> : null}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 lg:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/32" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search team or league"
                className="h-10 w-full rounded-full border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-primary/60"
              />
            </div>
            <select
              value={leagueFilter}
              onChange={(e) => setLeagueFilter(e.target.value)}
              className="h-10 rounded-full border border-white/10 bg-[#101721] px-3 text-xs font-bold uppercase tracking-[0.12em] text-white/70 outline-none focus:border-primary/60"
            >
              <option value="all">All leagues</option>
              {availableLeagues.map((league) => (
                <option key={league} value={league}>
                  {league}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          {FEATURE_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`rounded-2xl border p-4 transition-transform hover:-translate-y-0.5 ${item.tone}`}>
                <Icon className="mb-3 h-6 w-6" />
                <div className="text-sm font-bold uppercase text-white">{item.label}</div>
                <div className="mt-1 text-xs text-white/48">{item.sub}</div>
              </Link>
            );
          })}
        </div>

        <div className="mb-5">
          <AdBanner label="Matchday Data Partner" type="horizontal" />
        </div>

        {fetching ? (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
            <RotateCw className="h-3.5 w-3.5 animate-spin" />
            Syncing football data
          </div>
        ) : null}

        {view === "overview" && (
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-3xl border border-white/10 bg-[#0b1119]/88 p-3 md:p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold uppercase">Live and latest</h2>
                  <p className="text-xs text-white/44">Open live center when a match needs deeper data.</p>
                </div>
                <button onClick={() => setView(live.length ? "live" : "results")} className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  View all
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {(live.length ? live.slice(0, 4).map((m: any) => ({ ...m, _variant: "live" })) : featuredResults.map((m: any) => ({ ...m, _variant: "result" }))).map((match: any) => (
                  <MatchCard key={`${match._variant}-${match.id}`} match={match} variant={match._variant} />
                ))}
              </div>
              {!live.length && !featuredResults.length ? <EmptyState title="No latest matches" body="The feed is empty right now. Try fixtures or tables while the API refreshes." /> : null}
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#0b1119]/88 p-3 md:p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold uppercase">Next fixtures</h2>
                  <p className="text-xs text-white/44">Upcoming matches across the main leagues.</p>
                </div>
                <button onClick={() => setView("fixtures")} className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  More
                </button>
              </div>
              <div className="space-y-3">
                {featuredFixtures.length ? featuredFixtures.map((match: any) => <MatchCard key={match.id} match={match} variant="fixture" />) : <EmptyState title="No fixtures" body="Upcoming fixtures will appear here as the data feed updates." />}
              </div>
            </section>

            <section className="xl:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase">League tables at a glance</h2>
                <button onClick={() => setView("tables")} className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Full tables
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {tableEntries.slice(0, 3).map(([league, rows]) => <StandingMiniTable key={league} league={league} rows={rows} />)}
              </div>
            </section>
          </div>
        )}

        {view === "live" && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase">Live matches</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Auto refreshes</span>
            </div>
            {live.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {live.map((match: any) => <MatchCard key={match.id} match={match} variant="live" />)}
              </div>
            ) : (
              <EmptyState title="No live matches right now" body="Fans can still check fixtures, results, tables and WC26 from this page." />
            )}
          </section>
        )}

        {view === "fixtures" && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase">Upcoming fixtures</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{fixtures.length} matches</span>
            </div>
            {fixtures.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {fixtures.map((match: any) => <MatchCard key={match.id} match={match} variant="fixture" />)}
              </div>
            ) : (
              <EmptyState title="No upcoming fixtures" body="Try a different league filter or clear your search." />
            )}
          </section>
        )}

        {view === "results" && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase">Recent results</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{results.length} results</span>
            </div>
            {results.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {results.map((match: any) => <MatchCard key={match.id} match={match} variant="result" />)}
              </div>
            ) : (
              <EmptyState title="No recent results" body="Try a different league filter or clear your search." />
            )}
          </section>
        )}

        {view === "tables" && (
          <section>
            <div className="mb-4 flex flex-wrap gap-2">
              {[...TOP_LEAGUES, ...Object.keys(standings).filter((name) => !TOP_LEAGUES.includes(name))].slice(0, 10).map((league) => (
                <button
                  key={league}
                  onClick={() => setTableLeague(league)}
                  className={`rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
                    tableLeague === league ? "border-primary bg-primary/18 text-white" : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                  }`}
                >
                  {league}
                </button>
              ))}
            </div>
            {selectedStandings.length ? (
              <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0b1119]/90">
                <table className="w-full min-w-[760px]">
                  <thead className="border-b border-white/10 bg-black/24">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">
                      <th className="p-3 text-center">#</th>
                      <th className="p-3 text-left">Club</th>
                      <th className="p-3 text-center">P</th>
                      <th className="p-3 text-center">W</th>
                      <th className="p-3 text-center">D</th>
                      <th className="p-3 text-center">L</th>
                      <th className="p-3 text-center">GD</th>
                      <th className="p-3 text-center">Pts</th>
                      <th className="p-3 text-left">Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStandings.map((team: any) => (
                      <tr key={`${team.rank}-${team.team}`} className="border-b border-white/6 last:border-0 hover:bg-white/[0.03]">
                        <td className="p-3 text-center text-sm text-white/45">{team.rank}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img src={team.logo} alt={team.team} className="h-6 w-6 object-contain" />
                            <span className="font-semibold text-white">{team.team}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-sm text-white/50">{team.played}</td>
                        <td className="p-3 text-center text-sm text-white/50">{team.won}</td>
                        <td className="p-3 text-center text-sm text-white/50">{team.draw}</td>
                        <td className="p-3 text-center text-sm text-white/50">{team.lost}</td>
                        <td className="p-3 text-center text-sm text-white/50">{team.gd}</td>
                        <td className="p-3 text-center text-base font-bold text-primary">{team.points}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {(team.form || []).slice(-5).map((f: string, idx: number) => (
                              <span key={`${team.rank}-${idx}`} className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold ${f === "W" ? "bg-green-600/20 text-green-300" : f === "D" ? "bg-white/10 text-white/55" : "bg-red-600/20 text-red-300"}`}>
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No table loaded" body="Choose another league or wait for the standings feed to refresh." />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
