/**
 * POST /api/push-send
 *
 * Sends a push notification to one or all subscribed fans.
 *
 * Body:
 *   { title, body, url, tag, userId? }
 *
 * If userId is provided, only sends to that user.
 * Otherwise sends to all active subscriptions (broadcast).
 *
 * Called by:
 *   - /api/push-kickoff  when a match is about to start
 *   - /api/settle-predictions  when a prediction settles (correct call)
 */

import { loadEnv } from "./_env-loader";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

loadEnv();

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

const EVENT_PREFERENCE: Record<string, string> = {
  breaking_news: "breaking_news",
  kickoff: "kickoff_reminders",
  lineup: "lineup_alerts",
  goal: "goal_alerts",
  red_card: "red_card_alerts",
  full_time: "full_time_results",
  prediction_result: "prediction_results",
};

function minutesInTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: timezone || "Africa/Nairobi", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const hour = Number(parts.find(part => part.type === "hour")?.value || 0);
  const minute = Number(parts.find(part => part.type === "minute")?.value || 0);
  return hour * 60 + minute;
}

function timeToMinutes(value: string) {
  const [hour, minute] = String(value || "00:00").split(":").map(Number);
  return hour * 60 + minute;
}

function isQuietHours(preference: any) {
  if (!preference?.quiet_hours_enabled) return false;
  const now = minutesInTimezone(preference.timezone || "Africa/Nairobi");
  const start = timeToMinutes(preference.quiet_start);
  const end = timeToMinutes(preference.quiet_end);
  return start <= end ? now >= start && now < end : now >= start || now < end;
}

