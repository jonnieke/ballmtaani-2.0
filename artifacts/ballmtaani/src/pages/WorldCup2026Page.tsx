import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CalendarDays, Database, MapPin, Shield, Trophy, Users } from "lucide-react";
import SEO from "../components/SEO";
import TeamLogo from "../components/TeamLogo";
import OddspediaCredit from "../components/OddspediaCredit";
import {
  fetchTournamentFixtures,
  fetchTournamentStandings,
  type TournamentStandingEntry,
} from "../lib/football-api";

const STADIUMS = [
  { city: "Mexico City", country: "Mexico", name: "Estadio Azteca" },
  { city: "Guadalajara", country: "Mexico", name: "Estadio Akron" },
  { city: "Monterrey", country: "Mexico", name: "Estadio BBVA" },
  { city: "Toronto", country: "Canada", name: "BMO Field" },
  { city: "Vancouver", country: "Canada", name: "BC Place" },
  { city: "Atlanta", country: "USA", name: "Mercedes-Benz Stadium" },
  { city: "Boston", country: "USA", name: "Gillette Stadium" },
  { city: "Dallas", country: "USA", name: "AT&T Stadium" },
  { city: "Houston", country: "USA", name: "NRG Stadium" },
  { city: "Kansas City", country: "USA", name: "Arrowhead Stadium" },
  { city: "Los Angeles", country: "USA", name: "SoFi Stadium" },
  { city: "Miami", country: "USA", name: "Hard Rock Stadium" },
  { city: "New York/New Jersey", country: "USA", name: "MetLife Stadium" },
  { city: "Philadelphia", country: "USA", name: "Lincoln Financial Field" },
  { city: "San Francisco Bay Area", country: "USA", name: "Levi's Stadium" },
  { city: "Seattle", country: "USA", name: "Lumen Field" },
];

const TIMELINE = [
  { label: "Group Stage", date: "Jun 11-27", detail: "72 matches across 12 groups" },
  { label: "Round of 32", date: "Jun 28-Jul 3", detail: "Top two in each group plus best third-placed teams" },
  { label: "Round of 16", date: "Jul 4-7", detail: "Knockout pressure begins to bite" },
  { label: "Quarter-finals", date: "Jul 9-11", detail: "Eight nations remain" },
  { label: "Semi-finals", date: "Jul 14-15", detail: "Two games from immortality" },
  { label: "Final Weekend", date: "Jul 18-19", detail: "Third-place match and final" },
];

function InfoCard({ icon: Icon, value, label, tone }: { icon: typeof Trophy; value: string; label: string; tone: string }) {
  return (
    <div className={`rounded-2xl border bg-black/34 p-4 backdrop-blur-xl ${tone}`}>
      <Icon className="mb-3 h-6 w-6" />
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/55">{label}</div>
    </div>
  );
}

function FixtureStrip({ fixture }: { fixture: any }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-white/8 px-3 py-3 last:border-0">
      <div className="flex min-w-0 items-center gap-2">
        <TeamLogo logo={fixture.homeLogo} initial={fixture.homeInitial} color="#182333" size="sm" />
        <span className="truncate text-sm font-semibold text-white">{fixture.home}</span>
      </div>
      <div className="text-center">
        <div className="text-xs font-bold text-[#FFD700]">{fixture.date}</div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">{fixture.time} EAT</div>
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1119]/82">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">{name}</h3>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FFD700]">Live Table</span>
      </div>
      {rows.map((row) => (
        <div key={row.team} className="grid grid-cols-[28px_1fr_34px_34px_34px_42px] items-center border-b border-white/6 px-3 py-2 text-sm last:border-0">
          <span className="text-white/55">{row.rank}</span>
          <span className="flex min-w-0 items-center gap-2">
            <img src={row.logo} alt={row.team} className="h-5 w-5 object-contain" />
            <span className="truncate font-medium text-white">{row.team}</span>
          </span>
          <span className="text-center text-white/55">{row.played}</span>
          <span className="text-center text-white/55">{row.won}</span>
          <span className="text-center text-white/55">{row.gd}</span>
          <span className="text-center font-bold text-[#FFD700]">{row.points}</span>
        </div>
      ))}
    </div>
  );
}

