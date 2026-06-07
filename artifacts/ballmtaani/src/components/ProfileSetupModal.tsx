/**
 * ProfileSetupModal
 *
 * Shows once for Google sign-in users who have no username or club set.
 * Pre-fills name from Google metadata.
 * Saves username + favorite_team to Supabase profiles table.
 */
import { useState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "mtaani_profile_setup_v1";

const CLUBS = [
  "Arsenal", "Chelsea", "Man Utd", "Man City", "Liverpool",
  "Real Madrid", "Barcelona", "PSG", "Bayern Munich", "Juventus",
  "AC Milan", "Dortmund", "Gor Mahia", "AFC Leopards", "Simba SC",
  "Al Ahly", "Kaizer Chiefs", "Orlando Pirates", "Enyimba", "Morocco NT",
];

export default function ProfileSetupModal() {
  const { isLoggedIn, user, dbProfile } = useAuth();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [club, setClub] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    // Only show if profile has no username/club AND user hasn't set up before
    const alreadySetup = localStorage.getItem(STORAGE_KEY);
    if (alreadySetup) return;

    // Wait for dbProfile to load
    const timer = setTimeout(() => {
      if (!dbProfile?.username || !dbProfile?.favorite_team) {
        // Pre-fill from Google metadata
        const googleName = user.user_metadata?.full_name ||
                           user.user_metadata?.name ||
                           user.email?.split("@")[0] || "";
        setName(googleName);
        setShow(true);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isLoggedIn, user, dbProfile]);

  const handleSave = async () => {
    if (!name.trim() || !club || !user) return;
    setSaving(true);

    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        username: name.trim(),
        favorite_team: club,
        full_name: user.user_metadata?.full_name || name.trim(),
        avatar_url: user.user_metadata?.avatar_url || null,
      }, { onConflict: "id" });

      localStorage.setItem(STORAGE_KEY, "1");
      setDone(true);
      setTimeout(() => setShow(false), 1200);
    } catch (err) {
      console.error("Profile save error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0f14] shadow-2xl overflow-hidden">

        {done ? (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
            <p className="font-black text-white uppercase tracking-widest">You're all set!</p>
            <p className="text-[11px] text-white/40 mt-1">Welcome to BallMtaani, {name.split(" ")[0]}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-5 border-b border-white/8">
              <h2 className="text-base font-black uppercase tracking-widest text-white">One quick thing</h2>
              <p className="text-[11px] text-white/40 mt-1">Set your name and pick your side — takes 10 seconds</p>
            </div>

            <div className="p-5 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="How fans will see you"
                  maxLength={24}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all"
                />
              </div>

              {/* Club */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Your club</label>
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                  {CLUBS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setClub(c)}
                      className={`rounded-lg border px-2 py-1.5 text-[9px] font-black uppercase transition-all truncate ${
                        club === c
                          ? "border-green-500/60 bg-green-500/15 text-green-400"
                          : "border-white/8 bg-white/3 text-white/40 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!name.trim() || !club || saving}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all"
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CheckCircle2 className="w-4 h-4" />
                }
                {saving ? "Saving..." : "Save & Continue"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
