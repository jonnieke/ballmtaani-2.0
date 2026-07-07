import SEO from "./SEO";

const SEO_ROUTES: Record<string, {
  title: string;
  description: string;
  keywords: string[];
  noindex?: boolean;
}> = {
  "/home": {
    title: "BallMtaani | Kenya's #1 Football App â€” Live Scores, WC26 & AI Analysis",
    description: "BallMtaani â€” Kenya's home for live football. World Cup 2026 scores, Premier League fixtures, KPL updates, Africa WC26 tracking, fan predictions and Mchambuzi AI analysis. Free.",
    keywords: ["Kenya football", "live football scores Kenya", "World Cup 2026 Kenya", "BallMtaani", "KPL", "Premier League Kenya", "Africa WC26"],
  },
  "/news": {
    title: "Mtaa Daily | BallMtaani â€” Today's Football for the Kenyan Fan",
    description: "Today's football newspaper for Kenyan fans â€” World Cup 2026 desk, match reports, Kenyan fan angles, Africa coverage and wire headlines on BallMtaani Mtaa Daily.",
    keywords: ["Kenya football news", "World Cup 2026 news", "KPL news", "Premier League news Kenya", "Africa football news", "BallMtaani news", "Harambee Stars"],
  },
  "/videos": {
    title: "Football Videos Kenya | Highlights, WC26 Goals & Analysis â€” BallMtaani",
    description: "Watch football highlights, World Cup 2026 goals, KPL match clips and AI analysis videos on BallMtaani â€” Kenya's #1 football video platform.",
    keywords: ["football videos Kenya", "World Cup 2026 highlights", "KPL highlights", "football goals Kenya", "BallMtaani videos"],
  },
  "/matches": {
    title: "Live Football Scores & Fixtures Kenya | Premier League, WC26, KPL â€” BallMtaani",
    description: "Live scores, today's fixtures, results and schedules for Premier League, World Cup 2026, Champions League, KPL and all major leagues â€” updated in real time on BallMtaani.",
    keywords: ["live football scores Kenya", "football fixtures Kenya", "Premier League scores", "World Cup 2026 scores", "KPL fixtures", "BallMtaani matches", "today football Kenya"],
  },
  "/world-cup-2026": {
    title: "World Cup 2026 | Africa Teams, Fixtures & Live Scores â€” BallMtaani",
    description: "Complete World Cup 2026 guide for African fans â€” fixtures, results, Africa's 9 nations (Morocco, Nigeria, Senegal, Egypt, South Africa, Cameroon, Mali, CÃ´te d'Ivoire, Tunisia), stadiums and squads.",
    keywords: ["World Cup 2026", "WC26 Africa", "World Cup 2026 fixtures", "World Cup 2026 scores", "Africa WC26", "Morocco WC26", "Nigeria WC26", "Kenya World Cup 2026"],
  },
  "/mchambuzi-halisi": {
    title: "Mchambuzi Halisi | AI Football Analyst for African Fans â€” BallMtaani",
    description: "Mchambuzi Halisi is BallMtaani's AI football analyst â€” ask about tactics, match predictions, KPL form, World Cup 2026, or any football question with African context.",
    keywords: ["AI football analysis", "Mchambuzi Halisi", "football AI Kenya", "BallMtaani AI", "football analysis Africa", "World Cup 2026 AI predictions"],
  },
  "/market-watch": {
    title: "Football Transfer Market Watch | Latest Transfers & Rumours â€” BallMtaani",
    description: "Track the latest football transfers, transfer rumours, squad moves and market values â€” Premier League, La Liga, Serie A and African transfers on BallMtaani.",
    keywords: ["football transfers Kenya", "transfer news", "transfer rumours", "Premier League transfers", "African football transfers", "BallMtaani market watch"],
  },
  "/debates": {
    title: "Football Debates Kenya | Join the Argument â€” BallMtaani",
    description: "Join live football debates with Kenyan fans â€” hot takes, player rankings, WC26 predictions, EPL opinions, KPL controversies and more on BallMtaani.",
    keywords: ["football debates Kenya", "football arguments", "Premier League debate", "KPL debate Kenya", "BallMtaani debates", "World Cup 2026 debate"],
  },
  "/search": {
    title: "Search Football | BallMtaani",
    description: "Search matches, articles, teams, players and competitions on BallMtaani â€” Kenya's football intelligence platform.",
    keywords: ["search football Kenya", "find football match", "BallMtaani search"],
  },
  "/predictions": {
    title: "Football Predictions Kenya | BallMtaani",
    description: "Make football predictions, compare fan calls and keep matchday receipts with BallMtaani's Kenyan football community.",
    keywords: ["football predictions Kenya", "match predictions", "Premier League predictions", "BallMtaani predictions"],
  },
  "/fan-zones": {
    title: "Football Fan Zones Kenya | BallMtaani",
    description: "Join BallMtaani fan zones for Kenyan supporters of Premier League, World Cup, AFCON, CAF and local football clubs.",
    keywords: ["football fan zones Kenya", "Kenyan football supporters", "Premier League fans Kenya", "BallMtaani fan zones"],
  },
  "/leaderboard": {
    title: "BallMtaani Leaderboard | Kenyan Football Fans",
    description: "Track top BallMtaani fans by predictions, debates, trivia and football engagement rewards.",
    keywords: ["BallMtaani leaderboard", "Kenyan football fans leaderboard", "football rewards Kenya"],
  },
  "/live-center": {
    title: "Live Football Center Kenya | BallMtaani",
    description: "Follow live football match context, scores, momentum and fan intelligence on BallMtaani.",
    keywords: ["live football scores Kenya", "football live center", "match center Kenya", "BallMtaani live scores"],
  },
  "/rivalries": {
    title: "Football Rivalries and Fan Duels | BallMtaani",
    description: "Settle football rivalries with fan duels, club pride battles and Kenyan matchday banter.",
    keywords: ["football rivalries", "fan duels", "Kenyan football banter", "BallMtaani rivalries"],
  },
  "/fun-zone": {
    title: "Fun Zone | BallMtaani Arcade â€” Quizzes, Duels & Predictions",
    description: "Football trivia, rapid-fire debates, fan duels, AI take ratings and match predictions â€” free games that earn MTC on BallMtaani.",
    keywords: ["football games Kenya", "football trivia", "fan duels", "football predictions game", "BallMtaani arcade"],
  },
  "/rapid-fire": {
    title: "Rapid Fire Football Debates | BallMtaani",
    description: "Vote fast on football debates, player comparisons and matchday arguments built for Kenyan fans.",
    keywords: ["football debates Kenya", "rapid football polls", "player comparison votes", "BallMtaani rapid fire"],
  },
  "/trivia": {
    title: "Football Trivia Kenya | BallMtaani",
    description: "Play football trivia, test your knowledge and climb the BallMtaani fan leaderboard.",
    keywords: ["football trivia Kenya", "football quiz", "Premier League trivia", "BallMtaani trivia"],
  },
  "/war-room": {
    title: "Transfer War Room | BallMtaani",
    description: "Track transfer stories, squad debates and football rumours with context, receipts and fan reaction.",
    keywords: ["football transfers Kenya", "transfer news", "football rumours", "BallMtaani war room"],
  },
  "/articles": {
    title: "All Articles | Mtaa Daily â€” BallMtaani Football Reporting",
    description: "All original articles from Mtaa Daily â€” World Cup 2026 analysis, match reports, African football coverage and Kenyan fan perspectives from BallMtaani.",
    keywords: ["BallMtaani articles", "Mtaa Daily", "Kenya football articles", "WC26 analysis", "African football reporting"],
  },
  "/about": {
    title: "About BallMtaani | Kenya's Football Community Platform",
    description: "BallMtaani is Kenya's home for football â€” live WC26 scores, Mtaa Daily original reporting, fan predictions, Mchambuzi AI analysis and real airtime rewards. Built in Nairobi for African fans.",
    keywords: ["about BallMtaani", "Kenya football platform", "Nairobi football", "WC26 Kenya", "African football coverage"],
  },
  "/contact": {
    title: "Contact BallMtaani | Get In Touch",
    description: "Contact BallMtaani for editorial enquiries, sponsorship, bug reports or press requests. Email info@ballmtaani.com or use our contact form.",
    keywords: ["contact BallMtaani", "BallMtaani email", "BallMtaani sponsorship"],
  },
  "/login": {
    title: "Login | BallMtaani",
    description: "Log in to BallMtaani.",
    keywords: ["BallMtaani login"],
    noindex: true,
  },
  "/verify": {
    title: "Verify Account | BallMtaani",
    description: "Verify your BallMtaani account.",
    keywords: ["BallMtaani verify"],
    noindex: true,
  },
  "/diagnostics": {
    title: "Diagnostics | BallMtaani",
    description: "BallMtaani diagnostics.",
    keywords: ["BallMtaani diagnostics"],
    noindex: true,
  },
  "/store": {
    title: "MTC Store | BallMtaani",
    description: "Redeem your MTC coins for Kenyan airtime and rewards on BallMtaani.",
    keywords: ["BallMtaani store", "MTC coins", "redeem airtime Kenya"],
    noindex: true,
  },
  "/profile": {
    title: "Profile | BallMtaani",
    description: "Your BallMtaani fan profile.",
    keywords: ["BallMtaani profile"],
    noindex: true,
  },
};

function normalizePath(path: string) {
  const cleaned = path.replace(/\/+$/, "") || "/";
  if (cleaned.startsWith("/live-center/")) return "/live-center";
  if (cleaned.startsWith("/profile/")) return "/profile";
  return cleaned;
}

export default function RouteSEO({ path }: { path: string }) {
  const normalizedPath = normalizePath(path);
  const route = SEO_ROUTES[normalizedPath];
  if (!route) return null;

  return (
    <SEO
      title={route.title}
      description={route.description}
      keywords={route.keywords}
      path={normalizedPath}
      noindex={route.noindex}
      breadcrumbs={[
        { name: "BallMtaani", url: "/" },
        { name: route.title.split("|")[0].trim(), url: normalizedPath },
      ]}
    />
  );
}

