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
  /curl|wget|googlebot|mediapartners-google|mediapartners|adsbot-google|google-adwords|feedfetcher-google|adsbot|bingbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|discordbot|perplexitybot|chatgpt-user|gptbot|oai-searchbot|claude-web|anthropic-ai|cohere-ai|youbot|slurp|duckduckbot|baiduspider|yandexbot|applebot|msnbot/i;

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
    h1: "Kenyan Football Intelligence & Matchday Companion",
    body: "Live scores, match fixtures, fearless predictions, Kenyan fan debates and real football intelligence—from the Premier League to FKF Premier League football. We predict. We debate. We keep receipts.",
    jsonLdType: "WebSite",
  },
  "/home": {
    title: "BallMtaani: Live Football Scores, Fixtures & Fan Predictions Kenya",
    description:
      "Follow Premier League, Champions League, European and Kenyan football with live scores, fixtures, tables, predictions, fan debates and Mchambuzi AI analysis.",
    keywords:
      "BallMtaani, Kenya football, Premier League Kenya, KPL live scores, Champions League Kenya",
    h1: "The Season Starts Here — BallMtaani Football Hub",
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
    body: "Latest original football news curated for Kenyan fans. Premier League transfers, KPL results, Harambee Stars updates, and African football coverage from BallMtaani.",
    jsonLdType: "NewsArticle",
  },
  "/articles": {
    title: "Mtaa Daily Football Articles | BallMtaani Reporting",
    description:
      "Original football articles, tactical breakdowns, match analysis, and African football reporting from BallMtaani's editorial team.",
    keywords:
      "BallMtaani articles, Kenya football news, Mtaa Daily, African football reporting, WC26 analysis",
    h1: "Mtaa Daily Original Articles & Football Reporting",
    body: "Explore all original articles, match analysis, tactical deep-dives, and African football coverage from BallMtaani's editorial team.",
    jsonLdType: "CollectionPage",
  },
  "/articles/": {
    title: "Mtaa Daily Football Articles | BallMtaani Reporting",
    description:
      "Original football articles, tactical breakdowns, match analysis, and African football reporting from BallMtaani's editorial team.",
    keywords:
      "BallMtaani articles, Kenya football news, Mtaa Daily, African football reporting, WC26 analysis",
    h1: "Mtaa Daily Original Articles & Football Reporting",
    body: "Explore all original articles, match analysis, tactical deep-dives, and African football coverage from BallMtaani's editorial team.",
    jsonLdType: "CollectionPage",
  },
  "/article": {
    title: "Mtaa Daily Football Articles | BallMtaani Reporting",
    description:
      "Original football articles, tactical breakdowns, match analysis, and African football reporting from BallMtaani's editorial team.",
    keywords:
      "BallMtaani articles, Kenya football news, Mtaa Daily, African football reporting, WC26 analysis",
    h1: "Mtaa Daily Original Articles & Football Reporting",
    body: "Explore all original articles, match analysis, tactical deep-dives, and African football coverage from BallMtaani's editorial team.",
    jsonLdType: "CollectionPage",
  },
  "/matches": {
    title: "Live Football Scores & Fixtures | BallMtaani Kenya",
    description:
      "Live scores, match schedules, results and standings for Premier League, Champions League, FKF Premier League, La Liga, Serie A and World Cup on BallMtaani.",
    keywords: "live football scores Kenya, football fixtures, Premier League live scores, KPL scores",
    h1: "Live Football Scores & Matchday Fixtures",
    body: "Track live scores, kick-off times in Africa/Nairobi (EAT), match stats, team form, and community prediction ratios across top global and local football leagues.",
    jsonLdType: "CollectionPage",
  },
  "/predictions": {
    title: "Football Match Predictions Kenya | BallMtaani Community Calls",
    description:
      "Make match predictions, vote on kick-off calls, and keep matchday receipts with Kenya's most passionate football fan community.",
    keywords: "football predictions Kenya, match prediction calls, Premier League predictions",
    h1: "BallMtaani Football Match Predictions",
    body: "Put your football knowledge to the test. Make predictions on upcoming Premier League, KPL, Champions League and World Cup fixtures. Earn MTC status rewards for correct receipts.",
    jsonLdType: "WebPage",
  },
  "/debates": {
    title: "Kenyan Football Debates & Fan Discussions | BallMtaani",
    description:
      "Join raw, unfiltered football debates on Premier League rivalries, tactical battles, referee decisions, and African football with Kenyan fans.",
    keywords: "football debates Kenya, Premier League debates, KPL discussions",
    h1: "Matchday Debates & Fan War Rooms",
    body: "Where Kenyan fans settle football arguments. Discuss tactical line-ups, controversial VAR calls, GOAT debates, and club rivalries with zero corporate filter.",
    jsonLdType: "WebPage",
  },
  "/fan-zones": {
    title: "Football Fan Zones & Supporter Hubs | BallMtaani Kenya",
    description:
      "Connect with Arsenal, Man United, Chelsea, Gor Mahia, and AFC Leopards fan bases across Kenya. Join club polls, chats, and matchday rooms.",
    keywords: "football fan zones Kenya, Arsenal Kenya, Man United Kenya, Gor Mahia fans",
    h1: "BallMtaani Club Fan Zones",
    body: "Find your tribe. Dedicated supporter rooms for Arsenal FC, Manchester United, Chelsea FC, Liverpool FC, Gor Mahia, AFC Leopards, Real Madrid, and Harambee Stars.",
    jsonLdType: "CollectionPage",
  },
  "/leaderboard": {
    title: "BallMtaani Fan Leaderboard | Top Football Analysts Kenya",
    description:
      "View top Kenyan football analysts ranked by prediction accuracy, debate votes, and community receipts on BallMtaani.",
    keywords: "football leaderboard Kenya, top predictions Kenya, BallMtaani rewards",
    h1: "Kenyan Football Fan Leaderboard",
    body: "Tracking the sharpest football minds in Kenya. See who holds the highest prediction accuracy and most verified receipts.",
    jsonLdType: "WebPage",
  },
  "/market-watch": {
    title: "Football Transfer Market Watch | BallMtaani",
    description:
      "Track latest football transfers, rumours, player valuations, and contract updates across Premier League, La Liga, and African football.",
    keywords: "football transfers Kenya, transfer market watch, EPL transfers",
    h1: "Football Transfer Market Watch",
    body: "Daily transfer news, confirmed deals, player valuations, and war room discussions covering Premier League, European, and local African transfers.",
    jsonLdType: "CollectionPage",
  },
  "/mchambuzi-halisi": {
    title: "Mchambuzi AI Football Analyst | BallMtaani",
    description:
      "Ask Mchambuzi AI for instant tactical analysis, match stat breakdowns, squad comparisons, and football history tailored for African fans.",
    keywords: "AI football analyst, Mchambuzi AI, football stats Kenya",
    h1: "Mchambuzi AI — African Football Intelligence",
    body: "Our custom AI football analyst built specifically for African supporters. Get instant tactical insights, form analysis, and match context in plain English and Swahili.",
    jsonLdType: "WebPage",
  },
  "/about": {
    title: "About BallMtaani | Built in Nairobi for African Football Fans",
    description:
      "BallMtaani is Kenya's premier football companion platform — live scores, Mtaa Daily original reporting, fan predictions, Mchambuzi AI analysis and community rewards.",
    keywords: "about BallMtaani, Kenya football platform, Nairobi football, African football coverage",
    h1: "About BallMtaani — Built in Nairobi for African Fans",
    body: "BallMtaani was built from a simple frustration: football coverage in Kenya has always been designed for fans somewhere else. We cover the Premier League, La Liga, Champions League and FKF football the way a Nairobi street corner does.",
    jsonLdType: "AboutPage",
  },
  "/contact": {
    title: "Contact BallMtaani | Enquiries, Advertising & Support",
    description:
      "Get in touch with the BallMtaani team for editorial questions, press releases, advertising partnerships, or platform support. Email info@ballmtaani.com.",
    keywords: "contact BallMtaani, BallMtaani email, advertising BallMtaani, sponsor Kenya football",
    h1: "Contact BallMtaani",
    body: "Have a question, editorial feedback, press inquiry, or sponsorship proposal? Reach out to our Nairobi team via info@ballmtaani.com or sponsors@ballmtaani.com.",
    jsonLdType: "ContactPage",
  },
  "/privacy": {
    title: "Privacy Policy | BallMtaani",
    description:
      "BallMtaani Privacy Policy detailing data collection, account security, third-party services, Google AdSense cookies, analytics, and user choices.",
    keywords: "privacy policy BallMtaani, AdSense privacy disclosure, cookie policy",
    h1: "BallMtaani Privacy Policy",
    body: "This Privacy Policy explains how BallMtaani collects, uses, and safeguards information when you visit our website, participate in fan predictions, or interact with advertisements served by Google AdSense and third-party vendors.",
    jsonLdType: "WebPage",
  },
  "/privacy-policy": {
    title: "Privacy Policy | BallMtaani",
    description:
      "BallMtaani Privacy Policy detailing data collection, account security, third-party services, Google AdSense cookies, analytics, and user choices.",
    keywords: "privacy policy BallMtaani, AdSense privacy disclosure, cookie policy",
    h1: "BallMtaani Privacy Policy",
    body: "This Privacy Policy explains how BallMtaani collects, uses, and safeguards information when you visit our website, participate in fan predictions, or interact with advertisements served by Google AdSense and third-party vendors.",
    jsonLdType: "WebPage",
  },
  "/terms": {
    title: "Terms of Service | BallMtaani",
    description:
      "BallMtaani Terms of Service outlining community guidelines, MTC engagement status points, content usage, and platform terms.",
    keywords: "terms of service BallMtaani, user agreement, MTC rules",
    h1: "BallMtaani Terms of Service",
    body: "These Terms of Service govern your access to and use of BallMtaani's web platform, fan prediction games, debate rooms, and football intelligence features.",
    jsonLdType: "WebPage",
  },
  "/terms-of-service": {
    title: "Terms of Service | BallMtaani",
    description:
      "BallMtaani Terms of Service outlining community guidelines, MTC engagement status points, content usage, and platform terms.",
    keywords: "terms of service BallMtaani, user agreement, MTC rules",
    h1: "BallMtaani Terms of Service",
    body: "These Terms of Service govern your access to and use of BallMtaani's web platform, fan prediction games, debate rooms, and football intelligence features.",
    jsonLdType: "WebPage",
  },
  "/world-cup-2026": {
    title: "World Cup 2026 Archive Hub | BallMtaani — Tournament Overview",
    description:
      "Archive of FIFA World Cup 2026 coverage — fixtures, standings, African nations and fan predictions on BallMtaani.",
    keywords: "World Cup 2026 archive, WC26 results, Africa World Cup 2026",
    h1: "FIFA World Cup 2026 — Completed Tournament Archive",
    body: "The 2026 FIFA World Cup archive on BallMtaani. Track results, knockout bracket summaries, and African nations tournament history.",
    jsonLdType: "CollectionPage",
  },
  "/world-cup-2026/bracket": {
    title: "WC26 Knockout Bracket Archive | BallMtaani Results",
    description:
      "Completed World Cup 2026 knockout bracket archive — Round of 32, Round of 16, Quarter-finals, Semi-finals and Final results.",
    keywords: "WC26 knockout bracket archive, World Cup 2026 results",
    h1: "World Cup 2026 Knockout Bracket Archive",
    body: "Completed results from the Round of 32 through the Final of the 2026 FIFA World Cup.",
    jsonLdType: "WebPage",
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
        "@type": ["Organization", "SportsOrganization", "NewsMediaOrganization"],
        "@id": "https://ballmtaani.com/#organization",
        "name": "BallMtaani",
        "url": "https://ballmtaani.com/",
        "logo": "https://ballmtaani.com/logo.png",
        "foundingDate": "2024",
        "description": "Kenya's #1 football intelligence platform — live scores, original reporting, predictions, debates, and AI match analysis.",
        "sameAs": [
          "https://twitter.com/ballmtaani"
        ]
      },
      {
        "@type": "SiteNavigationElement",
        "@id": "https://ballmtaani.com/#navigation",
        "name": "Main Navigation",
        "url": canonical,
        "hasPart": [
          { "@type": "WebPage", "name": "Home", "url": "https://ballmtaani.com/" },
          { "@type": "WebPage", "name": "Live Matches", "url": "https://ballmtaani.com/matches" },
          { "@type": "WebPage", "name": "League Centres", "url": "https://ballmtaani.com/leagues" },
          { "@type": "WebPage", "name": "Mtaa Daily News", "url": "https://ballmtaani.com/news" },
          { "@type": "WebPage", "name": "Match Predictions", "url": "https://ballmtaani.com/predictions" },
          { "@type": "WebPage", "name": "Fan Debates", "url": "https://ballmtaani.com/debates" },
          { "@type": "WebPage", "name": "About Us", "url": "https://ballmtaani.com/about" },
          { "@type": "WebPage", "name": "Contact Us", "url": "https://ballmtaani.com/contact" },
          { "@type": "WebPage", "name": "Privacy Policy", "url": "https://ballmtaani.com/privacy" },
          { "@type": "WebPage", "name": "Terms of Service", "url": "https://ballmtaani.com/terms" }
        ]
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
<meta name="geo.placename" content="Nairobi, Kenya"/>
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
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0b; color: #e5e5e5; max-width: 960px; margin: 0 auto; padding: 0 1.25rem; line-height: 1.6; }
  header { border-bottom: 2px solid #B30000; padding: 1.25rem 0; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .logo { color: #fff; font-size: 1.75rem; font-weight: 900; text-decoration: none; letter-spacing: -0.03em; }
  .logo span { color: #B30000; }
  nav a { color: #aaa; text-decoration: none; margin-left: 1rem; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  nav a:hover { color: #fff; }
  main { margin-bottom: 3rem; }
  h1 { font-size: 2.25rem; color: #ffffff; margin-top: 0; margin-bottom: 1rem; font-weight: 900; line-height: 1.2; }
  h2 { font-size: 1.4rem; color: #B30000; margin-top: 2rem; margin-bottom: 0.75rem; font-weight: 800; border-left: 4px solid #B30000; padding-left: 0.75rem; }
  p { font-size: 1.05rem; color: #cccccc; margin-bottom: 1.25rem; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
  .card { background: #141414; border: 1px solid #262626; border-radius: 8px; padding: 1.25rem; }
  .card h3 { font-size: 1.1rem; margin-top: 0; margin-bottom: 0.5rem; color: #fff; }
  .card p { font-size: 0.9rem; color: #999; margin-bottom: 0; }
  .card a { color: #ff3333; text-decoration: none; font-weight: 700; font-size: 0.875rem; }
  ul { padding-left: 1.25rem; color: #bbb; }
  li { margin-bottom: 0.5rem; }
  footer { border-top: 1px solid #262626; padding: 2rem 0; margin-top: 3rem; font-size: 0.875rem; color: #777; }
  .footer-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
  .footer-col h4 { color: #fff; margin-top: 0; margin-bottom: 0.75rem; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.08em; }
  .footer-col a { color: #aaa; text-decoration: none; display: block; margin-bottom: 0.4rem; font-size: 0.85rem; }
  .footer-col a:hover { color: #B30000; }
</style>
</head>
<body>
<header>
  <a href="https://ballmtaani.com/" class="logo">BALL<span>MTAANI</span></a>
  <nav>
    <a href="https://ballmtaani.com/">Home</a>
    <a href="https://ballmtaani.com/matches">Matches</a>
    <a href="https://ballmtaani.com/leagues">Leagues</a>
    <a href="https://ballmtaani.com/news">News</a>
    <a href="https://ballmtaani.com/predictions">Predictions</a>
    <a href="https://ballmtaani.com/about">About</a>
    <a href="https://ballmtaani.com/contact">Contact</a>
  </nav>
</header>
<main>
  <article>
    <h1>${esc(meta.h1)}</h1>
    <p>${esc(meta.body)}</p>

    <h2>Featured Football Hubs &amp; Coverage</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Live Scores &amp; Fixtures</h3>
        <p>Real-time kick-off schedules, live score updates, match stats, and line-ups in Africa/Nairobi time (EAT).</p>
        <p><a href="https://ballmtaani.com/matches">View Live Matches &rarr;</a></p>
      </div>
      <div class="card">
        <h3>League Centres</h3>
        <p>Comprehensive hubs for Premier League, FKF Premier League (KPL), UEFA Champions League, La Liga, and CAF competitions.</p>
        <p><a href="https://ballmtaani.com/leagues">Explore League Hubs &rarr;</a></p>
      </div>
      <div class="card">
        <h3>Mtaa Daily Original News</h3>
        <p>In-depth original reporting, match analysis, tactical breakdowns, and transfer news tailored for Kenyan fans.</p>
        <p><a href="https://ballmtaani.com/news">Read Latest News &rarr;</a></p>
      </div>
      <div class="card">
        <h3>Mchambuzi AI Football Analyst</h3>
        <p>Interactive AI tactical breakdown engine providing football stats, player comparisons, and form guides with African context.</p>
        <p><a href="https://ballmtaani.com/mchambuzi-halisi">Try Mchambuzi AI &rarr;</a></p>
      </div>
    </div>

    <h2>Active Competitions &amp; Leagues</h2>
    <ul>
      <li><a href="https://ballmtaani.com/leagues/premier-league" style="color:#ff4d4d;font-weight:700">English Premier League</a> — Arsenal, Man United, Chelsea, Liverpool live scores &amp; standings.</li>
      <li><a href="https://ballmtaani.com/leagues/fkf-premier-league" style="color:#ff4d4d;font-weight:700">FKF Premier League (KPL)</a> — Gor Mahia, AFC Leopards, Tusker FC local derby coverage.</li>
      <li><a href="https://ballmtaani.com/leagues/champions-league" style="color:#ff4d4d;font-weight:700">UEFA Champions League</a> — Tuesday &amp; Wednesday European night match intelligence.</li>
      <li><a href="https://ballmtaani.com/leagues/la-liga" style="color:#ff4d4d;font-weight:700">La Liga EA Sports</a> — Real Madrid, FC Barcelona El Clasico updates.</li>
      <li><a href="https://ballmtaani.com/world-cup-2026" style="color:#ff4d4d;font-weight:700">FIFA World Cup 2026</a> — Completed tournament archive &amp; African nations history.</li>
    </ul>

    <h2>Editorial Independence &amp; Standards</h2>
    <p>BallMtaani publishes original editorial pieces through Mtaa Daily. Match data and fixtures are powered by API-Football. We adhere to high standards of editorial integrity, transparent sourcing, and independent reporting.</p>
  </article>
</main>
<footer>
  <div class="footer-cols">
    <div class="footer-col">
      <h4>Football Hubs</h4>
      <a href="https://ballmtaani.com/">Home</a>
      <a href="https://ballmtaani.com/matches">Live Scores</a>
      <a href="https://ballmtaani.com/leagues">Leagues Hub</a>
      <a href="https://ballmtaani.com/news">Mtaa Daily News</a>
      <a href="https://ballmtaani.com/world-cup-2026">World Cup 2026</a>
    </div>
    <div class="footer-col">
      <h4>Fan Community</h4>
      <a href="https://ballmtaani.com/predictions">Predictions</a>
      <a href="https://ballmtaani.com/debates">Fan Debates</a>
      <a href="https://ballmtaani.com/fan-zones">Fan Zones</a>
      <a href="https://ballmtaani.com/leaderboard">Leaderboard</a>
      <a href="https://ballmtaani.com/mchambuzi-halisi">Mchambuzi AI</a>
    </div>
    <div class="footer-col">
      <h4>Transparency &amp; Legal</h4>
      <a href="https://ballmtaani.com/about">About BallMtaani</a>
      <a href="https://ballmtaani.com/contact">Contact Us</a>
      <a href="https://ballmtaani.com/privacy">Privacy Policy</a>
      <a href="https://ballmtaani.com/terms">Terms of Service</a>
      <a href="mailto:sponsors@ballmtaani.com">Advertising &amp; Sponsors</a>
    </div>
  </div>
  <p>&copy; ${new Date().getFullYear()} BallMtaani. Built in Nairobi, Kenya. All rights reserved. Kick-off times in Africa/Nairobi (EAT).</p>
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

  // 5. Article Detail Route (/article/:slug and /articles/:slug)
  if ((pathname.startsWith("/article/") && pathname !== "/article/") || (pathname.startsWith("/articles/") && pathname !== "/articles/")) {
    const slug = pathname.replace(/^\/(?:article|articles)\//, "").split("/")[0];
    const formattedTitle = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const meta: PageMeta = {
      title: `${formattedTitle} | BallMtaani Mtaa Daily`,
      description: `Read ${formattedTitle} on BallMtaani — Kenya's premier football intelligence platform for live scores, match analysis, and original reporting.`,
      keywords: `${formattedTitle}, BallMtaani article, Kenya football news, Mtaa Daily`,
      h1: formattedTitle,
      body: `Original reporting, tactical deep-dives, and match analysis from BallMtaani's editorial team.`,
      jsonLdType: "NewsArticle",
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
