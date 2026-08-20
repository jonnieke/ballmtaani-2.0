/**
 * Investor Pipeline Service — Phase 14
 *
 * Manages the institutional investor pipeline from identification
 * through close, including fit scoring, diligence request tracking
 * and data-room access control.
 *
 * CRITICAL RULES:
 * - Data-room access expires — never grant permanent access
 * - Restricted documents require explicit access level grant
 * - Investor metrics must distinguish actuals from forecasts
 * - Do not optimise only for valuation
 * - Pipeline status advances must be sequential
 */

export type InvestorStatus =
  | "identified" | "introduced" | "initial_meeting" | "information_shared"
  | "active_discussion" | "diligence" | "term_sheet" | "negotiation"
  | "committed" | "closed" | "paused" | "declined" | "lost";

export type DiligenceCategory =
  | "corporate" | "legal" | "product_technical" | "commercial"
  | "financial" | "data_model" | "people";

export type DataRoomAccessLevel =
  | "summary" | "standard" | "confirmatory" | "restricted";

export interface InvestorFitInput {
  investorType: string;
  geographies: string[];
  investmentStage: string[];
  typicalTicketMinMinor: number;
  typicalTicketMaxMinor: number;
  sportsExperience: number;    // 0–100
  africanMarketExperience: number;
  telecomNetwork: number;
  mediaNetwork: number;
  followOnCapacity: number;
  governanceExpectations: "light" | "normal" | "heavy" | "institutional";
  timeHorizonYears: number;
  strategicConflicts: string[];
  reputation: number;
  valueBeyondCapital: number;
  termsHistory: "fair" | "mixed" | "aggressive" | "unknown";
  // BallMtaani context
  targetRoundStage: string;
  targetTicketMinMinor: number;
  targetTicketMaxMinor: number;
  targetMarkets: string[];
}

export interface InvestorFitScore {
  totalScore: number;          // 0–100
  stageScore: number;
  ticketScore: number;
  marketScore: number;
  sectorScore: number;
  governanceScore: number;
  strategicValueScore: number;
  conflictPenalty: number;
  recommendation: "strong_fit" | "consider" | "weak_fit" | "not_suitable";
  notes: string[];
}

export interface DiligenceRequest {
  id: string;
  investorOpportunityId: string;
  category: DiligenceCategory;
  request: string;
  priority: "critical" | "high" | "normal" | "low";
  status: string;
  owner?: string;
  documentReference?: string;
  accessLevel: DataRoomAccessLevel;
  dueAt?: string;
  completedAt?: string;
}

export interface DataRoomGrant {
  investorId: string;
  accessLevel: DataRoomAccessLevel;
  grantedBy: string;
  expiresAt: string; // ALWAYS expires
  folders: string[];
  auditDownloads: boolean;
}

// Status advance order for investor pipeline
const INVESTOR_STATUS_SEQUENCE: InvestorStatus[] = [
  "identified", "introduced", "initial_meeting", "information_shared",
  "active_discussion", "diligence", "term_sheet", "negotiation", "committed", "closed",
];

// Documents available at each access level
const DATA_ROOM_FOLDERS: Record<DataRoomAccessLevel, string[]> = {
  summary: [
    "01_executive_summary", "02_pitch_deck", "03_product_overview",
  ],
  standard: [
    "01_executive_summary", "02_pitch_deck", "03_product_overview",
    "04_commercial_overview", "05_financial_summary", "06_market_analysis",
    "07_team_overview", "08_product_roadmap", "09_model_performance_summary",
  ],
  confirmatory: [
    "01_executive_summary", "02_pitch_deck", "03_product_overview",
    "04_commercial_overview", "05_financial_summary", "06_market_analysis",
    "07_team_overview", "08_product_roadmap", "09_model_performance_summary",
    "10_customer_contracts", "11_partner_contracts", "12_financial_statements",
    "13_security_reports", "14_technical_architecture", "15_backtesting_methodology",
  ],
  restricted: [
    // All folders — requires explicit board/CEO approval for each investor
    "01_executive_summary", "02_pitch_deck", "03_product_overview",
    "04_commercial_overview", "05_financial_summary", "06_market_analysis",
    "07_team_overview", "08_product_roadmap", "09_model_performance_summary",
    "10_customer_contracts", "11_partner_contracts", "12_financial_statements",
    "13_security_reports", "14_technical_architecture", "15_backtesting_methodology",
    "16_cap_table", "17_ip_register", "18_corporate_records",
    "19_employment_records", "20_tax_records", "21_risk_register",
    "22_board_materials",
  ],
};

