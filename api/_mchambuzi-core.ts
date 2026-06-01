import { getVertexAccessToken } from "./_vertex-auth";

const FOOTBALL_API_BASE = "https://v3.football.api-sports.io";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

const RSS_FEEDS = [
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport" },
  { url: "https://www.goal.com/feeds/en/news", source: "Goal.com" },
];
// 686 (KPL) removed — API-Football returns Czech teams for this ID, not Kenya Premier League
const MAJOR_LEAGUE_IDS = new Set([39, 140, 135, 78, 61, 2, 3, 12, 288, 332, 1]);

type MchambuziEnv = Record<string, string | undefined>;

export type MchambuziServerContext = {
  generatedAt: string;
  generatedAtLabel: string;
  seasonLabel: string;
  coverageWindow: string;
  live: string[];
  upcoming: string[];
  recent: string[];
  news: string[];
  wc26StartDate: string;
  sources: string[];
};

export type MchambuziServerAnswer = {
  answer: string;
  provider: "vertexai" | "openai" | "fallback";
  context: MchambuziServerContext;
  diagnostics?: string[];
  attemptedProviders?: string[];
};

type MchambuziOptions = {
  debug?: boolean;
  providerPreference?: "vertexai-first" | "openai-first" | "openai-only" | "vertexai-only";
};

function stripTags(value = "") {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function decodeEntities(value = "") {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/Â£/g, "£")
    .replace(/Â/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanText(value = "") {
  return decodeEntities(value).replace(/Â£/g, "£").replace(/Â/g, "").trim();
}

function eatDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "time TBC";
  return date.toLocaleString("en-KE", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Nairobi",
  });
}

function currentSeasonStartYear(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  return month >= 7 ? year : year - 1;
}

function formatSeasonLabel(seasonStart: number) {
  return `${seasonStart}/${String(seasonStart + 1).slice(-2)}`;
}

function timeAgo(value = "") {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "published recently";
  const diff = Date.now() - timestamp;
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function pickTag(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return stripTags(decodeEntities(match?.[1] || ""));
}

async function footballFetch(endpoint: string, env: MchambuziEnv) {
  const key = env.API_FOOTBALL_KEY || env.VITE_API_FOOTBALL_KEY;
  if (!key) return [];

  try {
    const response = await fetch(`${FOOTBALL_API_BASE}${endpoint}`, {
      headers: { "x-apisports-key": key },
    });
    if (!response.ok) return [];
    const data = await response.json() as any;
    return Array.isArray(data?.response) ? data.response : [];
  } catch {
    return [];
  }
}

function matchLine(item: any) {
  const home = item?.teams?.home?.name || "Home";
  const away = item?.teams?.away?.name || "Away";
  const league = item?.league?.name || "Football";
  const score = item?.goals && (item.goals.home !== null || item.goals.away !== null)
    ? `${item.goals.home ?? 0}-${item.goals.away ?? 0}`
    : "vs";
  const status = item?.fixture?.status?.short || item?.fixture?.status?.elapsed || item?.league?.round || "latest";
  const kickoff = item?.fixture?.date ? `${eatDateTime(item.fixture.date)} EAT` : "time TBC";
  return `${home} ${score} ${away} (${league}, ${status}, ${kickoff})`;
}

async function fetchNews() {
  const output: string[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: { "User-Agent": "BallMtaani/1.0 football intelligence" },
      });
      if (!response.ok) continue;
      const xml = await response.text();
      const items = Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)).slice(0, 5);
      for (const item of items) {
        const title = pickTag(item[1], "title");
        const pubDate = pickTag(item[1], "pubDate");
        if (title) output.push(`${cleanText(title)} - ${feed.source}, ${timeAgo(pubDate)}`);
      }
    } catch {
      // Continue to next feed.
    }
  }

  return output;
}

async function buildContext(env: MchambuziEnv): Promise<MchambuziServerContext> {
  const now = new Date();
  const from = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = now.toISOString().slice(0, 10);
  const season = currentSeasonStartYear(now);

  // Fetch from all major leagues (no hardcoding — covers any league automatically)
  const leagueIds = Array.from(MAJOR_LEAGUE_IDS);

  const results = await Promise.all([
    footballFetch("/fixtures?live=all", env),
    ...leagueIds.map(id => footballFetch(`/fixtures?league=${id}&season=${season}&next=5`, env)),
    ...leagueIds.map(id => footballFetch(`/fixtures?league=${id}&season=${season}&from=${from}&to=${to}&status=FT-AET-PEN`, env)),
    fetchNews(),
  ]);

  const live = results[0];
  const upcoming = results.slice(1, 1 + leagueIds.length).flat();
  const recent = results.slice(1 + leagueIds.length, 1 + 2 * leagueIds.length).flat();
  const news = results[results.length - 1];

  return {
    generatedAt: now.toISOString(),
    generatedAtLabel: `${eatDateTime(now)} EAT`,
    seasonLabel: formatSeasonLabel(season),
    coverageWindow: `${from} to ${to}`,
    live: live.filter((item: any) => MAJOR_LEAGUE_IDS.has(item?.league?.id)).slice(0, 8).map(matchLine),
    upcoming: upcoming.slice(0, 12).map(matchLine),
    recent: recent.slice(0, 10).map(matchLine),
    news: news.slice(0, 10),
    wc26StartDate: "June 11, 2026",
    sources: ["API-Football fixtures", "BBC Sport RSS", "Goal.com RSS"],
  };
}

