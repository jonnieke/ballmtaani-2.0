import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { getRandomTriviaSet, TriviaQuestion } from "../data/mockTrivia";
import { fetchAiTrivia } from "../lib/gemini-trivia";
import { ChevronLeft, User, RefreshCw, Volume2, VolumeX, AlertTriangle, CheckCircle, XCircle, Flame, Timer } from "lucide-react";
import { ShareCard } from "../components/ShareCard";

export default function TriviaPage() {
  const { isLoggedIn, awardCoins, username } = useAuth();
  const [, setLocation] = useLocation();

  const [questions, setQuestions] = useState<TriviaQuestion[]>(() => getRandomTriviaSet());
  const [isLoadingAi, setIsLoadingAi] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [statusScore, setStatusScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [impactBanner, setImpactBanner] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    async function loadTrivia() {
      setIsLoadingAi(true);
      const aiQuestions = await fetchAiTrivia();
      if (aiQuestions && aiQuestions.length === 15) {
        setQuestions(aiQuestions);
      } else {
        console.log("Gemini AI failed - falling back to high-quality trivia pool.");
      }
      setIsLoadingAi(false);
    }
    loadTrivia();
  }, []);

  // Lifelines
  const [lifeline5050, setLifeline5050] = useState(true);
  const [lifelineAskAI, setLifelineAskAI] = useState(true);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<number | null>(null);

  const question: TriviaQuestion = questions[currentLevel];
  const safeHavenReward = currentLevel > 9 ? questions[9]?.reward || 0 : currentLevel > 4 ? questions[4]?.reward || 0 : 0;
  const levelBand =
    currentLevel <= 4 ? "Now" :
    currentLevel <= 9 ? "Modern" :
    "Legends";

  // Sounds (mocked since we don't have files, but using our audio lib if needed, or visual indicators)
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem("auth_return_url", window.location.pathname);
      setLocation("/login");
    }
  }, [isLoggedIn, setLocation]);

  useEffect(() => {
    if (!isLoggedIn || gameOver || won || isLockedIn) return;
    if (timeLeft <= 0) {
      handleLockIn(null);
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [timeLeft, isLoggedIn, gameOver, won, isLockedIn]);

  useEffect(() => {
    setTimeLeft(25);
    setImpactBanner(null);
  }, [currentLevel]);

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
      if (key === "enter") {
        e.preventDefault();
        handleLockIn();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLockedIn, hiddenOptions, selectedOption, gameOver, won]);

  if (!isLoggedIn) return null;

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
    
    // Simulate tension delay
    setTimeout(() => {
      setIsRevealed(true);
      
      if (finalChoice !== question.correctAnswer) {
        // Wrong answer
        setImpactBanner("wrong");
        setStreak(0);
        setTimeout(() => {
          setGameOver(true);
          // Calculate reward based on safe havens. Level 4 (Q5) and Level 9 (Q10).
          let safeReward = 0;
          if (currentLevel > 9) safeReward = questions[9].reward;
          else if (currentLevel > 4) safeReward = questions[4].reward;
          
          if (safeReward > 0) {
            awardCoins('trivia_correct');
          }
          setStatusScore(safeReward);
        }, 2000);
      } else {
        // Right answer
        setImpactBanner("correct");
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
        setCorrectCount((c) => c + 1);
        awardCoins('trivia_correct');
        setTimeout(() => {
          if (currentLevel === questions.length - 1) {
            awardCoins('trivia_complete');
            setStatusScore(question.reward);
            setWon(true);
          } else {
            // Next Question
            setCurrentLevel(prev => prev + 1);
            setSelectedOption(null);
            setIsLockedIn(false);
            setIsRevealed(false);
            setHiddenOptions([]);
            setAiSuggestion(null);
          }
        }, 3000);
      }
    }, Math.random() * 2000 + 1500); // Random delay 1.5s - 3.5s for tension
  };

  const handleWalkAway = () => {
    if (isLockedIn) return;
    const reward = currentLevel > 0 ? questions[currentLevel - 1].reward : 0;
    if (reward > 0) awardCoins('trivia_correct');
    setStatusScore(reward);
    setGameOver(true);
  };

  const use5050 = () => {
    if (!lifeline5050 || isLockedIn) return;
    setLifeline5050(false);
    const incorrect = [0, 1, 2, 3].filter(i => i !== question.correctAnswer);
    // shuffle and take two
    const toHide = incorrect.sort(() => 0.5 - Math.random()).slice(0, 2);
    setHiddenOptions(toHide);
  };

  const useAskAI = () => {
    if (!lifelineAskAI || isLockedIn) return;
    setLifelineAskAI(false);
    // AI has 80% chance of being right
    const isCorrect = Math.random() < 0.8;
    if (isCorrect) {
      setAiSuggestion(question.correctAnswer);
    } else {
      const incorrect = [0, 1, 2, 3].filter(i => i !== question.correctAnswer && !hiddenOptions.includes(i));
      const wrongChoice = incorrect[Math.floor(Math.random() * incorrect.length)];
      setAiSuggestion(wrongChoice);
    }
  };


  const [showShare, setShowShare] = useState(false);

  if (isLoadingAi) {
    return (
      <div className="min-h-screen bg-[#000511] text-white flex flex-col items-center justify-center p-4">
        <div className="relative">
          <RefreshCw className="w-16 h-16 text-[#FFD700] animate-spin mb-6" />
          <div className="absolute inset-0 bg-[#FFD700]/20 blur-xl animate-pulse" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-[0.2em] animate-pulse">
          AI Generating Questions...
        </h2>
        <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">
          Scanning Latest Headlines to Deep History
        </p>
      </div>
    );
  }

  if (won || gameOver) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#FFD700]/5 blur-[150px] pointer-events-none" />
        
        <div className="bg-[#111] p-8 md:p-12 rounded-3xl border border-white/10 text-center max-w-lg w-full relative z-10 shadow-2xl">
          {won ? (
             <h1 className="text-4xl md:text-6xl font-black text-[#FFD700] mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] uppercase tracking-widest">
               Trivia Cleared
             </h1>
          ) : (
             <h1 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-widest">
               Game Over
             </h1>
          )}
          
          <p className="text-gray-400 font-bold mb-8 uppercase tracking-widest">
            You walked away with
          </p>

          <div className="text-5xl md:text-7xl font-black text-[#FFD700] mb-12 drop-shadow-md">
            {statusScore.toLocaleString()} <span className="text-2xl text-gray-500">MTC</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-8">
            <div className="border border-white/10 bg-black/40 p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Accuracy</p>
              <p className="text-sm font-black text-white">
                {Math.round((correctCount / Math.max(1, currentLevel + (won ? 1 : 0))) * 100)}%
              </p>
            </div>
            <div className="border border-white/10 bg-black/40 p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Best Streak</p>
              <p className="text-sm font-black text-orange-300">{bestStreak}</p>
            </div>
            <div className="border border-white/10 bg-black/40 p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Level Reached</p>
              <p className="text-sm font-black text-[#1E6FFF]">{currentLevel + (won ? 1 : 0)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button onClick={() => setShowShare(true)} className="bg-[#1E6FFF] hover:bg-blue-600 shadow-[0_0_15px_rgba(30,111,255,0.4)] text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all w-full">
              Share Achievement
            </button>
            <Link href="/" className="bg-[#1B1B1B] hover:bg-white/10 border border-white/10 py-4 rounded-xl font-bold uppercase tracking-widest transition-colors w-full">
              Back to Home
            </Link>
            <button onClick={() => window.location.reload()} className="bg-primary hover:bg-red-700 shadow-[0_0_15px_rgba(179,0,0,0.5)] text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all w-full">
              Play Again
            </button>
            <button
              onClick={() => {
                setQuestions(getRandomTriviaSet());
                setCurrentLevel(0);
                setSelectedOption(null);
                setIsLockedIn(false);
                setIsRevealed(false);
                setGameOver(false);
                setWon(false);
                setStatusScore(0);
                setStreak(0);
                setBestStreak(0);
                setCorrectCount(0);
                setLifeline5050(true);
                setLifelineAskAI(true);
                setHiddenOptions([]);
                setAiSuggestion(null);
                setImpactBanner(null);
                setTimeLeft(25);
              }}
              className="bg-[#1B1B1B] hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-colors w-full"
            >
              Another Run
            </button>
          </div>
        </div>

        {showShare && (
          <ShareCard
            achievement={won ? "I cleared BallMtaani Trivia!" : `I reached ${statusScore.toLocaleString()} MTC in Trivia`}
            coinsEarned={statusScore}
            emoji={won ? "WIN" : "QUIZ"}
            shareUrl={`https://ballmtaani.com/?ref=${username || 'fan'}`}
            onClose={() => setShowShare(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000511] text-white flex flex-col relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-[#000511] pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] transition-colors duration-1000 ${
          isRevealed && selectedOption === question.correctAnswer ? 'bg-green-600/20' : 
          isRevealed && selectedOption !== question.correctAnswer ? 'bg-red-600/20' : 
          isLockedIn ? 'bg-[#FFD700]/20' : 'bg-[#1E6FFF]/10'}`} 
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-4 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <Link href="/" className="inline-flex items-center gap-2 hover:text-[#FFD700] transition-colors">
          <ChevronLeft className="w-6 h-6" />
          <span className="font-bold hidden sm:inline uppercase tracking-widest">Quit</span>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-gray-400 hover:text-white transition-colors">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <div className="bg-[#1B1B1B] px-4 py-1.5 rounded-full border border-white/10 shadow-[0_0_10px_rgba(255,215,0,0.1)]">
            <span className="font-black text-[#FFD700] tracking-widest">Trivia Ladder</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 md:px-8 py-3 border-b border-white/5 bg-black/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="border border-white/10 bg-[#111] px-3 py-2">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Question</p>
            <p className="text-sm font-black text-white">{currentLevel + 1}/{questions.length}</p>
          </div>
          <div className="border border-white/10 bg-[#111] px-3 py-2">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Timer</p>
            <p className={`text-sm font-black inline-flex items-center gap-1 ${timeLeft <= 8 ? "text-red-400" : "text-white"}`}>
              <Timer className="w-3.5 h-3.5" /> {timeLeft}s
            </p>
            <div className="mt-2">
              <svg viewBox="0 0 36 36" className="w-14 h-14">
                <path d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831a15.9155 15.9155 0 1 1 0-31.831" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <path
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831a15.9155 15.9155 0 1 1 0-31.831"
                  fill="none"
                  stroke={timeLeft <= 8 ? "#f87171" : "#1E6FFF"}
                  strokeWidth="3"
                  strokeDasharray={`${(timeLeft / 25) * 100}, 100`}
                />
              </svg>
            </div>
          </div>
          <div className="border border-white/10 bg-[#111] px-3 py-2">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Streak</p>
            <p className="text-sm font-black inline-flex items-center gap-1 text-orange-300"><Flame className="w-3.5 h-3.5" /> {streak}</p>
          </div>
          <div className="border border-white/10 bg-[#111] px-3 py-2">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Safe Net</p>
            <p className="text-sm font-black text-[#FFD700]">{safeHavenReward.toLocaleString()} MTC</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        
        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          
          {/* Lifelines */}
          <div className="flex gap-4 mb-8 md:mb-12">
            <button 
              onClick={use5050}
              disabled={!lifeline5050 || isLockedIn}
              className={`w-16 h-12 md:w-20 md:h-14 rounded-full flex items-center justify-center border-2 font-black transition-all shadow-lg ${
                lifeline5050 ? 'border-[#1E6FFF] bg-[#0A1930] hover:bg-[#1E6FFF]/20 text-white' : 'border-white/10 bg-white/5 text-gray-500'
              }`}
            >
              <span className="tracking-tighter">50:50</span>
            </button>
            <button 
              onClick={useAskAI}
              disabled={!lifelineAskAI || isLockedIn}
              className={`w-16 h-12 md:w-20 md:h-14 rounded-full flex items-center justify-center border-2 font-black transition-all shadow-lg ${
                lifelineAskAI ? 'border-primary bg-primary/10 hover:bg-primary/20 text-white' : 'border-white/10 bg-white/5 text-gray-500'
              }`}
            >
              <User className="w-6 h-6" />
            </button>
          </div>

          {/* Question Box */}
          <div className="w-full max-w-4xl bg-gradient-to-b from-[#111] to-[#0A0A0A] border-y-2 md:border-2 border-[#1E6FFF]/50 md:rounded-full py-8 md:py-12 px-6 md:px-16 text-center shadow-[0_0_30px_rgba(30,111,255,0.2)] mb-8 relative">
            {impactBanner && (
              <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                impactBanner === "correct" ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}>
                {impactBanner === "correct" ? "Correct" : "Wrong Answer"}
              </div>
            )}
            <span className="inline-block mb-3 px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-white/10 bg-black/30 text-gray-300">
              {levelBand} Round
            </span>
            <h2 className="text-xl md:text-3xl lg:text-4xl font-black tracking-wide leading-tight drop-shadow-md">
              {question.question}
            </h2>
            {/* AI Suggestion indicator */}
            {aiSuggestion !== null && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> AI Suggests: Option {['A','B','C','D'][aiSuggestion]}
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-12 md:gap-y-6">
            {question.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isHidden = hiddenOptions.includes(idx);
              const isSelected = selectedOption === idx;
              const isCorrect = isRevealed && idx === question.correctAnswer;
              const isWrongSelected = isRevealed && isSelected && idx !== question.correctAnswer;
              
              const isAiPick = aiSuggestion === idx;

              let styleModifiers = 'border-white/10 bg-[#0B0B0B] hover:border-[#1E6FFF]/50 hover:bg-[#111] text-gray-300';
              if (isHidden) {
                 styleModifiers = 'border-transparent bg-transparent text-transparent opacity-0 pointer-events-none';
              } else if (isRevealed) {
                if (isCorrect) styleModifiers = 'bg-green-600 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-pulse';
                else if (isWrongSelected) styleModifiers = 'bg-red-700 border-red-500 text-white';
                else styleModifiers = 'border-white/5 bg-black text-gray-600';
              } else if (isLockedIn && isSelected) {
                styleModifiers = 'bg-[#FFD700] border-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.5)] animate-pulse';
              } else if (isSelected) {
                styleModifiers = 'border-[#FFD700]/70 bg-[#FFD700]/10 text-white';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full relative flex items-center gap-4 px-6 py-4 md:py-5 border-2 rounded-full font-bold md:text-xl transition-all duration-300 group ${styleModifiers}`}
                >
                  <span className={`text-[#FFD700] font-black group-hover:text-white transition-colors ${isLockedIn && isSelected ? 'text-black' : ''} ${isRevealed && isCorrect ? 'text-white' : ''}`}>
                    {letter}:
                  </span>
                  <span className="flex-1 text-left">{opt}</span>
                  {isAiPick && !isRevealed && <div className="absolute right-6 w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_red] animate-ping" title="AI thinks this is it" />}
                  {isRevealed && isCorrect && <CheckCircle className="w-6 h-6 absolute right-6 text-white" />}
                  {isRevealed && isWrongSelected && <XCircle className="w-6 h-6 absolute right-6 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="mt-8 flex gap-4 w-full max-w-sm">
            <button 
              onClick={handleWalkAway}
              disabled={isLockedIn}
              className="flex-1 bg-[#1B1B1B] border border-white/10 hover:bg-white/10 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              Walk Away
            </button>
            <button 
              onClick={handleLockIn}
              disabled={selectedOption === null || isLockedIn}
              className="flex-1 bg-[#FFD700] hover:bg-yellow-400 text-black py-4 rounded-xl font-black uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none"
            >
              Final Answer
            </button>
          </div>
          <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Keyboard: A/B/C/D to select • Enter to lock</p>

        </div>

        {/* Trivia ladder sidebar */}
        <div className="w-full lg:w-72 bg-black/60 border-t lg:border-t-0 lg:border-l border-white/10 p-6 flex flex-col justify-end backdrop-blur-xl">
           <div className="flex flex-col-reverse gap-1">
             {questions.map((q, idx) => {
               const isSafe = idx === 4 || idx === 9;
               const isActive = idx === currentLevel;
               const isPassed = idx < currentLevel;

               let itemStyle = 'text-gray-500';
               if (isActive) itemStyle = 'bg-[#FFD700] text-black font-black rounded px-3 py-1 shadow-[0_0_10px_rgba(255,215,0,0.6)] -mx-3';
               else if (isPassed) itemStyle = 'text-[#FFD700]';
               else if (isSafe) itemStyle = 'text-white font-bold';

               return (
                 <div key={q.id} className={`flex justify-between items-center text-sm md:text-base transition-all duration-300 ${itemStyle}`}>
                   <span className="w-6 font-bold">{idx + 1}</span>
                   <span className="flex-1 text-right flex items-center justify-end gap-1">
                      {isSafe && !isActive && <div className="w-1.5 h-1.5 rounded-full bg-white/30 mr-1" />}
                      {q.reward.toLocaleString()} MTC
                   </span>
                 </div>
               );
             })}
           </div>
        </div>

      </div>
    </div>
  );
}
