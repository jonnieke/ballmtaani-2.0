/**
 * Self-Service API & Widget Service — Phase 13
 *
 * Allows approved partners to create API clients, generate/rotate/revoke keys,
 * and configure embeddable widgets — all within plan-gated scope limits.
 *
 * SECURITY: API keys are NEVER stored in plaintext.
 * Only a SHA-256 hash and a human-readable prefix are persisted.
 */

import crypto from "crypto";

export type ApiScope =
  | "public_predictions" | "widget_embed" | "public_api"
  | "premium_api" | "sandbox_api" | "webhook_test"
  | "referral" | "campaign_assets" | "lineup_revisions"
  | "odds_movement" | "raw_model_probabilities"
  | "bulk_export" | "white_label_api";

export type WidgetType =
  | "match_prediction" | "upcoming_fixture" | "competition"
  | "team" | "performance";

export interface ApiClient {
  id: string;
  tenantId: string;
  name: string;
  allowedScopes: ApiScope[];
  allowedOrigins: string[];
  allowedIpRanges: string[];
  keyPrefix: string; // first 8 chars for identification
  keyHash: string;  // SHA-256 of the full key — NEVER the key itself
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface GeneratedKeyResult {
  client: ApiClient;
  plaintextKey: string; // returned ONCE at creation — never stored
  displayHint: string;  // e.g. "bme_live_••••••••••••••••"
}

export interface Widget {
  id: string;
  tenantId: string;
  name: string;
  widgetType: WidgetType;
  allowedDomain: string;
  theme: "dark" | "light" | "auto";
  language: string;
  competitionKey?: string;
  teamId?: string;
  maxFixtures: number;
  ctaUrl: string;
  refreshIntervalSeconds: number;
  attributionVisible: boolean; // MUST remain true
  disclaimerText: string;
  modelVersion: string;
  isActive: boolean;
  createdAt: string;
}

export interface WidgetRenderConfig {
  widgetId: string;
  embedCode: string;
  sandboxMode: boolean;
  attributionLine: string;
  disclaimer: string;
}

// Plan scope limits — partners cannot request scopes outside their plan
const PLAN_SCOPE_ALLOWLIST: Record<string, ApiScope[]> = {
  creator_free:   ["referral", "campaign_assets", "public_predictions"],
  widget_starter: ["public_predictions", "widget_embed"],
  publisher:      ["public_predictions", "widget_embed", "public_api"],
  developer:      ["sandbox_api", "webhook_test"],
  pro_publisher:  ["public_predictions", "widget_embed", "premium_api", "public_api"],
  enterprise:     ["public_predictions", "widget_embed", "premium_api", "public_api", "lineup_revisions", "odds_movement"],
};

// Scopes requiring manual approval regardless of plan
const MANUAL_APPROVAL_SCOPES: ApiScope[] = [
  "raw_model_probabilities", "bulk_export", "white_label_api",
];

const KEY_PREFIX = "bme"; // BallMtaani Edge

export class SelfServiceApiService {
  /** Generate a new API client with a hashed key. */
  static createApiClient(params: {
    tenantId: string;
    name: string;
    requestedScopes: ApiScope[];
    allowedOrigins?: string[];
    allowedIpRanges?: string[];
    planKey: string;
    expiresInDays?: number;
  }): GeneratedKeyResult | { error: string } {
    // Validate scopes against plan
    const allowed = PLAN_SCOPE_ALLOWLIST[params.planKey] ?? [];
    const invalidScopes = params.requestedScopes.filter(s => !allowed.includes(s));
    if (invalidScopes.length > 0) {
      return { error: `Scopes not permitted on plan '${params.planKey}': ${invalidScopes.join(", ")}` };
    }

    // Block manual-approval scopes from self-service
    const manualRequired = params.requestedScopes.filter(s => MANUAL_APPROVAL_SCOPES.includes(s));
    if (manualRequired.length > 0) {
      return { error: `Scopes require manual approval: ${manualRequired.join(", ")}. Please contact support.` };
    }

    // Generate a cryptographically random key
    const environment = params.planKey === "developer" ? "test" : "live";
    const rawKey = `${KEY_PREFIX}_${environment}_${crypto.randomBytes(24).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.slice(0, `${KEY_PREFIX}_${environment}_`.length + 8);

    const client: ApiClient = {
      id: crypto.randomUUID(),
      tenantId: params.tenantId,
      name: params.name,
      allowedScopes: params.requestedScopes,
      allowedOrigins: params.allowedOrigins ?? [],
      allowedIpRanges: params.allowedIpRanges ?? [],
      keyPrefix,
      keyHash,
      isActive: true,
      expiresAt: params.expiresInDays
        ? new Date(Date.now() + params.expiresInDays * 86_400_000).toISOString()
        : null,
      createdAt: new Date().toISOString(),
    };

    const displayHint = `${keyPrefix}${"•".repeat(20)}`;

    return {
      client,
      plaintextKey: rawKey, // caller must display once and discard
      displayHint,
    };
  }

  /** Rotate an existing key — returns new key, marks old key hash as revoked. */
  static rotateApiKey(client: ApiClient): GeneratedKeyResult {
    const environment = client.keyPrefix.includes("_test_") ? "test" : "live";
    const rawKey = `${KEY_PREFIX}_${environment}_${crypto.randomBytes(24).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.slice(0, `${KEY_PREFIX}_${environment}_`.length + 8);

    const newClient: ApiClient = {
      ...client,
      keyPrefix,
      keyHash,
      createdAt: new Date().toISOString(),
    };

    return { client: newClient, plaintextKey: rawKey, displayHint: `${keyPrefix}${"•".repeat(20)}` };
  }

  /** Verify a presented key against the stored hash. */
  static verifyApiKey(presentedKey: string, storedHash: string): boolean {
    const hash = crypto.createHash("sha256").update(presentedKey).digest("hex");
    // Constant-time comparison to prevent timing attacks
    if (hash.length !== storedHash.length) return false;
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
  }

  /** Enforce that a request scope is within a client's allowed scopes. */
  static enforceScope(client: ApiClient, requestedScope: ApiScope): {
    allowed: boolean;
    reason?: string;
  } {
    if (!client.isActive) return { allowed: false, reason: "API client is inactive or revoked." };
    if (client.expiresAt && new Date(client.expiresAt) < new Date()) {
      return { allowed: false, reason: "API key has expired. Please rotate." };
    }
    if (!client.allowedScopes.includes(requestedScope)) {
      return { allowed: false, reason: `Scope '${requestedScope}' is not permitted for this client.` };
    }
    return { allowed: true };
  }

  /** Create a new embeddable widget with mandatory attribution and disclaimer. */
  static createWidget(params: {
    tenantId: string;
    name: string;
    widgetType: WidgetType;
    allowedDomain: string;
    theme?: "dark" | "light" | "auto";
    language?: string;
    competitionKey?: string;
    teamId?: string;
    maxFixtures?: number;
    ctaUrl?: string;
    refreshIntervalSeconds?: number;
  }): Widget | { error: string } {
    if (!params.allowedDomain || params.allowedDomain.trim() === "") {
      return { error: "A verified domain is required to create a widget." };
    }

    // Domain must not be a localhost or IP in production
    if (params.allowedDomain.startsWith("localhost") || /^\d+\.\d+\.\d+\.\d+$/.test(params.allowedDomain)) {
      return { error: "Production widgets require a verified public domain, not localhost or an IP address." };
    }

    const widget: Widget = {
      id: crypto.randomUUID(),
      tenantId: params.tenantId,
      name: params.name,
      widgetType: params.widgetType,
      allowedDomain: params.allowedDomain,
      theme: params.theme ?? "dark",
      language: params.language ?? "en",
      competitionKey: params.competitionKey,
      teamId: params.teamId,
      maxFixtures: Math.min(params.maxFixtures ?? 5, 10),
      ctaUrl: params.ctaUrl ?? "/edge",
      refreshIntervalSeconds: Math.max(params.refreshIntervalSeconds ?? 300, 60),
      attributionVisible: true, // IMMUTABLE — cannot be set to false
      disclaimerText: "Statistical match intelligence. Outcomes are inherently uncertain.",
      modelVersion: "BallMtaani Ensemble v2.0",
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return widget;
  }

  /** Generate the embed code for a widget with attribution and disclaimer enforced. */
  static generateEmbedCode(widget: Widget, sandboxMode = false): WidgetRenderConfig {
    const embedCode = [
      `<div id="bme-widget-${widget.id}" data-bme-widget="${widget.id}"`,
      `  data-type="${widget.widgetType}"`,
      `  data-theme="${widget.theme}"`,
      `  data-lang="${widget.language}"`,
      `  data-sandbox="${sandboxMode}">`,
      `</div>`,
      `<script src="https://widgets.ballmtaani.com/v2/embed.js" async></script>`,
    ].join("\n");

    return {
      widgetId: widget.id,
      embedCode,
      sandboxMode,
      attributionLine: `Powered by BallMtaani Edge · ${widget.modelVersion}`,
      disclaimer: widget.disclaimerText,
    };
  }

  /** Validate that attribution has not been stripped from rendered widget output. */
  static validateWidgetAttribution(renderedHtml: string, widgetId: string): boolean {
    return renderedHtml.includes("BallMtaani") && renderedHtml.includes(widgetId);
  }
}