export default function WorldCup2026Page() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [standings, setStandings] = useState<Record<string, TournamentStandingEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      const [fixtureData, tableData] = await Promise.all([
        fetchTournamentFixtures(1, 2026),
        fetchTournamentStandings(1, 2026),
      ]);
      if (!mounted) return;
      setFixtures(fixtureData);
      setStandings(tableData);
      setLoading(false);
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const nextFixtures = useMemo(() => fixtures.slice(0, 5), [fixtures]);
  const groupEntries = useMemo(() => Object.entries(standings).slice(0, 12), [standings]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070b] pb-24 text-white">
      <SEO
        title="World Cup 2026 Guide | BallMtaani WC26 Tracker"
        description="Track FIFA World Cup 2026 format, groups, fixtures, stadiums and API-Football powered data on BallMtaani."
      />

      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1800&q=85"
          alt=""
          className="h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(255,214,0,0.32),transparent_22%),radial-gradient(circle_at_18%_22%,rgba(239,35,48,0.46),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.5),#05070b_72%)]" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-6 md:px-6">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm font-bold text-white/80 backdrop-blur-xl transition-colors hover:border-primary/60 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Live Hub
        </Link>

        <section className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-[#FFD700]">BallMtaani WC26 tracker</p>
            <h1 className="max-w-3xl text-4xl font-bold italic leading-none text-white md:text-6xl">
              World Cup 2026, built for fans who want the whole picture.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              Three host nations, 48 teams, 12 groups, 16 stadiums and 104 matches. This page turns the API-Football World Cup feed into a Kenyan fan command center.
            </p>
          </div>
          <div className="rounded-3xl border border-[#FFD700]/25 bg-[#151307]/72 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold uppercase text-white">Next WC26 Fixtures</h2>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#FFD700]">league=1 / season=2026</p>
              </div>
              <Database className="h-6 w-6 text-[#FFD700]" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#FFD700]/15 bg-black/28">
              {loading ? (
                <div className="p-5 text-center text-xs font-bold uppercase tracking-widest text-white/45">Loading World Cup feed...</div>
              ) : nextFixtures.length > 0 ? (
                nextFixtures.map((fixture) => <FixtureStrip key={fixture.id} fixture={fixture} />)
              ) : (
                <div className="p-5 text-center text-xs font-bold uppercase tracking-widest text-white/45">Fixtures will appear as API-Football publishes them.</div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <InfoCard icon={Users} value="48" label="Teams" tone="border-primary/50 text-primary" />
          <InfoCard icon={Shield} value="12" label="Groups" tone="border-blue-400/50 text-blue-300" />
          <InfoCard icon={MapPin} value="16" label="Stadiums" tone="border-[#FFD700]/50 text-[#FFD700]" />
          <InfoCard icon={CalendarDays} value="104" label="Matches" tone="border-purple-400/50 text-purple-300" />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-white/12 bg-[#080d14]/88 p-4 backdrop-blur-xl">
            <h2 className="mb-4 text-xl font-bold uppercase text-white">Tournament Roadmap</h2>
            <div className="space-y-3">
              {TIMELINE.map((item) => (
                <div key={item.label} className="grid grid-cols-[86px_1fr] gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="text-xs font-bold uppercase text-[#FFD700]">{item.date}</div>
                  <div>
                    <div className="font-bold text-white">{item.label}</div>
                    <div className="text-sm text-white/55">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/12 bg-[#080d14]/88 p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold uppercase text-white">Groups</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Top 2 + best 8 third-place teams advance</span>
            </div>
            {groupEntries.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {groupEntries.map(([name, rows]) => <GroupTable key={name} name={name} rows={rows} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-sm leading-6 text-white/62">
                Group tables will render here from API-Football standings once the competition data is available for `league=1&season=2026`. Until then, fans still get the format, fixtures and stadium guide.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/12 bg-[#080d14]/88 p-4 backdrop-blur-xl">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold uppercase text-white">16 Stadiums Across 3 Countries</h2>
              <p className="mt-1 text-sm text-white/55">Canada, Mexico and the United States host the biggest World Cup ever.</p>
            </div>
            <MapPin className="h-7 w-7 text-primary" />
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {STADIUMS.map((stadium) => (
              <div key={`${stadium.city}-${stadium.name}`} className="rounded-2xl border border-white/8 bg-black/24 p-3">
                <div className="text-sm font-bold text-white">{stadium.city}</div>
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-primary">{stadium.country}</div>
                <div className="mt-2 text-sm text-white/58">{stadium.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-primary/20 bg-primary/8 p-4 backdrop-blur-xl">
          <h2 className="text-xl font-bold uppercase text-white">What BallMtaani Should Track Next</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-black/25 p-4">
              <div className="font-bold text-primary">Live match center</div>
              <p className="mt-1 text-sm text-white/60">Events, lineups, stats and player ratings every matchday.</p>
            </div>
            <div className="rounded-2xl bg-black/25 p-4">
              <div className="font-bold text-primary">Fan predictions</div>
              <p className="mt-1 text-sm text-white/60">Predict group winners, knockout brackets and daily match calls.</p>
            </div>
            <div className="rounded-2xl bg-black/25 p-4">
              <div className="font-bold text-primary">Kenyan watch guide</div>
              <p className="mt-1 text-sm text-white/60">All times in EAT, with reminders for the matches fans actually care about.</p>
            </div>
          </div>
        </section>

        <footer className="mt-6 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
          <div>Powered by API-Football. Tournament structure based on API-SPORTS World Cup 2026 guidance.</div>
          <div className="mt-3">
            <OddspediaCredit />
          </div>
        </footer>
      </main>
    </div>
  );
}
