/**
 * Marketplace Order Service — Phase 14
 *
 * Handles the complete marketplace purchase flow:
 * server-side price validation → payment → entitlement →
 * commission calculation → earnings creation → refund window → payout eligibility.
 *
 * CRITICAL RULES:
 * - Server validates price at checkout — never trust client-supplied price
 * - Seller earnings are pending until refund window passes
 * - Payout cannot exceed available earnings
 * - Marketplace GMV is NEVER reported as BallMtaani revenue
 * - All amounts in integer minor units
 */

export interface MarketplaceProduct {
  id: string;
  sellerId: string;
  priceMinor: number;
  currency: string;
  billingType: string;
  moderationStatus: string;
  status: string;
  refundWindowDays?: number; // default: 7
}

export interface CommissionRule {
  sellerType: string;
  productType: string;
  commissionPct: number;
  fixedFeeMinor: number;
}

export interface OrderDraft {
  buyerUserId: string;
  sellerId: string;
  productId: string;
  productVersionId?: string;
  quantity: number;
  // Server-side validated amounts
  unitPriceMinor: number;
  grossAmountMinor: number;
  discountAmountMinor: number;
  taxAmountMinor: number;
  totalAmountMinor: number;
  currency: string;
  refundEligibleUntil: string; // ISO timestamp
}

export interface EarningsRecord {
  orderId: string;
  sellerId: string;
  grossAmountMinor: number;
  platformCommissionMinor: number;
  paymentFeeMinor: number;
  taxWithheldMinor: number;
  sellerNetMinor: number;
  currency: string;
  status: "pending" | "available" | "payable" | "paid" | "held" | "reversed" | "disputed";
  availableAt: string; // ISO — when refund window closes
}

export interface MarketplaceFinancialSummary {
  grossMerchandiseValueMinor: number; // GMV = total buyer spend
  platformCommissionMinor: number;    // Platform revenue
  paymentFeesMinor: number;
  sellerEarningsMinor: number;        // Net to sellers
  refundsMinor: number;
  currency: string;
  // Note: GMV ≠ BallMtaani revenue. Only commission is platform revenue.
}

// Default refund window
const DEFAULT_REFUND_WINDOW_DAYS = 7;

// Default payment fee (platform cost, not revenue)
const DEFAULT_PAYMENT_FEE_PCT = 0.025; // 2.5%

// Tax withholding rate for applicable sellers
const WITHHOLDING_TAX_PCT = 0.05; // 5% (illustrative — jurisdiction-specific)

export class MarketplaceOrderService {
  /**
   * Validate a product is purchasable and return the server-authoritative price.
   * Client-supplied price is NEVER trusted.
   */
  static validateProductForPurchase(
    product: MarketplaceProduct,
    clientSuppliedPriceMinor: number
  ): { valid: boolean; serverPriceMinor: number; currency: string; errors: string[] } {
    const errors: string[] = [];

    if (product.status !== "approved") {
      errors.push(`Product status '${product.status}' is not purchasable.`);
    }
    if (product.moderationStatus !== "approved") {
      errors.push(`Product moderation status '${product.moderationStatus}' blocks purchase.`);
    }

    // Price mismatch — buyer must be shown the corrected price
    if (clientSuppliedPriceMinor !== product.priceMinor) {
      errors.push(`Price mismatch: client submitted ${clientSuppliedPriceMinor} but server price is ${product.priceMinor} ${product.currency}.`);
    }

    return {
      valid: errors.length === 0,
      serverPriceMinor: product.priceMinor,
      currency: product.currency,
      errors,
    };
  }

  /**
   * Build an order draft with server-authoritative amounts.
   * Discount and tax must be computed server-side.
   */
  static buildOrderDraft(params: {
    buyerUserId: string;
    product: MarketplaceProduct;
    quantity: number;
    discountAmountMinor: number;
    taxRatePct: number;
    refundWindowDays?: number;
  }): { order: OrderDraft; warnings: string[] } {
    const warnings: string[] = [];

    // Validate amounts are integers (no floats)
    if (!Number.isInteger(params.product.priceMinor)) {
      warnings.push("Product price is not an integer minor unit. This indicates a data integrity issue.");
    }
    if (!Number.isInteger(params.discountAmountMinor)) {
      warnings.push("Discount amount is not an integer minor unit.");
    }

    const grossAmountMinor = params.product.priceMinor * params.quantity;
    const discountAmountMinor = Math.min(params.discountAmountMinor, grossAmountMinor);
    const taxableAmountMinor = grossAmountMinor - discountAmountMinor;
    const taxAmountMinor = Math.round(taxableAmountMinor * (params.taxRatePct / 100));
    const totalAmountMinor = taxableAmountMinor + taxAmountMinor;

    const refundWindowDays = params.refundWindowDays ?? DEFAULT_REFUND_WINDOW_DAYS;
    const refundEligibleUntil = new Date(Date.now() + refundWindowDays * 86_400_000).toISOString();

    return {
      order: {
        buyerUserId: params.buyerUserId,
        sellerId: params.product.sellerId,
        productId: params.product.id,
        quantity: params.quantity,
        unitPriceMinor: params.product.priceMinor,
        grossAmountMinor,
        discountAmountMinor,
        taxAmountMinor,
        totalAmountMinor,
        currency: params.product.currency,
        refundEligibleUntil,
      },
      warnings,
    };
  }

