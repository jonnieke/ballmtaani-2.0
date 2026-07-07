/**
 * Credofaster Airtime API adapter.
 *
 * Required env vars (add in Vercel dashboard):
 *   CREDOFASTER_API_KEY     — from Credofaster dashboard (info@credofaster.com)
 *   CREDOFASTER_API_SECRET  — if required (check with Credofaster)
 *   CREDOFASTER_API_URL     — override base URL (default: https://api.credofaster.co.ke)
 *
 * Phone numbers: any Kenyan format accepted (07xx, 01xx, 2547xx, +254xx).
 * All are normalised to 254XXXXXXXXX before the API call.
 */

const DEFAULT_BASE = "https://api.credofaster.co.ke";

export interface AirtimeResult {
  ok: boolean;
  transactionId?: string;
  error?: string;
}

export async function sendAirtime(params: {
  phone: string;
  amountKes: number;
  category?: "airtime" | "data";
}): Promise<AirtimeResult> {
  const apiKey    = process.env.CREDOFASTER_API_KEY;
  const apiSecret = process.env.CREDOFASTER_API_SECRET;
  const baseUrl   = (process.env.CREDOFASTER_API_URL ?? DEFAULT_BASE).replace(/\/$/, "");

  if (!apiKey) {
    return { ok: false, error: "CREDOFASTER_API_KEY not configured" };
  }

  const phone = normalizePhone(params.phone);
  if (!phone) {
    return { ok: false, error: `Invalid phone number: ${params.phone}` };
  }

  try {
    const res = await fetch(`${baseUrl}/v1/topup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        ...(apiSecret ? { "X-Api-Secret": apiSecret } : {}),
      },
      body: JSON.stringify({
        phone,
        amount: params.amountKes,
        product_type: params.category === "data" ? "data" : "airtime",
      }),
    });

    const data = await res.json() as Record<string, any>;

    if (!res.ok || data?.status === "error" || data?.success === false) {
      return {
        ok: false,
        error: data?.message ?? data?.error ?? `Credofaster error (HTTP ${res.status})`,
      };
    }

    return {
      ok: true,
      transactionId: String(data?.transaction_id ?? data?.transactionId ?? data?.id ?? ""),
    };
  } catch (err: any) {
    return { ok: false, error: String(err?.message ?? err) };
  }
}

// Normalize any Kenyan phone format → 254XXXXXXXXX (12 digits)
export function normalizePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("254") && d.length === 12) return d;           // already international
  if (d.startsWith("0")   && d.length === 10) return "254" + d.slice(1); // 07xx / 01xx
  if (d.startsWith("7")   && d.length === 9)  return "254" + d;   // 7xx (no leading 0)
  if (d.startsWith("1")   && d.length === 9)  return "254" + d;   // 1xx Airtel
  return null;
}
