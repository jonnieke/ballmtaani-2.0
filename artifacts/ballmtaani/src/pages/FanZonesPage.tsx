import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useFanZones, useBanter, useProfile } from "../hooks/useData";
import { supabase } from "../lib/supabase";
import { Users, ArrowLeft, MessageSquare, Heart, Send, Flame } from "lucide-react";
import AdBanner from "../components/AdBanner";
import { SkeletonBanter } from "../components/Skeletons";

export default function FanZonesPage() {
  const { isLoggedIn, user, username, awardCoins } = useAuth();
  const [, setLocation] = useLocation();
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regionFilter, setRegionFilter] = useState<"All" | "Europe" | "Africa">("All");
  const [localHeatOnly, setLocalHeatOnly] = useState(false);
  const [zoneSearch, setZoneSearch] = useState("");
  const [trendingVelocity, setTrendingVelocity] = useState<Record<string, number>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: zones = [] } = useFanZones();
  const { data: banter = [], isLoading: isLoadingBanter } = useBanter(activeZone);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (activeZone && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [banter, activeZone]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { 
      sessionStorage.setItem("auth_return_url", window.location.pathname);
      setLocation('/login'); 
      return; 
    }
    if (!newPost.trim() || !activeZone || !user) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("banter").insert({
      user_id: user.id,
      fan_zone_id: activeZone,
      content: newPost,
      author_name: username
    });

    if (error) {
      alert("Error posting banter. Please try again.");
    } else {
      setNewPost("");
      awardCoins('banter_posted');
    }
    setIsSubmitting(false);
  };

  const zone: any = zones.find((z: any) => z.id === activeZone);

  const { data: profile } = useProfile(user?.id);
  const interactions = profile?.interactions || 0;
  const isCreator = interactions >= 100;
  const favoriteTeam = String((profile as any)?.favorite_team || "").trim().toLowerCase();
  const starterPhrases = [
    "Score call for tonight?",
    "Who cooked tactically today?",
    "Ref decisions ruined this match.",
    "MOTM goes to who?",
  ];
  const kenyanClubHints = ["gor mahia", "afc leopards", "tusker", "bandari", "kakamega homeboyz"];
  const isKenyanClub = (name: string) => kenyanClubHints.some((hint) => name.toLowerCase().includes(hint));

  const quickZones = [
    zones.find((z: any) => String(z.team || z.team_name).toLowerCase().includes("gor mahia")),
    zones.find((z: any) => String(z.team || z.team_name).toLowerCase().includes("afc leopards")),
    zones.find((z: any) => favoriteTeam && String(z.team || z.team_name).toLowerCase().includes(favoriteTeam)),
  ].filter(Boolean) as any[];
  const trendingZones = [...zones]
    .sort((a: any, b: any) => {
      const aVel = trendingVelocity[a.id] || 0;
      const bVel = trendingVelocity[b.id] || 0;
      if (aVel !== bVel) return bVel - aVel;
      return Number(b.members_count || 0) - Number(a.members_count || 0);
    })
    .slice(0, 5);
  const derbyWatch = [
    { home: "Gor Mahia", away: "AFC Leopards" },
    { home: "Tusker", away: "Bandari" },
    { home: "Kakamega Homeboyz", away: "AFC Leopards" },
  ];
  const findZoneByName = (name: string) =>
    zones.find((z: any) => String(z.team || z.team_name || "").toLowerCase().includes(name.toLowerCase()));

  useEffect(() => {
    if (!supabase || zones.length === 0) return;
    let cancelled = false;

    const loadVelocity = async () => {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const zoneIds = zones.map((z: any) => z.id);
      const { data, error } = await supabase
        .from("banter")
        .select("fan_zone_id, created_at")
        .gte("created_at", since)
        .in("fan_zone_id", zoneIds);

      if (error || !data || cancelled) return;
      const counts: Record<string, number> = {};
      for (const row of data as any[]) {
        counts[row.fan_zone_id] = (counts[row.fan_zone_id] || 0) + 1;
      }
      setTrendingVelocity(counts);
    };

    loadVelocity();
    const timer = window.setInterval(loadVelocity, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [zones]);

  if (activeZone && zone) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-4 md:py-8 animate-in fade-in slide-in-from-right-4 duration-300 h-[calc(100vh-80px)] flex flex-col">
        <button
          onClick={() => setActiveZone(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 font-bold uppercase tracking-wider text-xs transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Zones
        </button>

        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex-1 flex flex-col bg-[#0A0A0A]">
          {/* Header */}
          <div className="p-4 md:p-6 relative overflow-hidden shrink-0" style={{ backgroundColor: zone.color || "#333" }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shadow-xl border-2 border-white/20 overflow-hidden shrink-0">
                {zone.logo || zone.logo_url ? (
                  <img src={zone.logo || zone.logo_url} alt={zone.team || zone.team_name} className="w-full h-full object-contain p-1.5" />
                ) : (
                  <span className="text-2xl font-black" style={{ color: zone.color || "#333" }}>{(zone.team || zone.team_name || "?")[0]}</span>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest leading-none mb-1">{zone.team || zone.team_name}</h1>
                <span className="text-white/80 font-bold flex items-center gap-1.5 text-[10px] uppercase">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live Club Room - {zone.members || zone.members_count || 0} Fans
                </span>
              </div>
            </div>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col-reverse gap-4 bg-[#0B0B0B]">
            <div ref={chatEndRef} />
            {isLoadingBanter ? (
              [1, 2, 3].map(i => <SkeletonBanter key={i} />)
            ) : banter.length === 0 ? (
              <div className="text-center py-10 my-auto">
                <MessageSquare className="w-12 h-12 text-gray-800 mx-auto mb-3" />
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Club room is quiet. Start the talk.</p>
              </div>
            ) : (
              banter.map((post: any) => {
                const isMe = post.user_id === user?.id;
                return (
                  <div key={post.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-lg relative ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-[#1B1B1B] border border-white/10 rounded-tl-sm'}`}>
                      {!isMe && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-xs uppercase tracking-wider text-gray-400" style={{ color: isMe ? 'rgba(255,255,255,0.7)' : zone.color }}>
                            {post.author_name || "Anonymous"}
                          </span>
                        </div>
                      )}
                      <p className="text-sm md:text-base leading-relaxed break-words">{post.content}</p>
                      <div className={`flex items-center gap-3 mt-2 text-[9px] uppercase tracking-widest font-bold ${isMe ? 'text-white/70 justify-end' : 'text-gray-500'}`}>
                        <span>{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Input */}
          <div className="p-3 md:p-4 bg-[#111] border-t border-white/10 shrink-0">
            <div className="mb-3 flex gap-2 overflow-x-auto hide-scrollbar">
              {starterPhrases.map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => setNewPost(phrase)}
                  className="shrink-0 border border-white/10 bg-black px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white hover:border-primary/40"
                >
                  {phrase}
                </button>
              ))}
            </div>
            <form onSubmit={handlePost} className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={isLoggedIn ? `Message ${zone.team || zone.team_name} room...` : "Log In to post"}
                disabled={!isLoggedIn || isSubmitting}
                className="flex-1 bg-black border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={(!newPost.trim() && isLoggedIn) || isSubmitting || !isLoggedIn}
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform ${(!newPost.trim() || !isLoggedIn) ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-blue-600 text-white hover:scale-105 shadow-[0_0_15px_rgba(30,111,255,0.4)]'}`}
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-4 py-6 md:py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider mb-3 bg-gradient-to-r from-red-500 via-blue-500 to-yellow-500 bg-clip-text text-transparent">Fan Zones</h1>
        <p className="text-gray-400 font-bold uppercase tracking-wide text-sm md:text-base">Where Kenyan fans gather, argue, and keep receipts.</p>
        <p className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-widest mt-3">Pick a club room, drop your take, and stack status.</p>
      </div>

      <div className="mb-5 md:mb-6">
        <AdBanner label="Fan Zone Sponsor" type="horizontal" />
      </div>

      <div className="mb-6 border border-white/10 bg-[#111] p-4">
        <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <input
            value={zoneSearch}
            onChange={(e) => setZoneSearch(e.target.value)}
            placeholder="Search club room (Arsenal, Gor Mahia, AFC Leopards...)"
            className="w-full md:max-w-md bg-black border border-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {quickZones.map((qz: any) => (
              <button
                key={qz.id}
                onClick={() => setActiveZone(qz.id)}
                className="shrink-0 border border-white/10 bg-black px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white hover:border-primary/40"
              >
                Open {qz.team || qz.team_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 border border-blue-500/20 bg-blue-950/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-blue-300" />
          <p className="text-xs font-black uppercase tracking-widest text-blue-200">Kenyan Derby Watch</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {derbyWatch.map((d) => {
            const homeZone = findZoneByName(d.home);
            const awayZone = findZoneByName(d.away);
            return (
              <button
                key={`${d.home}-${d.away}`}
                onClick={() => setActiveZone((homeZone || awayZone)?.id || null)}
                className="border border-white/10 bg-black/50 p-3 text-left hover:border-blue-400/40 transition-colors"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Derby Pulse</p>
                <p className="text-xs font-black uppercase tracking-widest text-white mt-1">
                  {d.home} vs {d.away}
                </p>
                <p className="text-[10px] font-bold text-blue-300 mt-1">
                  Jump to {homeZone?.team || awayZone?.team || "club"} room
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-8 border border-orange-500/20 bg-orange-950/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-400" />
          <p className="text-xs font-black uppercase tracking-widest text-orange-300">Trending In Kenya</p>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {trendingZones.map((tz: any, idx: number) => (
            <button
              key={tz.id}
              onClick={() => setActiveZone(tz.id)}
              className="shrink-0 border border-white/10 bg-black px-3 py-2 text-left min-w-[180px] hover:border-orange-400/50"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">#{idx + 1} Hot Room</p>
              <p className="text-xs font-black uppercase tracking-widest text-white mt-1">{tz.team || tz.team_name}</p>
              <p className="text-[10px] font-bold text-orange-300 mt-1">
                {trendingVelocity[tz.id] || 0} posts/hr • {(tz.members_count || 0).toLocaleString()} fans
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Creation Gate Section */}
      <div className="mb-10 rounded-xl bg-gradient-to-br from-[#1B1B1B] to-[#0A0A0A] p-4 md:p-7 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 w-full md:w-2/3">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#1E6FFF] text-white text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(30,111,255,0.5)]">
              Creator Status
            </span>
            {isCreator ? (
              <span className="text-green-500 text-xs font-bold uppercase">Unlocked</span>
            ) : (
              <span className="text-gray-500 text-xs font-bold uppercase">Locked</span>
            )}
          </div>
          
          <h2 className="text-2xl font-black uppercase tracking-widest mb-2 font-display">Create Your Own Fan Zone</h2>
          <p className="text-sm text-gray-400 font-medium mb-6">
            Think your fanbase deserves a spot? Show your ball knowledge. You need 100+ interactions (votes or calls) across BallMtaani to unlock Zone creation privileges.
          </p>
          
          <div className="bg-black/50 rounded-xl p-4 border border-white/5">
            <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider">
              <span className={isCreator ? "text-green-500" : "text-gray-400"}>
                {interactions} Interactions
              </span>
              <span className="text-gray-600">100 Required</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${isCreator ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-[#1E6FFF] shadow-[0_0_10px_rgba(30,111,255,0.5)]'}`}
                style={{ width: `${Math.min((interactions / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full md:w-auto flex justify-center">
          {isCreator ? (
            <button className="group relative w-full md:w-auto px-8 py-5 bg-gradient-to-r from-red-600 to-blue-600 rounded-xl font-black uppercase tracking-widest overflow-hidden hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -ml-4"></div>
              Launch Fan Zone
            </button>
          ) : (
            <button 
              onClick={() => setLocation('/debates')}
              className="w-full md:w-auto px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-black uppercase tracking-widest text-[#1E6FFF] transition-colors"
            >
              Join Debates
            </button>
          )}
        </div>
      </div>

      {/* Zone grid */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-white/5 pb-4">
        <h3 className="uppercase font-black tracking-widest border-l-4 border-red-500 pl-3 text-xl w-full sm:w-auto mb-4 sm:mb-0">Top Ranking Zones</h3>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setLocalHeatOnly((v) => !v)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shrink-0 ${
              localHeatOnly
                ? "bg-orange-500/20 border border-orange-400/40 text-orange-200"
                : "bg-[#1B1B1B] text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
            }`}
          >
            Local Heat
          </button>
          {["All", "Africa", "Europe"].map((r) => (
            <button
              key={r}
              onClick={() => setRegionFilter(r as any)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shrink-0 ${
                regionFilter === r 
                  ? "bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-lg" 
                  : "bg-[#1B1B1B] text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[...zones]
          .filter((z: any) => regionFilter === "All" || z.region === regionFilter)
          .filter((z: any) => !localHeatOnly || isKenyanClub(String(z.team || z.team_name || "")))
          .filter((z: any) => {
            if (!zoneSearch.trim()) return true;
            const name = String(z.team || z.team_name || "").toLowerCase();
            return name.includes(zoneSearch.trim().toLowerCase());
          })
          .sort((a: any, b: any) => {
            const aName = String(a.team || a.team_name || "");
            const bName = String(b.team || b.team_name || "");
            const aKen = isKenyanClub(aName) ? 1 : 0;
            const bKen = isKenyanClub(bName) ? 1 : 0;
            if (aKen !== bKen) return bKen - aKen;
            return Number(b.members_count || 0) - Number(a.members_count || 0);
          })
          .map((zone: any) => (
          <div key={zone.id} className="group cursor-pointer" onClick={() => setActiveZone(zone.id)}>
            <div className="bg-[#1B1B1B] rounded-xl border border-white/10 overflow-hidden relative transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)]">
              
              {/* Dynamic Overlay Gradient */}
              <div 
                className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at top right, ${zone.color || '#1E6FFF'}, transparent 70%)` }}
              ></div>
              
              {/* Inner content */}
              <div className="relative z-10 p-4 md:p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center p-2.5 shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-4 border-[#1B1B1B] relative group-hover:scale-110 transition-transform duration-500 z-20">
                    <img src={zone.logo || zone.logo_url} alt={zone.team} className="w-full h-full object-contain drop-shadow-lg" />
                  </div>
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-right">
                    <span className="block text-[9px] uppercase font-black text-gray-500 tracking-widest">Active Members</span>
                    <span className="text-sm font-black text-white">{zone.members || "10K+"}</span>
                  </div>
                </div>

                <h3 className="text-lg md:text-xl font-black uppercase tracking-wide mb-3 font-display drop-shadow-md">{zone.team || zone.team_name}</h3>
                {isKenyanClub(String(zone.team || zone.team_name || "")) && (
                  <span className="inline-block mb-2 bg-orange-500/20 border border-orange-400/40 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-orange-200">
                    Kenyan Heat
                  </span>
                )}
                {favoriteTeam && String(zone.team || zone.team_name).toLowerCase().includes(favoriteTeam) && (
                  <span className="inline-block mb-3 bg-primary/20 border border-primary/40 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-primary">
                    Your Club
                  </span>
                )}
                
                <div className="flex-1">
                  <p className="text-sm text-gray-400 font-medium italic border-l-2 pl-3 py-1 mb-6 relative group" style={{ borderColor: zone.color || "#444" }}>
                    "{zone.preview || zone.preview_text}"
                  </p>
                </div>
                
                <div 
                  className="w-full text-center py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all relative overflow-hidden" 
                  style={{ backgroundColor: `${zone.color}20`, color: zone.color }}
                >
                  <span className="relative z-10">Enter Club Room</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: zone.color }}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    Enter Club Room
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
