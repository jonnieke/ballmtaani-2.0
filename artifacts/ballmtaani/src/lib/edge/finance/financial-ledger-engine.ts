/**
 * BallMtaani Edge Phase 11 — Financial Ledger & Contribution Margin Engine
 */

export interface ProfitabilityBreakdown {
  grossRevenueKes: number;
  variableCosts: {
    dataCostKes: number;
    paymentFeesKes: number;
    messagingCostKes: number;
    partnerShareKes: number;
  };
  netRevenueKes: number;
  totalVariableCostKes: number;
  contributionMarginKes: number;
  contributionMarginPercentage: number;
}

export class FinancialLedgerEngine {
  static calculatePeriodProfitability(): ProfitabilityBreakdown {
    const grossRevenueKes = 2450000;
    const dataCostKes = 120000;
    const paymentFeesKes = 73500; // 3% M-Pesa fees
    const messagingCostKes = 45000;
    const partnerShareKes = 280000;

    const totalVariableCostKes = dataCostKes + paymentFeesKes + messagingCostKes + partnerShareKes;
    const netRevenueKes = grossRevenueKes;
    const contributionMarginKes = netRevenueKes - totalVariableCostKes;
    const contributionMarginPercentage = Math.round((contributionMarginKes / grossRevenueKes) * 10000) / 100;

    return {
      grossRevenueKes,
      variableCosts: {
        dataCostKes,
        paymentFeesKes,
        messagingCostKes,
        partnerShareKes,
      },
      netRevenueKes,
      totalVariableCostKes,
      contributionMarginKes,
      contributionMarginPercentage,
    };
  }
}
