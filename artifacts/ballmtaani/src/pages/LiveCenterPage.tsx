import { useState, useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import {
  ChevronLeft, MessageSquare, Info, BarChart3, Users,
  Flame, Heart, Trophy, Target, Timer, Zap,
  Send, TrendingUp, Shield, ListOrdered,
  Activity, Crown
} from "lucide-react";
import { useMatches, useStandings, useFixtureDetail } from "../hooks/useData";
import { useAuth } from "../context/AuthContext";
import { UserBadge } from "../components/UserBadge";

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
  { id: 1, user: "Ochieng 🇰🇪",   msg: "SAKA IS DIFFERENT GRAVY 🔥🔥🔥",        time: "2m ago", likes: 124, interactions: 1200, isHot: true },
  { id: 2, user: "Adebayo 🇳🇬",   msg: "Chelsea fans leaving the stadium already 😂", time: "3m ago", likes: 18, interactions: 450 },
  { id: 3, user: "Wanjiku 🇰🇪",   msg: "Martinelli goal was INSANE!!",                time: "5m ago", likes: 31, interactions: 85 },
  { id: 4, user: "Sipho 🇿🇦",     msg: "Rice controlling the whole midfield 💪",      time: "6m ago", likes: 12, interactions: 12 },
  { id: 5, user: "KamauFC 🇰🇪",   msg: "Palmer best signing of the year though 👀",   time: "8m ago", likes: 89, interactions: 320, isHot: true },
  { id: 6, user: "Musa 🇬🇭",      msg: "This game is ELITE content 🍿",               time: "10m ago", likes: 15, interactions: 55 },
];

const SIMULATED_BANTER = [
  { user: "Kiplagat 🇰🇪", msg: "This referee is definitely a Blue fan! 🤡", interactions: 45 },
  { user: "Dube 🇿🇦", msg: "Imagine thinking Arsenal won't bottle this. I've seen this movie before.", interactions: 210 },
  { user: "Mensah 🇬🇭", msg: "Saka just sent that defender back to the academy 💀", interactions: 890 },
  { user: "Njeri 🇰🇪", msg: "WHERE IS JACKSON?? Is he even on the pitch? 😂", interactions: 12 },
  { user: "Okafor 🇳🇬", msg: "London is Red. End of debate.", interactions: 560 },
  { user: "Tau 🇿🇦", msg: "Chelsea need a proper #9. This is painful to watch.", interactions: 34 },
  { user: "Zuma 🇿🇦", msg: "NFS! Mtaani we are watching history today boys!", interactions: 120 },
  { user: "Atieno 🇰🇪", msg: "My bet is on a 90+ minute winner. COYG!! 🔴⚪", interactions: 450 },
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
    <div className="py-4 hover:bg-white/[0.04] transition-colors rounded-2xl px-4 group">
      <div className="flex justify-between items-end mb-3">
        <span className={`text-xl md:text-3xl font-black tabular-nums transition-all duration-300 ${homeWins ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] scale-110' : 'text-gray-500 group-hover:text-gray-400'}`}>
          {home}{unit || ""}
        </span>
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-gray-400 pb-1 group-hover:text-white transition-colors">{label}</span>
        <span className={`text-xl md:text-3xl font-black tabular-nums transition-all duration-300 ${awayWins ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] scale-110' : 'text-gray-500 group-hover:text-gray-400'}`}>
          {away}{unit || ""}
        </span>
      </div>
      <div className="flex gap-2 h-4 md:h-5 rounded-full overflow-hidden bg-black/60 border border-white/10 relative shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
        <div
          className="rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{
            width: `${homePct}%`,
            background: homeWins ? "linear-gradient(90deg, #990000, #ff4444)" : "#333",
            boxShadow: homeWins ? "0 0 15px rgba(255,0,0,0.8)" : "none"
          }}
        >
          {homeWins && (
            <>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/40 to-transparent animate-pulse" />
            </>
          )}
        </div>
        <div
          className="rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{
            width: `${awayPct}%`,
            background: awayWins ? "linear-gradient(270deg, #1d4ed8, #60a5fa)" : "#333",
            boxShadow: awayWins ? "0 0 15px rgba(59,130,246,0.8)" : "none"
          }}
        >
          {awayWins && (
            <>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-white/40 to-transparent animate-pulse" />
            </>
          )}
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
function PitchHalf({ lineup, color, direction }: { lineup: { formation: string; players: any[] }, color: string, direction: 'up' | 'down' }) {
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
              const ratingColor = player.rating >= 8.0 ? "border-green-400 text-green-400 bg-green-950/80 shadow-[0_0_10px_rgba(74,222,128,0.8)]" : 
                                  player.rating >= 7.0 ? "border-yellow-400 text-yellow-400 bg-yellow-950/80 shadow-[0_0_10px_rgba(250,204,21,0.8)]" : 
                                  "border-gray-500 text-gray-400 bg-gray-950/80 shadow-[0_0_5px_rgba(156,163,175,0.5)]";
              return (
              <div key={player.number} className="flex flex-col items-center group cursor-pointer transition-all duration-300 hover:scale-125 z-20 hover:z-30">
                 {/* Jersey node */}
                 <div className="relative mb-1">
                   {/* Premium Jersey rendering */}
                   <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-black text-sm sm:text-lg shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.4)] border border-white/20 transition-all group-hover:shadow-[0_0_30px_currentColor]"
                        style={{ background: `radial-gradient(circle at top left, ${color} 0%, #000 120%)`, color: '#fff' }}>
                     {player.number}
                   </div>
                   {/* Rating badge */}
                   <div className={`absolute -bottom-2 -right-3 backdrop-blur-md text-[9px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-full border ${ratingColor}`}>
                     {player.rating}
                   </div>
                 </div>
                 {/* Name pill */}
                 <div className="bg-black/90 px-2 py-1 rounded-lg flex flex-col items-center border border-white/10 backdrop-blur-md max-w-[60px] sm:max-w-[80px] shadow-2xl mt-1">
                   <span className="text-[9px] sm:text-[11px] font-bold text-white truncate w-full text-center tracking-wide">{player.name}</span>
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
import { getUserTier } from "../lib/tiers";
import { useProfile } from "../hooks/useData";

