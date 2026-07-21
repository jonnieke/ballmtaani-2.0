export type HomepageMode = "pre-season" | "matchday" | "non-matchday";

export type HomepageMatch = {
  id: string | number;
  home: string;
  away: string;
  league?: string;
  leagueId?: number;
  kickoffAt?: number;
  timestamp?: number;
  status?: string;
  homeScore?: number;
  awayScore?: number;
  homeLogo?: string;
  awayLogo?: string;
  homeColor?: string;
  awayColor?: string;
  homeInitial?: string;
  awayInitial?: string;
  time?: string;
  date?: string;
  minute?: string;
};

export const PREMIER_LEAGUE_OPENING_KICKOFF = new Date("2026-08-21T19:00:00Z");

export const PREMIER_LEAGUE_OPENING_FIXTURES: HomepageMatch[] = [
  {
    id: "pl-2627-ars-cov", home: "Arsenal", away: "Coventry City",
    league: "Premier League", leagueId: 39,
    kickoffAt: new Date("2026-08-21T19:00:00Z").getTime(), time: "10:00 PM EAT",
    homeLogo: "https://media.api-sports.io/football/teams/42.png",
    awayLogo: "https://media.api-sports.io/football/teams/57.png",
    homeColor: "#EF0107", awayColor: "#59BFFF",
    homeInitial: "ARS", awayInitial: "COV",
  },
  {
    id: "pl-2627-hul-mun", home: "Hull City", away: "Manchester United",
    league: "Premier League", leagueId: 39,
    kickoffAt: new Date("2026-08-22T11:30:00Z").getTime(), time: "2:30 PM EAT",
    homeLogo: "https://media.api-sports.io/football/teams/322.png",
    awayLogo: "https://media.api-sports.io/football/teams/33.png",
    homeColor: "#F5A12D", awayColor: "#DA291C",
    homeInitial: "HUL", awayInitial: "MUN",
  },
  {
    id: "pl-2627-mci-bou", home: "Manchester City", away: "AFC Bournemouth",
    league: "Premier League", leagueId: 39,
    kickoffAt: new Date("2026-08-23T13:00:00Z").getTime(), time: "4:00 PM EAT",
    homeLogo: "https://media.api-sports.io/football/teams/50.png",
    awayLogo: "https://media.api-sports.io/football/teams/35.png",
    homeColor: "#6CABDD", awayColor: "#DA291C",
    homeInitial: "MCI", awayInitial: "BOU",
  },
  {
    id: "pl-2627-new-liv", home: "Newcastle United", away: "Liverpool",
    league: "Premier League", leagueId: 39,
    kickoffAt: new Date("2026-08-23T15:30:00Z").getTime(), time: "6:30 PM EAT",
    homeLogo: "https://media.api-sports.io/football/teams/34.png",
    awayLogo: "https://media.api-sports.io/football/teams/40.png",
    homeColor: "#241F20", awayColor: "#C8102E",
    homeInitial: "NEW", awayInitial: "LIV",
  },
];

export const LEAGUE_SHORTCUTS = [
  { name: "Premier League", label: "Premier League", href: "/matches?search=Premier%20League", accent: "#B30000" },
  { name: "UEFA Champions League", label: "Champions League", href: "/matches?search=Champions%20League", accent: "#4f7cff" },
  { name: "FKF Premier League", label: "FKF Premier League", href: "/matches?tab=africa", accent: "#22c55e" },
  { name: "La Liga", label: "La Liga", href: "/matches?search=La%20Liga", accent: "#f59e0b" },
  { name: "Serie A", label: "Serie A", href: "/matches?search=Serie%20A", accent: "#38bdf8" },
  { name: "Bundesliga", label: "Bundesliga", href: "/matches?search=Bundesliga", accent: "#ef4444" },
  { name: "Ligue 1", label: "Ligue 1", href: "/matches?search=Ligue%201", accent: "#a78bfa" },
  { name: "Harambee Stars", label: "Harambee Stars", href: "/matches?tab=africa", accent: "#16a34a" },
  { name: "CAF competitions", label: "CAF Competitions", href: "/matches?tab=africa", accent: "#f97316" },
] as const;

