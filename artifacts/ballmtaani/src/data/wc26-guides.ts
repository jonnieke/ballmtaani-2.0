export type Wc26GuideSlug = "format" | "stadiums" | "africa" | "squads";

export interface Wc26Guide {
  slug: Wc26GuideSlug;
  title: string;
  eyebrow: string;
  deck: string;
  statLine: Array<{ label: string; value: string }>;
  fanTake: string;
  sections: Array<{
    title: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
  sourceLinks: Array<{ label: string; href: string }>;
}

export const WC26_GUIDES: Wc26Guide[] = [
  {
    slug: "format",
    title: "World Cup 2026 Format: How the 48-Team Tournament Works",
    eyebrow: "Tournament Format",
    deck: "The biggest World Cup ever brings 48 teams, 12 groups and 104 matches. The path is longer, noisier and more dangerous for favourites.",
    statLine: [
      { label: "Teams", value: "48" },
      { label: "Groups", value: "12" },
      { label: "Matches", value: "104" },
    ],
    fanTake: "The new format rewards depth. A big-name starting XI is not enough if the bench cannot handle travel, rotation and knockout pressure.",
    sections: [
      {
        title: "The simple version",
        paragraphs: [
          "World Cup 2026 expands from 32 teams to 48 teams. The group stage is built around 12 groups of four, which creates more matches and more ways for dangerous outsiders to reach the knockouts.",
          "The tournament runs from June 11 to July 19, 2026, across the United States, Mexico and Canada. For Kenyan fans, most matches will land in evening or late-night windows, so the big games become proper watch-party events.",
        ],
        bullets: [
          "48 teams instead of 32.",
          "12 groups of four teams.",
          "104 total matches from opening game to final.",
          "A Round of 32 before the usual late knockout rounds.",
        ],
      },
      {
        title: "Why fans should care",
        paragraphs: [
          "The extra knockout round changes the tournament math. A champion now has to survive more football, more travel and more tactical surprises.",
          "Form will swing faster because more nations will believe they can escape the group. That creates more upset stories, more fan arguments and more pressure on coaches to manage minutes properly.",
        ],
      },
    ],
    sourceLinks: [
      { label: "FIFA schedule and fixtures", href: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums" },
      { label: "FIFA format help", href: "https://gpcustomersupportfwc2026.tickets.fifa.com/hc/en-gb/articles/28784798873117-10-What-is-the-format-for-the-FIFA-World-Cup-2026-tournament" },
    ],
  },
  {
    slug: "stadiums",
    title: "World Cup 2026 Stadiums: The 16 Host Cities Explained",
    eyebrow: "Venues and Travel",
    deck: "Sixteen host cities across three countries will shape rhythm, weather, travel load and atmosphere. The venue matters before the ball is kicked.",
    statLine: [
      { label: "Host countries", value: "3" },
      { label: "Cities", value: "16" },
      { label: "Final", value: "NY/NJ" },
    ],
    fanTake: "Do not only ask who is better. Ask where they are playing, how far they travelled and whether the conditions suit their football.",
    sections: [
      {
        title: "The map",
        paragraphs: [
          "The United States hosts 11 venues, Mexico hosts three and Canada hosts two. That spread gives World Cup 2026 a different feel from a compact tournament: squads will have to manage distance, climate and recovery.",
          "Mexico City hosts the opening match on June 11, 2026. The final is scheduled for July 19, 2026, at the New York/New Jersey venue.",
        ],
        bullets: [
          "USA: 11 host venues.",
          "Mexico: 3 host venues.",
          "Canada: 2 host venues.",
          "Final: New York/New Jersey.",
        ],
      },
      {
        title: "The football angle",
        paragraphs: [
          "Venue context can affect tempo. Heat, humidity, turf familiarity, travel distance and crowd composition can all change how a match feels.",
          "For BallMtaani fans, stadium knowledge is not trivia. It is part of reading why a team may rotate, start slower or protect a lead differently.",
        ],
      },
    ],
    sourceLinks: [
      { label: "FIFA stadium guide", href: "https://www.fifa.com/en/articles/world-cup-2026-stadiums-fifa-soccer-football-mexico-usa-canada" },
      { label: "FIFA match schedule", href: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums" },
    ],
  },
  {
    slug: "africa",
    title: "Africa at World Cup 2026: The Teams Kenyan Fans Should Track",
    eyebrow: "Africa Desk",
    deck: "The expanded tournament gives Africa its biggest World Cup stage. More slots mean more belief, more pressure and more teams with a real chance to make noise.",
    statLine: [
      { label: "CAF direct slots", value: "9" },
      { label: "Extra route", value: "Playoff" },
      { label: "Fan focus", value: "Africa" },
    ],
    fanTake: "For Kenyan fans, WC26 is also an African football test: which teams have structure, squad depth and the courage to beat elite opponents?",
    sections: [
      {
        title: "Why this World Cup feels different",
        paragraphs: [
          "Africa has more room at World Cup 2026 than in previous tournaments. That means the conversation should move beyond one or two famous names and into proper squad comparison.",
          "The teams to watch are not only the biggest brands. Watch the teams with settled coaching, balanced midfields, reliable centre-backs and forwards who can survive knockout pressure.",
        ],
        bullets: [
          "Morocco carry recent World Cup credibility.",
          "Senegal and Nigeria bring star power and pressure.",
          "Egypt, Ghana, Cameroon, Algeria and Tunisia remain serious football nations.",
          "South Africa and other rising teams can change the regional conversation.",
        ],
      },
      {
        title: "The Kenyan fan angle",
        paragraphs: [
          "Kenya may not be at the tournament, but Kenyan fans will still own the debate. Premier League loyalties, African pride and watch-party culture will shape how people pick their teams.",
          "This is where BallMtaani can be sticky: African watchlists, fan zones, prediction receipts and arguments that do not treat CAF teams like side stories.",
        ],
      },
    ],
    sourceLinks: [
      { label: "CAF official site", href: "https://www.cafonline.com/" },
      { label: "FIFA World Cup 2026", href: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026" },
    ],
  },
  {
    slug: "squads",
    title: "World Cup 2026 Squads and Coaches: How to Read a Team Early",
    eyebrow: "Squads and Coaches",
    deck: "Lineups, coaches and player pools tell fans who is trusted, who is missing and which teams are built for tournament football.",
    statLine: [
      { label: "Key read", value: "Depth" },
      { label: "Risk", value: "Injuries" },
      { label: "Edge", value: "Balance" },
    ],
    fanTake: "A tournament team is not only its best eleven. It is the 18 players a coach can trust when the match gets ugly.",
    sections: [
      {
        title: "What to check first",
        paragraphs: [
          "Start with the spine: goalkeeper, centre-backs, central midfield and striker. If that line is weak, the team will eventually be exposed.",
          "Then read the bench. World Cups are decided by rotation, late substitutions and players who can change a match without needing 90 minutes.",
        ],
        bullets: [
          "Is the coach settled or experimenting?",
          "Does the team have two reliable options in key positions?",
          "Are the wide players creators, runners or finishers?",
          "Can the midfield control matches against stronger opponents?",
        ],
      },
      {
        title: "How BallMtaani should use this",
        paragraphs: [
          "Every squad update should feed predictions, debates and fan-zone arguments. A new call-up is not just news; it changes how fans rate the group, the matchup and the knockout path.",
          "The best experience is simple: read the squad, ask Mchambuzi, make a call, and keep the receipt.",
        ],
      },
    ],
    sourceLinks: [
      { label: "WC26 squads source", href: "https://www.api-football.com/news/post/fifa-world-cup-2026-lineups-all-teams-coaches-and-players" },
      { label: "FIFA World Cup 2026", href: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026" },
    ],
  },
];

export function getWc26Guide(slug: string | undefined) {
  return WC26_GUIDES.find((guide) => guide.slug === slug);
}
