/**
 * Simple utility to verify Gemini and Football API connectivity.
 * This is meant for development-time verification of .env items.
 */

export async function verifyGeminiConnection() {
  const apiKey = import.meta.env.VITE_GEMINI_API;
  if (!apiKey) return { status: 'missing', message: 'API Key missing' };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, {
      headers: {
        'x-goog-api-key': apiKey
      }
    });
    if (response.ok) {
      return { status: 'connected', message: 'Connected to Gemini API' };
    } else {
      if (response.status === 403) {
        return { 
          status: 'error', 
          message: 'Gemini API 403 (Forbidden): Check API Key Restrictions or enablement in Google Cloud Console.' 
        };
      }
      const error = await response.json();
      return { status: 'error', message: error.error?.message || 'Gemini API Error' };
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
