import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFanZones } from "../hooks/useData";
import { Users, ArrowLeft, MessageSquare, Heart } from "lucide-react";

export default function FanZonesPage() {
  const { isLoggedIn, openLoginModal } = useAuth();
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [newPost, setNewPost] = useState("");

  const { data: zones = [] } = useFanZones();

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { openLoginModal(); return; }
    setNewPost("");
    alert("Post added to fan zone!");
  };

  const zone: any = zones.find((z: any) => z.id === activeZone);

  if (activeZone && zone) {
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
                    <div className="w-full h-full flex items-center justify-center text-white font-black text-sm">Me</div>
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
                      disabled={!newPost.trim() && isLoggedIn}
                      className="bg-white text-black font-black uppercase tracking-wider px-6 py-2 rounded text-xs transition-colors disabled:opacity-50 hover:bg-gray-200"
                    >
                      {isLoggedIn ? "Post" : "Log In to Post"}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-4 border-b border-white/5 pb-2">Latest Banter</h3>
              {[
                { author: "GunnerKev",    time: "2h ago", text: zone.preview || zone.preview_text, likes: 24 },
                { author: "FootballFan99", time: "4h ago", text: `Honestly, ${zone.team || zone.team_name} is looking sharp this season. Keep this up and we're winning it all.`, likes: 12 },
                { author: "NaijaBaller",  time: "5h ago", text: "The manager needs to wake up and make changes before 70 mins! Every single time...", likes: 45 }
              ].map((post, i) => (
                <div key={i} className="bg-[#0B0B0B] rounded-xl border border-white/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-black">
                      {post.author[0]}
                    </div>
                    <div>
                      <span className="font-bold text-sm block leading-none mb-1">{post.author}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{post.time}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{post.text}</p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors">
                      <Heart className="w-4 h-4" /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors">
                      <MessageSquare className="w-4 h-4" /> Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 border-b border-white/10 pb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">Fan Zones</h1>
        <p className="text-gray-400 font-bold uppercase tracking-wider">Join your tribe. Banter the rest.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {zones.map((zone: any) => (
          <div key={zone.id} className="bg-[#1B1B1B] rounded-xl border border-white/5 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all hover:-translate-y-1">
            {/* Colored header strip */}
            <div className="h-16 w-full" style={{ backgroundColor: zone.color || "#333", opacity: 0.25 }}></div>

            <div className="p-5 relative">
              {/* Club logo badge overlapping the strip */}
              <div className="absolute -top-10 left-5 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-[#1B1B1B] overflow-hidden">
                {zone.logo || zone.logo_url ? (
                  <img src={zone.logo || zone.logo_url} alt={zone.team || zone.team_name} className="w-full h-full object-contain p-1.5" />
                ) : (
                  <span className="text-2xl font-black" style={{ color: zone.color || "#333" }}>{(zone.team || zone.team_name || "?")[0]}</span>
                )}
              </div>

              <div className="mt-6 mb-4">
                <h3 className="text-xl font-black uppercase tracking-widest">{zone.team || zone.team_name}</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3" /> {zone.members || zone.members_count || 0}
                </span>
              </div>

              <div className="bg-[#0B0B0B] rounded-lg p-3 mb-5 border border-white/5 h-20">
                <p className="text-xs text-gray-400 italic line-clamp-2">"{zone.preview || zone.preview_text}"</p>
              </div>

              <button
                onClick={() => setActiveZone(zone.id)}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold uppercase tracking-wider text-xs py-2.5 rounded transition-colors"
              >
                Enter Zone
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
