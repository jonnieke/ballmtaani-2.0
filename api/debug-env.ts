/**
 * Temporary debug endpoint — remove after fixing API key issue
 * Shows which env vars are present WITHOUT exposing the actual values
 */
import { loadEnv } from "./_env-loader";
loadEnv();

export default async function handler(req: any, res: any) {
  const key = process.env.API_FOOTBALL_KEY || process.env.VITE_API_FOOTBALL_KEY || "";

  // Test the key directly against the API status endpoint
  let apiResult: any = "not tested";
  if (key) {
    try {
      const r = await fetch("https://v3.football.api-sports.io/status", {
        headers: { "x-apisports-key": key },
      });
      apiResult = await r.json();
    } catch (e: any) {
      apiResult = { fetchError: String(e?.message) };
    }
  }

  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify({
    keyPresent: !!key,
    keyLength: key.length,
    keyFirst8: key ? key.slice(0, 8) + "..." : "MISSING",
    apiStatusResponse: apiResult,
  }));
}
