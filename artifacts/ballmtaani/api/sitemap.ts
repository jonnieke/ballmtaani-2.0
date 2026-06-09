import type { IncomingMessage, ServerResponse } from "http";
import { createClient } from "@supabase/supabase-js";

const SITE = "https://ballmtaani.com";

const STATIC = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/news", priority: "0.9", changefreq: "daily" },
  { loc: "/world-cup-2026", priority: "0.9", changefreq: "daily" },
  { loc: "/matches", priority: "0.8", changefreq: "hourly" },
  { loc: "/predictions", priority: "0.8", changefreq: "daily" },
  { loc: "/debates", priority: "0.7", changefreq: "daily" },
  { loc: "/rivalries", priority: "0.7", changefreq: "daily" },
  { loc: "/leaderboard", priority: "0.7", changefreq: "daily" },
  { loc: "/store", priority: "0.6", changefreq: "weekly" },
];

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || "";

  let articles: { slug: string; published_at: string }[] = [];
  if (url && key) {
    try {
      const sb = createClient(url, key);
      const { data } = await sb
        .from("articles")
        .select("slug, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(500);
      articles = (data as any[]) || [];
    } catch { /* ignore */ }
  }

  const urls = [
    ...STATIC.map(s => `
  <url>
    <loc>${SITE}${s.loc}</loc>
    <changefreq>${s.changefreq}</changefreq>
    <priority>${s.priority}</priority>
  </url>`),
    ...articles.map(a => `
  <url>
    <loc>${SITE}/article/${a.slug}</loc>
    <lastmod>${new Date(a.published_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`),
  ].join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.end(xml);
}
