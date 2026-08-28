import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { loadEnv } from "./_env-loader";

loadEnv();

const schema = z.object({
  playerName: z.string().trim().min(2).max(120),
  institution: z.string().trim().min(2).max(160),
  position: z.enum(["Striker", "Winger", "Central Midfielder", "Defensive Midfielder", "Center Back", "Full Back", "Goalkeeper"]),
  county: z.string().trim().min(2).max(100),
  contactPhone: z.string().trim().transform((value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("0")) return `254${digits.slice(1)}`;
    if (digits.startsWith("254")) return digits;
    return digits;
  }).refine((value) => /^254[17][0-9]{8}$/.test(value), "Enter a valid Kenyan mobile number."),
  evidenceNotes: z.string().trim().max(1000).optional().default(""),
  consentConfirmed: z.literal(true),
  website: z.string().max(0).optional().default(""),
});

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  let body: unknown = req.body;
  try {
    if (typeof body === "string") body = JSON.parse(body);
  } catch {
    return json(res, 400, { error: "Invalid JSON body." });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json(res, 400, { error: parsed.error.issues[0]?.message || "Check the nomination details." });
  if (parsed.data.website) return json(res, 200, { accepted: true });

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return json(res, 503, { error: "The nomination desk is temporarily unavailable." });

  const day = new Date().toISOString().slice(0, 10);
  const fingerprint = createHash("sha256").update([
    parsed.data.playerName.toLowerCase(), parsed.data.institution.toLowerCase(),
    parsed.data.contactPhone, day,
  ].join("|")).digest("hex");
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.from("talent_nominations").insert({
    player_name: parsed.data.playerName,
    institution: parsed.data.institution,
    position: parsed.data.position,
    county: parsed.data.county,
    contact_phone: parsed.data.contactPhone,
    evidence_notes: parsed.data.evidenceNotes || null,
    submission_fingerprint: fingerprint,
    consent_confirmed: true,
  });

  if (error?.code === "23505") return json(res, 200, { accepted: true, duplicate: true });
  if (error) return json(res, 503, { error: "The nomination could not be recorded. Please try again later." });
  return json(res, 201, { accepted: true });
}
