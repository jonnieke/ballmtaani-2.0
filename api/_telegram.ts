/**
 * Shared Telegram Bot helper.
 *
 * Required env vars (add in Vercel dashboard → Settings → Environment Variables):
 *   TELEGRAM_BOT_TOKEN  — token from @BotFather (e.g. 123456789:AAF...)
 *   TELEGRAM_CHANNEL_ID — channel username or numeric ID (e.g. @BallMtaaniFC or -1001234567890)
 */

const TELEGRAM_API = "https://api.telegram.org";

export interface TelegramResult {
  ok: boolean;
  messageId?: number;
  error?: string;
}

/**
 * Send a text message to the configured Telegram channel.
 * parseMode defaults to "HTML" — use <b>, <i>, <a href="...">, <code>.
 */
export async function sendTelegramMessage(
  text: string,
  options: {
    parseMode?: "HTML" | "Markdown" | "MarkdownV2";
    disableWebPagePreview?: boolean;
  } = {}
): Promise<TelegramResult> {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;

  if (!token || !chatId) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not configured" };
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parseMode ?? "HTML",
        disable_web_page_preview: options.disableWebPagePreview ?? false,
      }),
    });

    const data = await res.json() as { ok: boolean; result?: { message_id: number }; description?: string };

    if (!data.ok) {
      return { ok: false, error: data.description ?? "Unknown Telegram error" };
    }

    return { ok: true, messageId: data.result?.message_id };
  } catch (err: any) {
    return { ok: false, error: String(err?.message ?? err) };
  }
}

// ── Flag emoji map for WC26 nations ────────────────────────────────────────
// Covers all 48 WC26 participants + common club nations.
export const TEAM_FLAG: Record<string, string> = {
  // Americas — CONCACAF
  "United States": "🇺🇸", "USA": "🇺🇸",
  "Mexico": "🇲🇽", "Canada": "🇨🇦",
  "Jamaica": "🇯🇲", "Cuba": "🇨🇺",
  "Haiti": "🇭🇹", "Honduras": "🇭🇳",
  "El Salvador": "🇸🇻", "Panama": "🇵🇦",
  "Costa Rica": "🇨🇷", "Trinidad and Tobago": "🇹🇹",
  "Trinidad & Tobago": "🇹🇹", "Guadeloupe": "🇬🇵",
  "Curacao": "🇨🇼",
  // CONMEBOL
  "Brazil": "🇧🇷", "Argentina": "🇦🇷",
  "Colombia": "🇨🇴", "Uruguay": "🇺🇾",
  "Chile": "🇨🇱", "Ecuador": "🇪🇨",
  "Peru": "🇵🇪", "Venezuela": "🇻🇪",
  "Bolivia": "🇧🇴", "Paraguay": "🇵🇾",
  // UEFA
  "France": "🇫🇷", "Germany": "🇩🇪",
  "Spain": "🇪🇸", "Portugal": "🇵🇹",
  "Netherlands": "🇳🇱", "Belgium": "🇧🇪",
  "Italy": "🇮🇹", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Croatia": "🇭🇷", "Denmark": "🇩🇰",
  "Switzerland": "🇨🇭", "Sweden": "🇸🇪",
  "Norway": "🇳🇴", "Poland": "🇵🇱",
  "Austria": "🇦🇹", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "Serbia": "🇷🇸",
  "Romania": "🇷🇴", "Turkey": "🇹🇷",
  "Türkiye": "🇹🇷", "Ukraine": "🇺🇦",
  "Czech Republic": "🇨🇿", "Hungary": "🇭🇺",
  "Slovakia": "🇸🇰", "Greece": "🇬🇷",
  "Albania": "🇦🇱", "Georgia": "🇬🇪",
  "Slovenia": "🇸🇮", "Iceland": "🇮🇸",
  // CAF (Africa — all 9 at WC26)
  "Morocco": "🇲🇦", "Senegal": "🇸🇳",
  "Nigeria": "🇳🇬", "Egypt": "🇪🇬",
  "Cameroon": "🇨🇲", "South Africa": "🇿🇦",
  "Ghana": "🇬🇭", "Algeria": "🇩🇿",
  "Tunisia": "🇹🇳", "Mali": "🇲🇱",
  "Ivory Coast": "🇨🇮", "Côte d'Ivoire": "🇨🇮",
  "DR Congo": "🇨🇩", "Burkina Faso": "🇧🇫",
  "Zimbabwe": "🇿🇼", "Kenya": "🇰🇪",
  "Tanzania": "🇹🇿", "Uganda": "🇺🇬",
  // AFC (Asia)
  "Japan": "🇯🇵", "South Korea": "🇰🇷",
  "Australia": "🇦🇺", "Iran": "🇮🇷",
  "Saudi Arabia": "🇸🇦", "Qatar": "🇶🇦",
  "Iraq": "🇮🇶", "Jordan": "🇯🇴",
  "Oman": "🇴🇲", "Uzbekistan": "🇺🇿",
  "Indonesia": "🇮🇩", "Thailand": "🇹🇭",
  // OFC
  "New Zealand": "🇳🇿", "Fiji": "🇫🇯",
  "Tahiti": "🇵🇫",
};

export function teamFlag(name: string): string {
  return TEAM_FLAG[name] ?? "🏳️";
}
