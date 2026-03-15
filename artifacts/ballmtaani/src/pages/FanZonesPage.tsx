import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useFanZones, useBanter, useProfile } from "../hooks/useData";
import { supabase } from "../lib/supabase";
import { Users, ArrowLeft, MessageSquare, Heart, Send } from "lucide-react";
import AdBanner from "../components/AdBanner";
import { SkeletonBanter } from "../components/Skeletons";

export default function FanZonesPage() {
  const { isLoggedIn, user, username } = useAuth();
  const [, setLocation] = useLocation();
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: zones = [] } = useFanZones();
  const { data: banter = [], isLoading: isLoadingBanter } = useBanter(activeZone);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { setLocation('/login'); return; }
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
    }
    setIsSubmitting(false);
  };

  const zone: any = zones.find((z: any) => z.id === activeZone);

  const { data: profile } = useProfile(user?.id);
  const interactions = profile?.interactions || 0;
  const isCreator = interactions >= 100;

  if (activeZone && zone) {
    // ... [existing active zone view logic, we just modify the outer return if needed]
    // Note: The previous active zone logic is fine, we are only touching the main list view.
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-in fade-in slide-in-from-right-4 duration-300">
        <button
          onClick={() => setActiveZone(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 font-bold uppercase tracking-wider text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Zones
        </button>

        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl mb-8 bg-[#1B1B1B]">
          {/* Header */}
          <div className="p-8 relative overflow-hidden" style={{ backgroundColor: zone.color || "#333" }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="relative z-10 flex items-end gap-6">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-white/20 overflow-hidden shrink-0">
                {zone.logo || zone.logo_url ? (
                  <img src={zone.logo || zone.logo_url} alt={zone.team || zone.team_name} className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-4xl font-black" style={{ color: zone.color || "#333" }}>{(zone.team || zone.team_name || "?")[0]}</span>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest mb-1">{zone.team || zone.team_name} Fan Zone</h1>
                <span className="text-white/80 font-bold flex items-center gap-1.5 text-sm">
                  <Users className="w-4 h-4" /> {zone.members || zone.members_count || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="p-6 md:p-8">
            <form onSubmit={handlePost} className="mb-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 shrink-0 border border-white/10 overflow-hidden">
                  {isLoggedIn ? (
                    <div className="w-full h-full flex items-center justify-center text-white font-black text-sm">{username.substring(0, 2).toUpperCase()}</div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500"><Users className="w-5 h-5" /></div>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder={`What's on your mind about ${zone.team || zone.team_name}?`}
                    className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 transition-colors resize-none mb-3"
                    rows={2}
                  ></textarea>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={(!newPost.trim() && isLoggedIn) || isSubmitting}
                      className="bg-white text-black font-black uppercase tracking-wider px-6 py-2 rounded text-xs transition-colors disabled:opacity-50 hover:bg-gray-200 flex items-center gap-2"
                    >
                      {isSubmitting ? "Posting..." : isLoggedIn ? <><Send className="w-3 h-3" /> Post</> : "Log In to Post"}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-4 border-b border-white/5 pb-2">Latest Banter</h3>
              
              {isLoadingBanter ? (
                [1, 2, 3].map(i => <SkeletonBanter key={i} />)
              ) : banter.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="w-12 h-12 text-gray-800 mx-auto mb-3" />
                  <p className="text-gray-500 font-bold text-sm">No banter yet. Be the first to start the fire!</p>
                </div>
              ) : (
                banter.map((post: any, i: number) => (
                  <div key={post.id || i} className="bg-[#0B0B0B] rounded-xl border border-white/5 p-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-black">
                          {post.author_name ? post.author_name[0].toUpperCase() : "F"}
                        </div>
                        <div>
                          <span className="font-bold text-sm block leading-none mb-1">{post.author_name || "Anonymous Fan"}</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      {i === 0 && (
                        <span className="bg-[#B30000]/10 text-[#B30000] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-[#B30000]/20">New</span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors">
                        <Heart className="w-4 h-4" /> {post.likes_count || 0}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <AdBanner label="Fan Zone Sponsor" className="mt-8" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-4 bg-gradient-to-r from-red-500 via-blue-500 to-yellow-500 bg-clip-text text-transparent">Fan Zones</h1>
        <p className="text-gray-400 font-bold uppercase tracking-wider md:text-lg">Where real fans battle for supremacy.</p>
      </div>

      {/* Creation Gate Section */}
      <div className="mb-12 rounded-2xl bg-gradient-to-br from-[#1B1B1B] to-[#0A0A0A] p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 w-full md:w-2/3">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#1E6FFF] text-white text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(30,111,255,0.5)]">
              Creator Status
            </span>
            {isCreator ? (
              <span className="text-green-500 text-xs font-bold uppercase flex items-center gap-1">
                ✓ Unlocked
              </span>
            ) : (
              <span className="text-gray-500 text-xs font-bold uppercase">🔒 Locked</span>
            )}
          </div>
          
          <h2 className="text-2xl font-black uppercase tracking-widest mb-2 font-display">Create Your Own Fan Zone</h2>
          <p className="text-sm text-gray-400 font-medium mb-6">
            Think your fanbase deserves a spot? Prove your ball knowledge. You need 100+ interactions (votes or predictions) across BallMtaani to unlock Zone creation privileges.
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
              Start Earning Fast
            </button>
          )}
        </div>
      </div>

      {/* The Premium Grid */}
      <h3 className="uppercase font-black tracking-widest border-l-4 border-red-500 pl-3 mb-6 text-xl">Top Ranking Zones</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone: any) => (
          <div key={zone.id} className="group cursor-pointer" onClick={() => setActiveZone(zone.id)}>
            <div className="bg-[#1B1B1B] rounded-2xl border border-white/10 overflow-hidden relative transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)]">
              
              {/* Dynamic Overlay Gradient */}
              <div 
                className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at top right, ${zone.color || '#1E6FFF'}, transparent 70%)` }}
              ></div>
              
              {/* Inner content */}
              <div className="relative z-10 p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center p-3 shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-4 border-[#1B1B1B] relative group-hover:scale-110 transition-transform duration-500 z-20">
                    <img src={zone.logo || zone.logo_url} alt={zone.team} className="w-full h-full object-contain drop-shadow-lg" />
                  </div>
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-right">
                    <span className="block text-[9px] uppercase font-black text-gray-500 tracking-widest">Active Members</span>
                    <span className="text-sm font-black text-white">{zone.members || "10K+"}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black uppercase tracking-widest mb-3 font-display drop-shadow-md">{zone.team || zone.team_name}</h3>
                
                <div className="flex-1">
                  <p className="text-sm text-gray-400 font-medium italic border-l-2 pl-3 py-1 mb-6 relative group" style={{ borderColor: zone.color || "#444" }}>
                    "{zone.preview || zone.preview_text}"
                  </p>
                </div>
                
                <div 
                  className="w-full text-center py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all relative overflow-hidden" 
                  style={{ backgroundColor: `${zone.color}20`, color: zone.color }}
                >
                  <span className="relative z-10">Enter War Room</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: zone.color }}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    Enter War Room
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
