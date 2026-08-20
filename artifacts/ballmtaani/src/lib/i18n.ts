/**
 * BallMtaani i18n Dictionary
 * Swahili, English, and Sheng support for core fan-facing strings.
 * Keyed by string ID; falls back to English for any missing translation.
 */

export type Locale = "en" | "sw" | "sheng";

export type StringKey =
  | "matchday.title"
  | "matchday.live"
  | "matchday.kickoff"
  | "predictions.title"
  | "predictions.submit"
  | "predictions.receipt"
  | "debates.title"
  | "debates.placeholder"
  | "fan.greeting"
  | "fan.favourite_teams"
  | "fan.coins";

const dictionary: Record<StringKey, Record<Locale, string>> = {
  "matchday.title": {
    en: "Today's Matchday",
    sw: "Mechi za Leo",
    sheng: "Sasa-sasa matchday",
  },
  "matchday.live": {
    en: "LIVE",
    sw: "MOJA KWA MOJA",
    sheng: "LIVE bana",
  },
  "matchday.kickoff": {
    en: "Kicks off at",
    sw: "Inaanza saa",
    sheng: "Inaanza",
  },
  "predictions.title": {
    en: "My Predictions",
    sw: "Matarajio Yangu",
    sheng: "Predictions zangu",
  },
  "predictions.submit": {
    en: "Lock in Prediction",
    sw: "Thibitisha Matarajio",
    sheng: "Lock matarajio yako",
  },
  "predictions.receipt": {
    en: "Share Prediction Receipt",
    sw: "Shiriki Risiti ya Matarajio",
    sheng: "Share receipt yako",
  },
  "debates.title": {
    en: "Fan Debates",
    sw: "Midahalo ya Mashabiki",
    sheng: "Madebate za wafans",
  },
  "debates.placeholder": {
    en: "Drop your take...",
    sw: "Andika maoni yako...",
    sheng: "Sema take yako hapa...",
  },
  "fan.greeting": {
    en: "Welcome back",
    sw: "Karibu tena",
    sheng: "Urudi bana",
  },
  "fan.favourite_teams": {
    en: "My Clubs",
    sw: "Klabu Zangu",
    sheng: "Clubs zangu",
  },
  "fan.coins": {
    en: "MTC Coins",
    sw: "Sarafu za MTC",
    sheng: "Coins bana",
  },
};

export function t(key: StringKey, locale: Locale = "en"): string {
  return dictionary[key]?.[locale] ?? dictionary[key]?.["en"] ?? key;
}
