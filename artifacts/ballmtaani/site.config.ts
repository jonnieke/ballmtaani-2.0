export const DEFAULT_SITE_URL = "https://ballmtaani.com";

export function normalizeSiteUrl(value?: string | null) {
  return (value || DEFAULT_SITE_URL).trim().replace(/\/+$/, "");
}

export function buildSiteUrl(path = "/", configuredSiteUrl?: string | null) {
  const siteUrl = normalizeSiteUrl(configuredSiteUrl);
  const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/+/, "")}`;
  return `${siteUrl}${normalizedPath}`;
}