export const MODE_COPY: Record<HomepageMode, { eyebrow: string; summary: string; focus: string }> = {
  "pre-season": {
    eyebrow: "2026/27 pre-season",
    summary: "Transfers, friendlies, opening-weekend fixtures and the calls fans will have to defend all season.",
    focus: "Opening weekend is loading",
  },
  matchday: {
    eyebrow: "Matchday in Kenya",
    summary: "Live matches, fan pulse, predictions, table movement and the receipts that survive full time.",
    focus: "The matches are live",
  },
  "non-matchday": {
    eyebrow: "The football week",
    summary: "Upcoming fixtures, league tables, transfer stories, debates, trivia and leaderboard movement.",
    focus: "Next matchday starts here",
  },
};

function normalize(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function involvesClub(match: HomepageMatch, club?: string | null) {
  const target = normalize(club);
  if (!target || target === "none") return false;
  const home = normalize(match.home);
  const away = normalize(match.away);
  return home.includes(target) || target.includes(home) || away.includes(target) || target.includes(away);
}

function isPremierLeague(match: HomepageMatch) {
  return match.leagueId === 39 || normalize(match.league).includes("premier league");
}

function isMajorEuropean(match: HomepageMatch) {
  const majorIds = new Set([2, 3, 39, 61, 78, 135, 140]);
  const league = normalize(match.league);
  return majorIds.has(Number(match.leagueId)) || ["champions league", "europa league", "la liga", "serie a", "bundesliga", "ligue 1"].some((name) => league.includes(name));
}

function isKenyanPriority(match: HomepageMatch) {
  const haystack = normalize(String(match.league || "") + " " + match.home + " " + match.away);
  return ["fkf", "kenya premier league", "harambee stars", "kenya national"].some((name) => haystack.includes(name));
}

function kickoffTime(match: HomepageMatch) {
  return Number(match.kickoffAt || match.timestamp || Number.MAX_SAFE_INTEGER);
}

export function selectFeaturedMatch(options: {
  liveMatches: HomepageMatch[];
  upcomingFixtures: HomepageMatch[];
  recentMatches: HomepageMatch[];
  followedClub?: string | null;
}) {
  const liveMatches = [...options.liveMatches];
  const upcoming = [...options.upcomingFixtures].sort((a, b) => kickoffTime(a) - kickoffTime(b));
  const recent = [...options.recentMatches].sort((a, b) => kickoffTime(b) - kickoffTime(a));

  const candidates: Array<{ match?: HomepageMatch; reason: string }> = [
    { match: liveMatches.find((match) => involvesClub(match, options.followedClub)), reason: "Your club is live" },
    { match: liveMatches.find(isMajorEuropean) || liveMatches[0], reason: "Major match live" },
    { match: upcoming.find(isPremierLeague), reason: "Premier League next" },
    { match: upcoming.find(isMajorEuropean), reason: "European night ahead" },
    { match: upcoming.find(isKenyanPriority), reason: "Kenyan football spotlight" },
    { match: upcoming[0], reason: "Next fixture" },
    { match: recent[0], reason: "Latest result" },
  ];

  return candidates.find((candidate) => candidate.match) || { match: undefined, reason: "Season preview" };
}

function eatDayKey(value: Date | number) {
  return new Date(value).toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
}

export function getHomepageMode(options: {
  now?: Date;
  liveMatches: HomepageMatch[];
  todaysFixtures: HomepageMatch[];
}): HomepageMode {
  const now = options.now || new Date();
  if (options.liveMatches.length > 0) return "matchday";

  const today = eatDayKey(now);
  if (options.todaysFixtures.some((match) => {
    const kickoff = Number(match.kickoffAt || match.timestamp || 0);
    return kickoff > 0 && eatDayKey(kickoff) === today;
  })) return "matchday";

  if (now.getTime() < PREMIER_LEAGUE_OPENING_KICKOFF.getTime()) return "pre-season";
  return "non-matchday";
}

export function getCountdownParts(target: Date, now = new Date()) {
  const diff = Math.max(0, target.getTime() - now.getTime());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    complete: diff === 0,
  };
}
