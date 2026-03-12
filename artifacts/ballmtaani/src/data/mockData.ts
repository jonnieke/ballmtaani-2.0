export const CLUB_LOGOS: Record<string, string> = {
  "Arsenal":     "https://a.espncdn.com/i/teamlogos/soccer/500/359.png",
  "Chelsea":     "https://a.espncdn.com/i/teamlogos/soccer/500/363.png",
  "Man City":    "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
  "Liverpool":   "https://a.espncdn.com/i/teamlogos/soccer/500/364.png",
  "Real Madrid": "https://a.espncdn.com/i/teamlogos/soccer/500/86.png",
  "Barcelona":   "https://a.espncdn.com/i/teamlogos/soccer/500/83.png",
  "PSG":         "https://a.espncdn.com/i/teamlogos/soccer/500/160.png",
  "Man Utd":     "https://a.espncdn.com/i/teamlogos/soccer/500/360.png",
  "Tottenham":   "https://a.espncdn.com/i/teamlogos/soccer/500/367.png",
  "Monaco":      "https://a.espncdn.com/i/teamlogos/soccer/500/5767.png",
  "Atletico":    "https://a.espncdn.com/i/teamlogos/soccer/500/1068.png",
  "Dortmund":    "https://a.espncdn.com/i/teamlogos/soccer/500/124.png",
  "Bayern":      "https://a.espncdn.com/i/teamlogos/soccer/500/132.png",
  "Inter":       "https://a.espncdn.com/i/teamlogos/soccer/500/110.png",
  "Juventus":    "https://a.espncdn.com/i/teamlogos/soccer/500/111.png",
};

export const LIVE_MATCHES = [
  { id: "m1", home: "Arsenal",     homeLogo: CLUB_LOGOS["Arsenal"],     homeColor: "#EF0107", homeInitial: "A", away: "Chelsea",   awayLogo: CLUB_LOGOS["Chelsea"],   awayColor: "#034694", awayInitial: "C", homeScore: 2, awayScore: 1, minute: "67'",    league: "Premier League", possession: "58% - 42%", scorers: "Saka 23', Martinelli 51' / Sterling 45'" },
  { id: "m2", home: "Man City",    homeLogo: CLUB_LOGOS["Man City"],    homeColor: "#6CABDD", homeInitial: "M", away: "Liverpool", awayLogo: CLUB_LOGOS["Liverpool"], awayColor: "#C8102E", awayInitial: "L", homeScore: 1, awayScore: 1, minute: "45'+2", league: "Premier League", possession: "62% - 38%", scorers: "Haaland 12' / Salah 34'" },
  { id: "m3", home: "PSG",         homeLogo: CLUB_LOGOS["PSG"],         homeColor: "#004170", homeInitial: "P", away: "Monaco",   awayLogo: CLUB_LOGOS["Monaco"],   awayColor: "#E30613", awayInitial: "M", homeScore: 3, awayScore: 0, minute: "88'",    league: "Ligue 1",        possession: "65% - 35%", scorers: "Mbappe 14', 56', Dembele 72'" },
  { id: "m4", home: "Real Madrid", homeLogo: CLUB_LOGOS["Real Madrid"], homeColor: "#FEBE10", homeInitial: "R", away: "Atletico", awayLogo: CLUB_LOGOS["Atletico"], awayColor: "#CB3524", awayInitial: "A", homeScore: 1, awayScore: 0, minute: "32'",    league: "La Liga",        possession: "55% - 45%", scorers: "Bellingham 21'" }
];

export const UPCOMING_FIXTURES = [
  { id: "f1", home: "Real Madrid", homeLogo: CLUB_LOGOS["Real Madrid"], homeColor: "#FEBE10", homeInitial: "R", away: "Barcelona", awayLogo: CLUB_LOGOS["Barcelona"], awayColor: "#A50044", awayInitial: "B", time: "20:00 EAT", league: "La Liga",        date: "Today" },
  { id: "f2", home: "Man Utd",     homeLogo: CLUB_LOGOS["Man Utd"],     homeColor: "#DA291C", homeInitial: "M", away: "Tottenham", awayLogo: CLUB_LOGOS["Tottenham"], awayColor: "#132257", awayInitial: "T", time: "17:30 EAT", league: "Premier League", date: "Today" },
  { id: "f3", home: "Dortmund",    homeLogo: CLUB_LOGOS["Dortmund"],    homeColor: "#FDE100", homeInitial: "D", away: "Bayern",    awayLogo: CLUB_LOGOS["Bayern"],    awayColor: "#DC052D", awayInitial: "B", time: "22:30 EAT", league: "Bundesliga",     date: "Tomorrow" },
  { id: "f4", home: "Inter",       homeLogo: CLUB_LOGOS["Inter"],       homeColor: "#005CA5", homeInitial: "I", away: "Juventus",  awayLogo: CLUB_LOGOS["Juventus"],  awayColor: "#000000", awayInitial: "J", time: "21:45 EAT", league: "Serie A",        date: "Tomorrow" }
];

