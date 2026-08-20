const BLOCKED_PREFIXES = [
  "/login",
  "/register",
  "/auth",
  "/otp",
  "/verify-otp",
  "/profile",
  "/notifications",
  "/matches",
  "/match-center",
  "/live",
  "/live-center",
  "/live-centre",
  "/leagues",
  "/data-center",
  "/data-centre",
  "/sports-data-center",
  "/predictions",
  "/debates",
  "/leaderboard",
  "/mchambuzi-halisi",
  "/rapid-fire",
  "/trivia",
  "/war-room",
  "/rivalries",
  "/search",
  "/diagnostics",
  "/admin",
  "/account",
  "/store",
  "/marketplace",
  "/edge",
];

function normalizePathname(pathname: string) {
  const value = pathname.trim().toLowerCase();
  return value.length > 1 && value.endsWith("/") ? value.replace(/\/+$/, "") : value;
}

export function canShowAdsOnPath(pathname = typeof window !== "undefined" ? window.location.pathname : "") {
  if (!pathname) return true;
  const normalized = normalizePathname(pathname);
  return !BLOCKED_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}
