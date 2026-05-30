/**
 * Generates the WC26 hero image using Vertex AI (Imagen / Gemini image models).
 * Keyless auth — uses Application Default Credentials (ADC).
 *
 * Local setup (one-time):
 *   gcloud auth application-default login
 *
 * Then run:
 *   node scripts/gen-wc26-hero.mjs
 *
 * Or override with a direct access token (useful in CI):
 *   LOCAL_GCP_ACCESS_TOKEN=$(gcloud auth print-access-token) \
 *   node scripts/gen-wc26-hero.mjs
 *
 * Output: public/wc26-hero.jpg
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { GoogleAuth } from "google-auth-library";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "public", "wc26-hero.jpg");

const PROJECT_ID = process.env.VERTEX_PROJECT_ID || "ball-mtaani-496717";
const LOCATION   = process.env.VERTEX_LOCATION   || "us-central1";

async function getAccessToken() {
  // Allow a pre-fetched token for quick CI / local overrides
  if (process.env.LOCAL_GCP_ACCESS_TOKEN) {
    return process.env.LOCAL_GCP_ACCESS_TOKEN;
  }
  // Application Default Credentials — gcloud auth application-default login
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error("Failed to obtain GCP access token via ADC. Run: gcloud auth application-default login");
  return token.token;
}

const PROMPT = `
Cinematic ultra-wide World Cup 2026 hero photograph, 16:9 aspect ratio.
Massive packed stadium at night with 90,000 fans, golden floodlights
cutting through atmospheric haze, a magnificent FIFA World Cup Trophy
gleaming gold in sharp foreground focus against a deep navy-blue stadium backdrop.
Confetti and golden streamers cascading from above.
Silhouette of a celebrating player arms raised in triumph on the lush green pitch.
Dramatic bokeh crowd in background, rich cinematic depth of field.
Deep navy blacks, radiant gold highlights, crimson accents.
Dark moody vignette edges perfect for text overlay.
Photorealistic premium sports editorial photography, 8K quality.
National Geographic / Getty sports cover aesthetic.
No text, no watermarks, no logos.
`.trim();

// Models to try in order (Vertex AI model IDs)
const MODELS = [
  "imagen-3.0-generate-001",
  "imagen-4.0-generate-001",
  "imagen-4.0-fast-generate-001",
];

async function tryImagen(model, accessToken) {
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}:predict`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instances: [{ prompt: PROMPT }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "16:9",
        outputMimeType: "image/jpeg",
        outputCompressionQuality: 95,
        personGeneration: "allow_adult",
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: data?.error?.message || `HTTP ${res.status}` };
  }

  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) return { ok: false, error: "No image data in response" };
  return { ok: true, b64 };
}

async function tryGeminiImage(model, accessToken) {
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: PROMPT }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: data?.error?.message || `HTTP ${res.status}` };
  }

  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part?.inlineData?.data) {
      return { ok: true, b64: part.inlineData.data };
    }
  }
  return { ok: false, error: "No image in response" };
}

async function generate() {
  console.log("🔐 Obtaining GCP access token…");
  const token = await getAccessToken();
  console.log("✅ Token obtained\n");

  // Try Imagen first (highest quality), then Gemini image models
  const imagenModels = MODELS;
  const geminiImageModels = ["gemini-3-pro-image", "gemini-3.1-flash-image", "gemini-2.5-flash-image"];

  for (const model of imagenModels) {
    console.log(`🎨 Trying Imagen: ${model}…`);
    const result = await tryImagen(model, token);
    if (result.ok) {
      const buf = Buffer.from(result.b64, "base64");
      writeFileSync(OUT_PATH, buf);
      console.log(`✅ Saved → ${OUT_PATH}  (${(buf.length / 1024).toFixed(0)} KB)  [${model}]`);
      return;
    }
    console.warn(`  ↳ ${result.error}`);
  }

  for (const model of geminiImageModels) {
    console.log(`🎨 Trying Gemini image: ${model}…`);
    const result = await tryGeminiImage(model, token);
    if (result.ok) {
      const buf = Buffer.from(result.b64, "base64");
      writeFileSync(OUT_PATH, buf);
      console.log(`✅ Saved → ${OUT_PATH}  (${(buf.length / 1024).toFixed(0)} KB)  [${model}]`);
      return;
    }
    console.warn(`  ↳ ${result.error}`);
  }

  console.error("❌ All models failed. Ensure GOOGLE_SERVICE_ACCOUNT_JSON is set and the service account has Vertex AI User role.");
  process.exit(1);
}

generate().catch((err) => {
  console.error("Fatal:", err.message || err);
  process.exit(1);
});
