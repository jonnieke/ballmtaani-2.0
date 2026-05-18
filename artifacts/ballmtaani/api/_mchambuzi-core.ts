const FOOTBALL_API_BASE = "https://v3.football.api-sports.io";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

const RSS_FEEDS = [
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport" },
  { url: "https://www.goal.com/feeds/en/news", source: "Goal.com" },
];
const MAJOR_LEAGUE_IDS = new Set([39, 140, 135, 78, 61, 2, 3, 12, 686, 288, 332, 1]);

type MchambuziEnv = Record<string, string | undefined>;

export type MchambuziServerContext = {
  live: string[];
  upcoming: string[];
  recent: string[];
  news: string[];
};

export type MchambuziServerAnswer = {
  answer: string;
  provider: "openai" | "gemini" | "fallback";
  context: MchambuziServerContext;
  diagnostics?: string[];
  attemptedProviders?: string[];
};

type MchambuziOptions = {
  debug?: boolean;
  providerPreference?: "gemini-first" | "openai-first" | "gemini-only" | "openai-only";
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
    const data = await response.json();
    return Array.isArray(data.response) ? data.response : [];
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
  return `${home} ${score} ${away} (${league}, ${status})`;
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
        if (title) output.push(`${cleanText(title)} - ${feed.source}`);
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
  const season = now.getUTCMonth() + 1 >= 7 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;

  const [live, premierUpcoming, laLigaUpcoming, serieAUpcoming, premierRecent, laLigaRecent, news] = await Promise.all([
    footballFetch("/fixtures?live=all", env),
    footballFetch(`/fixtures?league=39&season=${season}&next=5`, env),
    footballFetch(`/fixtures?league=140&season=${season}&next=5`, env),
    footballFetch(`/fixtures?league=135&season=${season}&next=5`, env),
    footballFetch(`/fixtures?league=39&season=${season}&from=${from}&to=${to}&status=FT-AET-PEN`, env),
    footballFetch(`/fixtures?league=140&season=${season}&from=${from}&to=${to}&status=FT-AET-PEN`, env),
    fetchNews(),
  ]);

  return {
    live: live.filter((item: any) => MAJOR_LEAGUE_IDS.has(item?.league?.id)).slice(0, 8).map(matchLine),
    upcoming: [...premierUpcoming, ...laLigaUpcoming, ...serieAUpcoming].slice(0, 12).map(matchLine),
    recent: [...premierRecent, ...laLigaRecent].slice(0, 10).map(matchLine),
    news: news.slice(0, 10),
  };
}

function buildPrompt(question: string, context: MchambuziServerContext) {
  return `You are Mchambuzi Halisi, BallMtaani's hilarious but accurate Kenyan football analyst.

Rules:
- Answer only football questions.
- Funny, sharp, Kenyan fan energy. Light Swahili/Sheng is okay.
- Use the supplied live data, fixtures, recent results and BBC/Goal headlines.
- Never present rumours as confirmed.
- Do not give betting instructions or "bet now" language.
- If context is thin, say so clearly.
- Be specific. Mention actual teams, fixtures, headlines or data from the context when relevant.

LIVE:
${context.live.length ? context.live.join("\n") : "No major live matches in feed."}

UPCOMING:
${context.upcoming.length ? context.upcoming.join("\n") : "No upcoming fixtures in feed."}

RECENT:
${context.recent.length ? context.recent.join("\n") : "No recent results in feed."}

HEADLINES:
${context.news.length ? context.news.join("\n") : "No BBC/Goal headlines fetched."}

Fan question:
${question}

Answer in 2-5 short paragraphs.`;
}

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
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    diagnostics.push("OpenAI: network error");
    return null;
  }
}

async function askGemini(prompt: string, env: MchambuziEnv, diagnostics: string[]) {
  const key = env.GEMINI_API_KEY || env.GEMINI_API || env.VITE_GEMINI_API;
  if (!key) {
    diagnostics.push("Gemini: missing key");
    return null;
  }
  const models = [
    env.GEMINI_MODEL,
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-latest",
  ].filter(Boolean) as string[];

  for (const model of Array.from(new Set(models))) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 700 },
        }),
      });

      if (!response.ok) {
        diagnostics.push(`Gemini ${model}: ${response.status} ${await readProviderError(response)}`);
        continue;
      }
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch {
      diagnostics.push(`Gemini ${model}: network error`);
    }
  }

  return null;
}

async function readProviderError(response: Response) {
  try {
    const data = await response.clone().json();
    const message = data?.error?.message || data?.error || data?.message;
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
    env.VITE_MCHAMBUZI_PROVIDER_ORDER ||
    "gemini-first"
  ).toLowerCase();

  if (raw.includes("openai") && raw.includes("only")) return "openai-only" as const;
  if (raw.includes("gemini") && raw.includes("only")) return "gemini-only" as const;
  if (raw.includes("openai")) return "openai-first" as const;
  return "gemini-first" as const;
}

function providerOrder(preference: ReturnType<typeof resolveProviderPreference>) {
  if (preference === "gemini-only") return ["gemini"] as const;
  if (preference === "openai-only") return ["openai"] as const;
  if (preference === "openai-first") return ["openai", "gemini"] as const;
  return ["gemini", "openai"] as const;
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

    if (provider === "gemini") {
      const gemini = await askGemini(prompt, env, diagnostics);
      if (gemini) {
        return {
          answer: gemini,
          provider: "gemini",
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
