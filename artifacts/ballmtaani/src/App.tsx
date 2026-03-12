import { useState } from "react";

function App() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white font-sans overflow-x-hidden">
      <HeroSection />
      <MainContent />
      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <div
      className="relative w-full flex flex-col items-center justify-center text-center py-10 px-4"
      style={{
        background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(11,11,11,0.85) 100%), url('/stadium.png') center center / cover no-repeat`,
        minHeight: "340px",
      }}
    >
      <div className="relative z-10 flex flex-col items-center">
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
          className="text-xl md:text-2xl font-bold italic tracking-wide"
          style={{
            background: "linear-gradient(90deg, #FFD700, #FF6B00, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none",
          }}
        >
          Predict. Debate. Banter!
        </p>
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <button className="px-6 py-2.5 bg-[#B30000] hover:bg-red-700 text-white font-bold rounded uppercase tracking-wider text-sm transition-all border border-red-900 shadow-lg">
            Predict Matches
          </button>
          <button className="px-6 py-2.5 bg-[#1B1B1B] hover:bg-[#252525] text-white font-bold rounded uppercase tracking-wider text-sm transition-all border border-gray-700 shadow-lg">
            Join Fan Debate
          </button>
          <button className="px-6 py-2.5 bg-[#1E6FFF] hover:bg-blue-600 text-white font-bold rounded uppercase tracking-wider text-sm transition-all border border-blue-800 shadow-lg">
            View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div
      className="relative px-4 py-6"
      style={{
        background: `linear-gradient(to bottom, rgba(11,11,11,0.97) 0%, rgba(11,11,11,0.85) 50%, rgba(11,11,11,0.97) 100%), url('/stadium.png') center 60% / cover no-repeat`,
      }}
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        <AIPredictionCard />
        <FanDebateCard />
        <LeaderboardCard />
        <BanterCard />
      </div>
    </div>
  );
}

function AIPredictionCard() {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState({
    homeScore: 2,
    awayScore: 1,
    homeProb: 52,
    awayProb: 28,
    drawProb: 20,
  });

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const home = Math.floor(Math.random() * 4);
      const away = Math.floor(Math.random() * 3);
      const homeP = Math.floor(Math.random() * 40) + 30;
      const awayP = Math.floor(Math.random() * 30) + 15;
      const drawP = 100 - homeP - awayP;
      setPrediction({ homeScore: home, awayScore: away, homeProb: homeP, awayProb: awayP, drawProb: drawP });
      setLoading(false);
    }, 1200);
  };

  return (
    <div
      className="rounded-xl overflow-hidden border border-[#B30000] shadow-2xl"
      style={{ background: "rgba(20,5,5,0.92)" }}
    >
      <div className="bg-[#B30000] px-4 py-2 flex items-center justify-between">
        <span className="font-black tracking-widest text-xs uppercase text-white">AI Match Prediction</span>
        <span className="text-yellow-300 text-xs font-bold animate-pulse">● LIVE</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <TeamBadge name="Arsenal" color="#EF0107" letter="A" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black text-white">{prediction.homeScore}</span>
              <span className="text-3xl font-black text-[#B30000]">–</span>
              <span className="text-4xl font-black text-white">{prediction.awayScore}</span>
            </div>
            <div className="mt-1 px-3 py-0.5 rounded-full border border-yellow-400 bg-yellow-400/10">
              <span className="text-yellow-400 text-xs font-bold tracking-wider">AI Prediction</span>
            </div>
          </div>
          <TeamBadge name="Chelsea" color="#034694" letter="C" />
        </div>
        <div className="mt-3 space-y-1.5">
          <ProbBar label="Arsenal" prob={prediction.homeProb} color="#EF0107" />
          <ProbBar label="Chelsea" prob={prediction.awayProb} color="#034694" />
          <ProbBar label="Draw" prob={prediction.drawProb} color="#888" />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 w-full py-2 bg-[#B30000] hover:bg-red-700 disabled:opacity-60 text-white font-bold rounded text-sm uppercase tracking-wider transition-all"
        >
          {loading ? "Generating..." : "Generate Prediction"}
        </button>
      </div>
    </div>
  );
}

function TeamBadge({ name, color, letter }: { name: string; color: string; letter: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black border-2 border-white/20 shadow-lg"
        style={{ background: `radial-gradient(circle at 40% 40%, ${color}dd, ${color}88)` }}
      >
        {letter}
      </div>
      <span className="text-xs font-bold text-gray-300">{name}</span>
    </div>
  );
}

function ProbBar({ label, prob, color }: { label: string; prob: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-300 w-14 text-right">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${prob}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold text-white w-8">{prob}%</span>
    </div>
  );
}

function FanDebateCard() {
  const [votes, setVotes] = useState({ haaland: 61, mbappe: 39 });

  const vote = (side: "haaland" | "mbappe") => {
    setVotes((v) => {
      const total = v.haaland + v.mbappe + 1;
      if (side === "haaland") {
        const h = v.haaland + 1;
        const m = v.mbappe;
        return { haaland: Math.round((h / total) * 100), mbappe: Math.round((m / total) * 100) };
      } else {
        const h = v.haaland;
        const m = v.mbappe + 1;
        return { haaland: Math.round((h / total) * 100), mbappe: Math.round((m / total) * 100) };
      }
    });
  };

  return (
    <div
      className="rounded-xl overflow-hidden border border-[#1B1B1B] shadow-2xl"
      style={{ background: "rgba(15,15,25,0.92)" }}
    >
      <div className="bg-[#1B1B1B] border-b border-[#B30000] px-4 py-2 flex items-center justify-between">
        <span className="font-black tracking-widest text-xs uppercase text-white">Fan Debate</span>
        <span className="text-blue-400 text-xs font-bold">VOTE NOW</span>
      </div>
      <div className="p-4">
        <p className="text-center text-sm font-bold text-gray-300 mb-3">Who's Better?</p>
        <div className="flex items-stretch gap-2">
          <PlayerSide
            name="Haaland?"
            bgColor="#B30000"
            letter="H"
            votes={votes.haaland}
            onVote={() => vote("haaland")}
          />
          <div className="flex flex-col items-center justify-center px-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-lg border-2 border-yellow-400 shadow-lg"
              style={{ background: "linear-gradient(135deg, #B30000, #1E6FFF)" }}
            >
              VS
            </div>
          </div>
          <PlayerSide
            name="Mbappé?"
            bgColor="#1E6FFF"
            letter="M"
            votes={votes.mbappe}
            onVote={() => vote("mbappe")}
            flip
          />
        </div>
        <div className="mt-3 h-2 rounded-full overflow-hidden flex">
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${votes.haaland}%`, background: "#B30000" }}
          />
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${votes.mbappe}%`, background: "#1E6FFF" }}
          />
        </div>
      </div>
    </div>
  );
}

function PlayerSide({
  name,
  bgColor,
  letter,
  votes,
  onVote,
  flip,
}: {
  name: string;
  bgColor: string;
  letter: string;
  votes: number;
  onVote: () => void;
  flip?: boolean;
}) {
  return (
    <div className={`flex-1 flex flex-col items-center gap-2 ${flip ? "" : ""}`}>
      <div
        className="w-full h-28 rounded-lg flex items-center justify-center text-5xl font-black text-white/80 border border-white/10"
        style={{ background: `linear-gradient(160deg, ${bgColor}55, ${bgColor}22)` }}
      >
        <span style={{ fontSize: "3rem" }}>{letter}</span>
      </div>
      <span className="text-sm font-bold text-gray-200">{name}</span>
      <span className="text-xs text-gray-400">{votes}%</span>
      <button
        onClick={onVote}
        className="w-full py-1.5 text-white font-bold rounded text-xs uppercase tracking-wider transition-all"
        style={{ background: bgColor }}
      >
        Vote Now!
      </button>
    </div>
  );
}

function LeaderboardCard() {
  const players = [
    { rank: 1, name: "Kamau", pts: 45, emoji: "🥇" },
    { rank: 2, name: "Otieno", pts: 42, emoji: "🥈" },
    { rank: 3, name: "Aisha", pts: 39, emoji: "🥉" },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden border border-[#1B1B1B] shadow-2xl"
      style={{ background: "rgba(15,20,15,0.92)" }}
    >
      <div className="bg-[#1B1B1B] border-b border-yellow-500 px-4 py-2 flex items-center justify-between">
        <span className="font-black tracking-widest text-xs uppercase text-yellow-400">🏆 Leaderboard</span>
        <span className="text-yellow-300 text-xs">Top Predictors</span>
      </div>
      <div className="p-4 space-y-3">
        {players.map((p) => (
          <div
            key={p.rank}
            className="flex items-center gap-3 p-2.5 rounded-lg border border-white/5"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <span className="text-xl">{p.emoji}</span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white border border-white/20"
              style={{
                background:
                  p.rank === 1
                    ? "linear-gradient(135deg, #FFD700, #FF8C00)"
                    : p.rank === 2
                    ? "linear-gradient(135deg, #C0C0C0, #808080)"
                    : "linear-gradient(135deg, #CD7F32, #8B4513)",
              }}
            >
              {p.name[0]}
            </div>
            <span className="flex-1 font-bold text-sm text-white">{p.name}</span>
            <span
              className="text-sm font-black"
              style={{ color: p.rank === 1 ? "#FFD700" : p.rank === 2 ? "#C0C0C0" : "#CD7F32" }}
            >
              {p.pts} PTS
            </span>
          </div>
        ))}
        <button className="mt-2 w-full py-2 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 font-bold rounded text-sm uppercase tracking-wider transition-all">
          View Full Leaderboard
        </button>
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
    <div
      className="md:col-span-2 rounded-xl overflow-hidden border border-[#1B1B1B] shadow-2xl"
      style={{ background: "rgba(20,10,10,0.92)" }}
    >
      <div className="bg-[#1B1B1B] border-b border-[#B30000] px-4 py-2 flex items-center justify-between">
        <span className="font-black tracking-widest text-xs uppercase text-white">AI Banter Generator</span>
        <span className="text-red-400 text-xs font-bold">🔥 HOT</span>
      </div>
      <div className="p-5">
        <div
          className="relative rounded-xl p-5 border border-[#B30000]/40 text-center mb-4"
          style={{
            background: "linear-gradient(135deg, rgba(179,0,0,0.2), rgba(27,27,27,0.8))",
          }}
        >
          <div
            className="absolute -top-3 left-6 px-2 py-0.5 rounded-full text-xs font-bold bg-[#B30000] text-white"
          >
            BANTER
          </div>
          <p
            className="text-lg md:text-xl font-bold text-white leading-relaxed whitespace-pre-line"
            style={{ textShadow: "1px 1px 6px rgba(0,0,0,0.8)" }}
          >
            {banters[current].split("\n")[0]}
          </p>
          {banters[current].includes("\n") && (
            <p
              className="text-base md:text-lg font-bold mt-1"
              style={{
                background: "linear-gradient(90deg, #FFD700, #FF6B00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {banters[current].split("\n")[1]}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <button
            onClick={generate}
            disabled={loading}
            className="px-5 py-2 bg-[#B30000] hover:bg-red-700 disabled:opacity-60 text-white font-bold rounded text-sm uppercase tracking-wider transition-all"
          >
            {loading ? "Generating..." : "Generate Banter"}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Share the Banter!</span>
            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-110 transition-transform"
              style={{ background: "#25D366" }}
              title="Share to WhatsApp"
            >
              <WhatsAppIcon />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-110 transition-transform"
              style={{ background: "#1DA1F2" }}
              title="Share to Twitter"
            >
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
    <svg viewBox="0 0 32 32" fill="white" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.348L4 29l7.888-2.063A11.93 11.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.97 9.97 0 0 1-5.018-1.356l-.358-.215-4.682 1.224 1.18-4.518-.234-.372A9.962 9.962 0 0 1 6 15c0-5.523 4.477-10 10-10zm-3.164 5.5c-.22 0-.578.083-.88.413-.3.33-1.148 1.12-1.148 2.733 0 1.612 1.175 3.17 1.337 3.39.163.22 2.3 3.512 5.576 4.786 2.764 1.078 3.33.864 3.93.812.6-.054 1.94-.79 2.213-1.555.273-.765.273-1.422.192-1.558-.08-.136-.3-.217-.627-.38-.327-.163-1.938-.957-2.238-1.067-.3-.11-.517-.163-.737.163-.22.327-.85 1.067-.98 1.177-.09.08-.23.1-.38.03-.217-.1-.852-.33-1.67-.977-.78-.63-1.305-1.41-1.458-1.66-.122-.22-.013-.336.082-.443.11-.12.245-.272.382-.41.136-.136.163-.22.245-.38.083-.163.037-.303-.02-.41-.055-.11-.737-1.77-1.01-2.42-.266-.63-.54-.54-.737-.55-.19-.01-.4-.012-.62-.012z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.264 5.633 5.9-5.633zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function Footer() {
  return (
    <div
      className="relative py-8 px-4 text-center"
      style={{
        background: `linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(11,11,11,0.8) 100%), url('/stadium.png') center 80% / cover no-repeat`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className="inline-block px-8 py-3 rounded-full mb-4 border border-[#B30000]/60"
          style={{ background: "linear-gradient(135deg, #B30000, #7a0000)" }}
        >
          <p className="text-white font-black text-lg uppercase tracking-widest">
            Join the Ultimate Football Fan Zone!
          </p>
        </div>
        <p
          className="text-2xl font-black tracking-widest"
          style={{
            background: "linear-gradient(90deg, #FFD700, #FF6B00, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ballmtaani.com
        </p>
      </div>
    </div>
  );
}

export default App;
