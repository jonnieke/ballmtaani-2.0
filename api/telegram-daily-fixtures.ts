/**
 * GET /api/telegram-daily-fixtures
 *
 * Cron: 0 5 * * * (8 AM EAT = 5 AM UTC)
 * Posts a WC26 daily match schedule digest to the Telegram channel.
 *
 * Required env vars:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID, API_FOOTBALL_KEY
 */

import { loadEnv } from "./_env-loader";
import { sendTelegramMessage, teamFlag } from "./_telegram";

loadEnv();

const WC26_LEAGUE_ID    = 1;
const WC26_SEASON       = 2026;
const FOOTBALL_API_BASE = "https://v3.football.api-sports.io";

function eatDateString(): string {
  const now = new Date();
  const eat = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  return eat.toISOString().slice(0, 10);
}

function eatTimeLabel(utcIso: string): string {
  const d = new Date(utcIso);
  if (isNaN(d.getTime())) return "TBD";
  const eat = new Date(d.getTime() + 3 * 60 * 60 * 1000);
  const h  = eat.getUTCHours();
  const m  = eat.getUTCMinutes().toString().padStart(2, "0");
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${m} ${h >= 12 ? "PM" : "AM"} EAT`;
}

function dayLabel(yyyy_mm_dd: string): string {
  const d = new Date(yyyy_mm_dd + "T12:00:00Z");
  return d.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

// Round name from API e.g. "Round of 16 - 1" → "Round of 16"
function cleanRound(raw: string): string {
  return raw.replace(/\s*-\s*\d+$/, "").trim();
}

function clockEmoji(h: number): string {
  const hr = h % 12;
  const emojis = ["🕛","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚"];
  return emojis[hr] ?? "⏰";
}

export default async function handler(req: any, res: any) {
  const apiKey = process.env.API_FOOTBALL_KEY || process.env.VITE_API_FOOTBALL_KEY;

  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "API_FOOTBALL_KEY not configured" }));
    return;
  }

  const today = eatDateString();

  // Fetch today's WC26 fixtures
  let fixtures: any[] = [];
  try {
    const apiRes = await fetch(
      `${FOOTBALL_API_BASE}/fixtures?league=${WC26_LEAGUE_ID}&season=${WC26_SEASON}&date=${today}`,
      { headers: { "x-apisports-key": apiKey } }
    );
    if (!apiRes.ok) throw new Error(`API-Football HTTP ${apiRes.status}`);
    const data = await apiRes.json() as any;
    fixtures = Array.isArray(data?.response) ? data.response : [];
  } catch (err: any) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: `Football API error: ${err.message}` }));
    return;
  }

  fixtures.sort((a: any, b: any) =>
    new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  );

  const dateLabel = dayLabel(today);
  let message: string;

  if (!fixtures.length) {
    message = [
      `🏆 <b>WC26 Daily Update</b>`,
      `📅 <i>${dateLabel}</i>`,
      ``,
      `No WC26 matches today — rest day 😴`,
      ``,
      `🔮 <a href="https://ballmtaani.com/world-cup-2026">Check the bracket on BallMtaani</a>`,
    ].join("\n");
  } else {
    // Group by round
    const rounds = new Map<string, any[]>();
    for (const f of fixtures) {
      const round = cleanRound((f.league?.round as string | undefined) ?? "Fixtures");
      if (!rounds.has(round)) rounds.set(round, []);
      rounds.get(round)!.push(f);
    }

    const lines: string[] = [
      `⚽ <b>WC26 MATCHES TODAY</b>`,
      `📅 <i>${dateLabel}</i>`,
      ``,
    ];

    for (const [round, matches] of rounds.entries()) {
      lines.push(`🏆 <b>${round}</b>`, ``);
      for (const f of matches) {
        const h  = f.teams?.home?.name ?? "Home";
        const a  = f.teams?.away?.name ?? "Away";
        const hf = teamFlag(h);
        const af = teamFlag(a);
        const iso  = f.fixture?.date as string | undefined;
        const time = iso ? eatTimeLabel(iso) : "TBD";
        const eatH = iso ? new Date(new Date(iso).getTime() + 3 * 60 * 60 * 1000).getUTCHours() : 12;
        lines.push(`${hf} <b>${h}</b> vs <b>${a}</b> ${af}`);
        lines.push(`${clockEmoji(eatH)} ${time}`, ``);
      }
    }

    lines.push(
      `━━━━━━━━━━━━━━━━`,
      `🎯 Predict &amp; win MTC Coins → <a href="https://ballmtaani.com/world-cup-2026">BallMtaani WC26 Hub</a>`,
    );

    message = lines.join("\n");
  }

  const result = await sendTelegramMessage(message, { disableWebPagePreview: true });

  res.statusCode = result.ok ? 200 : 500;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(result));
}
