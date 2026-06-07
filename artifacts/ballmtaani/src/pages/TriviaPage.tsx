import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { getRandomTriviaSet, TriviaQuestion } from "../data/mockTrivia";
import { fetchAiTrivia } from "../lib/gemini-trivia";
import { AlertTriangle, CheckCircle, ChevronLeft, Flame, RefreshCw, XCircle } from "lucide-react";
import { ShareCard } from "../components/ShareCard";

// ─── Prize ladder config ───────────────────────────────────────────────────────
const SAFE_LEVELS = [4, 9]; // 0-indexed

// ─── Option letter badges ──────────────────────────────────────────────────────
const LETTERS = ["A", "B", "C", "D"];

// ─── Dramatic circular timer ───────────────────────────────────────────────────
function TimerRing({ timeLeft, max = 25 }: { timeLeft: number; max?: number }) {
  const pct   = timeLeft / max;
  const circ  = 2 * Math.PI * 44; // r=44
  const dash  = pct * circ;
  const danger = timeLeft <= 8;
  const color = danger ? "#FF4444" : timeLeft <= 15 ? "#FFD700" : "#0047FF";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 110, height: 110 }}>
      {/* Glow ring */}
      <svg width="110" height="110" className="absolute inset-0" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="55" cy="55" r="44" fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dasharray 0.9s linear, stroke 0.4s" }}
        />
      </svg>
      <div className="relative z-10 text-center">
        <div className={`font-black tabular-nums leading-none ${danger ? "text-[#FF4444] animate-pulse" : "text-white"}`}
          style={{ fontSize: "1.8rem" }}>
          {timeLeft}
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mt-0.5">sec</div>
      </div>
    </div>
  );
}

// ─── Single answer option ──────────────────────────────────────────────────────
function AnswerOption({
  letter, text, state, onClick, aiPick,
}: {
  letter: string;
  text: string;
  state: "idle" | "selected" | "locked" | "correct" | "wrong" | "dimmed" | "hidden";
  onClick: () => void;
  aiPick: boolean;
}) {
  if (state === "hidden") return <div className="opacity-0 pointer-events-none" aria-hidden />;

  const styles: Record<string, string> = {
    idle:     "border-white/15 bg-white/[0.03] text-white hover:border-[#0047FF]/60 hover:bg-[#0047FF]/8",
    selected: "border-[#FFD700]/70 bg-[#FFD700]/10 text-white shadow-[0_0_20px_rgba(255,215,0,0.2)]",
    locked:   "border-[#FFD700] bg-[#FFD700]/20 text-white animate-pulse shadow-[0_0_30px_rgba(255,215,0,0.4)]",
    correct:  "border-green-400 bg-green-600/30 text-white shadow-[0_0_40px_rgba(34,197,94,0.5)]",
    wrong:    "border-red-500 bg-red-600/25 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]",
    dimmed:   "border-white/5 bg-white/[0.01] text-white/20",
  };

  const letterStyles: Record<string, string> = {
    idle:     "bg-white/8 text-[#FFD700] border border-white/10",
    selected: "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/50",
    locked:   "bg-[#FFD700]/30 text-[#FFD700] border border-[#FFD700]",
    correct:  "bg-green-500 text-white border border-green-400",
    wrong:    "bg-red-600 text-white border border-red-500",
    dimmed:   "bg-white/5 text-white/20 border border-white/5",
    hidden:   "",
  };

  return (
    <button
      onClick={onClick}
      disabled={state === "dimmed" || state === "locked" || state === "correct" || state === "wrong"}
      className={`relative w-full flex items-center gap-4 px-5 py-4 md:py-5 border-2 text-left font-bold transition-all duration-300 rounded-xl md:rounded-2xl group ${styles[state]}`}
    >
      {/* Letter badge */}
      <span className={`shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-black text-sm md:text-base transition-all ${letterStyles[state]}`}>
        {letter}
      </span>

      <span className="flex-1 text-sm md:text-lg leading-tight">{text}</span>

      {/* AI suggestion dot */}
      {aiPick && state !== "correct" && state !== "wrong" && (
        <span className="shrink-0 w-2 h-2 rounded-full bg-primary animate-ping" title="AI suggests this" />
      )}

      {/* Reveal icons */}
      {state === "correct" && <CheckCircle className="shrink-0 w-6 h-6 text-green-300" />}
      {state === "wrong"   && <XCircle    className="shrink-0 w-6 h-6 text-red-300"   />}
    </button>
  );
}

