import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { TRIVIA_QUESTIONS, TriviaQuestion } from "../data/mockTrivia";
import { ChevronLeft, HelpCircle, User, RefreshCw, Volume2, VolumeX, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function TriviaPage() {
  const { isLoggedIn, updateCoins } = useAuth();
  const [, setLocation] = useLocation();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);

  // Lifelines
  const [lifeline5050, setLifeline5050] = useState(true);
  const [lifelineAskAI, setLifelineAskAI] = useState(true);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<number | null>(null);

  const question: TriviaQuestion = TRIVIA_QUESTIONS[currentLevel];

  // Sounds (mocked since we don't have files, but using our audio lib if needed, or visual indicators)
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isLoggedIn) {
    sessionStorage.setItem("auth_return_url", window.location.pathname);
    setLocation("/login");
    return null;
  }

  const handleSelect = (index: number) => {
    if (isLockedIn || hiddenOptions.includes(index)) return;
    setSelectedOption(index);
  };

  const handleLockIn = () => {
    if (selectedOption === null || isLockedIn) return;
    setIsLockedIn(true);
    
    // Simulate tension delay
    setTimeout(() => {
      setIsRevealed(true);
      
      if (selectedOption !== question.correctAnswer) {
        // Wrong answer
        setTimeout(() => {
          setGameOver(true);
          // Calculate reward based on safe havens. Level 4 (Q5) and Level 9 (Q10).
          let safeReward = 0;
          if (currentLevel > 9) safeReward = TRIVIA_QUESTIONS[9].reward;
          else if (currentLevel > 4) safeReward = TRIVIA_QUESTIONS[4].reward;
          
          if (safeReward > 0) {
            updateCoins(safeReward);
          }
          setEarnedCoins(safeReward);
        }, 2000);
      } else {
        // Right answer
        setTimeout(() => {
          if (currentLevel === TRIVIA_QUESTIONS.length - 1) {
            updateCoins(question.reward);
            setEarnedCoins(question.reward);
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
    const reward = currentLevel > 0 ? TRIVIA_QUESTIONS[currentLevel - 1].reward : 0;
    if (reward > 0) updateCoins(reward);
    setEarnedCoins(reward);
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


  if (won || gameOver) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#FFD700]/5 blur-[150px] pointer-events-none" />
        
        <div className="bg-[#111] p-8 md:p-12 rounded-3xl border border-white/10 text-center max-w-lg w-full relative z-10 shadow-2xl">
          {won ? (
             <h1 className="text-4xl md:text-6xl font-black text-[#FFD700] mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] uppercase tracking-widest">
               Millionaire!
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
            {earnedCoins.toLocaleString()} <span className="text-2xl text-gray-500">MTC</span>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/" className="bg-[#1B1B1B] hover:bg-white/10 border border-white/10 py-4 rounded-xl font-bold uppercase tracking-widest transition-colors w-full">
              Back to Home
            </Link>
            <button onClick={() => window.location.reload()} className="bg-primary hover:bg-red-700 shadow-[0_0_15px_rgba(179,0,0,0.5)] text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all w-full">
              Play Again
            </button>
          </div>
        </div>
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
            <span className="font-black text-[#FFD700] tracking-widest">Prize Pool</span>
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

        </div>

        {/* Millionaire Ladder Sidebar */}
        <div className="w-full lg:w-72 bg-black/60 border-t lg:border-t-0 lg:border-l border-white/10 p-6 flex flex-col justify-end backdrop-blur-xl">
           <div className="flex flex-col-reverse gap-1">
             {TRIVIA_QUESTIONS.map((q, idx) => {
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
                      🪙 {q.reward.toLocaleString()}
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
