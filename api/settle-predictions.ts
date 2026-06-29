const FOOTBALL_API_BASE = "https://v3.football.api-sports.io";
const BATCH_SIZE = 20;

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function parseScore(scoreStr: string): { home: number; away: number } | null {
  const m = String(scoreStr || "").match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (!m) return null;
  return { home: parseInt(m[1], 10), away: parseInt(m[2], 10) };
}

function direction(home: number, away: number): "home" | "draw" | "away" {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}

interface FixtureResult {
  homeScore: number;
  awayScore: number;
  home: string;
  away: string;
}

async function fetchFixtureResults(
  matchIds: string[],
  apiKey: string,
): Promise<Record<string, FixtureResult>> {
  const results: Record<string, FixtureResult> = {};

  for (let i = 0; i < matchIds.length; i += BATCH_SIZE) {
    const batch = matchIds.slice(i, i + BATCH_SIZE);
    try {
      const resp = await fetch(`${FOOTBALL_API_BASE}/fixtures?ids=${batch.join("-")}`, {
        headers: { "x-apisports-key": apiKey },
      });
      if (!resp.ok) continue;
      const data = await resp.json() as any;
      for (const item of (data?.response || []) as any[]) {
        const status = item.fixture?.status?.short || "";
        if (!["FT", "AET", "PEN"].includes(status)) continue;
        results[String(item.fixture.id)] = {
          homeScore: item.goals.home ?? 0,
          awayScore: item.goals.away ?? 0,
          home: item.teams?.home?.name || "Home",
          away: item.teams?.away?.name || "Away",
        };
      }
    } catch {
      // skip failed batch, continue
    }
  }

  return results;
}

