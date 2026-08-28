import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { loadEnv } from "./_env-loader";
import { getVertexAccessToken } from "./_vertex-auth";

loadEnv();

const score = z.number().int().min(0).nullable().optional();
const optionalText = z.string().trim().max(180).nullable().optional();

const eventSchema = z.object({
  team: z.string().trim().max(140).nullable().optional(),
  player: z.string().trim().min(1).max(140),
  minute: z.string().trim().max(20).nullable().optional(),
  assist: z.string().trim().max(140).nullable().optional(),
  type: z.enum(["goal", "own_goal", "penalty_goal"]).default("goal"),
});

const matchSchema = z.object({
  externalProvider: z.string().trim().max(60).nullable().optional(),
  externalFixtureId: z.number().int().positive().nullable().optional(),
  homeTeam: z.string().trim().min(1).max(140),
  awayTeam: z.string().trim().min(1).max(140),
  homeScore: score,
  awayScore: score,
  homePenalties: score,
  awayPenalties: score,
  status: z.enum(["scheduled", "live", "finished", "postponed", "cancelled"]).default("scheduled"),
  date: z.string().trim().max(20).nullable().optional(),
  kickoffTime: z.string().trim().max(30).nullable().optional(),
  venue: optionalText,
  round: optionalText,
  events: z.array(eventSchema).max(40).default([]),
});

const standingSchema = z.object({
  position: z.number().int().min(1),
  team: z.string().trim().min(1).max(140),
  played: score,
  won: score,
  drawn: score,
  lost: score,
  goalsFor: score,
  goalsAgainst: score,
  goalDifference: z.number().int().nullable().optional(),
  points: score,
});

const extractionSchema = z.object({
  documentType: z.enum(["fixture", "result", "multi_result", "standings", "team_photo", "unknown"]),
  competition: z.object({
    name: z.string().trim().max(180).nullable().optional(),
    shortName: optionalText,
    seasonLabel: optionalText,
    locality: optionalText,
    county: optionalText,
  }).default({}),
  matches: z.array(matchSchema).max(200).default([]),
  standings: z.array(standingSchema).max(100).default([]),
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string().trim().max(300)).max(30).default([]),
  rawText: z.string().max(20000).default(""),
});

function emptyExtraction(rawText = ""): z.infer<typeof extractionSchema> {
  return {
    documentType: "unknown",
    competition: {},
    matches: [],
    standings: [],
    confidence: rawText ? 0.75 : 1,
    warnings: rawText ? ["Review every field extracted from the pasted report before publishing."] : [],
    rawText: rawText.slice(0, 20000),
  };
}

const EXTRACTION_PROMPT = `You extract structured Kenyan football data from an event poster.
Return JSON only. Never guess, correct, expand or invent a team, player, venue, score, date or competition.
Preserve the poster's spelling. Use null when a value is absent or unreadable.
Dates must be YYYY-MM-DD only when the complete date is visible. Times must preserve AM/PM when shown.
For penalty shootouts, put the match score in homeScore/awayScore and shootout score in homePenalties/awayPenalties.
Every goal scorer belongs in events. Keep a printed minute such as 51' as minute and an explicitly printed assist as assist.
For a fixture poster use status scheduled. For a score/result poster use finished.
If the year, home/away order, competition, date or any label is ambiguous, add a warning and reduce confidence.
A team photograph without fixture, result or standings data must be documentType team_photo with empty arrays.

Required shape:
{
  "documentType": "fixture|result|multi_result|standings|team_photo|unknown",
  "competition": {"name": string|null, "shortName": string|null, "seasonLabel": string|null, "locality": string|null, "county": string|null},
  "matches": [{"homeTeam": string, "awayTeam": string, "homeScore": number|null, "awayScore": number|null, "homePenalties": number|null, "awayPenalties": number|null, "status": "scheduled|live|finished|postponed|cancelled", "date": string|null, "kickoffTime": string|null, "venue": string|null, "round": string|null, "events": [{"team": string|null, "player": string, "minute": string|null, "assist": string|null, "type": "goal|own_goal|penalty_goal"}]}],
  "standings": [{"position": number, "team": string, "played": number|null, "won": number|null, "drawn": number|null, "lost": number|null, "goalsFor": number|null, "goalsAgainst": number|null, "goalDifference": number|null, "points": number|null}],
  "confidence": number,
  "warnings": [string],
  "rawText": string
}`;

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) || "unknown";
}

