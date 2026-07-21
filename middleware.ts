// Edge Runtime globals — declared inline because tsconfig.base.json sets "types":[]
declare class Request {
  readonly url: string;
  readonly headers: { get(name: string): string | null };
}
declare class Response {
  constructor(body: string, init?: { headers?: Record<string, string>; status?: number });
}
declare class URL {
  constructor(input: string);
  readonly pathname: string;
}

/**
 * Vercel Edge Middleware — Crawlable HTML & Bot SEO Engine
 * Returns rich server-rendered HTML with H1, body, internal links,
 * and Schema.org JSON-LD for raw curl, crawlers, and discovery bots.
 */

const BOT_OR_CURL_UA =
  /curl|wget|googlebot|bingbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|discordbot|perplexitybot|chatgpt-user|gptbot|oai-searchbot|claude-web|anthropic-ai|cohere-ai|youbot|slurp|duckduckbot|baiduspider|yandexbot|applebot|msnbot/i;

interface PageMeta {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  body: string;
  links?: { name: string; url: string }[];
  jsonLdType?: string;
  status?: number;
}

const STATIC_ROUTES: Record<string, PageMeta> = {
  "/": {
    title: "BallMtaani: Live Football Scores, Fixtures & Fan Predictions Kenya",
    description:
      "Follow Premier League, Champions League, European and Kenyan football with live scores, fixtures, tables, predictions, fan debates and Mchambuzi AI analysis.",
    keywords:
      "BallMtaani, Kenya football, Premier League Kenya, KPL live scores, Champions League Kenya, football predictions Kenya",
    h1: "The season starts here.",
    body: "Live scores, fearless predictions, Kenyan fan debates and real football intelligence—from the Premier League to FKF football. We predict. We debate. We keep receipts.",
    jsonLdType: "WebSite",
  },
  "/home": {
    title: "BallMtaani: Live Football Scores, Fixtures & Fan Predictions Kenya",
    description:
      "Follow Premier League, Champions League, European and Kenyan football with live scores, fixtures, tables, predictions, fan debates and Mchambuzi AI analysis.",
    keywords:
      "BallMtaani, Kenya football, Premier League Kenya, KPL live scores, Champions League Kenya",
    h1: "The season starts here.",
    body: "Live scores, fearless predictions, Kenyan fan debates and real football intelligence—from the Premier League to FKF football.",
    jsonLdType: "WebSite",
  },
  "/leagues": {
    title: "Football League Centres | Premier League, KPL & Champions League Kenya",
    description:
      "Browse Premier League, FKF Premier League, UEFA Champions League, La Liga and African football hubs on BallMtaani. Live scores, standings, fixtures and fan debates.",
    keywords:
      "football leagues Kenya, Premier League Kenya, FKF Premier League, Champions League, La Liga, Serie A, Bundesliga",
    h1: "BallMtaani League Centres",
    body: "Choose your competition to track live scores, current standings, upcoming fixtures, fan debates, and Mchambuzi AI tactical insights.",
    jsonLdType: "CollectionPage",
  },
  "/news": {
    title: "Football News for Kenyan Fans | BallMtaani Mtaa Daily",
    description:
      "Latest football news — Premier League, KPL, Champions League, Africa Cup of Nations. Curated and analysed for Kenyan football fans.",
    keywords:
      "football news Kenya, Premier League news Kenya, KPL news, Harambee Stars, Africa football news",
    h1: "Mtaa Daily Football News — Curated for Kenya",
    body: "Latest football news curated for Kenyan fans. Premier League transfers, KPL results, Harambee Stars updates, and African football coverage from BallMtaani.",
    jsonLdType: "NewsArticle",
  },
  "/about": {
    title: "About BallMtaani | Kenya's Football Companion Platform",
    description:
      "BallMtaani is Kenya's home for football — live scores, Mtaa Daily original reporting, fan predictions, Mchambuzi AI analysis and airtime rewards.",
    keywords: "about BallMtaani, Kenya football platform, Nairobi football, African football coverage",
    h1: "About BallMtaani — Built in Nairobi for African Fans",
    body: "BallMtaani was built from a simple frustration: football coverage in Kenya has always been designed for fans somewhere else. We cover the Premier League, La Liga, Champions League and FKF football the way a Nairobi street corner does.",
  },
  "/world-cup-2026": {
    title: "World Cup 2026 Archive Hub | BallMtaani — Tournament Overview",
    description:
      "Archive of FIFA World Cup 2026 coverage — fixtures, standings, African nations and fan predictions on BallMtaani.",
    keywords: "World Cup 2026 archive, WC26 results, Africa World Cup 2026",
    h1: "FIFA World Cup 2026 — Completed Tournament Archive",
    body: "The 2026 FIFA World Cup archive on BallMtaani. Track results, knockout bracket summaries, and African nations tournament history.",
  },
  "/world-cup-2026/bracket": {
    title: "WC26 Knockout Bracket Archive | BallMtaani Results",
    description:
      "Completed World Cup 2026 knockout bracket archive — Round of 32, Round of 16, Quarter-finals, Semi-finals and Final results.",
    keywords: "WC26 knockout bracket archive, World Cup 2026 results",
    h1: "World Cup 2026 Knockout Bracket Archive",
    body: "Completed results from the Round of 32 through the Final of the 2026 FIFA World Cup.",
  },
};