  /**
   * Calculate seller earnings after commission and fees.
   * Enforces the accounting identity: net = gross − commission − fees − tax.
   */
  static calculateEarnings(params: {
    orderId: string;
    sellerId: string;
    grossAmountMinor: number;
    currency: string;
    commissionRule: CommissionRule;
    applyWithholdingTax: boolean;
    refundWindowDays?: number;
  }): EarningsRecord {
    const { grossAmountMinor, currency } = params;

    // Commission
    const commissionFromPct = Math.round(grossAmountMinor * (params.commissionRule.commissionPct / 100));
    const platformCommissionMinor = commissionFromPct + params.commissionRule.fixedFeeMinor;

    // Payment processing fee (platform cost, deducted from gross before seller payment)
    const paymentFeeMinor = Math.round(grossAmountMinor * DEFAULT_PAYMENT_FEE_PCT);

    // Tax withholding (jurisdiction-dependent)
    const afterCommission = grossAmountMinor - platformCommissionMinor - paymentFeeMinor;
    const taxWithheldMinor = params.applyWithholdingTax
      ? Math.round(afterCommission * WITHHOLDING_TAX_PCT)
      : 0;

    // Net to seller — accounting identity
    const sellerNetMinor = grossAmountMinor - platformCommissionMinor - paymentFeeMinor - taxWithheldMinor;

    const refundWindowDays = params.refundWindowDays ?? DEFAULT_REFUND_WINDOW_DAYS;
    const availableAt = new Date(Date.now() + refundWindowDays * 86_400_000).toISOString();

    return {
      orderId: params.orderId,
      sellerId: params.sellerId,
      grossAmountMinor,
      platformCommissionMinor,
      paymentFeeMinor,
      taxWithheldMinor,
      sellerNetMinor,
      currency,
      status: "pending", // pending until refund window passes
      availableAt,
    };
  }

  /**
   * Process a refund — reverses the earnings record.
   * Payout may NEVER have been initiated before this is called.
   */
  static processRefund(params: {
    orderId: string;
    earnings: EarningsRecord;
    refundAmountMinor: number;
    reason: string;
  }): { valid: boolean; errors: string[]; reversalEntry?: Partial<EarningsRecord> } {
    const errors: string[] = [];

    if (params.earnings.status === "paid") {
      errors.push("Cannot refund order where seller earnings have already been paid out. Raise a manual reconciliation.");
    }
    if (params.refundAmountMinor > params.earnings.grossAmountMinor) {
      errors.push(`Refund amount (${params.refundAmountMinor}) exceeds gross order amount (${params.earnings.grossAmountMinor}).`);
    }
    if (!params.reason || params.reason.trim().length < 5) {
      errors.push("Refund reason must be provided.");
    }

    if (errors.length > 0) return { valid: false, errors };

    const reversalEntry: Partial<EarningsRecord> = {
      orderId: params.orderId,
      sellerId: params.earnings.sellerId,
      grossAmountMinor: -params.refundAmountMinor,
      platformCommissionMinor: -Math.round(params.refundAmountMinor * 0.15), // proportional reversal
      sellerNetMinor: -(params.refundAmountMinor - Math.round(params.refundAmountMinor * 0.15)),
      currency: params.earnings.currency,
      status: "reversed",
    };

    return { valid: true, errors: [], reversalEntry };
  }

  /**
   * Compute a marketplace financial summary.
   * GMV is explicitly separated from platform commission revenue.
   */
  static computeFinancialSummary(earningsRecords: EarningsRecord[]): MarketplaceFinancialSummary {
    let gmv = 0, commission = 0, fees = 0, netSeller = 0, refunds = 0;

    for (const e of earningsRecords) {
      if (e.status === "reversed") {
        refunds += Math.abs(e.grossAmountMinor);
      } else {
        gmv += e.grossAmountMinor;
        commission += e.platformCommissionMinor;
        fees += e.paymentFeeMinor;
        netSeller += e.sellerNetMinor;
      }
    }

    return {
      grossMerchandiseValueMinor: gmv,
      platformCommissionMinor: commission,
      paymentFeesMinor: fees,
      sellerEarningsMinor: netSeller,
      refundsMinor: refunds,
      currency: earningsRecords[0]?.currency ?? "KES",
    };
  }

  /**
   * Validate a payout amount does not exceed available earnings.
   */
  static validatePayoutAmount(params: {
    requestedPayoutMinor: number;
    availableEarningsMinor: number;
    minimumPayoutMinor: number;
    currency: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (params.requestedPayoutMinor > params.availableEarningsMinor) {
      errors.push(`Requested payout (${params.requestedPayoutMinor}) exceeds available earnings (${params.availableEarningsMinor}) ${params.currency}.`);
    }
    if (params.requestedPayoutMinor < params.minimumPayoutMinor) {
      errors.push(`Requested payout (${params.requestedPayoutMinor}) is below minimum threshold (${params.minimumPayoutMinor}) ${params.currency}.`);
    }
    return { valid: errors.length === 0, errors };
  }
}
