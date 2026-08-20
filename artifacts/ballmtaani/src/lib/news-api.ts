/**
 * Football News Feed
 * Uses RSS XML through a lightweight CORS proxy.
 * Falls back to an empty list when the API is unavailable so the UI never
 * invents stories.
 * Partner articles from Supabase are fetched separately and surfaced first.
 */
import { supabase } from "./supabase";

export interface NewsArticle {
  id: string;
  slug?: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceLogo: string;
  thumbnail: string;
  imageQuality: "feed" | "team-fallback" | "competition-fallback" | "generic-fallback";
  description?: string;
  isInternal?: boolean;
  isWC26?: boolean;
}

const RSS_FEEDS = [
  {
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
    source: "BBC Sport",
    sourceLogo: "BBC",
  },
  {
    url: "https://www.goal.com/feeds/en/news",
    source: "Goal.com",
    sourceLogo: "GOAL",
  },
  {
    url: "https://www.api-football.com/news/",
    source: "API-Football",
    sourceLogo: "API",
  },
];
const SOURCE_FALLBACK_URLS: Record<string, string> = {
  "BBC Sport": "https://www.bbc.com/sport/football",
  "Goal.com": "https://www.goal.com/en/news",
  "API-Football": "https://www.api-football.com/news/",
  KPL: "https://www.kpl.co.ke/",
  CAF: "https://www.cafonline.com/",
  SuperSport: "https://supersport.com/football",
  "Azam TV": "https://www.azamtv.co.tz/",
  FIFA: "https://www.fifa.com/",
};

