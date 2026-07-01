// Edge Runtime globals — declared inline because tsconfig.base.json sets "types":[]
// which prevents the webworker lib reference from being reliably resolved by Vercel's build.
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
 * Vercel Edge Middleware — bot SEO injection
 *
 * Crawlers (Googlebot, Bingbot, AI bots, social scrapers) receive a lean
 * server-rendered HTML shell with the correct per-page title, description,
 * Open Graph tags, canonical URL, and a small block of crawlable text.
 * Human visitors are passed through unchanged to the fast SPA.
 *
 * This solves the single biggest SEO problem with a React SPA: every page
 * returning the same generic index.html meta tags to search engines.
 */

const BOT_UA =
  /googlebot|bingbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|discordbot|perplexitybot|chatgpt-user|gptbot|claude-web|anthropic-ai|cohere-ai|youbot|slurp|duckduckbot|baiduspider|yandexbot|applebot|msnbot/i;

interface PageMeta {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  body: string;
}

const META: Record<string, PageMeta> = {
  "/": {
    title: "BallMtaani | Kenya's #1 Football App — Live WC26 Scores & Predictions",
    description:
      "BallMtaani — Kenya's #1 football app. Live World Cup 2026 scores, Premier League fixtures, KPL updates, fan predictions and Mchambuzi AI analysis. Free.",
    keywords:
      "BallMtaani, Kenya football, World Cup 2026 Kenya, WC26 Africa, live football scores Kenya, Premier League Kenya, KPL, football predictions",
    h1: "BallMtaani — Kenya's #1 Football Intelligence Platform",
    body: "Live football scores for Kenyan fans. Track World Cup 2026 live, predict match results, debate with fans, and follow Premier League, KPL, and Africa Cup of Nations. Free football app for Kenya.",
  },
  "/home": {
    title: "BallMtaani | Kenya's #1 Football App — Live WC26 Scores & Predictions",
    description:
      "BallMtaani — Kenya's #1 football app. Live World Cup 2026 scores, Premier League fixtures, KPL updates, fan predictions and Mchambuzi AI analysis. Free.",
    keywords:
      "BallMtaani, Kenya football, World Cup 2026 Kenya, live football scores Kenya, Premier League Kenya",
    h1: "BallMtaani — Live Football Intelligence for Kenya",
    body: "Live football scores, fixtures, standings, predictions and fan debates. World Cup 2026 live coverage, Premier League, KPL, AFCON — all in one free app built for Kenyan football fans.",
  },
  "/world-cup-2026": {
    title: "World Cup 2026 Hub | BallMtaani — Groups, Fixtures & African Nations",
    description:
      "Track FIFA World Cup 2026 live — fixtures, standings, African nations and fan predictions. Kenya's WC26 command center on BallMtaani.",
    keywords:
      "World Cup 2026, WC26, FIFA 2026, WC26 Kenya, WC26 Africa, WC26 groups, WC26 fixtures, Morocco WC26, Senegal WC26, Nigeria WC26, Egypt WC26",
    h1: "FIFA World Cup 2026 — Kenya's Command Center",
    body: "World Cup 2026 runs June 11 – July 19, 2026 across USA, Canada and Mexico. 48 nations, 104 matches. Track all 9 African nations — Morocco, Senegal, Nigeria, Egypt, Cameroon, South Africa, Ghana, Algeria, Tunisia. Live fixtures, standings, scores and fan predictions.",
  },
  "/world-cup-2026/bracket": {
    title: "WC26 Knockout Bracket | BallMtaani — Live Results Round by Round",
    description:
      "Live World Cup 2026 knockout bracket — Round of 32, Round of 16, Quarter-finals, Semi-finals and Final results as they happen.",
    keywords:
      "WC26 knockout bracket, World Cup 2026 bracket, WC26 Round of 16, WC26 quarterfinals, World Cup 2026 results",
    h1: "World Cup 2026 Knockout Bracket",
    body: "Follow the WC26 knockout bracket live. Results from the Round of 32 through the Final. 48 teams competing from June 28 to July 19, 2026.",
  },
  "/world-cup-2026/format": {
    title: "WC26 Format Guide | BallMtaani — 48 Teams, 12 Groups Explained",
    description:
      "Everything you need to know about the World Cup 2026 format — 48 teams, 12 groups of 4, Round of 32, and the path to the Final.",
    keywords: "World Cup 2026 format, WC26 groups explained, WC26 48 teams, FIFA 2026 format",
    h1: "World Cup 2026 Format Guide",
    body: "The 2026 FIFA World Cup expands to 48 teams for the first time, organised into 12 groups of 4. The top 2 from each group plus 8 best third-placed teams advance to the Round of 32. Format guide, schedule and explainer on BallMtaani.",
  },
  "/world-cup-2026/africa": {
    title: "Africa at WC26 | BallMtaani — 9 CAF Nations, Fixtures & Analysis",
    description:
      "Africa's 9 nations at World Cup 2026 — Morocco, Senegal, Nigeria, Egypt, Cameroon, South Africa, Ghana, Algeria, Tunisia. Fixtures, group draw and analysis.",
    keywords:
      "Africa World Cup 2026, CAF WC26, Morocco WC26, Senegal WC26, Nigeria WC26, African teams World Cup 2026, Africa WC26 fixtures",
    h1: "Africa at World Cup 2026",
    body: "9 African nations compete at World Cup 2026: Morocco, Senegal, Nigeria, Egypt, Cameroon, South Africa, Ghana, Algeria and Tunisia. Track their fixtures, results and analysis. Africa's best-ever WC representation.",
  },
  "/predictions": {
    title: "Football Predictions | BallMtaani — Make Your Call, Win MTC Coins",
    description:
      "Make football predictions, earn MTC coins for correct calls, and compete on the BallMtaani Leaderboard. Free to play — Premier League, WC26 and more.",
    keywords:
      "football predictions Kenya, WC26 predictions, football game Kenya, Premier League predictions, football tipping Kenya",
    h1: "BallMtaani Football Predictions",
    body: "Make match predictions, earn MTC coins for exact scorelines, and compete on the BallMtaani leaderboard. Free prediction game for Kenyan football fans covering World Cup 2026, Premier League, La Liga, Serie A and more.",
  },
  "/matches": {
    title: "Live Football Scores & Fixtures | BallMtaani — All Leagues",
    description:
      "Live football scores, fixtures, results and tables for Premier League, La Liga, Serie A, Bundesliga, KPL, AFCON and World Cup 2026. Updated in real time.",
    keywords:
      "live football scores Kenya, football fixtures today, Premier League scores, KPL results, World Cup 2026 live scores, Serie A Kenya, La Liga Kenya",
    h1: "Live Football Scores & Fixtures",
    body: "Real-time football scores across all major leagues. Premier League, La Liga, Bundesliga, Serie A, Ligue 1, KPL, CAF Champions League and FIFA World Cup 2026. Fixtures, results and league tables updated every minute.",
  },
  "/live-center": {
    title: "BallMtaani Live Center — Real-Time Match Intelligence",
    description:
      "Live match center with real-time stats, lineups, events, and fan banter. Follow every kick, card and goal as it happens.",
    keywords:
      "live match center Kenya, football live stats, live match events, live football Kenya, real time football",
    h1: "BallMtaani Live Center",
    body: "Real-time match intelligence for live football. Match stats, lineups, goal events, yellow cards and live fan banter. Open any live match for the full detail experience.",
  },
  "/leaderboard": {
    title: "BallMtaani Leaderboard — Kenya's Top Football Predictors",
    description:
      "See Kenya's top football predictors. Earn MTC coins for correct predictions, climb the leaderboard and win rewards. Free to compete.",
    keywords:
      "BallMtaani leaderboard, football predictions leaderboard Kenya, MTC coins, top football predictors Kenya, WC26 leaderboard",
    h1: "BallMtaani Leaderboard — Kenya's Best Predictors",
    body: "Compete with thousands of Kenyan football fans. Make match predictions, earn MTC coins for correct calls, and rise to the top of the BallMtaani leaderboard. World Cup 2026 leaderboard active now.",
  },
  "/news": {
    title: "Football News for Kenyan Fans | BallMtaani",
    description:
      "Latest football news — World Cup 2026, Premier League, KPL, Africa Cup of Nations. Curated and analysed for Kenyan football fans.",
    keywords:
      "football news Kenya, World Cup 2026 news, Premier League news Kenya, KPL news, Harambee Stars, Africa football news",
    h1: "Football News — Curated for Kenya",
    body: "Latest football news curated for Kenyan fans. World Cup 2026 updates, Premier League transfers, KPL results, Harambee Stars news, and Africa football coverage from BallMtaani.",
  },
  "/market-watch": {
    title: "Transfer Market Watch | BallMtaani — Signals Not Betting",
    description:
      "WC26 knockout round intelligence — team form, key players and fan sentiment. Market signals for football fans, not betting tips.",
    keywords:
      "football transfer market Kenya, WC26 team analysis, football signals Kenya, transfer news Kenya, market watch football",
    h1: "BallMtaani Market Watch",
    body: "Track market signals and fan sentiment around World Cup 2026 knockout teams. Real data from the BallMtaani fan community — not betting odds. Intelligence for football fans.",
  },
  "/mchambuzi-halisi": {
    title: "Mchambuzi Halisi AI | BallMtaani — Ask Your Football Question",
    description:
      "Ask Mchambuzi Halisi — BallMtaani's AI football analyst. Instant AI-powered analysis on any match, team or World Cup 2026 question.",
    keywords:
      "football AI analyst Kenya, WC26 AI predictions, Mchambuzi, AI football analysis Kenya, football chatbot Kenya",
    h1: "Mchambuzi Halisi — AI Football Analyst",
    body: "Ask Mchambuzi Halisi any football question and get instant AI-powered analysis. Match previews, squad depth, World Cup 2026 insights, tactical breakdowns and dark horse picks. Free on BallMtaani.",
  },
  "/ai-fan-zone": {
    title: "AI Fan Zone | BallMtaani — WC26 Questions Answered by AI",
    description:
      "The AI Fan Zone — ask any WC26 question and get smart, entertaining answers. Who will win? Dark horses? Group of death? Mchambuzi knows.",
    keywords:
      "AI football fan zone, WC26 AI answers, football AI Kenya, World Cup 2026 AI predictions, AI football chat",
    h1: "AI Fan Zone — WC26 Questions Answered",
    body: "Ask any World Cup 2026 question and get instant AI-powered answers. Best African team, dark horses, group of death, golden boot predictions, tactical analysis and entertainment — all free on BallMtaani.",
  },
  "/store": {
    title: "BallMtaani Store — Redeem MTC Coins for Airtime & Rewards",
    description:
      "Redeem your MTC coins for Safaricom airtime, data bundles and exclusive rewards. Earn coins by making correct football predictions.",
    keywords:
      "BallMtaani rewards, MTC coins airtime Kenya, football app rewards Kenya, free airtime Kenya, Safaricom airtime football",
    h1: "BallMtaani Store — Redeem Your MTC Coins",
    body: "Earn MTC coins by making correct football predictions and redeem them for real rewards — Safaricom airtime, data bundles and exclusive BallMtaani perks. Free to earn. Real rewards.",
  },
  "/fun-zone": {
    title: "BallMtaani Fun Zone — Football Games & Quizzes for Kenyan Fans",
    description:
      "Play Rapid Fire debates, football trivia, and fun football games. Earn MTC coins and compete with other Kenyan fans.",
    keywords:
      "football games Kenya, football trivia Kenya, football quiz Kenya, BallMtaani fun zone, football arcade Kenya",
    h1: "BallMtaani Fun Zone",
    body: "Football games for Kenyan fans. Rapid Fire debates, Millionaire-style trivia, Transfer War Room and more. Earn MTC coins and compete for leaderboard spots.",
  },
  "/trivia": {
    title: "Football Trivia | BallMtaani — Win MTC Coins",
    description:
      "Test your football knowledge — World Cup 2026, Premier League history, KPL, African football. Win MTC coins for correct answers.",
    keywords:
      "football trivia Kenya, football quiz Kenya, WC26 trivia, Premier League quiz Kenya, football millionaire Kenya",
    h1: "BallMtaani Football Trivia",
    body: "Test your football knowledge with BallMtaani trivia. Questions on World Cup 2026, Premier League history, African football, KPL and more. Win MTC coins for correct answers. Free to play.",
  },
  "/debates": {
    title: "Football Debates | BallMtaani — Kenya's Biggest Football Arguments",
    description:
      "Join the biggest football debates in Kenya. Vote, argue and make your case — Premier League, WC26, African football and more.",
    keywords:
      "football debates Kenya, Premier League debates, football arguments Kenya, WC26 debates, football vote Kenya",
    h1: "BallMtaani Football Debates",
    body: "Kenya's biggest football debates. Who's the best African striker? Who wins WC26? Best Premier League club? Join thousands of fans, vote and make your case on BallMtaani.",
  },
  "/rivalries": {
    title: "Football Rivalries | BallMtaani — Fan Duels & Head-to-Head Battles",
    description:
      "Pick your side in the greatest football rivalries. El Clasico, Arsenal vs Chelsea, Kenya derbies — vote and compete for MTC coins.",
    keywords:
      "football rivalries Kenya, El Clasico, football fan duels Kenya, Premier League rivalries",
    h1: "BallMtaani Football Rivalries",
    body: "Pick your side in the greatest football rivalries. El Clasico, North London Derby, Arsenal vs Chelsea, Africa derbies. Vote, earn MTC coins and see where Kenya stands.",
  },
  "/fan-zones": {
    title: "Football Fan Zones | BallMtaani — Live Reactions by Club",
    description:
      "Join your club's fan zone for live reactions, debates and match banter. Real Kenyan fans reacting in real time.",
    keywords:
      "football fan zones Kenya, Arsenal fan zone Kenya, Man United Kenya, football supporters Kenya, Premier League fans Kenya",
    h1: "BallMtaani Fan Zones",
    body: "Find your club's fan zone and react in real time with thousands of Kenyan supporters. Arsenal, Manchester United, Liverpool, Chelsea, Barcelona, Real Madrid, and Kenyan club rooms.",
  },
  "/war-room": {
    title: "Transfer War Room | BallMtaani — Build Your Dream Transfer Window",
    description:
      "The transfer war room — vote on real transfer rumours, build your dream squad and see what the BallMtaani community thinks should happen.",
    keywords:
      "football transfers Kenya, transfer war room, football transfer game Kenya, dream squad Kenya",
    h1: "BallMtaani Transfer War Room",
    body: "Vote on real football transfer rumours, build your dream squad and see where the BallMtaani community stands. Free transfer game for Kenyan football fans.",
  },
  "/videos": {
    title: "Football Videos | BallMtaani — Highlights, Analysis & WC26",
    description:
      "Watch football videos — World Cup 2026 highlights, match analysis, KPL clips and African football coverage for Kenyan fans.",
    keywords:
      "football videos Kenya, WC26 highlights, Premier League highlights Kenya, football analysis videos",
    h1: "BallMtaani Football Videos",
    body: "Football video highlights, analysis and clips curated for Kenyan fans. World Cup 2026 highlights, Premier League best moments, KPL action and African football coverage.",
  },
  "/search": {
    title: "Search Football | BallMtaani — Find Matches, Teams & Players",
    description:
      "Search BallMtaani for live scores, fixtures, teams, players and leagues. Fast football search for Kenyan fans.",
    keywords:
      "football search Kenya, find football match Kenya, BallMtaani search, football team search Kenya",
    h1: "BallMtaani Football Search",
    body: "Search for live football scores, fixtures, teams, players and leagues on BallMtaani. Find any match from the Premier League, World Cup 2026, KPL and more.",
  },
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function botHTML(meta: PageMeta, canonical: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}"/>
<meta name="keywords" content="${esc(meta.keywords)}"/>
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"/>
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
{"@context":"https://schema.org","@graph":[{"@type":"WebPage","name":${JSON.stringify(meta.title)},"description":${JSON.stringify(meta.description)},"url":${JSON.stringify(canonical)},"inLanguage":"en-KE","isPartOf":{"@type":"WebSite","name":"BallMtaani","url":"https://ballmtaani.com/"}},{"@type":"Organization","name":"BallMtaani","url":"https://ballmtaani.com/","logo":"https://ballmtaani.com/logo.png","sameAs":["https://twitter.com/ballmtaani","https://www.facebook.com/ballmtaani","https://www.instagram.com/ballmtaani"]}]}
</script>
</head>
<body style="font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#111">
<a href="https://ballmtaani.com/" style="color:#B30000;font-weight:bold;text-decoration:none">BallMtaani</a>
<h1 style="margin-top:.5rem">${esc(meta.h1)}</h1>
<p>${esc(meta.body)}</p>
<hr style="border:none;border-top:1px solid #ddd;margin:1.5rem 0"/>
<nav style="display:flex;flex-wrap:wrap;gap:.75rem;font-size:.875rem">
  <a href="https://ballmtaani.com/matches">Live Scores</a>
  <a href="https://ballmtaani.com/world-cup-2026">World Cup 2026</a>
  <a href="https://ballmtaani.com/predictions">Predictions</a>
  <a href="https://ballmtaani.com/leaderboard">Leaderboard</a>
  <a href="https://ballmtaani.com/news">News</a>
  <a href="https://ballmtaani.com/mchambuzi-halisi">Mchambuzi AI</a>
  <a href="https://ballmtaani.com/store">Store</a>
</nav>
</body>
</html>`;
}

export default function middleware(request: Request): Response | undefined {
  const ua = request.headers.get("user-agent") || "";
  if (!BOT_UA.test(ua)) return undefined; // pass through to SPA

  const url = new URL(request.url);
  const { pathname } = url;

  // Skip static asset requests — bots shouldn't hit these but guard anyway
  if (/\.(?:js|css|png|jpg|jpeg|svg|ico|json|txt|xml|webp|woff2?|mp4|gz)$/i.test(pathname)) {
    return undefined;
  }

  const meta = META[pathname] ?? META["/"];
  const canonical = `https://ballmtaani.com${pathname}`;

  return new Response(botHTML(meta, canonical), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Cache bot responses at the edge for 1 hour — meta rarely changes mid-deploy
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-BallMtaani-Rendered": "bot",
    },
  });
}

export const config = {
  // Run on all paths except API routes, Vercel internals, and binary assets
  matcher: [
    "/((?!api/|_next/|_vercel/|assets/|icons/|logo\\.png|manifest\\.json|sw\\.js|robots\\.txt|sitemap\\.xml|opengraph\\.jpg|ads\\.txt|widget-test\\.html).*)",
  ],
};
