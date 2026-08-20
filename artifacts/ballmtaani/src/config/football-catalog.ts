/**
 * BallMtaani Football Catalogue
 * Single source of truth for competitions, leagues, team slug resolution, and match slug parsing.
 */

export interface CompetitionConfig {
  id: number;
  officialName: string;
  shortName: string;
  slug: string;
  country: string;
  currentSeason: number;
  logo: string;
  priority: number;
  enabled: boolean;
  type: "league" | "cup" | "international";
  category: "most-followed" | "kenyan" | "european" | "african";
  seoTitle: string;
  seoDescription: string;
  kenyanDescription: string;
}

export const COMPETITIONS: CompetitionConfig[] = [
  {
    id: 39,
    officialName: "Premier League",
    shortName: "EPL",
    slug: "premier-league",
    country: "England",
    currentSeason: 2026,
    logo: "https://media.api-sports.io/football/leagues/39.png",
    priority: 1,
    enabled: true,
    type: "league",
    category: "most-followed",
    seoTitle: "Premier League Live Scores, Table & Fixtures Kenya | BallMtaani",
    seoDescription: "Follow Arsenal, Man United, Chelsea, Liverpool and Premier League matchday action with live scores, standings, predictions and Kenyan fan debates.",
    kenyanDescription: "The most watched league in Kenya. Follow matchday battles, title races, local fan club debates, and receipt-keeping prediction games.",
  },
  {
    id: 2,
    officialName: "UEFA Champions League",
    shortName: "UCL",
    slug: "champions-league",
    country: "Europe",
    currentSeason: 2026,
    logo: "https://media.api-sports.io/football/leagues/2.png",
    priority: 2,
    enabled: true,
    type: "cup",
    category: "most-followed",
    seoTitle: "UEFA Champions League Live Scores & Fixtures | BallMtaani Kenya",
    seoDescription: "Track UEFA Champions League European nights with live scores, group standings, knockout fixtures, Mchambuzi AI breakdowns and fan predictions.",
    kenyanDescription: "Tuesday and Wednesday football fever across Nairobi base spots. Live Champions League scores, tactical breakdowns, and prediction pools.",
  },
  {
    id: 326,
    officialName: "FKF Premier League",
    shortName: "FKF PL",
    slug: "fkf-premier-league",
    country: "Kenya",
    currentSeason: 2026,
    logo: "https://media.api-sports.io/football/leagues/326.png",
    priority: 3,
    enabled: true,
    type: "league",
    category: "kenyan",
    seoTitle: "FKF Premier League Live Scores & Table Kenya | BallMtaani",
    seoDescription: "Gor Mahia, AFC Leopards, Tusker FC and Kenyan football live scores, fixtures, standings and local reporting from Mtaa Daily.",
    kenyanDescription: "Homegrown Kenyan football. Tracking Gor Mahia, AFC Leopards, Tusker FC, KCB, and grassroot talent across local stadiums.",
  },
  {
    id: 140,
    officialName: "La Liga EA Sports",
    shortName: "La Liga",
    slug: "la-liga",
    country: "Spain",
    currentSeason: 2026,
    logo: "https://media.api-sports.io/football/leagues/140.png",
    priority: 4,
    enabled: true,
    type: "league",
    category: "european",
    seoTitle: "La Liga Live Scores, Table & Fixtures | BallMtaani Kenya",
    seoDescription: "Real Madrid, Barcelona, Atletico Madrid and La Liga live scores, standings, player stats and match previews for Kenyan supporters.",
    kenyanDescription: "El Clasico rivalry and Spanish football excellence. Live scores, team news, and fan arguments.",
  },
  {
    id: 135,
    officialName: "Serie A",
    shortName: "Serie A",
    slug: "serie-a",
    country: "Italy",
    currentSeason: 2026,
    logo: "https://media.api-sports.io/football/leagues/135.png",
    priority: 5,
    enabled: true,
    type: "league",
    category: "european",
    seoTitle: "Serie A Live Scores & Table | BallMtaani Kenya",
    seoDescription: "Inter Milan, AC Milan, Juventus and Serie A live scores, standings, tactical stats and predictions.",
    kenyanDescription: "Italian tactical battles and historic club rivalries followed live with local fan pulse analysis.",
  },
  {
    id: 78,
    officialName: "Bundesliga",
    shortName: "Bundesliga",
    slug: "bundesliga",
    country: "Germany",
    currentSeason: 2026,
    logo: "https://media.api-sports.io/football/leagues/78.png",
    priority: 6,
    enabled: true,
    type: "league",
    category: "european",
    seoTitle: "Bundesliga Live Scores & Standings | BallMtaani Kenya",
    seoDescription: "Bayern Munich, Borussia Dortmund, Bayer Leverkusen and German Bundesliga live scores, tables and goals.",
    kenyanDescription: "High-scoring German football, fan atmosphere, and title race updates.",
  },
  {
    id: 61,
    officialName: "Ligue 1 McDonald's",
    shortName: "Ligue 1",
    slug: "ligue-1",
    country: "France",
    currentSeason: 2026,
    logo: "https://media.api-sports.io/football/leagues/61.png",
    priority: 7,
    enabled: true,
    type: "league",
    category: "european",
    seoTitle: "Ligue 1 Live Scores & Table | BallMtaani Kenya",
    seoDescription: "PSG, Marseille, Monaco and Ligue 1 live scores, standings, fixtures and fan predictions.",
    kenyanDescription: "French top-flight action and superstar matchday coverage.",
  },
  {
    id: 12,
    officialName: "CAF Champions League",
    shortName: "CAF CL",
    slug: "caf-champions-league",
    country: "Africa",
    currentSeason: 2026,
    logo: "https://media.api-sports.io/football/leagues/12.png",
    priority: 8,
    enabled: true,
    type: "cup",
    category: "african",
    seoTitle: "CAF Champions League Live Scores & Fixtures | BallMtaani Kenya",
    seoDescription: "African club football's biggest stage. Live CAF Champions League scores, group tables and knockout match reports.",
    kenyanDescription: "Africa's premier club tournament tracking East African contenders and continental giants.",
  },
  {
    id: 20,
    officialName: "CAF Confederation Cup",
    shortName: "CAF Confed",
    slug: "caf-confederation-cup",
    country: "Africa",
    currentSeason: 2026,
    logo: "https://media.api-sports.io/football/leagues/20.png",
    priority: 9,
    enabled: true,
    type: "cup",
    category: "african",
    seoTitle: "CAF Confederation Cup Scores & Updates | BallMtaani Kenya",
    seoDescription: "CAF Confederation Cup live scores, group standings, fixtures and African team analysis.",
    kenyanDescription: "Continental battles featuring East African and regional club contenders.",
  },
  {
    id: 10,
    officialName: "Harambee Stars & International Fixtures",
    shortName: "Harambee Stars",
    slug: "harambee-stars",
    country: "Kenya / Africa",
    currentSeason: 2026,
    logo: "/logo.png",
    priority: 10,
    enabled: true,
    type: "international",
    category: "kenyan",
    seoTitle: "Harambee Stars Live Scores & AFCON Qualifiers | BallMtaani",
    seoDescription: "Follow Kenya's Harambee Stars live matches, AFCON qualifiers, friendlies and international football coverage.",
    kenyanDescription: "National pride. Following Harambee Stars across AFCON qualifiers, World Cup campaigns, and international friendlies.",
  },
];

