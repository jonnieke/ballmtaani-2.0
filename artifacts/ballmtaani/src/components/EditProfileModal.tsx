import { useState } from "react";
import { X, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { Bell, BellOff } from "lucide-react";

export function EditProfileModal({ currentUsername, currentClub, onClose, onSaved }: { currentUsername: string, currentClub: string, onClose: () => void, onSaved: () => void }) {
  const { user } = useAuth();
  const { isSupported, isSubscribed, isLoading, pushError, subscribeToPush, unsubscribeFromPush } = usePushNotifications();
  const [username, setUsername] = useState(currentUsername);
  const [club, setClub] = useState(
    currentClub || localStorage.getItem("mtaani_fav_club") || ""
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;
    setSaving(true);
    
    const { error } = await supabase.from('profiles').update({
      username: username,
      favorite_club: club
    }).eq('id', user.id);

    setSaving(false);
    if (!error) {
      // Keep localStorage club pick in sync so hero personalisation stays current
      if (club.trim()) {
        localStorage.setItem("mtaani_fav_club", club.trim());
      }
      onSaved();
      onClose();
    } else {
      setSaveError(error.message || "Failed to update profile.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center z-10">
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-6">Edit Profile</h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-gray-500 mb-2">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                maxLength={15}
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-gray-500 mb-2">Favorite Club</label>
              <input 
                type="text" 
                value={club} 
                onChange={e => setClub(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g. Arsenal, Gor Mahia"
              />
            </div>

            {isSupported && (
              <div className={`rounded-xl border px-4 py-3 ${pushError ? "border-red-500/30 bg-red-500/5" : "border-white/10 bg-black/50"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      {isSubscribed ? <Bell className="w-4 h-4 text-[#00FF00]" /> : <BellOff className="w-4 h-4 text-gray-500" />}
                      Match Alerts
                    </div>
                    {pushError ? (
                      <div className="text-[10px] text-red-400 font-bold mt-0.5">{pushError}</div>
                    ) : (
                      <div className="text-[10px] text-gray-400">Get notified when games start</div>
                    )}
                  </div>
                <button
                  type="button"
                  onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isSubscribed ? 'bg-[#00FF00]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isSubscribed ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                </div>
              </div>
            )}

            {saveError && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/8 px-3 py-2 text-[11px] font-bold text-red-400">
                {saveError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-red-600 to-blue-600 text-white font-black uppercase tracking-widest py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-4"
            >
              {saving ? "Saving..." : <><Check className="w-4 h-4" /> Save Profile</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
