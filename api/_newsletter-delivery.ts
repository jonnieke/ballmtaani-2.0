import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./_env-loader";

loadEnv();

type Edition = "morning" | "evening";
type Article = { title: string; excerpt: string; url: string; image?: string; source: string; publishedAt: string };
type Fixture = { home: string; away: string; time: string; status: string };

const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || "https://ballmtaani.com").replace(/\/$/, "");

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function escapeHtml(value: unknown) {
  return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
}

function plainText(value: unknown, max = 180) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function eatDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function formatEatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time TBC";
  return new Intl.DateTimeFormat("en-KE", { timeZone: "Africa/Nairobi", hour: "numeric", minute: "2-digit" }).format(date) + " EAT";
}

async function fetchArticles(supabase: any): Promise<Article[]> {
  const { data: internal } = await supabase
    .from("articles")
    .select("slug,title,excerpt,thumbnail_url,published_at,created_at,partner_team_name")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(6);

  const articles: Article[] = (internal || []).map((item: any) => ({
    title: plainText(item.title, 150),
    excerpt: plainText(item.excerpt, 190),
    url: `${SITE_URL}/news/${encodeURIComponent(item.slug)}`,
    image: item.thumbnail_url || undefined,
    source: item.partner_team_name || "Ball Mtaani",
    publishedAt: item.published_at || item.created_at,
  }));

  try {
    const response = await fetch(`${SITE_URL}/api/news`, { headers: { "User-Agent": "BallMtaani-Newsletter/1.0" }, signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      const payload = await response.json() as any;
      for (const item of payload?.articles || []) {
        articles.push({
          title: plainText(item.title, 150),
          excerpt: plainText(item.description, 190),
          url: String(item.link || ""),
          image: item.thumbnail || undefined,
          source: plainText(item.source, 50) || "Football desk",
          publishedAt: item.pubDate || new Date(0).toISOString(),
        });
      }
    }
  } catch {
    // Internal published stories still make a complete digest when a feed is unavailable.
  }

  const unique = new Map<string, Article>();
  for (const article of articles) {
    const key = article.url || article.title.toLowerCase();
    if (article.title && article.url && !unique.has(key)) unique.set(key, article);
  }
  return [...unique.values()]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 6);
}

