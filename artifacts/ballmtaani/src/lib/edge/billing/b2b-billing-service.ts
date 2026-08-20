/**
 * B2B Billing Service — Phase 13
 *
 * Automated subscription management, immutable usage ledger,
 * invoice generation (11-step workflow), and billing dispute handling.
 *
 * All monetary values stored as integer minor units with explicit currency code.
 * Never uses floating-point for money calculations.
 */

export type SubscriptionStatus =
  | "trialing" | "active" | "past_due" | "suspended"
  | "cancelled" | "expired" | "terminated";

export type InvoiceStatus =
  | "draft" | "open" | "partially_paid" | "paid" | "past_due"
  | "disputed" | "void" | "written_off" | "refunded";

export type UsageType =
  | "api_request" | "premium_api_request" | "widget_view"
  | "webhook_delivery" | "data_export" | "active_seat"
  | "custom_domain" | "notification_delivery" | "storage_gb";

export type LineItemType =
  | "base_subscription" | "api_overage" | "premium_api_overage"
  | "widget_view_overage" | "additional_seat" | "custom_domain"
  | "premium_support" | "implementation_service" | "data_export"
  | "webhook_volume" | "tax" | "discount" | "adjustment";

export interface UsageEvent {
  id: string;
  tenantId: string;
  subscriptionId: string;
  usageType: UsageType;
  quantity: number;
  eventKey: string; // deduplication key — unique constraint in DB
  occurredAt: string;
  billingPeriod: string; // YYYY-MM
  status: "recorded" | "excluded" | "adjusted" | "billed" | "disputed";
}

export interface PeriodUsageSummary {
  tenantId: string;
  billingPeriod: string;
  byType: Record<UsageType, number>;
  totalEvents: number;
  deduplicatedEvents: number;
}

export interface InvoiceLineItem {
  lineType: LineItemType;
  description: string;
  quantity: number;
  unitPriceMinor: number;
  totalMinor: number;
  currency: string;
  pricingVersion: string;
}

export interface DraftInvoice {
  tenantId: string;
  subscriptionId: string;
  billingPeriod: string;
  invoiceNumber: string;
  lineItems: InvoiceLineItem[];
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: string;
  sanityChecks: { label: string; passed: boolean; note?: string }[];
  autoApproved: boolean;
  warnings: string[];
}

export interface DisputeRecord {
  id: string;
  invoiceId: string;
  tenantId: string;
  reason: string;
  status: "open" | "under_review" | "resolved_accepted" | "resolved_rejected" | "adjustment_issued" | "closed";
  openedBy: string;
  createdAt: string;
}

export interface UsageAdjustment {
  originalEventId: string;
  adjustmentType: "credit" | "correction" | "dispute_resolution" | "goodwill";
  quantityDelta: number;
  reason: string;
  approvedBy: string;
}

