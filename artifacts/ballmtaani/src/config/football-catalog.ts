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
  profile?: LeagueProfile;
}

export interface LeagueProfile {
  founded: string;
  history: string;
  roots: string;
  notablePlayers: string[];
  notableCoaches: string[];
  notableOwners: string[];
  stadia: string[];
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
    profile: {
      founded: "1992 (Premier League era)",
      history: "England's top division is one of the world's most-watched domestic competitions, built on promotion, relegation and a global club culture.",
      roots: "England, United Kingdom",
      notablePlayers: ["Alan Shearer", "Thierry Henry", "Mohamed Salah"],
      notableCoaches: ["Sir Alex Ferguson", "Arsene Wenger", "Pep Guardiola"],
      notableOwners: ["Club ownership varies by team; see each club profile for current ownership."],
      stadia: ["Old Trafford, Manchester", "Anfield, Liverpool", "Emirates Stadium, London"],
    },
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
    profile: {
      founded: "1955",
      history: "UEFA's premier European club competition brings national league champions together for the continent's defining nights.",
      roots: "Europe, administered by UEFA",
      notablePlayers: ["Cristiano Ronaldo", "Lionel Messi", "Zinedine Zidane"],
      notableCoaches: ["Carlo Ancelotti", "Bob Paisley", "Jose Mourinho"],
      notableOwners: ["Participating clubs have different ownership structures; ownership is club-specific."],
      stadia: ["Wembley Stadium, London", "Santiago Bernabeu, Madrid", "San Siro, Milan"],
    },
  },
  {
    id: 276,
    officialName: "FKF Premier League",
    shortName: "FKF PL",
    slug: "fkf-premier-league",
    country: "Kenya",
    currentSeason: 2026,
    logo: "https://media.api-sports.io/football/leagues/276.png",
    priority: 3,
    enabled: true,
    type: "league",
    category: "kenyan",
    seoTitle: "FKF Premier League Live Scores & Table Kenya | BallMtaani",
    seoDescription: "Gor Mahia, AFC Leopards, Tusker FC and Kenyan football live scores, fixtures, standings and local reporting from Mtaa Daily.",
    kenyanDescription: "Homegrown Kenyan football. Tracking Gor Mahia, AFC Leopards, Tusker FC, KCB, and grassroot talent across local stadiums.",
    profile: {
      founded: "2010 (current FKF Premier League format)",
      history: "Kenya's top domestic division is the pathway for local clubs, academy talent and Harambee Stars selection.",
      roots: "Kenya",
      notablePlayers: ["Dennis Oliech", "Victor Wanyama", "Michael Olunga"],
      notableCoaches: ["Zedekiah Otieno", "Francis Kimanzi", "Engin Firat"],
      notableOwners: ["Clubs are supported by member associations, companies and community ownership models."],
      stadia: ["Nyayo National Stadium, Nairobi", "Kasarani Stadium, Nairobi", "Moi International Sports Centre, Kasarani"],
    },
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
    profile: {
      founded: "1929",
      history: "Spain's top flight is known for technical football, iconic rivalries and a deep club-to-community identity.",
      roots: "Spain",
      notablePlayers: ["Lionel Messi", "Xavi Hernandez", "Raul Gonzalez"],
      notableCoaches: ["Pep Guardiola", "Diego Simeone", "Vicente del Bosque"],
      notableOwners: ["Most clubs operate as member-owned sociedades deportivas; ownership differs by club."],
      stadia: ["Santiago Bernabeu, Madrid", "Camp Nou, Barcelona", "Metropolitano, Madrid"],
    },
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
    profile: {
      founded: "1898",
      history: "Italy's first division blends tactical tradition, historic city rivalries and some of Europe's most storied clubs.",
      roots: "Italy",
      notablePlayers: ["Paolo Maldini", "Francesco Totti", "Roberto Baggio"],
      notableCoaches: ["Arrigo Sacchi", "Marcello Lippi", "Jose Mourinho"],
      notableOwners: ["Ownership is club-specific, with Italian and international investment across the division."],
      stadia: ["San Siro, Milan", "Stadio Olimpico, Rome", "Allianz Stadium, Turin"],
    },
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
    profile: {
      founded: "1963",
      history: "Germany's top flight is built around strong club membership traditions, intense pressing football and matchday atmosphere.",
      roots: "Germany",
      notablePlayers: ["Franz Beckenbauer", "Gerd Muller", "Robert Lewandowski"],
      notableCoaches: ["Ottmar Hitzfeld", "Jurgen Klopp", "Jupp Heynckes"],
      notableOwners: ["The 50+1 rule generally gives club members voting control, with approved strategic investors."],
      stadia: ["Allianz Arena, Munich", "Signal Iduna Park, Dortmund", "Olympiastadion, Berlin"],
    },
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
    profile: {
      founded: "1932",
      history: "France's top division has evolved from a national competition into a major European talent pipeline and global broadcast product.",
      roots: "France",
      notablePlayers: ["Michel Platini", "Zinedine Zidane", "Kylian Mbappe"],
      notableCoaches: ["Arsene Wenger", "Raymond Domenech", "Didier Deschamps"],
      notableOwners: ["Ownership varies by club; Paris Saint-Germain is backed by Qatar Sports Investments."],
      stadia: ["Parc des Princes, Paris", "Velodrome, Marseille", "Groupama Stadium, Lyon"],
    },
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
    profile: {
      founded: "1964",
      history: "Africa's leading club championship connects domestic champions from across the continent in a demanding regional journey.",
      roots: "Africa, administered by CAF",
      notablePlayers: ["Aboutrika", "Didier Drogba", "Samuel Eto'o"],
      notableCoaches: ["Manuel Jose", "Pitso Mosimane", "Faouzi Benzarti"],
      notableOwners: ["Clubs are commonly member-led, community-backed or attached to institutions and companies."],
      stadia: ["Cairo International Stadium, Cairo", "Mohamed V Stadium, Casablanca", "Loftus Versfeld, Pretoria"],
    },
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
    profile: {
      founded: "2004",
      history: "CAF's second continental club competition gives more African leagues a route to regional competition and international attention.",
      roots: "Africa, administered by CAF",
      notablePlayers: ["Yacine Brahimi", "Walid Soliman", "Rainford Kalaba"],
      notableCoaches: ["Florent Ibenge", "Moine Chaabani", "Faouzi Benzarti"],
      notableOwners: ["Ownership and governance follow each club's national association or community structure."],
      stadia: ["Stade de l'Amitie, Cotonou", "Stade Mohammed V, Casablanca", "Benjamin Mkapa Stadium, Dar es Salaam"],
    },
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
