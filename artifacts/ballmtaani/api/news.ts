type FeedConfig = {
  url: string;
  source: string;
  sourceLogo: string;
};

const RSS_FEEDS: FeedConfig[] = [
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport", sourceLogo: "BBC" },
  { url: "https://www.goal.com/feeds/en/news", source: "Goal.com", sourceLogo: "GOAL" },
];

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

function parseItems(xml: string, feed: FeedConfig) {
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return items.slice(0, 6).map((item, idx) => ({
    id: pickTag(item, "guid") || pickTag(item, "link") || `${feed.source}-${idx}`,
    title: pickTag(item, "title"),
    link: pickTag(item, "link"),
    pubDate: pickTag(item, "pubDate"),
    description: pickTag(item, "description"),
    content: pickTag(item, "content:encoded"),
    thumbnail:
      pickAttr(item, "media:thumbnail", "url") ||
      pickAttr(item, "media:content", "url") ||
      pickAttr(item, "enclosure", "url"),
    source: feed.source,
    sourceLogo: feed.sourceLogo,
  }));
}

export default async function handler(_req: any, res: any) {
  if (_req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const results = await Promise.all(
      RSS_FEEDS.map(async (feed) => {
        try {
          const response = await fetch(feed.url, { headers: { "User-Agent": "BallMtaani-News/1.0" } });
          if (!response.ok) return [];
          const xml = await response.text();
          return parseItems(xml, feed);
        } catch {
          return [];
        }
      }),
    );

    const articles = results.flat().filter((item) => item.title && item.link);
    return json(res, 200, { articles });
  } catch {
    return json(res, 200, { articles: [] });
  }
}

