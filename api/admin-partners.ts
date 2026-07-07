/**
 * Admin-only partner team management.
 *
 * The browser cannot safely use the Supabase service role key, and strict RLS
 * blocks direct writes to partner_teams. This endpoint verifies the user's JWT,
 * checks the same admin allowlist used by the app, then writes server-side.
 */

import { loadEnv } from "./_env-loader";
import { createClient } from "@supabase/supabase-js";

loadEnv();

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function adminIds() {
  return String(process.env.ADMIN_USER_IDS || process.env.VITE_ADMIN_USER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function cleanPartnerPayload(input: any) {
  const name = String(input?.name ?? "").trim();
  const slug = String(input?.slug ?? "").trim();

  return {
    name,
    slug,
    logo_url: input?.logo_url ? String(input.logo_url).trim() : null,
    description: input?.description ? String(input.description).trim() : null,
    contact_email: input?.contact_email ? String(input.contact_email).trim() : null,
    approved: Boolean(input?.approved),
  };
}

async function requireAdmin(req: any) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { error: "Server misconfigured", status: 500 as const };
  }

  const authHeader = String(req.headers["authorization"] ?? "");
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { error: "Not authenticated", status: 401 as const };

  const verifier = createClient(supabaseUrl, anonKey || serviceKey);
  const { data, error } = await verifier.auth.getUser(token);
  const user = data?.user;
  if (error || !user) return { error: "Invalid session", status: 401 as const };

  const allowlist = adminIds();
  const metadataRole = String((user.user_metadata as any)?.role || (user.app_metadata as any)?.role || "");
  const allowed = allowlist.includes(user.id) || metadataRole === "admin";
  if (!allowed) return { error: "Admin access required", status: 403 as const };

  const admin = createClient(supabaseUrl, serviceKey);
  return { user, admin };
}

export default async function handler(req: any, res: any) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return json(res, auth.status, { error: auth.error });

  const { admin } = auth;
  const url = new URL(req.url || "/api/admin-partners", "http://localhost");
  const queryId = typeof req.query?.id === "string" ? req.query.id : url.searchParams.get("id");

  if (req.method === "GET") {
    const { data, error } = await admin
      .from("partner_teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { partners: data || [] });
  }

  let body: any = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    return json(res, 400, { error: "Invalid JSON body" });
  }

  if (req.method === "POST") {
    const payload = cleanPartnerPayload(body);
    if (!payload.name || !payload.slug) return json(res, 400, { error: "Name and slug are required" });

    const { data, error } = await admin.from("partner_teams").insert(payload).select("*").single();
    if (error) return json(res, 400, { error: error.message });
    return json(res, 200, { partner: data });
  }

  if (req.method === "PUT") {
    const id = queryId || body.id;
    if (!id) return json(res, 400, { error: "id is required" });

    const payload = cleanPartnerPayload(body);
    if (!payload.name || !payload.slug) return json(res, 400, { error: "Name and slug are required" });

    const { data, error } = await admin.from("partner_teams").update(payload).eq("id", id).select("*").single();
    if (error) return json(res, 400, { error: error.message });
    return json(res, 200, { partner: data });
  }

  if (req.method === "PATCH") {
    const id = queryId || body.id;
    if (!id) return json(res, 400, { error: "id is required" });

    const patch: Record<string, unknown> = {};
    if (typeof body.approved === "boolean") patch.approved = body.approved;
    if (Object.keys(patch).length === 0) return json(res, 400, { error: "No supported fields to update" });

    const { data, error } = await admin.from("partner_teams").update(patch).eq("id", id).select("*").single();
    if (error) return json(res, 400, { error: error.message });
    return json(res, 200, { partner: data });
  }

  if (req.method === "DELETE") {
    const id = queryId || body.id;
    if (!id) return json(res, 400, { error: "id is required" });

    const { error } = await admin.from("partner_teams").delete().eq("id", id);
    if (error) return json(res, 400, { error: error.message });
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: "Method not allowed" });
}
