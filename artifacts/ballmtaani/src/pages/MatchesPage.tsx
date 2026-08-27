import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleDot,
  Radio,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import SEO from "../components/SEO";
import TeamLogo from "../components/TeamLogo";
import {
  COMPETITIONS,
  type CompetitionConfig,
} from "../config/football-catalog";
import { useMatches, useRecentMatches, useStandings } from "../hooks/useData";
import {
  fetchFixturesByDate,
  fetchWC26TopScorers,
  type LiveMatch,
  type StandingEntry,
} from "../lib/football-api";
import {
  fetchFootballNews,
  fetchPartnerArticles,
  timeAgo,
  type NewsArticle,
} from "../lib/news-api";

const NAIROBI = "Africa/Nairobi";
const LIVE_STATUSES = new Set(["1H", "2H", "HT", "ET", "P", "LIVE", "BT"]);
const FINAL_STATUSES = new Set(["FT", "AET", "PEN"]);
const STOPPED_STATUSES = new Set(["PST", "CANC", "ABD", "AWD", "WO"]);
const MAIN_LEAGUES = [39, 140, 135, 78];

type Tab = "live" | "fixtures" | "results" | "tables";
type Scorer = {
  name: string;
  photo: string;
  team: string;
  teamLogo: string;
  goals: number;
};

function eatDateKey(date = new Date()) {
  return date.toLocaleDateString("en-CA", { timeZone: NAIROBI });
}

function dateFromKey(key: string) {
  return new Date(`${key}T12:00:00Z`);
}