/**
 * Helper: Convert text to clean, URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getLeagueBySlug(slug: string): CompetitionConfig | undefined {
  const cleanSlug = slugify(slug);
  return COMPETITIONS.find(c => c.slug === cleanSlug);
}

export function getLeagueById(id: number): CompetitionConfig | undefined {
  return COMPETITIONS.find(c => c.id === id);
}

/**
 * Generate stable club slug
 */
export function getTeamSlug(name: string): string {
  return slugify(name);
}

/**
 * Generate permanent match URL slug
 * Format: {homeTeam}-v-{awayTeam}-{date}-{fixtureId}
 * Example: arsenal-v-chelsea-2026-09-06-123456
 */
export function getMatchSlug(homeTeam: string, awayTeam: string, dateStr: string, fixtureId: number | string): string {
  const homeSlug = slugify(homeTeam);
  const awaySlug = slugify(awayTeam);
  const dateFormatted = dateStr.slice(0, 10);
  return `${homeSlug}-v-${awaySlug}-${dateFormatted}-${fixtureId}`;
}

/**
 * Parse match slug to extract fixture ID, teams, and date
 */
export function parseMatchSlug(matchSlug: string): { fixtureId?: number; homeSlug?: string; awaySlug?: string; date?: string } {
  const parts = matchSlug.split("-");
  const lastPart = parts[parts.length - 1];
  const fixtureId = parseInt(lastPart, 10);
  if (!isNaN(fixtureId)) {
    return { fixtureId };
  }
  return {};
}