export class B2bBillingService {
  /** Record a usage event. Deduplication via eventKey — caller must supply a stable key. */
  static recordUsageEvent(params: Omit<UsageEvent, "id" | "status">): UsageEvent | { error: string } {
    if (!params.eventKey || params.eventKey.trim() === "") {
      return { error: "A stable, unique eventKey is required for usage deduplication." };
    }
    if (params.quantity <= 0) {
      return { error: "Usage quantity must be a positive integer." };
    }
    const periodPattern = /^\d{4}-\d{2}$/;
    if (!periodPattern.test(params.billingPeriod)) {
      return { error: `Invalid billingPeriod '${params.billingPeriod}'. Expected YYYY-MM.` };
    }

    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...params,
      status: "recorded",
    };
  }

  /** Aggregate usage for a billing period (simulated). */
  static aggregatePeriodUsage(events: UsageEvent[]): PeriodUsageSummary {
    const byType: Partial<Record<UsageType, number>> = {};
    const seenKeys = new Set<string>();
    let deduplicatedEvents = 0;

    for (const event of events) {
      if (seenKeys.has(event.eventKey)) { deduplicatedEvents++; continue; }
      seenKeys.add(event.eventKey);
      if (event.status === "excluded") continue;
      byType[event.usageType] = (byType[event.usageType] ?? 0) + event.quantity;
    }

    return {
      tenantId: events[0]?.tenantId ?? "",
      billingPeriod: events[0]?.billingPeriod ?? "",
      byType: byType as Record<UsageType, number>,
      totalEvents: events.length,
      deduplicatedEvents,
    };
  }

  /**
   * 11-step invoice generation workflow.
   * Step 1: close period → Step 2: validate → Step 3: apply allowance →
   * Step 4: calculate overage → Step 5: apply discounts → Step 6: apply tax →
   * Step 7: generate draft → Step 8: sanity checks → Step 9: approve →
   * Step 10: issue → Step 11: track payment
   */
  static generateDraftInvoice(params: {
    tenantId: string;
    subscriptionId: string;
    billingPeriod: string;
    planKey: string;
    baseMonthlyMinor: number;
    currency: string;
    includedApiRequests: number;
    includedWidgetViews: number;
    overageApiPricePerThousandMinor: number;
    overageWidgetPricePer10kMinor: number;
    actualApiRequests: number;
    actualWidgetViews: number;
    discountMinor?: number;
    taxRatePct?: number;
    pricingVersion: string;
  }): DraftInvoice {
    const lineItems: InvoiceLineItem[] = [];
    const warnings: string[] = [];

    // Step 1–2: Validate inputs
    if (params.baseMonthlyMinor < 0) warnings.push("Negative base price — review pricing configuration.");
    if (params.actualApiRequests < 0) warnings.push("Negative API usage — possible data error.");

    // Step 3: Apply included allowance
    const excessApiRequests = Math.max(0, params.actualApiRequests - params.includedApiRequests);
    const excessWidgetViews = Math.max(0, params.actualWidgetViews - params.includedWidgetViews);

    // Base subscription line
    lineItems.push({
      lineType: "base_subscription",
      description: `${params.planKey} — ${params.billingPeriod}`,
      quantity: 1,
      unitPriceMinor: params.baseMonthlyMinor,
      totalMinor: params.baseMonthlyMinor,
      currency: params.currency,
      pricingVersion: params.pricingVersion,
    });

    // Step 4: Calculate API overage
    if (excessApiRequests > 0) {
      const overageUnits = Math.ceil(excessApiRequests / 1000);
      const overageTotal = overageUnits * params.overageApiPricePerThousandMinor;
      lineItems.push({
        lineType: "api_overage",
        description: `API overage: ${excessApiRequests.toLocaleString()} requests (${overageUnits}k units)`,
        quantity: overageUnits,
        unitPriceMinor: params.overageApiPricePerThousandMinor,
        totalMinor: overageTotal,
        currency: params.currency,
        pricingVersion: params.pricingVersion,
      });
    }

    // Widget view overage
    if (excessWidgetViews > 0) {
      const overageUnits = Math.ceil(excessWidgetViews / 10_000);
      const overageTotal = overageUnits * params.overageWidgetPricePer10kMinor;
      lineItems.push({
        lineType: "widget_view_overage",
        description: `Widget view overage: ${excessWidgetViews.toLocaleString()} views (${overageUnits}×10k)`,
        quantity: overageUnits,
        unitPriceMinor: params.overageWidgetPricePer10kMinor,
        totalMinor: overageTotal,
        currency: params.currency,
        pricingVersion: params.pricingVersion,
      });
    }

    // Step 5: Apply discount
    const subtotalMinor = lineItems.reduce((acc, l) => acc + l.totalMinor, 0);
    const discountMinor = Math.min(params.discountMinor ?? 0, subtotalMinor);
    if (discountMinor > 0) {
      lineItems.push({ lineType: "discount", description: "Applied discount", quantity: 1, unitPriceMinor: -discountMinor, totalMinor: -discountMinor, currency: params.currency, pricingVersion: params.pricingVersion });
    }

    // Step 6: Apply tax
    const taxableMinor = subtotalMinor - discountMinor;
    const taxRatePct = params.taxRatePct ?? 0;
    const taxMinor = Math.round(taxableMinor * taxRatePct / 100);
    if (taxMinor > 0) {
      lineItems.push({ lineType: "tax", description: `VAT ${taxRatePct}%`, quantity: 1, unitPriceMinor: taxMinor, totalMinor: taxMinor, currency: params.currency, pricingVersion: params.pricingVersion });
    }

    const totalMinor = taxableMinor + taxMinor;

    // Step 8: Sanity checks
    const sanityChecks = [
      { label: "total_positive",           passed: totalMinor >= 0,                 note: totalMinor < 0 ? "Total is negative — review adjustments" : undefined },
      { label: "base_price_present",       passed: params.baseMonthlyMinor > 0,     note: params.baseMonthlyMinor === 0 ? "Zero base price — confirm this is correct" : undefined },
      { label: "overage_not_excessive",    passed: excessApiRequests < params.includedApiRequests * 10, note: excessApiRequests >= params.includedApiRequests * 10 ? "Overage is 10× included — may indicate data error" : undefined },
      { label: "currency_consistent",      passed: lineItems.every(l => l.currency === params.currency) },
      { label: "pricing_version_present",  passed: params.pricingVersion.length > 0 },
    ];

    // Step 9: Auto-approve if low-risk
    const autoApproved = sanityChecks.every(c => c.passed) && totalMinor < 50_000_00; // < 500k KES

    return {
      tenantId: params.tenantId,
      subscriptionId: params.subscriptionId,
      billingPeriod: params.billingPeriod,
      invoiceNumber: `INV-${params.billingPeriod}-${params.tenantId.slice(0, 6).toUpperCase()}`,
      lineItems,
      subtotalMinor,
      discountMinor,
      taxMinor,
      totalMinor,
      currency: params.currency,
      sanityChecks,
      autoApproved,
      warnings,
    };
  }

  /** Open a billing dispute. Does not modify the original usage ledger. */
  static openDispute(params: {
    invoiceId: string;
    tenantId: string;
    reason: string;
    openedBy: string;
  }): DisputeRecord {
    return {
      id: `disp_${Date.now()}`,
      invoiceId: params.invoiceId,
      tenantId: params.tenantId,
      reason: params.reason,
      status: "open",
      openedBy: params.openedBy,
      createdAt: new Date().toISOString(),
    };
  }

  /** Create a usage adjustment record. Never modifies the original event. */
  static createUsageAdjustment(params: UsageAdjustment): UsageAdjustment & { adjustmentId: string } {
    if (!params.approvedBy || params.approvedBy.trim() === "") {
      throw new Error("Approver is required for usage adjustments.");
    }
    return { ...params, adjustmentId: `adj_${Date.now()}` };
  }
}
