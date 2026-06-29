/**
 * Server-side proxy for API-Football.
 *
 * Why this exists:
 *   v3.football.api-sports.io does not include CORS headers, so browsers
 *   cannot call it directly — the request is blocked. All football data
 *   must be fetched server-side and forwarded to the browser.
 *
 * Usage (client-side):
 *   fetch('/api/football/fixtures?live=all')
 *   → proxied to https://v3.football.api-sports.io/fixtures?live=all
 *
 * Benefits:
 *   - CORS handled (server has no CORS restriction)
 *   - API key stays server-side only (not in browser bundle)
 *   - 5min CDN cache layer prevents per-minute rate-limit
 */

import { loadEnv } from "../_env-loader";

loadEnv();

// Module-level burst cache — shared across requests hitting the same warm function instance.
// Catches the case where multiple simultaneous page loads all reach the proxy before the
// Vercel CDN edge has cached the first response (cold-start burst).
const BURST_CACHE = new Map<string, { data: any; expiresAt: number }>();
const BURST_INFLIGHT = new Map<string, Promise<any>>();

function getBurstCacheTtl(path: string): number {
  if (path.includes("live=all")) return 15_000;
  if (path.includes("next=") || path.includes("from=")) return 60_000;
  if (path.includes("standings")) return 300_000;
  return 30_000;
}

export default async function handler(req: any, res: any) {
  // Build the upstream path. Vercel surfaces the catch-all segment under the
  // literal key "...path" (not "path"), so check both, and fall back to the
  // request URL itself.
  const rawSegs = req.query["...path"] ?? req.query.path;
  const segments: string[] = Array.isArray(rawSegs)
    ? rawSegs
    : rawSegs
    ? String(rawSegs).split("/")
    : [];

  let endpoint = "/" + segments.join("/");
  if (endpoint === "/") {
    const incoming = new URL(req.url || "/", "http://localhost");
    const fromPath = incoming.pathname.replace(/^\/api\/football/, "");
    if (fromPath && fromPath !== "/") endpoint = fromPath;
  }

  // Forward all query params EXCEPT internal catch-all/debug params and _sub
  // _sub allows single-segment proxy paths to target nested API endpoints:
  // e.g. /fixtures?fixture=123&_sub=events → /fixtures/events?fixture=123
  const subResource = req.query["_sub"] ? String(req.query["_sub"]) : "";
  const upstreamEndpoint = subResource ? `${endpoint}/${subResource}` : endpoint;

  const parts: string[] = [];
  for (const [k, v] of Object.entries(req.query as Record<string, string>)) {
    if (k === "path" || k === "...path" || k === "_debug" || k === "_sub") continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  const qs = parts.join("&");
  const upstream = `https://v3.football.api-sports.io${upstreamEndpoint}${qs ? "?" + qs : ""}`;

  const key =
    process.env.API_FOOTBALL_KEY ||
    process.env.VITE_API_FOOTBALL_KEY;

  if (!key) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "API_FOOTBALL_KEY not configured on server" }));
    return;
  }

  const cacheKey = `${upstreamEndpoint}?${qs}`;
  const now = Date.now();

  // Serve from burst cache if still fresh (same warm function instance)
  const hit = BURST_CACHE.get(cacheKey);
  if (hit && hit.expiresAt > now) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.statusCode = 200;
    res.end(JSON.stringify(hit.data));
    return;
  }

  // Coalesce simultaneous requests for the same endpoint to one upstream call
  const inflight = BURST_INFLIGHT.get(cacheKey);
  if (inflight) {
    try {
      const data = await inflight;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    } catch {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Upstream fetch failed" }));
    }
    return;
  }

  const fetchPromise = (async () => {
    const upstream_res = await fetch(upstream, { headers: { "x-apisports-key": key } });
    return upstream_res.json() as Promise<any>;
  })();

  BURST_INFLIGHT.set(cacheKey, fetchPromise);

  try {
    const data = await fetchPromise;

    const hasErrors = (data?.errors &&
      (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0)) ||
      Boolean(data?.api?.error);

    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    if (hasErrors) {
      res.setHeader("Cache-Control", "no-store");
    } else {
      BURST_CACHE.set(cacheKey, { data, expiresAt: now + getBurstCacheTtl(cacheKey) });
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    }

    res.end(JSON.stringify(data));
  } catch (err: any) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({ error: "Upstream fetch failed", detail: String(err?.message || err) }));
  } finally {
    BURST_INFLIGHT.delete(cacheKey);
  }
}
