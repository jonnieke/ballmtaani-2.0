import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./_env-loader";

loadEnv();

function page(res: any, status: number, title: string, body: string, token?: string) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  const form = token ? `<form method="post" action="/api/newsletter-unsubscribe?token=${encodeURIComponent(token)}"><button type="submit">UNSUBSCRIBE</button></form>` : "";
  res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width"><title>${title}</title></head><body style="margin:0;background:#05080a;color:#f8fafc;font-family:Arial,sans-serif"><main style="max-width:520px;margin:80px auto;padding:28px;background:#0b1116;border:1px solid #263039;border-top:3px solid #f7b500;border-radius:8px"><h1 style="margin-top:0">BALL <span style="color:#ffc928">MTAANI</span></h1><h2>${title}</h2><p style="color:#a5b0b8;line-height:1.5">${body}</p>${form}<style>button{margin-top:12px;padding:12px 18px;background:#f7b500;color:#05080a;border:0;border-radius:5px;font-weight:900;cursor:pointer}</style></main></body></html>`);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "POST") return page(res, 405, "Method not allowed", "Open the unsubscribe link from your email.");
  const token = String(req.query?.token || req.body?.token || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) return page(res, 400, "Invalid link", "This unsubscribe link is invalid or incomplete.");
  if (req.method === "GET") return page(res, 200, "Stop email briefings?", "You will stop receiving Ball Mtaani morning and evening football briefings.", token);

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return page(res, 500, "Please try again", "The preference service is temporarily unavailable.");
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const now = new Date().toISOString();
  const { data, error } = await supabase.from("newsletter_subscribers").update({ status: "unsubscribed", morning_digest: false, evening_digest: false, breaking_news: false, unsubscribed_at: now, updated_at: now }).eq("unsubscribe_token", token).select("id,user_id,email").maybeSingle();
  if (error) return page(res, 500, "Please try again", "We could not update your preference just now.");
  if (data?.user_id) {
    await supabase.from("notification_preferences").update({ email_enabled: false, daily_digest: false, evening_digest: false, updated_at: now }).eq("user_id", data.user_id);
    await supabase.from("notification_consent_events").insert({ user_id: data.user_id, channel: "email", action: "withdrawn", purpose: "football_news_and_match_alerts", source: "email_unsubscribe", metadata: { subscriber_id: data.id } });
  }
  return page(res, 200, "You are unsubscribed", "Email briefings have been switched off. Push notification preferences are unchanged.");
}
