export function formatFreshnessLabel(lastUpdated: Date | null, nowMs = Date.now()): string {
  if (!lastUpdated) return "Updated just now | Source: API-Football";
  const mins = Math.max(0, Math.floor((nowMs - lastUpdated.getTime()) / 60000));
  return `${mins <= 0 ? "Updated just now" : `Updated ${mins} min ago`} | Source: API-Football`;
}
