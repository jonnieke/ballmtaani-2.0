import { loadEnv } from "./_env-loader";
import { answerMchambuzi } from "./_mchambuzi-core";

// Load .env variables for local dev (no-op in production)
loadEnv();

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const question = String(req.body?.question || "").trim();
  if (question.length < 3) {
    return json(res, 400, { error: "Ask a football question first." });
  }

  const requestedProvider = String(req.body?.provider || "").trim().toLowerCase();
  const providerPreference =
    requestedProvider === "vertexai" ? "vertexai-only" :
    requestedProvider === "openai" ? "openai-only" :
    requestedProvider === "openai-first" ? "openai-first" :
    requestedProvider === "vertexai-first" ? "vertexai-first" :
    undefined;
  const debug = req.body?.debug === true || process.env.MCHAMBUZI_DEBUG === "true";
  const result = await answerMchambuzi(question, process.env, { debug, providerPreference });
  return json(res, 200, result);
}