const LEAGUE_SLUGS: Record<string, { name: string; country: string; desc: string }> = {
  "premier-league": { name: "Premier League", country: "England", desc: "The most watched league in Kenya. Follow matchday battles, title races, local fan club debates, and receipt-keeping prediction games." },
  "champions-league": { name: "UEFA Champions League", country: "Europe", desc: "Tuesday and Wednesday football fever across Nairobi base spots. Live Champions League scores, tactical breakdowns, and prediction pools." },
  "fkf-premier-league": { name: "FKF Premier League", country: "Kenya", desc: "Homegrown Kenyan football. Tracking Gor Mahia, AFC Leopards, Tusker FC, KCB, and grassroot talent across local stadiums." },
  "la-liga": { name: "La Liga EA Sports", country: "Spain", desc: "El Clasico rivalry and Spanish football excellence. Live scores, team news, and fan arguments." },
  "serie-a": { name: "Serie A", country: "Italy", desc: "Italian tactical battles and historic club rivalries followed live with local fan pulse analysis." },
  "bundesliga": { name: "Bundesliga", country: "Germany", desc: "High-scoring German football, fan atmosphere, and title race updates." },
  "ligue-1": { name: "Ligue 1 McDonald's", country: "France", desc: "French top-flight action and superstar matchday coverage." },
  "caf-champions-league": { name: "CAF Champions League", country: "Africa", desc: "Africa's premier club tournament tracking East African contenders and continental giants." },
  "caf-confederation-cup": { name: "CAF Confederation Cup", country: "Africa", desc: "Continental battles featuring East African and regional club contenders." },
  "harambee-stars": { name: "Harambee Stars & International Fixtures", country: "Kenya", desc: "National pride. Following Harambee Stars across AFCON qualifiers, World Cup campaigns, and international friendlies." },
};

