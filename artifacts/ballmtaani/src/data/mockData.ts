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

// Extended mock logos for new teams (using ESPN CDN structured URLs similar to existing)
const EXTENDED_LOGOS: Record<string, string> = {
  ...CLUB_LOGOS,
  "Aston Villa": "https://a.espncdn.com/i/teamlogos/soccer/500/362.png",
  "Newcastle": "https://a.espncdn.com/i/teamlogos/soccer/500/361.png",
  "West Ham": "https://a.espncdn.com/i/teamlogos/soccer/500/371.png",
  "Brighton": "https://a.espncdn.com/i/teamlogos/soccer/500/331.png",
  "Girona": "https://a.espncdn.com/i/teamlogos/soccer/500/9812.png",
  "Athletic Club": "https://a.espncdn.com/i/teamlogos/soccer/500/84.png",
  "Real Sociedad": "https://a.espncdn.com/i/teamlogos/soccer/500/89.png",
  "Real Betis": "https://a.espncdn.com/i/teamlogos/soccer/500/244.png",
  "Valencia": "https://a.espncdn.com/i/teamlogos/soccer/500/94.png",
  "Villarreal": "https://a.espncdn.com/i/teamlogos/soccer/500/102.png",
  "AC Milan": "https://a.espncdn.com/i/teamlogos/soccer/500/103.png",
  "Napoli": "https://a.espncdn.com/i/teamlogos/soccer/500/114.png",
  "Roma": "https://a.espncdn.com/i/teamlogos/soccer/500/104.png",
  "Lazio": "https://a.espncdn.com/i/teamlogos/soccer/500/108.png",
  "Atalanta": "https://a.espncdn.com/i/teamlogos/soccer/500/101.png",
  "Fiorentina": "https://a.espncdn.com/i/teamlogos/soccer/500/109.png",
  "Bologna": "https://a.espncdn.com/i/teamlogos/soccer/500/105.png",
  "Torino": "https://a.espncdn.com/i/teamlogos/soccer/500/239.png",
  "Bayer Leverkusen": "https://a.espncdn.com/i/teamlogos/soccer/500/131.png",
  "RB Leipzig": "https://a.espncdn.com/i/teamlogos/soccer/500/11420.png",
  "Stuttgart": "https://a.espncdn.com/i/teamlogos/soccer/500/134.png",
  "Eintracht F.": "https://a.espncdn.com/i/teamlogos/soccer/500/125.png",
  "Freiburg": "https://a.espncdn.com/i/teamlogos/soccer/500/126.png",
  "Hoffenheim": "https://a.espncdn.com/i/teamlogos/soccer/500/138.png",
  "Wolfsburg": "https://a.espncdn.com/i/teamlogos/soccer/500/137.png",
  "Lille": "https://a.espncdn.com/i/teamlogos/soccer/500/164.png",
  "Marseille": "https://a.espncdn.com/i/teamlogos/soccer/500/176.png",
  "Nice": "https://a.espncdn.com/i/teamlogos/soccer/500/166.png",
  "Lens": "https://a.espncdn.com/i/teamlogos/soccer/500/163.png",
  "Lyon": "https://a.espncdn.com/i/teamlogos/soccer/500/167.png",
  "Rennes": "https://a.espncdn.com/i/teamlogos/soccer/500/273.png",
  "Reims": "https://a.espncdn.com/i/teamlogos/soccer/500/275.png",
  "Strasbourg": "https://a.espncdn.com/i/teamlogos/soccer/500/171.png"
};

