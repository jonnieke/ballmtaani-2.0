/**
 * BallMtaani Centralized Ad Campaign & Sponsorship Engine
 * Manages sponsored placements, frequency capping per user, and campaign reporting.
 */

export type AdPlacementType =
  | "homepage"
  | "match-centre"
  | "article"
  | "prediction-results"
  | "leaderboard";

export interface AdCampaign {
  id: string;
  sponsorName: string;
  tagline: string;
  placement: AdPlacementType;
  bannerImageUrl?: string;
  destinationUrl: string;
  frequencyCapPerUser: number; // Max impressions per user session
  startsAtISO: string;
  expiresAtISO: string;
  isActive: boolean;
}

export const SAMPLE_CAMPAIGNS: AdCampaign[] = [
  {
    id: "CAMP-001",
    sponsorName: "Safaricom M-PESA Matchday",
    tagline: "Predict match scores and get instant MTC rewards straight to your account.",
    placement: "homepage",
    destinationUrl: "/predictions",
    frequencyCapPerUser: 5,
    startsAtISO: "2026-01-01T00:00:00.000Z",
    expiresAtISO: "2027-01-01T00:00:00.000Z",
    isActive: true,
  },
  {
    id: "CAMP-002",
    sponsorName: "Kenya Airways Harambee Stars Partner",
    tagline: "Fly to every Harambee Stars away match in 2026/27.",
    placement: "match-centre",
    destinationUrl: "/matches",
    frequencyCapPerUser: 3,
    startsAtISO: "2026-01-01T00:00:00.000Z",
    expiresAtISO: "2027-01-01T00:00:00.000Z",
    isActive: true,
  },
];

/**
 * Filter active campaigns for a placement
 */
export function getActiveCampaign(placement: AdPlacementType, campaigns = SAMPLE_CAMPAIGNS): AdCampaign | null {
  const now = new Date().getTime();
  const valid = campaigns.filter(c => {
    if (!c.isActive || c.placement !== placement) return false;
    const start = new Date(c.startsAtISO).getTime();
    const expire = new Date(c.expiresAtISO).getTime();
    return now >= start && now <= expire;
  });
  return valid[0] || null;
}

/**
 * Frequency cap tracker helper
 */
export function isFrequencyCapExceeded(campaignId: string, currentViews: number, cap: number): boolean {
  return currentViews >= cap;
}