function getClients() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) throw new Error("Supabase server credentials are not configured.");
  return {
    url,
    anon,
    admin: createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } }),
  };
}

async function requireEditor(req: any) {
  const { url, anon, admin } = getClients();
  const bearer = String(req.headers.authorization || "");
  const token = bearer.startsWith("Bearer ") ? bearer.slice(7) : "";
  if (!token) throw Object.assign(new Error("Sign in is required."), { status: 401 });

  const userRes = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) throw Object.assign(new Error("Your session has expired."), { status: 401 });
  const user = await userRes.json() as { id?: string };
  if (!user.id) throw Object.assign(new Error("User could not be verified."), { status: 401 });

  const configuredAdmins = (process.env.ADMIN_USER_IDS || process.env.VITE_ADMIN_USER_IDS || "")
    .split(",").map((id) => id.trim()).filter(Boolean);
  const { data: roles } = await admin.from("user_content_roles").select("role").eq("user_id", user.id);
  const mayEdit = configuredAdmins.includes(user.id) || (roles || []).some((row: any) => ["editor", "publisher"].includes(row.role));
  if (!mayEdit) throw Object.assign(new Error("Local data editor access is required."), { status: 403 });
  return { admin, userId: user.id };
}

function parseDataUrl(value: unknown) {
  const match = String(value || "").match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw Object.assign(new Error("Upload a JPEG, PNG or WebP poster."), { status: 400 });
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw Object.assign(new Error("Poster must be smaller than 5 MB."), { status: 400 });
  return { mimeType: match[1], base64: match[2], bytes };
}

function parseExtractionResponse(value: unknown) {
  const raw = String(value || "").replace(/^```(?:json)?\s*|\s*```$/gi, "").trim();
  if (!raw) throw new Error("The extractor returned no data.");
  return extractionSchema.parse(JSON.parse(raw));
}

async function extractWithOpenAi(parts: Array<Record<string, unknown>>, label: string) {
  const key = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!key) throw new Error("No server-side AI extraction provider is configured.");
  const content = [
    { type: "text", text: EXTRACTION_PROMPT },
    ...parts.flatMap((part) => {
      const inlineData = part.inlineData as { mimeType?: string; data?: string } | undefined;
      if (inlineData?.data && inlineData.mimeType) return [{ type: "image_url", image_url: { url: `data:${inlineData.mimeType};base64,${inlineData.data}` } }];
      return part.text ? [{ type: "text", text: String(part.text) }] : [];
    }),
  ];
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages: [{ role: "user", content }],
      temperature: 0,
      max_tokens: 8192,
      response_format: { type: "json_object" },
    }),
  });
  if (!response.ok) throw new Error(`${label} fallback extraction failed (${response.status}): ${(await response.text()).slice(0, 240)}`);
  const result = await response.json() as any;
  return parseExtractionResponse(result?.choices?.[0]?.message?.content);
}

