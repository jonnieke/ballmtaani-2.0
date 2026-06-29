/**
 * Streak protection push — sent daily at 15:00 UTC (18:00 EAT).
 * Notifies users who have an active streak but haven't opened the app today.
 * Queries: profiles where streak > 0 AND last_login_date < today (UTC).
 */

import { loadEnv } from "./_env-loader";

loadEnv();

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
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

  const supabaseUrl  = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { error: "Supabase credentials missing" });
  }

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };

  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  // "Today" in UTC — last_login_date is stored as YYYY-MM-DD UTC
  const today = new Date().toISOString().split("T")[0];

  // Profiles with active streak who haven't logged in today — limit to 500 per run
  const profilesRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?streak=gt.0&last_login_date=lt.${today}&select=id,streak&limit=500`,
    { headers }
  );

  if (!profilesRes.ok) {
    return json(res, 500, { error: "Failed to query profiles" });
  }

  const profiles: { id: string; streak: number }[] = await profilesRes.json();

  if (!profiles.length) {
    return json(res, 200, { sent: 0, message: "No at-risk streaks today" });
  }

  // Check which of these users have push subscriptions — avoid sending to ghost users
  const ids = profiles.map(p => `"${p.id}"`).join(",");
  const subsRes = await fetch(
    `${supabaseUrl}/rest/v1/push_subscriptions?user_id=in.(${ids})&select=user_id`,
    { headers }
  );

  const subs: { user_id: string }[] = subsRes.ok ? await subsRes.json() : [];
  const subscribedIds = new Set(subs.map(s => s.user_id));

  const eligible = profiles.filter(p => subscribedIds.has(p.id));

  let sent = 0;
  for (const profile of eligible) {
    const streakDay = profile.streak;
    const title = `🔥 Day ${streakDay} streak at risk`;
    const body = streakDay >= 7
      ? `${streakDay} days in a row — don't let it end today. Log in before midnight.`
      : `Log in before midnight to keep your ${streakDay}-day streak alive.`;

    try {
      const r = await fetch(`${base}/api/push-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          title,
          body,
          url: "/home",
          tag: `streak-reminder-${profile.id}-${today}`,
        }),
      });
      if (r.ok) sent++;
    } catch {
      // skip — don't let one failed push abort the rest
    }
  }

  return json(res, 200, {
    sent,
    eligible: eligible.length,
    total_at_risk: profiles.length,
  });
}
