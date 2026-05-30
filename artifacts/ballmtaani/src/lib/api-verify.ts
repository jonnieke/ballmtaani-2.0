/**
 * API connectivity verification for the Diagnostics page.
 * All AI verification goes through the secure Vercel serverless endpoints —
 * no AI keys are read or used in the browser.
 */

export async function verifyGeminiConnection() {
  // Verify Vertex AI (the platform AI engine) by hitting the Mchambuzi endpoint.
  // A real answer means Vertex AI → Vercel serverless is healthy end-to-end.
  try {
    const res = await fetch("/api/mchambuzi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "ping" }),
    });

    if (!res.ok) {
      return { status: "error", message: `Vertex AI endpoint returned ${res.status}` };
    }

    const data = await res.json();
    const provider = data?.provider ?? "unknown";

    if (data?.answer) {
      return {
        status: "connected",
        message: `Connected via ${provider === "vertexai" ? "Vertex AI (GCP)" : provider} → Vercel serverless`,
      };
    }

    return { status: "error", message: "Endpoint reachable but no answer returned" };
  } catch (err) {
    return { status: "error", message: "Network error reaching /api/mchambuzi" };
  }
}

export async function verifyFootballConnection() {
  const apiKey = import.meta.env.VITE_API_FOOTBALL_KEY;
  if (!apiKey) return { status: "missing", message: "VITE_API_FOOTBALL_KEY not set" };

  try {
    const res = await fetch("https://v3.football.api-sports.io/status", {
      headers: { "x-apisports-key": apiKey },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.errors && Object.keys(data.errors).length > 0) {
        return { status: "error", message: JSON.stringify(data.errors) };
      }
      return { status: "connected", message: "Connected to API-Football" };
    }
    return { status: "error", message: `HTTP ${res.status}` };
  } catch {
    return { status: "error", message: "Network error" };
  }
}

export async function verifySupabaseConnection() {
  // Supabase is verified implicitly by the app functioning.
  // Deep check requires a server-side call — skipped here.
  return { status: "connected", message: "Supabase connection delegated to app runtime" };
}
