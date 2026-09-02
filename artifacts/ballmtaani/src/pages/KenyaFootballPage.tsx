import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  MapPin,
  Newspaper,
  Radio,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import SEO from "../components/SEO";
import {
  EMPTY_LOCAL_FOOTBALL_DESK,
  fetchLocalFootballDesk,
  type LocalFeedStatus,
  type PublishedLocalMatch,
} from "../lib/local-football";
import {
  fetchPartnerArticles,
  timeAgo,
  type NewsArticle,
} from "../lib/news-api";

type MatchFilter = "all" | "upcoming" | "results";

const KENYA_STORY_PATTERN =
  /kenya|kenyan|fkf|harambee|gor mahia|afc leopards|tusker|shabana|murang.?a|mathare|kariobangi|sofapaka|mtaa|grassroots|school games|academy|talent|county|pedeshee/i;

function publishedLabel(value: string | null) {
  if (!value) return "Waiting for the first publication";
  return `Updated ${new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  })} EAT`;
}

function matchDate(match: PublishedLocalMatch) {
  if (!match.scheduledDate) return "Date TBC";
  const parsed = new Date(`${match.scheduledDate}T12:00:00+03:00`);
  if (!Number.isFinite(parsed.getTime())) return match.scheduledDate;
  return parsed.toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function hasScore(match: PublishedLocalMatch) {
  return (
    ["live", "finished"].includes(match.status) &&
    match.homeScore !== null &&
    match.awayScore !== null
  );
}

function isUpcomingMatch(match: PublishedLocalMatch) {
  if (match.status === "live") return true;
  if (match.status !== "scheduled") return false;
  if (!match.scheduledDate) return true;
  const endOfMatchday = Date.parse(`${match.scheduledDate}T23:59:59+03:00`);
  return !Number.isFinite(endOfMatchday) || endOfMatchday >= Date.now();
}

function isAwaitingResult(match: PublishedLocalMatch) {
  return match.status === "scheduled" && !isUpcomingMatch(match);
}

function statusLabel(match: PublishedLocalMatch) {
  if (match.status === "live") return "Live";
  if (match.status === "finished") return "Full time";
  if (match.status === "postponed") return "Postponed";
  if (match.status === "cancelled") return "Cancelled";
  if (isAwaitingResult(match)) return "Result pending";
  return match.kickoffTime || "Time TBC";
}

function FeedEmpty({
  status,
  icon,
  emptyText,
}: {
  status: LocalFeedStatus;
  icon: ReactNode;
  emptyText: string;
}) {
  const unavailable = status === "unavailable";
  return (
    <div className="grid min-h-[210px] place-items-center px-8 text-center text-sm text-white/45">
      <div className="max-w-sm">
        {unavailable ? (
          <ShieldAlert className="mx-auto h-6 w-6 text-amber-400" />
        ) : (
          icon
        )}
        <p className="mt-3 leading-6">
          {unavailable
            ? "This feed is temporarily unavailable. Check back shortly for the verified update."
            : emptyText}
        </p>
      </div>
    </div>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 px-4 py-3 sm:px-5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#ef3038]/30 bg-[#ef3038]/10 text-[#ef3038]">
        {icon}
      </span>
      <span>
        <b className="block text-lg leading-none">{value}</b>
        <small className="mt-1 block text-[9px] font-bold uppercase text-white/40">
          {label}
        </small>
      </span>
    </div>
  );
}

function MatchRow({ match }: { match: PublishedLocalMatch }) {
  const scored = hasScore(match);
  return (
    <article className="grid grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[0.07] px-3 py-3 last:border-b-0 sm:grid-cols-[92px_minmax(0,1fr)_92px] sm:px-4">
      <span className="text-[10px] text-white/45">
        <b
          className={`block uppercase ${match.status === "live" ? "text-emerald-400" : "text-white/70"}`}
        >
          {statusLabel(match)}
        </b>
        <small className="mt-1 block text-[9px]">{matchDate(match)}</small>
      </span>
      <span className="min-w-0">
        <span className="grid grid-cols-[1fr_auto] gap-2">
          <b className="truncate text-xs sm:text-sm">{match.homeTeam}</b>
          {scored && <b>{match.homeScore}</b>}
        </span>
        <span className="mt-1 grid grid-cols-[1fr_auto] gap-2">
          <b className="truncate text-xs sm:text-sm">{match.awayTeam}</b>
          {scored && <b>{match.awayScore}</b>}
        </span>
        <small className="mt-1.5 block truncate text-[9px] text-white/35">
          {match.round || match.competition}
        </small>
      </span>
      <span className="text-right">
        {!scored && (
          <b className="text-[9px] uppercase text-[#ef3038]">
            {isAwaitingResult(match) ? "Awaiting result" : "Fixture"}
          </b>
        )}
        {match.homePenalties !== null && match.awayPenalties !== null && (
          <small className="block text-[9px] font-bold text-[#FFD000]">
            Pens {match.homePenalties}-{match.awayPenalties}
          </small>
        )}
        {match.venue && (
          <small className="mt-1 flex max-w-[92px] items-center justify-end gap-1 text-[9px] leading-3 text-white/35">
            <MapPin className="h-2.5 w-2.5 shrink-0" />{" "}
            <span className="line-clamp-2">{match.venue}</span>
          </small>
        )}
      </span>
    </article>
  );
}

function StoryLink({ article }: { article: NewsArticle }) {
  const body = (
    <article className="group grid h-full grid-rows-[132px_1fr] overflow-hidden rounded-md border border-white/10 bg-[#0d1013] transition hover:border-[#ef3038]/60">
      <div className="overflow-hidden bg-white/5">
        <img
          src={article.thumbnail || "/images/kenyan_fans.png"}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col p-3">
        <span className="text-[8px] font-black uppercase text-[#ef3038]">
          {article.source || "BallMtaani"}
        </span>
        <h3 className="mt-1 line-clamp-2 text-sm font-black leading-5">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-white/45">
          {article.description ||
            article.excerpt ||
            "Read the latest from Kenya's football community."}
        </p>
        <span className="mt-auto flex items-center justify-between pt-3 text-[9px] text-white/35">
          <span>{timeAgo(article.pubDate)}</span>
          <b className="flex items-center gap-1 uppercase text-white/70">
            Read story <ChevronRight className="h-3 w-3 text-[#ef3038]" />
          </b>
        </span>
      </div>
    </article>
  );
  return article.isInternal ? (
    <Link href={`/article/${article.slug}`} className="block h-full">
      {body}
    </Link>
  ) : (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full"
    >
      {body}
    </a>
  );
}

export default function KenyaFootballPage() {
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [competition, setCompetition] = useState("all");
  const [standingTable, setStandingTable] = useState(0);
  const [teamQuery, setTeamQuery] = useState("");
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [showAllMatches, setShowAllMatches] = useState(false);
  const { data = EMPTY_LOCAL_FOOTBALL_DESK, isLoading } = useQuery({
    queryKey: ["kenya-football-desk"],
    queryFn: fetchLocalFootballDesk,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const { data: articles = [] } = useQuery({
    queryKey: ["kenya-football-stories"],
    queryFn: fetchPartnerArticles,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const competitions = useMemo(
    () =>
      [
        ...new Set([
          ...data.matches.map((match) => match.competition),
          ...data.standings.map((row) => row.competition),
        ]),
      ].sort(),
    [data.matches, data.standings],
  );
  const visibleMatches = useMemo(
    () =>
      data.matches.filter((match) => {
        if (competition !== "all" && match.competition !== competition)
          return false;
        if (matchFilter === "upcoming") return isUpcomingMatch(match);
        if (matchFilter === "results") return match.status === "finished";
        return true;
      }),
    [competition, data.matches, matchFilter],
  );
  const displayedMatches = showAllMatches
    ? visibleMatches
    : visibleMatches.slice(0, 8);
  const tableCompetition =
    competition !== "all" ? competition : data.standings[0]?.competition;
  const visibleStandings = data.standings
    .filter((row) => row.competition === tableCompetition)
    .sort((a, b) => a.position - b.position);
  const standingTables = useMemo(() => {
    const occurrenceByPosition = new Map<number, number>();
    const tables: (typeof visibleStandings)[] = [];
    for (const row of visibleStandings) {
      const tableIndex = occurrenceByPosition.get(row.position) || 0;
      occurrenceByPosition.set(row.position, tableIndex + 1);
      (tables[tableIndex] ||= []).push(row);
    }
    return tables;
  }, [visibleStandings]);
  const activeStandingTable =
    standingTables[Math.min(standingTable, standingTables.length - 1)] || [];
  const visibleTeams = data.teams.filter((team) =>
    team.toLowerCase().includes(teamQuery.trim().toLowerCase()),
  );
  const displayedTeams =
    teamQuery.trim() || showAllTeams ? visibleTeams : visibleTeams.slice(0, 16);
  const localStories = articles
    .filter((article) =>
      KENYA_STORY_PATTERN.test(
        `${article.title} ${article.description || ""} ${article.source}`,
      ),
    )
    .slice(0, 4);
  const featuredMatch =
    data.matches.find((match) => match.status === "live") ||
    data.matches.find(isUpcomingMatch) ||
    data.matches.find((match) => match.status === "finished");
  const liveCount = data.matches.filter(
    (match) => match.status === "live",
  ).length;
  const upcomingCount = data.matches.filter(isUpcomingMatch).length;

  return (
    <main className="min-h-screen bg-[#050607] pb-20 text-white">
      <SEO
        title="Kenya Football Centre | Fixtures, Results, Tables & Rising Players"
        description="Follow verified Kenyan local football fixtures, results, standings, teams, player performances and reporting from the grassroots game."
        path="/kenya-football"
      />

      <header className="relative min-h-[360px] overflow-hidden border-b border-white/10">
        <img
          src="/images/kenyan_fans.png"
          alt="Kenyan football supporters on matchday"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-y-0 left-0 w-full bg-[#050607]/45 lg:w-2/3" />
        <div className="relative mx-auto flex min-h-[360px] max-w-[1380px] items-end px-4 py-8 sm:px-6 sm:py-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase">
              <span className="rounded-sm bg-[#d8212d] px-2 py-1">
                Mtaa football
              </span>
              <span className="flex items-center gap-1.5 text-white/65">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />{" "}
                Published local records
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-black uppercase leading-[0.95] sm:text-6xl">
              Kenya Football Centre
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
              The daily home of local fixtures, results, tables and the players
              making noise across Kenya. Follow the game from the mtaa pitch
              upward.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href="#fixtures"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-[#d8212d] px-5 text-xs font-black uppercase hover:bg-[#ef3038]"
              >
                <CalendarDays className="h-4 w-4" /> Follow matchday
              </a>
              <Link
                href="/talanta"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-white/25 bg-black/30 px-5 text-xs font-black uppercase hover:border-[#FFD000]/60"
              >
                <Sparkles className="h-4 w-4 text-[#FFD000]" /> Discover talent
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-white/10 bg-[#0b0d0f]">
        <div className="mx-auto grid max-w-[1380px] grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">
          <Metric
            icon={<Radio className="h-4 w-4" />}
            value={liveCount || "—"}
            label="Live now"
          />
          <Metric
            icon={<CalendarDays className="h-4 w-4" />}
            value={upcomingCount}
            label="Upcoming"
          />
          <Metric
            icon={<Users className="h-4 w-4" />}
            value={data.teams.length}
            label="Teams tracked"
          />
          <Metric
            icon={<Sparkles className="h-4 w-4" />}
            value={data.players.length}
            label="Players on radar"
          />
        </div>
      </div>

      <nav
        aria-label="Kenya football sections"
        className="sticky top-0 z-30 overflow-x-auto border-b border-white/10 bg-[#080a0c]/95 backdrop-blur"
      >
        <div className="mx-auto flex min-w-max max-w-[1380px] px-4 sm:px-6">
          {[
            ["Matchday", "#fixtures"],
            ["Standings", "#standings"],
            ["Talent radar", "#talent"],
            ["Teams", "#teams"],
            ["Local stories", "#stories"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="border-b-2 border-transparent px-4 py-3 text-[10px] font-black uppercase text-white/55 hover:border-[#ef3038] hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-[1380px] space-y-5 px-4 py-5 sm:px-6">
        <section
          aria-label="Competition selector"
          className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4"
        >
          <span className="mr-2 text-[9px] font-black uppercase text-white/35">
            Competition
          </span>
          {["all", ...competitions].map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={competition === name}
              onClick={() => {
                setCompetition(name);
                setStandingTable(0);
                setShowAllMatches(false);
              }}
              className={`h-9 rounded-md border px-3 text-[10px] font-black uppercase ${competition === name ? "border-[#d8212d] bg-[#d8212d] text-white" : "border-white/10 bg-[#0d1013] text-white/55 hover:border-white/25 hover:text-white"}`}
            >
              {name === "all" ? "All local football" : name}
            </button>
          ))}
        </section>

        {featuredMatch && (
          <section
            aria-label="Matchday focus"
            className="grid overflow-hidden rounded-md border border-[#d8212d]/35 bg-[#0d1013] lg:grid-cols-[220px_1fr_auto]"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-[#d8212d]/10 px-5 py-4 lg:border-b-0 lg:border-r">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-[#d8212d] text-white">
                <Flame className="h-5 w-5" />
              </span>
              <span>
                <small className="text-[9px] font-black uppercase text-[#ef3038]">
                  Matchday focus
                </small>
                <b className="mt-1 block text-xs">
                  {featuredMatch.competition}
                </b>
              </span>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-5 text-center">
              <b className="text-right text-sm sm:text-lg">
                {featuredMatch.homeTeam}
              </b>
              <span>
                {hasScore(featuredMatch) ? (
                  <b className="text-2xl">
                    {featuredMatch.homeScore} - {featuredMatch.awayScore}
                  </b>
                ) : (
                  <>
                    <b className="block text-lg">
                      {featuredMatch.kickoffTime || "TBC"}
                    </b>
                    <small className="text-[9px] text-white/45">
                      {matchDate(featuredMatch)}
                    </small>
                  </>
                )}
              </span>
              <b className="text-left text-sm sm:text-lg">
                {featuredMatch.awayTeam}
              </b>
            </div>
            <div className="flex items-center justify-between gap-5 border-t border-white/10 px-5 py-3 text-[9px] text-white/45 lg:border-l lg:border-t-0">
              <span>
                {featuredMatch.venue || featuredMatch.round || "Venue TBC"}
              </span>
              <a href="#fixtures" aria-label="Open matchday list">
                <ArrowRight className="h-4 w-4 text-[#ef3038]" />
              </a>
            </div>
          </section>
        )}

        {isLoading ? (
          <div className="grid min-h-[440px] place-items-center rounded-md border border-white/10 bg-[#0d1013]">
            <span className="flex items-center gap-3 text-sm text-white/50">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ef3038]" />{" "}
              Loading the local match centre...
            </span>
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(380px,.65fr)]">
            <section
              id="fixtures"
              className="overflow-hidden rounded-md border border-white/10 bg-[#0d1013]"
              aria-labelledby="kenya-fixtures-heading"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
                <div>
                  <p className="text-[8px] font-black uppercase text-[#ef3038]">
                    Match centre
                  </p>
                  <h2
                    id="kenya-fixtures-heading"
                    className="mt-1 text-lg font-black uppercase"
                  >
                    Fixtures &amp; results
                  </h2>
                </div>
                <div
                  className="flex rounded-md border border-white/10 bg-black/25 p-1"
                  role="group"
                  aria-label="Filter matches"
                >
                  {(["all", "upcoming", "results"] as MatchFilter[]).map(
                    (filter) => (
                      <button
                        key={filter}
                        type="button"
                        aria-pressed={matchFilter === filter}
                        onClick={() => {
                          setMatchFilter(filter);
                          setShowAllMatches(false);
                        }}
                        className={`h-8 rounded px-3 text-[9px] font-black uppercase ${matchFilter === filter ? "bg-[#d8212d] text-white" : "text-white/45 hover:text-white"}`}
                      >
                        {filter}
                      </button>
                    ),
                  )}
                </div>
              </div>
              {visibleMatches.length ? (
                <>
                  <div>
                    {displayedMatches.map((match) => (
                      <MatchRow key={match.id} match={match} />
                    ))}
                  </div>
                  {visibleMatches.length > 8 && (
                    <button
                      type="button"
                      onClick={() => setShowAllMatches((current) => !current)}
                      className="flex h-11 w-full items-center justify-center gap-1 border-t border-white/10 text-[9px] font-black uppercase text-[#ef3038] hover:bg-white/[0.03]"
                    >
                      {showAllMatches
                        ? "Show fewer matches"
                        : `View all ${visibleMatches.length} matches`}{" "}
                      <ChevronRight
                        className={`h-3 w-3 transition ${showAllMatches ? "rotate-90" : ""}`}
                      />
                    </button>
                  )}
                </>
              ) : (
                <FeedEmpty
                  status={data.matchStatus}
                  icon={<CalendarDays className="mx-auto h-6 w-6" />}
                  emptyText="No matches fit this competition and matchday filter yet."
                />
              )}
            </section>

            <section
              id="standings"
              className="overflow-hidden rounded-md border border-white/10 bg-[#0d1013]"
              aria-labelledby="kenya-table-heading"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                <div>
                  <p className="text-[8px] font-black uppercase text-[#FFD000]">
                    League position
                  </p>
                  <h2
                    id="kenya-table-heading"
                    className="mt-1 text-lg font-black uppercase"
                  >
                    Standings
                  </h2>
                </div>
                <Trophy className="h-5 w-5 text-[#FFD000]" />
              </div>
              {visibleStandings.length ? (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                    <span className="text-[10px] font-black uppercase text-white/55">
                      {tableCompetition}
                    </span>
                    {standingTables.length > 1 && (
                      <div
                        className="flex rounded-md border border-white/10 bg-black/25 p-1"
                        role="group"
                        aria-label="Published table sections"
                      >
                        {standingTables.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            aria-pressed={standingTable === index}
                            onClick={() => setStandingTable(index)}
                            className={`h-7 rounded px-2.5 text-[8px] font-black uppercase ${standingTable === index ? "bg-[#FFD000] text-black" : "text-white/45 hover:text-white"}`}
                          >
                            Table {index + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] text-left text-xs">
                      <caption className="sr-only">
                        {tableCompetition}
                        {standingTables.length > 1
                          ? `, published table ${standingTable + 1}`
                          : ""}
                      </caption>
                      <thead className="bg-white/[0.03] text-[9px] uppercase text-white/35">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-2 py-2">Team</th>
                          <th className="px-2 py-2 text-center">P</th>
                          <th className="px-2 py-2 text-center">W</th>
                          <th className="px-2 py-2 text-center">D</th>
                          <th className="px-2 py-2 text-center">L</th>
                          <th className="px-2 py-2 text-center">GD</th>
                          <th className="px-3 py-2 text-right">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeStandingTable.map((row) => (
                          <tr
                            key={row.id}
                            className="border-t border-white/[0.07]"
                          >
                            <td className="px-3 py-2.5 text-white/45">
                              {row.position}
                            </td>
                            <td className="max-w-[180px] truncate px-2 py-2.5 font-bold">
                              {row.team}
                            </td>
                            <td className="px-2 py-2.5 text-center text-white/60">
                              {row.played ?? "-"}
                            </td>
                            <td className="px-2 py-2.5 text-center text-white/60">
                              {row.won ?? "-"}
                            </td>
                            <td className="px-2 py-2.5 text-center text-white/60">
                              {row.drawn ?? "-"}
                            </td>
                            <td className="px-2 py-2.5 text-center text-white/60">
                              {row.lost ?? "-"}
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              {row.goalDifference !== null &&
                              row.goalDifference > 0
                                ? `+${row.goalDifference}`
                                : (row.goalDifference ?? "-")}
                            </td>
                            <td className="px-3 py-2.5 text-right font-black">
                              {row.points ?? "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3 text-[9px] text-white/35">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />{" "}
                      {standingTables.length > 1
                        ? `${standingTables.length} table sections in the latest source`
                        : "Latest published table"}
                    </span>
                    <span>{publishedLabel(data.lastPublishedAt)}</span>
                  </div>
                </div>
              ) : (
                <FeedEmpty
                  status={data.standingsStatus}
                  icon={<Trophy className="mx-auto h-6 w-6" />}
                  emptyText={
                    competition === "all"
                      ? "The next published local league table will appear here."
                      : `No published table is available for ${competition} yet.`
                  }
                />
              )}
            </section>
          </div>
        )}

        <section
          id="talent"
          className="overflow-hidden rounded-md border border-white/10 bg-[#0d1013]"
          aria-labelledby="performance-radar-heading"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
            <div>
              <p className="text-[8px] font-black uppercase text-[#FFD000]">
                From the match records
              </p>
              <h2
                id="performance-radar-heading"
                className="mt-1 text-lg font-black uppercase"
              >
                Players making noise
              </h2>
              <p className="mt-1 text-[10px] text-white/40">
                Goals and assists captured across published local matchdays.
              </p>
            </div>
            <Link
              href="/talanta"
              className="flex items-center gap-1 text-[9px] font-black uppercase text-[#ef3038]"
            >
              Open Talanta Mtaani <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.players.length ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-4">
              {data.players.slice(0, 8).map((player, index) => (
                <article
                  key={`${player.name}-${player.team}`}
                  className="flex min-h-32 items-center gap-3 border-b border-white/10 p-4 md:border-r xl:border-b-0"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#FFD000]/35 bg-[#FFD000]/10 text-sm font-black text-[#FFD000]">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-sm">{player.name}</b>
                    <small className="mt-1 block truncate text-[9px] text-white/40">
                      {player.team || player.competition}
                    </small>
                    <span className="mt-2 flex gap-3 text-[9px] uppercase">
                      <b>{player.goals} goals</b>
                      <b className="text-white/45">{player.assists} assists</b>
                    </span>
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <FeedEmpty
              status={data.eventsStatus}
              icon={<Sparkles className="mx-auto h-6 w-6" />}
              emptyText="Standout performers will appear after the next detailed match report."
            />
          )}
        </section>

        <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
          <section
            id="teams"
            className="overflow-hidden rounded-md border border-white/10 bg-[#0d1013]"
            aria-labelledby="teams-radar-heading"
          >
            <div className="border-b border-white/10 px-4 py-4 sm:px-5">
              <p className="text-[8px] font-black uppercase text-[#ef3038]">
                Club finder
              </p>
              <h2
                id="teams-radar-heading"
                className="mt-1 text-lg font-black uppercase"
              >
                Teams on the radar
              </h2>
              <label className="relative mt-3 block">
                <span className="sr-only">Search local teams</span>
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/35" />
                <input
                  value={teamQuery}
                  onChange={(event) => setTeamQuery(event.target.value)}
                  placeholder="Search teams"
                  className="h-9 w-full rounded-md border border-white/10 bg-black/25 pl-9 pr-3 text-xs outline-none focus:border-[#ef3038]/60"
                />
              </label>
            </div>
            {visibleTeams.length ? (
              <>
                <div className="grid grid-cols-2 gap-px bg-white/10">
                  {displayedTeams.map((team) => (
                    <div
                      key={team}
                      className="flex min-h-14 items-center gap-2 bg-[#0d1013] px-3 py-2 text-xs font-bold"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 text-[9px] text-white/45">
                        {team
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <span className="line-clamp-2">{team}</span>
                    </div>
                  ))}
                </div>
                {!teamQuery.trim() && visibleTeams.length > 16 && (
                  <button
                    type="button"
                    onClick={() => setShowAllTeams((current) => !current)}
                    className="flex h-11 w-full items-center justify-center gap-1 border-t border-white/10 text-[9px] font-black uppercase text-[#ef3038] hover:bg-white/[0.03]"
                  >
                    {showAllTeams
                      ? "Show fewer teams"
                      : `View all ${visibleTeams.length} teams`}{" "}
                    <ChevronRight
                      className={`h-3 w-3 transition ${showAllTeams ? "rotate-90" : ""}`}
                    />
                  </button>
                )}
              </>
            ) : (
              <FeedEmpty
                status={data.matchStatus}
                icon={<Users className="mx-auto h-6 w-6" />}
                emptyText={
                  teamQuery
                    ? "No team matches that search."
                    : "Teams will appear with published match records."
                }
              />
            )}
          </section>

          <section
            id="stories"
            className="py-1"
            aria-labelledby="local-stories-heading"
          >
            <div className="flex items-end justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-[8px] font-black uppercase text-[#ef3038]">
                  Beyond the score
                </p>
                <h2
                  id="local-stories-heading"
                  className="mt-1 text-lg font-black uppercase"
                >
                  Local football stories
                </h2>
              </div>
              <Link
                href="/news?section=kenya"
                className="flex items-center gap-1 text-[9px] font-black uppercase text-[#ef3038]"
              >
                All Kenya news <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {localStories.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {localStories.map((article) => (
                  <StoryLink key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="mt-4 flex min-h-44 flex-col items-center justify-center rounded-md border border-dashed border-white/15 px-6 text-center">
                <Newspaper className="h-6 w-6 text-white/30" />
                <p className="mt-3 text-sm text-white/45">
                  The next local report is being prepared.
                </p>
                <Link
                  href="/news?section=kenya"
                  className="mt-3 text-[9px] font-black uppercase text-[#ef3038]"
                >
                  Visit the Kenya news desk
                </Link>
              </div>
            )}
          </section>
        </div>

        <section
          className="relative overflow-hidden rounded-md border border-[#FFD000]/25 bg-[#11100a] px-5 py-6 sm:px-7"
          aria-labelledby="community-heading"
        >
          <div className="grid items-center gap-5 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[8px] font-black uppercase text-[#FFD000]">
                Your local game belongs here
              </p>
              <h2
                id="community-heading"
                className="mt-1 text-xl font-black uppercase"
              >
                Put a player, team or tournament on the radar
              </h2>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-white/50">
                Know someone making a difference in Kenyan football? Send the
                desk a nomination and help us follow the story.
              </p>
            </div>
            <Link
              href="/talanta"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#FFD000] px-5 text-xs font-black uppercase text-black hover:bg-[#f4c400]"
            >
              <Target className="h-4 w-4" /> Nominate local talent
            </Link>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[10px] leading-5 text-white/35">
          <p>
            Match performances come from published sources. Player profiles are
            reviewed separately before publication.
          </p>
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />{" "}
            {publishedLabel(data.lastPublishedAt)}
          </span>
        </footer>
      </div>
    </main>
  );
}
