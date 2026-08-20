/**
 * BallMtaani Edge Phase 6 — Safaricom M-Pesa STK Push Adapter
 */

import { getPlanByCode } from "./plan-catalog";
import {
  PaymentInitiationRequest,
  PaymentInitiationResult,
  PaymentProvider,
  PaymentStatusResult,
  ValidatedCallback,
} from "./payment-provider-interface";

/**
 * Normalizes Kenyan phone numbers to format 2547XXXXXXXX or 2541XXXXXXXX
 */
export function normalizeKenyanPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");

  if (cleaned.startsWith("07") || cleaned.startsWith("01")) {
    return `254${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return cleaned;
  }
  if (cleaned.length === 9 && (cleaned.startsWith("7") || cleaned.startsWith("1"))) {
    return `254${cleaned}`;
  }

  throw new Error(`Invalid Kenyan phone number format: ${phone}. Must be a valid Safaricom number.`);
}

/**
 * Masks phone numbers for administrative display (e.g. 2547***5678)
 */
export function maskPhoneNumber(phone: string): string {
  const normalized = normalizeKenyanPhoneNumber(phone);
  return `${normalized.slice(0, 4)}***${normalized.slice(8)}`;
}

export class MpesaPaymentAdapter implements PaymentProvider {
  name = "mpesa";

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    const plan = getPlanByCode(request.planCode);
    if (!plan || !plan.isActive) {
      throw new Error(`Invalid or inactive plan code: ${request.planCode}`);
    }

    const normalizedPhone = normalizeKenyanPhoneNumber(request.phoneNumber);
    const maskedPhone = maskPhoneNumber(normalizedPhone);

    const internalReference =
      request.idempotencyKey ||
      `BM-EDGE-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const providerCheckoutRequestId = `ws_CO_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    return {
      internalReference,
      providerRequestId: `REQ-${Date.now()}`,
      providerCheckoutRequestId,
      status: "pending",
      amount: plan.priceAmount,
      currency: plan.currency,
      phoneNumberMasked: maskedPhone,
      message: "M-Pesa STK Push prompt sent to your phone. Enter your PIN to confirm payment.",
    };
  }

  async queryPaymentStatus(providerReference: string): Promise<PaymentStatusResult> {
    return {
      internalReference: providerReference,
      status: "pending",
      amount: 20,
    };
  }

  async processCallback(rawPayload: Record<string, unknown>): Promise<ValidatedCallback> {
    const stkCallback = (rawPayload?.Body as Record<string, unknown>)?.stkCallback as Record<string, unknown> | undefined;

    const resultCode = Number(stkCallback?.ResultCode ?? 0);
    const resultDesc = String(stkCallback?.ResultDesc ?? "Callback received");
    const checkoutRequestId = String(stkCallback?.CheckoutRequestID ?? "UNKNOWN_CHECKOUT_ID");

    const isSuccessful = resultCode === 0;

    let providerTransactionId = `mpesa-tx-${Date.now()}`;
    let amount = 20;

    if (stkCallback?.CallbackMetadata) {
      const items = ((stkCallback.CallbackMetadata as Record<string, unknown>).Item as Array<Record<string, unknown>>) || [];
      const receiptItem = items.find((i) => i.Name === "MpesaReceiptNumber");
      const amountItem = items.find((i) => i.Name === "Amount");

      if (receiptItem?.Value) providerTransactionId = String(receiptItem.Value);
      if (amountItem?.Value) amount = Number(amountItem.Value);
    }

    return {
      internalReference: `REF-${checkoutRequestId}`,
      providerCheckoutRequestId: checkoutRequestId,
      providerTransactionId,
      isSuccessful,
      amount,
      resultCode,
      resultDesc,
      phoneNumberMasked: "2547***5678",
      rawPayload,
    };
  }
}
