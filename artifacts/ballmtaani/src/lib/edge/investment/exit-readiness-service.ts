/**
 * Exit Readiness Service — Phase 14
 *
 * Computes exit readiness scorecard across 7 domains and evaluates
 * strategic transaction options with multi-dimension analysis.
 *
 * CRITICAL RULES:
 * - Exit readiness includes known liabilities — do not hide weaknesses
 * - Do not assume exit is the preferred outcome
 * - Change-of-control dependencies must be identified BEFORE a transaction
 * - Headline price is not the only evaluation criterion
 * - Key-person dependencies must be documented and mitigated
 */

export type ExitReadinessLabel =
  | "not_ready" | "early_preparation" | "diligence_capable" | "transaction_ready" | "highly_prepared";

export interface ExitReadinessDomain {
  label: string;
  score: number;   // 0–100
  weight: number;  // proportion of total
  strengths: string[];
  gaps: string[];
}

export interface ExitReadinessInput {
  // Corporate records
  entityRecorded: boolean;
  shareRegisterCurrent: boolean;
  boardApprovalsDocumented: boolean;
  corporateGovernanceDocs: boolean;
  // IP ownership
  materialCodeAssigned: boolean;
  modelsOwnershipConfirmed: boolean;
  dataLicencesCurrent: boolean;
  trademarksRegistered: boolean;
  ossInventoryClean: boolean;
  // Financial quality
  revenueReconciled: boolean;
  expenseRecordsComplete: boolean;
  forecastPrepared: boolean;
  taxStatusCurrent: boolean;
  liabilitiesDocumented: boolean;
  // Commercial quality
  materialContractsSigned: boolean;
  retentionMetricsAvailable: boolean;
  revenueConcentrationAcceptable: boolean; // top customer < 40%
  growthEvidenced: boolean;
  marginDocumented: boolean;
  // Technical quality
  architectureDocumented: boolean;
  securityAudited: boolean;
  scalabilityEvidenced: boolean;
  technicalDebtRegistered: boolean;
  codeDocumented: boolean;
  // Compliance
  legalDocumentsApproved: boolean;
  privacyPolicyCompliant: boolean;
  marketingControlsEnforced: boolean;
  complianceIssuesResolved: boolean;
  // People
  employmentContractsCurrent: boolean;
  keyPersonRiskMitigated: boolean;
  equityGrantsApproved: boolean;
  leadershipSuccessionPlanned: boolean;
}

export interface ExitReadinessResult {
  overallScore: number;
  label: ExitReadinessLabel;
  domains: Record<string, ExitReadinessDomain>;
  topGaps: string[];
  topStrengths: string[];
  blockingIssues: string[];
  recommendedActions: string[];
}

export interface StrategicTransactionEvaluation {
  transactionType: string;
  counterparty: string;
  estimatedValueMinor: number;
  currency: string;
  // Dimensions (0–100 each)
  controlImpactScore: number;     // lower = less impact on control (good)
  employeeImpactScore: number;
  customerImpactScore: number;
  productContinuityScore: number;
  regulatoryComplexityScore: number;
  executionComplexityScore: number;
  valueConfidenceScore: number;
  // Multi-dimension score
  overallScore: number;
  recommendation: "pursue" | "evaluate_further" | "deprioritize" | "decline";
  notes: string[];
}

