import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleDot,
  Globe2,
  MessageCircle,
  Radio,
  Users,
} from "lucide-react";
import SEO from "../components/SEO";
import TeamLogo from "../components/TeamLogo";
import NewsCarousel from "../components/NewsCarousel";
import {
  useDebates,
  useMatches,
  useRecentMatches,
  useStandings,
  useUpcomingFixtures,
} from "../hooks/useData";
import {
  COMPETITIONS,
  type CompetitionConfig,
} from "../config/football-catalog";
import {
  fetchLeagueSeasonFixtures,
  fetchStandings,
  fetchTodaysFixtures,
  type StandingEntry,
} from "../lib/football-api";
import {
  fetchFootballNews,
  fetchPartnerArticles,
  timeAgo,
  type NewsArticle,
} from "../lib/news-api";
import type { HomepageMatch } from "../lib/home-season";
import { EMPTY_LOCAL_FOOTBALL_DESK, fetchLocalFootballDesk, type LocalFootballDesk } from "../lib/local-football";

const DEFAULT_IMAGE = "/images/hero_player_celebration.png";
const FANS_IMAGE = "/images/kenyan_fans.png";
const TOP_LEAGUE_IDS = [39, 140, 135, 78];
const LIVE_STATUSES = new Set(["1H", "2H", "HT", "ET", "P", "LIVE", "BT"]);

type HomeMatch = HomepageMatch & {
  leagueLogo?: string;
  venue?: string;
  kickoff?: string;
};

