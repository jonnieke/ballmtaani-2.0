/**
 * Revenue Retention Service — Phase 13
 *
 * Tracks Gross Revenue Retention (GRR) and Net Revenue Retention (NRR)
 * for both consumer and B2B revenue streams.
 *
 * Revenue retention excludes new subscriber cohorts from the prior-period base.
 * Implementation fees are separated from recurring revenue.
 */

export interface ConsumerRetentionReport {
  period: string; // YYYY-MM
  startingPaidUsers: number;
  renewedUsers: number;
  expiredUsers: number;
  reactivatedUsers: number;
  upgrades: number;
  downgrades: number;
  repeatPassPurchases: number;
  startingRevenueMinor: number;
  retainedRevenueMinor: number;
  lostRevenueMinor: number;
  reactivatedRevenueMinor: number;
  currency: string;
  renewalRatePct: number;
  revenueRetentionPct: number;
}

export interface B2bRetentionReport {
  period: string; // YYYY-MM
  startingContractValueMinor: number;
  renewedValueMinor: number;
  expansionValueMinor: number;
  contractionValueMinor: number;
  churnedValueMinor: number;
  endingContractValueMinor: number;
  currency: string;
  grossRevenueRetentionPct: number;  // GRR = (starting - churn - contraction) / starting
  netRevenueRetentionPct: number;    // NRR = (starting - churn - contraction + expansion) / starting
  usageGrowthPct: number;
  seatGrowthPct: number;
}

export interface RetentionSummary {
  period: string;
  consumerRenewalRatePct: number;
  consumerRevenueRetentionPct: number;
  b2bGrrPct: number;
  b2bNrrPct: number;
  totalRevenueRetainedMinor: number;
  totalRevenueLostMinor: number;
  currency: string;
  trends: {
    consumerRenewal: "improving" | "stable" | "declining";
    b2bGrr: "improving" | "stable" | "declining";
    b2bNrr: "improving" | "stable" | "declining";
  };
}

export class RevenueRetentionService {
  /** Calculate consumer-tier revenue retention metrics. */
  static calculateConsumerRetention(params: {
    period: string;
    startingPaidUsers: number;
    renewedUsers: number;
    expiredUsers: number;
    reactivatedUsers: number;
    upgrades: number;
    downgrades: number;
    repeatPassPurchases: number;
    avgMonthlyRevenuePerUserMinor: number;
    avgPassRevenueMinor: number;
    currency: string;
  }): ConsumerRetentionReport {
    const startingRevenueMinor = params.startingPaidUsers * params.avgMonthlyRevenuePerUserMinor;
    const retainedRevenueMinor = params.renewedUsers * params.avgMonthlyRevenuePerUserMinor;
    const lostRevenueMinor = params.expiredUsers * params.avgMonthlyRevenuePerUserMinor;
    const reactivatedRevenueMinor = params.reactivatedUsers * params.avgMonthlyRevenuePerUserMinor;

    const renewalRatePct = params.startingPaidUsers > 0
      ? (params.renewedUsers / params.startingPaidUsers) * 100 : 0;

    const revenueRetentionPct = startingRevenueMinor > 0
      ? (retainedRevenueMinor / startingRevenueMinor) * 100 : 0;

    return {
      period: params.period,
      startingPaidUsers: params.startingPaidUsers,
      renewedUsers: params.renewedUsers,
      expiredUsers: params.expiredUsers,
      reactivatedUsers: params.reactivatedUsers,
      upgrades: params.upgrades,
      downgrades: params.downgrades,
      repeatPassPurchases: params.repeatPassPurchases,
      startingRevenueMinor,
      retainedRevenueMinor,
      lostRevenueMinor,
      reactivatedRevenueMinor,
      currency: params.currency,
      renewalRatePct: Math.round(renewalRatePct * 10) / 10,
      revenueRetentionPct: Math.round(revenueRetentionPct * 10) / 10,
    };
  }

