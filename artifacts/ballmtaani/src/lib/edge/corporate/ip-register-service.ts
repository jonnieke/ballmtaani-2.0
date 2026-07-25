/**
 * IP Register Service — Phase 14
 *
 * Manages intellectual property assets, chain-of-title assignments,
 * open-source inventory and licence compliance.
 *
 * CRITICAL RULES:
 * - assignment_status = 'unconfirmed' unless a supporting agreement exists
 * - Company ownership must NOT be assumed without an IP assignment or employment agreement
 * - Open-source strong copyleft may affect distribution — flag immediately
 * - No IP asset is treated as transferred without a recorded assignment
 */

export type IpAssetType =
  | "source_code" | "model" | "dataset" | "trademark" | "domain" | "design"
  | "content" | "documentation" | "patent_candidate" | "trade_secret";

export type AssignmentStatus =
  | "unconfirmed" | "assigned" | "assumed_employment" | "disputed";

export interface IpAsset {
  id: string;
  assetType: IpAssetType;
  title: string;
  description?: string;
  ownerEntityId: string;
  creatorReference?: string;
  creationDate?: string;
  registrationReference?: string;
  jurisdiction?: string;
  status: string;
  repositoryReference?: string;
  assignmentStatus: AssignmentStatus;
  thirdPartyComponents: string[];
  openSourceDependencies: string[];
}

export interface IpAssignment {
  ipAssetId: string;
  assignorReference: string;
  assigneeEntityId: string;
  assignmentDate: string;
  agreementReference?: string;
  scope?: string;
  status: string;
}

export interface OssEntry {
  packageName: string;
  packageVersion: string;
  licence: string;
  licenceRisk: "permissive" | "weak_copyleft" | "strong_copyleft" | "unknown" | "proprietary_restriction";
  usage: string;
  distributionImpact: "none" | "internal_only" | "distributed" | "saas";
  isModified: boolean;
  noticeRequired: boolean;
  sourceDisclosureRequired: boolean;
  isFlagged: boolean;
  flagReason?: string;
}

export interface IpAuditResult {
  entityId: string;
  totalAssets: number;
  unconfirmedAssignments: IpAsset[];
  disputedAssets: IpAsset[];
  highRiskOssPackages: OssEntry[];
  missingRegistrations: IpAsset[];
  summary: string;
  exitReadinessImpact: "clean" | "minor_gaps" | "significant_gaps" | "blocking";
}