async function extractWithVertex(parts: Array<Record<string, unknown>>, label: string) {
  const token = await getVertexAccessToken(process.env as any);
  let vertexError: unknown = null;
  if (token) {
    try {
      const project = process.env.VERTEX_PROJECT_ID || "ball-mtaani-496717";
      const location = process.env.VERTEX_LOCATION || "us-central1";
      const model = process.env.VERTEX_VISION_MODEL || process.env.VERTEX_MODEL || "gemini-2.0-flash-001";
      const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`;
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: EXTRACTION_PROMPT }, ...parts] }],
          generationConfig: { temperature: 0, maxOutputTokens: 8192, responseMimeType: "application/json" },
        }),
      });
      if (!response.ok) throw new Error(`${label} extraction failed (${response.status}): ${(await response.text()).slice(0, 240)}`);
      const result = await response.json() as any;
      return parseExtractionResponse(result?.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (error) {
      vertexError = error;
    }
  }
  try {
    return await extractWithOpenAi(parts, label);
  } catch (openAiError) {
    if (vertexError) throw vertexError;
    throw openAiError;
  }
}

function extractPoster(base64: string, mimeType: string) {
  return extractWithVertex([{ inlineData: { mimeType, data: base64 } }], "Poster");
}

function extractTextReport(reportText: string) {
  return extractWithVertex([{
    text: `Extract only the football facts explicitly stated in this editor-supplied report:\n\n${reportText}`,
  }], "Text report");
}

async function upsertNamed(admin: any, table: string, name: string, extra: Record<string, unknown> = {}) {
  const slug = slugify(name);
  const { data, error } = await admin.from(table).upsert({ slug, name, ...extra }, { onConflict: "slug" }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

function kickoffIso(date?: string | null, time?: string | null) {
  if (!date || !time) return null;
  const cleaned = time.trim().toUpperCase();
  const twelve = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  let hour: number;
  let minute: number;
  if (twelve) {
    hour = Number(twelve[1]) % 12 + (twelve[3] === "PM" ? 12 : 0);
    minute = Number(twelve[2] || 0);
  } else {
    const twentyFour = cleaned.match(/^(\d{1,2}):(\d{2})$/);
    if (!twentyFour) return null;
    hour = Number(twentyFour[1]);
    minute = Number(twentyFour[2]);
  }
  if (hour > 23 || minute > 59) return null;
  return new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+03:00`).toISOString();
}

const API_FOOTBALL_LEAGUES: Record<number, { name: string; shortName: string }> = {
  276: { name: "FKF Premier League", shortName: "FKF PL" },
  277: { name: "Kenyan Super League", shortName: "NSL" },
};

function localStatus(status: string): z.infer<typeof matchSchema>["status"] {
  if (["FT", "AET", "PEN"].includes(status)) return "finished";
  if (["1H", "2H", "HT", "ET", "P", "BT", "LIVE", "INT"].includes(status)) return "live";
  if (status === "PST") return "postponed";
  if (["CANC", "ABD", "AWD", "WO"].includes(status)) return "cancelled";
  return "scheduled";
}

async function apiFootball(endpoint: string, params: Record<string, string | number>) {
  const key = process.env.API_FOOTBALL_KEY || process.env.VITE_API_FOOTBALL_KEY;
  if (!key) throw new Error("API-Football is not configured on the server.");
  const query = new URLSearchParams(Object.entries(params).map(([name, value]) => [name, String(value)]));
  const response = await fetch(`https://v3.football.api-sports.io/${endpoint}?${query}`, {
    headers: { "x-apisports-key": key },
  });
  if (!response.ok) throw new Error(`API-Football ${endpoint} request failed (${response.status}).`);
  const payload = await response.json() as any;
  const errors = payload?.errors;
  if (errors && (Array.isArray(errors) ? errors.length : Object.keys(errors).length)) {
    throw new Error(`API-Football rejected the ${endpoint} request: ${JSON.stringify(errors).slice(0, 240)}`);
  }
  return Array.isArray(payload?.response) ? payload.response : [];
}

async function importApiFootball(leagueId: number, season: number, from: string, to: string) {
  const league = API_FOOTBALL_LEAGUES[leagueId];
  if (!league) throw Object.assign(new Error("Choose a supported Kenyan competition."), { status: 400 });
  const fromDate = new Date(`${from}T00:00:00Z`);
  const toDate = new Date(`${to}T00:00:00Z`);
  const spanDays = (toDate.getTime() - fromDate.getTime()) / 86_400_000;
  if (!Number.isFinite(spanDays) || spanDays < 0 || spanDays > 93) {
    throw Object.assign(new Error("Choose an API import window of 93 days or less."), { status: 400 });
  }

  const [fixturesResult, standingsResult] = await Promise.allSettled([
    apiFootball("fixtures", { league: leagueId, season, from, to, timezone: "Africa/Nairobi" }),
    apiFootball("standings", { league: leagueId, season }),
  ]);

  if (fixturesResult.status === "rejected" && standingsResult.status === "rejected") {
    throw fixturesResult.reason;
  }
  const fixturesResponse = fixturesResult.status === "fulfilled" ? fixturesResult.value : [];
  const standingsResponse = standingsResult.status === "fulfilled" ? standingsResult.value : [];

  const warnings = [
    "Imported from API-Football. Verify club names, dates, scores and competition coverage before publishing.",
    "Match events and goalscorers are not included in this import.",
  ];
  if (fixturesResult.status === "rejected") warnings.push(`Fixtures were unavailable: ${String(fixturesResult.reason?.message || fixturesResult.reason).slice(0, 180)}`);
  if (standingsResult.status === "rejected") warnings.push(`Standings were unavailable: ${String(standingsResult.reason?.message || standingsResult.reason).slice(0, 180)}`);
  if (fixturesResponse.length > 200) warnings.push("Only the first 200 fixtures in this window were retained for review.");

  const matches = fixturesResponse.slice(0, 200).map((row: any) => {
    const kickoff = row?.fixture?.date ? new Date(row.fixture.date) : null;
    const date = kickoff && Number.isFinite(kickoff.getTime())
      ? new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit" }).format(kickoff)
      : null;
    const kickoffTime = kickoff && Number.isFinite(kickoff.getTime())
      ? new Intl.DateTimeFormat("en-KE", { timeZone: "Africa/Nairobi", hour: "numeric", minute: "2-digit", hour12: true }).format(kickoff)
      : null;
    return {
      externalProvider: "api-football",
      externalFixtureId: Number(row?.fixture?.id) || null,
      homeTeam: String(row?.teams?.home?.name || "").trim(),
      awayTeam: String(row?.teams?.away?.name || "").trim(),
      homeScore: Number.isInteger(row?.goals?.home) ? row.goals.home : null,
      awayScore: Number.isInteger(row?.goals?.away) ? row.goals.away : null,
      homePenalties: Number.isInteger(row?.score?.penalty?.home) ? row.score.penalty.home : null,
      awayPenalties: Number.isInteger(row?.score?.penalty?.away) ? row.score.penalty.away : null,
      status: localStatus(String(row?.fixture?.status?.short || "NS")),
      date,
      kickoffTime,
      venue: String(row?.fixture?.venue?.name || "").trim() || null,
      round: String(row?.league?.round || "").trim() || null,
      events: [],
    };
  }).filter((match: any) => match.externalFixtureId && match.homeTeam && match.awayTeam);

  const rawStandings = standingsResponse.flatMap((row: any) => row?.league?.standings || []).flat();
  const standings = rawStandings.map((row: any) => ({
    position: Number(row?.rank),
    team: String(row?.team?.name || "").trim(),
    played: Number.isInteger(row?.all?.played) ? row.all.played : null,
    won: Number.isInteger(row?.all?.win) ? row.all.win : null,
    drawn: Number.isInteger(row?.all?.draw) ? row.all.draw : null,
    lost: Number.isInteger(row?.all?.lose) ? row.all.lose : null,
    goalsFor: Number.isInteger(row?.all?.goals?.for) ? row.all.goals.for : null,
    goalsAgainst: Number.isInteger(row?.all?.goals?.against) ? row.all.goals.against : null,
    goalDifference: Number.isInteger(row?.goalsDiff) ? row.goalsDiff : null,
    points: Number.isInteger(row?.points) ? row.points : null,
  })).filter((row: any) => Number.isInteger(row.position) && row.position > 0 && row.team);

  return extractionSchema.parse({
    documentType: matches.length ? "multi_result" : "standings",
    competition: { name: league.name, shortName: league.shortName, seasonLabel: String(season), locality: null, county: null },
    matches,
    standings,
    confidence: 0.98,
    warnings,
    rawText: `API-Football league ${leagueId}, season ${season}, ${from} to ${to}`,
  });
}

async function publishSource(admin: any, sourceId: string, editorId: string, extraction: z.infer<typeof extractionSchema>) {
  const competitionName = extraction.competition.name || "Kenyan Local Football";
  const competitionId = await upsertNamed(admin, "local_competitions", competitionName, {
    short_name: extraction.competition.shortName || null,
    season_label: extraction.competition.seasonLabel || null,
    locality: extraction.competition.locality || null,
    county: extraction.competition.county || null,
    updated_at: new Date().toISOString(),
  });

  for (let index = 0; index < extraction.matches.length; index += 1) {
    const match = extraction.matches[index];
    const homeTeamId = await upsertNamed(admin, "local_teams", match.homeTeam);
    const awayTeamId = await upsertNamed(admin, "local_teams", match.awayTeam);
    const venueId = match.venue ? await upsertNamed(admin, "local_venues", match.venue, {
      locality: extraction.competition.locality || null,
      county: extraction.competition.county || null,
    }) : null;
    const fixturePayload = {
      source_id: sourceId,
      source_match_index: match.externalFixtureId ?? index,
      external_provider: match.externalProvider || null,
      external_fixture_id: match.externalFixtureId || null,
      competition_id: competitionId,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      venue_id: venueId,
      round_label: match.round || null,
      scheduled_date: match.date || null,
      kickoff_time_text: match.kickoffTime || null,
      kickoff_at: kickoffIso(match.date, match.kickoffTime),
      status: match.status,
      home_score: match.homeScore ?? null,
      away_score: match.awayScore ?? null,
      home_penalties: match.homePenalties ?? null,
      away_penalties: match.awayPenalties ?? null,
      verification_status: "verified",
      updated_at: new Date().toISOString(),
    };
    const conflictTarget = match.externalProvider && match.externalFixtureId
      ? "external_provider,external_fixture_id"
      : "source_id,source_match_index";
    const { data: fixture, error } = await admin.from("local_fixtures")
      .upsert(fixturePayload, { onConflict: conflictTarget }).select("id").single();
    if (error) throw error;

    await admin.from("local_match_events").delete().eq("fixture_id", fixture.id);
    if (match.events.length) {
      const teamIds = new Map([[match.homeTeam.toLowerCase(), homeTeamId], [match.awayTeam.toLowerCase(), awayTeamId]]);
      const { error: eventError } = await admin.from("local_match_events").insert(match.events.map((event) => ({
        fixture_id: fixture.id,
        team_id: event.team ? teamIds.get(event.team.toLowerCase()) || null : null,
        event_type: event.type,
        player_name: event.player,
        minute_text: event.minute || null,
        assist_name: event.assist || null,
      })));
      if (eventError) throw eventError;
    }
  }

  await admin.from("local_standing_rows").delete().eq("source_id", sourceId);
  if (extraction.standings.length) {
    const rows = [];
    for (const row of extraction.standings) {
      const teamId = await upsertNamed(admin, "local_teams", row.team);
      rows.push({
        source_id: sourceId, competition_id: competitionId, team_id: teamId,
        position: row.position, played: row.played ?? null, won: row.won ?? null,
        drawn: row.drawn ?? null, lost: row.lost ?? null, goals_for: row.goalsFor ?? null,
        goals_against: row.goalsAgainst ?? null, goal_difference: row.goalDifference ?? null,
        points: row.points ?? null,
      });
    }
    const { error } = await admin.from("local_standing_rows").insert(rows);
    if (error) throw error;
  }

  const now = new Date().toISOString();
  const { error } = await admin.from("local_football_sources").update({
    extraction_payload: extraction,
    document_type: extraction.documentType,
    extraction_confidence: extraction.confidence,
    extraction_warnings: extraction.warnings,
    workflow_status: "published",
    verified_by: editorId,
    verified_at: now,
    published_at: now,
    updated_at: now,
  }).eq("id", sourceId);
  if (error) throw error;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  try {
    const { admin, userId } = await requireEditor(req);
    const action = String(req.body?.action || "");

    if (action === "list") {
      const { data, error } = await admin.from("local_football_sources")
        .select("id, source_name, source_type, original_filename, document_type, workflow_status, extraction_confidence, extraction_warnings, extraction_payload, created_at, published_at")
        .order("created_at", { ascending: false }).limit(30);
      if (error) throw error;
      return json(res, 200, { sources: data || [] });
    }

    if (action === "create-manual") {
      const sourceName = z.string().trim().min(2).max(180).parse(req.body?.sourceName);
      const extraction = emptyExtraction();
      const { data: source, error } = await admin.from("local_football_sources").insert({
        submitted_by: userId,
        source_name: sourceName,
        source_type: "manual_entry",
        original_filename: "manual-entry.txt",
        asset_path: `manual://${userId}/${Date.now()}-${slugify(sourceName)}`,
        mime_type: "text/plain",
        workflow_status: "pending_review",
        extraction_payload: extraction,
        extraction_confidence: 1,
      }).select("id").single();
      if (error) throw error;
      return json(res, 201, { sourceId: source.id, extraction });
    }

    if (action === "extract-text") {
      const sourceName = z.string().trim().min(2).max(180).parse(req.body?.sourceName);
      const reportText = z.string().trim().min(10).max(20000).parse(req.body?.reportText);
      const extraction = await extractTextReport(reportText);
      const { data: source, error } = await admin.from("local_football_sources").insert({
        submitted_by: userId,
        source_name: sourceName,
        source_type: "text_report",
        original_filename: "pasted-football-report.txt",
        asset_path: `text-report://${userId}/${Date.now()}-${slugify(sourceName)}`,
        mime_type: "text/plain",
        document_type: extraction.documentType,
        workflow_status: "pending_review",
        extraction_payload: extraction,
        extraction_confidence: extraction.confidence,
        extraction_warnings: extraction.warnings,
      }).select("id").single();
      if (error) throw error;
      return json(res, 201, { sourceId: source.id, extraction });
    }

    if (action === "import-api-football") {
      const input = z.object({
        leagueId: z.number().int().refine((value) => Boolean(API_FOOTBALL_LEAGUES[value])),
        season: z.number().int().min(2020).max(2035),
        from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }).parse(req.body);
      const extraction = await importApiFootball(input.leagueId, input.season, input.from, input.to);
      const assetPath = `api-football://league/${input.leagueId}/season/${input.season}`;
      const { data: existing, error: existingError } = await admin.from("local_football_sources")
        .select("id, workflow_status").eq("asset_path", assetPath).maybeSingle();
      if (existingError) throw existingError;
      const sourceValues = {
        submitted_by: userId,
        source_name: `API-Football · ${API_FOOTBALL_LEAGUES[input.leagueId].name}`,
        source_type: "api_football",
        original_filename: `api-football-${input.leagueId}-${input.season}.json`,
        asset_path: assetPath,
        mime_type: "application/json",
        document_type: extraction.documentType,
        workflow_status: existing?.workflow_status === "published" ? "published" : "pending_review",
        extraction_payload: extraction,
        extraction_confidence: extraction.confidence,
        extraction_warnings: extraction.warnings,
        updated_at: new Date().toISOString(),
      };
      if (existing?.id) {
        const { error } = await admin.from("local_football_sources").update(sourceValues).eq("id", existing.id);
        if (error) throw error;
        return json(res, 200, { sourceId: existing.id, extraction, refreshOfPublishedSource: existing.workflow_status === "published" });
      }
      const { data: source, error } = await admin.from("local_football_sources").insert(sourceValues).select("id").single();
      if (error) throw error;
      return json(res, 201, { sourceId: source.id, extraction, refreshOfPublishedSource: false });
    }

    if (action === "extract") {
      const image = parseDataUrl(req.body?.imageDataUrl);
      const sourceName = String(req.body?.sourceName || "").trim().slice(0, 180);
      const sourceType = z.enum(["organizer_poster", "club_poster", "school_poster", "reporter", "other"])
        .parse(req.body?.sourceType || "organizer_poster");
      const filename = String(req.body?.filename || "poster.jpg").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
      if (!sourceName) return json(res, 400, { error: "Source or organizer name is required." });
      const extension = image.mimeType === "image/png" ? "png" : image.mimeType === "image/webp" ? "webp" : "jpg";
      const path = `${userId}/${Date.now()}-${slugify(filename.replace(/\.[^.]+$/, ""))}.${extension}`;
      const { error: uploadError } = await admin.storage.from("local-football-sources").upload(path, image.bytes, { contentType: image.mimeType, upsert: false });
      if (uploadError) throw uploadError;

      const { data: source, error: sourceError } = await admin.from("local_football_sources").insert({
        submitted_by: userId,
        source_name: sourceName,
        source_type: sourceType,
        original_filename: filename,
        asset_path: path,
        mime_type: image.mimeType,
        workflow_status: "processing",
      }).select("id").single();
      if (sourceError) throw sourceError;

      try {
        const extraction = await extractPoster(image.base64, image.mimeType);
        await admin.from("local_football_sources").update({
          document_type: extraction.documentType,
          workflow_status: "pending_review",
          extraction_payload: extraction,
          extraction_confidence: extraction.confidence,
          extraction_warnings: extraction.warnings,
          updated_at: new Date().toISOString(),
        }).eq("id", source.id);
        return json(res, 200, { sourceId: source.id, extraction });
      } catch (error: any) {
        await admin.from("local_football_sources").update({ workflow_status: "failed", extraction_error: String(error.message || error).slice(0, 1000) }).eq("id", source.id);
        throw error;
      }
    }

    const sourceId = z.string().uuid().parse(req.body?.sourceId);
    const extraction = extractionSchema.parse(req.body?.extraction);
    if (action === "save") {
      const { data: currentSource, error: currentSourceError } = await admin
        .from("local_football_sources").select("workflow_status").eq("id", sourceId).single();
      if (currentSourceError) throw currentSourceError;
      const { error } = await admin.from("local_football_sources").update({
        extraction_payload: extraction,
        document_type: extraction.documentType,
        extraction_confidence: extraction.confidence,
        extraction_warnings: extraction.warnings,
        workflow_status: currentSource.workflow_status === "published" ? "published" : "pending_review",
        updated_at: new Date().toISOString(),
      }).eq("id", sourceId);
      if (error) throw error;
      return json(res, 200, { saved: true });
    }
    if (action === "publish") {
      if (!extraction.matches.length && !extraction.standings.length) return json(res, 400, { error: "There is no fixture, result or standings row to publish." });
      await publishSource(admin, sourceId, userId, extraction);
      return json(res, 200, { published: true });
    }
    return json(res, 400, { error: "Unknown action." });
  } catch (error: any) {
    if (error instanceof z.ZodError) return json(res, 400, { error: "Review the extracted fields before saving.", details: error.issues });
    return json(res, Number(error?.status || 500), { error: String(error?.message || error).slice(0, 500) });
  }
}