const TEAM_SLUGS: Record<string, { name: string; country: string; league: string; desc: string }> = {
  "arsenal": { name: "Arsenal FC", country: "England", league: "Premier League", desc: "Arsenal FC — Kenya's most passionate Premier League supporter base. Follow live matchday action, fixtures, predictions, Mchambuzi AI tactical breakdowns and fan debates." },
  "manchester-united": { name: "Manchester United FC", country: "England", league: "Premier League", desc: "Manchester United FC — Old Trafford drama and matchday analysis. Follow Red Devils fixtures, live scores, predictions, MTC rewards and Kenyan fan banter." },
  "chelsea": { name: "Chelsea FC", country: "England", league: "Premier League", desc: "Chelsea FC — Blues matchday hub in Nairobi. Live scores, transfer updates, match stats, prediction receipts and community debates." },
  "liverpool": { name: "Liverpool FC", country: "England", league: "Premier League", desc: "Liverpool FC — Anfield noise and high-tempo football. Live match coverage, player stats, predictions and Kenyan fan discussions." },
  "gor-mahia": { name: "Gor Mahia FC", country: "Kenya", league: "FKF Premier League", desc: "Gor Mahia FC (K'Ogalo) — 21-time Kenyan champions. Tracking K'Ogalo matchday fixtures, local derby updates, standings and Mtaa Daily original reporting." },
  "afc-leopards": { name: "AFC Leopards", country: "Kenya", league: "FKF Premier League", desc: "AFC Leopards (Ingwe) — Pride of Kenyan football. Fixtures, derby action, standings, fan predictions and Kenyan football spotlight." },
  "real-madrid": { name: "Real Madrid CF", country: "Spain", league: "La Liga", desc: "Real Madrid CF — Los Blancos Champions League royalty and La Liga battles. Live scores, predictions, and squad analysis." },
  "barcelona": { name: "FC Barcelona", country: "Spain", league: "La Liga", desc: "FC Barcelona — Catalan football flair, La Liga updates, El Clasico predictions and tactical breakdowns." },
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function generateCrawlableHTML(meta: PageMeta, canonical: string): string {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": meta.jsonLdType || "WebPage",
        "@id": `${canonical}/#webpage`,
        "url": canonical,
        "name": meta.title,
        "description": meta.description,
        "inLanguage": "en-KE",
        "isPartOf": { "@type": "WebSite", "name": "BallMtaani", "url": "https://ballmtaani.com/" }
      },
      {
        "@type": "Organization",
        "@id": "https://ballmtaani.com/#organization",
        "name": "BallMtaani",
        "url": "https://ballmtaani.com/",
        "logo": "https://ballmtaani.com/logo.png"
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}"/>
<meta name="keywords" content="${esc(meta.keywords)}"/>
<meta name="robots" content="${meta.status === 404 ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1"}"/>
<meta name="author" content="BallMtaani"/>
<meta name="geo.region" content="KE"/>
<meta property="og:title" content="${esc(meta.title)}"/>
<meta property="og:description" content="${esc(meta.description)}"/>
<meta property="og:image" content="https://ballmtaani.com/opengraph.jpg"/>
<meta property="og:url" content="${esc(canonical)}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="BallMtaani"/>
<meta property="og:locale" content="en_KE"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:site" content="@ballmtaani"/>
<meta name="twitter:title" content="${esc(meta.title)}"/>
<meta name="twitter:description" content="${esc(meta.description)}"/>
<meta name="twitter:image" content="https://ballmtaani.com/opengraph.jpg"/>
<link rel="canonical" href="${esc(canonical)}"/>
<link rel="icon" type="image/png" href="https://ballmtaani.com/logo.png"/>
<script type="application/ld+json">
${JSON.stringify(jsonLd)}
</script>
</head>
<body style="font-family:sans-serif;max-width:850px;margin:2rem auto;padding:0 1.5rem;color:#111;line-height:1.6">
<header style="margin-bottom:1.5rem;border-bottom:2px solid #B30000;padding-bottom:1rem">
  <a href="https://ballmtaani.com/" style="color:#B30000;font-weight:900;text-decoration:none;font-size:1.5rem">BallMtaani</a>
  <span style="font-size:0.875rem;color:#666;margin-left:0.75rem">Kenya's Matchday Companion</span>
