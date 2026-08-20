/**
 * Corporate Structure Service — Phase 14
 *
 * Manages corporate entities, share classes, shareholdings,
 * cap table computation, equity grants and convertible instruments.
 *
 * CRITICAL RULES:
 * - Shares are stored as BIGINT integer units — never floating-point
 * - Cap table percentages are derived, not stored authoritatively
 * - Equity grants are not legally effective without approval_reference
 * - Historical shareholding records are never overwritten
 * - Do not calculate legal conversion of convertible instruments without legal review
 */

export type EntityType =
  | "operating_company" | "holding_company" | "subsidiary"
  | "regional_entity" | "special_purpose_vehicle";

export type EntityStatus =
  | "planned" | "active" | "dormant" | "winding_down" | "dissolved";

export interface CorporateEntity {
  id: string;
  legalName: string;
  tradingName?: string;
  entityType: EntityType;
  jurisdiction: string;
  registrationNumber?: string;
  incorporationDate?: string;
  status: EntityStatus;
  parentEntityId?: string;
  primaryCurrency: string;
  financialYearEnd?: string;
}

export interface ShareClass {
  id: string;
  corporateEntityId: string;
  name: string;
  classKey: string;
  votingRights: string;   // e.g. '1_per_share', 'none', '10_per_share'
  authorizedShares: bigint;
}

export interface Shareholding {
  id: string;
  shareholderId: string;
  shareholderName: string;
  corporateEntityId: string;
  shareClassId: string;
  shareClassKey: string;
  sharesHeld: bigint;
  issuePriceMinor?: bigint;
  currency?: string;
  issueDate: string;
  status: string; // 'active','transferred','cancelled'
}

export interface EquityGrant {
  id: string;
  corporateEntityId: string;
  recipientReference: string;
  grantType: string; // 'option','rsu','advisory_grant','restricted_share'
  shareClassId?: string;
  totalUnits: bigint;
  exercisePriceMinor?: bigint;
  currency?: string;
  grantDate: string;
  vestingStart: string;
  cliffMonths: number;
  status: string;
  approvalReference?: string; // REQUIRED before grant is effective
}

export interface ConvertibleInstrument {
  id: string;
  corporateEntityId: string;
  investorReference: string;
  instrumentType: string;
  principalMinor: bigint;
  currency: string;
  issueDate: string;
  maturityDate?: string;
  interestRatePct?: number;
  valuationCapMinor?: bigint;
  discountRatePct?: number;
  status: string;
}

export interface CapTableRow {
  shareholderId: string;
  shareholderName: string;
  shareClassKey: string;
  sharesHeld: bigint;
  pctOfClass: string;     // displayed as string to avoid float authority
  pctOfTotal: string;
  votingPctOfTotal: string;
}

export interface CapTable {
  corporateEntityId: string;
  computedAt: string;
  totalIssuedShares: bigint;
  totalAuthorizedShares: bigint;
  rows: CapTableRow[];
  // Diluted view (includes options/convertibles as estimates)
  fullyDilutedEstimate: {
    totalUnits: bigint;
    optionPoolUnits: bigint;
    convertibleEstimateUnits: bigint;
    warning: string;
  };
  warnings: string[];
}

export class CorporateStructureService {
  /**
   * Compute the current cap table from integer share records.
   * Percentages are DERIVED for display — never authoritative.
   */
  static computeCapTable(params: {
    entityId: string;
    shareholdings: Shareholding[];
    shareClasses: ShareClass[];
    equityGrants: EquityGrant[];
    convertibles: ConvertibleInstrument[];
  }): CapTable {
    const warnings: string[] = [];

    // Total issued shares across all active shareholdings
    const activeHoldings = params.shareholdings.filter(h => h.status === "active");
    const totalIssuedShares = activeHoldings.reduce((sum, h) => sum + h.sharesHeld, BigInt(0));
    const totalAuthorized = params.shareClasses.reduce((sum, sc) => sum + sc.authorizedShares, BigInt(0));

    if (totalIssuedShares > totalAuthorized) {
      warnings.push("Issued shares exceed authorized shares. Verify share class records.");
    }

    // Group by shareholder
    const byHolder: Map<string, { name: string; classes: Map<string, bigint> }> = new Map();
    for (const h of activeHoldings) {
      if (!byHolder.has(h.shareholderId)) {
        byHolder.set(h.shareholderId, { name: h.shareholderName, classes: new Map() });
      }
      const holder = byHolder.get(h.shareholderId)!;
      const existing = holder.classes.get(h.shareClassKey) ?? BigInt(0);
      holder.classes.set(h.shareClassKey, existing + h.sharesHeld);
    }

    // Compute voting — depends on class voting rights
    const votingSharesByHolder: Map<string, bigint> = new Map();
    let totalVotingUnits = BigInt(0);
    for (const h of activeHoldings) {
      const sc = params.shareClasses.find(c => c.id === h.shareClassId);
      if (!sc) { warnings.push(`Share class not found for holding ${h.id}.`); continue; }
      const votingMultiplier = this.parseVotingMultiplier(sc.votingRights);
      const votes = h.sharesHeld * BigInt(votingMultiplier);
      votingSharesByHolder.set(h.shareholderId,
        (votingSharesByHolder.get(h.shareholderId) ?? BigInt(0)) + votes);
      totalVotingUnits += votes;
    }

    const rows: CapTableRow[] = [];
    for (const [holderId, holder] of byHolder) {
      for (const [classKey, sharesHeld] of holder.classes) {
        const sc = params.shareClasses.find(c => c.classKey === classKey);
        const classTotal = activeHoldings
          .filter(h => h.shareClassKey === classKey)
          .reduce((s, h) => s + h.sharesHeld, BigInt(0));

        const pctOfClass = classTotal > BigInt(0)
          ? ((Number(sharesHeld) / Number(classTotal)) * 100).toFixed(4) + "%"
          : "0.0000%";
        const pctOfTotal = totalIssuedShares > BigInt(0)
          ? ((Number(sharesHeld) / Number(totalIssuedShares)) * 100).toFixed(4) + "%"
          : "0.0000%";
        const votingUnits = votingSharesByHolder.get(holderId) ?? BigInt(0);
        const votingPctOfTotal = totalVotingUnits > BigInt(0)
          ? ((Number(votingUnits) / Number(totalVotingUnits)) * 100).toFixed(4) + "%"
          : "0.0000%";

        rows.push({
          shareholderId: holderId,
          shareholderName: holder.name,
          shareClassKey: classKey,
          sharesHeld,
          pctOfClass,
          pctOfTotal,
          votingPctOfTotal,
        });
      }
    }

    // Fully diluted — options and convertibles are ESTIMATES only
    const activeGrantUnits = params.equityGrants
      .filter(g => ["approved","active"].includes(g.status))
      .reduce((s, g) => s + g.totalUnits, BigInt(0));
    const convertibleEstimate = params.convertibles
      .filter(c => c.status === "outstanding")
      .reduce((s, c) => s + (c.valuationCapMinor ?? BigInt(0)), BigInt(0)); // rough estimate
    // Note: true diluted count requires reviewed conversion calculations per instrument

    return {
      corporateEntityId: params.entityId,
      computedAt: new Date().toISOString(),
      totalIssuedShares,
      totalAuthorizedShares: totalAuthorized,
      rows,
      fullyDilutedEstimate: {
        totalUnits: totalIssuedShares + activeGrantUnits,
        optionPoolUnits: activeGrantUnits,
        convertibleEstimateUnits: convertibleEstimate,
        warning: "Fully diluted estimate includes unexercised options as outstanding shares. Convertible instruments require legal review for accurate conversion. Do not use this for legal or financial decisions.",
      },
      warnings,
    };
  }

