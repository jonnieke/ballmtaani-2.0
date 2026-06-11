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

  // Forward all query params EXCEPT the internal catch-all/debug params
  const parts: string[] = [];
  for (const [k, v] of Object.entries(req.query as Record<string, string>)) {
    if (k === "path" || k === "...path" || k === "_debug") continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  const qs = parts.join("&");
  const upstream = `https://v3.football.api-sports.io${endpoint}${qs ? "?" + qs : ""}`;

  const key =
    process.env.API_FOOTBALL_KEY ||
    process.env.VITE_API_FOOTBALL_KEY;

  // Temporary diagnostics: /api/football/status?_debug=key reports how the
  // key arrives in this runtime (length + edge chars only, never the value)
  if (req.query._debug === "key") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({
      present: Boolean(key),
      length: key ? key.length : 0,
      head: key ? key.slice(0, 2) : "",
      tail: key ? key.slice(-2) : "",
      firstCharCode: key ? key.charCodeAt(0) : null,
      source: process.env.API_FOOTBALL_KEY ? "API_FOOTBALL_KEY" : (process.env.VITE_API_FOOTBALL_KEY ? "VITE_API_FOOTBALL_KEY" : "none"),
    }));
    return;
  }

  // Temporary diagnostics: call upstream /status from this runtime and report
  // the raw verdict plus the exact URL we would have hit for this request
  if (req.query._debug === "upstream") {
    try {
      const probe = await fetch("https://v3.football.api-sports.io/status", {
        headers: { "x-apisports-key": String(key) },
      });
      const body = await probe.text();
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-store");
      res.end(JSON.stringify({ upstreamStatus: probe.status, upstreamBody: body.slice(0, 600), wouldFetch: upstream }));
    } catch (err: any) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ probeError: String(err?.message || err), wouldFetch: upstream }));
    }
    return;
  }

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

    const data = await upstream_res.json() as any;

    // Check for API-level errors (rate-limit, token errors, etc.)
    // Do NOT cache these — they are transient and should be retried fresh
    const hasErrors = (data?.errors &&
      (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0)) ||
      // Auth/quota errors come back in a legacy shape: {"api":{"error":"..."}}
      Boolean(data?.api?.error);

    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    if (hasErrors) {
      // Return error response without caching so the next request tries fresh
      res.setHeader("Cache-Control", "no-store");
    } else {
      // Cache successful responses at CDN edge for 5 minutes
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    }

    res.end(JSON.stringify(data));
  } catch (err: any) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({ error: "Upstream fetch failed", detail: String(err?.message || err) }));
  }
}
