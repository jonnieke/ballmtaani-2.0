import http from "node:http";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const apiBase = "https://v3.football.api-sports.io";
const port = Number(process.env.PORT || 5173);

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(rootDir, ".env.local"));
loadEnvFile(path.join(rootDir, ".env"));

const apiFootballKey = process.env.VITE_API_FOOTBALL_KEY || process.env.API_FOOTBALL_KEY || "";

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
  "widgets",
  "fixtures",
  "transfers",
];

const SOURCE_FALLBACK_URLS = {
  "BBC Sport": "https://www.bbc.com/sport/football",
  "Goal.com": "https://www.goal.com/en/news",
  "API-Football": "https://www.api-football.com/news/",
};

const API_FOOTBALL_FALLBACKS = [
  {
    id: "api-football-lineups-2026",
    title: "FIFA World Cup 2026 Lineups: All Teams, Coaches and Players",
    link: "https://www.api-football.com/news/post/fifa-world-cup-2026-lineups-all-teams-coaches-and-players",
    pubDate: "2026-06-04T00:00:00.000Z",
    source: "API-Football",
    sourceLogo: "API",
    description: "Team-by-team World Cup 2026 lineups, coaches and players before kickoff in USA, Canada and Mexico.",
  },
  {
    id: "api-football-widgets-2026",
    title: "FIFA WORLD CUP 2026: Using API-SPORTS Widgets",
    link: "https://www.api-football.com/news/post/fifa-world-cup-2026-using-api-sports-widgets",
    pubDate: "2026-05-13T00:00:00.000Z",
    source: "API-Football",
    sourceLogo: "API",
    description: "A guide to using widgets and match data around the biggest World Cup ever.",
  },
  {
    id: "api-football-guide-2026",
    title: "FIFA WORLD CUP 2026: Guide to Using Data with API-SPORTS",
    link: "https://www.api-football.com/news/post/fifa-world-cup-2026-guide-to-using-data-with-api-sports",
    pubDate: "2026-04-13T00:00:00.000Z",
    source: "API-Football",
    sourceLogo: "API",
    description: "48 teams, 16 stadiums and 39 days of competition, with data ideas for the tournament.",
  },
  {
    id: "api-football-widget-builder",
    title: "Introducing the API-SPORTS Widget Builder",
    link: "https://www.api-football.com/news/post/introducing-the-api-sports-widget-builder",
    pubDate: "2025-10-27T00:00:00.000Z",
    source: "API-Football",
    sourceLogo: "API",
    description: "Build and preview football widgets instantly with the modular Widget Builder.",
  },
  {
    id: "api-football-new-widgets",
    title: "Discover our new Widgets",
    link: "https://www.api-football.com/news/post/discover-our-new-widgets",
    pubDate: "2025-09-26T00:00:00.000Z",
    source: "API-Football",
    sourceLogo: "API",
    description: "The new widget set brings fixtures, standings and live score building blocks to football sites.",
  },
  {
    id: "api-football-custom-widgets",
    title: "How Custom API-Football Widgets work",
    link: "https://www.api-football.com/news/post/how-custom-api-football-widgets",
    pubDate: "2021-01-01T00:00:00.000Z",
    source: "API-Football",
    sourceLogo: "API",
    description: "Customize football widgets with team, match and competition data for your own layout.",
  },
  {
    id: "api-football-line-ups",
    title: "LINE UPS",
    link: "https://www.api-football.com/news/post/line-ups",
    pubDate: "2018-01-01T00:00:00.000Z",
    source: "API-Football",
    sourceLogo: "API",
    description: "Lineups endpoint coverage for fixtures, starters and matchday squad context.",
  },
  {
    id: "api-football-coachs-players",
    title: "COACHS & PLAYERS",
    link: "https://www.api-football.com/news/post/coachs-players",
    pubDate: "2018-01-01T00:00:00.000Z",
    source: "API-Football",
    sourceLogo: "API",
    description: "Player and coach endpoints for team season context, squad depth and identities.",
  },
  {
    id: "api-football-get-started",
    title: "How to Get Started with API-Football: The Complete Beginner's Guide",
    link: "https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide",
    pubDate: "2026-03-13T00:00:00.000Z",
    source: "API-Football",
    sourceLogo: "API",
    description: "Quick start guidance for working with API-Football data.",
  },
];

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function stripTags(value) {
  return decodeHtml(String(value || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function normalizeUrl(url, fallbackSource) {
  const raw = String(url || "").trim();
  if (!raw || raw === "#") return fallbackSource ? SOURCE_FALLBACK_URLS[fallbackSource] || "https://www.api-football.com/news/" : "https://www.api-football.com/news/";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return `https://${raw.replace(/^\/+/, "")}`;
}

function isFootballRelated(text) {
  const lower = String(text || "").toLowerCase();
  return FOOTBALL_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function extractFirstDate(text) {
  const match = String(text || "").match(/\b([A-Z][a-z]+ \d{2}, \d{4})\b/);
  if (!match) return new Date().toISOString();
  const parsed = new Date(match[1]);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function parseRssItems(xml, feed) {
  const items = String(xml || "").match(/<item[\s\S]*?<\/item>/gi) || [];
  return items
    .slice(0, 8)
    .map((item, idx) => {
      const title = stripTags(item.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
      const link = stripTags(item.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || "");
      const pubDate = (item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] || "").trim();
      const description = stripTags(item.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] || "");
      const thumbnail =
        item.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i)?.[1] ||
        item.match(/<media:content[^>]*url=["']([^"']+)["']/i)?.[1] ||
        item.match(/<enclosure[^>]*url=["']([^"']+)["']/i)?.[1] ||
        "";

      if (!isFootballRelated(`${title} ${description}`)) return null;

      return {
        id: `${feed.source}-${idx}-${title || link}`,
        title,
        link: normalizeUrl(link, feed.source),
        pubDate: pubDate || new Date().toISOString(),
        source: feed.source,
        sourceLogo: feed.sourceLogo,
        description,
        thumbnail,
      };
    })
    .filter(Boolean);
}

function parseHtmlArticles(html, feed) {
  const articles = [];
  const seen = new Set();
  const linkMatches = [...String(html || "").matchAll(/<a[^>]+href=["']([^"']*\/news\/post\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];

  for (const match of linkMatches) {
    const href = normalizeUrl(match[1], feed.source);
    const title = stripTags(match[2]).replace(/\s+/g, " ").trim();
    if (!title || title.length < 18) continue;
    if (/^read more$/i.test(title)) continue;
    if (seen.has(href)) continue;

    const start = Math.max(0, match.index || 0);
    const tail = String(html || "").slice(start + match[0].length, start + match[0].length + 1200);
    const lower = `${title} ${tail}`.toLowerCase();
    if (!isFootballRelated(lower)) continue;

    const snippet = stripTags(tail).replace(/Read more.*$/i, "").replace(/\s+/g, " ").trim().slice(0, 220);
    const pubDate = extractFirstDate(tail);
    seen.add(href);
    articles.push({
      id: href,
      title,
      link: href,
      pubDate,
      source: feed.source,
      sourceLogo: feed.sourceLogo,
      description: snippet,
    });
  }

  return articles;
}

function mergeFallbacks(articles) {
  const seen = new Set(articles.map((article) => `${article.title.toLowerCase()}|${article.link}`));
  const merged = [...articles];
  for (const fallback of API_FOOTBALL_FALLBACKS) {
    const key = `${fallback.title.toLowerCase()}|${fallback.link}`;
    if (seen.has(key)) continue;
    merged.push(fallback);
    seen.add(key);
  }
  return merged;
}

async function fetchFeed(feed) {
  try {
    const response = await fetch(feed.url, {
      headers: {
        "User-Agent": "BallMtaani-News/1.0",
        Accept: feed.kind === "html" ? "text/html,application/xhtml+xml" : "application/xml,text/xml,*/*;q=0.8",
      },
    });
    if (!response.ok) return [];
    const body = await response.text();
    return feed.kind === "rss" ? parseRssItems(body, feed) : parseHtmlArticles(body, feed);
  } catch {
    return [];
  }
}

async function handleNews(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });
  const feeds = [
    { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport", sourceLogo: "BBC", kind: "rss" },
    { url: "https://www.goal.com/feeds/en/news", source: "Goal.com", sourceLogo: "GOAL", kind: "rss" },
    { url: "https://www.api-football.com/news/", source: "API-Football", sourceLogo: "API", kind: "html" },
    { url: "https://www.api-football.com/news/post/fifa-world-cup-2026-lineups-all-teams-coaches-and-players", source: "API-Football", sourceLogo: "API", kind: "html" },
  ];
  try {
    const results = await Promise.all(feeds.map((feed) => fetchFeed(feed)));
    const articles = mergeFallbacks([].concat(...results))
      .filter((a, idx, arr) => arr.findIndex((b) => `${b.title.toLowerCase()}|${b.link}` === `${a.title.toLowerCase()}|${a.link}`) === idx)
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 24);
    sendJson(res, 200, { articles });
  } catch (error) {
    sendJson(res, 200, { articles: API_FOOTBALL_FALLBACKS.slice(0, 4), error: String(error) });
  }
}

async function proxyFootball(req, res, requestUrl) {
  if (!apiFootballKey) return sendJson(res, 500, { error: "Missing VITE_API_FOOTBALL_KEY" });
  const upstreamUrl = `${apiBase}${requestUrl.pathname.replace(/^\/api\/football/, "")}${requestUrl.search}`;
  const upstream = await fetch(upstreamUrl, {
    headers: { "x-apisports-key": apiFootballKey },
  });
  const body = await upstream.text();
  res.statusCode = upstream.status;
  res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
  };
  res.setHeader("Content-Type", contentType[ext] || "application/octet-stream");
  createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = requestUrl.pathname;

  if (pathname.startsWith("/api/news")) {
    await handleNews(req, res);
    return;
  }

  if (pathname.startsWith("/api/football")) {
    try {
      await proxyFootball(req, res, requestUrl);
    } catch (error) {
      sendJson(res, 502, { error: "Football proxy failed", detail: String(error) });
    }
    return;
  }

  const filePath = path.join(distDir, pathname === "/" ? "index.html" : pathname.replace(/^\/+/, ""));
  if (existsSync(filePath) && !pathname.endsWith("/")) {
    sendFile(res, filePath);
    return;
  }

  const indexHtml = path.join(distDir, "index.html");
  if (existsSync(indexHtml)) {
    sendFile(res, indexHtml);
    return;
  }

  sendJson(res, 404, { error: "Build not found. Run npm run build first." });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`BallMtaani preview server running at http://localhost:${port}/`);
});
