/**
 * BallMtaani Edge Phase 2 — Team Name Normalization & Alias Resolver
 */

/**
 * Normalizes a raw team name into a standardized lowercase string for matching.
 * e.g. "Manchester United FC" -> "manchester united"
 * "Paris Saint-Germain" -> "paris saint germain"
 * "AFC Leopards SC" -> "afc leopards"
 */
export function normalizeTeamName(rawName: string): string {
  if (!rawName) return "";

  let cleaned = rawName.toLowerCase().trim();

  // Strip punctuation & special characters
  cleaned = cleaned.replace(/[^\w\s]/gi, " ");

  // Replace multiple spaces with a single space
  cleaned = cleaned.replace(/\s+/g, " ");

  // Strip controlled suffixes / prefixes when standalone
  const controlledTokens = ["fc", "afc", "sc", "cf", "club", "cd", "ud"];
  const tokens = cleaned.split(" ").filter((t) => !controlledTokens.includes(t));

  const result = tokens.join(" ").trim();
  return result.length > 0 ? result : cleaned;
}

const STATIC_TEAM_ALIASES: Record<string, string> = {
  "man utd": "manchester united",
  "man city": "manchester city",
  "spurs": "tottenham hotspur",
  "atletico": "atletico madrid",
  "inter": "inter milan",
  "barca": "barcelona",
  "gor": "gor mahia",
  "ingwe": "afc leopards",
};

/**
 * Resolves a raw or partial team name using static alias mappings.
 */
export function resolveTeamAlias(rawName: string): string {
  const norm = normalizeTeamName(rawName);
  return STATIC_TEAM_ALIASES[norm] || norm;
}
