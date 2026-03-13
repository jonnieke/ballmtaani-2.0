import { useState, useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import {
  ChevronLeft, MessageSquare, Info, BarChart3, Users,
  Flame, Heart, Trophy, Target, Timer, 
  Send, TrendingUp, Shield, ListOrdered
} from "lucide-react";
import { useMatches, useStandings } from "../hooks/useData";

/* ─────────────────────────────────────────────────────────────
   MOCK DATA for the match center (enriches match data)
   ─────────────────────────────────────────────────────────────*/
const MATCH_EVENTS = [
  { min: 12, type: "goal",   team: "home", player: "Saka", assist: "Ødegaard" },
  { min: 23, type: "yellow", team: "away", player: "Caicedo" },
  { min: 34, type: "goal",   team: "away", player: "Sterling", assist: "Palmer" },
  { min: 45, type: "sub",    team: "home", playerIn: "Trossard", playerOut: "Martinelli" },
  { min: 51, type: "goal",   team: "home", player: "Martinelli", assist: "Saka" },
  { min: 67, type: "yellow", team: "home", player: "Rice" },
  { min: 72, type: "sub",    team: "away", playerIn: "Mudryk",  playerOut: "Sterling" },
];

const MATCH_STATS = [
  { label: "Possession",     home: 58, away: 42, unit: "%" },
  { label: "Shots",          home: 14, away: 8 },
  { label: "Shots on Target",home: 6,  away: 3 },
  { label: "Corners",        home: 7,  away: 4 },
  { label: "Fouls",          home: 9,  away: 12 },
  { label: "Passes",         home: 487,away: 356 },
  { label: "Pass Accuracy",  home: 89, away: 82, unit: "%" },
  { label: "Tackles",        home: 18, away: 22 },
];

const HOME_LINEUP = {
  formation: "4-3-3",
  players: [
    { pos: "GK", name: "Raya", number: 22, rating: 7.2 },
    { pos: "RB", name: "White", number: 4, rating: 7.5 },
    { pos: "CB", name: "Saliba", number: 2, rating: 8.1 },
    { pos: "CB", name: "Gabriel", number: 6, rating: 7.8 },
    { pos: "LB", name: "Zinchenko", number: 35, rating: 7.0 },
    { pos: "CM", name: "Rice", number: 41, rating: 8.3 },
    { pos: "CM", name: "Ødegaard", number: 8, rating: 8.7 },
    { pos: "CM", name: "Havertz", number: 29, rating: 7.4 },
    { pos: "RW", name: "Saka", number: 7, rating: 9.1 },
    { pos: "ST", name: "Jesus", number: 9, rating: 6.8 },
    { pos: "LW", name: "Martinelli", number: 11, rating: 7.6 },
  ]
};

const AWAY_LINEUP = {
  formation: "4-2-3-1",
  players: [
    { pos: "GK", name: "Sánchez", number: 1, rating: 6.5 },
    { pos: "RB", name: "James", number: 24, rating: 7.0 },
    { pos: "CB", name: "Silva", number: 6, rating: 7.3 },
    { pos: "CB", name: "Colwill", number: 26, rating: 6.8 },
    { pos: "LB", name: "Cucurella", number: 3, rating: 6.9 },
    { pos: "CM", name: "Caicedo", number: 25, rating: 7.1 },
    { pos: "CM", name: "Enzo", number: 8, rating: 7.4 },
    { pos: "AM", name: "Palmer", number: 20, rating: 8.0 },
    { pos: "RW", name: "Madueke", number: 11, rating: 6.6 },
    { pos: "LW", name: "Sterling", number: 17, rating: 7.2 },
    { pos: "ST", name: "Jackson", number: 15, rating: 6.3 },
  ]
};

const FAN_REACTIONS = [
  { id: 1, user: "Ochieng 🇰🇪",   msg: "SAKA IS DIFFERENT GRAVY 🔥🔥🔥",        time: "2m ago", likes: 24 },
  { id: 2, user: "Adebayo 🇳🇬",   msg: "Chelsea fans leaving the stadium already 😂", time: "3m ago", likes: 18 },
  { id: 3, user: "Wanjiku 🇰🇪",   msg: "Martinelli goal was INSANE!!",                time: "5m ago", likes: 31 },
  { id: 4, user: "Sipho 🇿🇦",     msg: "Rice controlling the whole midfield 💪",      time: "6m ago", likes: 12 },
  { id: 5, user: "KamauFC 🇰🇪",   msg: "Palmer best signing of the year though 👀",   time: "8m ago", likes: 9 },
  { id: 6, user: "Musa 🇬🇭",      msg: "This game is ELITE content 🍿",               time: "10m ago", likes: 15 },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENTS
   ─────────────────────────────────────────────────────────────*/

// PREMIUM STAT BAR
function StatBar({ label, home, away, unit }: { label: string; home: number; away: number; unit?: string }) {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  const awayPct = (away / total) * 100;
  const homeWins = home > away;
  const awayWins = away > home;

  return (
    <div className="py-4 hover:bg-white/[0.02] transition-colors rounded-xl px-2">
      <div className="flex justify-between items-end mb-3">
        <span className={`text-xl md:text-2xl font-black ${homeWins ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-500'}`}>
          {home}{unit || ""}
        </span>
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400 pb-1">{label}</span>
        <span className={`text-xl md:text-2xl font-black ${awayWins ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-500'}`}>
          {away}{unit || ""}
        </span>
      </div>
      <div className="flex gap-2 h-3 md:h-4 rounded-full overflow-hidden bg-black border border-white/5 relative shadow-inner">
        <div
          className="rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{
            width: `${homePct}%`,
            background: homeWins ? "linear-gradient(90deg, #ff0000, #ff4444)" : "#333",
            boxShadow: homeWins ? "0 0 15px rgba(255,0,0,0.8)" : "none"
          }}
        >
          {homeWins && <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/40 to-transparent" />}
        </div>
        <div
          className="rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{
            width: `${awayPct}%`,
            background: awayWins ? "linear-gradient(270deg, #3b82f6, #60a5fa)" : "#333",
            boxShadow: awayWins ? "0 0 15px rgba(59,130,246,0.8)" : "none"
          }}
        >
          {awayWins && <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-white/40 to-transparent" />}
        </div>
      </div>
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case "goal":   return <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-black text-xs font-black">⚽</div>;
    case "yellow": return <div className="w-5 h-7 bg-yellow-400 rounded-sm" />;
    case "red":    return <div className="w-5 h-7 bg-red-600 rounded-sm" />;
    case "sub":    return <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center"><TrendingUp className="w-3.5 h-3.5 text-blue-400" /></div>;
    default:       return <div className="w-6 h-6 bg-gray-700 rounded-full" />;
  }
}

