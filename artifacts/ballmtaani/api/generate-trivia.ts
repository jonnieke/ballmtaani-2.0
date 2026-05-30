import { getVertexAccessToken } from "./_vertex-auth";

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

const PROMPT = `Generate exactly 15 football trivia questions in JSON format.
Follow the Millionaire difficulty curve:
- Questions 1–5  (easy):   Current football news, 2024–2026. World Cup 2026, transfers, recent results.
- Questions 6–10 (medium): Football history 2000–2023. Champions League winners, iconic moments.
- Questions 11–15 (hard):  Deep history pre-2000. First World Cups, Pelé, Maradona, legendary records.

Each question must have:
  question      (string)
  options       (array of exactly 4 strings)
  correctAnswer (integer index 0–3)

Output ONLY a valid JSON array. No markdown. No commentary.`;

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const projectId = process.env.VERTEX_PROJECT_ID || "ball-mtaani-496717";
  const location  = process.env.VERTEX_LOCATION   || "us-central1";
  const modelName = process.env.VERTEX_MODEL       || "gemini-2.0-flash-001";

  let tokenResult: Awaited<ReturnType<typeof getVertexAccessToken>>;
  try {
    tokenResult = await getVertexAccessToken(process.env as any);
  } catch (err: any) {
    return json(res, 503, { error: `WIF auth failed: ${err.message}`, questions: null });
  }

  if (!tokenResult) {
    return json(res, 503, { error: "Vertex AI not configured (WIF env vars missing)", questions: null });
  }

  try {
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelName}:generateContent`;

    const apiRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${tokenResult.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: PROMPT }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 2048, responseMimeType: "application/json" },
      }),
    });

    if (!apiRes.ok) {
      const err = await apiRes.json().catch(() => ({}));
      return json(res, 502, { error: err?.error?.message || `Vertex ${apiRes.status}`, questions: null });
    }

    const data = await apiRes.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!raw) return json(res, 502, { error: "Empty response from Vertex AI", questions: null });

    let cleanJson = raw;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```json?/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(cleanJson);
    const rewards = [10, 50, 100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 250000, 500000, 750000, 1000000];

    const questions = parsed.slice(0, 15).map((q: any, idx: number) => ({
      id: `vtx_q_${idx}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      reward: rewards[idx] ?? 0,
    }));

    return json(res, 200, { questions });
  } catch (err: any) {
    return json(res, 500, { error: String(err?.message || err).slice(0, 300), questions: null });
  }
}
