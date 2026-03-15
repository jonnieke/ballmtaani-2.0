/**
 * Simple utility to verify Gemini and Football API connectivity.
 * This is meant for development-time verification of .env items.
 */

export async function verifyGeminiConnection() {
  const apiKey = import.meta.env.VITE_GEMINI_API;
  if (!apiKey) return { status: 'missing', message: 'API Key missing' };

  console.log(`[Gemini Diagnostics] Origin: ${window.location.origin}, Referrer: ${document.referrer}`);

  try {
    const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    console.log(`[Gemini Request] Fetching: ${GEMINI_ENDPOINT}`);
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "hi" }] }]
      })
    });
    if (response.ok) {
      return { status: 'connected', message: 'Connected to Gemini API' };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`[Gemini Error] Status: ${response.status}`, errorData);
      
      let msg = `Gemini API ${response.status}: Error`;
      if (errorData.error?.message) {
        msg = `Gemini Error: ${errorData.error.message}`;
      } else if (response.status === 403) {
        msg = 'Gemini 403: Referrer or API Restriction mismatch. Check Google Cloud Console.';
      } else if (response.status === 404) {
        msg = 'Gemini 404: Model or Version not found. Check endpoint.';
      }
      return { status: 'error', message: msg };
    }
  } catch (err) {
    console.error("Gemini Connection Fetch Error:", err);
    return { status: 'error', message: 'Network Error' };
  }
}

export async function verifyFootballConnection() {
  const apiKey = import.meta.env.VITE_API_FOOTBALL_KEY;
  if (!apiKey) return { status: 'missing', message: 'API Key missing' };

  try {
    const response = await fetch('https://v3.football.api-sports.io/status', {
      headers: {
        'x-apisports-key': apiKey
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.errors && Object.keys(data.errors).length > 0) {
        return { status: 'error', message: JSON.stringify(data.errors) };
      }
      return { status: 'connected', message: 'Connected to Football API' };
    } else {
      return { status: 'error', message: `HTTP ${response.status}` };
    }
  } catch (err) {
    return { status: 'error', message: 'Network Error' };
  }
}

export async function verifySupabaseConnection() {
  // Mock connected for now to isolate issues
  return { status: 'connected', message: 'Supabase bypass (debug)' };
}