function buildPrompt(question: string, context: MchambuziServerContext) {
  return `You are Mchambuzi Halisi, BallMtaani's hilarious but accurate Kenyan football analyst.

Rules:
- Answer only football questions.
- Funny, sharp, Kenyan fan energy. Light Swahili/Sheng is okay.
- Keep it fan-friendly, not academic.
- Use short lines. Max 120 words total unless fan asks for deep dive.
- Structure:
  1) Quick take (1 line)
  2) Why (2-3 short lines with concrete data)
  3) Watchout (1 short line)
- Do not write source links inside the body text.
- Today's timeline is ${context.generatedAtLabel}. Current football season context is ${context.seasonLabel}.
- WC26 known kickoff date is ${context.wc26StartDate}. Never invent a different kickoff date.
- Use the supplied live data, fixture dates, recent results and BBC/Goal headlines first.
- Do not use old model memory, old league tables, 2023/24, 2024/25 or historical results unless the fan explicitly asks for history.
- If a league is between seasons or no current feed is available, say the current feed is thin instead of inventing form.
- Never present rumours as confirmed.
- Do not give betting instructions or "bet now" language.
- If context is thin, say so clearly.
- Be specific. Mention actual teams, fixtures, headlines or data from the context when relevant.

CURRENT TIME:
${context.generatedAtLabel}

CURRENT SEASON:
${context.seasonLabel}

RECENT RESULT WINDOW:
${context.coverageWindow}

LIVE:
${context.live.length ? context.live.join("\n") : "No major live matches in feed."}

UPCOMING:
${context.upcoming.length ? context.upcoming.join("\n") : "No upcoming fixtures in feed."}

RECENT:
${context.recent.length ? context.recent.join("\n") : "No recent results in feed."}

HEADLINES:
${context.news.length ? context.news.join("\n") : "No BBC/Goal headlines fetched."}

WC26 OFFICIAL KICKOFF:
${context.wc26StartDate}

DATA SOURCES:
${context.sources.join(", ")}

Fan question:
${question}

Answer as punchy football chat, not an essay.`;
}