// PREMIUM 2D PITCH HALF
function PitchHalf({ lineup, color, direction }: { lineup: typeof HOME_LINEUP, color: string, direction: 'up' | 'down' }) {
  const originalCounts = [1, ...lineup.formation.split('-').map(Number)];
  
  const grouped = [];
  let idx = 0;
  for (const count of originalCounts) {
    if (idx + count <= lineup.players.length) {
      grouped.push(lineup.players.slice(idx, idx + count));
    }
    idx += count;
  }
  
  if (direction === 'up') {
    grouped.reverse(); // Attack UP means forwards render closer to the middle of the full container (at start of this half)
  }

  return (
    <>
      {grouped.map((row, i) => (
         <div key={i} className="flex justify-evenly items-center w-full relative z-10 px-2 sm:px-4">
           {row.map(player => {
              const ratingColor = player.rating >= 8.0 ? "border-green-400 text-green-400 bg-green-400/10" : 
                                  player.rating >= 7.0 ? "border-yellow-400 text-yellow-400 bg-yellow-400/10" : 
                                  "border-gray-500 text-gray-400 bg-gray-500/10";
              return (
              <div key={player.number} className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-110">
                 {/* Jersey node */}
                 <div className="relative mb-0.5 sm:mb-1">
                   {/* Premium Jersey rendering */}
                   <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-xs sm:text-base border-[2px] sm:border-[3px] shadow-[0_4px_15px_rgba(0,0,0,0.6)]"
                        style={{ backgroundColor: color, borderColor: 'rgba(255,255,255,0.9)', color: '#fff' }}>
                     {player.number}
                   </div>
                   {/* Rating badge */}
                   <div className={`absolute -bottom-1 -right-2 sm:-bottom-2 sm:-right-2 backdrop-blur-md text-[8px] sm:text-[10px] font-black px-1 py-0.5 sm:px-1.5 rounded-full border shadow-lg ${ratingColor}`}>
                     {player.rating}
                   </div>
                 </div>
                 {/* Name pill */}
                 <div className="bg-black/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shadow-lg flex flex-col items-center border border-white/10 backdrop-blur-md max-w-[50px] sm:max-w-[70px]">
                   <span className="text-[8px] sm:text-[10px] font-bold text-white truncate w-full text-center">{player.name}</span>
                 </div>
              </div>
           )})}
         </div>
      ))}
    </>
  );
}

