import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./_env-loader";

loadEnv();

const CONSENT_TEXT = "I agree to receive Ball Mtaani football news and match briefings by email. I can unsubscribe at any time.";

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { error: "POST only" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return json(res, 500, { error: "Newsletter service is not configured" });

  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!isEmail(email)) return json(res, 400, { error: "Enter a valid email address" });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const accessToken = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
  let userId: string | null = null;
  if (accessToken) {
    const { data } = await supabase.auth.getUser(accessToken);
    userId = data.user?.id || null;
  }

  const action = req.body?.action === "unsubscribe" ? "unsubscribe" : "subscribe";
  const now = new Date().toISOString();
  const { data: existing, error: lookupError } = await supabase
    .from("newsletter_subscribers")
    .select("id,user_id,status,unsubscribe_token")
    .ilike("email", email)
    .maybeSingle();

  if (lookupError) return json(res, 500, { error: "Newsletter database is unavailable" });

  if (action === "unsubscribe") {
    if (!userId || (existing?.user_id && existing.user_id !== userId)) {
      return json(res, 403, { error: "Use the secure unsubscribe link in your email" });
    }
    if (existing?.id) {
      await supabase.from("newsletter_subscribers").update({ status: "unsubscribed", unsubscribed_at: now, updated_at: now }).eq("id", existing.id);
    }
    if (userId) {
      await supabase.from("notification_preferences").upsert({ user_id: userId, email_enabled: false, updated_at: now }, { onConflict: "user_id" });
      await supabase.from("notification_consent_events").insert({ user_id: userId, channel: "email", action: "withdrawn", purpose: "football_news_and_match_alerts", source: "newsletter_form", metadata: { email } });
    }
    return json(res, 200, { ok: true, status: "unsubscribed" });
  }

  const subscriber = {
    user_id: userId || existing?.user_id || null,
    email,
    status: "active",
    morning_digest: req.body?.morningDigest !== false,
    evening_digest: req.body?.eveningDigest !== false,
    breaking_news: req.body?.breakingNews === true,
    source: String(req.body?.source || "notifications_page").slice(0, 80),
    consent_text: CONSENT_TEXT,
    consented_at: now,
    unsubscribed_at: null,
    updated_at: now,
  };

  const writeResult = existing?.id
    ? await supabase.from("newsletter_subscribers").update(subscriber).eq("id", existing.id)
    : await supabase.from("newsletter_subscribers").insert(subscriber);

  if (writeResult.error) return json(res, 500, { error: "Could not save newsletter subscription" });

  if (userId) {
    await supabase.from("notification_preferences").upsert({ user_id: userId, email_enabled: true, daily_digest: subscriber.morning_digest, evening_digest: subscriber.evening_digest, updated_at: now }, { onConflict: "user_id" });
    await supabase.from("notification_consent_events").insert({ user_id: userId, channel: "email", action: "granted", purpose: "football_news_and_match_alerts", source: subscriber.source, metadata: { email, consent_text: CONSENT_TEXT } });
  }

  return json(res, 200, { ok: true, status: "active" });
}
