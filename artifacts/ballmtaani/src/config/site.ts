import { buildSiteUrl, normalizeSiteUrl } from "../../site.config";

export const SITE_URL = normalizeSiteUrl(import.meta.env.VITE_SITE_URL);
export const SITE_HOST = new URL(SITE_URL).host;

export function siteUrl(path = "/") {
  return buildSiteUrl(path, SITE_URL);
}