// PREMIUM STANDINGS TAB
function StandingsTab({ standingsData, matchLeague }: { standingsData: Record<string, any[]>; matchLeague: string }) {
  // Default to the match league if we have data for it, else Premier League
  const initialLeague = standingsData[matchLeague] ? matchLeague : "Premier League";
  const [selectedLeague, setSelectedLeague] = useState(initialLeague);
  const availableLeagues = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];
  
  const currentStandings = standingsData[selectedLeague] || [];

  return (
    <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-[#B30000]" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Live Standings</h3>
          </div>
          
          {/* League Selector */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
            {availableLeagues.map(league => (
              <button
                key={league}
                onClick={() => setSelectedLeague(league)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedLeague === league
                    ? "bg-[#B30000] text-white shadow-[0_0_10px_rgba(179,0,0,0.5)] border border-red-500/50"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {league}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-black/40 text-[10px] uppercase font-black tracking-widest text-gray-400">
              <th className="px-4 py-4 text-center">#</th>
              <th className="px-2 py-4">Club</th>
              <th className="px-2 py-4 text-center">P</th>
              <th className="px-2 py-4 text-center">GD</th>
              <th className="px-2 py-4 text-center text-white">Pts</th>
              <th className="px-4 py-4 min-w-[120px]">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {currentStandings.map((team: any) => (
              <tr key={team.rank} className="hover:bg-white/[0.03] transition-colors group">
                <td className="px-4 py-4 text-center text-xs font-bold text-gray-500">{team.rank}</td>
                <td className="px-2 py-4">
                  <div className="flex items-center gap-3">
                    <img src={team.logo} alt={team.team} className="w-6 h-6 md:w-8 md:h-8 object-contain drop-shadow-md" />
                    <span className="font-bold text-xs md:text-sm text-white tracking-wide">{team.team}</span>
                  </div>
                </td>
                <td className="px-2 py-4 text-center text-xs text-gray-400">{team.played}</td>
                <td className="px-2 py-4 text-center text-xs text-gray-400">{team.gd}</td>
                <td className="px-2 py-4 text-center text-sm font-black text-white">{team.points}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-1.5">
                    {team.form.map((res: string, idx: number) => (
                      <span key={idx} className={`w-4 h-4 md:w-5 md:h-5 rounded text-[8px] md:text-[10px] flex items-center justify-center font-bold text-white shadow-sm
                        ${res === 'W' ? 'bg-green-500 border border-green-400' : 
                          res === 'D' ? 'bg-gray-500 border border-gray-400' : 
                          'bg-red-500 border border-red-400'}
                      `}>
                        {res}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
   ─────────────────────────────────────────────────────────────*/
export default function LiveCenterPage() {
  const [, params] = useRoute("/live-center/:id");
  const fixtureId = params?.id;
  const [activeTab, setActiveTab] = useState<"overview" | "stats" | "lineups" | "standings" | "banter">("overview");
  const [banterInput, setBanterInput] = useState("");
  const [reactions, setReactions] = useState(FAN_REACTIONS);
  const [userVote, setUserVote] = useState<"home" | "draw" | "away" | null>(null);
  const [pulseGoal, setPulseGoal] = useState(false);
  const [liveMinute, setLiveMinute] = useState(67);
  const banterEndRef = useRef<HTMLDivElement>(null);

  const { data: matches = [] } = useMatches();
  const { data: standings = [] } = useStandings();
  
  const match = matches.find((m: any) => m.id?.toString() === fixtureId) || matches[0];

  // Simulate live minute ticking
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMinute(prev => (prev < 90 ? prev + 1 : prev));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Goal celebration pulse
  useEffect(() => {
    if (pulseGoal) {
      const t = setTimeout(() => setPulseGoal(false), 2000);
      return () => clearTimeout(t);
    }
  }, [pulseGoal]);

  const handleSendBanter = () => {
    if (!banterInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      user: "You 🇰🇪",
      msg: banterInput,
      time: "Just now",
      likes: 0
    };
    setReactions([newMsg, ...reactions]);
    setBanterInput("");
  };

  const tabs = [
    { id: "overview" as const,  label: "Overview",  icon: Info },
    { id: "stats" as const,     label: "Stats",     icon: BarChart3 },
    { id: "lineups" as const,   label: "Lineups",   icon: Users },
    { id: "standings" as const, label: "Standings", icon: ListOrdered },
    { id: "banter" as const,    label: "Banter",    icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pb-20">
      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-50 bg-[#0B0B0B]/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Back + league */}
          <div className="flex items-center gap-3 mb-3">
            <Link href="/matches">
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B30000]">Live</span>
                <div className="w-1.5 h-1.5 bg-[#B30000] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{match?.league || "Premier League"}</span>
              </div>
            </div>
            <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <span className="text-xs font-black text-[#B30000]">{liveMinute}'</span>
            </div>
          </div>

          {/* Scoreboard */}
          <div className={`flex items-center justify-center gap-4 py-3 rounded-2xl transition-all duration-500 ${pulseGoal ? 'bg-[#B30000]/10 ring-2 ring-[#B30000]/40' : ''}`}>
            {/* Home team */}
            <div className="flex-1 flex flex-col items-center gap-2">
              {match?.homeLogo && (
                <img src={match.homeLogo} alt={match.home} className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-lg" />
              )}
              <span className="font-black text-xs md:text-sm uppercase tracking-wider text-center leading-tight">
                {match?.home || "Home"}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 relative shadow-[0_0_30px_rgba(255,255,255,0.03)]">
              <span className="text-4xl md:text-5xl font-black tabular-nums">{match?.homeScore ?? 0}</span>
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-[#B30000]">-</span>
              </div>
              <span className="text-4xl md:text-5xl font-black tabular-nums">{match?.awayScore ?? 0}</span>
            </div>

            {/* Away team */}
            <div className="flex-1 flex flex-col items-center gap-2">
              {match?.awayLogo && (
                <img src={match.awayLogo} alt={match.away} className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-lg" />
              )}
              <span className="font-black text-xs md:text-sm uppercase tracking-wider text-center leading-tight">
                {match?.away || "Away"}
              </span>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex justify-between md:justify-around mt-4 overflow-x-auto hide-scrollbar scroll-smooth snap-x">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`snap-start shrink-0 flex flex-col items-center gap-1.5 px-3 md:px-6 pb-3 transition-all relative ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <tab.icon className={`w-4 h-4 md:w-5 md:h-5 ${activeTab === tab.id ? "text-[#B30000] drop-shadow-[0_0_8px_rgba(179,0,0,0.8)]" : ""}`} />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#B30000] rounded-t-full shadow-[0_0_10px_#B30000]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">

        {/* ━━━━━━ OVERVIEW TAB ━━━━━━ */}
        {activeTab === "overview" && (
          <>
            {/* Quick Prediction */}
            <div className="bg-gradient-to-br from-[#B30000]/15 to-[#1A1A1A] rounded-2xl border border-[#B30000]/20 p-5 relative overflow-hidden group hover:border-[#B30000]/40 transition-colors">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#B30000]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <Target className="w-4 h-4 text-[#B30000]" />
                <span className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">Quick Predict</span>
              </div>
              <p className="text-sm text-gray-300 mb-4 font-medium relative z-10">Who wins this match?</p>
              <div className="grid grid-cols-3 gap-3 relative z-10">
                {[
                  { key: "home" as const, label: match?.home || "Home", pct: 52 },
                  { key: "draw" as const, label: "Draw", pct: 20 },
                  { key: "away" as const, label: match?.away || "Away", pct: 28 },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setUserVote(opt.key)}
                    className={`relative overflow-hidden rounded-xl py-3 text-center font-bold text-sm transition-all border ${
                      userVote === opt.key
                        ? "border-[#B30000] bg-[#B30000]/20 text-white ring-1 ring-[#B30000]/40 scale-105 shadow-[0_0_20px_rgba(179,0,0,0.3)]"
                        : "border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <div className="relative z-10">
                      <div className="text-[10px] md:text-xs truncate px-1 uppercase tracking-wider">{opt.label}</div>
                      <div className={`text-lg md:text-xl font-black mt-1 ${userVote === opt.key ? 'text-[#B30000] drop-shadow-[0_0_5px_rgba(179,0,0,0.8)]' : 'text-gray-500'}`}>
                        {opt.pct}%
                      </div>
                    </div>
                    {userVote === opt.key && (
                      <div className="absolute inset-0 bg-gradient-to-t from-[#B30000]/20 to-transparent animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
              {userVote && (
                <p className="text-center text-xs text-green-400 mt-4 font-black tracking-wide uppercase shadow-green-500/20 drop-shadow-md">
                  ✅ Vote recorded! <span className="text-[#B30000] drop-shadow-[0_0_5px_rgba(179,0,0,0.8)]">+5 pts</span>
                </p>
              )}
            </div>

            {/* Match Timeline */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-gradient-to-r from-white/[0.02] to-transparent">
                <Timer className="w-4 h-4 text-[#B30000]" />
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">Match Timeline</h3>
              </div>
              <div className="p-4 space-y-1">
                {MATCH_EVENTS.map((event, i) => (
                  <div key={i} className="flex items-center gap-3 md:gap-4 py-3 group hover:bg-white/[0.04] rounded-xl px-3 transition-all">
                    <span className="text-xs md:text-sm font-black text-gray-500 w-8 md:w-10 text-right tabular-nums">{event.min}'</span>
                    <EventIcon type={event.type} />
                    <div className="flex-1 min-w-0">
                      {event.type === "goal" && (
                        <p className="text-sm">
                          <span className="font-black text-green-400 drop-shadow-[0_0_3px_rgba(74,222,128,0.5)]">GOAL!</span>{" "}
                          <span className="font-bold text-white">{event.player}</span>
                          {event.assist && <span className="text-gray-500 text-[10px] md:text-xs ml-1">(assist: {event.assist})</span>}
                        </p>
                      )}
                      {event.type === "yellow" && (
                        <p className="text-sm">
                          <span className="font-bold text-yellow-400">Yellow Card</span>{" "}
                          <span className="font-medium text-white">{event.player}</span>
                        </p>
                      )}
                      {event.type === "sub" && (
                        <p className="text-sm text-gray-400 flexItems-center gap-1">
                          <span className="text-blue-400 font-bold">↑</span> {event.playerIn}{" "}
                          <span className="text-red-400 font-bold ml-1">↓</span> {event.playerOut}
                        </p>
                      )}
                    </div>
                    <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-wider px-2 py-1 md:px-3 md:py-1 rounded-sm border ${
                      event.team === "home"
                        ? "border-[#B30000]/30 bg-[#B30000]/10 text-[#B30000]"
                        : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    }`}>
                      {event.team === "home" ? (match?.homeInitial || "H") : (match?.awayInitial || "A")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Fan Pulse */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">Fan Pulse</h3>
              </div>
              <div className="flex gap-2 md:gap-3 overflow-x-auto hide-scrollbar pb-2">
                {[
                  { emoji: "🔥", label: "FIRE", count: 342 },
                  { emoji: "😤", label: "ANGRY", count: 128 },
                  { emoji: "😂", label: "LOL", count: 256 },
                  { emoji: "💀", label: "DEAD", count: 89 },
                  { emoji: "🎯", label: "CLASS", count: 201 },
                ].map(r => (
                  <button
                    key={r.label}
                    className="flex-1 min-w-[60px] flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gradient-to-b from-white/[0.05] to-transparent hover:from-white/[0.1] hover:border-white/20 transition-all border border-white/5 active:scale-95"
                  >
                    <span className="text-2xl md:text-3xl drop-shadow-lg">{r.emoji}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors">{r.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ━━━━━━ STATS TAB ━━━━━━ */}
        {activeTab === "stats" && (
          <div className="bg-[#1A1A1A] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#B30000]" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Match Statistics</h3>
              </div>
            </div>
            
            {/* Team headers */}
            <div className="flex justify-between items-center px-6 py-4 bg-black/40 border-b border-white/5 backdrop-blur-sm sticky top-[120px] z-10">
              <div className="flex items-center gap-3">
                {match?.homeLogo && <img src={match.homeLogo} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-lg" alt="" />}
                <span className="text-xs md:text-sm font-black uppercase text-white tracking-widest">{match?.home || "Home"}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs md:text-sm font-black uppercase text-white tracking-widest">{match?.away || "Away"}</span>
                {match?.awayLogo && <img src={match.awayLogo} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-lg" alt="" />}
              </div>
            </div>
            
            <div className="px-4 md:px-8 pb-8 pt-4 divide-y divide-white/5">
              {MATCH_STATS.map((stat, i) => (
                <StatBar key={i} {...stat} />
              ))}
            </div>
          </div>
        )}

        {/* ━━━━━━ LINEUPS TAB ━━━━━━ */}
        {activeTab === "lineups" && (
          <div className="bg-[#0B0B0B]">
             <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#B30000]" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Starting XI</h3>
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-black flex items-center gap-4">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-green-500"></div> Great (≥8.0)</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-yellow-400"></div> Good (≥7.0)</span>
                </div>
             </div>

             {/* PREMUIM 2D PITCH */}
             <div className="w-full relative rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-gradient-to-b from-[#1a3821] via-[#234d2e] to-[#1a3821]">
                {/* Field Overlay Markings */}
                <div className="absolute inset-0 border-[3px] border-white/20 m-4 rounded outline outline-[1px] outline-white/10 outline-offset-4 pointer-events-none" />
                <div className="absolute top-1/2 left-0 w-full h-[3px] bg-white/20 -translate-y-1/2 pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                <div className="absolute top-1/2 left-1/2 w-24 h-24 border-[3px] border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[inset_0_0_10px_rgba(255,255,255,0.1),0_0_10px_rgba(255,255,255,0.1)]" />
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                
                {/* Penalty Areas */}
                <div className="absolute top-4 left-1/2 w-[50%] h-24 border-[3px] border-white/20 border-t-0 -translate-x-1/2 pointer-events-none" />
                <div className="absolute top-4 left-1/2 w-[25%] h-10 border-[3px] border-white/20 border-t-0 -translate-x-1/2 pointer-events-none" />
                <div className="absolute top-[8rem] left-1/2 w-16 h-8 border-[3px] border-white/20 border-t-0 rounded-b-full -translate-x-1/2 pointer-events-none" />

                <div className="absolute bottom-4 left-1/2 w-[50%] h-24 border-[3px] border-white/20 border-b-0 -translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-4 left-1/2 w-[25%] h-10 border-[3px] border-white/20 border-b-0 -translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-[8rem] left-1/2 w-16 h-8 border-[3px] border-white/20 border-b-0 rounded-t-full -translate-x-1/2 pointer-events-none" />
              
                {/* Pitch Content */}
                <div className="relative z-10 flex flex-col h-[750px] md:h-[900px] py-6">
                  {/* Away Team (Top, attacking down) - GK at top */}
                  <div className="flex-1 flex flex-col justify-between pt-2 pb-12 relative">
                     <div className="absolute top-36 left-4 right-4 text-center opacity-10 pointer-events-none">
                       <img src={match?.awayLogo || CLUB_LOGOS["Chelsea"]} className="w-48 h-48 mx-auto" alt="" />
                     </div>
                     <PitchHalf lineup={AWAY_LINEUP} color={match?.awayColor || "#034694"} direction="down" />
                  </div>
                  
                  {/* Home Team (Bottom, attacking up) - GK at bottom */}
                  <div className="flex-1 flex flex-col justify-between pb-2 pt-12 relative">
                     <div className="absolute bottom-36 left-4 right-4 text-center opacity-10 pointer-events-none">
                       <img src={match?.homeLogo || CLUB_LOGOS["Arsenal"]} className="w-48 h-48 mx-auto" alt="" />
                     </div>
                     <PitchHalf lineup={HOME_LINEUP} color={match?.homeColor || "#B30000"} direction="up" />
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* ━━━━━━ STANDINGS TAB ━━━━━━ */}
        {activeTab === "standings" && (() => {
           // We need a local state variable for the selected league inside the render, 
           // but since we want to avoid breaking rules of hooks inside conditional renders,
           // we'll define the state variable at the top level of the component and use it here.
           // However, to keep it simple, we'll just extract this to a local constant. 
           // Wait, we defined the state variables up top. Let's add the selected league state.
           return (
             <StandingsTab 
               standingsData={standings} 
               matchLeague={match?.league || "Premier League"} 
             />
           );
        })()}

        {/* ━━━━━━ BANTER TAB ━━━━━━ */}
        {activeTab === "banter" && (
          <div className="space-y-4">
            {/* Input */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 p-4 shadow-lg sticky top-[100px] z-20 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">Drop your take</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={banterInput}
                  onChange={e => setBanterInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendBanter()}
                  placeholder="Talk your talk..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#B30000]/40 focus:border-[#B30000]/40 transition-all shadow-inner"
                />
                <button
                  onClick={handleSendBanter}
                  className="bg-[#B30000] hover:bg-red-700 text-white px-5 py-3 rounded-xl transition-all active:scale-95 shrink-0 shadow-[0_0_15px_rgba(179,0,0,0.5)] border border-[#ff4444]/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feed */}
            <div className="space-y-3 pt-2">
              {reactions.map(r => (
                <div
                  key={r.id}
                  className="bg-[#1A1A1A] rounded-2xl border border-white/5 p-4 md:p-5 hover:border-white/10 hover:bg-white/[0.02] transition-all shadow-md group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#B30000] to-orange-600 rounded-full flex items-center justify-center text-sm font-black shrink-0 shadow-lg border border-white/10">
                      {r.user.substring(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm md:text-base font-bold text-white tracking-wide">{r.user}</span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{r.time}</span>
                      </div>
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed font-medium">{r.msg}</p>
                      <div className="flex items-center gap-6 mt-3">
                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#B30000] transition-colors text-xs font-bold group/btn">
                          <Heart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span>{r.likes}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-400 transition-colors text-xs font-bold group/btn">
                          <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div ref={banterEndRef} />
          </div>
        )}

        {/* ── PROMO CARD ── */}
        <div className="rounded-2xl bg-gradient-to-r from-[#B30000]/20 via-[#B30000]/10 to-transparent p-6 md:p-8 border border-[#B30000]/20 flex items-center justify-between shadow-[0_0_30px_rgba(179,0,0,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B30000]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#B30000]/20 transition-colors pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-[#B30000] drop-shadow-[0_0_5px_rgba(179,0,0,0.8)]" />
              <h4 className="font-black uppercase tracking-[0.2em] text-sm md:text-lg">Predict & Win!</h4>
            </div>
            <p className="text-xs md:text-sm text-gray-400 font-medium">Climb the leaderboard and win exclusive rewards.</p>
          </div>
          <Link href="/predictions">
            <button className="relative z-10 bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Predict
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