export class InvestorPipelineService {
  /** Score investor fit against BallMtaani's investment criteria. */
  static scoreInvestorFit(input: InvestorFitInput): InvestorFitScore {
    const notes: string[] = [];

    // Stage fit (25%)
    const stageMatch = input.investmentStage.includes(input.targetRoundStage);
    const stageScore = stageMatch ? 100 : 30;
    if (!stageMatch) notes.push(`Investor focuses on ${input.investmentStage.join("/")} — target round is ${input.targetRoundStage}.`);

    // Ticket fit (20%)
    const ticketOverlap =
      input.typicalTicketMaxMinor >= input.targetTicketMinMinor &&
      input.typicalTicketMinMinor <= input.targetTicketMaxMinor;
    const ticketScore = ticketOverlap ? 100 : 20;
    if (!ticketOverlap) notes.push("Ticket size does not overlap with target round range.");

    // Market fit (15%)
    const marketOverlap = input.targetMarkets.some(m => input.geographies.includes(m));
    const marketScore = marketOverlap ? 100 : 40;
    if (!marketOverlap) notes.push("Investor geography does not cover target markets.");

    // Sector score (20%)
    const sectorScore = Math.round(
      (input.sportsExperience * 0.4 + input.africanMarketExperience * 0.3 + input.telecomNetwork * 0.15 + input.mediaNetwork * 0.15)
    );

    // Governance fit (5%)
    const governanceMap = { light: 100, normal: 80, heavy: 40, institutional: 60 };
    const governanceScore = governanceMap[input.governanceExpectations];
    if (input.governanceExpectations === "heavy") {
      notes.push("Investor expects heavy governance. Evaluate board composition impact carefully.");
    }

    // Strategic value (10%)
    const strategicValueScore = Math.round(
      (input.followOnCapacity * 0.2 + input.valueBeyondCapital * 0.5 + input.reputation * 0.3)
    );

    // Conflict penalty
    const conflictPenalty = input.strategicConflicts.length > 0
      ? Math.min(50, input.strategicConflicts.length * 15)
      : 0;
    if (conflictPenalty > 0) {
      notes.push(`Strategic conflicts detected: ${input.strategicConflicts.join(", ")}. Deducting ${conflictPenalty} points.`);
    }

    // Terms history penalty
    if (input.termsHistory === "aggressive") {
      notes.push("Investor has aggressive terms history. Seek independent legal counsel before advancing.");
    }

    // Total (weighted)
    const rawScore = Math.round(
      stageScore * 0.25 +
      ticketScore * 0.20 +
      marketScore * 0.15 +
      sectorScore * 0.20 +
      governanceScore * 0.05 +
      strategicValueScore * 0.15
    ) - conflictPenalty;
    const totalScore = Math.max(0, Math.min(100, rawScore));

    let recommendation: InvestorFitScore["recommendation"];
    if (totalScore >= 75 && conflictPenalty === 0) recommendation = "strong_fit";
    else if (totalScore >= 55) recommendation = "consider";
    else if (totalScore >= 35) recommendation = "weak_fit";
    else recommendation = "not_suitable";

    return { totalScore, stageScore, ticketScore, marketScore, sectorScore, governanceScore, strategicValueScore, conflictPenalty, recommendation, notes };
  }

