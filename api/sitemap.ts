import { createClient } from "@supabase/supabase-js";

const BASE = "https://ballmtaani.com";

const STATIC_URLS: Array<{ loc: string; changefreq: string; priority: string; lastmod?: string }> = [
  { loc: "/",                          changefreq: "hourly",  priority: "1.00" },
  { loc: "/home",                      changefreq: "hourly",  priority: "0.95" },
  { loc: "/about",                     changefreq: "monthly", priority: "0.90" },
  { loc: "/contact",                   changefreq: "monthly", priority: "0.85" },
  { loc: "/articles",                  changefreq: "daily",   priority: "0.95" },
  { loc: "/news",                      changefreq: "hourly",  priority: "0.97" },
  { loc: "/videos",                    changefreq: "daily",   priority: "0.82" },
  { loc: "/world-cup-2026",            changefreq: "hourly",  priority: "0.98" },
  { loc: "/world-cup-2026/format",     changefreq: "daily",   priority: "0.86" },
  { loc: "/world-cup-2026/stadiums",   changefreq: "weekly",  priority: "0.82" },
  { loc: "/world-cup-2026/africa",     changefreq: "daily",   priority: "0.90" },
  { loc: "/world-cup-2026/squads",     changefreq: "weekly",  priority: "0.84" },
  { loc: "/world-cup-2026/bracket",    changefreq: "daily",   priority: "0.88" },
  { loc: "/matches",                   changefreq: "hourly",  priority: "0.95" },
  { loc: "/data-centre",               changefreq: "hourly",  priority: "0.93" },
  { loc: "/live-center",               changefreq: "hourly",  priority: "0.90" },
  { loc: "/mchambuzi-halisi",          changefreq: "daily",   priority: "0.88" },
  { loc: "/market-watch",              changefreq: "daily",   priority: "0.80" },
  { loc: "/predictions",               changefreq: "daily",   priority: "0.88" },
  { loc: "/fun-zone",                  changefreq: "daily",   priority: "0.85" },
  { loc: "/trivia",                    changefreq: "weekly",  priority: "0.78" },
  { loc: "/rapid-fire",                changefreq: "daily",   priority: "0.78" },
  { loc: "/debates",                   changefreq: "daily",   priority: "0.82" },
  { loc: "/rivalries",                 changefreq: "daily",   priority: "0.78" },
  { loc: "/privacy",                   changefreq: "monthly", priority: "0.40" },
  { loc: "/terms",                     changefreq: "monthly", priority: "0.40" },
];

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

export default async function handler(req: any, res: any) {
  const today = new Date().toISOString().slice(0, 10);

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticEntries = STATIC_URLS.map(u =>
    urlEntry(`${BASE}${u.loc}`, { lastmod: today, changefreq: u.changefreq, priority: u.priority })
  );

  // ── Dynamic articles from Supabase ────────────────────────────────────────
  let articleEntries: string[] = [];
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from("articles")
        .select("slug, published_at, updated_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (data) {
        articleEntries = data.map((a: { slug: string; published_at?: string; updated_at?: string }) => {
          const lastmod = (a.updated_at || a.published_at || today).slice(0, 10);
          return urlEntry(`${BASE}/article/${esc(a.slug)}`, {
            lastmod,
            changefreq: "weekly",
            priority: "0.90",
          });
        });
      }
    }
  } catch {
    // Non-fatal: serve static-only sitemap if Supabase is unavailable
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "",
    "  <!-- ── Static pages ── -->",
    ...staticEntries,
    "",
    `  <!-- ── Articles (${articleEntries.length} published) ── -->`,
    ...articleEntries,
    "",
    "</urlset>",
  ].join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
  res.end(xml);
}
