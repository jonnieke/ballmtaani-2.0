/**
 * POST /api/redeem-airtime
 *
 * Secure server-side redemption for airtime and data reward items.
 *
 * Flow:
 *   1. Verify Supabase JWT -> userId
 *   2. Look up reward_items (must be active, airtime/data category)
 *   3. Atomically deduct coins via deduct_coins() RPC (fallback: guarded UPDATE)
 *   4. Insert reward_redemptions as pending
 *   5. If Credofaster is configured, try to fulfill immediately
 *   6. If not configured, notify admins via Telegram for manual fulfillment
 *
 * Required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID
 *                    CREDOFASTER_API_KEY (activates auto-fulfillment)
 */

import { loadEnv } from "./_env-loader";
import { createClient } from "@supabase/supabase-js";
import { sendTelegramMessage } from "./_telegram";
import { sendAirtime } from "./_credofaster";

loadEnv();

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function parseKesFromName(name: string): number | null {
  const match = String(name).match(/(?:Ksh|KSH|KES)\s*(\d+)|(\d+)\s*(?:Ksh|KSH|KES)/i);
  const raw = match?.[1] ?? match?.[2];
  return raw ? parseInt(raw, 10) : null;
}

async function refundCoins(admin: any, userId: string, amount: number) {
  const { error } = await admin.rpc("refund_coins", { p_user_id: userId, p_amount: amount });
  if (error) {
    const { data: profile } = await admin.from("profiles").select("coins").eq("id", userId).single();
    const current = (profile as any)?.coins ?? 0;
    await admin.from("profiles").update({ coins: current + amount }).eq("id", userId);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) return json(res, 500, { error: "Server misconfigured" });

  const authHeader = String(req.headers["authorization"] ?? "");
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json(res, 401, { error: "Not authenticated" });

  const userClient = createClient(supabaseUrl, anonKey || serviceKey);
  const {
    data: { user },
    error: authErr,
  } = await userClient.auth.getUser(token);
  if (authErr || !user) return json(res, 401, { error: "Invalid session - please log in again" });

  const admin = createClient(supabaseUrl, serviceKey);

  let body: { itemId?: string; phone?: string; notes?: string };
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    return json(res, 400, { error: "Invalid JSON body" });
  }

  const { itemId, phone, notes } = body;
  if (!itemId) return json(res, 400, { error: "itemId is required" });
  if (!phone) return json(res, 400, { error: "phone is required" });

  const { data: item, error: itemErr } = await admin
    .from("reward_items")
    .select("id, name, category, cost_mtc, value_kes, active")
    .eq("id", itemId)
    .single() as any;

  if (itemErr || !item) return json(res, 404, { error: "Reward not found" });
  if (!item.active) return json(res, 410, { error: "This reward is no longer available" });
  if (!["airtime", "data"].includes(item.category)) {
    return json(res, 400, { error: "Only airtime and data rewards use this endpoint" });
  }

  const valueKes: number | null = item.value_kes ?? parseKesFromName(item.name);

  let deducted = false;
  const { data: rpcResult, error: rpcErr } = await admin.rpc("deduct_coins", {
    p_user_id: user.id,
    p_amount: item.cost_mtc,
  });

  if (rpcErr) {
    const { data: profile } = await admin.from("profiles").select("coins").eq("id", user.id).single() as any;
    const balance = profile?.coins ?? 0;
    if (balance < item.cost_mtc) {
      return json(res, 402, {
        error: `Not enough MTC - you have ${balance.toLocaleString()} but need ${item.cost_mtc.toLocaleString()}`,
      });
    }

    const { data: updated } = await admin
      .from("profiles")
      .update({ coins: balance - item.cost_mtc })
      .eq("id", user.id)
      .gte("coins", item.cost_mtc)
      .select("id") as any;

    if (!updated || (Array.isArray(updated) && updated.length === 0)) {
      return json(res, 402, { error: "Insufficient MTC coins" });
    }

    deducted = true;
  } else if (rpcResult === false) {
    const { data: profile } = await admin.from("profiles").select("coins").eq("id", user.id).single() as any;
    const balance = profile?.coins ?? 0;
    return json(res, 402, {
      error: `Not enough MTC - you have ${balance.toLocaleString()} but need ${item.cost_mtc.toLocaleString()}`,
    });
  } else {
    deducted = true;
  }

  if (!deducted) return json(res, 402, { error: "Coin deduction failed - try again" });

  const { data: redemption, error: insertErr } = await admin
    .from("reward_redemptions")
    .insert({
      user_id: user.id,
      user_email: user.email || null,
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      cost_mtc: item.cost_mtc,
      contact_phone: phone,
      notes: notes || null,
      status: "pending",
    })
    .select("id")
    .single() as any;

  if (insertErr) {
    await refundCoins(admin, user.id, item.cost_mtc);
    return json(res, 500, { error: "Could not save request - coins refunded" });
  }

  const redemptionId = redemption?.id;
  const credofasterKey = process.env.CREDOFASTER_API_KEY;

  if (credofasterKey && valueKes) {
    const result = await sendAirtime({
      phone,
      amountKes: valueKes,
      category: item.category as "airtime" | "data",
    });

    if (result.ok) {
      await admin
        .from("reward_redemptions")
        .update({
          status: "fulfilled",
          credofaster_txn_id: result.transactionId || null,
          fulfilled_at: new Date().toISOString(),
          admin_note: `Auto-fulfilled via Credofaster (${valueKes} KES)`,
        })
        .eq("id", redemptionId);

      sendTelegramMessage(
        `✅ <b>Airtime Auto-Sent</b>\n\n📱 <b>${item.name}</b>\n📞 ${phone}\n👤 ${user.email ?? "fan"}\n🔖 Txn: ${result.transactionId ?? "-"}`,
        { disableWebPagePreview: true }
      ).catch(() => {});

      return json(res, 200, {
        ok: true,
        message: `${item.name} sent to ${phone}!`,
        transactionId: result.transactionId,
        auto: true,
      });
    }

    await refundCoins(admin, user.id, item.cost_mtc);
    await admin
      .from("reward_redemptions")
      .update({
        status: "failed",
        admin_note: `Credofaster error: ${result.error ?? "unknown"}`,
      })
      .eq("id", redemptionId);

    sendTelegramMessage(
      `⚠️ <b>Airtime Auto-Fill Failed</b>\n\n📱 <b>${item.name}</b>\n📞 ${phone}\n👤 ${user.email ?? user.id}\n💰 ${item.cost_mtc.toLocaleString()} MTC refunded\n🧾 ${result.error ?? "Unknown error"}`,
      { disableWebPagePreview: true }
    ).catch(() => {});

    return json(res, 502, {
      error: `Airtime delivery failed - your ${item.cost_mtc.toLocaleString()} MTC have been refunded`,
    });
  }

  const tgAlert = [
    `🎁 <b>New Airtime Redemption</b>`,
    ``,
    `📱 <b>${item.name}</b>`,
    `📞 Phone: <code>${phone}</code>`,
    `👤 ${user.email ?? user.id}`,
    `💰 ${item.cost_mtc.toLocaleString()} MTC deducted`,
    notes ? `📝 Note: ${notes}` : null,
    ``,
    `→ Top up via Credofaster then mark fulfilled at ballmtaani.com/admin/rewards`,
  ].filter(Boolean).join("\n");

  sendTelegramMessage(tgAlert, { disableWebPagePreview: true }).catch(() => {});

  return json(res, 200, {
    ok: true,
    message: "Request received! Your airtime will be sent within 24 hours.",
    manual: true,
  });
}
