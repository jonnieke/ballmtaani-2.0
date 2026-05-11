export const AD_STRATEGY = {
  liveCenterFeedInterval: 6,
  predictionsFeedInterval: 8,
  debatesFeedInterval: 4,
} as const;

export function shouldShowFeedAd(index: number, interval: number, total: number) {
  return (index + 1) % interval === 0 && index !== total - 1;
}
