import React, { useState, useEffect, useRef } from "react";
import { MatchPredictionOutput } from "../../lib/edge/types";
import { Button } from "../ui/button";
import { Play, Pause, RotateCcw, Volume2, Sparkles, Mic } from "lucide-react";

interface MchambuziAudioBriefProps {
  prediction: MatchPredictionOutput;
}

export default function MchambuziAudioBrief({ prediction }: MchambuziAudioBriefProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [supported, setSupported] = useState(true);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [activeLang, setActiveLang] = useState<"sheng" | "english">("sheng");

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressInterval = useRef<any>(null);

  const homeWinPct = Math.round(prediction.homeWinProb * 100);
  const drawPct = Math.round(prediction.drawProb * 100);
  const awayWinPct = Math.round(prediction.awayWinProb * 100);

  const shengScript = `Mambo vipi mwana-BallMtaani! Hapa ni Mchambuzi Halisi na ripoti ya mechi ya ${prediction.homeTeam} dhidi ya ${prediction.awayTeam} kwenye ${prediction.competition}. 
Model yetu ya Dixon-Coles inapigia ${prediction.homeTeam} upatu kwa asilimia ${homeWinPct}, Draw ikiwa asilimia ${drawPct}, na ${prediction.awayTeam} asilimia ${awayWinPct}. 
Kwenye Expected Goals, tunaona ${prediction.expectedHomeGoals} kwa ${prediction.expectedAwayGoals}. 
${prediction.storylines?.mtaaVerdict || "Uchambuzi unaonyesha mechi itakuwa na mabao ya kutosha."} 
Kaa chonjo na ushike risiti yako kabla ya kipenga cha kwanza!`;

  const englishScript = `Welcome to BallMtaani Edge match intelligence. Here is your tactical audio briefing for ${prediction.homeTeam} versus ${prediction.awayTeam} in the ${prediction.competition}. 
Our Dixon-Coles Poisson model projects ${prediction.homeTeam} with a ${homeWinPct} percent win probability, draw at ${drawPct} percent, and ${prediction.awayTeam} at ${awayWinPct} percent. 
Expected goals are calculated at ${prediction.expectedHomeGoals} to ${prediction.expectedAwayGoals}. 
${prediction.storylines?.strength || ""} 
Street Verdict: ${prediction.storylines?.mtaaVerdict || "High confidence on home advantage."} Keep your receipt on BallMtaani!`;

  const currentScript = activeLang === "sheng" ? shengScript : englishScript;

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      setSupported(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      clearInterval(progressInterval.current);
    };
  }, []);

  const startPlayback = () => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    clearInterval(progressInterval.current);

    const utterance = new SpeechSynthesisUtterance(currentScript);
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;
    utterance.lang = activeLang === "sheng" ? "sw-KE" : "en-GB";

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentProgress(0);
      const startTime = Date.now();
      const estimatedDuration = (currentScript.split(" ").length / (2.5 * playbackRate)) * 1000;

      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / estimatedDuration) * 100));
        setCurrentProgress(pct);
        if (pct >= 100) clearInterval(progressInterval.current);
      }, 250);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentProgress(100);
      clearInterval(progressInterval.current);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      clearInterval(progressInterval.current);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
      clearInterval(progressInterval.current);
    } else {
      startPlayback();
    }
  };

  const handleSpeedChange = () => {
    const rates = [1, 1.25, 1.5];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (isPlaying) {
      startPlayback();
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-[#0d1f18] via-[#121212] to-[#121212] p-6 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Mic className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              Mchambuzi Audio Briefing <Sparkles className="h-3.5 w-3.5 text-[#FFD700]" />
            </h3>
            <p className="text-[11px] text-gray-400">60-Second Match Audio Breakdown for fans on the go</p>
          </div>
        </div>

        {/* Language Pill Switcher */}
        <div className="flex items-center rounded-lg bg-black/40 p-1 border border-white/10 text-xs">
          <button
            onClick={() => {
              if (isPlaying) synthRef.current?.cancel();
              setIsPlaying(false);
              setActiveLang("sheng");
            }}
            className={`px-3 py-1 rounded-md font-bold transition-all ${
              activeLang === "sheng"
                ? "bg-emerald-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Swahili / Sheng
          </button>
          <button
            onClick={() => {
              if (isPlaying) synthRef.current?.cancel();
              setIsPlaying(false);
              setActiveLang("english");
            }}
            className={`px-3 py-1 rounded-md font-bold transition-all ${
              activeLang === "english"
                ? "bg-emerald-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Audio Waveform & Player Controls */}
      <div className="rounded-lg bg-black/50 border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={handleTogglePlay}
            className={`h-11 w-11 rounded-full p-0 flex items-center justify-center font-bold shadow-lg transition-all ${
              isPlaying
                ? "bg-amber-500 hover:bg-amber-600 text-black"
                : "bg-emerald-500 hover:bg-emerald-600 text-black"
            }`}
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
          </Button>

          {/* Animated Waveform Visualizer */}
          <div className="flex-1 flex items-center gap-1 h-8 px-2">
            {[35, 65, 90, 45, 100, 75, 40, 85, 95, 60, 30, 80, 70, 50, 90, 60, 40, 75, 95, 45, 85, 30].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-300 ${
                  isPlaying
                    ? "bg-emerald-400 animate-pulse"
                    : i * 4.5 <= currentProgress
                    ? "bg-emerald-600"
                    : "bg-white/10"
                }`}
                style={{
                  height: isPlaying ? `${Math.max(15, (h * (0.5 + Math.random() * 0.5)))}%` : `${h * 0.4}%`,
                  transitionDelay: `${i * 20}ms`,
                }}
              />
            ))}
          </div>

          {/* Playback Speed Controller */}
          <button
            onClick={handleSpeedChange}
            className="px-2.5 py-1 rounded bg-white/10 border border-white/15 text-[11px] font-mono font-bold text-gray-300 hover:bg-white/20 hover:text-white"
          >
            {playbackRate}x
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
          <div className="bg-emerald-400 h-1 rounded-full transition-all duration-300" style={{ width: `${currentProgress}%` }} />
        </div>
      </div>

      {/* Interactive Transcript */}
      <div className="rounded-lg bg-white/5 border border-white/5 p-3 text-xs leading-relaxed text-gray-300">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
          🎙️ Audio Commentary Transcript ({activeLang === "sheng" ? "Sheng Voice" : "English Voice"}):
        </span>
        <p className="italic text-gray-300">"{currentScript}"</p>
      </div>
    </div>
  );
}