  /** Calculate B2B GRR and NRR. Implementation fees excluded from recurring base. */
  static calculateB2bRetention(params: {
    period: string;
    startingRecurringValueMinor: number; // EXCLUDES one-time implementation fees
    renewedValueMinor: number;
    expansionValueMinor: number;         // upsells, additional seats, API upgrades
    contractionValueMinor: number;       // downgrades
    churnedValueMinor: number;           // full cancellations
    startingApiRequests: number;
    endingApiRequests: number;
    startingSeats: number;
    endingSeats: number;
    currency: string;
  }): B2bRetentionReport {
    const endingContractValueMinor =
      params.renewedValueMinor +
      params.expansionValueMinor -
      params.contractionValueMinor;

    // GRR = (starting - churn - contraction) / starting  [capped at 100%]
    const grossRetained = params.startingRecurringValueMinor
      - params.churnedValueMinor
      - params.contractionValueMinor;

    const grrPct = params.startingRecurringValueMinor > 0
      ? Math.min(100, (grossRetained / params.startingRecurringValueMinor) * 100)
      : 0;

    // NRR = (starting - churn - contraction + expansion) / starting  [can exceed 100%]
    const netRetained = grossRetained + params.expansionValueMinor;
    const nrrPct = params.startingRecurringValueMinor > 0
      ? (netRetained / params.startingRecurringValueMinor) * 100
      : 0;

    const usageGrowthPct = params.startingApiRequests > 0
      ? ((params.endingApiRequests - params.startingApiRequests) / params.startingApiRequests) * 100
      : 0;

    const seatGrowthPct = params.startingSeats > 0
      ? ((params.endingSeats - params.startingSeats) / params.startingSeats) * 100
      : 0;

    return {
      period: params.period,
      startingContractValueMinor: params.startingRecurringValueMinor,
      renewedValueMinor: params.renewedValueMinor,
      expansionValueMinor: params.expansionValueMinor,
      contractionValueMinor: params.contractionValueMinor,
      churnedValueMinor: params.churnedValueMinor,
      endingContractValueMinor,
      currency: params.currency,
      grossRevenueRetentionPct: Math.round(grrPct * 10) / 10,
      netRevenueRetentionPct: Math.round(nrrPct * 10) / 10,
      usageGrowthPct: Math.round(usageGrowthPct * 10) / 10,
      seatGrowthPct: Math.round(seatGrowthPct * 10) / 10,
    };
  }

  /** Generate a retention summary and trend assessment. */
  static buildRetentionSummary(
    consumer: ConsumerRetentionReport,
    b2b: B2bRetentionReport,
    priorConsumerRenewalPct: number,
    priorB2bGrrPct: number,
    priorB2bNrrPct: number
  ): RetentionSummary {
    const trend = (current: number, prior: number): "improving" | "stable" | "declining" => {
      const delta = current - prior;
      if (delta > 2) return "improving";
      if (delta < -2) return "declining";
      return "stable";
    };

    return {
      period: consumer.period,
      consumerRenewalRatePct: consumer.renewalRatePct,
      consumerRevenueRetentionPct: consumer.revenueRetentionPct,
      b2bGrrPct: b2b.grossRevenueRetentionPct,
      b2bNrrPct: b2b.netRevenueRetentionPct,
      totalRevenueRetainedMinor: consumer.retainedRevenueMinor + b2b.renewedValueMinor + b2b.expansionValueMinor,
      totalRevenueLostMinor: consumer.lostRevenueMinor + b2b.churnedValueMinor + b2b.contractionValueMinor,
      currency: consumer.currency,
      trends: {
        consumerRenewal: trend(consumer.renewalRatePct, priorConsumerRenewalPct),
        b2bGrr: trend(b2b.grossRevenueRetentionPct, priorB2bGrrPct),
        b2bNrr: trend(b2b.netRevenueRetentionPct, priorB2bNrrPct),
      },
    };
  }
}
