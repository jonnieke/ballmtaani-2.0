#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# BallMtaani — Workload Identity Federation setup for Vercel → Vertex AI
#
# Prerequisites:
#   gcloud auth login
#   gcloud config set project ball-mtaani-496717
#
# Usage:
#   chmod +x scripts/setup-wif.sh
#   VERCEL_PROJECT_ID=<your-vercel-project-id> bash scripts/setup-wif.sh
#
# Find your Vercel Project ID at:
#   Vercel Dashboard → Your Project → Settings → General → Project ID
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

PROJECT_ID="ball-mtaani-496717"
REGION="us-central1"
SA_NAME="ballmtaani-vertex"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
POOL_ID="vercel-pool"
PROVIDER_ID="vercel-provider"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:?Set VERCEL_PROJECT_ID env var first}"

echo "🔍 Fetching project number…"
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
echo "   Project number: $PROJECT_NUMBER"

echo ""
echo "🔌 Enabling required APIs…"
gcloud services enable \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  aiplatform.googleapis.com \
  --project="$PROJECT_ID"

echo ""
echo "🪣 Creating Workload Identity Pool…"
gcloud iam workload-identity-pools create "$POOL_ID" \
  --project="$PROJECT_ID" \
  --location="global" \
  --display-name="Vercel Pool" \
  --description="Allows Vercel serverless functions to access GCP without keys" \
  2>/dev/null || echo "   Pool already exists — skipping"

echo ""
echo "🔗 Creating OIDC provider for Vercel…"
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
  --project="$PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="$POOL_ID" \
  --display-name="Vercel" \
  --issuer-uri="https://oidc.vercel.com" \
  --allowed-audiences="https://vercel.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.vercel_project_id=assertion.project_id,attribute.owner=assertion.owner" \
  2>/dev/null || echo "   Provider already exists — skipping"

echo ""
echo "🤖 Creating service account…"
gcloud iam service-accounts create "$SA_NAME" \
  --project="$PROJECT_ID" \
  --display-name="BallMtaani Vertex AI" \
  --description="Used by Vercel serverless functions via WIF to call Vertex AI" \
  2>/dev/null || echo "   Service account already exists — skipping"

echo ""
echo "🎯 Granting Vertex AI User role to service account…"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/aiplatform.user" \
  --condition=None

echo ""
echo "🔑 Allowing WIF to impersonate the service account…"
WIF_PRINCIPAL="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.vercel_project_id/${VERCEL_PROJECT_ID}"

gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="$WIF_PRINCIPAL"

echo ""
echo "✅ WIF setup complete!"
echo ""
echo "═══════════════════════════════════════════════════════"
echo "Add these to Vercel → Settings → Environment Variables:"
echo "═══════════════════════════════════════════════════════"
echo "GCP_PROJECT_NUMBER          = $PROJECT_NUMBER"
echo "VERTEX_PROJECT_ID           = $PROJECT_ID"
echo "VERTEX_LOCATION             = $REGION"
echo "VERTEX_MODEL                = gemini-2.0-flash-001"
echo "VERTEX_SERVICE_ACCOUNT      = $SA_EMAIL"
echo "WORKLOAD_IDENTITY_POOL_ID   = $POOL_ID"
echo "WORKLOAD_IDENTITY_PROVIDER_ID = $PROVIDER_ID"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Also enable OIDC tokens in Vercel:"
echo "  Vercel Dashboard → Your Project → Settings → Security → Enable Vercel OIDC Token"
