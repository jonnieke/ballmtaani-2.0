/**
 * BallMtaani Edge Phase 11 — Investor Data Room & KPI Registry Service
 */

export interface DataRoomDocument {
  id: string;
  category: "corporate" | "product" | "model" | "commercial" | "financial" | "legal";
  title: string;
  version: string;
  confidentiality: "public" | "investor_only" | "restricted";
  filePath: string;
}

export class InvestorDataRoomService {
  static getAvailableDataRoomDocuments(): DataRoomDocument[] {
    return [
      { id: "doc-001", category: "model", title: "BallMtaani Edge Backtest & Calibration Audit Report", version: "v1.0", confidentiality: "investor_only", filePath: "/dataroom/model_backtest_audit.pdf" },
      { id: "doc-002", category: "financial", title: "Unit Economics & 12-Month Financial Model", version: "v1.0", confidentiality: "investor_only", filePath: "/dataroom/financial_model_2026.pdf" },
      { id: "doc-003", category: "legal", title: "Supabase & M-Pesa Security & Compliance Assessment", version: "v1.0", confidentiality: "investor_only", filePath: "/dataroom/security_compliance.pdf" },
    ];
  }

  static generateTemporarySignedAccessUrl(documentId: string, userEmail: string): { signedUrl: string; expiresAt: string } {
    const expiresAt = new Date(Date.now() + 3600000).toISOString();
    return {
      signedUrl: `https://ballmtaani.co.ke/api/v1/dataroom/download/${documentId}?token=signed_investor_key_101`,
      expiresAt,
    };
  }
}
