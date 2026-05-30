import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useUpcomingFixtures } from "../hooks/useData";
import { supabase } from "../lib/supabase";
import { CheckCircle2, Loader2, Trophy, Flame, Target, Star, ShieldAlert } from "lucide-react";
import TeamLogo from "../components/TeamLogo";
import AdBanner from "../components/AdBanner";
import { AD_STRATEGY, shouldShowFeedAd } from "../lib/adStrategy";


export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState<"make" | "my" | "premium">("make");
  const { isLoggedIn, user, coins, updateCoins, awardCoins } = useAuth();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<string, {home: string, away: string, saved: boolean}>>({});
  const [leagueFilter, setLeagueFilter] = useState<string>("all");
  const [myReceipts, setMyReceipts] = useState<any[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  const { data: fixtures = [] } = useUpcomingFixtures();
  const availableLeagues = useMemo(
    () => Array.from(new Set(fixtures.map((f: any) => f.league))).filter(Boolean),
    [fixtures]
  );
  const visibleFixtures = useMemo(
    () => fixtures.filter((f: any) => leagueFilter === "all" || f.league === leagueFilter),
    [fixtures, leagueFilter]
  );
  const lockedCalls = useMemo(() => Object.values(predictions).filter((p) => p.saved).length, [predictions]);
  const fixtureLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    fixtures.forEach((f: any) => {
      map[String(f.id)] = `${f.home} vs ${f.away}`;
    });
    return map;
  }, [fixtures]);

  const handlePredict = async (fixtureId: string) => {
    if (!isLoggedIn || !user) { 
      sessionStorage.setItem("auth_return_url", window.location.pathname);
      setLocation('/login'); 
      return; 
    }
    
    const pred = predictions[fixtureId];
    if (pred && pred.home !== "" && pred.away !== "") {
      setIsSubmitting(fixtureId);
      
      const { error } = await supabase.from("predictions").upsert({
        user_id: user.id,
        match_id: fixtureId,
        predicted_score: `${pred.home} - ${pred.away}`
      }, {
        onConflict: "user_id,match_id"
      });

      setIsSubmitting(null);
      
      if (!error) {
        setPredictions({ ...predictions, [fixtureId]: { ...pred, saved: true } });
        awardCoins('prediction_submitted');
      }
    }
  };

  const handleScoreChange = (fixtureId: string, team: 'home' | 'away', val: string) => {
    if (val !== "" && !/^\d+$/.test(val)) return;
    setPredictions(prev => ({
      ...prev,
      [fixtureId]: {
        home: team === 'home' ? val : (prev[fixtureId]?.home || ""),
        away: team === 'away' ? val : (prev[fixtureId]?.away || ""),
        saved: false
      }
    }));
  };

  const applyQuickScore = (fixtureId: string, score: string) => {
    const [home, away] = score.split("-");
    setPredictions((prev) => ({
      ...prev,
      [fixtureId]: { home: home.trim(), away: away.trim(), saved: false }
    }));
  };

  useEffect(() => {
    const loadMyReceipts = async () => {
      if (!isLoggedIn || !user || activeTab !== "my") return;
      setLoadingReceipts(true);
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setLoadingReceipts(false);
      if (error || !data) {
        setMyReceipts([]);
        return;
      }
      setMyReceipts(data);
    };
    loadMyReceipts();
  }, [activeTab, isLoggedIn, user]);

  useEffect(() => {
    if (!supabase || !isLoggedIn || !user || activeTab !== "my") return;
    const channel = supabase
      .channel("my-predictions-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "predictions", filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          const row = payload.new || payload.old;
          if (!row) return;
          setMyReceipts((prev) => {
            const without = prev.filter((p) => String(p.id) !== String(row.id));
            if (payload.eventType === "DELETE") return without;
            return [row, ...without];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, isLoggedIn, user]);

  // Credit MTC locally for any settled receipts not yet applied to local balance.
  // The settlement worker updates profiles.coins server-side, but the local coin
  // store also needs to reflect the win the moment a fan sees their receipt.
  useEffect(() => {
    if (!isLoggedIn || !user || myReceipts.length === 0) return;
    const creditedKey = `mtaani_credited_predictions_${user.id}`;
    const credited: string[] = JSON.parse(localStorage.getItem(creditedKey) || "[]");
    let totalNewCoins = 0;
    const newlyCredited: string[] = [];

    for (const receipt of myReceipts) {
      const id = String(receipt.id);
      if (credited.includes(id)) continue;
      const earned = Number(receipt.coins_awarded) || 0;
      if (earned > 0 && receipt.result && receipt.result !== "pending") {
        totalNewCoins += earned;
        newlyCredited.push(id);
      }
    }

    if (totalNewCoins > 0) {
      localStorage.setItem(creditedKey, JSON.stringify([...credited, ...newlyCredited]));
      updateCoins(totalNewCoins);
    }
  }, [myReceipts, isLoggedIn, user]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pb-20">
      {/* ── PREMIUM HERO SECTION ── */}
      <div className="relative bg-[#111] border-b border-white/5 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 via-primary/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="max-w-6xl mx-auto px-3 py-7 md:px-4 md:py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between xl:gap-12">
            
            <div className="flex-1 mb-8 md:mb-0">
              <div className="inline-flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/20 px-3 py-1 rounded-full mb-6">
                <Star className="w-4 h-4 text-[#FFD700]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Calls & Receipts</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-3 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Call It & <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">Keep Receipts</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base font-medium max-w-lg leading-relaxed">
                Make your call on the biggest fixtures, compare with Kenyan fans, and collect receipts when the scoreline backs you.
              </p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-white/35">
                Results posted within 24 hours of final whistle
              </p>
            </div>

            {/* Gamification Benefits Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:w-1/2 shrink-0">
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 md:p-4 border border-white/10 hover:bg-white/10 hover:border-[#FFD700]/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5 text-[#FFD700]" />
                </div>
                <h3 className="font-black text-white text-sm uppercase tracking-wider mb-1">+50 MTC</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">When your scoreline lands exactly.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 md:p-4 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-black text-white text-sm uppercase tracking-wider mb-1">+20 MTC</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">When your match result call is right.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 md:p-4 border border-white/10 hover:bg-white/10 hover:border-[#3B82F6]/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <h3 className="font-black text-white text-sm uppercase tracking-wider mb-1">Unlock</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Reach 100 XP to build Fan Zones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 md:px-4 py-6 md:py-8">
        {/* PREMIUM AD PLACEMENT */}
        <div className="mb-10">
          <AdBanner label="Platform Perks" type="horizontal" />
        </div>

        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="border border-white/10 bg-[#111] p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Upcoming</p>
            <p className="text-sm font-black text-white">{visibleFixtures.length}</p>
          </div>
          <div className="border border-white/10 bg-[#111] p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Locked Calls</p>
            <p className="text-sm font-black text-[#FFD700]">{lockedCalls}</p>
          </div>
          <div className="border border-white/10 bg-[#111] p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">My MTC</p>
            <p className="text-sm font-black text-accent">{coins.toLocaleString()}</p>
          </div>
          <div className="border border-white/10 bg-[#111] p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Mode</p>
            <p className="text-sm font-black text-white">Score Calls</p>
          </div>
        </div>

        {/* ── TAB NAVIGATION ── */}

        <div className="mb-8 overflow-x-auto hide-scrollbar">
          <div className="mx-auto flex w-max bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-xl">
            <button 
              onClick={() => setActiveTab("make")} 
              className={`px-6 md:px-10 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 relative ${
                activeTab === "make" 
                  ? "text-white bg-white/10 shadow-[inner_0_0_10px_rgba(255,255,255,0.05)]" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              Make a Call
              {activeTab === "make" && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-primary rounded-t-full shadow-[0_0_8px_#B30000]" />}
            </button>
            <button 
              onClick={() => setActiveTab("my")} 
              className={`px-6 md:px-10 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 relative ${
                activeTab === "my" 
                  ? "text-white bg-white/10 shadow-[inner_0_0_10px_rgba(255,255,255,0.05)]" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              My Receipts
              {activeTab === "my" && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-[#FFD700] rounded-t-full shadow-[0_0_8px_#FFD700]" />}
            </button>
            <button 
              onClick={() => setActiveTab("premium")} 
              className={`px-6 md:px-10 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 relative ${
                activeTab === "premium"
                  ? "text-white bg-[#FFD700]/10 shadow-[inner_0_0_10px_rgba(255,215,0,0.1)] border border-[#FFD700]/20" 
                  : "text-[#FFD700]/70 hover:text-[#FFD700] hover:bg-[#FFD700]/5"
              }`}
            >
              Fan Intel
              {activeTab === "premium" && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-[#FFD700] rounded-t-full shadow-[0_0_8px_#FFD700]" />}
            </button>
          </div>
        </div>

        {activeTab === "make" ? (
          <div className="space-y-5">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setLeagueFilter("all")}
                className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${leagueFilter === "all" ? "bg-white/10 border-white/30 text-white" : "bg-black border-white/10 text-gray-500"}`}
              >
                All Leagues
              </button>
              {availableLeagues.map((league) => (
                <button
                  key={league}
                  onClick={() => setLeagueFilter(league)}
                  className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${leagueFilter === league ? "bg-white/10 border-white/30 text-white" : "bg-black border-white/10 text-gray-500"}`}
                >
                  {league}
                </button>
              ))}
            </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            {visibleFixtures.map((fixture: any, idx: number) => {
              const isSaved = predictions[fixture.id]?.saved;
              const hScore = predictions[fixture.id]?.home || "";
              const aScore = predictions[fixture.id]?.away || "";

              return (
                <div key={fixture.id} className="contents">
                  <div 
                  className={`bg-[#111] rounded-xl border p-3 md:p-4 shadow-2xl relative overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in ${
                    isSaved ? 'border-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]' : 'border-white/5 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]'
                  }`}
                  style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[${fixture.homeColor || '#B30000'}]/10 via-transparent to-[${fixture.awayColor || '#1E6FFF'}]/10 opacity-30 pointer-events-none`} />
                  
                  {isSaved && (
                    <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 px-4 py-1.5 rounded-bl-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-l border-green-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                      <CheckCircle2 className="w-3.5 h-3.5 drop-shadow-md" /> Locked In
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{fixture.league}</span>
                    </div>
                    <span className="text-gray-500 text-[10px] md:text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-wider">{fixture.date} • {fixture.time}</span>
                  </div>

                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="flex flex-col items-center gap-2 w-1/3 group">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-xl scale-150 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <TeamLogo logo={fixture.homeLogo} initial={fixture.homeInitial} color={fixture.homeColor} size="xl" shadow />
                      </div>
                      <span className="font-black text-[11px] md:text-sm text-center uppercase tracking-widest text-white drop-shadow-md truncate w-full">{fixture.home}</span>
                    </div>

                    {/* SCOREBOARDS */}
                    <div className="flex items-center gap-2 md:gap-4 bg-black/40 p-2.5 rounded-2xl border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.03)] backdrop-blur-sm">
                      <input
                        type="text"
                        maxLength={2}
                        value={hScore}
                        onChange={(e) => handleScoreChange(fixture.id, 'home', e.target.value)}
                        disabled={isSaved || isSubmitting === fixture.id}
                        className={`w-12 h-12 md:w-14 md:h-14 bg-black border-2 rounded-xl text-center text-2xl md:text-3xl font-black text-white focus:outline-none disabled:opacity-50 transition-all ${
                          hScore ? `border-[${fixture.homeColor || '#B30000'}]/50 shadow-[0_0_15px_${fixture.homeColor || '#B30000'}40]` : 'border-white/5 focus:border-[#FFD700]/50'
                        }`}
                        placeholder="-"
                      />
                      <span className="text-gray-600 font-black text-xl md:text-2xl">-</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={aScore}
                        onChange={(e) => handleScoreChange(fixture.id, 'away', e.target.value)}
                        disabled={isSaved || isSubmitting === fixture.id}
                        className={`w-12 h-12 md:w-14 md:h-14 bg-black border-2 rounded-xl text-center text-2xl md:text-3xl font-black text-white focus:outline-none disabled:opacity-50 transition-all ${
                          aScore ? `border-[${fixture.awayColor || '#1E6FFF'}]/50 shadow-[0_0_15px_${fixture.awayColor || '#1E6FFF'}40]` : 'border-white/5 focus:border-[#FFD700]/50'
                        }`}
                        placeholder="-"
                      />
                    </div>

                    <div className="flex flex-col items-center gap-2 w-1/3 group">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-xl scale-150 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <TeamLogo logo={fixture.awayLogo} initial={fixture.awayInitial} color={fixture.awayColor} size="xl" shadow />
                      </div>
                      <span className="font-black text-[11px] md:text-sm text-center uppercase tracking-widest text-white drop-shadow-md truncate w-full">{fixture.away}</span>
                    </div>
                  </div>

                  {!isSaved && (
                    <div className="mb-3 flex flex-wrap gap-1.5 relative z-10">
                      {["1-0", "2-1", "1-1", "2-0", "0-0"].map((score) => (
                        <button
                          key={score}
                          onClick={() => applyQuickScore(fixture.id, score)}
                          className="px-2 py-1 text-[9px] font-black uppercase tracking-widest border border-white/10 bg-black/40 text-gray-300 hover:text-white hover:border-[#FFD700]/40"
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  )}

                  {isSaved ? (
                    <button
                      onClick={() => setPredictions({...predictions, [fixture.id]: { ...predictions[fixture.id], saved: false }})}
                      className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] py-3 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10"
                    >
                      Edit Call
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePredict(fixture.id)}
                      disabled={(hScore === "" || aScore === "") || isSubmitting === fixture.id}
                      className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF8C00] disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-500 text-black font-black uppercase tracking-[0.2em] text-[10px] py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:shadow-none relative z-10"
                    >
                      {isSubmitting === fixture.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {isLoggedIn ? "Lock In Call" : "Log In to Call It"}
                    </button>
                  )}
                </div>
                {shouldShowFeedAd(idx, AD_STRATEGY.predictionsFeedInterval, visibleFixtures.length) ? (
                  <div className="lg:col-span-2">
                    <AdBanner label="Prediction Feed Sponsor" type="horizontal" />
                  </div>
                ) : null}
                </div>
              );
            })}
            {visibleFixtures.length > 0 && visibleFixtures.length < AD_STRATEGY.predictionsFeedInterval && (
              <div className="lg:col-span-2">
                <AdBanner label="Prediction Feed Sponsor" type="horizontal" />
              </div>
            )}
          </div>
          </div>
      ) : activeTab === "my" ? (
        <div className="space-y-6">
          {!isLoggedIn ? (
            <div className="bg-[#1B1B1B] border border-white/10 rounded-xl p-8 text-center max-w-xl mx-auto mt-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl font-black">?</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest mb-2">Login Required</h2>
              <p className="text-gray-400 mb-6">You need an account to save calls and keep receipts.</p>
              <button onClick={() => { sessionStorage.setItem("auth_return_url", window.location.pathname); setLocation('/login'); }} className="bg-primary hover:bg-red-800 text-white font-bold uppercase tracking-wider px-8 py-3 rounded transition-colors">
                Log In / Sign Up
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {loadingReceipts ? (
                <div className="text-center py-8 text-gray-500 font-black uppercase tracking-widest text-xs">Loading receipts...</div>
              ) : myReceipts.length === 0 ? (
                <div className="bg-[#111] border border-white/10 rounded-xl p-8 text-center">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No receipts yet</p>
                  <p className="text-gray-600 text-xs mt-2 font-bold uppercase tracking-wider">Make calls in the Make a Call tab to build your receipt book.</p>
                </div>
              ) : myReceipts.map((item: any, i: number) => {
                const status = String(item.result || "pending").toLowerCase();
                const color = status === "correct" ? "green" : status === "partial" ? "yellow" : status === "pending" ? "yellow" : "red";
                const hex = color === "green" ? "#22c55e" : color === "yellow" ? "#eab308" : "#ef4444";
                const statusLabel = status === "correct" ? "PERFECT RECEIPT" : status === "partial" ? "RIGHT RESULT" : status === "pending" ? "PENDING" : "MISSED";
                const points = `+${item.coins_awarded || 0} MTC`;
                const matchLabel = fixtureLabelMap[String(item.match_id)] || String(item.match_id || "Fixture");
                const created = item.created_at ? new Date(item.created_at).toLocaleDateString("en-KE", { weekday: "short" }) : "Recent";
                return (
                <div 
                  key={i} 
                  className={`bg-[#111] border border-white/5 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden group animate-in slide-in-from-bottom-4 fade-in duration-500 hover:border-[${item.hex}]/30 transition-all`}
                  style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-2 bg-${color}-500 shadow-[0_0_15px_${hex}]`} />
                  <div className={`absolute -right-20 -top-20 w-64 h-64 bg-${color}-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-${color}-500/10 transition-colors duration-500`} />

                  <div className="flex items-center gap-4 w-full md:w-auto z-10">
                    <div className="w-10 h-10 rounded-full border-2 border-[#111] bg-white/10 flex items-center justify-center relative z-10 shadow-lg text-[9px] font-black uppercase tracking-widest">
                      ID
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] block mb-1.5 flex items-center gap-2">
                        Prediction <span className="w-1 h-1 rounded-full bg-gray-600"></span> {created}
                      </span>
                      <div className="font-black text-sm text-white tracking-widest">{matchLabel}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto bg-black/60 p-3 rounded-xl border border-white/5 backdrop-blur-sm z-10 justify-center">
                    <div className="text-center">
                      <span className="block text-[10px] text-gray-500 uppercase font-black tracking-[0.1em] mb-1">Your Call</span>
                      <span className="font-black text-xl text-white">{item.predicted_score || "-"}</span>
                    </div>
                    <div className="w-px h-10 bg-white/10 mx-2"></div>
                    <div className="text-center">
                      <span className="block text-[10px] text-gray-500 uppercase font-black tracking-[0.1em] mb-1">Actual</span>
                      <span className="font-black text-xl text-white">{item.actual_score || "-"}</span>
                    </div>
                  </div>

                  <div className={`flex flex-col items-center justify-center p-3 rounded-xl border z-10 w-full md:w-40 shrink-0 ${
                    color === "green" ? "bg-green-500/10 border-green-500/30 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]" : 
                    color === "yellow" ? "bg-yellow-500/10 border-yellow-500/30 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]" : 
                    "bg-red-500/10 border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]"
                  }`}>
                    <span className={`text-xs font-black uppercase tracking-[0.2em] mb-1 ${
                      color === "green" ? "text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" : 
                      color === "yellow" ? "text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" : 
                      "text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]"
                    }`}>{statusLabel}</span>
                    <span className={`text-base font-black ${
                      color === "green" ? "text-green-400" : 
                      color === "yellow" ? "text-yellow-400" : 
                      "text-red-400"
                    }`}>{points}</span>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black uppercase tracking-widest text-[#FFD700] mb-2 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">Fan Intel</h2>
            <p className="text-gray-400">Community reads from BallMtaani fans with a track record — tactical watch-points before you lock in your call.</p>
          </div>

          <div className="bg-[#111] border border-[#FFD700]/20 rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-transparent pointer-events-none" />
            <Star className="w-10 h-10 text-[#FFD700] mx-auto mb-4 animate-pulse relative z-10" />
            <h3 className="font-black text-white text-xl uppercase tracking-widest mb-3 relative z-10">Fan Analysts Coming for WC26</h3>
            <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed mb-6 relative z-10">
              We are onboarding the first wave of BallMtaani fan analysts ahead of the World Cup. Each one earns their badge through prediction receipts — no fake win rates, just real track records from real calls.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8 relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-lg font-black text-[#FFD700]">Receipt-backed</div>
                <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Every analyst earns their badge through verified prediction history.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-lg font-black text-[#FFD700]">MTC-gated</div>
                <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Reads cost MTC. Correct calls that you backed earn it back and more.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-lg font-black text-[#FFD700]">Kenya-first</div>
                <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Matchday context written in EAT, for fans who watch at the right times.</p>
              </div>
            </div>
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/8 px-5 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-[#FFD700]">
                Opening with the World Cup group stage — June 11
              </div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">
                In the meantime — ask <a href="/mchambuzi-halisi" className="text-primary hover:underline">Mchambuzi Halisi</a> for any tactical read you need right now
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
