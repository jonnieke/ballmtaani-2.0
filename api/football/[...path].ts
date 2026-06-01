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
 *   - 60s CDN cache layer reduces API usage
 */

import { loadEnv } from "../_env-loader";

loadEnv();

export default async function handler(req: any, res: any) {
  // Build the upstream path from the catch-all segments
  const segments: string[] = Array.isArray(req.query.path)
    ? req.query.path
    : req.query.path
    ? [req.query.path]
    : [];

  const endpoint = "/" + segments.join("/");

  // Forward all query params EXCEPT the internal `path` param
  const forwardParams = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k === "path") continue;
    forwardParams.append(k, String(v));
  }

  const qs = forwardParams.toString();
  const upstream = `https://v3.football.api-sports.io${endpoint}${qs ? "?" + qs : ""}`;

  const key =
    process.env.API_FOOTBALL_KEY ||
    process.env.VITE_API_FOOTBALL_KEY;

  if (!key) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "API_FOOTBALL_KEY not configured on server" }));
    return;
  }

  try {
    const upstream_res = await fetch(upstream, {
      headers: { "x-apisports-key": key },
    });

    const data = await upstream_res.json();

    // Cache at the CDN edge — football data changes slowly
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  } catch (err: any) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Upstream fetch failed", detail: String(err?.message || err) }));
  }
}