</header>
<main>
  <h1 style="font-size:2rem;color:#000;margin-bottom:1rem">${esc(meta.h1)}</h1>
  <p style="font-size:1.1rem;color:#333;margin-bottom:1.5rem">${esc(meta.body)}</p>
  
  <section style="background:#f9f9f9;border:1px solid #e5e5e5;padding:1.25rem;border-radius:8px;margin:1.5rem 0">
    <h2 style="font-size:1.1rem;margin-top:0;color:#B30000">Explore BallMtaani Matchday Hubs</h2>
    <ul style="margin:0.5rem 0 0 1.25rem;padding:0">
      <li><a href="https://ballmtaani.com/leagues/premier-league" style="color:#0055cc">Premier League Hub</a> — Live scores, fixtures & table</li>
      <li><a href="https://ballmtaani.com/leagues/champions-league" style="color:#0055cc">UEFA Champions League Hub</a> — European nights</li>
      <li><a href="https://ballmtaani.com/leagues/fkf-premier-league" style="color:#0055cc">FKF Premier League Hub</a> — Gor Mahia, AFC Leopards & local action</li>
      <li><a href="https://ballmtaani.com/teams/arsenal" style="color:#0055cc">Arsenal FC Hub</a> — Matchday reactions & predictions</li>
      <li><a href="https://ballmtaani.com/teams/manchester-united" style="color:#0055cc">Manchester United FC Hub</a> — Red Devils center</li>
      <li><a href="https://ballmtaani.com/news" style="color:#0055cc">Mtaa Daily News</a> — Original football analysis</li>
    </ul>
  </section>
</main>
<footer style="margin-top:2.5rem;border-top:1px solid #ddd;padding-top:1rem;font-size:0.875rem;color:#666">
  <p>&copy; ${new Date().getFullYear()} BallMtaani. Data provided by API-Football & Mtaa Daily. All kickoffs displayed in Africa/Nairobi (EAT).</p>
  <nav style="display:flex;gap:1rem;margin-top:0.5rem">
    <a href="https://ballmtaani.com/leagues" style="color:#333">Leagues</a>
    <a href="https://ballmtaani.com/matches" style="color:#333">Live Matches</a>
    <a href="https://ballmtaani.com/news" style="color:#333">News</a>
    <a href="https://ballmtaani.com/about" style="color:#333">About</a>
  </nav>