export const STANDINGS: Record<string, any[]> = {
  "Premier League": [
    { rank: 1, team: "Liverpool", points: 54, played: 23, gd: "+32", form: ["W","W","D","L","W"], logo: EXTENDED_LOGOS["Liverpool"] },
    { rank: 2, team: "Man City", points: 52, played: 23, gd: "+28", form: ["W","W","W","W","W"], logo: EXTENDED_LOGOS["Man City"] },
    { rank: 3, team: "Arsenal", points: 49, played: 23, gd: "+25", form: ["W","D","W","W","L"], logo: EXTENDED_LOGOS["Arsenal"] },
    { rank: 4, team: "Aston Villa", points: 46, played: 23, gd: "+15", form: ["L","W","L","W","D"], logo: EXTENDED_LOGOS["Aston Villa"] },
    { rank: 5, team: "Tottenham", points: 44, played: 23, gd: "+12", form: ["D","W","D","W","W"], logo: EXTENDED_LOGOS["Tottenham"] },
    { rank: 6, team: "Man Utd", points: 38, played: 23, gd: "+1", form: ["W","W","L","D","W"], logo: EXTENDED_LOGOS["Man Utd"] },
    { rank: 7, team: "Newcastle", points: 36, played: 23, gd: "+8", form: ["D","L","W","L","W"], logo: EXTENDED_LOGOS["Newcastle"] },
    { rank: 8, team: "West Ham", points: 36, played: 23, gd: "-3", form: ["L","D",".D","D","W"], logo: EXTENDED_LOGOS["West Ham"] },
    { rank: 9, team: "Brighton", points: 35, played: 23, gd: "+4", form: ["W","L","D","L","D"], logo: EXTENDED_LOGOS["Brighton"] },
    { rank: 10, team: "Chelsea", points: 31, played: 23, gd: "-1", form: ["L","L","W","W","L"], logo: EXTENDED_LOGOS["Chelsea"] }
  ],
  "La Liga": [
    { rank: 1, team: "Real Madrid", points: 58, played: 23, gd: "+33", form: ["D","W","W","W","W"], logo: EXTENDED_LOGOS["Real Madrid"] },
    { rank: 2, team: "Girona", points: 56, played: 23, gd: "+27", form: ["D","W","W","D","W"], logo: EXTENDED_LOGOS["Girona"] },
    { rank: 3, team: "Barcelona", points: 50, played: 23, gd: "+17", form: ["W","W","L","W","W"], logo: EXTENDED_LOGOS["Barcelona"] },
    { rank: 4, team: "Atletico", points: 48, played: 23, gd: "+19", form: ["D","W","W","L","L"], logo: EXTENDED_LOGOS["Atletico"] },
    { rank: 5, team: "Athletic Club", points: 45, played: 23, gd: "+20", form: ["W","D","L","W","W"], logo: EXTENDED_LOGOS["Athletic Club"] },
    { rank: 6, team: "Real Sociedad", points: 37, played: 23, gd: "+11", form: ["D","D","W","L","D"], logo: EXTENDED_LOGOS["Real Sociedad"] },
    { rank: 7, team: "Real Betis", points: 35, played: 23, gd: "+1", form: ["D","W","L","W","L"], logo: EXTENDED_LOGOS["Real Betis"] },
    { rank: 8, team: "Valencia", points: 35, played: 23, gd: "0", form: ["W","L","W","W","W"], logo: EXTENDED_LOGOS["Valencia"] },
    { rank: 9, team: "Las Palmas", points: 32, played: 23, gd: "-3", form: ["D","L","W","W","L"], logo: EXTENDED_LOGOS["Real Madrid"] }, // Reusing logo to avoid error
    { rank: 10, team: "Getafe", points: 30, played: 23, gd: "-4", form: ["D","L","W","L","L"], logo: EXTENDED_LOGOS["Real Madrid"] } 
  ],
  "Serie A": [
    { rank: 1, team: "Inter", points: 57, played: 22, gd: "+41", form: ["W","W","W","W","W"], logo: EXTENDED_LOGOS["Inter"] },
    { rank: 2, team: "Juventus", points: 53, played: 23, gd: "+22", form: ["L","D","W","W","W"], logo: EXTENDED_LOGOS["Juventus"] },
    { rank: 3, team: "AC Milan", points: 49, played: 23, gd: "+19", form: ["W","D","W","W","W"], logo: EXTENDED_LOGOS["AC Milan"] },
    { rank: 4, team: "Atalanta", points: 39, played: 22, gd: "+18", form: ["W","W","W","D","L"], logo: EXTENDED_LOGOS["Atalanta"] },
    { rank: 5, team: "Roma", points: 38, played: 23, gd: "+14", form: ["W","W","W","L","D"], logo: EXTENDED_LOGOS["Roma"] },
    { rank: 6, team: "Bologna", points: 36, played: 22, gd: "+5", form: ["W","D","L","D","L"], logo: EXTENDED_LOGOS["Bologna"] },
    { rank: 7, team: "Napoli", points: 35, played: 22, gd: "+6", form: ["W","D","W","L","D"], logo: EXTENDED_LOGOS["Napoli"] },
    { rank: 8, team: "Fiorentina", points: 34, played: 22, gd: "+6", form: ["L","L","D","L","W"], logo: EXTENDED_LOGOS["Fiorentina"] },
    { rank: 9, team: "Lazio", points: 34, played: 22, gd: "+1", form: ["L","D","W","W","W"], logo: EXTENDED_LOGOS["Lazio"] },
    { rank: 10, team: "Torino", points: 32, played: 22, gd: "+1", form: ["D","W","D","W","L"], logo: EXTENDED_LOGOS["Torino"] }
  ],
  "Bundesliga": [
    { rank: 1, team: "Bayer Leverkusen", points: 52, played: 20, gd: "+38", form: ["W","D","W","W","W"], logo: EXTENDED_LOGOS["Bayer Leverkusen"] },
    { rank: 2, team: "Bayern", points: 50, played: 20, gd: "+40", form: ["W","W","L","W","W"], logo: EXTENDED_LOGOS["Bayern"] },
    { rank: 3, team: "Stuttgart", points: 40, played: 20, gd: "+20", form: ["W","W","L","L","W"], logo: EXTENDED_LOGOS["Stuttgart"] },
    { rank: 4, team: "Dortmund", points: 37, played: 20, gd: "+14", form: ["D","W","W","W","D"], logo: EXTENDED_LOGOS["Dortmund"] },
    { rank: 5, team: "RB Leipzig", points: 36, played: 20, gd: "+18", form: ["W","L","L","L","D"], logo: EXTENDED_LOGOS["RB Leipzig"] },
    { rank: 6, team: "Eintracht F.", points: 31, played: 20, gd: "+8", form: ["L","W","D","W","W"], logo: EXTENDED_LOGOS["Eintracht F."] },
    { rank: 7, team: "Freiburg", points: 28, played: 20, gd: "-6", form: ["L","L","W","D","W"], logo: EXTENDED_LOGOS["Freiburg"] },
    { rank: 8, team: "Hoffenheim", points: 26, played: 20, gd: "-3", form: ["D","D","L","D","L"], logo: EXTENDED_LOGOS["Hoffenheim"] },
    { rank: 9, team: "Heidenheim", points: 24, played: 20, gd: "-8", form: ["D","D","D","D","W"], logo: EXTENDED_LOGOS["Bayern"] }, // Reusing logo to avoid error
    { rank: 10, team: "Werder Bremen", points: 23, played: 20, gd: "-6", form: ["W","W","W","D","D"], logo: EXTENDED_LOGOS["Bayern"] } // Reusing logo to avoid error
  ],
  "Ligue 1": [
    { rank: 1, team: "PSG", points: 47, played: 20, gd: "+29", form: ["W","D","W","W","D"], logo: EXTENDED_LOGOS["PSG"] },
    { rank: 2, team: "Nice", points: 39, played: 20, gd: "+9", form: ["D","W","L","W","L"], logo: EXTENDED_LOGOS["Nice"] },
    { rank: 3, team: "Brest", points: 36, played: 20, gd: "+12", form: ["D","D","W","W","W"], logo: EXTENDED_LOGOS["PSG"] }, // Reusing logo
    { rank: 4, team: "Lille", points: 35, played: 20, gd: "+12", form: ["W","D","W","D","L"], logo: EXTENDED_LOGOS["Lille"] },
    { rank: 5, team: "Monaco", points: 35, played: 20, gd: "+10", form: ["D","D","L","W","W"], logo: EXTENDED_LOGOS["Monaco"] },
    { rank: 6, team: "Lens", points: 32, played: 20, gd: "+5", form: ["W","W","D","L","L"], logo: EXTENDED_LOGOS["Lens"] },
    { rank: 7, team: "Reims", points: 30, played: 20, gd: "-1", form: ["L","D","W","W","L"], logo: EXTENDED_LOGOS["Reims"] },
    { rank: 8, team: "Marseille", points: 29, played: 20, gd: "+6", form: ["L","D","D","D","D"], logo: EXTENDED_LOGOS["Marseille"] },
    { rank: 9, team: "Rennes", points: 28, played: 20, gd: "+4", form: ["W","W","W","W","D"], logo: EXTENDED_LOGOS["Rennes"] },
    { rank: 10, team: "Strasbourg", points: 25, played: 20, gd: "-6", form: ["L","D","D","W","W"], logo: EXTENDED_LOGOS["Strasbourg"] }
  ]
};

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
