/**
 * BallMtaani A/B Experiment Framework
 * Deterministic user-bucketing and variant assignment for product experiments.
 * No external dependencies — pure in-process bucketing using userId hash.
 */

export type Variant = "control" | "treatment";

export interface Experiment {
  id: string;
  name: string;
  rolloutPercent: number; // 0–100: % of users enrolled
  variants: [Variant, Variant]; // [control, treatment]
  isActive: boolean;
}

export const ACTIVE_EXPERIMENTS: Experiment[] = [
  {
    id: "EXP-001",
    name: "hero_banner_cta_copy",
    rolloutPercent: 50,
    variants: ["control", "treatment"],
    isActive: true,
  },
  {
    id: "EXP-002",
    name: "prediction_streak_nudge",
    rolloutPercent: 25,
    variants: ["control", "treatment"],
    isActive: true,
  },
];

/**
 * Deterministic hash to ensure a user always sees the same variant.
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

export function assignVariant(experiment: Experiment, userId: string): Variant | null {
  if (!experiment.isActive) return null;
  const bucket = hashUserId(userId + experiment.id);
  if (bucket >= experiment.rolloutPercent) return null; // Not enrolled
  return bucket % 2 === 0 ? "control" : "treatment";
}

export function getExperimentVariant(experimentId: string, userId: string): Variant | null {
  const experiment = ACTIVE_EXPERIMENTS.find(e => e.id === experimentId);
  if (!experiment) return null;
  return assignVariant(experiment, userId);
}