function articleCopy(article: NewsArticle) {
  return `${article.title} ${article.description || ""} ${article.source || ""}`.toLowerCase();
}
const NEWS_WIRE_PRIORITY_WINDOW_MS = 24 * 60 * 60 * 1000;
function isFreshBallMtaaniArticle(article: NewsArticle) {
  if (!article.isInternal || !article.pubDate) return false;
  const publishedAt = Date.parse(article.pubDate);
  if (!Number.isFinite(publishedAt)) return false;
  const age = Date.now() - publishedAt;
  return age >= 0 && age <= NEWS_WIRE_PRIORITY_WINDOW_MS;
}
function articleKey(article: NewsArticle) {
  return article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
function dedupeArticles(articles: NewsArticle[]) {
  const seen = new Set<string>();
  return articles
    .filter(
      (article) =>
        !/\b(politics|election|senate|parliament|war|tariff)\b/.test(
          articleCopy(article),
        ),
    )
    .filter((article) => {
      const key = articleKey(article);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      if (a.isInternal && !b.isInternal) return -1;
      if (!a.isInternal && b.isInternal) return 1;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });
}
function articleHref(article: NewsArticle) {
  return article.isInternal ? `/article/${article.slug}` : article.link;
}
function ArticleLink({
  article,
  className,
  children,
}: {
  article: NewsArticle;
  className?: string;
  children: ReactNode;
}) {
  return article.isInternal ? (
    <Link href={articleHref(article)} className={className}>
      {children}
    </Link>
  ) : (
    <a
      href={articleHref(article)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
function articleCategory(article: NewsArticle) {
  const copy = articleCopy(article);
  if (
    article.desk === "kenya" ||
    /kenya|fkf|harambee|gor mahia|afc leopards|tusker/.test(copy)
  )
    return "Kenyan football";
  if (/africa|caf|afcon/.test(copy)) return "Africa";
  if (/la liga|barcelona|real madrid/.test(copy)) return "La Liga";
  if (/serie a|inter milan|ac milan|juventus/.test(copy)) return "Serie A";
  if (/bundesliga|bayern|dortmund/.test(copy)) return "Bundesliga";
  if (/champions league|uefa/.test(copy)) return "Champions League";
  if (
    /premier league|arsenal|chelsea|liverpool|manchester|tottenham/.test(copy)
  )
    return "Premier League";
  if (/transfer/.test(copy)) return "Transfers";
  return article.source || "Football";
}
function shortTeam(name: string) {
  return String(name || "")
    .replace(/\s+(FC|SC|AFC)$/i, "")
    .trim();
}
function matchTime(match?: HomeMatch) {
  if (!match) return "TBC";
  if (match.time) return match.time.replace(/\s*EAT$/i, "");
  const value = match.kickoffAt || match.timestamp;
  if (!value) return "TBC";
  return new Date(value).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Nairobi",
  });
}
function matchDate(match?: HomeMatch) {
  if (!match) return "Schedule pending";
  if (match.date) return match.date;
  const value = match.kickoffAt || match.timestamp;
  return value
    ? new Date(value).toLocaleDateString("en-KE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "Africa/Nairobi",
      })
    : "Schedule pending";
}
function leagueCode(match: HomeMatch) {
  const competition = COMPETITIONS.find(
    (item) => item.id === Number(match.leagueId),
  );
  return (
    competition?.shortName ||
    match.league
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 6) ||
    "MATCH"
  );
}
function isLive(match: HomeMatch) {
  return (
    LIVE_STATUSES.has(String(match.status || "").toUpperCase()) ||
    Boolean(match.minute)
  );
}
function scoreText(match: HomeMatch) {
  return typeof match.homeScore === "number" &&
    typeof match.awayScore === "number"
    ? `${match.homeScore} - ${match.awayScore}`
    : "vs";
}
function Panel({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[5px] border border-white/15 bg-[#111] ${className}`}
    >
      {children}
    </section>
  );
}
function SectionHeader({
  title,
  href,
  action,
}: {
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 px-4">
      <h2 className="text-[15px] font-black uppercase text-[#f4f4f4]">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-[#ef3038] hover:text-white"
        >
          {action || "View all"}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function LeagueRail() {
  const railIds = [39, 140, 135, 78, 61, 2, 276, 12];
  const rail = railIds
    .map((id) => COMPETITIONS.find((item) => item.id === id))
    .filter(Boolean) as CompetitionConfig[];
  return (
    <nav
      aria-label="Popular competitions"
      className="border-b border-white/10 bg-[#111]"
    >
      <div className="mx-auto flex h-[58px] max-w-[1500px] overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/matches"
          className="flex h-full shrink-0 items-center gap-2 bg-[#d8212d] px-4 text-[11px] font-black uppercase"
        >
          <span className="grid grid-cols-3 gap-0.5" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => (
              <i key={index} className="h-1 w-1 bg-white" />
            ))}
          </span>
          All
        </Link>
        {rail.map((league) => (
          <Link
            key={league.id}
            href={`/leagues/${league.slug}`}
            className="flex h-full min-w-[128px] shrink-0 items-center gap-2.5 border-r border-white/10 px-4 hover:bg-white/[0.04]"
          >
            <img
              src={league.logo}
              alt=""
              className="h-7 w-7 object-contain"
              loading="eager"
            />
            <span className="min-w-0">
              <b className="block truncate text-[11px] uppercase text-white">
                {league.shortName}
              </b>
              <small className="block truncate text-[8px] text-white/48">
                {league.country}
              </small>
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function EdgeBanner({ match, image }: { match?: HomeMatch; image?: string }) {
  return (
    <Panel className="grid min-h-[130px] md:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative flex min-h-[130px] items-center overflow-hidden px-5 py-5 sm:px-8 sm:py-6">
        <img
          src={image || DEFAULT_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#190407] via-[#5c0911]/90 to-black/60" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">
                BALLMTAANI EDGE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Advanced football predictions.
            </h2>
            <p className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-[#FFD700] leading-snug">
              Powered by data. Driven by insight.
            </p>
          </div>
          <Link
            href="/edge"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-[#d8212d] hover:bg-red-700 px-5 text-[10px] font-black uppercase tracking-wider text-white transition-all shadow-md"
          >
            Explore Edge
          </Link>
        </div>
      </div>
      <div className="flex flex-col justify-center border-t border-white/10 px-5 py-4 md:border-l md:border-t-0">
        {match ? (
          <>
            <p className="text-[8px] text-white/45">
              {matchDate(match)} · {match.league || "Featured match"}
            </p>
            <p className="mt-1 truncate text-[13px] font-black">
              {shortTeam(match.home)} vs {shortTeam(match.away)}
            </p>
            <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-[3px] border border-white/10 bg-white/[0.04] text-center">
              <span className="py-2 text-[9px] text-white/55">
                HOME
                <b className="mt-0.5 block text-[12px] text-white">
                  {shortTeam(match.home).slice(0, 3).toUpperCase()}
                </b>
              </span>
              <span className="border-x border-white/10 py-2 text-[9px] text-white/55">
                KICKOFF
                <b className="mt-0.5 block text-[12px] text-white">
                  {matchTime(match)}
                </b>
              </span>
              <span className="py-2 text-[9px] text-white/55">
                AWAY
                <b className="mt-0.5 block text-[12px] text-white">
                  {shortTeam(match.away).slice(0, 3).toUpperCase()}
                </b>
              </span>
            </div>
            <Link
              href={`/edge/match/${match.id}`}
              className="mt-2 inline-flex items-center gap-1 text-[9px] font-black uppercase text-[#ef3038]"
            >
              View prediction <ArrowRight className="h-3 w-3" />
            </Link>
          </>
        ) : (
          <>
            <p className="text-[9px] font-black uppercase text-[#ef3038]">
              Today&apos;s featured Edge
            </p>
            <p className="mt-2 text-[12px] leading-5 text-white/65">
              No approved match prediction is available yet.
            </p>
            <Link
              href="/edge/today"
              className="mt-2 inline-flex items-center gap-1 text-[9px] font-black uppercase text-[#ef3038]"
            >
              Open Edge <ArrowRight className="h-3 w-3" />
            </Link>
          </>
        )}
      </div>
    </Panel>
  );
}

function FixtureRows({ matches }: { matches: HomeMatch[] }) {
  if (!matches.length)
    return (
      <div className="grid min-h-[210px] place-items-center px-6 text-center">
        <div>
          <CalendarDays className="mx-auto h-5 w-5 text-white/30" />
          <p className="mt-2 text-[11px] font-bold">
            No fixtures scheduled today.
          </p>
          <Link
            href="/matches?tab=fixtures"
            className="mt-2 inline-block text-[9px] font-black uppercase text-[#ef3038]"
          >
            View upcoming fixtures
          </Link>
        </div>
      </div>
    );
  return (
    <div className="divide-y divide-white/10 px-3">
      {matches.slice(0, 6).map((match) => (
        <Link
          key={String(match.id)}
          href={`/match/${match.id}`}
          className="grid min-h-[37px] grid-cols-[42px_50px_minmax(0,1fr)_18px_auto_18px_minmax(0,1fr)_auto] items-center gap-2 text-[9px] hover:bg-white/[0.025]"
        >
          <time className="font-bold tabular-nums text-white/82">
            {matchTime(match)}
          </time>
          <span className="truncate text-white/45">{leagueCode(match)}</span>
          <span className="truncate text-right font-bold">
            {shortTeam(match.home)}
          </span>
          <TeamLogo
            logo={match.homeLogo}
            initial={shortTeam(match.home).slice(0, 3).toUpperCase()}
            color={match.homeColor || "#333"}
            size="xs"
            className="!h-[18px] !w-[18px] !border-0 !p-0"
          />
          <span className="font-black text-white/45">{scoreText(match)}</span>
          <TeamLogo
            logo={match.awayLogo}
            initial={shortTeam(match.away).slice(0, 3).toUpperCase()}
            color={match.awayColor || "#333"}
            size="xs"
            className="!h-[18px] !w-[18px] !border-0 !p-0"
          />
          <span className="truncate font-bold">{shortTeam(match.away)}</span>
          {isLive(match) ? (
            <span className="rounded-[2px] bg-[#d8212d] px-1.5 py-1 text-[7px] font-black uppercase">
              Live
            </span>
          ) : (
            <span className="w-7" />
          )}
        </Link>
      ))}
    </div>
  );
}
function LiveRows({ matches }: { matches: HomeMatch[] }) {
  if (!matches.length)
    return (
      <div className="grid min-h-[210px] place-items-center px-5 text-center">
        <div>
          <Radio className="mx-auto h-5 w-5 text-white/30" />
          <p className="mt-2 text-[11px] font-bold">
            No matches live right now.
          </p>
          <Link
            href="/matches?tab=fixtures"
            className="mt-2 inline-block text-[9px] font-black uppercase text-[#ef3038]"
          >
            View today&apos;s fixtures
          </Link>
        </div>
      </div>
    );
  return (
    <div className="divide-y divide-white/10 px-3">
      {matches.slice(0, 3).map((match) => (
        <Link
          key={String(match.id)}
          href={`/live-center/${match.id}`}
          className="grid min-h-[69px] grid-cols-[36px_1fr_auto_1fr] items-center gap-2 text-[9px] hover:bg-white/[0.025]"
        >
          <span className="font-black text-[#65b631]">
            {match.minute || match.status || "LIVE"}
          </span>
          <span className="min-w-0 text-right">
            <small className="block truncate text-[8px] uppercase text-white/35">
              {leagueCode(match)}
            </small>
            <b className="block truncate text-[10px]">
              {shortTeam(match.home)}
            </b>
          </span>
          <strong className="text-[17px] tabular-nums">
            {scoreText(match)}
          </strong>
          <span className="truncate text-[10px] font-bold">
            {shortTeam(match.away)}
          </span>
        </Link>
      ))}
    </div>
  );
}

function StandingsTable({
  rows,
  compact = false,
}: {
  rows: StandingEntry[];
  compact?: boolean;
}) {
  if (!rows.length)
    return (
      <div
        className={`grid place-items-center px-5 text-center text-[10px] leading-4 text-white/45 ${compact ? "min-h-[132px]" : "min-h-[220px]"}`}
      >
        Standings will appear when the current league table is available.
      </div>
    );
  return (
    <div className="px-3">
      <div className="grid h-7 grid-cols-[18px_1fr_24px_28px_28px] items-center gap-1 border-y border-white/10 text-[7px] uppercase text-white/40">
        <span>#</span>
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">GD</span>
        <span className="text-center">Pts</span>
      </div>
      {rows.slice(0, 5).map((row, index) => (
        <div
          key={`${row.rank}-${row.team}`}
          className="relative grid min-h-[35px] grid-cols-[18px_1fr_24px_28px_28px] items-center gap-1 border-b border-white/[0.07] text-[9px]"
        >
          <i
            className={`absolute bottom-0 left-[-12px] top-0 w-0.5 ${index < 4 ? "bg-[#65b631]" : "bg-[#df1f2d]"}`}
          />
          <span className="tabular-nums text-white/60">{row.rank}</span>
          <span className="flex min-w-0 items-center gap-2">
            <img
              src={row.logo}
              alt=""
              className="h-[17px] w-[17px] shrink-0 object-contain"
              loading="lazy"
            />
            <b className="truncate">{row.team}</b>
          </span>
          <span className="text-center tabular-nums">{row.played}</span>
          <span className="text-center tabular-nums">{row.gd}</span>
          <strong className="text-center tabular-nums">{row.points}</strong>
        </div>
      ))}
    </div>
  );
}

function MatchCentre({
  fixtures,
  live,
  standings,
}: {
  fixtures: HomeMatch[];
  live: HomeMatch[];
  standings: StandingEntry[];
}) {
  return (
    <Panel className="grid min-[900px]:grid-cols-[minmax(0,2.25fr)_minmax(250px,0.95fr)]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between border-b border-white/15 px-4">
          <h2 className="py-3 text-[18px] font-black uppercase">
            Match centre
          </h2>
          <div className="flex h-10 items-center gap-1 text-[9px] font-black uppercase">
            <Link
              href="/matches?tab=fixtures"
              className="flex h-8 items-center bg-[#d8212d] px-4"
            >
              Today
            </Link>
            <Link
              href="/matches?tab=fixtures"
              className="flex h-8 items-center px-3 hover:text-[#ef3038]"
            >
              Tomorrow
            </Link>
            <Link
              href="/matches?tab=fixtures"
              className="hidden h-8 items-center px-3 sm:flex hover:text-[#ef3038]"
            >
              Weekend
            </Link>
            <Link
              href="/matches?tab=results"
              className="flex h-8 items-center px-3 hover:text-[#ef3038]"
            >
              Results
            </Link>
          </div>
          <Link
            href="/matches"
            className="hidden items-center gap-2 text-[9px] text-white/70 sm:flex"
          >
            All leagues <ChevronDown className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid md:grid-cols-[minmax(0,1.65fr)_minmax(220px,0.95fr)]">
          <div className="min-w-0 border-b border-white/10 md:border-b-0 md:border-r">
            <div className="flex h-9 items-center gap-2 border-b border-white/10 px-4">
              <CalendarDays className="h-4 w-4" />
              <h3 className="text-[10px] font-black uppercase">
                Today&apos;s fixtures
              </h3>
            </div>
            <FixtureRows matches={fixtures} />
            <Link
              href="/matches?tab=fixtures"
              className="flex h-8 items-center px-3 text-[8px] font-black uppercase text-[#ef3038]"
            >
              View all fixtures <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div>
            <div className="flex h-9 items-center gap-2 border-b border-white/10 px-4">
              <CircleDot className="h-3.5 w-3.5 fill-[#65b631] text-[#65b631]" />
              <h3 className="text-[10px] font-black uppercase">Live scores</h3>
            </div>
            <LiveRows matches={live} />
            <Link
              href="/matches?tab=live"
              className="flex h-8 items-center px-3 text-[8px] font-black uppercase text-[#ef3038]"
            >
              All live scores <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15 min-[900px]:border-l min-[900px]:border-t-0">
        <SectionHeader
          title="Premier League"
          href="/leagues/premier-league/table"
          action="View table"
        />
        <StandingsTable rows={standings} />
        <div className="flex h-9 items-center gap-5 px-4 text-[7px] font-bold uppercase text-white/55">
          <span>
            <i className="mr-1 inline-block h-2 w-2 bg-[#65b631]" />
            UCL
          </span>
          <span>
            <i className="mr-1 inline-block h-2 w-2 bg-[#1478cf]" />
            Europe
          </span>
          <span>
            <i className="mr-1 inline-block h-2 w-2 bg-[#df1f2d]" />
            Relegation
          </span>
        </div>
      </div>
    </Panel>
  );
}

function EditorialGrid({ articles }: { articles: NewsArticle[] }) {
  const [lead, ...supporting] = articles;
  if (!lead)
    return (
      <Panel className="grid min-h-[280px] place-items-center text-center">
        <div>
          <p className="text-sm font-black uppercase">
            Latest football stories
          </p>
          <p className="mt-2 text-[11px] text-white/45">
            The newsroom feed is refreshing.
          </p>
          <Link
            href="/news"
            className="mt-4 inline-flex bg-[#d8212d] px-4 py-2 text-[9px] font-black uppercase"
          >
            Open news
          </Link>
        </div>
      </Panel>
    );
  return (
    <section className="grid gap-2 min-[900px]:grid-cols-[1.55fr_1fr]">
      <ArticleLink
        article={lead}
        className="group relative min-h-[296px] overflow-hidden rounded-[5px] border border-white/15 bg-[#111]"
      >
        <img
          src={lead.thumbnail || DEFAULT_IMAGE}
          alt={lead.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          onError={(event) => {
            event.currentTarget.src = DEFAULT_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
        <div className="absolute inset-y-0 left-0 flex w-[68%] flex-col justify-center p-4 sm:w-[55%] sm:p-6">
          <span className="w-fit rounded-[2px] bg-[#d8212d] px-2 py-1 text-[8px] font-black uppercase">
            {articleCategory(lead)}
          </span>
          <h2 className="mt-4 text-[24px] font-black leading-[1.08] sm:text-[28px]">
            {lead.title}
          </h2>
          {lead.description && (
            <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-white/65">
              {lead.description}
            </p>
          )}
          <span className="mt-4 w-fit bg-[#d8212d] px-4 py-2 text-[9px] font-black uppercase">
            Read more
          </span>
        </div>
      </ArticleLink>
      <div className="grid gap-2 sm:grid-cols-3 min-[900px]:grid-cols-1">
        {supporting.slice(0, 3).map((article) => (
          <ArticleLink
            key={articleKey(article)}
            article={article}
            className="group relative min-h-[93px] overflow-hidden rounded-[5px] border border-white/15 bg-[#111]"
          >
            <img
              src={article.thumbnail || DEFAULT_IMAGE}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20" />
            <div className="relative flex h-full w-[72%] flex-col justify-center p-3">
              <span className="w-fit rounded-[2px] bg-[#d8212d] px-1.5 py-0.5 text-[7px] font-black uppercase">
                {articleCategory(article)}
              </span>
              <h3 className="mt-2 line-clamp-2 text-[13px] font-black leading-[1.15]">
                {article.title}
              </h3>
              <p className="mt-1 text-[8px] text-white/50">
                {timeAgo(article.pubDate)}
              </p>
            </div>
          </ArticleLink>
        ))}
      </div>
    </section>
  );
}

function LeagueSnapshot({
  league,
  rows,
  next,
}: {
  league: CompetitionConfig;
  rows: StandingEntry[];
  next?: HomeMatch;
}) {
  return (
    <Panel className="min-h-[235px]">
      <div className="flex h-11 items-center justify-between gap-2 border-b border-white/10 px-3">
        <span className="flex min-w-0 items-center gap-2">
          <img src={league.logo} alt="" className="h-6 w-6 object-contain" />
          <b className="truncate text-[10px] uppercase">{league.shortName}</b>
        </span>
        <Link
          href={`/leagues/${league.slug}/table`}
          className="shrink-0 text-[7px] font-black uppercase text-[#ef3038]"
        >
          View table <ArrowRight className="inline h-2.5 w-2.5" />
        </Link>
      </div>
      <StandingsTable rows={rows} compact />
      <div className="border-t border-white/10 px-3 py-2">
        <p className="text-[7px] font-bold uppercase text-white/35">Up next</p>
        {next ? (
          <Link
            href={`/match/${next.id}`}
            className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[9px]"
          >
            <span className="truncate font-bold">{shortTeam(next.home)}</span>
            <b className="text-white/35">vs</b>
            <span className="truncate text-right font-bold">
              {shortTeam(next.away)}
            </span>
            <small className="col-span-3 text-[8px] text-white/45">
              {matchDate(next)}, {matchTime(next)} EAT
            </small>
          </Link>
        ) : (
          <p className="mt-1 text-[9px] text-white/45">
            Next fixture unavailable
          </p>
        )}
      </div>
    </Panel>
  );
}
function CompactStories({ articles }: { articles: NewsArticle[] }) {
  if (!articles.length)
    return (
      <p className="p-4 text-[10px] leading-4 text-white/45">
        No current stories in this desk.
      </p>
    );
  return (
    <div className="divide-y divide-white/10 px-3">
      {articles.slice(0, 3).map((article) => (
        <ArticleLink
          key={articleKey(article)}
          article={article}
          className="grid min-h-[55px] grid-cols-[72px_1fr] items-center gap-3 py-2"
        >
          <img
            src={article.thumbnail || DEFAULT_IMAGE}
            alt=""
            className="h-[43px] w-[72px] object-cover"
            loading="lazy"
          />
          <span className="min-w-0">
            <b className="line-clamp-2 text-[10px] leading-[1.2]">
              {article.title}
            </b>
            <small className="mt-1 block text-[8px] text-white/40">
              {timeAgo(article.pubDate)}
            </small>
          </span>
        </ArticleLink>
      ))}
    </div>
  );
}

function KenyaDailyWidget({
  standings,
  fixtures,
  stories,
  loading,
  localDesk,
}: {
  standings: StandingEntry[];
  fixtures: HomeMatch[];
  stories: NewsArticle[];
  loading: boolean;
  localDesk: LocalFootballDesk;
}) {
  const completed = new Set(["FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO"]);
  const nextFixtures = fixtures
    .filter((match) => !completed.has(String(match.status || "").toUpperCase()))
    .sort((a, b) => (a.kickoffAt || a.timestamp || 0) - (b.kickoffAt || b.timestamp || 0))
    .slice(0, 5);
  const talentStories = stories.filter((article) => /player|star|academy|school|youth|talent|striker|midfielder|keeper/i.test(articleCopy(article))).slice(0, 2);

  return (
    <Panel className="min-[900px]:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#ef3038]">Daily local desk</p>
          <h2 id="kenya-football-daily-heading" className="mt-1 text-[17px] font-black uppercase">Kenya Football Daily</h2>
        </div>
        <div className="flex items-center gap-3 text-[8px] font-black uppercase">
          <span className="text-white/45">{localDesk.matches.length || localDesk.standings.length ? `Organizer data · Human verified${localDesk.lastPublishedAt ? ` · ${new Date(localDesk.lastPublishedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}` : ""}` : "FKF Premier League · Kenya Super League"}</span>
          <Link href="/kenya-football" className="text-[#ef3038]">Open Kenya data <ArrowRight className="inline h-3 w-3" /></Link>
        </div>
      </div>
      <div className="grid md:grid-cols-[1fr_1fr_1.15fr]">
        <div className="border-b border-white/10 p-3 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase">{localDesk.standings[0]?.competition || "FKF standings"}</h3>
            <Link href="/kenya-football#standings" className="text-[8px] font-black uppercase text-[#ef3038]">Full table</Link>
          </div>
          {localDesk.standings.length ? <div className="mt-2 space-y-1">
            {localDesk.standings.slice(0, 5).map((row) => (
              <div key={row.id} className="grid grid-cols-[18px_1fr_28px_32px] items-center gap-2 border-b border-white/[0.07] py-1.5 text-[9px]">
                <span className="text-white/45">{row.position}</span><span className="truncate font-bold">{row.team}</span><span className="text-center text-white/55">{row.played ?? "-"}</span><b className="text-right">{row.points ?? "-"}</b>
              </div>
            ))}
            <p className="pt-1 text-[7px] font-black uppercase text-emerald-400">Verified from organizer poster</p>
          </div> : loading ? <p className="py-8 text-center text-[10px] text-white/40">Loading verified table...</p> : standings.length ? (
            <div className="mt-2 space-y-1">
              {standings.slice(0, 5).map((row) => (
                <div key={`${row.rank}-${row.team}`} className="grid grid-cols-[18px_1fr_28px_32px] items-center gap-2 border-b border-white/[0.07] py-1.5 text-[9px]">
                  <span className="text-white/45">{row.rank}</span><span className="flex min-w-0 items-center gap-1.5 font-bold"><img src={row.logo} alt="" className="h-4 w-4 object-contain" /> <span className="truncate">{row.team}</span></span><span className="text-center text-white/55">{row.played}</span><b className="text-right">{row.points}</b>
                </div>
              ))}
            </div>
          ) : <p className="py-8 text-center text-[10px] leading-4 text-white/40">{localDesk.standingsStatus === "unavailable" ? "The local standings feed is temporarily unavailable." : "The verified table will appear after an organizer table is reviewed and published."}</p>}
        </div>
        <div className="border-b border-white/10 p-3 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between"><h3 className="text-[10px] font-black uppercase">Next local fixtures</h3><Link href="/kenya-football#fixtures" className="text-[8px] font-black uppercase text-[#ef3038]">All fixtures</Link></div>
          {localDesk.matches.length ? <div className="mt-2 divide-y divide-white/10">{localDesk.matches.slice(0, 5).map((match) => <div key={match.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2 text-[9px]"><span className="truncate font-bold">{shortTeam(match.homeTeam)}</span><span className="text-center text-white/40">{match.status === "finished" && match.homeScore !== null && match.awayScore !== null ? <b className="block text-white">{match.homeScore} - {match.awayScore}</b> : <><b className="block text-white">{match.kickoffTime || "TBC"}</b><small>{match.scheduledDate || match.round || "Fixture"}</small></>}</span><span className="truncate text-right font-bold">{shortTeam(match.awayTeam)}</span></div>)}</div>
          : loading ? <p className="py-8 text-center text-[10px] text-white/40">Loading local schedule...</p> : nextFixtures.length ? <div className="mt-2 divide-y divide-white/10">{nextFixtures.map((match) => <Link key={String(match.id)} href={`/match/${match.id}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2 text-[9px] hover:bg-white/[0.03]"><span className="truncate font-bold">{shortTeam(match.home)}</span><span className="text-center text-white/40"><b className="block text-white">{matchTime(match)}</b><small>{matchDate(match)}</small></span><span className="truncate text-right font-bold">{shortTeam(match.away)}</span></Link>)}</div> : <p className="py-8 text-center text-[10px] leading-4 text-white/40">No verified FKF or Kenya Super League fixtures are currently published.</p>}
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between"><h3 className="text-[10px] font-black uppercase">Local stories & talent watch</h3><Link href="/news?section=kenya" className="text-[8px] font-black uppercase text-[#ef3038]">More stories</Link></div>
          <div className="mt-2">{stories.slice(0, 4).map((article) => <ArticleLink key={articleKey(article)} article={article} className="grid grid-cols-[58px_1fr] gap-2 border-b border-white/10 py-2"><img src={article.thumbnail || DEFAULT_IMAGE} alt="" className="h-9 w-[58px] object-cover" loading="lazy" /><span className="min-w-0"><b className="line-clamp-2 text-[9px] leading-3">{article.title}</b><small className="mt-1 block text-[8px] text-white/40">{timeAgo(article.pubDate)}</small></span></ArticleLink>)}</div>
          {localDesk.players.length ? <p className="mt-2 text-[9px] leading-4 text-white/55"><span className="font-black uppercase text-[#FFD700]">Performance radar:</span> {localDesk.players.slice(0, 3).map((player) => `${player.name} (${player.goals} goal${player.goals === 1 ? "" : "s"})`).join(" · ")}</p> : talentStories.length ? <p className="mt-2 text-[9px] leading-4 text-white/55"><span className="font-black uppercase text-[#FFD700]">Talent watch:</span> {talentStories.map((story) => story.title).join(" · ")}</p> : <p className="mt-3 text-[9px] leading-4 text-white/40">Player, academy, school-games and small-league coverage will surface here as verified records arrive.</p>}
        </div>
      </div>
    </Panel>
  );
}

export default function HomePage() {
  const { data: live = [] } = useMatches();
  const { data: upcoming = [] } = useUpcomingFixtures();
  const { data: recent = [] } = useRecentMatches();
  const { data: standings = {} } = useStandings();
  const { data: debates = [] } = useDebates();
  const { data: kenyaDaily, isLoading: kenyaDailyLoading } = useQuery({
    queryKey: ["kenya-daily", 276, 277],
    queryFn: async () => {
      const [table, fkfFixtures, superLeagueFixtures, localDesk] = await Promise.all([
        fetchStandings(276),
        fetchLeagueSeasonFixtures(276, 2026),
        fetchLeagueSeasonFixtures(277, 2026),
        fetchLocalFootballDesk(),
      ]);
      return { table, fixtures: [...fkfFixtures, ...superLeagueFixtures] as HomeMatch[], localDesk };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const [today, setToday] = useState<HomeMatch[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetchTodaysFixtures(),
      fetchPartnerArticles(),
      fetchFootballNews(),
    ]).then(([fixtureResult, partnerResult, newsResult]) => {
      if (!active) return;
      if (fixtureResult.status === "fulfilled")
        setToday(fixtureResult.value as HomeMatch[]);
      const partner =
        partnerResult.status === "fulfilled" ? partnerResult.value : [];
      const wire = newsResult.status === "fulfilled" ? newsResult.value : [];
      const latest = dedupeArticles([...partner, ...wire])
        .sort((a, b) => {
          const aPriority = isFreshBallMtaaniArticle(a) ? 1 : 0;
          const bPriority = isFreshBallMtaaniArticle(b) ? 1 : 0;
          if (aPriority !== bPriority) return bPriority - aPriority;
          const aTime = Date.parse(a.pubDate || "") || 0;
          const bTime = Date.parse(b.pubDate || "") || 0;
          return bTime - aTime;
        })
        .slice(0, 6);
      setNews(latest);
    });
    return () => {
      active = false;
    };
  }, []);
  const liveMatches = live as HomeMatch[];
  const upcomingMatches = upcoming as HomeMatch[];
  const recentMatches = recent as HomeMatch[];
  const fixtures = useMemo(
    () => (today.length ? today : upcomingMatches).slice(0, 6),
    [today, upcomingMatches],
  );
  const featuredMatch = upcomingMatches[0] || liveMatches[0];
  const topLeagues = TOP_LEAGUE_IDS.map((id) =>
    COMPETITIONS.find((league) => league.id === id),
  ).filter(Boolean) as CompetitionConfig[];
  const rowsFor = (league: CompetitionConfig) =>
    (standings as Record<string, StandingEntry[]>)[league.officialName] ||
    (standings as Record<string, StandingEntry[]>)[league.shortName] ||
    [];
  const kenyaStories = news.filter(
    (article) => articleCategory(article) === "Kenyan football",
  );
  const editorialPicks = news
    .filter((article) => !kenyaStories.includes(article))
    .slice(4, 7);
  const fixtureCount = new Set(
    [...liveMatches, ...upcomingMatches, ...recentMatches].map((match) =>
      String(match.id),
    ),
  ).size;
  return (
    <div className="min-h-screen bg-[#050505] text-[#f4f4f4]">
      <SEO
        title="BallMtaani | Live Football Scores, Fixtures, Tables & Kenyan Football News"
        description="Kenya's football match centre for live scores, fixtures, league tables, data-backed predictions and current football reporting."
        path="/"
        canonicalUrl="/"
        image={news[0]?.thumbnail || DEFAULT_IMAGE}
      />
      <LeagueRail />
      <div className="mx-auto max-w-[1500px] space-y-3 px-4 py-3">
        <EdgeBanner match={featuredMatch} image={news[0]?.thumbnail} />
        <section aria-labelledby="kenya-football-daily-heading">
          <KenyaDailyWidget
            standings={kenyaDaily?.table || []}
            fixtures={kenyaDaily?.fixtures || []}
            stories={kenyaStories}
            loading={kenyaDailyLoading}
            localDesk={kenyaDaily?.localDesk || EMPTY_LOCAL_FOOTBALL_DESK}
          />
        </section>
        <NewsCarousel articles={news} />
        <MatchCentre
          fixtures={fixtures}
          live={liveMatches}
          standings={
            (standings as Record<string, StandingEntry[]>)["Premier League"] ||
            []
          }
        />
        <EditorialGrid articles={news.slice(0, 4)} />
        <section>
          <SectionHeader
            title="Top leagues"
            href="/leagues"
            action="View all leagues"
          />
            <div className="grid gap-2 sm:grid-cols-2 min-[900px]:grid-cols-4">
            {topLeagues.map((league) => (
              <LeagueSnapshot
                key={league.id}
                league={league}
                rows={rowsFor(league)}
                next={upcomingMatches.find(
                  (match) => Number(match.leagueId) === league.id,
                )}
              />
            ))}
          </div>
        </section>
          <section className="grid gap-2 min-[900px]:grid-cols-2">
          <Panel>
            <SectionHeader title="Editorial picks" href="/news" />
            <CompactStories articles={editorialPicks} />
          </Panel>
          <Panel className="relative min-h-[220px]">
            <img
              src={FANS_IMAGE}
              alt="Kenyan football supporters"
              className="absolute inset-0 h-full w-full object-cover opacity-45"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />
            <div className="relative flex h-full min-h-[220px] flex-col justify-center p-4">
              <Users className="h-5 w-5 text-[#ef3038]" />
              <h2 className="mt-3 text-[17px] font-black uppercase">
                Join the community
              </h2>
              <p className="mt-2 max-w-[190px] text-[11px] font-bold uppercase leading-4">
                Be part of the conversation
              </p>
              <p className="mt-2 max-w-[190px] text-[10px] leading-4 text-white/65">
                {debates[0]?.title ||
                  "Share your opinions, predict matches and connect with fans."}
              </p>
              <Link
                href="/fan-zones"
                className="mt-4 w-fit bg-[#d8212d] px-4 py-2 text-[9px] font-black uppercase"
              >
                Join now
              </Link>
            </div>
          </Panel>
        </section>
      </div>
      <footer className="mt-1 border-t border-white/15 bg-[#0b0b0b]">
        <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-5 sm:grid-cols-2 min-[900px]:grid-cols-[repeat(4,1fr)_1.3fr]">
          <div className="flex items-center gap-3">
            <Globe2 className="h-8 w-8 rounded-full border border-[#d8212d] p-1.5 text-white" />
            <span>
              <b className="block text-lg tabular-nums">
                {COMPETITIONS.filter((item) => item.enabled).length}
              </b>
              <small className="text-[8px] uppercase text-white/45">
                Verified competitions
              </small>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Radio className="h-8 w-8 rounded-full border border-[#d8212d] p-1.5 text-white" />
            <span>
              <b className="block text-lg tabular-nums">{liveMatches.length}</b>
              <small className="text-[8px] uppercase text-white/45">
                Matches live now
              </small>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 rounded-full border border-[#d8212d] p-1.5 text-white" />
            <span>
              <b className="block text-lg tabular-nums">{fixtureCount}</b>
              <small className="text-[8px] uppercase text-white/45">
                Fixtures loaded
              </small>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 rounded-full border border-[#d8212d] p-1.5 text-white" />
            <span>
              <b className="block text-lg tabular-nums">{debates.length}</b>
              <small className="text-[8px] uppercase text-white/45">
                Open debates
              </small>
            </span>
          </div>
          <div className="flex items-center gap-3 border-t border-white/10 pt-4 min-[900px]:border-l min-[900px]:border-t-0 min-[900px]:pl-5 min-[900px]:pt-0">
            <span className="text-[8px] font-black uppercase text-white/45">
              Stay connected
            </span>
            <a
              href="https://twitter.com/ballmtaani"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-[10px] font-black"
              aria-label="BallMtaani on X"
            >
              X
            </a>
            <a
              href="https://www.facebook.com/ballmtaani"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-[10px] font-black"
              aria-label="BallMtaani on Facebook"
            >
              f
            </a>
            <a
              href="https://www.instagram.com/ballmtaani"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-[10px] font-black"
              aria-label="BallMtaani on Instagram"
            >
              IG
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