export class ExitReadinessService {
  /** Compute the exit readiness scorecard from structured inputs. */
  static computeReadinessScore(input: ExitReadinessInput): ExitReadinessResult {
    const domainDefinitions: Array<{
      key: string; label: string; weight: number;
      checks: Array<{ field: keyof ExitReadinessInput; label: string; isStrength: boolean }>;
    }> = [
      { key: "corporate_records", label: "Corporate Records", weight: 0.15, checks: [
        { field: "entityRecorded",             label: "Entity records complete",              isStrength: true },
        { field: "shareRegisterCurrent",       label: "Share register current",               isStrength: true },
        { field: "boardApprovalsDocumented",   label: "Board approvals documented",           isStrength: true },
        { field: "corporateGovernanceDocs",    label: "Governance documentation ready",       isStrength: true },
      ]},
      { key: "ip_ownership", label: "IP Ownership", weight: 0.18, checks: [
        { field: "materialCodeAssigned",       label: "Material code IP assigned",            isStrength: true },
        { field: "modelsOwnershipConfirmed",   label: "Model ownership confirmed",            isStrength: true },
        { field: "dataLicencesCurrent",        label: "Data licences current",                isStrength: true },
        { field: "trademarksRegistered",       label: "Trademarks registered",                isStrength: true },
        { field: "ossInventoryClean",          label: "OSS inventory clean",                  isStrength: true },
      ]},
      { key: "financial_quality", label: "Financial Quality", weight: 0.18, checks: [
        { field: "revenueReconciled",          label: "Revenue reconciled",                   isStrength: true },
        { field: "expenseRecordsComplete",     label: "Expense records complete",             isStrength: true },
        { field: "forecastPrepared",           label: "Financial forecast prepared",          isStrength: true },
        { field: "taxStatusCurrent",           label: "Tax status current",                   isStrength: true },
        { field: "liabilitiesDocumented",      label: "Liabilities documented",               isStrength: true },
      ]},
      { key: "commercial_quality", label: "Commercial Quality", weight: 0.17, checks: [
        { field: "materialContractsSigned",    label: "Material contracts signed",            isStrength: true },
        { field: "retentionMetricsAvailable",  label: "Retention metrics documented",        isStrength: true },
        { field: "revenueConcentrationAcceptable", label: "Revenue concentration acceptable", isStrength: true },
        { field: "growthEvidenced",            label: "Growth evidenced",                     isStrength: true },
        { field: "marginDocumented",           label: "Margin documented",                    isStrength: true },
      ]},
      { key: "technical_quality", label: "Technical Quality", weight: 0.15, checks: [
        { field: "architectureDocumented",     label: "Architecture documented",              isStrength: true },
        { field: "securityAudited",            label: "Security audited",                     isStrength: true },
        { field: "scalabilityEvidenced",       label: "Scalability evidenced",                isStrength: true },
        { field: "technicalDebtRegistered",    label: "Technical debt registered",            isStrength: true },
        { field: "codeDocumented",             label: "Code documented",                      isStrength: true },
      ]},
      { key: "compliance", label: "Compliance", weight: 0.10, checks: [
        { field: "legalDocumentsApproved",     label: "Legal documents approved",             isStrength: true },
        { field: "privacyPolicyCompliant",     label: "Privacy policy compliant",             isStrength: true },
        { field: "marketingControlsEnforced",  label: "Marketing controls enforced",          isStrength: true },
        { field: "complianceIssuesResolved",   label: "Compliance issues resolved",           isStrength: true },
      ]},
      { key: "people", label: "People", weight: 0.07, checks: [
        { field: "employmentContractsCurrent", label: "Employment contracts current",         isStrength: true },
        { field: "keyPersonRiskMitigated",     label: "Key-person risk mitigated",            isStrength: true },
        { field: "equityGrantsApproved",       label: "Equity grants approved",               isStrength: true },
        { field: "leadershipSuccessionPlanned",label: "Leadership succession planned",        isStrength: true },
      ]},
    ];

    const domains: Record<string, ExitReadinessDomain> = {};
    let totalWeightedScore = 0;
    const blockingIssues: string[] = [];
    const topGaps: string[] = [];
    const topStrengths: string[] = [];

    for (const def of domainDefinitions) {
      const passed = def.checks.filter(c => input[c.field] === true);
      const failed = def.checks.filter(c => input[c.field] !== true);
      const domainScore = Math.round((passed.length / def.checks.length) * 100);

      domains[def.key] = {
        label: def.label,
        score: domainScore,
        weight: def.weight,
        strengths: passed.map(c => c.label),
        gaps: failed.map(c => c.label),
      };

      totalWeightedScore += domainScore * def.weight;

      // Blocking issues (critical failures)
      if (def.key === "ip_ownership" && !input.materialCodeAssigned) {
        blockingIssues.push("Material source code IP ownership is unconfirmed. This will block institutional investment.");
      }
      if (def.key === "corporate_records" && !input.shareRegisterCurrent) {
        blockingIssues.push("Share register is not current. No investment close possible without this.");
      }
      if (def.key === "financial_quality" && !input.revenueReconciled) {
        blockingIssues.push("Revenue is not reconciled. Financial diligence cannot be completed.");
      }

      // Collect gaps/strengths for summary
      failed.slice(0, 2).forEach(c => topGaps.push(`${def.label}: ${c.label}`));
      passed.slice(0, 1).forEach(c => topStrengths.push(`${def.label}: ${c.label}`));
    }

    const overallScore = Math.round(totalWeightedScore);
    let label: ExitReadinessLabel;
    if (overallScore >= 85 && blockingIssues.length === 0) label = "highly_prepared";
    else if (overallScore >= 70 && blockingIssues.length === 0) label = "transaction_ready";
    else if (overallScore >= 55) label = "diligence_capable";
    else if (overallScore >= 35) label = "early_preparation";
    else label = "not_ready";

    const recommendedActions: string[] = [];
    for (const [key, domain] of Object.entries(domains)) {
      if (domain.score < 60) {
        recommendedActions.push(`Prioritise ${domain.label}: ${domain.gaps.slice(0, 2).join(", ")}.`);
      }
    }

    return { overallScore, label, domains, topGaps, topStrengths, blockingIssues, recommendedActions };
  }