const CACHE_KEY = "mtaani_news_cache";
const CACHE_TTL = 15 * 60 * 1000;
const CACHE_VERSION = "v10";
const DEFAULT_NEWS_IMAGE = "https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/Football_culture_stadium.jpeg";
const TEAM_IMAGE_FALLBACKS: Array<{ key: string; image: string }> = [
  { key: "arsenal", image: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png" },
  { key: "chelsea", image: "https://a.espncdn.com/i/teamlogos/soccer/500/363.png" },
  { key: "man city", image: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png" },
  { key: "manchester city", image: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png" },
  { key: "liverpool", image: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png" },
  { key: "man utd", image: "https://a.espncdn.com/i/teamlogos/soccer/500/360.png" },
  { key: "manchester united", image: "https://a.espncdn.com/i/teamlogos/soccer/500/360.png" },
  { key: "tottenham", image: "https://a.espncdn.com/i/teamlogos/soccer/500/367.png" },
  { key: "real madrid", image: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png" },
  { key: "barcelona", image: "https://a.espncdn.com/i/teamlogos/soccer/500/83.png" },
  { key: "psg", image: "https://a.espncdn.com/i/teamlogos/soccer/500/160.png" },
  { key: "bayern", image: "https://a.espncdn.com/i/teamlogos/soccer/500/132.png" },
  { key: "dortmund", image: "https://a.espncdn.com/i/teamlogos/soccer/500/124.png" },
  { key: "juventus", image: "https://a.espncdn.com/i/teamlogos/soccer/500/111.png" },
  { key: "ac milan", image: "https://a.espncdn.com/i/teamlogos/soccer/500/103.png" },
  { key: "inter", image: "https://a.espncdn.com/i/teamlogos/soccer/500/110.png" },
  { key: "gor mahia", image: "https://media.api-sports.io/football/teams/1063.png" },
  { key: "afc leopards", image: "https://media.api-sports.io/football/teams/1064.png" },
  { key: "simba", image: "https://media.api-sports.io/football/teams/1077.png" },
  { key: "al ahly", image: "https://media.api-sports.io/football/teams/1048.png" },
  { key: "kaizer chiefs", image: "https://media.api-sports.io/football/teams/1067.png" },
];
const COMPETITION_IMAGE_FALLBACKS: Array<{ key: string; image: string }> = [
  { key: "premier league", image: "https://media.api-sports.io/football/leagues/39.png" },
  { key: "champions league", image: "https://media.api-sports.io/football/leagues/2.png" },
  { key: "europa league", image: "https://media.api-sports.io/football/leagues/3.png" },
  { key: "la liga", image: "https://media.api-sports.io/football/leagues/140.png" },
  { key: "serie a", image: "https://media.api-sports.io/football/leagues/135.png" },
  { key: "bundesliga", image: "https://media.api-sports.io/football/leagues/78.png" },
  { key: "ligue 1", image: "https://media.api-sports.io/football/leagues/61.png" },
  { key: "afcon", image: "https://media.api-sports.io/football/leagues/12.png" },
  { key: "caf champions league", image: "https://media.api-sports.io/football/leagues/20.png" },
  { key: "fifa world cup", image: "https://media.api-sports.io/football/leagues/1.png" },
];

const TECHNICAL_NEWS_PATTERNS = [
  "widget",
  "widgets",
  "api-sports",
  "api football",
  "api-football",
  "how to get started",
  "how custom",
  "builder",
  "using data with",
  "using api-sports",
  "complete beginner",
  "technical",
  "integration",
  "setup",
];

interface ImageTelemetry {
  total: number;
  fallbackUsed: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days <= 30) return `${days}d ago`;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export { timeAgo };

function normalizeImageUrl(url?: string): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed;
}

function normalizeArticleLink(link: string | undefined, source: string): string {
  const raw = (link || "").trim();
  if (!raw || raw === "#") return SOURCE_FALLBACK_URLS[source] || "https://www.bbc.com/sport/football";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return `https://${raw.replace(/^\/+/, "")}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['".,!?()[\]{}]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shortHash(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).slice(0, 6);
}

export function createArticleSlug(article: Pick<NewsArticle, "title" | "source" | "link">): string {
  const base = slugify(`${article.source}-${article.title}`) || "football-story";
  return base;
}

function looksLikeImageUrl(url?: string): boolean {
  const value = normalizeImageUrl(url);
  if (!value) return false;
  if (!/^https?:\/\//i.test(value)) return false;
  return /(\.jpg|\.jpeg|\.png|\.webp|\.gif|\/image|\/images|\?format=|&format=|\/media\/)/i.test(value);
}

function extractImageFromHtml(html?: string): string {
  if (!html || typeof html !== "string") return "";
  const imgMatch = html.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
  if (!imgMatch?.[1]) return "";
  return normalizeImageUrl(imgMatch[1]);
}

function pickTeamImageFromTitle(title?: string): string {
  const normalized = (title || "").toLowerCase();
  if (!normalized) return "";

  for (const fallback of TEAM_IMAGE_FALLBACKS) {
    if (normalized.includes(fallback.key)) return fallback.image;
  }

  return "";
}

function pickCompetitionImageFromTitle(title?: string): string {
  const normalized = (title || "").toLowerCase();
  if (!normalized) return "";

  for (const fallback of COMPETITION_IMAGE_FALLBACKS) {
    if (normalized.includes(fallback.key)) return fallback.image;
  }

  return "";
}

export function isTechnicalFootballStory(article: Pick<NewsArticle, "title" | "description" | "source">): boolean {
  const text = `${article.title} ${article.description || ""}`.toLowerCase();
  return TECHNICAL_NEWS_PATTERNS.some((pattern) => text.includes(pattern));
}

function pickBestThumbnail(item: any, source: string): { thumbnail: string; quality: NewsArticle["imageQuality"] } {
  const sourceLower = source.toLowerCase();
  const bbcPriority = [
    item?.enclosure?.link,
    extractImageFromHtml(item?.content),
    item?.media?.content,
    item?.thumbnail,
    extractImageFromHtml(item?.description),
    item?.media?.thumbnail,
  ];
  const defaultPriority = [
    item?.enclosure?.link,
    item?.thumbnail,
    item?.media?.thumbnail,
    item?.media?.content,
    extractImageFromHtml(item?.content),
    extractImageFromHtml(item?.description),
  ];

  const candidates = (sourceLower.includes("bbc") ? bbcPriority : defaultPriority)
    .map((candidate) => normalizeImageUrl(candidate))
    .filter(Boolean);

  for (const candidate of candidates) {
    if (looksLikeImageUrl(candidate)) return { thumbnail: candidate, quality: "feed" };
  }

  const teamImage = pickTeamImageFromTitle(item?.title || item?.description);
  if (teamImage) return { thumbnail: teamImage, quality: "team-fallback" };

  const competitionImage = pickCompetitionImageFromTitle(item?.title || item?.description);
  if (competitionImage) return { thumbnail: competitionImage, quality: "competition-fallback" };

  return { thumbnail: DEFAULT_NEWS_IMAGE, quality: "generic-fallback" };
}

function getQualityRank(quality: NewsArticle["imageQuality"]): number {
  switch (quality) {
    case "feed":
      return 0;
    case "team-fallback":
      return 1;
    case "competition-fallback":
      return 2;
    default:
      return 3;
  }
}

function logImageTelemetry(statsBySource: Record<string, ImageTelemetry>) {
  if (!import.meta.env.DEV || import.meta.env.VITE_NEWS_DEBUG !== "true") return;

  const rows = Object.entries(statsBySource).map(([source, stats]) => {
    const fallbackRate = stats.total > 0 ? Math.round((stats.fallbackUsed / stats.total) * 100) : 0;
    return {
      source,
      total: stats.total,
      fallbackUsed: stats.fallbackUsed,
      fallbackRate: `${fallbackRate}%`,
    };
  });

  console.table(rows);
}

function textFromNode(node: Element, tag: string): string {
  const value = node.querySelector(tag)?.textContent || "";
  return value.trim();
}

function parseRssItems(xmlText: string): any[] {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");
  const parseError = xml.querySelector("parsererror");
  if (parseError) return [];

  return Array.from(xml.querySelectorAll("item")).map((item) => {
    const mediaThumb = item.querySelector("media\\:thumbnail")?.getAttribute("url") || "";
    const mediaContent = item.querySelector("media\\:content")?.getAttribute("url") || "";
    const enclosureLink = item.querySelector("enclosure")?.getAttribute("url") || "";

    return {
      guid: textFromNode(item, "guid") || textFromNode(item, "link"),
      title: textFromNode(item, "title"),
      link: textFromNode(item, "link"),
      pubDate: textFromNode(item, "pubDate"),
      description: textFromNode(item, "description"),
      content: textFromNode(item, "content\\:encoded"),
      thumbnail: mediaThumb,
      enclosure: { link: enclosureLink },
      media: { thumbnail: mediaThumb, content: mediaContent },
    };
  });
}

function mapFeedItems(items: any[], feed: (typeof RSS_FEEDS)[number], sourceImageStats: Record<string, ImageTelemetry>, articles: NewsArticle[]) {
  for (const item of items) {
    const resolvedImage = pickBestThumbnail(item, feed.source);
    const thumbnail = resolvedImage.thumbnail;
    sourceImageStats[feed.source].total += 1;
    if (resolvedImage.quality === "generic-fallback") {
      sourceImageStats[feed.source].fallbackUsed += 1;
    }

    articles.push({
      id: item.guid || item.link,
      slug: createArticleSlug({ title: item.title, source: feed.source, link: item.link }),
      title: item.title,
      link: normalizeArticleLink(item.link, feed.source),
      pubDate: item.pubDate,
      source: feed.source,
      sourceLogo: feed.sourceLogo,
      thumbnail,
      imageQuality: resolvedImage.quality,
      description: item.description || item.content || "",
      isWC26: !!item.isWC26,
    });
  }
}

async function fetchFeedItems(feed: (typeof RSS_FEEDS)[number]): Promise<any[]> {
  // Client should rely on the same-origin `/api/news` endpoint in production.
  // Keep this path as an explicit no-op fallback to avoid external proxy dependencies.
  return [];
}

async function fetchServerNewsItems(): Promise<any[]> {
  try {
    const res = await fetch("/api/news");
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.articles) ? data.articles : [];
  } catch {
    return [];
  }
}

function dedupeArticles(list: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return list.filter((article) => {
    // Same story can arrive from multiple feeds; link is the stable identity
    // (id falls back to link anyway when the feed has no guid).
    const key = article.link && article.link !== "#" ? article.link : String(article.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchFootballNews(options: { network?: boolean; fallback?: boolean } = {}): Promise<NewsArticle[]> {
  const network = options.network ?? true;
  const fallback = options.fallback ?? true;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp, version } = JSON.parse(cached);
      if (version === CACHE_VERSION && Date.now() - timestamp < CACHE_TTL) {
        return dedupeArticles((data as NewsArticle[])
          .map((article) => ({
          ...article,
          slug: createArticleSlug(article),
          link: normalizeArticleLink(article.link, article.source),
          imageQuality: article.imageQuality || "generic-fallback",
          description: article.description || "",
        }))
          .filter((article) => !isTechnicalFootballStory(article)));
      }
    }
  } catch {
    // Ignore cache errors.
  }

  const articles: NewsArticle[] = [];
  const sourceImageStats: Record<string, ImageTelemetry> = {};

  if (network) {
    const serverItems = await fetchServerNewsItems();
    if (serverItems.length > 0) {
      for (const feed of RSS_FEEDS) {
        sourceImageStats[feed.source] = { total: 0, fallbackUsed: 0 };
        const feedItems = serverItems.filter((item) => item.source === feed.source);
        if (feedItems.length > 0) mapFeedItems(feedItems, feed, sourceImageStats, articles);
      }
    }

    for (const feed of RSS_FEEDS) {
      if (articles.some((article) => article.source === feed.source)) continue;
      sourceImageStats[feed.source] = { total: 0, fallbackUsed: 0 };
      const items = await fetchFeedItems(feed);
      if (items.length > 0) {
        mapFeedItems(items, feed, sourceImageStats, articles);
      }
    }
  }

  if (articles.length === 0) return [];

  const normalized = dedupeArticles(articles.map((article) => ({
    ...article,
    slug: createArticleSlug(article),
    link: normalizeArticleLink(article.link, article.source),
    description: article.description || "",
  })).filter((article) => !isTechnicalFootballStory(article)));

  const result = normalized.sort((a, b) => {
    const qualityDiff = getQualityRank(a.imageQuality) - getQualityRank(b.imageQuality);
    if (qualityDiff !== 0) return qualityDiff;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });
  logImageTelemetry(sourceImageStats);

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: result, timestamp: Date.now(), version: CACHE_VERSION }));
  } catch {
    // Ignore storage errors.
  }

  return result;
}

export async function fetchPartnerArticles(): Promise<NewsArticle[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("id, slug, title, excerpt, thumbnail_url, author_name, partner_team_name, is_wc26, published_at, created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(12);
    if (error || !data) return [];
    return data.map((a: any) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      link: `/article/${a.slug}`,
      pubDate: a.published_at || a.created_at,
      source: a.partner_team_name || "BallMtaani",
      sourceLogo: "PARTNER",
      thumbnail: a.thumbnail_url || DEFAULT_NEWS_IMAGE,
      imageQuality: "feed" as const,
      description: a.excerpt || "",
      isInternal: true,
      isWC26: !!a.is_wc26,
    }));
  } catch {
    return [];
  }
}
