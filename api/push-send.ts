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

  const { title, body, url = "/home", tag = "ballmtaani", userId } = req.body || {};
  if (!title || !body) return json(res, 400, { error: "title and body required" });

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch subscriptions
  let query = supabase.from("push_subscriptions").select("*");
  if (userId) query = query.eq("user_id", userId);
  const { data: subs, error: subErr } = await query;

  if (subErr || !subs?.length) {
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
        return { ok: true, endpoint: sub.endpoint };
      } catch (err: any) {
        // 410 Gone = subscription expired, clean it up
        if (err?.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
        return { ok: false, endpoint: sub.endpoint, error: err?.message };
      }
    })
  );

  const sent    = results.filter(r => r.status === "fulfilled" && (r.value as any).ok).length;
  const failed  = results.length - sent;

  return json(res, 200, { sent, failed, total: results.length });
}
