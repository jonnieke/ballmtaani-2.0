type FeedConfig = {
  url: string;
  source: string;
  sourceLogo: string;
  kind: "rss" | "html" | "fkf-api";
};

type RawArticle = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceLogo: string;
  description?: string;
  thumbnail?: string;
  desk?: "kenya" | "global";
  isOfficial?: boolean;
};

const FEEDS: FeedConfig[] = [
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport", sourceLogo: "BBC", kind: "rss" },
  { url: "https://www.goal.com/feeds/en/news", source: "Goal.com", sourceLogo: "GOAL", kind: "rss" },
  { url: "https://www.api-football.com/news/", source: "API-Football", sourceLogo: "API", kind: "html" },
  { url: "https://www.api-football.com/news/post/fifa-world-cup-2026-lineups-all-teams-coaches-and-players", source: "API-Football", sourceLogo: "API", kind: "html" },
  { url: "https://wmcfdzqntemdnrguqijw.supabase.co/rest/v1/news", source: "Football Kenya Federation", sourceLogo: "FKF", kind: "fkf-api" },
];

const SOURCE_FALLBACK_URLS: Record<string, string> = {
  "BBC Sport": "https://www.bbc.com/sport/football",
  "Goal.com": "https://www.goal.com/en/news",
  "API-Football": "https://www.api-football.com/news/",
  "Football Kenya Federation": "https://footballkenya.org/news",
};

const FKF_NEWS_FIELDS = "id,slug,title,excerpt,category,featured_image_url,published_at,created_at";

const FOOTBALL_KEYWORDS = [
  "football",
  "world cup",
  "fifa",
  "uefa",
  "champions league",
  "europa league",
  "premier league",
  "la liga",
  "serie a",
  "bundesliga",
  "ligue 1",
  "caf",
  "afcon",
  "lineups",
  "players",
  "coaches",
  "fixtures",
  "transfers",
  "stadiums",
  "venues",
  "qualifiers",
  "squads",
];

const TECHNICAL_PATTERNS = [
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

const LOW_QUALITY_TITLES = ["line ups", "coachs & players"];

const API_FOOTBALL_FALLBACKS: RawArticle[] = [];

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.end(JSON.stringify(body));
}

