/**
 * Temporary debug endpoint — remove after fixing API key issue
 * Shows which env vars are present WITHOUT exposing the actual values
 */
export default function handler(req: any, res: any) {
  const key1 = process.env.API_FOOTBALL_KEY;
  const key2 = process.env.VITE_API_FOOTBALL_KEY;

  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify({
    API_FOOTBALL_KEY: key1
      ? `SET — starts with "${key1.slice(0, 4)}"... length ${key1.length}`
      : "NOT SET",
    VITE_API_FOOTBALL_KEY: key2
      ? `SET — starts with "${key2.slice(0, 4)}"... length ${key2.length}`
      : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  }));
}