// Licence risk levels
const HIGH_RISK_LICENCES = ["GPL-2.0", "GPL-3.0", "AGPL-3.0", "LGPL-2.0", "LGPL-2.1", "LGPL-3.0", "EUPL-1.1", "EUPL-1.2"];
const PERMISSIVE_LICENCES = ["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "CC0-1.0", "Unlicense"];
const UNKNOWN_LICENCE_TOKENS = ["UNLICENSED", "SEE LICENSE", "SEE LICENCE", "PROPRIETARY", "COMMERCIAL"];

// Material asset types that must have confirmed assignments for diligence
const MATERIAL_ASSET_TYPES: IpAssetType[] = ["source_code", "model", "dataset", "trademark", "patent_candidate"];

export class IpRegisterService {
  /** Classify an OSS licence by risk level. */
  static classifyLicence(licence: string): OssEntry["licenceRisk"] {
    const normalized = licence.toUpperCase().trim();
    if (UNKNOWN_LICENCE_TOKENS.some(t => normalized.includes(t))) return "proprietary_restriction";
    if (HIGH_RISK_LICENCES.some(l => l.toUpperCase() === normalized)) return "strong_copyleft";
    if (PERMISSIVE_LICENCES.some(l => l.toUpperCase() === normalized)) return "permissive";
    if (normalized.includes("LGPL") || normalized.includes("MPL")) return "weak_copyleft";
    return "unknown";
  }

  /** Determine if a package should be flagged for review. */
  static shouldFlagPackage(entry: OssEntry): { flag: boolean; reason?: string } {
    if (entry.licenceRisk === "strong_copyleft" && entry.distributionImpact !== "internal_only") {
      return { flag: true, reason: `Strong copyleft licence '${entry.licence}' with distribution impact '${entry.distributionImpact}'. Source disclosure may be required.` };
    }
    if (entry.licenceRisk === "proprietary_restriction") {
      return { flag: true, reason: `Licence '${entry.licence}' may restrict commercial use. Legal review required.` };
    }
    if (entry.licenceRisk === "unknown") {
      return { flag: true, reason: `Unknown licence '${entry.licence}'. Cannot assess risk without legal review.` };
    }
    if (entry.isModified && entry.licenceRisk === "weak_copyleft") {
      return { flag: true, reason: `Modified '${entry.licenceRisk}' package may require disclosure of modifications.` };
    }
    return { flag: false };
  }

  /** Validate a new IP asset record. */
  static validateAsset(asset: Partial<IpAsset>): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!asset.assetType) errors.push("Asset type is required.");
    if (!asset.title || asset.title.trim().length < 3) errors.push("Asset title is required (minimum 3 characters).");
    if (!asset.ownerEntityId) errors.push("Owner entity ID is required.");

    // Warn on unconfirmed assignment for material assets
    if (asset.assetType && MATERIAL_ASSET_TYPES.includes(asset.assetType)) {
      if (!asset.assignmentStatus || asset.assignmentStatus === "unconfirmed") {
        warnings.push(
          `Asset type '${asset.assetType}' is material. Assignment status is 'unconfirmed'. ` +
          "Company ownership is not confirmed until an IP assignment or employment agreement is recorded."
        );
      }
    }

    // Warn on source code without repository reference
    if (asset.assetType === "source_code" && !asset.repositoryReference) {
      warnings.push("Source code asset should include a repository reference for chain-of-title tracking.");
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /** Validate an IP assignment record. */
  static validateAssignment(assignment: Partial<IpAssignment>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!assignment.ipAssetId) errors.push("IP asset ID is required.");
    if (!assignment.assignorReference) errors.push("Assignor reference is required.");
    if (!assignment.assigneeEntityId) errors.push("Assignee entity ID is required.");
    if (!assignment.assignmentDate) errors.push("Assignment date is required.");
    if (!assignment.agreementReference) {
      errors.push("Agreement reference is required — do not record an assignment without a supporting agreement document.");
    }

    return { valid: errors.length === 0, errors };
  }

  /** Run an IP audit across all assets for a corporate entity. */
  static auditIpPortfolio(params: {
    entityId: string;
    assets: IpAsset[];
    ossInventory: OssEntry[];
  }): IpAuditResult {
    const unconfirmedAssignments = params.assets.filter(
      a => MATERIAL_ASSET_TYPES.includes(a.assetType) && a.assignmentStatus === "unconfirmed"
    );
    const disputedAssets = params.assets.filter(a => a.assignmentStatus === "disputed");
    const highRiskOss = params.ossInventory.filter(o =>
      o.isFlagged || o.licenceRisk === "strong_copyleft" || o.licenceRisk === "unknown"
    );
    const missingRegistrations = params.assets.filter(
      a => ["trademark", "patent_candidate"].includes(a.assetType) && !a.registrationReference
    );

    // Exit readiness impact
    let exitReadinessImpact: IpAuditResult["exitReadinessImpact"] = "clean";
    if (disputedAssets.length > 0) {
      exitReadinessImpact = "blocking";
    } else if (unconfirmedAssignments.length > 3 || highRiskOss.some(o => o.licenceRisk === "strong_copyleft" && o.distributionImpact === "distributed")) {
      exitReadinessImpact = "significant_gaps";
    } else if (unconfirmedAssignments.length > 0 || highRiskOss.length > 0) {
      exitReadinessImpact = "minor_gaps";
    }

    const summary = [
      `${params.assets.length} IP assets recorded.`,
      `${unconfirmedAssignments.length} material asset(s) with unconfirmed ownership.`,
      `${disputedAssets.length} disputed asset(s).`,
      `${highRiskOss.length} flagged OSS package(s).`,
      `Exit readiness impact: ${exitReadinessImpact.toUpperCase()}.`,
    ].join(" ");

    return {
      entityId: params.entityId,
      totalAssets: params.assets.length,
      unconfirmedAssignments,
      disputedAssets,
      highRiskOssPackages: highRiskOss,
      missingRegistrations,
      summary,
      exitReadinessImpact,
    };
  }
}
