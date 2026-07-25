/**
 * BallMtaani Edge Phase 9 — Multi-Tenant Isolation & Branding Service
 */

export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  displayName: string;
}

export interface TenantContext {
  tenantId: string;
  tenantKey: string;
  name: string;
  primaryDomain: string;
  branding: TenantBranding;
  allowedCompetitions: string[];
}

const IN_MEMORY_TENANTS = new Map<string, TenantContext>([
  [
    "ballmtaani_main",
    {
      tenantId: "t-001",
      tenantKey: "ballmtaani_main",
      name: "BallMtaani Core Platform",
      primaryDomain: "ballmtaani.co.ke",
      branding: { primaryColor: "#00A859", secondaryColor: "#121212", displayName: "BallMtaani Edge" },
      allowedCompetitions: ["Premier League", "UEFA Champions League", "La Liga", "Serie A"],
    },
  ],
  [
    "standard_media",
    {
      tenantId: "t-002",
      tenantKey: "standard_media",
      name: "Standard Media Sports",
      primaryDomain: "standardmedia.co.ke",
      branding: { primaryColor: "#B30000", secondaryColor: "#1A1A1A", displayName: "Standard Edge Intelligence" },
      allowedCompetitions: ["Premier League", "UEFA Champions League"],
    },
  ],
]);

export class TenantIsolationService {
  static resolveTenantByDomain(domain: string): TenantContext {
    const found = Array.from(IN_MEMORY_TENANTS.values()).find((t) => domain.toLowerCase().includes(t.primaryDomain.toLowerCase()));
    return found || IN_MEMORY_TENANTS.get("ballmtaani_main")!;
  }

  static validateTenantAccess(userTenantId: string, requestedTenantId: string): boolean {
    // Strict tenant isolation rule: Users cannot access resource of a different tenant
    return userTenantId === requestedTenantId;
  }
}