  /** Evaluate a strategic transaction opportunity on multiple dimensions. */
  static evaluateTransaction(params: {
    transactionType: string;
    counterparty: string;
    estimatedValueMinor: number;
    currency: string;
    controlImpact: "none" | "minor" | "significant" | "full";
    employeeRetentionLikely: boolean;
    customerContinuityLikely: boolean;
    productContinuityLikely: boolean;
    regulatoryComplexity: number;   // 0–100
    executionComplexity: number;    // 0–100
    valueConfidence: number;        // 0–100 (how reliable is the estimate)
    hasAlternativeOptions: boolean;
    changeOfControlContractsRisk: "low" | "medium" | "high";
  }): StrategicTransactionEvaluation {
    const notes: string[] = [];

    // Control impact (lower is better for founders)
    const controlScoreMap = { none: 100, minor: 75, significant: 40, full: 20 };
    const controlImpactScore = controlScoreMap[params.controlImpact];
    if (params.controlImpact === "full") {
      notes.push("Full control transfer — ensure valuation, employee protection and customer commitments are confirmed.");
    }

    const employeeImpactScore = params.employeeRetentionLikely ? 85 : 30;
    if (!params.employeeRetentionLikely) notes.push("Employee retention at risk. Plan for key-person clauses.");

    const customerImpactScore = params.customerContinuityLikely ? 90 : 35;
    const productContinuityScore = params.productContinuityLikely ? 90 : 40;

    const regulatoryComplexityScore = 100 - params.regulatoryComplexity;
    const executionComplexityScore = 100 - params.executionComplexity;

    if (params.changeOfControlContractsRisk === "high") {
      notes.push("High change-of-control contract risk. Consent or termination provisions may delay or block close.");
    }

    if (!params.hasAlternativeOptions) {
      notes.push("No alternative options identified. Negotiating leverage may be limited. Consider running a structured process.");
    }

    const overallScore = Math.round(
      controlImpactScore * 0.20 +
      employeeImpactScore * 0.15 +
      customerImpactScore * 0.15 +
      productContinuityScore * 0.15 +
      regulatoryComplexityScore * 0.15 +
      executionComplexityScore * 0.10 +
      params.valueConfidence * 0.10
    );

    let recommendation: StrategicTransactionEvaluation["recommendation"];
    if (overallScore >= 70 && params.changeOfControlContractsRisk !== "high") recommendation = "pursue";
    else if (overallScore >= 50) recommendation = "evaluate_further";
    else if (overallScore >= 30) recommendation = "deprioritize";
    else recommendation = "decline";

    return {
      transactionType: params.transactionType,
      counterparty: params.counterparty,
      estimatedValueMinor: params.estimatedValueMinor,
      currency: params.currency,
      controlImpactScore,
      employeeImpactScore,
      customerImpactScore,
      productContinuityScore,
      regulatoryComplexityScore,
      executionComplexityScore,
      valueConfidenceScore: params.valueConfidence,
      overallScore,
      recommendation,
      notes,
    };
  }

  /** Identify key-person dependencies and risk level. */
  static assessKeyPersonRisk(persons: Array<{
    name: string;
    role: string;
    uniqueKnowledge: string[];
    hasDocumentation: boolean;
    hasSuccessor: boolean;
    hasSharedAccess: boolean;
  }>): Array<{
    name: string; role: string; riskLevel: "low" | "medium" | "high" | "critical";
    mitigationActions: string[];
  }> {
    return persons.map(p => {
      const mitigationGaps: string[] = [];
      if (!p.hasDocumentation) mitigationGaps.push("Create documentation for unique knowledge areas.");
      if (!p.hasSuccessor) mitigationGaps.push("Identify and onboard a successor or cross-train a colleague.");
      if (!p.hasSharedAccess) mitigationGaps.push("Ensure shared credential/access management is in place.");

      const riskLevel =
        p.uniqueKnowledge.length >= 4 && !p.hasDocumentation && !p.hasSuccessor ? "critical" :
        p.uniqueKnowledge.length >= 3 && mitigationGaps.length >= 2 ? "high" :
        p.uniqueKnowledge.length >= 2 && mitigationGaps.length >= 1 ? "medium" : "low";

      return { name: p.name, role: p.role, riskLevel, mitigationActions: mitigationGaps };
    });
  }
}