function decodeHtml(value: string): string {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function stripTags(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function normalizeUrl(url?: string, fallbackSource?: string): string {
  const raw = (url || "").trim();
  if (!raw || raw === "#") return fallbackSource ? SOURCE_FALLBACK_URLS[fallbackSource] || "https://www.api-football.com/news/" : "https://www.api-football.com/news/";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return `https://${raw.replace(/^\/+/, "")}`;
}

function isFootballRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return FOOTBALL_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function isFootballLibraryQuality(article: RawArticle): boolean {
  const title = article.title.trim().toLowerCase();
  const combined = `${article.title} ${article.description || ""}`.toLowerCase();
  if (!article.title.trim() || article.title.trim().length < 18) return false;
  if (LOW_QUALITY_TITLES.includes(title)) return false;
  if (TECHNICAL_PATTERNS.some((pattern) => combined.includes(pattern))) return false;
  return isFootballRelated(combined);
}

function extractFirstDate(text: string): string {
  const match = text.match(/\b([A-Z][a-z]+ \d{2}, \d{4})\b/);
  if (!match) return new Date().toISOString();
  const parsed = new Date(match[1]);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function parseRssItems(xml: string, feed: FeedConfig): RawArticle[] {
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return items
    .slice(0, 8)
    .map((item, idx) => {
      const title = stripTags((item.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim());
      const link = stripTags((item.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || "").trim());
      const pubDate = (item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] || "").trim();
      const description = stripTags((item.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] || "").trim());
      const thumbnail =
        item.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i)?.[1] ||
        item.match(/<media:content[^>]*url=["']([^"']+)["']/i)?.[1] ||
        item.match(/<enclosure[^>]*url=["']([^"']+)["']/i)?.[1] ||
        "";

      const combined = `${title} ${description}`.trim();
      if (!isFootballRelated(combined)) return null;

      return {
        id: `${feed.source}-${idx}-${title || link}`,
        title,
        link: normalizeUrl(link, feed.source),
        pubDate: pubDate || new Date().toISOString(),
        source: feed.source,
        sourceLogo: feed.sourceLogo,
        description,
        thumbnail,
      } satisfies RawArticle;
    })
    .filter((article): article is RawArticle => Boolean(article))
    .filter(isFootballLibraryQuality)
}

function parseHtmlArticles(html: string, feed: FeedConfig): RawArticle[] {
  const articles: RawArticle[] = [];
  const seen = new Set<string>();
  const linkMatches = [...html.matchAll(/<a[^>]+href=["']([^"']*\/news\/post\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];

  for (const match of linkMatches) {
    const href = normalizeUrl(match[1], feed.source);
    const title = stripTags(match[2]).replace(/\s+/g, " ").trim();
    if (!title || title.length < 18) continue;
    if (LOW_QUALITY_TITLES.includes(title.toLowerCase())) continue;
    if (/^read more$/i.test(title)) continue;
    if (seen.has(href)) continue;

    const lower = `${title} ${html.slice(Math.max(0, match.index || 0), Math.min(html.length, (match.index || 0) + 1200))}`.toLowerCase();
    if (!isFootballRelated(lower)) continue;

    const tail = html.slice(Math.max(0, (match.index || 0) + match[0].length), Math.min(html.length, (match.index || 0) + match[0].length + 1200));
    const snippet = stripTags(tail)
      .replace(/Read more.*$/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 220);
    const pubDate = extractFirstDate(tail);

    seen.add(href);
    const article = {
      id: href,
      title,
      link: href,
      pubDate,
      source: feed.source,
      sourceLogo: feed.sourceLogo,
      description: snippet,
    };
    if (isFootballLibraryQuality(article)) articles.push(article);
  }

  return articles;
}

async function fetchFkfNews(feed: FeedConfig): Promise<RawArticle[]> {
  const apiKey = process.env.FKF_NEWS_ANON_KEY || "";
  if (!apiKey) return [];

  const params = new URLSearchParams({
    select: FKF_NEWS_FIELDS,
    published: "eq.true",
    order: "published_at.desc.nullslast,created_at.desc",
    limit: "12",
  });
  const response = await fetch(`${feed.url}?${params.toString()}`, {
    headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) return [];

  const rows = await response.json();
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row: any) => {
      const slug = String(row.slug || "").trim();
      const title = stripTags(String(row.title || ""));
      if (!slug || title.length < 18) return null;
      return {
        id: `fkf-${row.id || slug}`,
        title,
        link: `https://footballkenya.org/news/${encodeURIComponent(slug)}`,
        pubDate: row.published_at || row.created_at || new Date().toISOString(),
        source: feed.source,
        sourceLogo: feed.sourceLogo,
        description: stripTags(String(row.excerpt || "")),
        thumbnail: normalizeUrl(String(row.featured_image_url || ""), feed.source),
        desk: "kenya" as const,
        isOfficial: true,
      } satisfies RawArticle;
    })
    .filter((article): article is RawArticle => Boolean(article));
}

function removeDuplicates(articles: RawArticle[]): RawArticle[] {
  const seenTitles = new Set<string>();
  const seenLinks = new Set<string>();
  const result: RawArticle[] = [];
  for (const article of articles) {
    const title = article.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const link = article.link.trim().toLowerCase();
    if ((title && seenTitles.has(title)) || seenLinks.has(link)) continue;
    if (title) seenTitles.add(title);
    seenLinks.add(link);
    result.push(article);
  }
  return result;
}

function mergeFallbacks(articles: RawArticle[]): RawArticle[] {
  const cleanArticles = articles.filter(isFootballLibraryQuality);
  const seen = new Set(cleanArticles.map((article) => `${article.title.toLowerCase()}|${article.link}`));
  const merged = [...cleanArticles];
  for (const fallback of API_FOOTBALL_FALLBACKS) {
    const key = `${fallback.title.toLowerCase()}|${fallback.link}`;
    if (seen.has(key)) continue;
    merged.push(fallback);
    seen.add(key);
  }
  return merged;
}

async function fetchFeed(feed: FeedConfig): Promise<RawArticle[]> {
  try {
    if (feed.kind === "fkf-api") return fetchFkfNews(feed);
    const response = await fetch(feed.url, {
      headers: {
        "User-Agent": "BallMtaani-News/1.0",
        Accept: feed.kind === "html" ? "text/html,application/xhtml+xml" : "application/xml,text/xml,*/*;q=0.8",
      },
    });
    if (!response.ok) return [];

    const body = await response.text();
    if (feed.kind === "rss") return parseRssItems(body, feed);
    return parseHtmlArticles(body, feed);
  } catch {
    return [];
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const results = await Promise.all(FEEDS.map((feed) => fetchFeed(feed)));
    const articles = mergeFallbacks(removeDuplicates(results.flat())).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    const kenya = articles.filter((article) => article.desk === "kenya").slice(0, 8);
    const global = articles.filter((article) => article.desk !== "kenya").slice(0, Math.max(16, 24 - kenya.length));
    return json(res, 200, { articles: [...global, ...kenya] });
  } catch (error) {
    return json(res, 200, {
      articles: API_FOOTBALL_FALLBACKS.slice(0, 4),
      error: String(error),
    });
  }
}
