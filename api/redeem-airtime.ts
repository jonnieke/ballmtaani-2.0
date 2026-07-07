/**
 * POST /api/redeem-airtime
 *
 * Secure server-side redemption for airtime & data reward items.
 *
 * Flow:
 *   1. Verify Supabase JWT → userId
 *   2. Look up reward_items (must be active, airtime/data category)
 *   3. Atomically deduct coins via deduct_coins() RPC (fallback: guarded UPDATE)
 *   4. Insert reward_redemptions as 'processing'
 *   5. Call Credofaster → delivered instantly
 *   6a. Success → status 'fulfilled', store transaction ID
 *   6b. Failure → refund coins, status 'failed', return error to client
 *
 * Required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CREDOFASTER_API_KEY
 *
 * Run the SQL in supabase-redeem-engine.sql first (adds deduct_coins RPC + value_kes column).
 */

import { loadEnv } from "./_env-loader";
import { createClient } from "@supabase/supabase-js";
import { sendAirtime } from "./_credofaster";

loadEnv();

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

// Parse KES amount from item name e.g. "Airtime 50 KES" → 50
function parseKesFromName(name: string): number | null {
  const m = String(name).match(/(\d+)\s*KES/i);
  return m ? parseInt(m[1], 10) : null;
}

async function refundCoins(admin: ReturnType<typeof createClient>, userId: string, amount: number) {
  const { error } = await admin.rpc("refund_coins", { p_user_id: userId, p_amount: amount });
  if (error) {
    // RPC not yet deployed — raw increment as fallback
    const { data: p } = await admin.from("profiles").select("coins").eq("id", userId).single();
    const cur = (p as any)?.coins ?? 0;
    await admin.from("profiles").update({ coins: cur + amount }).eq("id", userId);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey    = process.env.VITE_SUPABASE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) return json(res, 500, { error: "Server misconfigured" });

  // ── 1. Verify JWT ──────────────────────────────────────────────────────────
  const authHeader = String(req.headers["authorization"] ?? "");
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json(res, 401, { error: "Not authenticated" });

  const userClient = createClient(supabaseUrl, anonKey || serviceKey);
  const { data: { user }, error: authErr } = await userClient.auth.getUser(token);
  if (authErr || !user) return json(res, 401, { error: "Invalid session — please log in again" });

  const admin = createClient(supabaseUrl, serviceKey);

  // ── 2. Parse request body ──────────────────────────────────────────────────
  let body: { itemId?: string; phone?: string; notes?: string };
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    return json(res, 400, { error: "Invalid JSON body" });
  }

  const { itemId, phone, notes } = body;
  if (!itemId) return json(res, 400, { error: "itemId is required" });
  if (!phone)  return json(res, 400, { error: "phone is required" });

  // ── 3. Look up reward item ─────────────────────────────────────────────────
  const { data: item, error: itemErr } = await admin
    .from("reward_items")
    .select("id, name, category, cost_mtc, value_kes, active")
    .eq("id", itemId)
    .single() as any;

  if (itemErr || !item) return json(res, 404, { error: "Reward not found" });
  if (!item.active) return json(res, 410, { error: "This reward is no longer available" });
  if (!["airtime", "data"].includes(item.category)) {
    return json(res, 400, { error: "Only airtime and data rewards are auto-fulfilled" });
  }

  // Resolve KES amount — value_kes column preferred, fallback to parsing name
  const valueKes: number | null = item.value_kes ?? parseKesFromName(item.name);
  if (!valueKes) {
    return json(res, 500, { error: "Reward not configured for automated fulfillment — contact support" });
  }

  // ── 4. Atomic coin deduction ───────────────────────────────────────────────
  let deducted = false;
  const { data: rpcResult, error: rpcErr } = await admin.rpc("deduct_coins", {
    p_user_id: user.id,
    p_amount:  item.cost_mtc,
  });

  if (rpcErr) {
    // deduct_coins RPC not yet deployed — use guarded UPDATE fallback
    const { data: profile } = await admin
      .from("profiles").select("coins").eq("id", user.id).single() as any;
    const bal = profile?.coins ?? 0;
    if (bal < item.cost_mtc) {
      return json(res, 402, {
        error: `Not enough MTC — you have ${bal.toLocaleString()} but need ${item.cost_mtc.toLocaleString()}`,
      });
    }
    // Guarded update: only applies when coins hasn't dropped below threshold since SELECT
    const { data: updated } = await admin
      .from("profiles")
      .update({ coins: bal - item.cost_mtc })
      .eq("id", user.id)
      .gte("coins", item.cost_mtc)
      .select("id") as any;
    if (!updated || (Array.isArray(updated) && updated.length === 0)) {
      return json(res, 402, { error: "Insufficient MTC coins" });
    }
    deducted = true;
  } else if (rpcResult === false) {
    const { data: profile } = await admin
      .from("profiles").select("coins").eq("id", user.id).single() as any;
    const bal = profile?.coins ?? 0;
    return json(res, 402, {
      error: `Not enough MTC — you have ${bal.toLocaleString()} but need ${item.cost_mtc.toLocaleString()}`,
    });
  } else {
    deducted = true;
  }

  if (!deducted) return json(res, 402, { error: "Coin deduction failed — try again" });

  // ── 5. Create redemption record ────────────────────────────────────────────
  const { data: redemption, error: insertErr } = await admin
    .from("reward_redemptions")
    .insert({
      user_id:       user.id,
      user_email:    user.email || null,
      item_id:       item.id,
      item_name:     item.name,
      item_category: item.category,
      cost_mtc:      item.cost_mtc,
      contact_phone: phone,
      notes:         notes || null,
      status:        "processing",
    })
    .select("id")
    .single() as any;

  if (insertErr) {
    await refundCoins(admin, user.id, item.cost_mtc);
    return json(res, 500, { error: "Could not create redemption record — coins refunded" });
  }

  const redemptionId = redemption?.id;

  // ── 6. Call Credofaster ────────────────────────────────────────────────────
  const result = await sendAirtime({
    phone,
    amountKes: valueKes,
    category:  item.category as "airtime" | "data",
  });

  if (result.ok) {
    await admin
      .from("reward_redemptions")
      .update({
        status:              "fulfilled",
        credofaster_txn_id:  result.transactionId || null,
        fulfilled_at:        new Date().toISOString(),
        admin_note:          `Auto-fulfilled via Credofaster (${valueKes} KES)`,
      })
      .eq("id", redemptionId);

    return json(res, 200, {
      ok:            true,
      message:       `${item.name} sent to ${phone}!`,
      transactionId: result.transactionId,
    });
  }

  // Credofaster failed — refund and mark failed
  await refundCoins(admin, user.id, item.cost_mtc);
  await admin
    .from("reward_redemptions")
    .update({
      status:     "failed",
      admin_note: `Credofaster error: ${result.error ?? "unknown"}`,
    })
    .eq("id", redemptionId);

  return json(res, 502, {
    error: result.error?.includes("not configured")
      ? "Airtime service not yet live — your coins were not deducted"
      : `Airtime delivery failed — your ${item.cost_mtc.toLocaleString()} MTC have been refunded`,
  });
}
