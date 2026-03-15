import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Trophy, Users, MessageSquare, ChevronRight, Zap, PlayCircle, Star, ShieldAlert, Sparkles, Share2, TrendingUp, Calendar } from "lucide-react";
import { BANTER_TWEETS, CLUB_LOGOS, AI_PREDICTIONS } from "../data/mockData";
import { useMatches, useUpcomingFixtures, useDebates, useLeaderboard } from "../hooks/useData";
import TeamLogo from "../components/TeamLogo";
import AdBanner from "../components/AdBanner";
import { SkeletonMatch } from "../components/Skeletons";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [heroBannerError, setHeroBannerError] = useState(false);

  // Supabase Hooks
  const { data: liveMatches = [], isLoading: isLoadingMatches } = useMatches();
  const { data: upcomingFixtures = [], isLoading: isLoadingUpcoming } = useUpcomingFixtures();
  const { data: debates = [] } = useDebates();
  const { data: leaderboard = [] } = useLeaderboard();

  // Highlight the best match: live first, then upcoming
  const featuredMatch = liveMatches[0] || upcomingFixtures[0] || null;
  const isMatchLive = !!liveMatches[0];

  return (
    <div className="pb-12">

      {/* ═══════════════════════════════════════════
          HERO SECTION — full-width cinematic banner
      ═══════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: 420 }}>
        {/* Hero background image */}
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80"
          alt="Football stadium"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; setHeroBannerError(true); }}
        />
        {/* Dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent"></div>
        {/* Red glow accent */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-primary/25 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-14 md:py-20 flex flex-col md:flex-row items-center gap-10 md:gap-0">
          {/* Left — headline */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 rounded-full px-4 py-1.5 mb-5 shadow-[0_0_15px_rgba(179,0,0,0.2)]">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-primary font-black text-xs uppercase tracking-widest">Africa's #1 Football Hub</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter mb-6">
              Predict.<br/>
              <span className="text-primary drop-shadow-[0_0_30px_rgba(179,0,0,0.5)]">Debate.</span><br/>
              Dominate.
            </h1>
            <p className="text-gray-300 text-base md:text-lg font-medium mb-10 max-w-md leading-relaxed">
              The ultimate social platform for African football fans. Call every scoreline, win every argument, and join the continent's biggest fan zones.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/trivia" className="bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_10px_30px_rgba(255,215,0,0.4)] transition-all hover:scale-105 active:scale-95 text-sm flex items-center gap-2 group">
                Play & Earn MTC
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/debates" className="bg-white/5 border border-white/20 hover:bg-white/10 text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95 text-sm">
                Explore Community
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex gap-8 mt-12">
              {[
                { icon: <Users className="w-5 h-5 text-primary" />, value: "50K+", label: "Fans Online" },
                { icon: <TrendingUp className="w-5 h-5 text-[#FFD700]" />, value: "12K+", label: "Daily Predictions" },
                { icon: <Zap className="w-5 h-5 text-[#1E6FFF]" />, value: "LIVE", label: "Match Scores" },
              ].map((s, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    {s.icon}
                  </div>
                  <div>
                    <span className="block font-black text-base text-white leading-tight">{s.value}</span>
                    <span className="block text-[10px] text-gray-500 uppercase font-extrabold tracking-widest">{s.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — featured match card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:w-[380px] shrink-0 perspektiv-lg"
          >
            <AnimatePresence mode="wait">
              {featuredMatch ? (
                <motion.div 
                  key={featuredMatch.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden relative group"
                >
                  {/* Glowing edge */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="px-6 pt-6 pb-4 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isMatchLive ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                      <span className="text-white font-black text-[11px] tracking-widest uppercase px-2 py-0.5 rounded bg-white/10">
                        {isMatchLive ? 'Live Now' : 'Featured Match'}
                      </span>
                    </div>
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      {featuredMatch.league || 'Premier League'}
                    </span>
                  </div>

                  <div className="px-6 py-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 relative z-10">
                    <div className="flex flex-col items-center gap-4 min-w-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <TeamLogo logo={featuredMatch.homeLogo || CLUB_LOGOS[featuredMatch.home]} initial={featuredMatch.homeInitial} color={featuredMatch.homeColor} size="xl" shadow />
                      </div>
                      <span className="font-black text-base md:text-lg tracking-wide uppercase text-center w-full px-1 break-words leading-tight">{featuredMatch.home}</span>
                    </div>

                    <div className="text-center px-1">
                      {isMatchLive ? (
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-3xl md:text-4xl font-black text-white">{featuredMatch.homeScore}</span>
                            <span className="text-xl md:text-2xl font-black text-gray-600">:</span>
                            <span className="text-3xl md:text-4xl font-black text-white">{featuredMatch.awayScore}</span>
                          </div>
                          <span className="text-primary font-black text-[10px] tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20 whitespace-nowrap">
                            {featuredMatch.minute}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-600 font-extrabold text-2xl tracking-tighter">VS</span>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-4 min-w-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <TeamLogo logo={featuredMatch.awayLogo || CLUB_LOGOS[featuredMatch.away]} initial={featuredMatch.awayInitial} color={featuredMatch.awayColor} size="xl" shadow />
                      </div>
                      <span className="font-black text-base md:text-lg tracking-wide uppercase text-center w-full px-1 break-words leading-tight">{featuredMatch.away}</span>
                    </div>
                  </div>

                  <div className="px-6 pb-6 relative z-10">
                    <Link
                      href={isMatchLive ? `/live-center/${featuredMatch.id}` : "/predictions"}
                      className="block w-full text-center bg-white text-black hover:bg-gray-200 font-black uppercase tracking-widest py-4 rounded-xl shadow-xl transition-all active:scale-95 text-sm"
                    >
                      {isMatchLive ? 'Live Center' : 'Predict Scorer'}
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 p-10 text-center">
                  <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No Featured Matches</p>
                </div>
              )}
            </AnimatePresence>

            {/* Sub-fixtures */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              {(isMatchLive ? upcomingFixtures.slice(0, 2) : liveMatches.slice(0, 2)).map((m, idx) => (
                <Link key={m.id} href={`/live-center/${m.id}`} className="block">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + (idx * 0.1) }}
                    className="rounded-2xl bg-[#1A1A1A]/80 backdrop-blur-md border border-white/10 p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#252525] transition-all cursor-pointer group shadow-lg hover:shadow-primary/10 hover:border-primary/30"
                  >
                    <div className="flex items-center justify-between w-full min-w-0 px-2">
                      <span className="font-black text-sm text-white">{m.home.substring(0, 3).toUpperCase()}</span>
                      <div className="bg-primary px-2 py-0.5 rounded text-[10px] font-black text-white tracking-widest animate-pulse border border-white/20">
                        LIVE
                      </div>
                      <span className="font-black text-sm text-white">{m.away.substring(0, 3).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-lg font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] bg-white/5 w-full justify-center py-1 rounded-lg border border-white/5">
                      {m.homeScore !== undefined ? (
                        <>
                          <span>{m.homeScore}</span>
                          <span className="text-primary">-</span>
                          <span>{m.awayScore}</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">{m.time}</span>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          AD BANNER
      ═══════════════════════════════════════════ */}
      <section className="py-6 border-b border-[#1B1B1B] bg-[#0B0B0B]">
        <div className="max-w-6xl mx-auto px-4">
          <AdBanner label="Featured Partner" type="horizontal" />
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          THE ARCADE (GAMIFICATION)
      ═══════════════════════════════════════════ */}
      <section className="py-16 bg-[#0B0B0B] border-b border-[#1B1B1B] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#1E6FFF]/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest mb-2 font-display">
              The <span className="text-[#FFD700]">Arcade</span>
            </h2>
            <p className="text-gray-400 font-bold uppercase tracking-wider text-sm md:text-base">Play daily. Climb the ranks. Earn Mtaani Coins.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/rapid-fire" className="group rounded-3xl bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-white/10 p-8 shadow-xl hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-[#1E6FFF] opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-16 h-16 rounded-2xl bg-[#1E6FFF]/20 border border-[#1E6FFF]/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(30,111,255,0.3)]">
                <Zap className="w-8 h-8 text-[#1E6FFF]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-wider mb-3">Rapid Fire</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">Swipe. Vote. Earn. Addictive TikTok-style football debates that pay you to play.</p>
              <span className="inline-flex items-center gap-2 text-[#1E6FFF] font-black uppercase text-xs tracking-widest">
                Play Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link href="/trivia" className="group rounded-3xl bg-gradient-to-br from-[#1a1400] to-[#0A0A0A] border border-[#FFD700]/20 p-8 shadow-[0_10px_30px_rgba(255,215,0,0.05)] hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-[#FFD700] opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-16 h-16 rounded-2xl bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                <Trophy className="w-8 h-8 text-[#FFD700]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-wider mb-3 text-[#FFD700]">Millionaire</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">How much football do you really know? Risk it all to win the grand prize of 1,000,000 MTC.</p>
              <span className="inline-flex items-center gap-2 text-[#FFD700] font-black uppercase text-xs tracking-widest">
                Risk it all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link href="/predictions" className="group rounded-3xl bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-white/10 p-8 shadow-xl hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(179,0,0,0.3)]">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-wider mb-3">A.I. Insight</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">Beat the Bot. Get premium tactical breakdown insights before you make your predictions.</p>
              <span className="inline-flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                Predict & Win <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SOCIAL WARFARE
      ═══════════════════════════════════════════ */}
      <section className="py-16 bg-[#050505] border-b border-[#1B1B1B] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-900/30 border border-red-500/30 mb-6 shadow-xl">
              <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Social PvP</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-6 font-display leading-[1.1] text-white">
              Settle The <span className="text-primary drop-shadow-[0_0_20px_rgba(179,0,0,0.6)]">Score.</span>
            </h2>
            
            <p className="text-gray-400 font-bold md:text-lg mb-8 max-w-lg leading-relaxed">
              Why just argue when you can prove it? Challenge toxic rival fans directly, raid debates to defend your club's honor, and climb the hierarchy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/rivalries"
                className="group relative px-8 py-4 bg-primary hover:bg-red-800 rounded-xl font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(179,0,0,0.4)] transition-all hover:scale-105 active:scale-95 overflow-hidden text-center text-sm"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-[150%] transition-transform duration-700 -skew-x-12 -ml-8"></div>
                Launch Grudge Match
              </Link>
              <Link 
                href="/debates"
                className="px-8 py-4 bg-white/5 border border-white/20 hover:bg-white/10 rounded-xl font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 text-center text-sm"
              >
                Defend in Debates
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             {/* Fan Zone Teaser */}
             <div className="rounded-2xl bg-[#111] border border-white/10 p-6 shadow-2xl relative overflow-hidden group hover:border-[#FFD700]/50 transition-colors">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FFD700]/10 blur-2xl rounded-full group-hover:bg-[#FFD700]/20 transition-colors"></div>
                <Users className="w-10 h-10 text-[#FFD700] mb-4" />
                <h3 className="text-lg font-black uppercase tracking-widest mb-2 text-white">Elite Fan Zones</h3>
                <p className="text-gray-500 text-xs font-bold leading-relaxed mb-4">Reach 100 app interactions to unlock Creator Status and host your own community.</p>
                <Link href="/fan-zones" className="text-[10px] font-black uppercase text-[#FFD700] tracking-widest flex items-center gap-1">Explore Zones <ChevronRight className="w-3 h-3" /></Link>
             </div>
             
             {/* Banta Teaser */}
             <div className="rounded-2xl bg-[#111] border border-white/10 p-6 shadow-2xl relative overflow-hidden group hover:border-[#1E6FFF]/50 transition-colors mt-0 sm:mt-10">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#1E6FFF]/10 blur-2xl rounded-full group-hover:bg-[#1E6FFF]/20 transition-colors"></div>
                <MessageSquare className="w-10 h-10 text-[#1E6FFF] mb-4" />
                <h3 className="text-lg font-black uppercase tracking-widest mb-2 text-white">Mtaani Banta</h3>
                <p className="text-gray-500 text-xs font-bold leading-relaxed mb-4">Get roasted by the BanterBot or throw shade directly at rival fans on the feed.</p>
                <Link href="/live-center" className="text-[10px] font-black uppercase text-[#1E6FFF] tracking-widest flex items-center gap-1">Read The Banta <ChevronRight className="w-3 h-3" /></Link>
             </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LIVE MATCH CENTER & BOUNTIES
      ═══════════════════════════════════════════ */}
      <section className="py-12 bg-[#0B0B0B] border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="uppercase font-black tracking-widest border-l-4 border-primary pl-3 mb-2 text-2xl flex items-center gap-3">
                Live Center Bounties
                <span className="bg-primary w-2 h-2 rounded-full animate-pulse"></span>
              </h2>
              <p className="text-gray-500 font-bold uppercase tracking-wider text-xs ml-4">In-game flash betting and live banter.</p>
            </div>
            <Link href="/matches" className="text-xs font-bold text-[#1E6FFF] hover:text-blue-400 uppercase tracking-wider flex items-center gap-1">
              View Match Directory <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {isLoadingMatches ? (
              [1, 2, 3].map(i => <SkeletonMatch key={i} />)
            ) : liveMatches.length > 0 ? liveMatches.map((match: any) => (
              <Link key={match.id} href={`/live-center/${match.id}`} className="block snap-start group">
                <div className="shrink-0 w-[320px] rounded-xl bg-[rgba(20,20,25,0.95)] border border-white/10 shadow-lg p-5 relative overflow-hidden transition-all hover:bg-[rgba(30,30,35,0.95)] cursor-pointer hover:border-primary/50">
                   <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg shadow-lg">LIVE</div>
                   
                   <div className="flex justify-between items-center mb-6 mt-2">
                     <div className="flex flex-col items-center gap-2">
                       <TeamLogo logo={match.homeLogo} initial={match.homeInitial} color={match.homeColor} size="sm" />
                       <span className="font-bold text-xs truncate max-w-[80px] text-gray-300">{match.home}</span>
                     </div>
                     <div className="flex items-center gap-3 text-3xl font-black">
                       <span>{match.homeScore}</span>
                       <span className="text-primary text-xl">:</span>
                       <span>{match.awayScore}</span>
                     </div>
                     <div className="flex flex-col items-center gap-2">
                       <TeamLogo logo={match.awayLogo} initial={match.awayInitial} color={match.awayColor} size="sm" />
                       <span className="font-bold text-xs truncate max-w-[80px] text-gray-300">{match.away}</span>
                     </div>
                   </div>

                   <div className="bg-[#111] rounded-lg p-3 border border-white/5">
                     <div className="text-[10px] text-[#FFD700] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                       <Zap className="w-3 h-3" /> Flash Bounty Active
                     </div>
                     <p className="text-xs font-bold text-white leading-snug">"Who scores the next goal?" — Predict now for 500 MTC.</p>
                   </div>
                </div>
              </Link>
            )) : (
              <div className="w-full rounded-2xl bg-[#111] border border-white/10 p-10 text-center">
                 <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                 <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No live matches right now. Check upcoming directory.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CHAMPIONS LEADERBOARD
      ═══════════════════════════════════════════ */}
      <section className="py-12 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <Trophy className="w-12 h-12 text-[#FFD700] mx-auto mb-4" />
           <h2 className="text-3xl font-black uppercase tracking-widest mb-2 font-display">
              Hall of <span className="text-[#FFD700]">Fame</span>
           </h2>
           <p className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-8">The most elite hosts and predictors in Africa.</p>

           <div className="rounded-2xl bg-[#1B1B1B] border border-white/5 shadow-2xl overflow-hidden text-left mb-6">
              {leaderboard.slice(0, 3).map((player: any, idx) => (
                <div key={player.rank} className={`flex items-center justify-between p-4 ${idx !== 2 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition-colors`}>
                  <div className="flex items-center gap-4">
                    <span className={`w-8 text-center font-black text-xl ${player.rank === 1 ? 'text-[#FFD700]' : player.rank === 2 ? 'text-gray-300' : 'text-[#CD7F32]'}`}>
                      #{player.rank}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[#0B0B0B] border border-white/10 flex items-center justify-center text-white text-sm font-black shadow-inner">
                      {player.name.substring(0, 1)}
                    </div>
                    <div>
                       <span className="font-black text-base md:text-lg block text-white">{player.name} {player.country}</span>
                       {player.streak > 2 && <span className="text-[10px] uppercase font-black text-primary">🔥 {player.streak} Day Streak</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-lg md:text-xl text-[#FFD700] drop-shadow-md">{player.pts} pts</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/leaderboard" className="inline-flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs py-3 px-8 rounded-full transition-colors">
              View Full Standings
            </Link>
        </div>
      </section>
    </div>
  );
}
