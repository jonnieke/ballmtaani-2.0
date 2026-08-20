/**
 * GET /api/push-goal-alerts
 *
 * Cron: every 2 minutes.
 * Polls API-Football for all live fixtures, detects new goals,
 * and broadcasts push notifications to every subscribed fan.
 *
 * Dedup: each unique score state is stored in push_alerts_sent as
 *   "goal__{fixtureId}_{homeGoals}_{awayGoals}"
 * so the same scoreline never fires twice even if the cron hits
 * a fixture multiple times while the score hasn't changed.
 */

import { loadEnv } from "./_env-loader";
import { createClient } from "@supabase/supabase-js";
import { sendTelegramMessage, teamFlag } from "./_telegram";

loadEnv();

const FOOTBALL_API_BASE = "https://v3.football.api-sports.io";

const ALERT_LEAGUES = new Set([
  1,    // FIFA World Cup
  2,    // UEFA Champions League
  3,    // UEFA Europa League
  39,   // Premier League
  140,  // La Liga
  135,  // Serie A
  78,   // Bundesliga
  61,   // Ligue 1
  12,   // CAF Champions League
]);

// World Cup gets a dedicated deep-link so fans land on the hub
const WC26_LEAGUE_ID = 1;

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function goalKey(fixtureId: string | number, home: number, away: number) {
  return `goal__${fixtureId}_${home}_${away}`;
}

function appBase(): string {
  // VERCEL_URL is set on Vercel; fall back to localhost for local dev
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default async function handler(req: any, res: any) {
  const apiKey      = process.env.API_FOOTBALL_KEY      || process.env.VITE_API_FOOTBALL_KEY;
  const supabaseUrl = process.env.SUPABASE_URL          || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY;

  if (!apiKey || !supabaseUrl || !supabaseKey) {
    return json(res, 500, { error: "Missing env vars" });
  }

  // ── 1. Fetch all currently live fixtures ────────────────────────────────
  let fixtures: any[] = [];
  try {
    const apiRes = await fetch(`${FOOTBALL_API_BASE}/fixtures?live=all`, {
      headers: { "x-apisports-key": apiKey },
    });
    if (!apiRes.ok) return json(res, 502, { error: `Football API ${apiRes.status}` });
    const apiData = await apiRes.json() as any;
    fixtures = Array.isArray(apiData?.response) ? apiData.response : [];
  } catch {
    return json(res, 502, { error: "Football API unreachable" });
  }

  // ── 2. Keep only leagues fans care about that have at least one goal ────
  const withGoals = fixtures.filter((f: any) => {
    const h = f.goals?.home ?? 0;
    const a = f.goals?.away ?? 0;
    return ALERT_LEAGUES.has(f.league?.id) && h + a > 0;
  });

  if (!withGoals.length) {
    return json(res, 200, { sent: 0, goals: 0, message: "No live goals in alert leagues" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // ── 3. Check which score states were already alerted ────────────────────
  const keysToCheck = withGoals.map((f: any) =>
    goalKey(f.fixture.id, f.goals?.home ?? 0, f.goals?.away ?? 0)
  );

  const { data: alreadySent } = await supabase
    .from("push_alerts_sent")
    .select("fixture_id")
    .in("fixture_id", keysToCheck);

  const sentKeys = new Set((alreadySent || []).map((r: any) => r.fixture_id as string));

  const toAlert = withGoals.filter((f: any) => {
    const key = goalKey(f.fixture.id, f.goals?.home ?? 0, f.goals?.away ?? 0);
    return !sentKeys.has(key);
  });

  if (!toAlert.length) {
    return json(res, 200, { sent: 0, goals: 0, message: "All goals already alerted" });
  }

  // ── 4. Send one notification per new goal event ─────────────────────────
  let totalSent = 0;
  const base = appBase();

  for (const fixture of toAlert) {
    const home    = fixture.teams?.home?.name   || "Home";
    const away    = fixture.teams?.away?.name   || "Away";
    const hGoals  = fixture.goals?.home         ?? 0;
    const aGoals  = fixture.goals?.away         ?? 0;
    const league  = fixture.league?.name        || "Football";
    const elapsed = fixture.fixture?.status?.elapsed;
    const isWC    = fixture.league?.id === WC26_LEAGUE_ID;

    const bodyParts = [league, elapsed ? `${elapsed}'` : null].filter(Boolean);

    try {
      // ── Push notification ──────────────────────────────────────────────
      const sendRes = await fetch(`${base}/api/push-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(process.env.PUSH_API_SECRET || process.env.CRON_SECRET ? { Authorization: `Bearer ${process.env.PUSH_API_SECRET || process.env.CRON_SECRET}` } : {}) },
        body: JSON.stringify({
          title: `⚽ GOAL! ${home} ${hGoals}–${aGoals} ${away}`,
          body: bodyParts.join(" · "),
          url: isWC ? "/world-cup-2026" : "/matches",
          tag: `goal-${fixture.fixture.id}-${hGoals}-${aGoals}`,
          eventType: "goal",
          matchId: String(fixture.fixture.id),
          leagueId: String(fixture.league?.id || ""),
          teamIds: [fixture.teams?.home?.id, fixture.teams?.away?.id].filter(Boolean).map(String),
          teamNames: [home, away],
        }),
      });

      if (sendRes.ok) {
        const result = await sendRes.json() as any;
        totalSent += result?.sent ?? 0;
      }

      // ── Telegram alert ─────────────────────────────────────────────────
      const hf    = teamFlag(home);
      const af    = teamFlag(away);
      const round = fixture.league?.round as string | undefined;
      const roundClean = round ? round.replace(/\s*-\s*\d+$/, "").trim() : null;
      const link  = isWC ? "https://ballmtaani.com/world-cup-2026" : "https://ballmtaani.com/matches";

      const tgLines = [
        `⚽ <b>GOAL!</b> · <i>${league}</i>`,
        ``,
        `${hf} <b>${home} ${hGoals} – ${aGoals} ${away}</b> ${af}`,
        [elapsed ? `⏱ ${elapsed}'` : null, roundClean].filter(Boolean).join(" · "),
        ``,
        `📊 <a href="${link}">Live on BallMtaani</a>`,
      ].filter(line => line !== null).join("\n");

      // Telegram fire-and-forget — don't block push dedup on its result
      sendTelegramMessage(tgLines, { disableWebPagePreview: true }).catch(() => {});

      // Mark this score state as alerted so we don't fire again
      await supabase.from("push_alerts_sent").insert({
        fixture_id: goalKey(fixture.fixture.id, hGoals, aGoals),
        sent_at: new Date().toISOString(),
      }).then(() => {}); // fire-and-forget insert, unique violation is fine
    } catch {
      // Non-fatal: one fixture failing shouldn't stop the rest
    }
  }

  return json(res, 200, { sent: totalSent, goals: toAlert.length });
}
