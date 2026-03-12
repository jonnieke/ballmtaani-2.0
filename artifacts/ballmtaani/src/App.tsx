import { useState } from "react";
import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <div className="min-h-screen bg-[#0B0B0B] text-white font-sans overflow-x-hidden">
          <Navbar />
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/predict" component={PredictPage} />
            <Route path="/debate" component={DebatePage} />
            <Route path="/leaderboard" component={LeaderboardPage} />
            <Route component={NotFound} />
          </Switch>
          <Footer />
        </div>
      </WouterRouter>
    </QueryClientProvider>
  );
}

function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/predict", label: "Predict" },
    { href: "/debate", label: "Debate" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0B0B]/95 backdrop-blur border-b border-[#1B1B1B]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-black tracking-widest text-white uppercase">
            Ball<span className="text-[#B30000]">Mtaani</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-1.5 rounded font-bold text-sm uppercase tracking-wider transition-all ${
                location === l.href
                  ? "bg-[#B30000] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-white transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-6 bg-white transition-all ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-white transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-[#1B1B1B] px-4 py-2 space-y-1 bg-[#0B0B0B]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded font-bold text-sm uppercase tracking-wider transition-all ${
                location === l.href
                  ? "bg-[#B30000] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="px-4 py-8 bg-[#0B0B0B]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          <AIPredictionCard compact />
          <FanDebateCard compact />
          <LeaderboardCard compact />
          <BanterCard />
        </div>
      </div>
    </>
  );
}

function HeroSection() {
  return (
    <div
      className="w-full flex flex-col items-center justify-center text-center py-12 px-4"
      style={{
        background: "linear-gradient(160deg, #1a0000 0%, #0B0B0B 50%, #00051a 100%)",
        minHeight: "300px",
      }}
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="h-1 w-10 bg-[#B30000]" />
        <h1
          className="text-5xl md:text-7xl font-black tracking-widest text-white uppercase"
          style={{ textShadow: "2px 2px 12px rgba(0,0,0,0.9), 0 0 40px rgba(179,0,0,0.4)" }}
        >
          BALLMTAANI
        </h1>
        <div className="h-1 w-10 bg-[#B30000]" />
      </div>
      <p
        className="text-xl md:text-2xl font-bold italic tracking-wide mb-6"
        style={{
          background: "linear-gradient(90deg, #FFD700, #FF6B00, #FFD700)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Predict. Debate. Banter!
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/predict"
          className="px-6 py-2.5 bg-[#B30000] hover:bg-red-700 text-white font-bold rounded uppercase tracking-wider text-sm transition-all border border-red-900 shadow-lg"
        >
          Predict Matches
        </Link>
        <Link
          href="/debate"
          className="px-6 py-2.5 bg-[#1B1B1B] hover:bg-[#252525] text-white font-bold rounded uppercase tracking-wider text-sm transition-all border border-gray-700 shadow-lg"
        >
          Join Fan Debate
        </Link>
        <Link
          href="/leaderboard"
          className="px-6 py-2.5 bg-[#1E6FFF] hover:bg-blue-600 text-white font-bold rounded uppercase tracking-wider text-sm transition-all border border-blue-800 shadow-lg"
        >
          View Leaderboard
        </Link>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, color = "#B30000" }: { title: string; subtitle?: string; color?: string }) {
  return (
    <div className="py-8 px-4 text-center border-b border-[#1B1B1B]" style={{ background: "linear-gradient(160deg, #110000 0%, #0B0B0B 100%)" }}>
      <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest" style={{ color }}>
        {title}
      </h2>
      {subtitle && <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>}
    </div>
  );
}

const MATCHES = [
  { home: "Arsenal", homeColor: "#EF0107", homeL: "A", away: "Chelsea", awayColor: "#034694", awayL: "C", homeScore: 2, awayScore: 1, homeProb: 52, awayProb: 28, drawProb: 20 },
  { home: "Man City", homeColor: "#6CABDD", homeL: "M", away: "Liverpool", awayColor: "#C8102E", awayL: "L", homeScore: 1, awayScore: 1, homeProb: 40, awayProb: 35, drawProb: 25 },
  { home: "Tottenham", homeColor: "#132257", homeL: "T", away: "Man Utd", awayColor: "#DA291C", awayL: "U", homeScore: 3, awayScore: 0, homeProb: 55, awayProb: 20, drawProb: 25 },
  { home: "Barcelona", homeColor: "#A50044", homeL: "B", away: "Real Madrid", awayColor: "#FEBE10", awayL: "R", homeScore: 1, awayScore: 2, homeProb: 38, awayProb: 42, drawProb: 20 },
];

function PredictPage() {
  return (
    <>
      <PageHeader title="AI Match Predictions" subtitle="Powered by AI — updated before every fixture" color="#EF4444" />
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        {MATCHES.map((m, i) => (
          <AIPredictionCard key={i} match={m} />
        ))}
      </div>
    </>
  );
}

const DEBATES = [
  { question: "Who's Better?", left: { name: "Haaland", color: "#B30000", letter: "H" }, right: { name: "Mbappé", color: "#1E6FFF", letter: "M" }, leftVotes: 61, rightVotes: 39 },
  { question: "GOAT Debate?", left: { name: "Messi", color: "#75AADB", letter: "M" }, right: { name: "Ronaldo", color: "#006600", letter: "R" }, leftVotes: 54, rightVotes: 46 },
  { question: "Best League?", left: { name: "Premier League", color: "#3D185A", letter: "P" }, right: { name: "La Liga", color: "#FF6B00", letter: "L" }, leftVotes: 58, rightVotes: 42 },
  { question: "Best Club?", left: { name: "Real Madrid", color: "#FEBE10", letter: "R" }, right: { name: "Barcelona", color: "#A50044", letter: "B" }, leftVotes: 49, rightVotes: 51 },
];

function DebatePage() {
  return (
    <>
      <PageHeader title="Fan Debate Zone" subtitle="Vote and settle the debates once and for all" color="#1E6FFF" />
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        {DEBATES.map((d, i) => (
          <FanDebateCard key={i} debate={d} />
        ))}
      </div>
    </>
  );
}

const ALL_PLAYERS = [
  { rank: 1, name: "Kamau", pts: 45, correct: 12, streak: 4 },
  { rank: 2, name: "Otieno", pts: 42, correct: 11, streak: 2 },
  { rank: 3, name: "Aisha", pts: 39, correct: 10, streak: 3 },
  { rank: 4, name: "Wanjiku", pts: 35, correct: 9, streak: 1 },
  { rank: 5, name: "Mwangi", pts: 31, correct: 8, streak: 0 },
  { rank: 6, name: "Njeri", pts: 28, correct: 7, streak: 2 },
  { rank: 7, name: "Koech", pts: 25, correct: 6, streak: 1 },
  { rank: 8, name: "Ochieng", pts: 22, correct: 5, streak: 0 },
];

function LeaderboardPage() {
  return (
    <>
      <PageHeader title="Prediction Leaderboard" subtitle="Top fans ranked by prediction accuracy" color="#FFD700" />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-xl overflow-hidden border border-[#1B1B1B] shadow-2xl" style={{ background: "rgba(15,20,15,0.95)" }}>
          <div className="bg-[#1B1B1B] border-b border-yellow-500 px-5 py-3 flex items-center justify-between">
            <span className="font-black tracking-widest text-sm uppercase text-yellow-400">🏆 Full Leaderboard</span>
            <span className="text-yellow-300 text-xs font-bold">Season 2025/26</span>
          </div>
          <div className="divide-y divide-white/5">
            <div className="grid grid-cols-[3rem_1fr_auto_auto_auto] gap-3 px-5 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-right">Correct</span>
              <span className="text-right">Streak</span>
              <span className="text-right">Points</span>
            </div>
            {ALL_PLAYERS.map((p) => (
              <div
                key={p.rank}
                className="grid grid-cols-[3rem_1fr_auto_auto_auto] gap-3 items-center px-5 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-lg font-black" style={{ color: p.rank === 1 ? "#FFD700" : p.rank === 2 ? "#C0C0C0" : p.rank === 3 ? "#CD7F32" : "#555" }}>
                  {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`}
                </span>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white border border-white/10 shrink-0"
                    style={{
                      background: p.rank === 1 ? "linear-gradient(135deg,#FFD700,#FF8C00)" : p.rank === 2 ? "linear-gradient(135deg,#C0C0C0,#808080)" : p.rank === 3 ? "linear-gradient(135deg,#CD7F32,#8B4513)" : "linear-gradient(135deg,#333,#222)",
                    }}
                  >
                    {p.name[0]}
                  </div>
                  <span className="font-bold text-sm text-white">{p.name}</span>
                </div>
                <span className="text-sm text-gray-300 text-right font-bold">{p.correct}</span>
                <span className="text-right">
                  {p.streak > 0 ? (
                    <span className="text-xs font-bold text-orange-400">🔥 {p.streak}</span>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </span>
                <span
                  className="text-sm font-black text-right"
                  style={{ color: p.rank === 1 ? "#FFD700" : p.rank === 2 ? "#C0C0C0" : p.rank === 3 ? "#CD7F32" : "#aaa" }}
                >
                  {p.pts} pts
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-500">Updated after every match</span>
            <Link href="/predict" className="text-xs font-bold text-[#B30000] hover:text-red-400 uppercase tracking-wider transition-colors">
              Start Predicting →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function AIPredictionCard({ compact, match }: { compact?: boolean; match?: typeof MATCHES[0] }) {
  const defaultMatch = MATCHES[0];
  const m = match ?? defaultMatch;

  const [loading, setLoading] = useState(false);
  const [pred, setPred] = useState({ homeScore: m.homeScore, awayScore: m.awayScore, homeProb: m.homeProb, awayProb: m.awayProb, drawProb: m.drawProb });

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const homeS = Math.floor(Math.random() * 4);
      const awayS = Math.floor(Math.random() * 3);
      const homeP = Math.floor(Math.random() * 40) + 30;
      const awayP = Math.floor(Math.random() * 30) + 15;
      setPred({ homeScore: homeS, awayScore: awayS, homeProb: homeP, awayProb: awayP, drawProb: 100 - homeP - awayP });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[#B30000] shadow-2xl" style={{ background: "rgba(20,5,5,0.95)" }}>
      <div className="bg-[#B30000] px-4 py-2 flex items-center justify-between">
        <span className="font-black tracking-widest text-xs uppercase text-white">AI Match Prediction</span>
        <span className="text-yellow-300 text-xs font-bold animate-pulse">● LIVE</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <TeamBadge name={m.home} color={m.homeColor} letter={m.homeL} />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black text-white">{pred.homeScore}</span>
              <span className="text-3xl font-black text-[#B30000]">–</span>
              <span className="text-4xl font-black text-white">{pred.awayScore}</span>
            </div>
            <div className="mt-1 px-3 py-0.5 rounded-full border border-yellow-400 bg-yellow-400/10">
              <span className="text-yellow-400 text-xs font-bold tracking-wider">AI Prediction</span>
            </div>
          </div>
          <TeamBadge name={m.away} color={m.awayColor} letter={m.awayL} />
        </div>
        <div className="mt-3 space-y-1.5">
          <ProbBar label={m.home} prob={pred.homeProb} color={m.homeColor} />
          <ProbBar label={m.away} prob={pred.awayProb} color={m.awayColor} />
          <ProbBar label="Draw" prob={pred.drawProb} color="#888" />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 py-2 bg-[#B30000] hover:bg-red-700 disabled:opacity-60 text-white font-bold rounded text-sm uppercase tracking-wider transition-all"
          >
            {loading ? "Generating..." : "Generate Prediction"}
          </button>
          {compact && (
            <Link href="/predict" className="px-3 py-2 border border-[#B30000]/50 text-[#B30000] hover:bg-[#B30000]/10 font-bold rounded text-sm uppercase tracking-wider transition-all whitespace-nowrap">
              More →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamBadge({ name, color, letter }: { name: string; color: string; letter: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black border-2 border-white/20 shadow-lg" style={{ background: `radial-gradient(circle at 40% 40%, ${color}dd, ${color}88)` }}>
        {letter}
      </div>
      <span className="text-xs font-bold text-gray-300">{name}</span>
    </div>
  );
}

function ProbBar({ label, prob, color }: { label: string; prob: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-300 w-16 text-right truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${prob}%`, background: color }} />
      </div>
      <span className="text-xs font-bold text-white w-8">{prob}%</span>
    </div>
  );
}

function FanDebateCard({ compact, debate }: { compact?: boolean; debate?: typeof DEBATES[0] }) {
  const d = debate ?? DEBATES[0];
  const [votes, setVotes] = useState({ left: d.leftVotes, right: d.rightVotes });
  const [voted, setVoted] = useState<"left" | "right" | null>(null);

  const vote = (side: "left" | "right") => {
    if (voted) return;
    setVoted(side);
    setVotes((v) => {
      const total = v.left + v.right + 1;
      const newLeft = side === "left" ? v.left + 1 : v.left;
      const newRight = side === "right" ? v.right + 1 : v.right;
      return { left: Math.round((newLeft / total) * 100), right: Math.round((newRight / total) * 100) };
    });
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[#1B1B1B] shadow-2xl" style={{ background: "rgba(15,15,25,0.95)" }}>
      <div className="bg-[#1B1B1B] border-b border-[#B30000] px-4 py-2 flex items-center justify-between">
        <span className="font-black tracking-widest text-xs uppercase text-white">Fan Debate</span>
        {voted ? <span className="text-green-400 text-xs font-bold">✓ VOTED</span> : <span className="text-blue-400 text-xs font-bold">VOTE NOW</span>}
      </div>
      <div className="p-4">
        <p className="text-center text-sm font-bold text-gray-300 mb-3">{d.question}</p>
        <div className="flex items-stretch gap-2">
          <PlayerSide name={d.left.name} bgColor={d.left.color} letter={d.left.letter} votes={votes.left} onVote={() => vote("left")} voted={voted !== null} isWinner={votes.left > votes.right} />
          <div className="flex flex-col items-center justify-center px-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm border-2 border-yellow-400 shadow-lg" style={{ background: "linear-gradient(135deg, #B30000, #1E6FFF)" }}>
              VS
            </div>
          </div>
          <PlayerSide name={d.right.name} bgColor={d.right.color} letter={d.right.letter} votes={votes.right} onVote={() => vote("right")} voted={voted !== null} isWinner={votes.right >= votes.left} />
        </div>
        <div className="mt-3 h-2 rounded-full overflow-hidden flex">
          <div className="h-full transition-all duration-700" style={{ width: `${votes.left}%`, background: d.left.color }} />
          <div className="h-full transition-all duration-700" style={{ width: `${votes.right}%`, background: d.right.color }} />
        </div>
        {compact && (
          <Link href="/debate" className="mt-3 flex items-center justify-end text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider transition-colors">
            More Debates →
          </Link>
        )}
      </div>
    </div>
  );
}

function PlayerSide({ name, bgColor, letter, votes, onVote, voted, isWinner }: { name: string; bgColor: string; letter: string; votes: number; onVote: () => void; voted: boolean; isWinner: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2">
      <div className="w-full h-24 rounded-lg flex items-center justify-center font-black text-white/80 border border-white/10 relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${bgColor}55, ${bgColor}22)` }}>
        <span style={{ fontSize: "2.5rem" }}>{letter}</span>
        {voted && isWinner && <span className="absolute top-1.5 right-1.5 text-xs">👑</span>}
      </div>
      <span className="text-sm font-bold text-gray-200 text-center leading-tight">{name}</span>
      <span className="text-xs font-bold" style={{ color: bgColor }}>{votes}%</span>
      <button
        onClick={onVote}
        disabled={voted}
        className="w-full py-1.5 text-white font-bold rounded text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: bgColor }}
      >
        {voted ? "Voted" : "Vote Now!"}
      </button>
    </div>
  );
}

function LeaderboardCard({ compact }: { compact?: boolean }) {
  const players = ALL_PLAYERS.slice(0, 3);
  return (
    <div className="rounded-xl overflow-hidden border border-[#1B1B1B] shadow-2xl" style={{ background: "rgba(15,20,15,0.95)" }}>
      <div className="bg-[#1B1B1B] border-b border-yellow-500 px-4 py-2 flex items-center justify-between">
        <span className="font-black tracking-widest text-xs uppercase text-yellow-400">🏆 Leaderboard</span>
        <span className="text-yellow-300 text-xs">Top Predictors</span>
      </div>
      <div className="p-4 space-y-3">
        {players.map((p) => (
          <div key={p.rank} className="flex items-center gap-3 p-2.5 rounded-lg border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
            <span className="text-xl">{p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : "🥉"}</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white border border-white/20" style={{ background: p.rank === 1 ? "linear-gradient(135deg,#FFD700,#FF8C00)" : p.rank === 2 ? "linear-gradient(135deg,#C0C0C0,#808080)" : "linear-gradient(135deg,#CD7F32,#8B4513)" }}>
              {p.name[0]}
            </div>
            <span className="flex-1 font-bold text-sm text-white">{p.name}</span>
            <span className="text-sm font-black" style={{ color: p.rank === 1 ? "#FFD700" : p.rank === 2 ? "#C0C0C0" : "#CD7F32" }}>{p.pts} PTS</span>
          </div>
        ))}
        <Link href="/leaderboard" className="mt-2 flex items-center justify-center w-full py-2 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 font-bold rounded text-sm uppercase tracking-wider transition-all">
          View Full Leaderboard
        </Link>
      </div>
    </div>
  );
}

function BanterCard() {
  const banters = [
    "Man U fans showed up hoping for a win…\nLeft needing therapy!",
    "Arsenal fans checking the league table in December like it's already May.",
    "Chelsea's transfer window: spending €1B to finish 10th. Peak tradition.",
    "Liverpool fans still singing 'You'll Never Walk Alone'... to an empty trophy cabinet.",
    "Tottenham: consistently inconsistent since 1882.",
  ];

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      setCurrent((c) => (c + 1) % banters.length);
      setLoading(false);
    }, 800);
  };

  const shareText = encodeURIComponent(banters[current] + "\n\n- BallMtaani.com");

  return (
    <div className="md:col-span-2 rounded-xl overflow-hidden border border-[#1B1B1B] shadow-2xl" style={{ background: "rgba(20,10,10,0.95)" }}>
      <div className="bg-[#1B1B1B] border-b border-[#B30000] px-4 py-2 flex items-center justify-between">
        <span className="font-black tracking-widest text-xs uppercase text-white">AI Banter Generator</span>
        <span className="text-red-400 text-xs font-bold">🔥 HOT</span>
      </div>
      <div className="p-5">
        <div className="relative rounded-xl p-5 border border-[#B30000]/40 text-center mb-4" style={{ background: "linear-gradient(135deg, rgba(179,0,0,0.2), rgba(27,27,27,0.8))" }}>
          <div className="absolute -top-3 left-6 px-2 py-0.5 rounded-full text-xs font-bold bg-[#B30000] text-white">BANTER</div>
          <p className="text-lg md:text-xl font-bold text-white leading-relaxed" style={{ textShadow: "1px 1px 6px rgba(0,0,0,0.8)" }}>
            {banters[current].split("\n")[0]}
          </p>
          {banters[current].includes("\n") && (
            <p className="text-base md:text-lg font-bold mt-1" style={{ background: "linear-gradient(90deg, #FFD700, #FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {banters[current].split("\n")[1]}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <button onClick={generate} disabled={loading} className="px-5 py-2 bg-[#B30000] hover:bg-red-700 disabled:opacity-60 text-white font-bold rounded text-sm uppercase tracking-wider transition-all">
            {loading ? "Generating..." : "Generate Banter"}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Share the Banter!</span>
            <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform" style={{ background: "#25D366" }} title="Share to WhatsApp">
              <WhatsAppIcon />
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${shareText}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform" style={{ background: "#1DA1F2" }} title="Share to Twitter">
              <TwitterIcon />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="white" width="22" height="22">
      <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.348L4 29l7.888-2.063A11.93 11.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.97 9.97 0 0 1-5.018-1.356l-.358-.215-4.682 1.224 1.18-4.518-.234-.372A9.962 9.962 0 0 1 6 15c0-5.523 4.477-10 10-10zm-3.164 5.5c-.22 0-.578.083-.88.413-.3.33-1.148 1.12-1.148 2.733 0 1.612 1.175 3.17 1.337 3.39.163.22 2.3 3.512 5.576 4.786 2.764 1.078 3.33.864 3.93.812.6-.054 1.94-.79 2.213-1.555.273-.765.273-1.422.192-1.558-.08-.136-.3-.217-.627-.38-.327-.163-1.938-.957-2.238-1.067-.3-.11-.517-.163-.737.163-.22.327-.85 1.067-.98 1.177-.09.08-.23.1-.38.03-.217-.1-.852-.33-1.67-.977-.78-.63-1.305-1.41-1.458-1.66-.122-.22-.013-.336.082-.443.11-.12.245-.272.382-.41.136-.136.163-.22.245-.38.083-.163.037-.303-.02-.41-.055-.11-.737-1.77-1.01-2.42-.266-.63-.54-.54-.737-.55-.19-.01-.4-.012-.62-.012z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.264 5.633 5.9-5.633zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
      <p className="text-6xl font-black text-[#B30000] mb-4">404</p>
      <p className="text-xl font-bold text-white mb-2">Page Not Found</p>
      <p className="text-gray-400 text-sm mb-6">Looks like this ball went out of bounds.</p>
      <Link href="/" className="px-6 py-2.5 bg-[#B30000] hover:bg-red-700 text-white font-bold rounded uppercase tracking-wider text-sm transition-all">
        Back to Home
      </Link>
    </div>
  );
}

function Footer() {
  return (
    <div className="py-8 px-4 text-center bg-[#0B0B0B] border-t border-[#1B1B1B]">
      <div className="max-w-4xl mx-auto">
        <div className="inline-block px-8 py-3 rounded-full mb-4 border border-[#B30000]/60" style={{ background: "linear-gradient(135deg, #B30000, #7a0000)" }}>
          <p className="text-white font-black text-base uppercase tracking-widest">Join the Ultimate Football Fan Zone!</p>
        </div>
        <p className="text-2xl font-black tracking-widest" style={{ background: "linear-gradient(90deg, #FFD700, #FF6B00, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          ballmtaani.com
        </p>
      </div>
    </div>
  );
}