export const AI_PREDICTIONS = [
  { id: "p1", match: "Arsenal vs Chelsea",       homeTeam: "Arsenal",     awayTeam: "Chelsea",    homeProb: 52, drawProb: 20, awayProb: 28, predScore: "2 - 1" },
  { id: "p2", match: "Real Madrid vs Barcelona", homeTeam: "Real Madrid", awayTeam: "Barcelona",  homeProb: 38, drawProb: 20, awayProb: 42, predScore: "1 - 2" },
  { id: "p3", match: "Man Utd vs Tottenham",     homeTeam: "Man Utd",     awayTeam: "Tottenham",  homeProb: 45, drawProb: 30, awayProb: 25, predScore: "1 - 1" }
];

export const DEBATES = [
  { id: "d1", title: "Who's the GOAT?",      left: "Messi 🐐",       right: "Ronaldo 🔴",        leftVotes: 54, rightVotes: 46, totalVotes: "2,847" },
  { id: "d2", title: "Best League",           left: "EPL 🏴󠁧󠁢󠁥󠁮󠁧󠁿",        right: "La Liga 🇪🇸",         leftVotes: 62, rightVotes: 38, totalVotes: "1,523" },
  { id: "d3", title: "Who's better?",         left: "Haaland",        right: "Mbappé",             leftVotes: 48, rightVotes: 52, totalVotes: "3,102" },
  { id: "d4", title: "Best African Player",   left: "Salah",          right: "Osimhen",            leftVotes: 70, rightVotes: 30, totalVotes: "1,945" },
  { id: "d5", title: "Best Manager",          left: "Pep Guardiola",  right: "Klopp",              leftVotes: 51, rightVotes: 49, totalVotes: "2,100" },
  { id: "d6", title: "Biggest Derby",         left: "El Clásico",     right: "North West Derby",   leftVotes: 55, rightVotes: 45, totalVotes: "1,205" }
];

export const BANTER_TWEETS = [
  "Man U fans showed up hoping for a win… Left needing therapy!",
  "Arsenal fans checking the league table in December like it's already May.",
  "Chelsea's transfer window: spending €1B to finish 10th. Peak tradition.",
  "Liverpool fans still singing 'You'll Never Walk Alone'... to an empty trophy cabinet.",
  "Tottenham: consistently inconsistent since 1882."
];

export const LEADERBOARD = [
  { rank: 1, name: "Ochieng",    country: "🇰🇪", correct: 24, streak: 5, pts: 120 },
  { rank: 2, name: "Adebayo",    country: "🇳🇬", correct: 22, streak: 3, pts: 110 },
  { rank: 3, name: "KamauFC",    country: "🇰🇪", correct: 20, streak: 4, pts: 100 },
  { rank: 4, name: "Musa",       country: "🇬🇭", correct: 18, streak: 0, pts: 90 },
  { rank: 5, name: "Sipho",      country: "🇿🇦", correct: 17, streak: 2, pts: 85 },
  { rank: 6, name: "Kabelo",     country: "🇿🇦", correct: 16, streak: 1, pts: 80 },
  { rank: 7, name: "Wanjiku",    country: "🇰🇪", correct: 15, streak: 0, pts: 75 },
  { rank: 8, name: "Nnamdi",     country: "🇳🇬", correct: 14, streak: 3, pts: 70 },
  { rank: 9, name: "Fatoumata",  country: "🇸🇳", correct: 13, streak: 0, pts: 65 },
  { rank: 10, name: "Kofi",      country: "🇬🇭", correct: 12, streak: 1, pts: 60 }
];

export const FAN_ZONES = [
  { id: "z1", team: "Arsenal",     logo: CLUB_LOGOS["Arsenal"],     color: "#EF0107", members: "12,450 fans", preview: "Arteta needs to start playing Trossard more..." },
  { id: "z2", team: "Chelsea",     logo: CLUB_LOGOS["Chelsea"],     color: "#034694", members: "10,210 fans", preview: "When is Nkunku coming back?" },
  { id: "z3", team: "Man City",    logo: CLUB_LOGOS["Man City"],    color: "#6CABDD", members: "8,900 fans",  preview: "Haaland is a robot, I'm convinced." },
  { id: "z4", team: "Liverpool",   logo: CLUB_LOGOS["Liverpool"],   color: "#C8102E", members: "11,300 fans", preview: "We need another midfielder in Jan." },
  { id: "z5", team: "Real Madrid", logo: CLUB_LOGOS["Real Madrid"], color: "#FEBE10", members: "15,800 fans", preview: "Bellingham for Ballon d'Or!" },
  { id: "z6", team: "Barcelona",   logo: CLUB_LOGOS["Barcelona"],   color: "#A50044", members: "14,200 fans", preview: "Yamal is the future of this club." },
  { id: "z7", team: "PSG",         logo: CLUB_LOGOS["PSG"],         color: "#004170", members: "6,500 fans",  preview: "Mbappe carrying us again." },
  { id: "z8", team: "Man Utd",     logo: CLUB_LOGOS["Man Utd"],     color: "#DA291C", members: "13,900 fans", preview: "Ten Hag out? Or give him time?" }
];