function normalizeEntity(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function followsEvent(rows: any[], event: any) {
  const matchId = normalizeEntity(event.matchId);
  const leagueId = normalizeEntity(event.leagueId);
  const teamEntities = new Set([...(event.teamIds || []), ...(event.teamNames || [])].map(normalizeEntity));
  return rows.some(row => {
    const id = normalizeEntity(row.entity_id);
    if (row.entity_type === "match") return Boolean(matchId) && id === matchId;
    if (row.entity_type === "league") return Boolean(leagueId) && id === leagueId;
    return row.entity_type === "team" && teamEntities.has(id);
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { error: "POST only" });

  const vapidPublic  = process.env.VITE_VAPID_PUBLIC_KEY  || process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@ballmtaani.com";
  const supabaseUrl  = process.env.SUPABASE_URL  || process.env.VITE_SUPABASE_URL;
  const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY;

  if (!vapidPublic || !vapidPrivate) {
    return json(res, 500, { error: "VAPID keys not configured" });
  }
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { error: "Supabase not configured" });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const { title, body, url = "/home", tag = "ballmtaani", userId, eventType, matchId, leagueId, teamIds = [], teamNames = [] } = req.body || {};
  if (!title || !body) return json(res, 400, { error: "title and body required" });

  const internalSecret = process.env.PUSH_API_SECRET || process.env.CRON_SECRET;
  const authorization = String(req.headers?.authorization || "");
  if (!userId && internalSecret && authorization !== `Bearer ${internalSecret}`) {
    return json(res, 401, { error: "Broadcast authorization required" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const eventKey = String(tag || `${eventType || "direct"}-${Date.now()}`).slice(0, 240);
  const { data: outbox, error: outboxError } = await supabase.from("notification_outbox").upsert({
    event_key: eventKey,
    event_type: eventType || "direct",
    channel: "push",
    payload: { title, body, url, tag, userId, matchId, leagueId, teamIds, teamNames },
    status: "processing",
  }, { onConflict: "event_key,channel", ignoreDuplicates: true }).select("id").maybeSingle();

  if (outboxError) return json(res, 500, { error: "Notification outbox unavailable" });
  if (!outbox?.id) return json(res, 200, { sent: 0, duplicate: true });

  let eligibleUserIds: Set<string> | null = null;
  if (userId) {
    const { data: directPreference } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).maybeSingle();
    const preferenceColumn = EVENT_PREFERENCE[eventType];
    const optedOut = directPreference && (directPreference.push_enabled === false || (preferenceColumn && directPreference[preferenceColumn] === false));
    eligibleUserIds = optedOut ? new Set() : new Set([String(userId)]);
  } else {
    const preferenceColumn = EVENT_PREFERENCE[eventType];
    if (!preferenceColumn) {
      await supabase.from("notification_outbox").update({ status: "failed", failed_count: 1, processed_at: new Date().toISOString() }).eq("id", outbox.id);
      return json(res, 400, { error: "Broadcast notifications require a supported eventType" });
    }
    const { data: preferenceRows, error: preferenceError } = await supabase.from("notification_preferences").select("*").eq("push_enabled", true).eq(preferenceColumn, true);
    if (preferenceError) return json(res, 500, { error: "Notification preferences unavailable" });
    const preferences = (preferenceRows || []).filter((preference: any) => !isQuietHours(preference));
    const candidateIds = new Set(preferences.map((preference: any) => String(preference.user_id)));
    const { data: followRows } = await supabase.from("notification_follows").select("user_id,entity_type,entity_id");
    const followsByUser = new Map<string, any[]>();
    for (const follow of followRows || []) {
      const id = String(follow.user_id);
      followsByUser.set(id, [...(followsByUser.get(id) || []), follow]);
    }
    const doesNotNeedFootballFollow = eventType === "breaking_news";
    eligibleUserIds = new Set(preferences.filter((preference: any) => {
      if (!candidateIds.has(String(preference.user_id))) return false;
      if (doesNotNeedFootballFollow || preference.all_major_matches) return true;
      return followsEvent(followsByUser.get(String(preference.user_id)) || [], { matchId, leagueId, teamIds, teamNames });
    }).map((preference: any) => String(preference.user_id)));
  }

  // Fetch subscriptions
  const { data: allSubscriptions, error: subErr } = await supabase.from("push_subscriptions").select("*");
  const subs = (allSubscriptions || []).filter((sub: any) => eligibleUserIds?.has(String(sub.user_id)));

  if (subErr || !subs?.length) {
    await supabase.from("notification_outbox").update({ status: "sent", eligible_count: eligibleUserIds?.size || 0, processed_at: new Date().toISOString() }).eq("id", outbox.id);
    return json(res, 200, { sent: 0, message: "No subscriptions found" });
  }

  const payload = JSON.stringify({ title, body, url, tag });
  const results = await Promise.allSettled(
    subs.map(async (sub: any) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      try {
        await webpush.sendNotification(pushSub, payload);
        return { ok: true, endpoint: sub.endpoint, userId: sub.user_id };
      } catch (err: any) {
        // 410 Gone = subscription expired, clean it up
        if (err?.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
        return { ok: false, endpoint: sub.endpoint, userId: sub.user_id, error: err?.message, expired: err?.statusCode === 410 };
      }
    })
  );

  const sent    = results.filter(r => r.status === "fulfilled" && (r.value as any).ok).length;
  const failed  = results.length - sent;

  const deliveries = results.map(result => {
    const value = result.status === "fulfilled" ? result.value as any : null;
    return {
      outbox_id: outbox.id,
      user_id: value?.userId || null,
      channel: "push",
      status: value?.ok ? "sent" : value?.expired ? "expired" : "failed",
      error_code: value?.error ? String(value.error).slice(0, 240) : null,
    };
  });
  if (deliveries.length) await supabase.from("notification_deliveries").insert(deliveries);
  await supabase.from("notification_outbox").update({ status: failed === 0 ? "sent" : sent > 0 ? "partial" : "failed", eligible_count: eligibleUserIds?.size || 0, sent_count: sent, failed_count: failed, processed_at: new Date().toISOString() }).eq("id", outbox.id);

  return json(res, 200, { sent, failed, total: results.length });
}
