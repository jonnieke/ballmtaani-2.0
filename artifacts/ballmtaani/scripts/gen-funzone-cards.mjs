/**
 * Generates the six Fun Zone game-card images using Vertex AI
 * (Gemini image models / Imagen). Same keyless ADC auth as gen-wc26-hero.mjs.
 *
 *   node scripts/gen-funzone-cards.mjs            # generate all (skips existing)
 *   node scripts/gen-funzone-cards.mjs --force    # regenerate all
 *   node scripts/gen-funzone-cards.mjs trivia     # generate one card by slug
 *
 * Output: public/funzone/<slug>.jpg
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { GoogleAuth } from "google-auth-library";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "funzone");

const PROJECT_ID = process.env.VERTEX_PROJECT_ID || "ball-mtaani-496717";
const LOCATION   = process.env.VERTEX_LOCATION   || "us-central1";

const STYLE = `
Photorealistic premium sports editorial photography, 8K quality,
cinematic depth of field, dark moody atmosphere with deep navy blacks,
radiant gold highlights and crimson accent lighting.
Getty sports cover aesthetic. Strong subject focus, dark vignette edges.
16:9 aspect ratio. No text, no watermarks, no logos, no brand marks.
`.trim();

const CARDS = [
  {
    slug: "trivia",
    prompt: `Close-up of a coach's tactics clipboard with chess pieces placed on the pitch diagram,
a gleaming referee whistle and professional black-and-gold football boots beside it,
dramatic spotlight from above on a dark dressing-room bench, shallow depth of field. ${STYLE}`,
  },
  {
    slug: "rapid-fire",
    prompt: `Two classic soccer jerseys (association football shirts, short-sleeved, no helmets, no pads)
displayed on mannequin torsos facing each other like a boxing face-off,
one lit electric blue from the left, one lit crimson red from the right,
a soccer ball on the floor between them, dramatic rim lighting in a dark stadium tunnel,
intense confrontation mood. ${STYLE}`,
  },
  {
    slug: "predictions",
    prompt: `A magnificent golden football trophy on a dark pedestal in an empty night stadium,
single dramatic golden spotlight beam from above, faint golden confetti drifting,
bokeh floodlights far in the background, reverent atmosphere. ${STYLE}`,
  },
  {
    slug: "rivalries",
    prompt: `Two African football fans face to face in profile silhouette inside a stadium tunnel,
each wearing rival team scarves, stadium glow behind them, electric standoff energy,
dramatic side lighting, charged atmosphere before a derby. ${STYLE}`,
  },
  {
    slug: "mchambuzi",
    prompt: `A holographic glowing football hovering above an analyst's desk covered in
tactical data projections and glowing pitch heat-maps, futuristic AI war-room,
violet and gold light, dark high-tech studio, sense of machine intelligence studying the game. ${STYLE}`,
  },
  {
    slug: "war-room",
    prompt: `A broadcast pundit desk in a dark studio with multiple glowing screens showing
football pitches and live statistics, a professional microphone in sharp foreground focus,
amber and crimson studio lighting, heated debate atmosphere, empty chairs mid-argument. ${STYLE}`,
  },
];

async function getAccessToken() {
  if (process.env.LOCAL_GCP_ACCESS_TOKEN) return process.env.LOCAL_GCP_ACCESS_TOKEN;
  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error("Failed to obtain GCP access token via ADC. Run: gcloud auth application-default login");
  return token.token;
}

async function tryImagen(model, prompt, accessToken) {
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}:predict`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "16:9",
        outputMimeType: "image/jpeg",
        outputCompressionQuality: 92,
        personGeneration: "allow_adult",
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data?.error?.message || `HTTP ${res.status}` };
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) return { ok: false, error: "No image data in response" };
  return { ok: true, b64 };
}

async function tryGeminiImage(model, prompt, accessToken) {
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data?.error?.message || `HTTP ${res.status}` };
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part?.inlineData?.data) return { ok: true, b64: part.inlineData.data };
  }
  return { ok: false, error: "No image in response" };
}

const IMAGEN_MODELS = ["imagen-3.0-generate-001", "imagen-4.0-generate-001", "imagen-4.0-fast-generate-001"];
const GEMINI_MODELS = ["gemini-3-pro-image", "gemini-3.1-flash-image", "gemini-2.5-flash-image"];

async function generateCard(card, token) {
  for (const model of [...IMAGEN_MODELS.map(m => ["imagen", m]), ...GEMINI_MODELS.map(m => ["gemini", m])]) {
    const [kind, name] = model;
    console.log(`  🎨 ${card.slug}: trying ${name}…`);
    const result = kind === "imagen"
      ? await tryImagen(name, card.prompt, token)
      : await tryGeminiImage(name, card.prompt, token);
    if (result.ok) {
      const buf = Buffer.from(result.b64, "base64");
      const out = join(OUT_DIR, `${card.slug}.jpg`);
      writeFileSync(out, buf);
      console.log(`  ✅ ${card.slug}.jpg  (${(buf.length / 1024).toFixed(0)} KB)  [${name}]`);
      return true;
    }
    console.warn(`     ↳ ${result.error}`);
  }
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = args.filter(a => !a.startsWith("--"));

  mkdirSync(OUT_DIR, { recursive: true });
  console.log("🔐 Obtaining GCP access token…");
  const token = await getAccessToken();
  console.log("✅ Token obtained\n");

  let failures = 0;
  for (const card of CARDS) {
    if (only.length && !only.includes(card.slug)) continue;
    const out = join(OUT_DIR, `${card.slug}.jpg`);
    if (!force && existsSync(out)) {
      console.log(`  ⏭  ${card.slug}.jpg exists — skipping (use --force to regenerate)`);
      continue;
    }
    const ok = await generateCard(card, token);
    if (!ok) { failures++; console.error(`  ❌ ${card.slug}: all models failed`); }
  }
  if (failures) process.exit(1);
  console.log("\n🏁 Done.");
}

main().catch((err) => {
  console.error("Fatal:", err.message || err);
  process.exit(1);
});
