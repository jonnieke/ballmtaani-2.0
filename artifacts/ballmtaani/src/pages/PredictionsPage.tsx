import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useUpcomingFixtures } from "../hooks/useData";
import { supabase } from "../lib/supabase";
import { CheckCircle2, Loader2, Trophy, Flame, Target, Star, ShieldAlert } from "lucide-react";
import TeamLogo from "../components/TeamLogo";

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState<"make" | "my" | "premium">("make");
  const { isLoggedIn, user, coins, updateCoins } = useAuth();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<string, {home: string, away: string, saved: boolean}>>({});

  const { data: fixtures = [] } = useUpcomingFixtures();

  const handlePredict = async (fixtureId: string) => {
    if (!isLoggedIn || !user) { setLocation('/login'); return; }
    
    const pred = predictions[fixtureId];
    if (pred && pred.home !== "" && pred.away !== "") {
      setIsSubmitting(fixtureId);
      
      const { error } = await supabase.from("predictions").insert({
        user_id: user.id,
        match_id: fixtureId,
        predicted_score: `${pred.home} - ${pred.away}`
      });

      setIsSubmitting(null);
      
      if (!error) {
        setPredictions({ ...predictions, [fixtureId]: { ...pred, saved: true } });
        updateCoins(50); // Mtaani Coins reward for making a prediction
      }
    }
  };

  // State for Premium Predictions unlock
  const [unlockedPremium, setUnlockedPremium] = useState<string[]>([]);
  
  const handleUnlockPremium = (id: string, cost: number) => {
    if (coins >= cost) {
      updateCoins(-cost);
      setUnlockedPremium([...unlockedPremium, id]);
    } else {
      setLocation('/store');
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

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pb-20">
      {/* ── PREMIUM HERO SECTION ── */}
      <div className="relative bg-[#111] border-b border-white/5 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 via-primary/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between xl:gap-12">
            
            <div className="flex-1 mb-8 md:mb-0">
              <div className="inline-flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/20 px-3 py-1 rounded-full mb-6">
                <Star className="w-4 h-4 text-[#FFD700]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Play & Earn</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-4 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Predict & <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">Dominate</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base font-medium max-w-lg leading-relaxed">
                Make your match predictions, climb the global leaderboard, and earn XP to unlock exclusive Premium Fan Zones.
              </p>
            </div>

            {/* Gamification Benefits Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:w-1/2 shrink-0">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-[#FFD700]/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5 text-[#FFD700]" />
                </div>
                <h3 className="font-black text-white text-sm uppercase tracking-wider mb-1">+50 Coins</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">For every exact score prediction.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-black text-white text-sm uppercase tracking-wider mb-1">+20 Coins</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">For guessing the correct result.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-[#3B82F6]/30 transition-all duration-300 group">
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ── TAB NAVIGATION ── */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-xl w-fit">
            <button 
              onClick={() => setActiveTab("make")} 
              className={`px-6 md:px-10 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 relative ${
                activeTab === "make" 
                  ? "text-white bg-white/10 shadow-[inner_0_0_10px_rgba(255,255,255,0.05)]" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              Fixtures
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
              My Tickets
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
              Legend's Intel
              {activeTab === "premium" && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-[#FFD700] rounded-t-full shadow-[0_0_8px_#FFD700]" />}
            </button>
          </div>
        </div>

        {activeTab === "make" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {fixtures.map((fixture: any, idx: number) => {
              const isSaved = predictions[fixture.id]?.saved;
              const hScore = predictions[fixture.id]?.home || "";
              const aScore = predictions[fixture.id]?.away || "";

              return (
                <div 
                  key={fixture.id} 
                  className={`bg-[#111] rounded-[2rem] border p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in ${
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

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{fixture.league}</span>
                    </div>
                    <span className="text-gray-500 text-[10px] md:text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-wider">{fixture.date} • {fixture.time}</span>
                  </div>

                  <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex flex-col items-center gap-4 w-1/3 group">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-xl scale-150 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <TeamLogo logo={fixture.homeLogo} initial={fixture.homeInitial} color={fixture.homeColor} size="xl" shadow />
                      </div>
                      <span className="font-black text-sm md:text-base text-center uppercase tracking-widest text-white drop-shadow-md truncate w-full">{fixture.home}</span>
                    </div>

                    {/* SCOREBOARDS */}
                    <div className="flex items-center gap-3 md:gap-6 bg-black/40 p-4 rounded-3xl border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.03)] backdrop-blur-sm">
                      <input
                        type="text"
                        maxLength={2}
                        value={hScore}
                        onChange={(e) => handleScoreChange(fixture.id, 'home', e.target.value)}
                        disabled={isSaved || isSubmitting === fixture.id}
                        className={`w-14 h-16 md:w-20 md:h-24 bg-black border-[3px] rounded-2xl text-center text-4xl md:text-5xl font-black text-white focus:outline-none disabled:opacity-50 transition-all ${
                          hScore ? `border-[${fixture.homeColor || '#B30000'}]/50 shadow-[0_0_15px_${fixture.homeColor || '#B30000'}40]` : 'border-white/5 focus:border-[#FFD700]/50'
                        }`}
                        placeholder="-"
                      />
                      <span className="text-gray-600 font-black text-2xl md:text-3xl">-</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={aScore}
                        onChange={(e) => handleScoreChange(fixture.id, 'away', e.target.value)}
                        disabled={isSaved || isSubmitting === fixture.id}
                        className={`w-14 h-16 md:w-20 md:h-24 bg-black border-[3px] rounded-2xl text-center text-4xl md:text-5xl font-black text-white focus:outline-none disabled:opacity-50 transition-all ${
                          aScore ? `border-[${fixture.awayColor || '#1E6FFF'}]/50 shadow-[0_0_15px_${fixture.awayColor || '#1E6FFF'}40]` : 'border-white/5 focus:border-[#FFD700]/50'
                        }`}
                        placeholder="-"
                      />
                    </div>

                    <div className="flex flex-col items-center gap-4 w-1/3 group">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-xl scale-150 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <TeamLogo logo={fixture.awayLogo} initial={fixture.awayInitial} color={fixture.awayColor} size="xl" shadow />
                      </div>
                      <span className="font-black text-sm md:text-base text-center uppercase tracking-widest text-white drop-shadow-md truncate w-full">{fixture.away}</span>
                    </div>
                  </div>

                  {isSaved ? (
                    <button
                      onClick={() => setPredictions({...predictions, [fixture.id]: { ...predictions[fixture.id], saved: false }})}
                      className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] text-xs py-4 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10"
                    >
                      Edit Prediction
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePredict(fixture.id)}
                      disabled={(hScore === "" || aScore === "") || isSubmitting === fixture.id}
                      className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF8C00] disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-500 text-black font-black uppercase tracking-[0.2em] text-xs py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:shadow-none relative z-10"
                    >
                      {isSubmitting === fixture.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {isLoggedIn ? "Lock In Prediction" : "Log In to Predict"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
      ) : activeTab === "my" ? (
        <div className="space-y-6">
          {!isLoggedIn ? (
            <div className="bg-[#1B1B1B] border border-white/10 rounded-xl p-8 text-center max-w-xl mx-auto mt-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl font-black">?</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest mb-2">Login Required</h2>
              <p className="text-gray-400 mb-6">You need an account to view and make predictions.</p>
              <button onClick={() => setLocation('/login')} className="bg-primary hover:bg-red-800 text-white font-bold uppercase tracking-wider px-8 py-3 rounded transition-colors">
                Log In / Sign Up
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {[
                { label: "Premier League", date: "Yesterday", teams: ["Arsenal", "Chelsea"], logos: ["https://media.api-sports.io/football/teams/42.png", "https://media.api-sports.io/football/teams/49.png"], predicted: "2 - 1", actual: "2 - 1", result: "EXACT SCORE", points: "+50 Coins", color: "green", hex: "#22c55e" },
                { label: "Premier League", date: "Sat",       teams: ["Man City", "Liverpool"], logos: ["https://media.api-sports.io/football/teams/50.png", "https://media.api-sports.io/football/teams/40.png"], predicted: "2 - 0", actual: "3 - 1", result: "CORRECT RESULT", points: "+20 Coins", color: "yellow", hex: "#eab308" },
                { label: "Ligue 1",        date: "Fri",       teams: ["PSG", "Monaco"],       logos: ["https://media.api-sports.io/football/teams/85.png", "https://media.api-sports.io/football/teams/79.png"], predicted: "2 - 1", actual: "0 - 3", result: "MISSED", points: "0 Coins", color: "red", hex: "#ef4444" },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`bg-[#111] border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group animate-in slide-in-from-bottom-4 fade-in duration-500 hover:border-[${item.hex}]/30 transition-all`}
                  style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-2 bg-${item.color}-500 shadow-[0_0_15px_${item.hex}]`} />
                  <div className={`absolute -right-20 -top-20 w-64 h-64 bg-${item.color}-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-${item.color}-500/10 transition-colors duration-500`} />

                  <div className="flex items-center gap-6 w-full md:w-auto z-10">
                    <div className="flex items-center gap-[-10px]">
                       <div className="w-12 h-12 rounded-full border-2 border-[#111] bg-white flex items-center justify-center relative z-10 shadow-lg"><img src={item.logos[0]} alt="" className="w-8 h-8 object-contain" /></div>
                       <div className="w-12 h-12 rounded-full border-2 border-[#111] bg-white flex items-center justify-center -ml-4 shadow-lg"><img src={item.logos[1]} alt="" className="w-8 h-8 object-contain" /></div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] block mb-1.5 flex items-center gap-2">
                        {item.label} <span className="w-1 h-1 rounded-full bg-gray-600"></span> {item.date}
                      </span>
                      <div className="font-black text-lg text-white tracking-widest">{item.teams[0]} <span className="text-gray-600 font-normal mx-1">v</span> {item.teams[1]}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto bg-black/60 p-4 rounded-xl border border-white/5 backdrop-blur-sm z-10 justify-center">
                    <div className="text-center">
                      <span className="block text-[10px] text-gray-500 uppercase font-black tracking-[0.1em] mb-1">Your Call</span>
                      <span className="font-black text-2xl text-white">{item.predicted}</span>
                    </div>
                    <div className="w-px h-10 bg-white/10 mx-2"></div>
                    <div className="text-center">
                      <span className="block text-[10px] text-gray-500 uppercase font-black tracking-[0.1em] mb-1">Actual</span>
                      <span className="font-black text-2xl text-white">{item.actual}</span>
                    </div>
                  </div>

                  <div className={`flex flex-col items-center justify-center p-4 rounded-xl border z-10 w-full md:w-48 shrink-0 ${
                    item.color === "green" ? "bg-green-500/10 border-green-500/30 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]" : 
                    item.color === "yellow" ? "bg-yellow-500/10 border-yellow-500/30 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]" : 
                    "bg-red-500/10 border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]"
                  }`}>
                    <span className={`text-xs font-black uppercase tracking-[0.2em] mb-1 ${
                      item.color === "green" ? "text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" : 
                      item.color === "yellow" ? "text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" : 
                      "text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]"
                    }`}>{item.result}</span>
                    <span className={`text-xl font-black ${
                      item.color === "green" ? "text-green-400" : 
                      item.color === "yellow" ? "text-yellow-400" : 
                      "text-red-400"
                    }`}>{item.points}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black uppercase tracking-widest text-[#FFD700] mb-2 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">Legend's Intel</h2>
            <p className="text-gray-400">Unlock high-accuracy predictions from our top historically accurate Fan Legends.</p>
          </div>
          
          {[
            { id: "leg1", name: "TacticsMtaani", winRate: "84%", league: "Premier League", cost: 2000, match: "Arsenal vs Man City", tip: "Expect a cagey low-block from Arsenal. Under 2.5 goals. Exact score: 1-1." },
            { id: "leg2", name: "TheOracle", winRate: "79%", league: "La Liga", cost: 2000, match: "Real Madrid vs Barcelona", tip: "Vinicius will exploit Barca's high line. Expect over 3.5 goals. Exact score: 3-1 Real Madrid." }
          ].map((intel, i) => {
            const isUnlocked = unlockedPremium.includes(intel.id);
            return (
              <div key={i} className="bg-[#111] border border-[#FFD700]/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(255,215,0,0.05)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-[#FFD700]/10 transition-colors"></div>
                
                <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-[2px] rounded-full shadow-lg">
                      <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center font-black text-[#FFD700] text-xl">
                        {intel.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-white text-lg">{intel.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-[#B30000]/20 text-[#B30000] text-[10px] font-black uppercase px-2 py-0.5 rounded border border-[#B30000]/30">{intel.winRate} Win Rate</span>
                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{intel.league}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Match Intel</span>
                    <span className="font-black text-white">{intel.match}</span>
                  </div>
                </div>

                {!isUnlocked ? (
                  <div className="bg-black/50 backdrop-blur-md rounded-xl border border-white/5 p-8 text-center relative overflow-hidden">
                    <Star className="w-8 h-8 text-[#FFD700] mx-auto mb-3 animate-pulse" />
                    <h5 className="font-black text-white uppercase tracking-widest mb-2">Intel Locked</h5>
                    <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">This legend's analytical prediction is hidden. Unlock to view the exact score prediction and tactical tip.</p>
                    
                    <button 
                      onClick={() => handleUnlockPremium(intel.id, intel.cost)}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF8C00] text-black font-black uppercase tracking-[0.2em] text-xs px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all hover:scale-105"
                    >
                      Unlock for {intel.cost} Coins
                    </button>
                    {coins < intel.cost && <p className="text-red-500 text-xs mt-3 font-bold">Not enough coins</p>}
                  </div>
                ) : (
                  <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl p-6 relative">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-[#FFD700]" />
                      <h5 className="font-black text-[#FFD700] uppercase tracking-widest text-sm">Unlocked Intel</h5>
                    </div>
                    <p className="text-white text-lg font-medium leading-relaxed">
                      "{intel.tip}"
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
