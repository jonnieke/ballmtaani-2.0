/**
 * BallMtaani Edge Phase 2 — Central Configurable Competition Registry
 */

export interface SupportedCompetitionConfig {
  internalKey: string;
  providerId: number;
  name: string;
  country: string;
  enabled: boolean;
  historicalSeasonsToImport: number;
  predictionEnabled: boolean;
  oddsEnabled: boolean;
  statisticsEnabled: boolean;
  competitionStrength: number;
}

export const COMPETITION_REGISTRY: Record<string, SupportedCompetitionConfig> = {
  epl: {
    internalKey: "epl",
    providerId: 39,
    name: "Premier League",
    country: "England",
    enabled: true,
    historicalSeasonsToImport: 3,
    predictionEnabled: true,
    oddsEnabled: true,
    statisticsEnabled: true,
    competitionStrength: 1.0,
  },
  ucl: {
    internalKey: "ucl",
    providerId: 2,
    name: "UEFA Champions League",
    country: "World",
    enabled: true,
    historicalSeasonsToImport: 3,
    predictionEnabled: true,
    oddsEnabled: true,
    statisticsEnabled: true,
    competitionStrength: 1.05,
  },
  la_liga: {
    internalKey: "la_liga",
    providerId: 140,
    name: "La Liga",
    country: "Spain",
    enabled: true,
    historicalSeasonsToImport: 3,
    predictionEnabled: true,
    oddsEnabled: true,
    statisticsEnabled: true,
    competitionStrength: 0.98,
  },
  serie_a: {
    internalKey: "serie_a",
    providerId: 135,
    name: "Serie A",
    country: "Italy",
    enabled: true,
    historicalSeasonsToImport: 3,
    predictionEnabled: true,
    oddsEnabled: true,
    statisticsEnabled: true,
    competitionStrength: 0.95,
  },
  kpl: {
    internalKey: "kpl",
    providerId: 686,
    name: "Kenyan Premier League",
    country: "Kenya",
    enabled: true,
    historicalSeasonsToImport: 2,
    predictionEnabled: false, // Flagged false until sufficient data completeness is reached
    oddsEnabled: false,
    statisticsEnabled: true,
    competitionStrength: 0.50,
  },
};

export function getSupportedCompetitionsList(): SupportedCompetitionConfig[] {
  return Object.values(COMPETITION_REGISTRY);
}

export function getCompetitionByProviderId(providerId: number): SupportedCompetitionConfig | undefined {
  return Object.values(COMPETITION_REGISTRY).find((c) => c.providerId === providerId);
}