  /** Validate a new share issuance. */
  static validateShareIssuance(params: {
    shareClassId: string;
    sharesHeld: bigint;
    shareClass: ShareClass;
    existingIssuedInClass: bigint;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (params.sharesHeld <= BigInt(0)) {
      errors.push("Shares held must be a positive integer.");
    }

    const totalAfterIssuance = params.existingIssuedInClass + params.sharesHeld;
    if (totalAfterIssuance > params.shareClass.authorizedShares) {
      errors.push(
        `Issuance of ${params.sharesHeld} shares would exceed authorized shares ` +
        `(${params.shareClass.authorizedShares}) for class '${params.shareClass.classKey}'. ` +
        `Current issued: ${params.existingIssuedInClass}.`
      );
    }

    return { valid: errors.length === 0, errors };
  }

  /** Validate an equity grant — must have approval reference to be effective. */
  static validateEquityGrant(grant: Partial<EquityGrant>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!grant.recipientReference || grant.recipientReference.trim() === "") {
      errors.push("Recipient reference (HR/contractor vault key) is required.");
    }
    if (!grant.approvalReference || grant.approvalReference.trim() === "") {
      errors.push("Approval reference is required — equity grants are not legally effective without board or approved authority sign-off.");
    }
    if (!grant.totalUnits || grant.totalUnits <= BigInt(0)) {
      errors.push("Total units must be a positive integer.");
    }
    if (grant.grantType === "option" && grant.exercisePriceMinor === undefined) {
      errors.push("Options must specify an exercise price in minor units.");
    }
    if (!grant.grantDate || !grant.vestingStart) {
      errors.push("Grant date and vesting start are required.");
    }

    return { valid: errors.length === 0, errors };
  }

  /** Generate a change-of-control report from material contracts. */
  static generateChangeOfControlReport(contracts: Array<{
    id: string;
    title: string;
    counterparty: string;
    contractType: string;
    changeOfControlClause: string;
    expiryDate?: string;
  }>): {
    requireConsent: typeof contracts;
    allowTermination: typeof contracts;
    notificationOnly: typeof contracts;
    unknown: typeof contracts;
    summary: string;
  } {
    const requireConsent    = contracts.filter(c => c.changeOfControlClause === "consent_required");
    const allowTermination  = contracts.filter(c => c.changeOfControlClause === "termination_right");
    const notificationOnly  = contracts.filter(c => c.changeOfControlClause === "notification_only");
    const unknown           = contracts.filter(c => c.changeOfControlClause === "unknown");

    const summary = [
      `${requireConsent.length} contract(s) require consent before close.`,
      `${allowTermination.length} counterparty(ies) may terminate on change of control.`,
      `${notificationOnly.length} contract(s) require notification only.`,
      `${unknown.length} contract(s) have unknown change-of-control provisions — review required.`,
    ].join(" ");

    return { requireConsent, allowTermination, notificationOnly, unknown, summary };
  }

  /** Parse voting multiplier from voting rights string. */
  private static parseVotingMultiplier(votingRights: string): number {
    if (votingRights === "none") return 0;
    const match = votingRights.match(/(\d+)_per_share/);
    return match ? parseInt(match[1], 10) : 1;
  }
}
