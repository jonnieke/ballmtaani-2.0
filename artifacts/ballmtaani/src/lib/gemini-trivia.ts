import { TriviaQuestion } from "../data/mockTrivia";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export async function fetchAiTrivia(): Promise<TriviaQuestion[] | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API;
  if (!apiKey) return null;

  const prompt = `Generate 15 football trivia questions in JSON format. 
  Follow the 'Millionaire' difficulty curve:
  - Levels 1-5 (Reward 10-1000 MTC): Focus ONLY on current football news from 2024 and 2025 (latest transfers, Euro 2024, AFCON 2024, UCL results).
  - Levels 6-10 (Reward 2000-50000 MTC): Focus on history from 2000 to 2023.
  - Levels 11-15 (Reward 100,000 to 1,000,000 MTC): Focus on deep football history (1800s to 1999, first World Cups, legendary icons like Pele, Maradona).

  Each question must have:
  - question (string)
  - options (array of 4 strings)
  - correctAnswer (number index 0-3)

  Output only the valid JSON array of questions. No markdown wrapping.`;

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
       console.error("AI Trivia Fetch Failed:", response.status);
       return null;
    }

    const data = await response.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) return null;

    const parsed: any[] = JSON.parse(rawJson);
    
    // Map with fixed rewards corresponding to Millionaire ladder
    const rewards = [10, 50, 100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 250000, 500000, 750000, 1000000];
    
    return parsed.map((q, idx) => ({
      id: `ai_q_${idx}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      reward: rewards[idx] || 0
    }));
  } catch (error) {
    console.error("AI Trivia Engine Error:", error);
    return null;
  }
}
