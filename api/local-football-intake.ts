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
  homeTeam: z.string().trim().min(1).max(140),
  awayTeam: z.string().trim().min(1).max(140),
  homeScore: score,
  awayScore: score,
  homePenalties: score,
  awayPenalties: score,
  status: z.enum(["scheduled", "finished", "postponed", "cancelled"]).default("scheduled"),
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
  matches: z.array(matchSchema).max(40).default([]),
  standings: z.array(standingSchema).max(100).default([]),
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string().trim().max(300)).max(30).default([]),
  rawText: z.string().max(12000).default(""),
});

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
  "matches": [{"homeTeam": string, "awayTeam": string, "homeScore": number|null, "awayScore": number|null, "homePenalties": number|null, "awayPenalties": number|null, "status": "scheduled|finished|postponed|cancelled", "date": string|null, "kickoffTime": string|null, "venue": string|null, "round": string|null, "events": [{"team": string|null, "player": string, "minute": string|null, "assist": string|null, "type": "goal|own_goal|penalty_goal"}]}],
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

async function extractPoster(base64: string, mimeType: string) {
  const token = await getVertexAccessToken(process.env as any);
  if (!token) throw new Error("Vertex AI image extraction is not configured.");
  const project = process.env.VERTEX_PROJECT_ID || "ball-mtaani-496717";
  const location = process.env.VERTEX_LOCATION || "us-central1";
  const model = process.env.VERTEX_VISION_MODEL || process.env.VERTEX_MODEL || "gemini-2.0-flash-001";
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: EXTRACTION_PROMPT }, { inlineData: { mimeType, data: base64 } }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 8192, responseMimeType: "application/json" },
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Poster extraction failed (${response.status}): ${detail.slice(0, 240)}`);
  }
  const result = await response.json() as any;
  const raw = String(result?.candidates?.[0]?.content?.parts?.[0]?.text || "").replace(/^```json\s*|\s*```$/g, "").trim();
  if (!raw) throw new Error("The extractor returned no data.");
  return extractionSchema.parse(JSON.parse(raw));
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
    const { data: fixture, error } = await admin.from("local_fixtures").upsert({
      source_id: sourceId,
      source_match_index: index,
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
    }, { onConflict: "source_id,source_match_index" }).select("id").single();
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

    if (action === "extract") {
      const image = parseDataUrl(req.body?.imageDataUrl);
      const sourceName = String(req.body?.sourceName || "").trim().slice(0, 180);
      const filename = String(req.body?.filename || "poster.jpg").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
      if (!sourceName) return json(res, 400, { error: "Source or organizer name is required." });
      const extension = image.mimeType === "image/png" ? "png" : image.mimeType === "image/webp" ? "webp" : "jpg";
      const path = `${userId}/${Date.now()}-${slugify(filename.replace(/\.[^.]+$/, ""))}.${extension}`;
      const { error: uploadError } = await admin.storage.from("local-football-sources").upload(path, image.bytes, { contentType: image.mimeType, upsert: false });
      if (uploadError) throw uploadError;

      const { data: source, error: sourceError } = await admin.from("local_football_sources").insert({
        submitted_by: userId,
        source_name: sourceName,
        source_type: req.body?.sourceType || "organizer_poster",
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
      const { error } = await admin.from("local_football_sources").update({
        extraction_payload: extraction,
        document_type: extraction.documentType,
        extraction_confidence: extraction.confidence,
        extraction_warnings: extraction.warnings,
        workflow_status: "pending_review",
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
