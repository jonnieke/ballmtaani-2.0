import { TriviaQuestion } from "../data/mockTrivia";

/**
 * Fetches AI-generated trivia questions from the secure Vertex AI serverless endpoint.
 * No AI keys are used in the browser — the serverless function handles auth via
 * GOOGLE_SERVICE_ACCOUNT_JSON on the server.
 */
export async function fetchAiTrivia(): Promise<TriviaQuestion[] | null> {
  try {
    const res = await fetch("/api/generate-trivia");
    if (!res.ok) return null;

    const data = await res.json();
    const questions: TriviaQuestion[] = data?.questions;
    if (!Array.isArray(questions) || questions.length === 0) return null;

    return questions;
  } catch {
    return null;
  }
}
