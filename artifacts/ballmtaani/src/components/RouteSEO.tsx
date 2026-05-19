import SEO from "./SEO";

const SEO_ROUTES: Record<string, {
  title: string;
  description: string;
  keywords: string[];
  noindex?: boolean;
}> = {
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