// ─── Prize ladder ──────────────────────────────────────────────────────────────
function PrizeLadder({
  questions, currentLevel, won,
}: {
  questions: TriviaQuestion[]; currentLevel: number; won: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-[3px] py-2">
      {questions.map((q, idx) => {
        const isSafe   = SAFE_LEVELS.includes(idx);
        const isActive = idx === currentLevel && !won;
        const isPassed = idx < currentLevel || (won && idx <= currentLevel);

        return (
          <div
            key={q.id}
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
              isActive ? "bg-[#FFD700] text-black shadow-[0_0_16px_rgba(255,215,0,0.5)]" :
              isPassed ? "text-[#FFD700]/80" :
              isSafe   ? "text-white border border-white/15 bg-white/[0.03]" :
              "text-white/30"
            }`}
          >
            <span className={`tabular-nums ${isActive ? "text-black/50" : ""}`}>{idx + 1}</span>
            <span className="flex items-center gap-1.5">
              {isSafe && !isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]/50" />}
              <span className="tabular-nums font-black">{q.reward.toLocaleString()}</span>
              <span className={`text-[9px] ${isActive ? "text-black/40" : "text-white/30"}`}>MTC</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function TriviaPage() {
  const { isLoggedIn, awardCoins, username } = useAuth();
  const [, setLocation] = useLocation();

  const [questions, setQuestions]     = useState<TriviaQuestion[]>(() => getRandomTriviaSet());
  const [isLoadingAi, setIsLoadingAi] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLockedIn, setIsLockedIn]   = useState(false);
  const [isRevealed, setIsRevealed]   = useState(false);
  const [gameOver, setGameOver]       = useState(false);
  const [won, setWon]                 = useState(false);
  const [statusScore, setStatusScore] = useState(0);
  const [streak, setStreak]           = useState(0);
  const [bestStreak, setBestStreak]   = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft]       = useState(25);
  const [impactBanner, setImpactBanner] = useState<"correct" | "wrong" | null>(null);
  const [showLadder, setShowLadder]   = useState(false);

  // Lifelines
  const [lifeline5050, setLifeline5050] = useState(true);
  const [lifelineAskAI, setLifelineAskAI] = useState(true);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [aiSuggestion, setAiSuggestion]   = useState<number | null>(null);
  const [showShare, setShowShare]         = useState(false);

  const question: TriviaQuestion = questions[currentLevel];
  const safeHavenReward = currentLevel > 9 ? questions[9]?.reward || 0 : currentLevel > 4 ? questions[4]?.reward || 0 : 0;
  const levelBand = currentLevel <= 4 ? "Now" : currentLevel <= 9 ? "Modern" : "Legends";

  // ── Load AI questions ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAiTrivia().then(aiQ => {
      if (aiQ && aiQ.length === 15) setQuestions(aiQ);
      setIsLoadingAi(false);
    });
  }, []);

  // ── Auth guard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem("auth_return_url", window.location.pathname);
      setLocation("/login");
    }
  }, [isLoggedIn, setLocation]);

  // ── Timer ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn || gameOver || won || isLockedIn) return;
    if (timeLeft <= 0) { handleLockIn(null); return; }
    const t = window.setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [timeLeft, isLoggedIn, gameOver, won, isLockedIn]);

  useEffect(() => {
    setTimeLeft(25);
    setImpactBanner(null);
  }, [currentLevel]);

  // ── Keyboard ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameOver || won) return;
    const onKey = (e: KeyboardEvent) => {
      if (isLockedIn) return;
      const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
      const key = e.key.toLowerCase();
      if (key in map) {
        e.preventDefault();
        const idx = map[key];
        if (!hiddenOptions.includes(idx)) setSelectedOption(idx);
        return;
      }
      if (key === "enter") { e.preventDefault(); handleLockIn(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLockedIn, hiddenOptions, selectedOption, gameOver, won]);

  if (!isLoggedIn) return null;

  // ── Actions ───────────────────────────────────────────────────────────────────
  const handleSelect = (index: number) => {
    if (isLockedIn || hiddenOptions.includes(index)) return;
    setSelectedOption(index);
  };

  const handleLockIn = (forcedChoice?: number | null) => {
    const finalChoice = forcedChoice !== undefined ? forcedChoice : selectedOption;
    if ((finalChoice === null || finalChoice === undefined) && forcedChoice === undefined) return;
    if (isLockedIn) return;
    setIsLockedIn(true);
    if (finalChoice !== null && finalChoice !== undefined) setSelectedOption(finalChoice);

    setTimeout(() => {
      setIsRevealed(true);
      if (finalChoice !== question.correctAnswer) {
        setImpactBanner("wrong");
        setStreak(0);
        setTimeout(() => {
          let safeReward = 0;
          if (currentLevel > 9) safeReward = questions[9].reward;
          else if (currentLevel > 4) safeReward = questions[4].reward;
          if (safeReward > 0) awardCoins("trivia_correct");
          setStatusScore(safeReward);
          setGameOver(true);
        }, 2200);
      } else {
        setImpactBanner("correct");
        setStreak(s => { const n = s + 1; setBestStreak(b => Math.max(b, n)); return n; });
        setCorrectCount(c => c + 1);
        awardCoins("trivia_correct");
        setTimeout(() => {
          if (currentLevel === questions.length - 1) {
            awardCoins("trivia_complete");
            setStatusScore(question.reward);
            setWon(true);
          } else {
            setCurrentLevel(p => p + 1);
            setSelectedOption(null);
            setIsLockedIn(false);
            setIsRevealed(false);
            setHiddenOptions([]);
            setAiSuggestion(null);
          }
        }, 3000);
      }
    }, Math.random() * 2000 + 1500);
  };

  const handleWalkAway = () => {
    if (isLockedIn) return;
    const reward = currentLevel > 0 ? questions[currentLevel - 1].reward : 0;
    if (reward > 0) awardCoins("trivia_correct");
    setStatusScore(reward);
    setGameOver(true);
  };

  const use5050 = () => {
    if (!lifeline5050 || isLockedIn) return;
    setLifeline5050(false);
    const incorrect = [0, 1, 2, 3].filter(i => i !== question.correctAnswer);
    setHiddenOptions(incorrect.sort(() => 0.5 - Math.random()).slice(0, 2));
  };

  const useAskAI = () => {
    if (!lifelineAskAI || isLockedIn) return;
    setLifelineAskAI(false);
    const isCorrect = Math.random() < 0.8;
    if (isCorrect) {
      setAiSuggestion(question.correctAnswer);
    } else {
      const incorrect = [0, 1, 2, 3].filter(i => i !== question.correctAnswer && !hiddenOptions.includes(i));
      setAiSuggestion(incorrect[Math.floor(Math.random() * incorrect.length)]);
    }
  };

  const resetGame = (useAiData?: boolean) => {
    setQuestions(useAiData ? questions : getRandomTriviaSet());
    setCurrentLevel(0); setSelectedOption(null); setIsLockedIn(false);
    setIsRevealed(false); setGameOver(false); setWon(false);
    setStatusScore(0); setStreak(0); setBestStreak(0); setCorrectCount(0);
    setLifeline5050(true); setLifelineAskAI(true); setHiddenOptions([]);
    setAiSuggestion(null); setImpactBanner(null); setTimeLeft(25);
  };

  // ── Option states ─────────────────────────────────────────────────────────────
  const getOptionState = (idx: number): "idle" | "selected" | "locked" | "correct" | "wrong" | "dimmed" | "hidden" => {
    if (hiddenOptions.includes(idx)) return "hidden";
    const isSelected = selectedOption === idx;
    const isCorrect  = idx === question.correctAnswer;
    if (isRevealed) {
      if (isCorrect) return "correct";
      if (isSelected && !isCorrect) return "wrong";
      return "dimmed";
    }
    if (isLockedIn && isSelected) return "locked";
    if (isSelected) return "selected";
    return "idle";
  };

  // ── Background mood ────────────────────────────────────────────────────────────
  const bgMood = isRevealed
    ? selectedOption === question.correctAnswer ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.15)"
    : isLockedIn ? "rgba(255,215,0,0.08)" : "rgba(0,71,255,0.06)";

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (isLoadingAi) {
    return (
      <div className="fixed inset-0 bg-[#020408] flex flex-col items-center justify-center text-white overflow-hidden">
        {/* Stadium light rays */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "conic-gradient(from 0deg at 50% -20%, transparent 0deg, rgba(255,215,0,0.04) 15deg, transparent 30deg, transparent 60deg, rgba(255,215,0,0.03) 75deg, transparent 90deg)",
        }} />
        <div className="absolute top-0 left-0 right-0 h-[40vh]" style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.12) 0%, transparent 60%)",
        }} />
        <RefreshCw className="w-12 h-12 text-[#FFD700] animate-spin mb-6 relative z-10" />
        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white mb-2 relative z-10">
          Generating Questions
        </h2>
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] relative z-10">
          AI scanning football history...
        </p>
      </div>
    );
  }

  // ── End screen ─────────────────────────────────────────────────────────────────
  if (won || gameOver) {
    return (
      <div className="fixed inset-0 bg-[#020408] flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: won
            ? "radial-gradient(ellipse at 50% 40%, rgba(255,215,0,0.18) 0%, transparent 60%)"
            : "radial-gradient(ellipse at 50% 40%, rgba(220,38,38,0.12) 0%, transparent 60%)",
        }} />

        <div className="relative z-10 w-full max-w-md">
          {/* Result */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{won ? "🏆" : "💔"}</div>
            <h1 className="font-black uppercase tracking-[0.25em] text-white mb-2"
              style={{ fontSize: "clamp(1.8rem, 6vw, 3rem)" }}>
              {won ? "Trivia Cleared!" : "Game Over"}
            </h1>
            <p className="text-white/35 text-xs font-bold uppercase tracking-widest">
              {won ? "You answered all 15 correctly" : `Eliminated at question ${currentLevel + 1}`}
            </p>
          </div>

          {/* Prize */}
          <div className="border border-[#FFD700]/25 bg-[#FFD700]/5 rounded-2xl p-6 text-center mb-6">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#FFD700]/60 mb-1">You walk away with</p>
            <div className="font-black text-[#FFD700] tabular-nums" style={{ fontSize: "clamp(3rem, 10vw, 5rem)" }}>
              {statusScore.toLocaleString()}
            </div>
            <div className="text-[#FFD700]/50 font-black uppercase tracking-widest text-sm">MTC</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { label: "Accuracy", value: `${Math.round((correctCount / Math.max(1, currentLevel + (won ? 1 : 0))) * 100)}%`, color: "text-green-400" },
              { label: "Best Streak", value: `${bestStreak} 🔥`, color: "text-orange-400" },
              { label: "Level", value: `${currentLevel + (won ? 1 : 0)}/15`, color: "text-[#0047FF]" },
            ].map(({ label, value, color }) => (
              <div key={label} className="border border-white/8 bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">{label}</p>
                <p className={`text-sm font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowShare(true)}
              className="w-full py-4 font-black uppercase tracking-[0.25em] text-sm bg-[#0047FF] text-white rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(0,71,255,0.3)]"
            >
              Share Result
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => resetGame()}
                className="py-3.5 font-black uppercase tracking-widest text-xs bg-[#FFD700] text-black rounded-xl hover:bg-yellow-400 transition-all"
              >
                Play Again
              </button>
              <Link href="/"
                className="py-3.5 font-black uppercase tracking-widest text-xs border border-white/10 bg-white/[0.04] text-white/60 rounded-xl hover:text-white hover:bg-white/10 transition-all text-center"
              >
                Home
              </Link>
            </div>
          </div>
        </div>

        {showShare && (
          <ShareCard
            achievement={won ? "I cleared BallMtaani Trivia!" : `I reached ${statusScore.toLocaleString()} MTC in Trivia`}
            coinsEarned={statusScore}
            emoji={won ? "WIN" : "QUIZ"}
            shareUrl={`https://ballmtaani.com/?ref=${username || "fan"}`}
            onClose={() => setShowShare(false)}
          />
        )}
      </div>
    );
  }

  // ── Main game ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#020408] text-white flex flex-col overflow-hidden">

      {/* ── Dynamic background mood ──────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${bgMood} 0%, transparent 60%)` }}
      />
      {/* Stadium light rays */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] pointer-events-none" style={{
        background: "conic-gradient(from 0deg at 50% -30%, transparent 0deg, rgba(255,215,0,0.025) 12deg, transparent 24deg, transparent 48deg, rgba(255,215,0,0.02) 60deg, transparent 72deg, transparent 96deg, rgba(255,215,0,0.02) 108deg, transparent 120deg)",
      }} />

      {/* ── Impact banner ─────────────────────────────────────────────────────── */}
      {impactBanner && (
        <div className={`absolute inset-0 z-50 pointer-events-none flex items-center justify-center transition-all`}>
          <div className={`px-8 py-5 font-black text-4xl uppercase tracking-[0.3em] animate-combo-flash ${
            impactBanner === "correct"
              ? "text-green-300 border-4 border-green-400 bg-black/80"
              : "text-red-400 border-4 border-red-500 bg-black/80"
          }`}>
            {impactBanner === "correct" ? "✓ Correct!" : "✗ Wrong!"}
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur border-b border-white/8">
        <Link href="/" className="flex items-center gap-1.5 px-3 py-2 border border-white/10 bg-white/[0.04] text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Quit
        </Link>

        <div className="flex items-center gap-2 px-4 py-2 border border-[#FFD700]/40 bg-[#FFD700]/8">
          <span className="font-black uppercase tracking-[0.3em] text-[#FFD700] text-[11px]">Trivia Ladder</span>
        </div>

        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-orange-400 font-black text-sm">
              <Flame className="w-4 h-4" />{streak}
            </div>
          )}
          <button
            onClick={() => setShowLadder(l => !l)}
            className="lg:hidden px-3 py-2 border border-white/10 bg-white/[0.04] text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            Ladder
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* ── Game area ──────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-between py-4 px-4 md:px-8 overflow-y-auto">

          {/* ── Top: Timer + Lifelines ────────────────────────────────────────── */}
          <div className="w-full max-w-2xl flex items-center justify-between gap-4 mb-4">

            {/* Lifelines */}
            <div className="flex gap-2">
              <button
                onClick={use5050}
                disabled={!lifeline5050 || isLockedIn}
                className={`flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 border-2 font-black text-xs uppercase tracking-wider transition-all rounded-2xl ${
                  lifeline5050
                    ? "border-[#0047FF] bg-[#0047FF]/15 text-[#0047FF] hover:bg-[#0047FF]/25 shadow-[0_0_20px_rgba(0,71,255,0.3)]"
                    : "border-white/10 bg-white/[0.02] text-white/20"
                }`}
              >
                <span className="text-lg font-black">50</span>
                <span className="text-[8px] tracking-widest">50</span>
              </button>
              <button
                onClick={useAskAI}
                disabled={!lifelineAskAI || isLockedIn}
                className={`flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 border-2 font-black text-[9px] uppercase tracking-wider transition-all rounded-2xl ${
                  lifelineAskAI
                    ? "border-primary bg-primary/15 text-primary hover:bg-primary/25 shadow-[0_0_20px_rgba(179,0,0,0.3)]"
                    : "border-white/10 bg-white/[0.02] text-white/20"
                }`}
              >
                <AlertTriangle className="w-5 h-5 mb-0.5" />
                <span>Ask AI</span>
              </button>
            </div>

            {/* Timer — centre stage */}
            <TimerRing timeLeft={timeLeft} max={25} />

            {/* Question counter + safe haven */}
            <div className="text-right">
              <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Question</div>
              <div className="text-xl font-black text-white tabular-nums">{currentLevel + 1}<span className="text-white/25 text-sm">/{questions.length}</span></div>
              {safeHavenReward > 0 && (
                <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-[#FFD700]/60">
                  Safe: {safeHavenReward.toLocaleString()} MTC
                </div>
              )}
            </div>
          </div>

          {/* ── Question box ──────────────────────────────────────────────────── */}
          <div className="w-full max-w-2xl mb-5">
            <div
              className={`relative border-2 rounded-2xl px-6 py-6 md:py-8 text-center transition-all duration-500 ${
                isLockedIn && !isRevealed ? "border-[#FFD700]/60 shadow-[0_0_40px_rgba(255,215,0,0.2)]" :
                isRevealed && selectedOption === question.correctAnswer ? "border-green-400/60 shadow-[0_0_40px_rgba(34,197,94,0.25)]" :
                isRevealed ? "border-red-500/50 shadow-[0_0_40px_rgba(220,38,38,0.2)]" :
                "border-white/12"
              }`}
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.4) 100%)" }}
            >
              {/* Category tag */}
              <div className="mb-3 inline-flex items-center gap-2 border border-white/12 bg-black/40 px-3 py-1 rounded-full">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">{levelBand} Round</span>
                <span className="w-1 h-1 rounded-full bg-[#FFD700]/40" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FFD700]/60">
                  {question.reward.toLocaleString()} MTC
                </span>
              </div>

              {/* Question */}
              <h2 className="font-black text-white leading-tight" style={{ fontSize: "clamp(1.1rem, 3.5vw, 1.8rem)" }}>
                {question.question}
              </h2>

              {/* AI suggestion label */}
              {aiSuggestion !== null && (
                <div className="mt-3 inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-1 rounded-full">
                  <AlertTriangle className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                    AI leans toward option {LETTERS[aiSuggestion]}
                  </span>
                </div>
              )}

              {/* Locking in spinner */}
              {isLockedIn && !isRevealed && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </div>

          {/* ── Answers grid ──────────────────────────────────────────────────── */}
          <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {question.options.map((opt, idx) => (
              <AnswerOption
                key={idx}
                letter={LETTERS[idx]}
                text={opt}
                state={getOptionState(idx)}
                onClick={() => handleSelect(idx)}
                aiPick={aiSuggestion === idx}
              />
            ))}
          </div>

          {/* ── Actions ───────────────────────────────────────────────────────── */}
          <div className="w-full max-w-2xl flex gap-3">
            <button
              onClick={handleWalkAway}
              disabled={isLockedIn}
              className="flex-1 py-3.5 font-black uppercase tracking-[0.2em] text-sm border border-white/12 bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-30"
            >
              Walk Away
            </button>
            <button
              onClick={() => handleLockIn()}
              disabled={selectedOption === null || isLockedIn}
              className="flex-1 py-3.5 font-black uppercase tracking-[0.2em] text-sm bg-[#FFD700] text-black rounded-xl hover:bg-yellow-400 active:scale-[0.98] transition-all shadow-[0_0_24px_rgba(255,215,0,0.3)] disabled:opacity-30 disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none"
            >
              Final Answer
            </button>
          </div>

          <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-white/15">
            A / B / C / D to select · Enter to lock in
          </p>
        </div>

        {/* ── Prize Ladder sidebar (desktop always, mobile on toggle) ─────────── */}
        <div className={`${showLadder ? "absolute inset-0 z-30 bg-black/95" : "hidden"} lg:relative lg:flex lg:flex-col lg:z-auto lg:bg-transparent w-full lg:w-64 xl:w-72 border-l border-white/8 bg-black/60 backdrop-blur overflow-y-auto`}>
          <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-white/8 px-4 py-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Prize Ladder</span>
            <button
              onClick={() => setShowLadder(false)}
              className="lg:hidden text-white/30 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
            >
              Close
            </button>
          </div>
          <div className="px-3 py-3">
            <PrizeLadder questions={questions} currentLevel={currentLevel} won={won} />
          </div>
        </div>

      </div>
    </div>
  );
}