</footer>
</body>
</html>`;
}

export default function middleware(request: Request): Response | undefined {
  const ua = request.headers.get("user-agent") || "";
  const isBotOrCurl = BOT_OR_CURL_UA.test(ua);

  // ONLY intercept known bots and crawlers.
  // Regular browsers (Chrome, Firefox, Safari, etc.) must always pass through
  // to the Vite React application — never serve them the plain HTML shell.
  if (!isBotOrCurl) return undefined;

  const url = new URL(request.url);
  const { pathname } = url;

  // Skip static assets
  if (/\.(?:js|css|png|jpg|jpeg|svg|ico|json|txt|xml|webp|woff2?|mp4|gz)$/i.test(pathname)) {
    return undefined;
  }

  // Skip admin, auth, and private API routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/api/")) {
    return undefined;
  }

  const canonical = `https://ballmtaani.com${pathname}`;

  // 1. Static Route Match
  if (STATIC_ROUTES[pathname]) {
    const meta = STATIC_ROUTES[pathname];
    return new Response(generateCrawlableHTML(meta, canonical), {
      status: meta.status || 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-BallMtaani-Rendered": "edge-ssr",
      },
    });
  }

  // 2. League Detail Route (/leagues/:leagueSlug)
  if (pathname.startsWith("/leagues/")) {
    const slug = pathname.replace("/leagues/", "").split("/")[0];
    const league = LEAGUE_SLUGS[slug];
    if (league) {
      const meta: PageMeta = {
        title: `${league.name} Live Scores, Standings & Fixtures Kenya | BallMtaani`,
        description: `Follow ${league.name} matchday action, live scores, current standings, fixtures, Mchambuzi AI breakdowns and fan debates.`,
        keywords: `${league.name}, ${league.country} football, BallMtaani scores`,
        h1: `${league.name} League Centre`,
        body: league.desc,
        jsonLdType: "SportsLeague",
      };
      return new Response(generateCrawlableHTML(meta, canonical), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=3600", "X-BallMtaani-Rendered": "edge-ssr" },
      });
    } else {
      // 404 for missing league
      const meta: PageMeta = {
        title: "League Not Found | BallMtaani",
        description: "The requested league does not exist on BallMtaani.",
        keywords: "404, league not found",
        h1: "404 — OFF-SIDE (League Not Found)",
        body: "We couldn't find the requested league competition. Browse active league centres to find your league.",
        status: 404,
      };
      return new Response(generateCrawlableHTML(meta, canonical), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache", "X-BallMtaani-Rendered": "edge-404" },
      });
    }
  }

  // 3. Team Detail Route (/teams/:teamSlug)
  if (pathname.startsWith("/teams/")) {
    const slug = pathname.replace("/teams/", "");
    const team = TEAM_SLUGS[slug];
    if (team) {
      const meta: PageMeta = {
        title: `${team.name} Live Scores, Fixtures & Predictions | BallMtaani`,
        description: team.desc,
        keywords: `${team.name}, ${team.league}, ${team.country} football`,
        h1: `${team.name} Matchday Hub`,
        body: team.desc,
        jsonLdType: "SportsTeam",
      };
      return new Response(generateCrawlableHTML(meta, canonical), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=3600", "X-BallMtaani-Rendered": "edge-ssr" },
      });
    } else {
      // 404 for unsupported/unknown team
      const meta: PageMeta = {
        title: "Club Not Found | BallMtaani",
        description: "The requested football club hub does not exist.",
        keywords: "404, club not found",
        h1: "404 — OFF-SIDE (Club Not Found)",
        body: "We couldn't find a dedicated club hub for this team. Browse active league centres to locate your club.",
        status: 404,
      };
      return new Response(generateCrawlableHTML(meta, canonical), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache", "X-BallMtaani-Rendered": "edge-404" },
      });
    }
  }

  // 4. Permanent Match Route (/matches/:matchSlug)
  if (pathname.startsWith("/matches/") && pathname !== "/matches") {
    const matchSlug = pathname.replace("/matches/", "");
    const slugParts = matchSlug.split("-v-");
    const home = slugParts[0] ? slugParts[0].replace(/-/g, " ").toUpperCase() : "HOME TEAM";
    const rest = slugParts[1] || "";
    const away = rest.split("-202")[0] ? rest.split("-202")[0].replace(/-/g, " ").toUpperCase() : "AWAY TEAM";

    const meta: PageMeta = {
      title: `${home} vs ${away} Live Score, Prediction & Matchday Hub | BallMtaani`,
      description: `Follow ${home} vs ${away} live scores, kickoff time in Africa/Nairobi (EAT), prediction ratios, Mchambuzi AI analysis and fan debates on BallMtaani.`,
      keywords: `${home} vs ${away}, live score, prediction`,
      h1: `${home} vs ${away}`,
      body: `Matchday intelligence and permanent fixture record for ${home} vs ${away}. Includes Africa/Nairobi (EAT) kickoff schedule, prediction pulse ratios, tactical analysis and fan debates.`,
      jsonLdType: "SportsEvent",
    };
    return new Response(generateCrawlableHTML(meta, canonical), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=3600", "X-BallMtaani-Rendered": "edge-ssr" },
    });
  }

  // Default Fallback: Homepage shell for all other discovery routes
  const meta = STATIC_ROUTES["/"];
  return new Response(generateCrawlableHTML(meta, canonical), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=3600", "X-BallMtaani-Rendered": "edge-ssr" },
  });
}

export const config = {
  matcher: [
    "/((?!api/|_next/|_vercel/|assets/|icons/|logo\\.png|manifest\\.json|sw\\.js|robots\\.txt|sitemap\\.xml|opengraph\\.jpg|ads\\.txt|widget-test\\.html).*)",
  ],
};
