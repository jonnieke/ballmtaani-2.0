/**
 * GET /api/push-kickoff
 *
 * Cron: runs every 15 minutes.
 * Finds matches kicking off in the next 15 minutes and sends
 * a push notification to all subscribed fans.
 *
 * Deduplication: stores sent match IDs in Supabase to avoid
 * sending the same alert twice.
 */

import { loadEnv } from "./_env-loader";
import { createClient } from "@supabase/supabase-js";

loadEnv();

const FOOTBALL_API_BASE = "https://v3.football.api-sports.io";

// Only alert for major competitions fans care about
const ALERT_LEAGUES = new Set([
  1,    // World Cup
  2,    // UCL
  3,    // UEL
  39,   // Premier League
  140,  // La Liga
  135,  // Serie A
  78,   // Bundesliga
  61,   // Ligue 1
  12,   // CAF
]);

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
  const apiKey       = process.env.API_FOOTBALL_KEY || process.env.VITE_API_FOOTBALL_KEY;
  const supabaseUrl  = process.env.SUPABASE_URL     || process.env.VITE_SUPABASE_URL;
  const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY;

  if (!apiKey || !supabaseUrl || !supabaseKey) {
    return json(res, 500, { error: "Missing env vars" });
  }

  // Fetch matches kicking off in the next 15 minutes (±)
  const nowEAT  = new Date(Date.now() + 3 * 3600000); // UTC+3
  const dateStr = nowEAT.toISOString().slice(0, 10);

  const apiRes = await fetch(
    `${FOOTBALL_API_BASE}/fixtures?date=${dateStr}&timezone=Africa/Nairobi`,
    { headers: { "x-apisports-key": apiKey } }
  );
  if (!apiRes.ok) return json(res, 502, { error: "Football API error" });

  const apiData = await apiRes.json();
  const fixtures: any[] = Array.isArray(apiData.response) ? apiData.response : [];

  const now = Date.now();
  const upcoming = fixtures.filter((f: any) => {
    const kickoff = new Date(f.fixture?.date || "").getTime();
    const minutesUntil = (kickoff - now) / 60000;
    return minutesUntil >= 0 && minutesUntil <= 15
           && ALERT_LEAGUES.has(f.league?.id);
  });

  if (!upcoming.length) return json(res, 200, { sent: 0, message: "No kickoffs soon" });

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check which ones we've already alerted (dedup)
  const fixtureIds = upcoming.map((f: any) => String(f.fixture.id));
  const { data: alerted } = await supabase
    .from("push_alerts_sent")
    .select("fixture_id")
    .in("fixture_id", fixtureIds);

  const alertedIds = new Set((alerted || []).map((r: any) => r.fixture_id));
  const toAlert = upcoming.filter((f: any) => !alertedIds.has(String(f.fixture.id)));

  if (!toAlert.length) return json(res, 200, { sent: 0, message: "Already alerted" });

  let totalSent = 0;

  for (const fixture of toAlert) {
    const home    = fixture.teams?.home?.name || "Home";
    const away    = fixture.teams?.away?.name || "Away";
    const league  = fixture.league?.name || "Football";
    const kickoff = new Date(fixture.fixture?.date || "").toLocaleTimeString("en-KE", {
      hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Nairobi"
    });

    // Call our own push-send endpoint
    const sendRes = await fetch(
      `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/push-send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `⚽ Kickoff: ${home} vs ${away}`,
          body: `${league} · ${kickoff} EAT — Make your call on BallMtaani`,
          url: "/predictions",
          tag: `kickoff-${fixture.fixture.id}`,
        }),
      }
    );

    if (sendRes.ok) {
      const result = await sendRes.json();
      totalSent += result.sent || 0;
      // Record that we sent this alert
      await supabase.from("push_alerts_sent").insert({ fixture_id: String(fixture.fixture.id), sent_at: new Date().toISOString() });
    }
  }

  return json(res, 200, { sent: totalSent, matches: toAlert.length });
}