export default function LiveCenterPage() {
  const [, params] = useRoute("/live-center/:id");
  const fixtureId = params?.id;
  const { isLoggedIn, coins, updateCoins } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "stats" | "lineups" | "standings" | "banter">("overview");

  // Flash Bounty State
  const [bountyState, setBountyState] = useState<"active" | "placed" | "won" | "lost">("active");
  const [selectedOption, setSelectedOption] = useState<"yes" | "no" | null>(null);
  const bountyWager = 50;
  const bountyReward = 200;

  const handlePlaceBounty = (option: "yes" | "no") => {
    if (!isLoggedIn) {
      alert("Please log in to participate in Flash Bounties.");
      return;
    }
    if (coins < bountyWager) {
      alert("Not enough coins! Visit the Store to top up.");
      return;
    }
    setSelectedOption(option);
    updateCoins(-bountyWager);
    setBountyState("placed");

    // Simulate outcome
    setTimeout(() => {
      setBountyState("won");
      updateCoins(bountyReward); // Demo dopamine hit
    }, 5000);
  };
  const [banterInput, setBanterInput] = useState("");
  const [reactions, setReactions] = useState(FAN_REACTIONS);
  const [userVote, setUserVote] = useState<"home" | "draw" | "away" | null>(null);
  const [pulseGoal, setPulseGoal] = useState(false);
  const [liveMinute, setLiveMinute] = useState(67);
  const [hasEarnedBanterCoins, setHasEarnedBanterCoins] = useState(false);
  const [showCoinPop, setShowCoinPop] = useState(false);
  const banterEndRef = useRef<HTMLDivElement>(null);

  // Vibe state
  const vibes = ["Toxic 🤬", "Hype 🔥", "Nervous 😰", "Elite 🍿"];
  const [currentVibe, setCurrentVibe] = useState(vibes[1]);

  // Use real-time profiles
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  // Simulated Banter Feed Implementation
  useEffect(() => {
    if (activeTab !== "banter") return;

    const bannerInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * SIMULATED_BANTER.length);
      const simulated = SIMULATED_BANTER[randomIndex];
      
      const newMsg = {
        id: Date.now(),
        user: simulated.user,
        msg: simulated.msg,
        time: "Just now",
        likes: Math.floor(Math.random() * 20),
        interactions: simulated.interactions,
        isHot: Math.random() > 0.8
      };

      setReactions(prev => [newMsg, ...prev.slice(0, 15)]); // Keep feed clean
      
      // Occasionally shift the vibe
      if (Math.random() > 0.7) {
        setCurrentVibe(vibes[Math.floor(Math.random() * vibes.length)]);
      }
    }, 4000); // New message every 4 seconds

    return () => clearInterval(bannerInterval);
  }, [activeTab]);

  const { data: matches = [] } = useMatches();
  const { data: standings = {} as Record<string, any[]> } = useStandings();
  
  const match = matches.find((m: any) => m.id?.toString() === fixtureId) || matches[0];

  // Fetch real match detail (stats, events, lineups) from API-Football
  const { data: fixtureDetail } = useFixtureDetail(fixtureId);

  // Use real API data if available, otherwise fall back to mock constants
  const matchStats = (fixtureDetail?.stats && fixtureDetail.stats.length > 0)
    ? fixtureDetail.stats
    : MATCH_STATS;

  const matchEvents = (fixtureDetail?.events && fixtureDetail.events.length > 0)
    ? fixtureDetail.events
    : MATCH_EVENTS;

  const homeLineup = (fixtureDetail?.lineups?.home)
    ? fixtureDetail.lineups.home
    : HOME_LINEUP;

  const awayLineup = (fixtureDetail?.lineups?.away)
    ? fixtureDetail.lineups.away
    : AWAY_LINEUP;

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
    return undefined;
  }, [pulseGoal]);

  const handleSendBanter = () => {
    if (!banterInput.trim()) return;
    
    // Reward Coins for first banter
    if (!hasEarnedBanterCoins && isLoggedIn) {
      updateCoins(5);
      setHasEarnedBanterCoins(true);
      setShowCoinPop(true);
      setTimeout(() => setShowCoinPop(false), 3000);
    }

    const newMsg = {
      id: Date.now(),
      user: profile?.username || "You 🇰🇪",
      msg: banterInput,
      time: "Just now",
      likes: 0,
      interactions: profile?.interactions || 0,
      isHot: false
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
      {/* ── STICKY HERO HEADER ── */}
      <div 
        className="sticky top-0 z-50 transition-all duration-300 shadow-2xl overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, ${match?.homeColor || '#B30000'}33 0%, #0B0B0B 100%)`,
          borderBottom: `1px solid ${match?.homeColor || '#B30000'}40`
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl"></div>
        
        {/* Abstract glowing orbs */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 opacity-30 mix-blend-screen" style={{ backgroundColor: match?.homeColor || '#B30000' }}></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 opacity-30 mix-blend-screen" style={{ backgroundColor: match?.awayColor || '#1E6FFF' }}></div>

        <div className="max-w-4xl mx-auto px-4 py-3 relative z-10">
          {/* Back + league */}
          <div className="flex items-center gap-3 mb-2">
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

          {/* Scoreboard block */}
          <div className={`flex items-center justify-center gap-4 py-3 rounded-2xl transition-all duration-500 my-2 ${pulseGoal ? `bg-[${match?.homeColor || '#B30000'}]/20 ring-2 ring-[${match?.homeColor || '#B30000'}]/60` : ''}`}>
            {/* Home team */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="relative group perspective-1000">
                <div className="absolute inset-0 bg-white/20 blur-xl scale-150 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                {match?.homeLogo && (
                  <img src={match.homeLogo} alt={match.home} className="w-14 h-14 md:w-20 md:h-20 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-transform duration-500 relative z-10" />
                )}
              </div>
              <span className="font-black text-xs md:text-sm uppercase tracking-[0.2em] text-center leading-tight">
                {match?.home || "Home"}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center justify-center px-4 md:px-8 py-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-3 md:gap-5">
                <span className="text-4xl md:text-6xl font-black tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{match?.homeScore ?? 0}</span>
                <span className="text-xl md:text-3xl font-black text-[#B30000] drop-shadow-[0_0_10px_rgba(179,0,0,0.8)] animate-pulse">-</span>
                <span className="text-4xl md:text-6xl font-black tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{match?.awayScore ?? 0}</span>
              </div>
            </div>

            {/* Away team */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="relative group perspective-1000">
                <div className="absolute inset-0 bg-white/20 blur-xl scale-150 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                {match?.awayLogo && (
                  <img src={match.awayLogo} alt={match.away} className="w-14 h-14 md:w-20 md:h-20 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-transform duration-500 relative z-10" />
                )}
              </div>
              <span className="font-black text-xs md:text-sm uppercase tracking-[0.2em] text-center leading-tight">
                {match?.away || "Away"}
              </span>
            </div>
          </div>

          {/* Floating Glassmorphism Tab Navigation */}
          <div className="flex justify-center mt-2 px-2 pb-2">
            <div className="flex overflow-x-auto hide-scrollbar scroll-smooth snap-x bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-fit mx-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`snap-center shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 relative ${
                    activeTab === tab.id
                      ? "text-white bg-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 ${activeTab === tab.id ? `text-[${match?.homeColor || '#B30000'}] drop-shadow-[0_0_5px_${match?.homeColor || '#B30000'}] scale-110` : ""}`} style={{ color: activeTab === tab.id ? (match?.homeColor || '#B30000') : undefined }} />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em]">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-[2px] rounded-t-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: match?.homeColor || '#B30000' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">

        {/* ━━━━━━ FLASH BOUNTY ━━━━━━ */}
        {bountyState !== "lost" && (
          <div className="bg-[#111] rounded-2xl border-2 border-orange-500/50 p-1 shadow-[0_0_30px_rgba(249,115,22,0.2)] overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[80px] pointer-events-none mix-blend-screen" />
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-orange-600/20 blur-[60px] pointer-events-none mix-blend-screen" />
            
            <div className="bg-black/80 backdrop-blur-md rounded-xl p-5 md:p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Live Flash Bounty</h3>
                </div>
                <div className="bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10 text-orange-400 flex items-center gap-2">
                  <Timer className="w-3 h-3" /> Closes in 2:45
                </div>
              </div>

              {bountyState === "active" && (
                <>
                  <p className="text-base md:text-lg font-bold text-gray-200 mb-6 drop-shadow-md">
                    Will a goal be scored in the next 10 minutes?
                  </p>
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="w-full md:w-auto flex items-center gap-3">
                      <button 
                        onClick={() => handlePlaceBounty("yes")}
                        className="flex-1 md:flex-none bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:-translate-y-1"
                      >
                        Yes
                      </button>
                      <button 
                        onClick={() => handlePlaceBounty("no")}
                        className="flex-1 md:flex-none bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:-translate-y-1"
                      >
                        No
                      </button>
                    </div>

                    <div className="flex items-center gap-6 bg-black/50 p-3 rounded-xl border border-white/5">
                      <div>
                        <span className="block text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-1">To Win</span>
                        <span className="font-black text-xl text-yellow-400 drop-shadow-[0_0_5px_currentColor]">{bountyReward} MTC</span>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div>
                        <span className="block text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-1">Wager</span>
                        <span className="font-black text-xl text-white">{bountyWager} MTC</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {bountyState === "placed" && (
                <div className="flex flex-col items-center justify-center py-6 animate-pulse">
                  <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                  <p className="font-black uppercase tracking-widest text-[#FFD700] drop-shadow-md">Bet Locked! Awaiting result...</p>
                  <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">You chose: <span className="text-white">{selectedOption}</span></p>
                </div>
              )}

              {bountyState === "won" && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 text-center shadow-[inset_0_0_30px_rgba(34,197,94,0.2)]">
                  <Trophy className="w-12 h-12 mx-auto text-green-400 mb-3 drop-shadow-[0_0_10px_currentColor]" />
                  <h4 className="text-3xl font-black uppercase tracking-widest text-green-400 drop-shadow-[0_0_15px_currentColor] mb-2">Bounty Won!</h4>
                  <p className="text-lg font-bold text-white uppercase tracking-widest">+{bountyReward} MTC Added to Wallet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ━━━━━━ OVERVIEW TAB ━━━━━━ */}
        {activeTab === "overview" && (
          <>
            {/* Quick Prediction */}
            <div className="bg-[#111111] rounded-[2rem] border border-white/5 p-6 relative overflow-hidden group transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#B30000]/10 via-transparent to-[#1E6FFF]/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <Target className="w-5 h-5 text-[#B30000] drop-shadow-[0_0_8px_rgba(179,0,0,0.8)]" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Quick Predict</span>
              </div>
              <p className="text-sm text-gray-400 mb-6 font-medium relative z-10">Who wins this match?</p>
              <div className="grid grid-cols-3 gap-3 relative z-10">
                {[
                  { key: "home" as const, label: match?.home || "Home", pct: 52 },
                  { key: "draw" as const, label: "Draw", pct: 20 },
                  { key: "away" as const, label: match?.away || "Away", pct: 28 },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setUserVote(opt.key)}
                    className={`relative overflow-hidden rounded-xl py-4 text-center font-bold text-sm transition-all duration-300 border backdrop-blur-md ${
                      userVote === opt.key
                        ? `border-[${match?.homeColor || '#B30000'}] bg-[${match?.homeColor || '#B30000'}]/20 text-white ring-1 ring-[${match?.homeColor || '#B30000'}]/50 scale-105 shadow-[0_0_20px_${match?.homeColor || '#B30000'}40]`
                        : "border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:bg-white/10 hover:-translate-y-1 shadow-lg"
                    }`}
                  >
                    <div className="relative z-10">
                      <div className="text-[10px] md:text-wrap truncate px-2 uppercase tracking-widest leading-tight h-8 flex items-center justify-center font-black opacity-80">{opt.label}</div>
                      <div className={`text-xl md:text-2xl font-black mt-2 ${userVote === opt.key ? `text-[${match?.homeColor || '#B30000'}] drop-shadow-[0_0_8px_currentColor]` : 'text-gray-400 group-hover:text-white transition-colors'}`}>
                        {opt.pct}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {userVote && (
                <p className="text-center text-[10px] md:text-xs text-green-400 mt-5 font-black tracking-[0.2em] uppercase drop-shadow-[0_0_5px_rgba(74,222,128,0.5)] animate-pulse">
                  ✅ Vote recorded! <span className="text-[#FFD700] ml-2 drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]">+5 pts</span>
                </p>
              )}
            </div>

            {/* Match Timeline */}
            <div className="bg-[#111111] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl relative">
              <div className="absolute left-[44px] top-16 bottom-6 w-0.5 bg-gradient-to-b from-[#B30000] via-white/10 to-[#1E6FFF] opacity-50 z-0 hidden md:block" />
              
              <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent relative z-10">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Match Timeline</h3>
                </div>
              </div>
              <div className="p-4 md:p-6 space-y-2 relative z-10">
                {matchEvents.map((event: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 md:gap-6 py-3 md:py-4 group hover:bg-white/[0.03] rounded-2xl px-3 transition-colors relative">
                    <span className="text-sm md:text-base font-black text-white w-8 md:w-10 text-right tabular-nums drop-shadow-md">{event.min}'</span>
                    <div className="relative group-hover:scale-125 transition-transform duration-300">
                      <EventIcon type={event.type} />
                      <div className="absolute inset-0 bg-white/20 blur-md rounded-full -z-10 opacity-0 group-hover:opacity-100" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      {event.type === "goal" && (
                        <div>
                          <p className="text-base font-bold text-white leading-tight">{event.player}</p>
                          <p className="text-[10px] md:text-xs text-green-400 font-black tracking-widest uppercase mt-0.5 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                            GOAL! {event.assist && <span className="text-gray-500 font-bold ml-1 tracking-normal lowercase">(assist: {event.assist})</span>}
                          </p>
                        </div>
                      )}
                      {event.type === "yellow" && (
                        <div>
                          <p className="text-base font-bold text-white leading-tight">{event.player}</p>
                          <p className="text-[10px] md:text-xs text-yellow-400 font-black tracking-widest uppercase mt-0.5">Yellow Card</p>
                        </div>
                      )}
                      {event.type === "red" && (
                        <div>
                          <p className="text-base font-bold text-white leading-tight">{event.player}</p>
                          <p className="text-[10px] md:text-xs text-red-500 font-black tracking-widest uppercase mt-0.5 animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">Red Card</p>
                        </div>
                      )}
                      {event.type === "sub" && (
                        <div>
                          <p className="text-sm text-gray-300 flex items-center gap-1.5 font-bold">
                            <span className="text-green-400">↑ {event.playerIn}</span>
                          </p>
                          <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1.5 font-medium mt-0.5">
                            <span className="text-red-400">↓ {event.playerOut}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] ml-auto font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border shadow-lg ${
                      event.team === "home"
                        ? `border-[${match?.homeColor || '#B30000'}]/30 bg-[${match?.homeColor || '#B30000'}]/10 text-[${match?.homeColor || '#B30000'}] drop-shadow-[0_0_5px_${match?.homeColor || '#B30000'}]`
                        : `border-[${match?.awayColor || '#1E6FFF'}]/30 bg-[${match?.awayColor || '#1E6FFF'}]/10 text-[${match?.awayColor || '#1E6FFF'}]`
                    }`}>
                      {event.team === "home" ? (match?.homeInitial || "H") : (match?.awayInitial || "A")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Fan Pulse */}
            <div className="bg-[#111111] rounded-[2rem] border border-white/5 p-6 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/10 blur-[40px] pointer-events-none rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-screen" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Fan Pulse</h3>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Reactions</span>
              </div>
              <div className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar pb-2 relative z-10">
                {[
                  { emoji: "🔥", label: "FIRE", count: 342, glow: "rgba(249,115,22,0.5)" },
                  { emoji: "😤", label: "ANGRY", count: 128, glow: "rgba(239,68,68,0.5)" },
                  { emoji: "😂", label: "LOL", count: 256, glow: "rgba(234,179,8,0.5)" },
                  { emoji: "💀", label: "DEAD", count: 89, glow: "rgba(255,255,255,0.4)" },
                  { emoji: "🎯", label: "CLASS", count: 201, glow: "rgba(59,130,246,0.5)" },
                ].map(r => (
                  <button
                    key={r.label}
                    className="flex-1 min-w-[70px] flex flex-col items-center gap-2 py-4 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent hover:from-white/[0.1] border border-white/5 active:scale-95 transition-all duration-300 group/btn hover:-translate-y-2 shadow-lg"
                  >
                    <span 
                      className="text-3xl md:text-4xl transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:-rotate-12"
                      style={{ filter: `drop-shadow(0 0 10px ${r.glow})` }}
                    >
                      {r.emoji}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover/btn:text-white transition-colors">{r.count}</span>
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
              {matchStats.map((stat: any, i: number) => (
                <StatBar key={i} {...stat} />
              ))}
            </div>
          </div>
        )}

        {/* ━━━━━━ LINEUPS TAB ━━━━━━ */}
        {activeTab === "lineups" && (
          <div className="bg-[#111111] p-1 md:p-3 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#1E6FFF]/5 to-[#B30000]/5 pointer-events-none" />
             <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-6 pt-4 relative z-10">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Starting XI</h3>
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-black flex items-center gap-4 bg-black/40 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div> Great (≥8.0)</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div> Good (≥7.0)</span>
                </div>
             </div>

             {/* PREMUIM 2D PITCH - HIGH-TECH TACTICAL BOARD */}
             <div className="w-full relative rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#0A1A12] via-[#0D2418] to-[#0A1A12]">
                
                {/* Tech Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {/* Glowing Field Overlay Markings */}
                <div className="absolute inset-0 border-[2px] border-[#3B82F6]/30 m-4 rounded outline outline-[1px] outline-[#3B82F6]/20 outline-offset-4 pointer-events-none shadow-[inset_0_0_30px_rgba(59,130,246,0.1)]" />
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#3B82F6]/30 -translate-y-1/2 pointer-events-none shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <div className="absolute top-1/2 left-1/2 w-28 h-28 border-[2px] border-[#3B82F6]/30 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[inset_0_0_20px_rgba(59,130,246,0.1),0_0_20px_rgba(59,130,246,0.2)]" />
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#3B82F6]/60 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                
                {/* Penalty Areas */}
                <div className="absolute top-4 left-1/2 w-[55%] h-28 border-[2px] border-[#3B82F6]/30 border-t-0 -translate-x-1/2 pointer-events-none bg-gradient-to-b from-[#3B82F6]/5 to-transparent" />
                <div className="absolute top-4 left-1/2 w-[30%] h-12 border-[2px] border-[#3B82F6]/30 border-t-0 -translate-x-1/2 pointer-events-none" />
                <div className="absolute top-[8rem] left-1/2 w-20 h-10 border-[2px] border-[#3B82F6]/30 border-t-0 rounded-b-full -translate-x-1/2 pointer-events-none" />

                <div className="absolute bottom-4 left-1/2 w-[55%] h-28 border-[2px] border-[#3B82F6]/30 border-b-0 -translate-x-1/2 pointer-events-none bg-gradient-to-t from-[#3B82F6]/5 to-transparent" />
                <div className="absolute bottom-4 left-1/2 w-[30%] h-12 border-[2px] border-[#3B82F6]/30 border-b-0 -translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-[8rem] left-1/2 w-20 h-10 border-[2px] border-[#3B82F6]/30 border-b-0 rounded-t-full -translate-x-1/2 pointer-events-none" />
              
                {/* Pitch Content */}
                <div className="relative z-10 flex flex-col h-[800px] md:h-[900px] py-8">
                  {/* Away Team (Top, attacking down) - GK at top */}
                  <div className="flex-1 flex flex-col justify-between pt-4 pb-12 relative">
                     <div className="absolute top-36 left-4 right-4 text-center opacity-[0.03] pointer-events-none mix-blend-screen overflow-hidden">
                       <img src={match?.awayLogo || "/placeholder-logo.png"} className="w-64 h-64 mx-auto scale-150 blur-sm" alt="" />
                     </div>
                     <PitchHalf lineup={awayLineup} color={match?.awayColor || "#034694"} direction="down" />
                  </div>
                  
                  {/* Home Team (Bottom, attacking up) - GK at bottom */}
                  <div className="flex-1 flex flex-col justify-between pb-4 pt-12 relative">
                     <div className="absolute bottom-36 left-4 right-4 text-center opacity-[0.03] pointer-events-none mix-blend-screen overflow-hidden">
                       <img src={match?.homeLogo || "/placeholder-logo.png"} className="w-64 h-64 mx-auto scale-150 blur-sm" alt="" />
                     </div>
                     <PitchHalf lineup={homeLineup} color={match?.homeColor || "#B30000"} direction="up" />
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* ━━━━━━ STANDINGS TAB ━━━━━━ */}
        {activeTab === "standings" && (
          <StandingsTab 
            standingsData={standings} 
            matchLeague={match?.league || "Premier League"} 
          />
        )}

        {/* ━━━━━━ BANTER TAB ━━━━━━ */}
        {activeTab === "banter" && (
          <div className="space-y-4">
            {/* Banter Header Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/30">
                    <Activity className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-black text-gray-500 tracking-widest">Match Vibe</span>
                    <span className="font-black text-white text-sm">{currentVibe}</span>
                  </div>
                </div>
                <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-2/3 animate-pulse"></div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 p-4 flex items-center gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center border border-[#FFD700]/30">
                  <Crown className="w-5 h-5 text-[#FFD700]" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-black text-gray-500 tracking-widest">Top Banter</span>
                  <span className="font-black text-white text-sm">Ochieng 🇰🇪</span>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="bg-black/60 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] sticky top-[100px] z-20 overflow-hidden">
              {showCoinPop && (
                <div className="absolute top-0 left-0 w-full h-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-30 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center gap-3 bg-black border border-green-500/50 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                    <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <span className="font-black text-white uppercase tracking-widest text-sm">+5 MTAANI COINS EARNED!</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Drop your take</span>
              </div>
              <div className="flex gap-3 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[${match?.homeColor || '#B30000'}]/10 to-transparent rounded-2xl pointer-events-none" />
                <input
                  type="text"
                  value={banterInput}
                  onChange={e => setBanterInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendBanter()}
                  placeholder="Talk your talk..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm md:text-base text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B30000]/50 focus:border-[#B30000]/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] relative z-10 font-medium"
                />
                <button
                  onClick={handleSendBanter}
                  className={`bg-gradient-to-br from-[${match?.homeColor || '#B30000'}] to-[${match?.awayColor || '#1E6FFF'}] text-white px-6 md:px-8 py-4 rounded-2xl transition-all active:scale-95 shrink-0 shadow-[0_0_20px_rgba(179,0,0,0.5)] border border-white/20 relative z-10 hover:shadow-[0_0_30px_currentColor] hover:-translate-y-1`}
                >
                  <Send className="w-5 h-5 drop-shadow-md" />
                </button>
              </div>
            </div>

            {/* Feed */}
            <div className="space-y-4 pt-4">
              {reactions.map((r, i) => (
                  <div className={`bg-[#111111] rounded-[2rem] border ${r.isHot ? 'border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.15)] bg-gradient-to-br from-orange-500/5 to-transparent' : 'border-white/5'} p-5 md:p-6 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 shadow-xl group animate-in slide-in-from-bottom-4 fade-in duration-500 relative overflow-hidden`}
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  {r.isHot && (
                    <div className="absolute top-4 right-6 flex items-center gap-1.5 bg-orange-500 text-black px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                      <Flame className="w-3 h-3 fill-current" />
                      Hot Take
                    </div>
                  )}
                  <div className="flex items-start gap-4 md:gap-5">
                    <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[${match?.homeColor || '#B30000'}] to-orange-600 rounded-full flex items-center justify-center text-base font-black shrink-0 shadow-[0_0_15px_rgba(179,0,0,0.4)] border border-white/20`}>
                      {r.user.substring(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm md:text-base font-black text-white tracking-widest uppercase">{r.user}</span>
                          <UserBadge interactions={r.interactions || 0} showLabel={false} className="scale-75 origin-left" />
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{r.time}</span>
                      </div>
                      <p className="text-base md:text-lg text-gray-300 leading-relaxed font-medium">{r.msg}</p>
                      <div className="flex items-center gap-8 mt-4 pt-4 border-t border-white/5">
                        <button className="flex items-center gap-2 text-gray-500 hover:text-[#B30000] transition-colors text-xs font-black uppercase tracking-widest group/btn">
                          <Heart className="w-5 h-5 group-hover/btn:scale-125 transition-transform duration-300 group-hover/btn:fill-[#B30000]" />
                          <span className="group-hover/btn:text-white transition-colors">{r.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-[#1E6FFF] transition-colors text-xs font-black uppercase tracking-widest group/btn">
                          <MessageSquare className="w-5 h-5 group-hover/btn:scale-125 transition-transform duration-300 group-hover/btn:fill-[#1E6FFF]/20" />
                          <span className="group-hover/btn:text-white transition-colors">Reply</span>
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