// ─── Vertex AI via Workload Identity Federation (no key files) ───────────────
async function askVertexAI(prompt: string, env: MchambuziEnv, diagnostics: string[]) {
  const projectId = env.VERTEX_PROJECT_ID || "ball-mtaani-496717";
  const location  = env.VERTEX_LOCATION   || "us-central1";
  const modelName = env.VERTEX_MODEL      || "gemini-2.0-flash-001";

  let tokenResult: Awaited<ReturnType<typeof getVertexAccessToken>>;
  try {
    tokenResult = await getVertexAccessToken(env);
  } catch (err: any) {
    diagnostics.push(`VertexAI auth: ${String(err?.message || err).slice(0, 220)}`);
    return null;
  }

  if (!tokenResult) {
    diagnostics.push("VertexAI: WIF not configured (VERCEL_OIDC_TOKEN / GCP_PROJECT_NUMBER / VERTEX_SERVICE_ACCOUNT missing)");
    return null;
  }

  try {
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelName}:generateContent`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${tokenResult.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: {
          role: "system",
          parts: [{ text: "You are Mchambuzi Halisi, BallMtaani's hilarious but accurate Kenyan football analyst." }],
        },
        generationConfig: { temperature: 0.75, maxOutputTokens: 700 },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({} as any));
      diagnostics.push(`VertexAI: ${(err as any)?.error?.message || res.status}`);
      return null;
    }

    const data = await res.json() as any;
    return (data?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim() || null;
  } catch (err: any) {
    diagnostics.push(`VertexAI: ${String(err?.message || err).slice(0, 220)}`);
    return null;
  }
}

// ─── OpenAI (secondary fallback — Vertex AI is primary) ──────────────────────
async function askOpenAi(prompt: string, env: MchambuziEnv, diagnostics: string[]) {
  const key = env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY;
  if (!key) {
    diagnostics.push("OpenAI: missing key");
    return null;
  }

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || env.VITE_OPENAI_MODEL || "gpt-4.1-mini",
        messages: [
          { role: "system", content: "You are Mchambuzi Halisi, BallMtaani's hilarious but accurate Kenyan football analyst." },
          { role: "user", content: prompt },
        ],
        temperature: 0.75,
        max_tokens: 700,
      }),
    });

    if (!response.ok) {
      diagnostics.push(`OpenAI: ${response.status} ${await readProviderError(response)}`);
      return null;
    }
    const data = await response.json() as any;
    return (data?.choices?.[0]?.message?.content || "").trim() || null;
  } catch {
    diagnostics.push("OpenAI: network error");
    return null;
  }
}

// askGemini (AI Studio) removed — all Gemini calls now go through Vertex AI.
// This eliminates API key exposure and routes all AI usage to GCP credits.

async function readProviderError(response: Response) {
  try {
    const data = await response.clone().json() as any;
    const message = (data?.error as any)?.message || data?.error || data?.message;
    return message ? `- ${String(message).slice(0, 220)}` : "";
  } catch {
    return "";
  }
}

function resolveProviderPreference(env: MchambuziEnv, options: MchambuziOptions) {
  const raw = (
    options.providerPreference ||
    env.MCHAMBUZI_PROVIDER_ORDER ||
    env.MCHAMBUZI_AI_PROVIDER ||
    "openai-first"   // OpenAI default: no token expiry, no GCP WIF needed
  ).toLowerCase();

  if (raw.includes("vertexai") && raw.includes("only")) return "vertexai-only" as const;
  if (raw.includes("openai")   && raw.includes("only")) return "openai-only"   as const;
  if (raw.includes("openai"))  return "openai-first"  as const;
  return "vertexai-first" as const;
}

function providerOrder(preference: ReturnType<typeof resolveProviderPreference>): ReadonlyArray<"vertexai" | "openai"> {
  if (preference === "vertexai-only") return ["vertexai"];
  if (preference === "openai-only")   return ["openai"];
  if (preference === "openai-first")  return ["openai", "vertexai"];
  return ["vertexai", "openai"]; // default
}

function buildFallbackAnswer(question: string, context: MchambuziServerContext) {
  const lower = question.toLowerCase();
  const news = context.news.length ? context.news.slice(0, 3).join("; ") : "news feed is light";
  const upcoming = context.upcoming.length ? context.upcoming.slice(0, 3).join("; ") : "fixtures feed is light";
  const live = context.live.length ? context.live.slice(0, 3).join("; ") : "no major live game is showing in the feed right now";
  const recent = context.recent.length ? context.recent.slice(0, 3).join("; ") : "recent receipts are light";

  if (lower.includes("news") || lower.includes("story") || lower.includes("stories") || lower.includes("transfer") || lower.includes("injury")) {
    return cleanText(`Big football stories on my desk: ${news}. Keep one eye on the upcoming slate too: ${upcoming}. Rumours need patience, my friend. Until a reliable source confirms, celebrate with one hand still near the brakes.`);
  }

  if (lower.includes("live") || lower.includes("now") || lower.includes("today")) {
    return cleanText(`Sasa, live picture iko hivi: ${live}. The headline noise right now: ${news}. My read: start with the live feed, then check lineups and momentum before making loud group-chat declarations. Football loves humiliating confidence.`);
  }

  if (lower.includes("world cup") || lower.includes("wc26") || lower.includes("2026")) {
    return cleanText(`WC26 bado inaiva, but facts first: kickoff is ${context.wc26StartDate}. Current context here is from ${context.sources.join(", ")} as of ${context.generatedAtLabel}. ${upcoming}.`);
  }

  if (lower.includes("predict") || lower.includes("win") || lower.includes("watch")) {
    return cleanText(`For what to watch, I would start here: ${upcoming}. Recent receipts: ${recent}. Form matters, home advantage matters, but football also has a PhD in nonsense. Do not crown anyone from vibes alone.`);
  }

  return cleanText(`Mchambuzi Halisi read: latest headlines are ${news}. Upcoming matches to keep warm are ${upcoming}. Recent receipts: ${recent}. Ask me about a specific club, fixture, transfer or table race and I will narrow the analysis properly.`);
}

export async function answerMchambuzi(question: string, env: MchambuziEnv = {}, options: MchambuziOptions = {}): Promise<MchambuziServerAnswer> {
  const context = await buildContext(env);
  const prompt = buildPrompt(question, context);
  const diagnostics: string[] = [];
  const preference = resolveProviderPreference(env, options);
  const attemptedProviders: string[] = [];

  for (const provider of providerOrder(preference)) {
    attemptedProviders.push(provider);

    if (provider === "vertexai") {
      const vertexAnswer = await askVertexAI(prompt, env, diagnostics);
      if (vertexAnswer) {
        return {
          answer: vertexAnswer,
          provider: "vertexai",
          context,
          ...(options.debug ? { diagnostics, attemptedProviders } : {}),
        };
      }
    }

    if (provider === "openai") {
      const openAi = await askOpenAi(prompt, env, diagnostics);
      if (openAi) {
        return {
          answer: openAi,
          provider: "openai",
          context,
          ...(options.debug ? { diagnostics, attemptedProviders } : {}),
        };
      }
    }
  }

  return {
    answer: buildFallbackAnswer(question, context),
    provider: "fallback",
    context,
    diagnostics,
    attemptedProviders,
  };
}
