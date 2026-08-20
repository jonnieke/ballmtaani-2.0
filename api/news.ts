type FeedConfig = {
  url: string;
  source: string;
  sourceLogo: string;
};

type NewsItem = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content?: string;
  thumbnail?: string;
  source: string;
  sourceLogo: string;
  isWC26?: boolean;
  desk?: "kenya" | "global";
  isOfficial?: boolean;
};

const RSS_FEEDS: FeedConfig[] = [
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml",              source: "BBC Sport",    sourceLogo: "BBC"    },
  { url: "https://www.goal.com/feeds/en/news",                           source: "Goal.com",     sourceLogo: "GOAL"   },
  { url: "https://www.skysports.com/rss/12040",                          source: "Sky Sports",   sourceLogo: "SKY"    },
  { url: "https://www.espn.com/espn/rss/soccer/news",                    source: "ESPN FC",      sourceLogo: "ESPN"   },
  { url: "https://www.cafonline.com/en-us/news/rss/football",            source: "CAF",          sourceLogo: "CAF"    },
];

const WC26_KW = [
  "world cup", "wc26", "wc 26", "2026 fifa", "fifa 2026",
  "world cup 2026", "world cup final", "usa host", "canada host",
  "mexico host", "group stage 2026", "world cup squad",
];

function isWC26Article(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return WC26_KW.some(k => text.includes(k));
}

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.end(JSON.stringify(body));
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function pickTag(item: string, tag: string): string {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return decodeXml((match?.[1] || "").trim());
}

function pickAttr(item: string, tag: string, attr: string): string {
  const match = item.match(new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*>`, "i"));
  return decodeXml((match?.[1] || "").trim());
}

const TECHNICAL_PATTERNS = [
  "widget", "widgets", "api-sports", "api football", "api-football",
  "how to get started", "how custom", "builder", "using data with",
  "using api-sports", "complete beginner", "technical", "integration",
];

function isTechnical(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return TECHNICAL_PATTERNS.some(p => text.includes(p));
}

function parseItems(xml: string, feed: FeedConfig): NewsItem[] {
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return items.slice(0, 8).map((item, idx) => {
    const title       = pickTag(item, "title");
    const description = pickTag(item, "description");
    return {
      id: pickTag(item, "guid") || pickTag(item, "link") || `${feed.source}-${idx}`,
      title,
      link: pickTag(item, "link"),
      pubDate: pickTag(item, "pubDate"),
      description,
      content: pickTag(item, "content:encoded"),
      thumbnail:
        pickAttr(item, "media:thumbnail", "url") ||
        pickAttr(item, "media:content", "url") ||
        pickAttr(item, "enclosure", "url"),
      source: feed.source,
      sourceLogo: feed.sourceLogo,
      isWC26: isWC26Article(title, description),
    };
  }).filter(item => item.title && item.link && !isTechnical(item.title, item.description));
}

async function fetchFkfNews(): Promise<NewsItem[]> {
  const apiKey = process.env.FKF_NEWS_ANON_KEY || "";
  if (!apiKey) return [];

  const params = new URLSearchParams({
    select: "id,slug,title,excerpt,category,featured_image_url,published_at,created_at",
    published: "eq.true",
    order: "published_at.desc.nullslast,created_at.desc",
    limit: "12",
  });
  try {
    const response = await fetch(`https://wmcfdzqntemdnrguqijw.supabase.co/rest/v1/news?${params.toString()}`, {
      headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];
    const rows = await response.json();
    if (!Array.isArray(rows)) return [];

    return rows.flatMap((row: any) => {
      const slug = String(row.slug || "").trim();
      const title = String(row.title || "").trim();
      if (!slug || title.length < 18) return [];
      const description = String(row.excerpt || "").trim();
      return [{
        id: `fkf-${row.id || slug}`,
        title,
        link: `https://footballkenya.org/news/${encodeURIComponent(slug)}`,
        pubDate: row.published_at || row.created_at || new Date().toISOString(),
        description,
        thumbnail: String(row.featured_image_url || ""),
        source: "Football Kenya Federation",
        sourceLogo: "FKF",
        isWC26: isWC26Article(title, description),
        desk: "kenya" as const,
        isOfficial: true,
      }];
    });
  } catch {
    return [];
  }
}

export default async function handler(_req: any, res: any) {
  if (_req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        try {
          const response = await fetch(feed.url, {
            headers: { "User-Agent": "BallMtaani-News/1.0" },
            signal: AbortSignal.timeout(5000),
          });
          if (!response.ok) return [];
          const xml = await response.text();
          return parseItems(xml, feed);
        } catch {
          return [];
        }
      }),
    );

    const rssArticles = results
      .flatMap(r => r.status === "fulfilled" ? r.value : [])
      .filter(item => item.title && item.link);
    const fkfArticles = await fetchFkfNews();

    return json(res, 200, { articles: [...rssArticles, ...fkfArticles] });
  } catch {
    return json(res, 200, { articles: [] });
  }
}
