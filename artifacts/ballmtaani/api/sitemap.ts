import type { IncomingMessage, ServerResponse } from "http";
import { createClient } from "@supabase/supabase-js";
import { normalizeSiteUrl } from "../site.config";

const STATIC = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/matches", priority: "0.9", changefreq: "hourly" },
  { loc: "/news", priority: "0.9", changefreq: "daily" },
  { loc: "/predictions", priority: "0.8", changefreq: "daily" },
  { loc: "/debates", priority: "0.8", changefreq: "daily" },
  { loc: "/fan-zones", priority: "0.8", changefreq: "daily" },
  { loc: "/mchambuzi-halisi", priority: "0.8", changefreq: "daily" },
  { loc: "/leaderboard", priority: "0.7", changefreq: "daily" },
  { loc: "/rivalries", priority: "0.7", changefreq: "daily" },
  { loc: "/rapid-fire", priority: "0.7", changefreq: "daily" },
  { loc: "/trivia", priority: "0.7", changefreq: "weekly" },
  { loc: "/war-room", priority: "0.7", changefreq: "daily" },
  { loc: "/store", priority: "0.6", changefreq: "weekly" },
  { loc: "/world-cup-2026", priority: "0.5", changefreq: "monthly" },
  { loc: "/world-cup-2026/bracket", priority: "0.5", changefreq: "monthly" },
  { loc: "/world-cup-2026/format", priority: "0.5", changefreq: "monthly" },
  { loc: "/world-cup-2026/stadiums", priority: "0.5", changefreq: "monthly" },
  { loc: "/world-cup-2026/africa", priority: "0.5", changefreq: "monthly" },
  { loc: "/world-cup-2026/squads", priority: "0.5", changefreq: "monthly" },
] as const;

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] || character);
}

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  const site = normalizeSiteUrl(process.env.VITE_SITE_URL || process.env.SITE_URL);
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || "";

  let articles: { slug: string; published_at: string }[] = [];
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from("articles").select("slug, published_at").eq("status", "published").order("published_at", { ascending: false }).limit(500);
      articles = (data as typeof articles) || [];
    } catch { /* Static routes still produce a valid sitemap. */ }
  }

  const urls = [
    ...STATIC.map((entry) => `\n  <url><loc>${escapeXml(site + entry.loc)}</loc><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`),
    ...articles.map((article) => `\n  <url><loc>${escapeXml(`${site}/article/${article.slug}`)}</loc><lastmod>${new Date(article.published_at).toISOString().split("T")[0]}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`),
  ].join("");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`);
}
