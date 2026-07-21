import { createClient } from "@supabase/supabase-js";

const BASE = "https://ballmtaani.com";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/'/g, "&apos;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(loc: string, opts: { lastmod?: string; changefreq?: string; priority?: string }) {
  const parts = [`  <url>\n    <loc>${esc(loc)}</loc>`];
  if (opts.lastmod) parts.push(`    <lastmod>${opts.lastmod}</lastmod>`);
  if (opts.changefreq) parts.push(`    <changefreq>${opts.changefreq}</changefreq>`);
  if (opts.priority) parts.push(`    <priority>${opts.priority}</priority>`);
  parts.push("  </url>");
  return parts.join("\n");
}

const STATIC_PAGES = [
  { loc: "/", priority: "1.00", changefreq: "hourly" },
  { loc: "/about", priority: "0.80", changefreq: "monthly" },
  { loc: "/contact", priority: "0.75", changefreq: "monthly" },
  { loc: "/privacy", priority: "0.40", changefreq: "monthly" },
  { loc: "/terms", priority: "0.40", changefreq: "monthly" },
  { loc: "/world-cup-2026", priority: "0.50", changefreq: "monthly" },
  { loc: "/world-cup-2026/bracket", priority: "0.45", changefreq: "monthly" },
];

const LEAGUES = [
  { slug: "premier-league", priority: "0.95" },
  { slug: "champions-league", priority: "0.95" },
  { slug: "fkf-premier-league", priority: "0.95" },
  { slug: "la-liga", priority: "0.90" },
  { slug: "serie-a", priority: "0.90" },
  { slug: "bundesliga", priority: "0.85" },
  { slug: "ligue-1", priority: "0.85" },
  { slug: "caf-champions-league", priority: "0.85" },
  { slug: "caf-confederation-cup", priority: "0.80" },
  { slug: "harambee-stars", priority: "0.90" },
];

const TEAMS = [
  { slug: "arsenal" },
  { slug: "manchester-united" },
  { slug: "chelsea" },
  { slug: "liverpool" },
  { slug: "gor-mahia" },
  { slug: "afc-leopards" },
  { slug: "real-madrid" },
  { slug: "barcelona" },
];

export default async function handler(req: any, res: any) {
  const today = new Date().toISOString().slice(0, 10);
  const type = req.query?.type || (req.url ? req.url.split("type=")[1] : "");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

  if (type === "pages") {
    const entries = STATIC_PAGES.map(p => urlEntry(`${BASE}${p.loc}`, { lastmod: today, changefreq: p.changefreq, priority: p.priority }));
    return res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`);
  }

  if (type === "leagues") {
    const entries = LEAGUES.flatMap(l => [
      urlEntry(`${BASE}/leagues/${l.slug}`, { lastmod: today, changefreq: "daily", priority: l.priority }),
      urlEntry(`${BASE}/leagues/${l.slug}/fixtures`, { lastmod: today, changefreq: "daily", priority: "0.80" }),
      urlEntry(`${BASE}/leagues/${l.slug}/table`, { lastmod: today, changefreq: "daily", priority: "0.80" }),
    ]);
    return res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`);
  }

  if (type === "teams") {
    const entries = TEAMS.map(t => urlEntry(`${BASE}/teams/${t.slug}`, { lastmod: today, changefreq: "weekly", priority: "0.85" }));
    return res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`);
  }

  if (type === "articles") {
    let articleEntries: string[] = [];
    try {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase.from("articles").select("slug, published_at, updated_at").eq("status", "published").order("published_at", { ascending: false });
        if (data) {
          articleEntries = data.map((a: any) => urlEntry(`${BASE}/article/${esc(a.slug)}`, { lastmod: (a.updated_at || a.published_at || today).slice(0, 10), changefreq: "weekly", priority: "0.90" }));
        }
      }
    } catch {}
    return res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${articleEntries.join("\n")}\n</urlset>`);
  }

  const index = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE}/api/sitemap?type=pages</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE}/api/sitemap?type=leagues</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE}/api/sitemap?type=teams</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE}/api/sitemap?type=articles</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  res.end(index);
}
