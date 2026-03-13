import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Share2, MessageSquare, ChevronRight, Trophy, Zap, Users, TrendingUp, Calendar } from "lucide-react";
import { BANTER_TWEETS, CLUB_LOGOS, AI_PREDICTIONS } from "../data/mockData";
import { useMatches, useUpcomingFixtures, useDebates, useLeaderboard } from "../hooks/useData";
import TeamLogo from "../components/TeamLogo";
import AdBanner from "../components/AdBanner";
import { SkeletonMatch } from "../components/Skeletons";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const { isLoggedIn, openLoginModal } = useAuth();
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
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-[#B30000]/25 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-14 md:py-20 flex flex-col md:flex-row items-center gap-10 md:gap-0">
          {/* Left — headline */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 bg-[#B30000]/20 border border-[#B30000]/40 rounded-full px-4 py-1.5 mb-5 shadow-[0_0_15px_rgba(179,0,0,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#B30000] animate-pulse"></span>
              <span className="text-[#B30000] font-black text-xs uppercase tracking-widest">Africa's #1 Football Hub</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter mb-6">
              Predict.<br/>
              <span className="text-[#B30000] drop-shadow-[0_0_30px_rgba(179,0,0,0.5)]">Debate.</span><br/>
              Dominate.
            </h1>
            <p className="text-gray-300 text-base md:text-lg font-medium mb-10 max-w-md leading-relaxed">
              The ultimate social platform for African football fans. Call every scoreline, win every argument, and join the continent's biggest fan zones.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/predictions" className="bg-[#B30000] hover:bg-red-800 text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_10px_30px_rgba(179,0,0,0.4)] transition-all hover:scale-105 active:scale-95 text-sm flex items-center gap-2 group">
                Make Predictions
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/debates" className="bg-white/5 border border-white/20 hover:bg-white/10 text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95 text-sm">
                Join Debates
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex gap-8 mt-12">
              {[
                { icon: <Users className="w-5 h-5 text-[#B30000]" />, value: "50K+", label: "Fans Online" },
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
                  <div className="absolute inset-0 bg-gradient-to-br from-[#B30000]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
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
                          <span className="text-[#B30000] font-black text-[10px] tracking-widest bg-[#B30000]/10 px-3 py-1 rounded-full border border-[#B30000]/20 whitespace-nowrap">
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
                    className="rounded-2xl bg-[#1A1A1A]/80 backdrop-blur-md border border-white/10 p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#252525] transition-all cursor-pointer group shadow-lg hover:shadow-[#B30000]/10 hover:border-[#B30000]/30"
                  >
                    <div className="flex items-center justify-between w-full min-w-0 px-2">
                      <span className="font-black text-sm text-white">{m.home.substring(0, 3).toUpperCase()}</span>
                      <div className="bg-[#B30000] px-2 py-0.5 rounded text-[10px] font-black text-white tracking-widest animate-pulse border border-white/20">
                        LIVE
                      </div>
                      <span className="font-black text-sm text-white">{m.away.substring(0, 3).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-lg font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] bg-white/5 w-full justify-center py-1 rounded-lg border border-white/5">
                      {m.homeScore !== undefined ? (
                        <>
                          <span>{m.homeScore}</span>
                          <span className="text-[#B30000]">-</span>
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
          LIVE MATCHES
      ═══════════════════════════════════════════ */}
      <section className="py-6 border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="uppercase font-black tracking-widest border-l-4 border-[#B30000] pl-3 mb-6 text-xl flex items-center gap-3">
            Live Action
            <span className="bg-[#B30000] w-2 h-2 rounded-full animate-pulse"></span>
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {isLoadingMatches ? (
              [1, 2, 3].map(i => <SkeletonMatch key={i} />)
            ) : liveMatches.map((match: any) => (
              <Link key={match.id} href={`/live-center/${match.id}`} className="block snap-start group">
                <div className="shrink-0 w-[300px] rounded-xl bg-[rgba(20,20,25,0.95)] border-l-[3px] border-[#B30000] border-y border-r border-white/10 shadow-lg p-4 relative overflow-hidden transition-all hover:bg-[rgba(30,30,35,0.95)] cursor-pointer">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{match.league}</span>
                    <span className="bg-[#B30000] text-white font-black text-[10px] uppercase px-2 py-0.5 rounded flex items-center gap-1">
                      LIVE <span className="animate-pulse">{match.minute}</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <TeamLogo logo={match.homeLogo} initial={match.homeInitial} color={match.homeColor} size="sm" />
                        <span className="font-bold text-sm truncate max-w-[80px]">{match.home}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TeamLogo logo={match.awayLogo} initial={match.awayInitial} color={match.awayColor} size="sm" />
                        <span className="font-bold text-sm truncate max-w-[80px]">{match.away}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-2xl font-black">{match.homeScore}</span>
                      <span className="text-2xl font-black">{match.awayScore}</span>
                      <span className="text-[8px] font-black text-[#B30000] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Live Stats →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TODAY'S FIXTURES
      ═══════════════════════════════════════════ */}
      <section className="py-6 border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <h2 className="uppercase font-black tracking-widest border-l-4 border-[#B30000] pl-3 text-xl">Today's Fixtures</h2>
            <Link href="/matches" className="text-xs font-bold text-[#1E6FFF] hover:text-blue-400 uppercase tracking-wider flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingFixtures.map((fixture: any) => (
              <div key={fixture.id} className="rounded-xl bg-[#1B1B1B] border border-white/5 p-4 shadow-lg hover:border-white/10 transition-colors">
                <div className="text-center mb-4">
                  <span className="bg-white/5 text-gray-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">{fixture.time}</span>
                </div>

                <div className="flex justify-between items-center mb-5">
                  <div className="flex flex-col items-center gap-2 w-[40%]">
                    <TeamLogo logo={fixture.homeLogo} initial={fixture.homeInitial} color={fixture.homeColor} size="md" />
                    <span className="font-bold text-xs text-center truncate w-full">{fixture.home}</span>
                  </div>

                  <div className="text-xs font-black text-gray-600">VS</div>

                  <div className="flex flex-col items-center gap-2 w-[40%]">
                    <TeamLogo logo={fixture.awayLogo} initial={fixture.awayInitial} color={fixture.awayColor} size="md" />
                    <span className="font-bold text-xs text-center truncate w-full">{fixture.away}</span>
                  </div>
                </div>

                <Link href="/predictions" className="block w-full text-center border border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-wider text-xs py-2 rounded transition-colors">
                  Predict
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          AI PREDICTIONS STRIP
      ═══════════════════════════════════════════ */}
      <section className="py-6 bg-[#0B0B0B] border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <h2 className="uppercase font-black tracking-widest border-l-4 border-[#FFD700] pl-3 text-xl flex items-center gap-2">
              <span className="text-[#FFD700]">AI</span> Predictions
            </h2>
            <Link href="/predictions" className="text-xs font-bold text-[#FFD700] hover:Yellow-400 uppercase tracking-wider flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AI_PREDICTIONS.map((pred) => (
              <div key={pred.id} className="rounded-xl bg-[#1B1B1B] border border-white/5 p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#FFD700] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">AI Intel</div>

                <div className="flex items-center justify-between mb-4 pt-1">
                  <div className="flex items-center gap-2">
                    <TeamLogo logo={CLUB_LOGOS[pred.homeTeam]} initial={pred.homeTeam[0]} color="#555" size="md" />
                    <span className="text-xs font-bold text-gray-300">{pred.homeTeam}</span>
                  </div>
                  <span className="text-[10px] text-gray-600 font-black">vs</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-300">{pred.awayTeam}</span>
                    <TeamLogo logo={CLUB_LOGOS[pred.awayTeam]} initial={pred.awayTeam[0]} color="#555" size="md" />
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#0B0B0B] border border-white/10 px-4 py-2 rounded flex-1 text-center">
                    <span className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Most Likely Score</span>
                    <span className="font-black text-xl text-[#FFD700]">{pred.predScore}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-gray-400">Home ({pred.homeProb}%)</span>
                    <span className="text-gray-400">Away ({pred.awayProb}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                    <div className="h-full bg-white transition-all" style={{ width: `${pred.homeProb}%` }}></div>
                    <div className="h-full bg-gray-600 transition-all" style={{ width: `${pred.drawProb}%` }}></div>
                    <div className="h-full bg-[#1E6FFF] transition-all" style={{ width: `${pred.awayProb}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TRENDING DEBATES
      ═══════════════════════════════════════════ */}
      <section className="py-6 border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <h2 className="uppercase font-black tracking-widest border-l-4 border-[#1E6FFF] pl-3 text-xl">Trending Debates</h2>
            <Link href="/debates" className="hidden md:flex text-xs font-bold text-[#1E6FFF] hover:text-blue-400 uppercase tracking-wider items-center gap-1">
              Join All Debates <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {debates.slice(0, 3).map((debate: any) => (
              <div key={debate.id} className="rounded-xl bg-[#1B1B1B] border border-white/5 p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-lg mb-4 text-center">{debate.title}</h3>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-sm text-gray-300">{debate.left}</span>
                    <span className="font-bold text-sm text-gray-300">{debate.right}</span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex mb-2">
                    <div className="h-full bg-[#B30000] transition-all" style={{ width: `${debate.leftVotes}%` }}></div>
                    <div className="h-full bg-[#1E6FFF] transition-all" style={{ width: `${debate.rightVotes}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-500">
                    <span>{debate.leftVotes}%</span>
                    <span>{debate.rightVotes}%</span>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">{debate.totalVotes} votes</span>
                  <button
                    onClick={() => !isLoggedIn ? openLoginModal() : null}
                    className="bg-[#1E6FFF] hover:bg-blue-700 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded transition-colors"
                  >
                    Vote Now
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Link href="/debates" className="mt-6 md:hidden w-full flex justify-center text-xs font-bold text-[#1E6FFF] hover:text-blue-400 uppercase tracking-wider items-center gap-1 bg-white/5 py-3 rounded-lg">
            Join All Debates <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BANTER + LEADERBOARD
      ═══════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <h2 className="uppercase font-black tracking-widest border-l-4 border-[#B30000] pl-3 mb-6 text-xl flex items-center gap-2">
            Mtaani Banter
            <MessageSquare className="w-5 h-5 text-[#B30000]" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BANTER_TWEETS.slice(0, 2).map((banter, i) => (
              <div key={i} className="rounded-xl bg-[#1B1B1B] border border-white/5 p-5 shadow-lg relative">
                <div className="absolute top-4 right-4 text-white/10">
                  <MessageSquare className="w-8 h-8 fill-current" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B30000] to-[#1E6FFF] flex items-center justify-center text-white text-xs font-black">AI</div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">BanterBot</span>
                </div>
                <p className="text-sm font-medium leading-relaxed mb-4 relative z-10">"{banter}"</p>
                <div className="flex gap-2">
                  <button className="text-[10px] uppercase font-bold text-gray-400 hover:text-white flex items-center gap-1 border border-white/10 px-3 py-1.5 rounded hover:bg-white/5 transition-colors">
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="uppercase font-black tracking-widest border-l-4 border-[#FFD700] pl-3 text-xl flex items-center gap-2">
              Top Fans
              <Trophy className="w-5 h-5 text-[#FFD700]" />
            </h2>
          </div>
          <div className="rounded-xl bg-[#1B1B1B] border border-white/5 shadow-lg overflow-hidden">
            <div className="divide-y divide-white/5">
              {leaderboard.slice(0, 5).map((player: any) => (
                <div key={player.rank} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-center font-black text-sm ${player.rank === 1 ? 'text-[#FFD700]' : player.rank === 2 ? 'text-gray-300' : player.rank === 3 ? 'text-[#CD7F32]' : 'text-gray-600'}`}>
                      {player.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#0B0B0B] border border-white/10 flex items-center justify-center text-white text-xs font-black">
                      {player.name.substring(0, 1)}
                    </div>
                    <span className="font-bold text-sm">{player.name} {player.country}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-sm text-[#FFD700]">{player.pts} pts</span>
                    {player.streak > 2 && <span className="text-[9px] uppercase font-bold text-[#B30000]">🔥 {player.streak} streak</span>}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/leaderboard" className="block w-full p-3 text-center text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider bg-white/5 hover:bg-white/10 transition-colors">
              View Full Leaderboard
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
