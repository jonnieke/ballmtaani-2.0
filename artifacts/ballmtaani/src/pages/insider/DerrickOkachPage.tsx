import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Play, Pause, Volume2, ShieldCheck, Sparkles, Mic, Award, Share2, MessageCircle, ArrowRight, Heart } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function DerrickOkachPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeArticle, setActiveArticle] = useState<number>(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const progressInterval = useRef<any>(null);

  const audioSpeechText = `Mambo vipi watu wangu! Hapa ni Derrick Okach, defender wa Shabana FC Tore Bobe. Karibu sana kwenye corner yangu hapa BallMtaani. 
Kucheza FKF Premier League, hasa tukiwa nyumbani pale Gusii Stadium mbele ya mashabiki zaidi ya elfu ishirini, ni kitu ambacho huwezi kueleza kwa maneno—ni moto mtupu! 
Hapa BallMtaani niko na nyinyi kupeana locker room insights, jinsi tunavyojipanga kimbinu dhidi ya timu kama Gor Mahia na Tusker, na pia kuangazia vipaji vya mashinani na shule za upili ambazo mara nyingi hazipati nafasi kwenye vyombo vya habari. 
Tore Bobe daima, na tukutane uwanjani!`;

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      clearInterval(progressInterval.current);
    };
  }, []);

  const handleToggleAudio = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
      clearInterval(progressInterval.current);
    } else {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(audioSpeechText);
      utterance.rate = 1.0;
      utterance.lang = "sw-KE";

      utterance.onstart = () => {
        setIsPlaying(true);
        setProgress(0);
        const startTime = Date.now();
        const estimatedDuration = 25000;
        progressInterval.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const pct = Math.min(100, Math.round((elapsed / estimatedDuration) * 100));
          setProgress(pct);
          if (pct >= 100) clearInterval(progressInterval.current);
        }, 250);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
        clearInterval(progressInterval.current);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        clearInterval(progressInterval.current);
      };

      synthRef.current.speak(utterance);
    }
  };

  const ARTICLES = [
    {
      id: 1,
      title: "Inside Gusii Stadium: What 20,000 Roaring Tore Bobe Fans Feel Like on Matchday",
      date: "August 2026",
      readTime: "4 min read",
      excerpt: "When the team bus turns into Gusii Stadium, the energy hits you before you even lace your boots. The singing starts two hours before kickoff. Here is what happens inside our locker room...",
      content: `Playing for Shabana FC is unlike playing for any other club in Kenya. The passion of the Gusii community is raw and uncompromising. When you pull on the jersey, you aren't just representing eleven men on the pitch; you are carrying the hopes of an entire region.

In our locker room, the pre-match talk focuses on intensity and structure. In the FKF Premier League, opponents try to slow the tempo down when they visit Gusii. Our job as defenders is to win the first header, maintain our high defensive line, and feed the wingers quickly. The noise from the terraces gives you an extra 20% stamina in the final 15 minutes of the match.`,
    },
    {
      id: 2,
      title: "Defending in the FKF Premier League: Battling Kenya's Deadliest Attackers",
      date: "August 2026",
      readTime: "5 min read",
      excerpt: "From Gor Mahia's quick transitions to Tusker's physical target men, defending in Kenya's top flight requires mental sharpness and zero hesitation. Here is my tactical breakdown.",
      content: `The modern Kenyan Premier League has evolved. It is no longer just about long balls and physical duels. Today's top strikers make sharp diagonal runs between the center back and the full back.

When preparing for a match against top-four teams, we spend the entire week reviewing video clips of opposition set-pieces. In tight games, 60% of decisive goals come from corner kicks and free kicks. Communication is everything—if your center back partner doesn't call the blind-side run, you get punished.`,
    },
    {
      id: 3,
      title: "Grassroots & School Talent: Why KSSSA is the True Heartbeat of Kenyan Football",
      date: "August 2026",
      readTime: "3 min read",
      excerpt: "Every great Kenyan player started in a school tournament or a dusty county pitch. Here is why we must protect and spotlight schoolboy prodigies before they slip through the cracks.",
      content: `When I watch games from St. Anthony's Kitale, Highway Secondary, or Kakamega High, I see hunger that you cannot teach. These young boys play with pure joy and tactical fearlessness.

Mainstream media only covers them during the National finals week and then forgets about them for the rest of the year. Through BallMtaani's Talanta Mtaani hub, we are giving these kids a permanent scout profile, verifying their stats, and connecting them to scouts across Kenya and East Africa.`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      <RouteSEO path="/insider/derrick-okach" />

      {/* Hero Banner with Pro-Athlete Badge */}
      <div className="border-b border-white/10 bg-gradient-to-b from-[#1a0f0f] via-[#121212] to-[#0A0A0A] px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Athlete Avatar / Badge */}
            <div className="relative">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-gradient-to-br from-[#B30000] via-[#800000] to-black p-1 shadow-2xl">
                <div className="h-full w-full rounded-2xl bg-[#141414] flex flex-col items-center justify-center border border-white/10">
                  <span className="text-3xl sm:text-4xl font-black text-white">DO</span>
                  <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-wider font-bold">#ShabanaFC</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-1.5 rounded-full shadow-lg border-2 border-[#0A0A0A]">
                <ShieldCheck className="h-4 w-4 stroke-[3]" />
              </div>
            </div>

            {/* Athlete Bio & Credentials */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge className="bg-[#B30000]/20 text-[#B30000] border-[#B30000]/40 text-xs font-bold">
                  Verified FKF Premier League Player
                </Badge>
                <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 text-xs font-bold">
                  Shabana FC ("Tore Bobe")
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                Derrick Okach
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                Active professional footballer playing in the FKF Premier League for Shabana FC. Official BallMtaani athlete columnist bringing you pitch-level tactical insights, Gusii Stadium matchday audio dispatches, and grassroots talent scouting.
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-mono text-gray-400">
                <span>📍 Gusii Stadium / Nairobi</span>
                <span>•</span>
                <span>🛡️ Defender / Midfielder</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">🏆 Tore Bobe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Audio Dispatch Player */}
        <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/20 via-[#121212] to-[#121212] p-6 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Mic className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  Derrick's Audio Locker Room Dispatch <Sparkles className="h-3.5 w-3.5 text-[#FFD700]" />
                </h3>
                <p className="text-[11px] text-gray-400">Voice Note from the FKF-PL Camp (Swahili / Sheng)</p>
              </div>
            </div>

            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              Exclusive Audio
            </Badge>
          </div>

          <div className="rounded-xl bg-black/50 border border-white/10 p-4 space-y-3">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleToggleAudio}
                className={`h-12 w-12 rounded-full p-0 flex items-center justify-center font-bold shadow-lg transition-all ${
                  isPlaying
                    ? "bg-amber-500 hover:bg-amber-600 text-black"
                    : "bg-[#B30000] hover:bg-[#800000] text-white"
                }`}
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
              </Button>

              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-300">
                  <span className="font-bold">Locker Room Dispatch: The Gusii Spirit &amp; Grassroots Power</span>
                  <span className="font-mono text-gray-400">{isPlaying ? "Playing..." : "Tap to Listen"}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-red-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-300 leading-relaxed italic">
              "{audioSpeechText}"
            </div>
          </div>
        </div>

        {/* Player Column Articles */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Derrick's Pitch Diary &amp; Analysis</h2>
            <p className="text-xs text-gray-400">Original writings directly from an active FKF Premier League professional</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARTICLES.map((art, idx) => (
              <div
                key={art.id}
                onClick={() => setActiveArticle(idx)}
                className={`rounded-2xl border p-5 space-y-3 cursor-pointer transition-all ${
                  activeArticle === idx
                    ? "border-red-500/50 bg-[#161616] shadow-xl ring-1 ring-red-500/30"
                    : "border-white/10 bg-[#121212] hover:border-white/20"
                }`}
              >
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                  {art.date} • {art.readTime}
                </span>

                <h3 className="font-bold text-white text-sm leading-snug hover:text-red-400 transition-colors">
                  {art.title}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {art.excerpt}
                </p>

                <div className="pt-2 text-xs text-red-400 font-bold flex items-center gap-1">
                  Read Full Column <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>

          {/* Active Article Full View */}
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-4 space-y-1">
              <span className="text-xs text-red-400 font-bold uppercase tracking-wider">
                Column Article #{ARTICLES[activeArticle].id}
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                {ARTICLES[activeArticle].title}
              </h2>
              <span className="text-xs text-gray-400 block font-mono">
                By Derrick Okach (Shabana FC Defender) • {ARTICLES[activeArticle].readTime}
              </span>
            </div>

            <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line space-y-4 pt-2">
              {ARTICLES[activeArticle].content}
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <Link href="/talanta">
                <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs">
                  View Derrick's Scouted Talents <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