function shiftDate(key: string, amount: number) {
  const date = dateFromKey(key);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[5px] border border-white/15 bg-[#111] ${className}`}
    >
      {children}
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[132px] items-center justify-center px-5 text-center text-[12px] text-[#8d949a]">
      {children}
    </div>
  );
}

function LeagueRail({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (slug: string) => void;
}) {
  const leagues = COMPETITIONS.filter((competition) =>
    [39, 140, 135, 78, 61, 2, 276, 12].includes(competition.id),
  );

  return (
    <nav
      aria-label="Football leagues"
      className="border-b border-white/10 bg-[#141414]"
    >
      <div className="mx-auto flex max-w-[1500px] overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => onSelect("all")}
          className={`flex h-[60px] min-w-[84px] items-center justify-center gap-2 border-x border-white/10 px-4 text-[13px] font-black uppercase transition ${
            active === "all"
              ? "bg-[#d8212a] text-white"
              : "text-white hover:bg-white/5"
          }`}
        >
          <span className="grid grid-cols-3 gap-[2px]" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => (
              <i
                key={index}
                className="h-[4px] w-[4px] rounded-[1px] bg-current"
              />
            ))}
          </span>
          All
        </button>
        {leagues.map((league) => (
          <button
            key={league.id}
            onClick={() => onSelect(league.slug)}
            className={`flex h-[60px] min-w-[156px] items-center gap-3 border-r border-white/10 px-5 text-left transition hover:bg-white/5 ${
              active === league.slug ? "bg-white/[0.06]" : ""
            }`}
          >
            <img src={league.logo} alt="" className="h-9 w-9 object-contain" />
            <span>
              <b className="block whitespace-nowrap text-[13px] uppercase text-white">
                {league.shortName}
              </b>
              <small className="block text-[9px] text-[#a0a0a0]">
                {league.country}
              </small>
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function DateNavigator({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}) {
  const today = eatDateKey();
  const dates = Array.from({ length: 7 }, (_, index) =>
    shiftDate(selected, index - 3),
  );
  return (
    <div className="grid h-[39px] grid-cols-[42px_repeat(7,minmax(92px,1fr))_42px] overflow-x-auto rounded-[4px] border border-white/10 bg-[#151515] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        aria-label="Previous day"
        onClick={() => onSelect(shiftDate(selected, -1))}
        className="grid place-items-center border-r border-white/10 hover:bg-white/5"
      >
        <ArrowLeft size={15} />
      </button>
      {dates.map((key) => {
        const date = dateFromKey(key);
        const active = key === selected;
        const label =
          key === today
            ? "Today"
            : date.toLocaleDateString("en-GB", { weekday: "short" });
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`whitespace-nowrap border-r border-white/10 px-3 text-[11px] font-bold uppercase ${active ? "bg-[#d8212a] text-white" : "text-[#d4d4d4] hover:bg-white/5"}`}
          >
            {label} {date.getUTCDate()}{" "}
            {date.toLocaleDateString("en-GB", { month: "short" })}
          </button>
        );
      })}
      <button
        aria-label="Next day"
        onClick={() => onSelect(shiftDate(selected, 1))}
        className="grid place-items-center hover:bg-white/5"
      >
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

function SectionBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-8 items-center gap-2 bg-gradient-to-r from-[#a5131a] to-[#c51c24] px-3 text-[12px] font-black uppercase text-white">
      {children}
    </div>
  );
}

function MatchStatus({ match }: { match: LiveMatch }) {
  if (LIVE_STATUSES.has(match.status)) {
    return (
      <span className="rounded-[3px] bg-[#d8212a] px-2 py-1 text-[9px] font-black uppercase text-white">
        {match.minute || "Live"}
      </span>
    );
  }
  if (FINAL_STATUSES.has(match.status))
    return <span className="text-[10px] font-bold text-[#aaa]">FT</span>;
  if (STOPPED_STATUSES.has(match.status))
    return (
      <span className="text-[10px] font-bold text-[#e56a70]">
        {match.status}
      </span>
    );
  return <span className="text-[10px] text-[#aaa]">{match.time || "TBC"}</span>;
}

function FixtureTable({
  matches,
  loading,
}: {
  matches: LiveMatch[];
  loading: boolean;
}) {
  return (
    <div className="min-w-0 border-r border-white/10">
      <SectionBar>
        <CalendarDays size={14} /> Match schedule
      </SectionBar>
      <div className="grid h-8 grid-cols-[55px_minmax(220px,1fr)] items-center border-b border-white/10 px-3 text-[9px] uppercase text-[#999] sm:grid-cols-[74px_130px_minmax(260px,1fr)_74px]">
        <span>Time</span>
        <span className="hidden sm:block">Competition</span>
        <span className="text-center">Match</span>
        <span className="hidden text-right sm:block">Status</span>
      </div>
      {loading ? (
        <EmptyState>Loading verified fixtures...</EmptyState>
      ) : matches.length === 0 ? (
        <EmptyState>
          No verified fixtures are available for this date and league.
        </EmptyState>
      ) : (
        matches.slice(0, 8).map((match) => (
          <Link
            key={match.id}
            href={`/match/${match.id}`}
            className="grid h-8 grid-cols-[55px_minmax(220px,1fr)] items-center border-b border-white/[0.08] px-3 text-[10px] hover:bg-white/[0.035] sm:grid-cols-[74px_130px_minmax(260px,1fr)_74px]"
          >
            <span className="font-bold text-white">
              {match.time || match.minute || "TBC"}
            </span>
            <span className="hidden min-w-0 items-center gap-2 text-[#d1d1d1] sm:flex">
              <img
                src={match.leagueLogo}
                alt=""
                className="h-5 w-5 object-contain"
              />
              <span className="truncate">{match.league}</span>
            </span>
            <span className="grid grid-cols-[1fr_23px_32px_23px_1fr] items-center gap-2">
              <span className="truncate text-right font-semibold">
                {match.home}
              </span>
              <TeamLogo
                logo={match.homeLogo}
                initial={match.homeInitial}
                color={match.homeColor}
                size="xs"
                className="!h-5 !w-5 !border-0 !p-0"
              />
              <b className="text-center text-[#bbb]">
                {LIVE_STATUSES.has(match.status) ||
                FINAL_STATUSES.has(match.status)
                  ? `${match.homeScore}-${match.awayScore}`
                  : "vs"}
              </b>
              <TeamLogo
                logo={match.awayLogo}
                initial={match.awayInitial}
                color={match.awayColor}
                size="xs"
                className="!h-5 !w-5 !border-0 !p-0"
              />
              <span className="truncate font-semibold">{match.away}</span>
            </span>
            <span className="hidden text-right sm:block">
              <MatchStatus match={match} />
            </span>
          </Link>
        ))
      )}
      <Link
        href="/fixtures"
        className="flex h-8 items-center px-3 text-[10px] font-bold text-[#f12c34] hover:text-white"
      >
        View all fixtures <ArrowRight size={12} className="ml-1" />
      </Link>
    </div>
  );
}

function FormDots({ form }: { form: string[] }) {
  const normalized = form.slice(-5);
  return (
    <span className="flex justify-end gap-[3px]">
      {Array.from({ length: 5 }, (_, index) => {
        const result = normalized[index];
        const color =
          result === "W"
            ? "bg-[#64c737]"
            : result === "L"
              ? "bg-[#d8212a]"
              : result === "D"
                ? "bg-[#999]"
                : "bg-[#555]";
        return (
          <i
            key={index}
            title={result || "No result"}
            className={`h-[7px] w-[7px] rounded-full ${color}`}
          />
        );
      })}
    </span>
  );
}

function StandingsTable({
  league,
  rows,
  loading,
}: {
  league: CompetitionConfig;
  rows: StandingEntry[];
  loading: boolean;
}) {
  return (
    <div className="min-w-0">
      <SectionBar>
        <img src={league.logo} alt="" className="h-5 w-5 object-contain" />{" "}
        {league.officialName} table
      </SectionBar>
      <div className="grid h-8 grid-cols-[28px_minmax(130px,1fr)_32px_36px] items-center border-b border-white/10 px-3 text-[9px] uppercase text-[#999] sm:grid-cols-[28px_minmax(130px,1fr)_repeat(5,30px)_70px]">
        <span>#</span>
        <span>Team</span>
        <span>P</span>
        <span className="hidden sm:block">W</span>
        <span className="hidden sm:block">D</span>
        <span className="hidden sm:block">L</span>
        <span>Pts</span>
        <span className="hidden text-right sm:block">Form</span>
      </div>
      {loading ? (
        <EmptyState>Loading verified table...</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState>Standings data could not be verified from the configured football data provider right now.</EmptyState>
      ) : (
        rows.slice(0, 8).map((row) => (
          <div
            key={row.rank}
            className="relative grid h-8 grid-cols-[28px_minmax(130px,1fr)_32px_36px] items-center border-b border-white/[0.08] px-3 text-[10px] sm:grid-cols-[28px_minmax(130px,1fr)_repeat(5,30px)_70px]"
          >
            <i
              className={`absolute inset-y-0 left-0 w-[3px] ${row.rank <= 4 ? "bg-[#5cc331]" : row.rank <= 6 ? "bg-[#168bd2]" : rows.length - row.rank < 3 ? "bg-[#d8212a]" : "bg-transparent"}`}
            />
            <span>{row.rank}</span>
            <span className="flex min-w-0 items-center gap-2">
              <img src={row.logo} alt="" className="h-5 w-5 object-contain" />
              <b className="truncate">{row.team}</b>
            </span>
            <span>{row.played}</span>
            <span className="hidden sm:block">{row.won}</span>
            <span className="hidden sm:block">{row.draw}</span>
            <span className="hidden sm:block">{row.lost}</span>
            <b>{row.points}</b>
            <span className="hidden sm:block">
              <FormDots form={row.form} />
            </span>
          </div>
        ))
      )}
      <Link
        href={`/league/${league.slug}`}
        className="flex h-8 items-center px-3 text-[10px] font-bold text-[#f12c34] hover:text-white"
      >
        Full table <ArrowRight size={12} className="ml-1" />
      </Link>
    </div>
  );
}

function LiveNow({ matches }: { matches: LiveMatch[] }) {
  return (
    <Panel className="min-h-[228px]">
      <div className="flex h-[45px] items-center justify-between border-b border-white/10 px-4">
        <h2 className="flex items-center gap-2 text-[12px] font-black uppercase text-[#63d248]">
          <Radio size={14} /> Live now{" "}
          <span className="rounded-full bg-[#26b83f] px-1.5 text-[9px] text-white">
            {matches.length}
          </span>
        </h2>
        <Link
          href="/live"
          className="text-[9px] text-white hover:text-[#ed242d]"
        >
          View all <ArrowRight size={11} className="inline" />
        </Link>
      </div>
      {matches.length === 0 ? (
        <EmptyState>No matches are live right now.</EmptyState>
      ) : (
        matches.slice(0, 3).map((match) => (
          <Link
            key={match.id}
            href={`/match/${match.id}`}
            className="grid h-[60px] grid-cols-[42px_1fr_34px_1fr] items-center border-b border-white/10 px-3 text-[10px] hover:bg-white/[0.035]"
          >
            <span className="text-[10px] font-black text-[#56c839]">
              {match.minute || "LIVE"}
            </span>
            <span className="min-w-0 text-right">
              <small className="block truncate text-[8px] text-[#8c8c8c]">
                {match.league}
              </small>
              <b className="truncate">{match.home}</b>
            </span>
            <b className="text-center text-[18px]">
              {match.homeScore}-{match.awayScore}
            </b>
            <span className="min-w-0">
              <small className="block truncate text-[8px] text-[#8c8c8c]">
                {match.status}
              </small>
              <b className="truncate">{match.away}</b>
            </span>
          </Link>
        ))
      )}
    </Panel>
  );
}

function TopScorers({
  scorers,
  loading,
}: {
  scorers: Scorer[];
  loading: boolean;
}) {
  return (
    <Panel className="mt-2 min-h-[228px]">
      <div className="flex h-[45px] items-center justify-between border-b border-white/10 px-4">
        <div>
          <h2 className="text-[12px] font-black uppercase">Top scorers</h2>
          <small className="text-[8px] text-[#888]">World Cup 2026</small>
        </div>
        <Link
          href="/world-cup-2026"
          className="text-[9px] hover:text-[#ed242d]"
        >
          View all <ArrowRight size={11} className="inline" />
        </Link>
      </div>
      <div className="grid h-7 grid-cols-[28px_1fr_1fr_36px] items-center border-b border-white/10 px-4 text-[8px] uppercase text-[#888]">
        <span>#</span>
        <span>Player</span>
        <span>Team</span>
        <span className="text-right">Goals</span>
      </div>
      {loading ? (
        <EmptyState>Loading scorer data...</EmptyState>
      ) : scorers.length === 0 ? (
        <EmptyState>Top scorer data is currently unavailable.</EmptyState>
      ) : (
        scorers.slice(0, 5).map((player, index) => (
          <div
            key={`${player.name}-${index}`}
            className="grid h-[30px] grid-cols-[28px_1fr_1fr_36px] items-center border-b border-white/[0.07] px-4 text-[9px]"
          >
            <b>{index + 1}</b>
            <span className="flex min-w-0 items-center gap-2">
              <img
                src={player.photo}
                alt=""
                className="h-5 w-5 rounded-full object-cover"
              />
              <span className="truncate">{player.name}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <img
                src={player.teamLogo}
                alt=""
                className="h-4 w-4 object-contain"
              />
              <span className="truncate">{player.team}</span>
            </span>
            <b className="text-right">{player.goals}</b>
          </div>
        ))
      )}
    </Panel>
  );
}

function LeagueSnapshot({
  league,
  fixtures,
  standings,
}: {
  league: CompetitionConfig;
  fixtures: LiveMatch[];
  standings: StandingEntry[];
}) {
  return (
    <Panel className="h-[216px]">
      <div className="flex h-[53px] items-center justify-between border-b border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent px-4">
        <span className="flex items-center gap-3">
          <img src={league.logo} alt="" className="h-8 w-8 object-contain" />
          <span>
            <b className="block text-[12px] uppercase">{league.officialName}</b>
            <small className="block text-[9px] text-[#aaa]">
              {league.country} · 2026/27
            </small>
          </span>
        </span>
        <Link
          href={`/league/${league.slug}`}
          className="text-[9px] hover:text-[#ed242d]"
        >
          Full league <ArrowRight size={11} className="inline" />
        </Link>
      </div>
      <div className="grid h-[130px] grid-cols-2 divide-x divide-white/10">
        <div className="p-3">
          <h3 className="mb-2 text-[9px] font-bold uppercase text-[#d3d3d3]">
            Next fixtures
          </h3>
          {fixtures.length === 0 ? (
            <p className="pt-7 text-center text-[9px] text-[#777]">
              No verified fixtures
            </p>
          ) : (
            fixtures.slice(0, 4).map((match) => (
              <div
                key={match.id}
                className="grid h-[23px] grid-cols-[39px_1fr_13px_1fr] items-center gap-1 text-[9px]"
              >
                <span className="text-[#888]">
                  {match.date?.slice(0, 6) || match.time}
                </span>
                <span className="truncate">{match.home}</span>
                <span className="text-[#777]">vs</span>
                <span className="truncate">{match.away}</span>
              </div>
            ))
          )}
        </div>
        <div className="p-3">
          <div className="mb-2 flex justify-between text-[9px] font-bold uppercase text-[#d3d3d3]">
            <h3>Table top 4</h3>
            <span className="text-[8px] text-[#777]">
              P&nbsp;&nbsp;&nbsp;Pts
            </span>
          </div>
          {standings.length === 0 ? (
            <p className="pt-7 text-center text-[9px] text-[#777]">
              Table unavailable
            </p>
          ) : (
            standings.slice(0, 4).map((row) => (
              <div
                key={row.rank}
                className="grid h-[23px] grid-cols-[16px_20px_1fr_19px_23px] items-center text-[9px]"
              >
                <span>{row.rank}</span>
                <img src={row.logo} alt="" className="h-4 w-4 object-contain" />
                <span className="truncate">{row.team}</span>
                <span>{row.played}</span>
                <b>{row.points}</b>
              </div>
            ))
          )}
        </div>
      </div>
      <Link
        href={`/league/${league.slug}`}
        className="flex h-8 items-center px-3 text-[9px] font-bold text-[#f12c34]"
      >
        View fixtures <ArrowRight size={11} className="ml-1" />
      </Link>
    </Panel>
  );
}

function TopStories({ stories }: { stories: NewsArticle[] }) {
  return (
    <Panel className="h-[132px] p-3">
      <h2 className="mb-2 text-[11px] font-black uppercase text-[#ed242d]">
        Top stories
      </h2>
      {stories.length === 0 ? (
        <EmptyState>
          Latest published stories are currently unavailable.
        </EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stories.slice(0, 4).map((story) => (
            <Link
              key={story.id}
              href={story.isInternal ? story.link : `/news/${story.slug}`}
              className="grid min-w-0 grid-cols-[106px_1fr] gap-3 border-r border-white/10 pr-3 last:border-r-0 hover:text-[#f23a42]"
            >
              <img
                src={story.thumbnail}
                alt=""
                className="h-[64px] w-[106px] rounded-[3px] object-cover"
              />
              <span className="min-w-0">
                <small className="block truncate text-[8px] font-bold uppercase text-[#ed242d]">
                  {story.source}
                </small>
                <b className="mt-1 block line-clamp-2 text-[11px] leading-[1.25]">
                  {story.title}
                </b>
                <small className="mt-2 block text-[8px] text-[#777]">
                  {timeAgo(story.pubDate)}
                </small>
              </span>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}

function EdgePromo({ story }: { story?: NewsArticle }) {
  return (
    <Panel className="relative h-[132px] bg-black">
      <img
        src={story?.thumbnail || "/images/hero_player_celebration.png"}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-center px-7">
        <h2 className="text-[25px] font-black italic uppercase leading-none">
          <span className="text-white">Ball Mtaani</span>{" "}
          <span className="text-[#ed242d]">Edge</span>
        </h2>
        <p className="mt-2 max-w-[240px] text-[10px] text-[#ddd]">
          In-depth analysis. Bold takes. Real football talk.
        </p>
        <Link
          href={
            story?.isInternal
              ? story.link
              : story
                ? `/news/${story.slug}`
                : "/news"
          }
          className="mt-4 w-fit rounded-[3px] bg-[#d8212a] px-5 py-2 text-[10px] font-black uppercase text-white hover:bg-[#f02b34]"
        >
          Read latest
        </Link>
      </div>
    </Panel>
  );
}

export default function MatchesPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState(() => window.location.search);
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const tabParam = params.get("tab");
  const tab: Tab =
    tabParam === "live" || tabParam === "results" || tabParam === "tables"
      ? tabParam
      : "fixtures";
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(params.get("date") || "")
    ? params.get("date")!
    : eatDateKey();
  const leagueSlug = params.get("league") || "all";
  const selectedLeague =
    COMPETITIONS.find((league) => league.slug === leagueSlug) ||
    COMPETITIONS.find((league) => league.id === 39)!;

  const updateParams = (next: Record<string, string | null>) => {
    const updated = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) =>
      value ? updated.set(key, value) : updated.delete(key),
    );
    const query = updated.toString();
    setSearch(query ? `?${query}` : "");
    setLocation(`/matches${query ? `?${query}` : ""}`);
  };

  useEffect(() => {
    const syncSearch = () => setSearch(window.location.search);
    window.addEventListener("popstate", syncSearch);
    return () => window.removeEventListener("popstate", syncSearch);
  }, []);

  const { data: datedMatches = [], isLoading: fixturesLoading } = useQuery({
    queryKey: ["match-centre-date", selectedDate],
    queryFn: () => fetchFixturesByDate(selectedDate),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const { data: liveMatches = [] } = useMatches();
  const { data: recentMatches = [], isLoading: recentLoading } =
    useRecentMatches();
  const { data: standings = {}, isLoading: standingsLoading } = useStandings();
  const { data: scorers = [], isLoading: scorersLoading } = useQuery<Scorer[]>({
    queryKey: ["wc26-top-scorers"],
    queryFn: fetchWC26TopScorers,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const [stories, setStories] = useState<NewsArticle[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchPartnerArticles(),
      fetchFootballNews({ network: true, fallback: false }),
    ]).then(([partner, external]) => {
      if (!active) return;
      const unique = [...partner, ...external].filter(
        (article, index, all) =>
          all.findIndex(
            (item) => item.id === article.id || item.link === article.link,
          ) === index,
      );
      setStories(
        unique
          .sort(
            (a, b) =>
              new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
          )
          .slice(0, 5),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  const filterLeague = (matches: LiveMatch[]) =>
    leagueSlug === "all"
      ? matches
      : matches.filter((match) => match.leagueId === selectedLeague.id);
  const fixtureSource =
    tab === "live"
      ? liveMatches
      : tab === "results"
        ? recentMatches
        : datedMatches;
  const visibleFixtures = filterLeague(fixtureSource);
  const tableRows =
    standings[selectedLeague.officialName] ||
    standings[selectedLeague.shortName] ||
    [];
  const upcomingPool = datedMatches.length ? datedMatches : [];

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5]">
      <SEO
        title="Match Centre: Live Scores, Fixtures & Tables | BallMtaani"
        description="Live football scores, fixtures, standings and match data for Kenya's football fans."
      />
      <LeagueRail
        active={leagueSlug}
        onSelect={(league) =>
          updateParams({ league: league === "all" ? null : league })
        }
      />
      <main className="mx-auto max-w-[1500px] px-4 py-3 sm:px-5">
        <div className="grid gap-2 min-[1120px]:grid-cols-[minmax(0,1fr)_330px]">
          <Panel className="xl:h-[480px]">
            <div className="px-3 pt-2.5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h1 className="flex items-center gap-3 text-[18px] font-black uppercase">
                  Match centre{" "}
                  <span className="flex items-center gap-1 text-[9px] font-bold text-white">
                    <CircleDot
                      size={10}
                      className="fill-[#e31f29] text-[#e31f29]"
                    />{" "}
                    Live
                  </span>
                </h1>
                <div className="flex w-full items-center gap-1.5 sm:w-auto">
                  <label className="relative min-w-0 flex-1 sm:flex-none">
                    <span className="sr-only">League</span>
                    <select
                      value={leagueSlug}
                      onChange={(event) =>
                        updateParams({
                          league:
                            event.target.value === "all"
                              ? null
                              : event.target.value,
                        })
                      }
                      className="h-8 w-full appearance-none rounded-[4px] border border-white/20 bg-[#111] pl-3 pr-9 text-[11px] font-bold outline-none focus:border-[#d8212a] sm:w-auto"
                    >
                      <option value="all">All Leagues</option>
                      {COMPETITIONS.filter((league) => league.enabled).map(
                        (league) => (
                          <option key={league.id} value={league.slug}>
                            {league.officialName}
                          </option>
                        ),
                      )}
                    </select>
                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-3 top-2.5"
                    />
                  </label>
                  <span className="grid h-8 place-items-center rounded-[4px] bg-[#d8212a] px-5 text-[12px] font-black">
                    EAT
                  </span>
                </div>
              </div>
              <div className="mb-2 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {(["fixtures", "live", "results", "tables"] as Tab[]).map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() =>
                        updateParams({ tab: item === "fixtures" ? null : item })
                      }
                      className={`rounded-[3px] px-4 py-1.5 text-[10px] font-black uppercase ${tab === item ? "bg-[#d8212a] text-white" : "bg-white/[0.04] text-[#aaa] hover:text-white"}`}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
              <DateNavigator
                selected={selectedDate}
                onSelect={(date) =>
                  updateParams({ date: date === eatDateKey() ? null : date })
                }
              />
              <p className="my-1 text-right text-[8px] text-[#929292]">
                East Africa Time
              </p>
            </div>
            <div className="grid min-[850px]:grid-cols-[1.16fr_.84fr]">
              <FixtureTable
                matches={visibleFixtures}
                loading={tab === "results" ? recentLoading : fixturesLoading}
              />
              <StandingsTable
                league={selectedLeague}
                rows={tableRows}
                loading={standingsLoading}
              />
            </div>
          </Panel>
          <aside>
            <LiveNow matches={liveMatches} />
            <TopScorers scorers={scorers} loading={scorersLoading} />
          </aside>
        </div>

        <section
          aria-label="Major league snapshots"
          className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
        >
          {MAIN_LEAGUES.map((id) => {
            const league = COMPETITIONS.find((item) => item.id === id)!;
            const rows =
              standings[league.officialName] ||
              standings[league.shortName] ||
              [];
            return (
              <LeagueSnapshot
                key={id}
                league={league}
                fixtures={upcomingPool.filter((match) => match.leagueId === id)}
                standings={rows}
              />
            );
          })}
        </section>

        <section className="mt-2 grid h-[132px] gap-2 min-[960px]:grid-cols-[minmax(0,2.35fr)_minmax(310px,1fr)]">
          <TopStories stories={stories} />
          <EdgePromo story={stories[0]} />
        </section>
      </main>
    </div>
  );
}