async function fetchFixtures(): Promise<Fixture[]> {
  const apiKey = process.env.API_FOOTBALL_KEY || process.env.VITE_API_FOOTBALL_KEY;
  if (!apiKey) return [];
  try {
    const url = `https://v3.football.api-sports.io/fixtures?date=${eatDate()}&timezone=Africa%2FNairobi`;
    const response = await fetch(url, { headers: { "x-apisports-key": apiKey }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) return [];
    const payload = await response.json() as any;
    const fixtures = Array.isArray(payload?.response) ? payload.response : [];
    const priority = (fixture: any) => {
      const league = String(fixture.league?.name || "").toLowerCase();
      return ["world cup", "premier league", "champions league", "caf", "kenya"].findIndex(name => league.includes(name));
    };
    return fixtures
      .sort((a: any, b: any) => {
        const aPriority = priority(a); const bPriority = priority(b);
        if (aPriority !== bPriority) return (aPriority < 0 ? 99 : aPriority) - (bPriority < 0 ? 99 : bPriority);
        return new Date(a.fixture?.date).getTime() - new Date(b.fixture?.date).getTime();
      })
      .slice(0, 6)
      .map((fixture: any) => ({
        home: fixture.teams?.home?.name || "Home",
        away: fixture.teams?.away?.name || "Away",
        time: formatEatTime(fixture.fixture?.date),
        status: fixture.fixture?.status?.short || "NS",
      }));
  } catch {
    return [];
  }
}

function articleMarkup(article: Article) {
  const image = article.image ? `<img src="${escapeHtml(article.image)}" alt="" width="150" style="width:150px;height:92px;object-fit:cover;border-radius:6px;display:block" />` : "";
  return `<tr><td style="padding:14px 0;border-bottom:1px solid #263039"><table role="presentation" width="100%"><tr>${image ? `<td width="166" valign="top">${image}</td>` : ""}<td valign="top"><div style="color:#f7b500;font-size:11px;font-weight:800;text-transform:uppercase">${escapeHtml(article.source)}</div><h3 style="margin:5px 0 7px;color:#f8fafc;font-size:17px;line-height:1.25">${escapeHtml(article.title)}</h3>${article.excerpt ? `<p style="margin:0 0 9px;color:#a5b0b8;font-size:13px;line-height:1.45">${escapeHtml(article.excerpt)}</p>` : ""}<a href="${escapeHtml(article.url)}" style="color:#ffc928;font-weight:800;font-size:13px">Read &amp; react →</a></td></tr></table></td></tr>`;
}

function buildEmail(edition: Edition, articles: Article[], fixtures: Fixture[], unsubscribeUrl: string) {
  const isMorning = edition === "morning";
  const title = isMorning ? "Your matchday briefing" : "The evening football wrap";
  const fixtureMarkup = fixtures.length
    ? fixtures.map(f => `<tr><td style="padding:10px 0;border-bottom:1px solid #263039;color:#f8fafc;font-size:14px"><strong>${escapeHtml(f.home)}</strong> <span style="color:#7f8a93">vs</span> <strong>${escapeHtml(f.away)}</strong><span style="float:right;color:#ffc928">${escapeHtml(f.time)}</span></td></tr>`).join("")
    : `<tr><td style="padding:12px 0;color:#a5b0b8">No major fixtures are listed for today. Check the live match centre for updates.</td></tr>`;

  const html = `<!doctype html><html><body style="margin:0;background:#05080a;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">Fresh football news and today's fixtures, in EAT.</div><table role="presentation" width="100%" style="background:#05080a"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="620" style="width:100%;max-width:620px;background:#0b1116;border:1px solid #263039;border-radius:8px;overflow:hidden"><tr><td style="padding:24px;background:#080d10;border-bottom:3px solid #f7b500"><div style="color:#f8fafc;font-size:24px;font-weight:900">BALL <span style="color:#ffc928">MTAANI</span></div><div style="margin-top:4px;color:#a5b0b8;font-size:12px">PREDICT. DEBATE. REP YOUR TRIBE.</div></td></tr><tr><td style="padding:26px"><div style="color:#f7b500;font-size:12px;font-weight:800;text-transform:uppercase">${isMorning ? "7:00 AM EAT" : "5:00 PM EAT"} EDITION</div><h1 style="margin:8px 0 6px;color:#f8fafc;font-size:30px;line-height:1.15">${title}</h1><p style="margin:0 0 22px;color:#a5b0b8;line-height:1.5">The football stories and match data worth your attention. No invented scores, no filler.</p><h2 style="margin:0;color:#f8fafc;font-size:18px">TODAY'S MATCH BOARD</h2><table role="presentation" width="100%" style="margin:8px 0 24px">${fixtureMarkup}</table><a href="${SITE_URL}/matches" style="display:inline-block;background:#f7b500;color:#05080a;padding:12px 18px;border-radius:5px;font-weight:900;text-decoration:none">OPEN LIVE MATCH CENTRE</a><h2 style="margin:30px 0 4px;color:#f8fafc;font-size:18px">LATEST FOOTBALL FIRE</h2><table role="presentation" width="100%">${articles.length ? articles.map(articleMarkup).join("") : `<tr><td style="padding:16px 0;color:#a5b0b8">The newsroom feed is refreshing. Visit Ball Mtaani for the latest verified stories.</td></tr>`}</table><div style="padding-top:24px;text-align:center"><a href="${SITE_URL}/predictions" style="display:inline-block;border:1px solid #f7b500;color:#ffc928;padding:12px 18px;border-radius:5px;font-weight:900;text-decoration:none">LOCK YOUR PREDICTION</a></div></td></tr><tr><td style="padding:20px 26px;background:#080d10;color:#7f8a93;font-size:12px;line-height:1.5">You subscribed to Ball Mtaani football briefings. Times are shown in East Africa Time.<br><a href="${escapeHtml(unsubscribeUrl)}" style="color:#a5b0b8">Manage or unsubscribe</a> · <a href="${SITE_URL}/notifications" style="color:#a5b0b8">Notification settings</a></td></tr></table></td></tr></table></body></html>`;
  const text = `${title}\n\nToday's match board\n${fixtures.map(f => `${f.home} vs ${f.away} — ${f.time}`).join("\n") || "No major fixtures listed."}\n\nLatest football fire\n${articles.map(a => `${a.title}\n${a.url}`).join("\n\n") || `${SITE_URL}/news`}\n\nManage or unsubscribe: ${unsubscribeUrl}`;
  return { html, text };
}

function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

export async function runNewsletter(req: any, res: any, edition: Edition) {
  if (req.method !== "GET" && req.method !== "POST") return json(res, 405, { error: "GET or POST only" });
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || String(req.headers?.authorization || "") !== `Bearer ${cronSecret}`) return json(res, 401, { error: "Unauthorized" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM_EMAIL;
  const replyTo = process.env.NEWSLETTER_REPLY_TO || "hello@ballmtaani.com";
  const dryRun = String(req.query?.dryRun || req.query?.dry_run || "") === "1";
  if (!supabaseUrl || !serviceKey) return json(res, 500, { error: "Supabase service credentials are missing" });
  if (!dryRun && (!resendKey || !from)) return json(res, 500, { error: "RESEND_API_KEY and NEWSLETTER_FROM_EMAIL are required" });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const preferenceColumn = edition === "morning" ? "morning_digest" : "evening_digest";
  const { data: subscribers, error: subscriberError } = await supabase.from("newsletter_subscribers").select("id,user_id,email,unsubscribe_token").eq("status", "active").eq(preferenceColumn, true);
  if (subscriberError) return json(res, 500, { error: "Newsletter subscriber table is unavailable", detail: subscriberError.message });

  const articles = await fetchArticles(supabase);
  const fixtures = await fetchFixtures();
  if (dryRun) return json(res, 200, { ok: true, dryRun: true, edition, recipients: subscribers?.length || 0, articleCount: articles.length, fixtureCount: fixtures.length, articleTitles: articles.map(article => article.title) });

  const date = eatDate();
  const eventKey = `newsletter-${edition}-${date}`;
  const { data: outbox, error: outboxError } = await supabase.from("notification_outbox").upsert({ event_key: eventKey, event_type: `${edition}_digest`, channel: "email", payload: { edition, date, article_count: articles.length, fixture_count: fixtures.length }, status: "processing" }, { onConflict: "event_key,channel", ignoreDuplicates: true }).select("id").maybeSingle();
  if (outboxError) return json(res, 500, { error: "Notification outbox is unavailable" });
  if (!outbox?.id) return json(res, 200, { ok: true, duplicate: true, sent: 0 });

  let sent = 0;
  let failed = 0;
  const deliveries: any[] = [];
  const rows = subscribers || [];
  for (const [batchIndex, batch] of chunks(rows, 100).entries()) {
    const messages = batch.map((subscriber: any) => {
      const unsubscribeUrl = `${SITE_URL}/api/newsletter-unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`;
      const content = buildEmail(edition, articles, fixtures, unsubscribeUrl);
      return {
        from,
        to: [subscriber.email],
        reply_to: replyTo,
        subject: edition === "morning" ? `Ball Mtaani Matchday Brief — ${date}` : `Ball Mtaani Evening Wrap — ${date}`,
        html: content.html,
        text: content.text,
        headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        tags: [{ name: "edition", value: edition }, { name: "date", value: date }],
      };
    });
    try {
      const response = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "User-Agent": "BallMtaani-Newsletter/1.0", "Idempotency-Key": `${eventKey}-${batchIndex}` },
        body: JSON.stringify(messages),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json() as any;
      if (!response.ok) throw new Error(result?.message || result?.error?.message || `Resend HTTP ${response.status}`);
      const ids = Array.isArray(result?.data) ? result.data : [];
      batch.forEach((subscriber: any, index: number) => deliveries.push({ outbox_id: outbox.id, user_id: subscriber.user_id || null, channel: "email", status: "sent", provider_message_id: ids[index]?.id || null }));
      sent += batch.length;
    } catch (error: any) {
      const message = String(error?.message || error).slice(0, 240);
      batch.forEach((subscriber: any) => deliveries.push({ outbox_id: outbox.id, user_id: subscriber.user_id || null, channel: "email", status: "failed", error_code: message }));
      failed += batch.length;
    }
  }

  for (const batch of chunks(deliveries, 500)) await supabase.from("notification_deliveries").insert(batch);
  await supabase.from("notification_outbox").update({ status: failed === 0 ? "sent" : sent > 0 ? "partial" : "failed", eligible_count: rows.length, sent_count: sent, failed_count: failed, processed_at: new Date().toISOString() }).eq("id", outbox.id);
  return json(res, failed && !sent ? 502 : 200, { ok: failed === 0, edition, sent, failed, total: rows.length });
}