  /** Validate a pipeline status advance. */
  static validateStatusAdvance(
    current: InvestorStatus,
    proposed: InvestorStatus
  ): { valid: boolean; error?: string } {
    const terminal: InvestorStatus[] = ["paused", "declined", "lost"];
    if (terminal.includes(proposed)) return { valid: true };

    const currIdx = INVESTOR_STATUS_SEQUENCE.indexOf(current);
    const propIdx = INVESTOR_STATUS_SEQUENCE.indexOf(proposed);
    if (currIdx === -1) return { valid: false, error: `Unknown status: ${current}` };
    if (propIdx === -1) return { valid: false, error: `Unknown proposed status: ${proposed}` };
    if (propIdx > currIdx + 1) {
      return { valid: false, error: `Cannot advance from '${current}' to '${proposed}' — must go through '${INVESTOR_STATUS_SEQUENCE[currIdx + 1]}'.` };
    }
    return { valid: true };
  }

  /** Create a data-room access grant — always time-limited. */
  static createDataRoomGrant(params: {
    investorId: string;
    accessLevel: DataRoomAccessLevel;
    grantedBy: string;
    durationDays: number;
    requiresExplicitApproval?: boolean;
  }): { grant: DataRoomGrant; warnings: string[] } {
    const warnings: string[] = [];

    if (params.accessLevel === "restricted" && !params.requiresExplicitApproval) {
      warnings.push("Restricted data-room access requires explicit board/CEO approval. Set requiresExplicitApproval=true.");
    }

    if (params.durationDays > 90) {
      warnings.push(`Access duration ${params.durationDays}d exceeds recommended maximum of 90 days.`);
    }
    if (params.durationDays <= 0) {
      throw new Error("Data-room access duration must be at least 1 day.");
    }

    const expiresAt = new Date(Date.now() + params.durationDays * 86_400_000).toISOString();

    return {
      grant: {
        investorId: params.investorId,
        accessLevel: params.accessLevel,
        grantedBy: params.grantedBy,
        expiresAt,
        folders: DATA_ROOM_FOLDERS[params.accessLevel],
        auditDownloads: true, // always audit
      },
      warnings,
    };
  }

  /** Check if a data-room grant is still valid. */
  static isGrantValid(grant: DataRoomGrant): boolean {
    return new Date(grant.expiresAt) > new Date();
  }

  /** Check whether a diligence request can be accessed by a given grant. */
  static canAccessRequest(grant: DataRoomGrant, request: DiligenceRequest): boolean {
    if (!this.isGrantValid(grant)) return false;

    const accessHierarchy: Record<DataRoomAccessLevel, number> = {
      summary: 1, standard: 2, confirmatory: 3, restricted: 4,
    };
    return accessHierarchy[grant.accessLevel] >= accessHierarchy[request.accessLevel];
  }

  /** Return a diligence checklist template for a given round stage. */
  static getDiligenceChecklist(roundStage: string): Array<{ category: DiligenceCategory; items: string[] }> {
    const base: Array<{ category: DiligenceCategory; items: string[] }> = [
      { category: "corporate",          items: ["Incorporation documents", "Share register", "Director list", "Cap table", "Any subsidiary entities"] },
      { category: "legal",              items: ["Material contracts list", "IP assignments", "Employment agreements", "Data licences", "OSS inventory", "Litigation register"] },
      { category: "product_technical",  items: ["Architecture overview", "Repository access (read-only)", "Security posture summary", "Model governance", "Backtesting methodology", "Technical debt register", "Availability history"] },
      { category: "commercial",         items: ["Revenue by product", "Top 10 customers", "Churn and retention", "Partner pipeline", "Signed contracts", "Pricing history"] },
      { category: "financial",          items: ["12-month management accounts", "Cash position", "18-month forecast", "Unit economics", "Tax status", "Outstanding liabilities"] },
      { category: "data_model",         items: ["Data provider contracts", "Model performance ledger", "Backtest results", "Calibration reports", "Drift monitoring evidence"] },
      { category: "people",             items: ["Org chart", "Employment contract summaries", "Contractor agreements", "Equity grants", "Key-person risk assessment", "Hiring plan"] },
    ];

    // Seed rounds typically need full checklist
    // Pre-seed / angel — lighter version
    if (roundStage === "pre_seed" || roundStage === "angel") {
      return base.map(b => ({ ...b, items: b.items.slice(0, 3) }));
    }
    return base;
  }
}
