import { fetchLiveMatches, fetchRecentMatches, fetchUpcomingFixtures } from "./football-api";
import { fetchFootballNews, timeAgo, type NewsArticle } from "./news-api";

// All AI calls go through the Vercel serverless function /api/mchambuzi.
// VITE_ prefixed AI keys are intentionally absent — they would be visible in
// the browser bundle and expose credentials to any visitor.
// Server-side keys (GEMINI_API_KEY, OPENAI_API_KEY) live in Vercel env vars only.

export type MchambuziContext = {
  generatedAt?: string;
  generatedAtLabel?: string;
  seasonLabel?: string;
  coverageWindow?: string;
  live: any[];
  upcoming: any[];
  recent: any[];
  news: NewsArticle[];
  wc26StartDate?: string;
  sources?: string[];
};

export type MchambuziProvider = "openai" | "gemini" | "fallback";


function compactMatch(match: any) {
  const score = typeof match.homeScore === "number" && typeof match.awayScore === "number"
    ? `${match.homeScore}-${match.awayScore}`
    : "vs";
  return `${match.home} ${score} ${match.away} (${match.league || "Football"}, ${match.minute || match.status || match.date || match.time || "latest"})`;
}

function compactNews(article: NewsArticle) {
  return `${article.title} - ${article.source}, ${timeAgo(article.pubDate)}`;
}

export async function fetchMchambuziContext(): Promise<MchambuziContext> {
  const [live, upcoming, recent, news] = await Promise.all([
    fetchLiveMatches(),
    fetchUpcomingFixtures(),
    fetchRecentMatches(),
    fetchFootballNews({ network: true, fallback: false }),
  ]);
  const now = new Date();

  return {
    generatedAt: now.toISOString(),
    generatedAtLabel: now.toLocaleString("en-KE", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Nairobi",
    }) + " EAT",
    seasonLabel: `${now.getUTCMonth() + 1 >= 7 ? now.getUTCFullYear() : now.getUTCFullYear() - 1}/${String((now.getUTCMonth() + 1 >= 7 ? now.getUTCFullYear() : now.getUTCFullYear() - 1) + 1).slice(-2)}`,
    coverageWindow: "latest local browser context",
    live: live.slice(0, 8),
    upcoming: upcoming.slice(0, 10),
    recent: recent.slice(0, 8),
    news: news.slice(0, 10),
  };
}

function normalizeServerContext(context: any): MchambuziContext {
  if (!context) return { live: [], upcoming: [], recent: [], news: [] };
  return {
    generatedAt: context.generatedAt,
    generatedAtLabel: context.generatedAtLabel,
    seasonLabel: context.seasonLabel,
    coverageWindow: context.coverageWindow,
    live: Array.isArray(context.live) ? context.live : [],
    upcoming: Array.isArray(context.upcoming) ? context.upcoming : [],
    recent: Array.isArray(context.recent) ? context.recent : [],
    news: Array.isArray(context.news)
      ? context.news.map((item: any, index: number) => (
          typeof item === "string"
            ? {
                id: `server-news-${index}`,
                title: item,
                link: "#",
                pubDate: new Date().toISOString(),
                source: "Server feed",
                sourceLogo: "AI",
                thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=60",
                imageQuality: "generic-fallback" as const,
              }
            : item
        ))
      : [],
    wc26StartDate: context.wc26StartDate,
    sources: Array.isArray(context.sources) ? context.sources : [],
  };
}

