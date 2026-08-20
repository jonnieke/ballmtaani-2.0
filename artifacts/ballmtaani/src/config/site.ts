import { buildSiteUrl, normalizeSiteUrl } from "../../site.config";

const rawSiteUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) || (typeof process !== "undefined" && process.env?.VITE_SITE_URL) || "https://ballmtaani.com";

export const SITE_URL = normalizeSiteUrl(rawSiteUrl);
export const SITE_HOST = new URL(SITE_URL).host;

export function siteUrl(path = "/") {
  return buildSiteUrl(path, SITE_URL);
}

export function getSiteUrl() {
  return SITE_URL || "https://ballmtaani.com";
}
