/**
 * Keyless Vertex AI authentication via Workload Identity Federation.
 *
 * Production (Vercel):
 *   1. Reads VERCEL_OIDC_TOKEN (auto-injected by Vercel — enable in Project Settings → Security)
 *   2. Exchanges it for a federated token via GCP Security Token Service
 *   3. Impersonates the service account to get a short-lived access token
 *   4. Returns that token for use with the Vertex AI REST API
 *
 * Local development:
 *   Run: gcloud auth application-default login
 *   Then: gcloud auth print-access-token  (set as LOCAL_GCP_ACCESS_TOKEN for quick tests)
 *   Or leave LOCAL_GCP_ACCESS_TOKEN unset and the helper returns null → OpenAI fallback.
 *
 * No service account JSON key file is ever created or stored.
 */

type TokenResult = { token: string; source: string } | null;

export async function getVertexAccessToken(env: Record<string, string | undefined>): Promise<TokenResult> {
  // ── Local dev shortcut ──────────────────────────────────────────────────────
  // Set this to `gcloud auth print-access-token` output for local testing.
  if (env.LOCAL_GCP_ACCESS_TOKEN) {
    return { token: env.LOCAL_GCP_ACCESS_TOKEN, source: "local-gcloud" };
  }

  // ── Production: Workload Identity Federation ────────────────────────────────
  const oidcToken         = env.VERCEL_OIDC_TOKEN;
  const projectNumber     = env.GCP_PROJECT_NUMBER;
  const serviceAccount    = env.VERTEX_SERVICE_ACCOUNT;
  const poolId            = env.WORKLOAD_IDENTITY_POOL_ID    || "vercel-pool";
  const providerId        = env.WORKLOAD_IDENTITY_PROVIDER_ID || "vercel-provider";

  if (!oidcToken || !projectNumber || !serviceAccount) {
    return null; // WIF not configured — caller falls through to next provider
  }

  const audience = `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;

  // Step 1: Exchange Vercel OIDC token → GCP federated token
  const stsRes = await fetch("https://sts.googleapis.com/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audience,
      grantType:            "urn:ietf:params:oauth:grant-type:token-exchange",
      requestedTokenType:   "urn:ietf:params:oauth:token-type:access_token",
      subjectToken:         oidcToken,
      subjectTokenType:     "urn:ietf:params:oauth:token-type:jwt",
      scope:                "https://www.googleapis.com/auth/cloud-platform",
    }),
  });

  if (!stsRes.ok) {
    const err = await stsRes.json().catch(() => ({} as any)) as any;
    throw new Error(`WIF STS exchange failed (${stsRes.status}): ${err?.error_description || err?.error || "unknown"}`);
  }

  const { access_token: federatedToken } = await stsRes.json() as any;

  // Step 2: Impersonate the service account → short-lived access token
  const impersonateRes = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccount}:generateAccessToken`,
    {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${federatedToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope:    ["https://www.googleapis.com/auth/cloud-platform"],
        lifetime: "3600s",
      }),
    },
  );

  if (!impersonateRes.ok) {
    const err = await impersonateRes.json().catch(() => ({} as any)) as any;
    throw new Error(`Service account impersonation failed (${impersonateRes.status}): ${JSON.stringify(err?.error || err)}`);
  }

  const { accessToken } = await impersonateRes.json() as any;
  return { token: accessToken, source: "workload-identity-federation" };
}