async function askServerMchambuzi(question: string): Promise<{ answer: string; context: MchambuziContext; provider: MchambuziProvider } | null> {
  try {
    const response = await fetch("/api/mchambuzi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (!data?.answer) return null;

    return {
      answer: data.answer,
      context: normalizeServerContext(data.context),
      provider: data.provider === "openai" || data.provider === "gemini" ? data.provider : "fallback",
    };
  } catch {
    return null;
  }
}

function buildFallbackAnswer(question: string, context: MchambuziContext): string {
  const lower = question.toLowerCase();
  const liveLine = context.live.length
    ? `Live right now: ${context.live.slice(0, 3).map(compactMatch).join("; ")}.`
    : "No major live match is showing in the feed right now.";
  const upcomingLine = context.upcoming.length
    ? `Next fixtures: ${context.upcoming.slice(0, 3).map(compactMatch).join("; ")}.`
    : "Upcoming fixture feed is quiet for now.";
  const newsLine = context.news.length
    ? `Latest headlines: ${context.news.slice(0, 3).map(compactNews).join("; ")}.`
    : "BBC/Goal headlines are not available in the feed right now.";

  if (lower.includes("live") || lower.includes("now") || lower.includes("today")) {
    return `Sasa, hii ndio picha ya saa hii. ${liveLine} ${upcomingLine} My read: start from the live feed, then check lineups and momentum before making noise in the group chat.`;
  }

  if (lower.includes("news") || lower.includes("transfer") || lower.includes("rumour") || lower.includes("injury")) {
    return `Latest football talk from the newsroom side: ${newsLine} Treat rumours like VAR: wait for confirmation before celebrating.`;
  }

  if (lower.includes("predict") || lower.includes("win") || lower.includes("who")) {
    return `Prediction mode, lakini with brakes. ${recentLine(context)} ${upcomingLine} Form matters, but football also enjoys embarrassing confident people. Check recent results, injuries and home advantage before calling it.`;
  }

  return `Mchambuzi Halisi says: ${liveLine} ${upcomingLine} ${newsLine} Ask me about a team, fixture, transfer, injury, table race or WC26 and I will break it down without behaving like a sofa pundit after two highlights.`;
}

function recentLine(context: MchambuziContext): string {
  return context.recent.length
    ? `Recent receipts: ${context.recent.slice(0, 3).map(compactMatch).join("; ")}.`
    : "Recent results feed is light right now.";
}

function buildMchambuziPrompt(question: string, context: MchambuziContext) {
  return `You are Mchambuzi Halisi, BallMtaani's hilarious but accurate Kenyan football analyst.

Personality:
- Funny, sharp, Kenyan football fan energy.
- Use light Swahili/Sheng only where natural, but keep the answer understandable.
- Be current, data-driven and honest.
- Keep it fan-first and punchy, not academic.
- Max 120 words unless fan asks for deep dive.
- Format:
  1) Quick take (1 line)
  2) Why (2-3 short lines)
  3) Watchout (1 line)
- Do not include source links inside body text.
- Today's timeline is ${context.generatedAtLabel || new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }) + " EAT"}.
- Current football season context is ${context.seasonLabel || "the current season"}.
- Do not use old model memory, old league tables, 2023/24, 2024/25 or historical results unless the fan explicitly asks for history.
- Never present rumours as confirmed.
- Do not give betting instructions or "bet now" language.
- If the available context is thin, say so clearly and answer from the data provided.

Use this current context from BallMtaani feeds:

LIVE MATCHES:
${context.live.length ? context.live.map(compactMatch).join("\n") : "No major live matches in feed."}

UPCOMING FIXTURES:
${context.upcoming.length ? context.upcoming.map(compactMatch).join("\n") : "No upcoming fixtures in feed."}

RECENT RESULTS:
${context.recent.length ? context.recent.map(compactMatch).join("\n") : "No recent results in feed."}

BBC SPORT / GOAL.COM HEADLINES:
${context.news.length ? context.news.map(compactNews).join("\n") : "No current headlines in feed."}

Fan question:
${question}

Answer as short football chat with practical insight, not generic hype.`;
}

/**
 * Public entry point — always tries the secure serverless endpoint first.
 * If the endpoint is unavailable (e.g. missing API keys on Vercel, network error),
 * falls back to a data-only text answer built from the live football context.
 * No AI keys ever touch the browser bundle.
 *
 * @param question  Fan's football question
 * @param preloaded Optional pre-loaded context from React Query hooks (avoids duplicate API calls)
 */
export async function askMchambuziHalisi(
  question: string,
  preloaded?: { live?: any[]; upcoming?: any[]; recent?: any[] }
): Promise<{
  answer: string;
  context: MchambuziContext;
  usedAi: boolean;
  provider: MchambuziProvider;
}> {
  // ── 1. Secure serverless path (/api/mchambuzi on Vercel) ──────────────────
  const serverAnswer = await askServerMchambuzi(question);
  if (serverAnswer) {
    return {
      ...serverAnswer,
      usedAi: serverAnswer.provider !== "fallback",
    };
  }

  // ── 2. Build context — use pre-loaded React Query data to avoid rate limit hits ──
  let context: MchambuziContext;
  if (preloaded && (preloaded.live?.length || preloaded.upcoming?.length || preloaded.recent?.length)) {
    // Use already-fetched data from the app's React Query cache
    const news = await fetchFootballNews({ network: true, fallback: true });
    const now = new Date();
    context = {
      generatedAt: now.toISOString(),
      generatedAtLabel: now.toLocaleString("en-KE", {
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
        timeZone: "Africa/Nairobi",
      }) + " EAT",
      seasonLabel: `${now.getUTCMonth() + 1 >= 7 ? now.getUTCFullYear() : now.getUTCFullYear() - 1}/${String((now.getUTCMonth() + 1 >= 7 ? now.getUTCFullYear() : now.getUTCFullYear() - 1) + 1).slice(-2)}`,
      live: preloaded.live || [],
      upcoming: preloaded.upcoming || [],
      recent: preloaded.recent || [],
      news,
      wc26StartDate: "June 11, 2026",
      sources: ["App live feed", "BBC Sport RSS", "Goal.com RSS"],
    };
  } else {
    // Last resort: make fresh API calls
    context = await fetchMchambuziContext();
  }

  return {
    answer: buildFallbackAnswer(question, context),
    context,
    usedAi: false,
    provider: "fallback",
  };
}