export default async function handler(req: any, res: any) {
  // Vercel cron sends GET with Authorization: Bearer CRON_SECRET
  // Manual POST trigger is also accepted (useful for testing)
  if (req.method !== "GET" && req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = String(req.headers["authorization"] || "");
    if (auth !== `Bearer ${cronSecret}`) {
      return json(res, 401, { error: "Unauthorized" });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  // Service role key bypasses RLS — required for server-side writes on other users' rows
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_KEY ||
    "";
  const apiKey =
    process.env.VITE_API_FOOTBALL_KEY || process.env.API_FOOTBALL_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { error: "Supabase credentials missing" });
  }
  if (!apiKey) {
    return json(res, 500, { error: "API Football key missing" });
  }

  // Inline Supabase REST client — avoids npm import issues in edge environments
  async function sbGet(path: string) {
    const r = await fetch(`${supabaseUrl}/rest/v1${path}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });
    return r.ok ? r.json() : null;
  }

  async function sbPatch(path: string, body: Record<string, unknown>) {
    const r = await fetch(`${supabaseUrl}/rest/v1${path}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    });
    return r.ok;
  }

  // 1. Fetch unsettled predictions
  const pending = await sbGet(
    "/predictions?select=id,match_id,predicted_score,user_id&or=(result.is.null,result.eq.pending)&limit=100",
  );

  if (!Array.isArray(pending) || pending.length === 0) {
    return json(res, 200, { settled: 0, message: "No pending predictions" });
  }

  // 2. Fetch actual scores from API-Football for finished matches
  // Filter to only numeric IDs — WC26 tournament predictions (e.g. "wc26-champion") are
  // not real fixtures and must not be sent to the Football API
  const allMatchIds = [...new Set(pending.map((p: any) => String(p.match_id)))];
  const matchIds = allMatchIds.filter(id => /^\d+$/.test(id));
  const fixtureResults = await fetchFixtureResults(matchIds, apiKey);

  // 3. Settle each prediction; collect results and coin credits per user
  let settled = 0;
  const coinCredits: Record<string, number> = {};

  // Track every settled result per user so we can send one smart push
  interface UserResult { result: string; coinsAwarded: number; matchLabel: string; actualScore: string }
  const userResults: Record<string, UserResult[]> = {};

  for (const prediction of pending) {
    const actual = fixtureResults[String(prediction.match_id)];
    if (!actual) continue; // match not finished yet

    const predicted = parseScore(prediction.predicted_score);
    if (!predicted) continue; // unparseable — skip

    const actualScoreStr = `${actual.homeScore} - ${actual.awayScore}`;
    let result: string;
    let coinsAwarded: number;

    if (predicted.home === actual.homeScore && predicted.away === actual.awayScore) {
      result = "correct";
      coinsAwarded = 50;
    } else if (direction(predicted.home, predicted.away) === direction(actual.homeScore, actual.awayScore)) {
      result = "partial";
      coinsAwarded = 20;
    } else {
      result = "missed";
      coinsAwarded = 0;
    }

    const ok = await sbPatch(`/predictions?id=eq.${prediction.id}`, {
      result,
      actual_score: actualScoreStr,
      coins_awarded: coinsAwarded,
    });

    if (ok && prediction.user_id) {
      settled++;
      if (coinsAwarded > 0) {
        coinCredits[prediction.user_id] = (coinCredits[prediction.user_id] || 0) + coinsAwarded;
      }
      if (!userResults[prediction.user_id]) userResults[prediction.user_id] = [];
      userResults[prediction.user_id].push({
        result,
        coinsAwarded,
        matchLabel: `${actual.home} vs ${actual.away}`,
        actualScore: actualScoreStr,
      });
    }
  }

  // 4. Credit coins + send one tailored push to every affected user
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const pushResults: { userId: string; ok: boolean }[] = [];

  // Credit coins first
  for (const [userId, amount] of Object.entries(coinCredits)) {
    const profiles = await sbGet(`/profiles?id=eq.${userId}&select=coins`);
    const current = Array.isArray(profiles) && profiles[0] ? (profiles[0].coins || 0) : 0;
    await sbPatch(`/profiles?id=eq.${userId}`, { coins: current + amount });
  }

  // Send one push per user covering all their settled predictions
  for (const [userId, results] of Object.entries(userResults)) {
    const totalCoins = coinCredits[userId] || 0;
    const correct  = results.filter(r => r.result === "correct").length;
    const partial  = results.filter(r => r.result === "partial").length;
    const missed   = results.filter(r => r.result === "missed").length;

    let title: string;
    let body: string;

    if (results.length === 1) {
      const r = results[0];
      if (r.result === "correct") {
        title = "✅ You nailed it!";
        body  = `${r.matchLabel} ended ${r.actualScore}. +${r.coinsAwarded} MTC earned.`;
      } else if (r.result === "partial") {
        title = "👌 Right result, wrong score";
        body  = `${r.matchLabel} ended ${r.actualScore}. +${r.coinsAwarded} MTC earned.`;
      } else {
        title = "❌ Tough one";
        body  = `${r.matchLabel} ended ${r.actualScore}. Better call next match.`;
      }
    } else {
      // Multiple predictions settled — send a summary
      const parts: string[] = [];
      if (correct > 0) parts.push(`${correct} exact`);
      if (partial > 0) parts.push(`${partial} right result`);
      if (missed  > 0) parts.push(`${missed} missed`);
      title = totalCoins > 0 ? `⚽ ${results.length} predictions settled` : `⚽ ${results.length} predictions settled`;
      body  = parts.join(" · ") + (totalCoins > 0 ? ` — +${totalCoins} MTC earned` : " — Check your receipts");
    }

    try {
      const pushRes = await fetch(`${base}/api/push-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title,
          body,
          url: "/predictions",
          tag: `settle-${userId}-${Date.now()}`,
        }),
      });
      pushResults.push({ userId, ok: pushRes.ok });
    } catch {
      pushResults.push({ userId, ok: false });
    }
  }

  return json(res, 200, {
    settled,
    pending: pending.length,
    matchesChecked: Object.keys(fixtureResults).length,
    coinsDistributed: Object.values(coinCredits).reduce((a, b) => a + b, 0),
    pushSent: pushResults.filter(r => r.ok).length,
  });
}
