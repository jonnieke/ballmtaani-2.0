/**
 * BallMtaani Choose-Your-Club Onboarding Modal
 * Personalisation selector allowing fans to choose followed clubs, primary club, and target leagues.
 */

import React, { useState } from "react";
import { saveLocalPreferences, getLocalPreferences } from "../lib/user-preferences";

interface ClubOption {
  id: string;
  name: string;
  league: string;
  country: string;
  logo: string;
}

const AVAILABLE_CLUBS: ClubOption[] = [
  { id: "arsenal", name: "Arsenal FC", league: "Premier League", country: "England", logo: "https://media.api-sports.io/football/teams/42.png" },
  { id: "manchester-united", name: "Manchester United", league: "Premier League", country: "England", logo: "https://media.api-sports.io/football/teams/33.png" },
  { id: "chelsea", name: "Chelsea FC", league: "Premier League", country: "England", logo: "https://media.api-sports.io/football/teams/49.png" },
  { id: "liverpool", name: "Liverpool FC", league: "Premier League", country: "England", logo: "https://media.api-sports.io/football/teams/40.png" },
  { id: "gor-mahia", name: "Gor Mahia FC (K'Ogalo)", league: "FKF Premier League", country: "Kenya", logo: "/logo.png" },
  { id: "afc-leopards", name: "AFC Leopards (Ingwe)", league: "FKF Premier League", country: "Kenya", logo: "/logo.png" },
  { id: "real-madrid", name: "Real Madrid CF", league: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/teams/541.png" },
  { id: "barcelona", name: "FC Barcelona", league: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/teams/529.png" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function ChooseClubModal({ isOpen, onClose, onSaved }: Props) {
  const current = getLocalPreferences();
  const [search, setSearch] = useState("");
  const [followed, setFollowed] = useState<string[]>(current.followedTeams);
  const [primary, setPrimary] = useState<string | null>(current.primaryTeam);

  if (!isOpen) return null;

  const filteredClubs = AVAILABLE_CLUBS.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) || c.league.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFollow = (id: string) => {
    if (followed.includes(id)) {
      const updated = followed.filter(t => t !== id);
      setFollowed(updated);
      if (primary === id) setPrimary(updated[0] || null);
    } else {
      const updated = [...followed, id];
      setFollowed(updated);
      if (!primary) setPrimary(id);
    }
  };

  const handleSave = () => {
    saveLocalPreferences({
      followedTeams: followed,
      primaryTeam: primary || followed[0] || null,
      onboardingCompleted: true,
    });
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-[#111319] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] block mb-1">
              ⚽ PERSONALISED MATCHDAY EXPERIENCE
            </span>
            <h2 className="text-xl md:text-2xl font-black uppercase text-white">
              Choose Your Club & Competitions
            </h2>
            <p className="text-xs text-white/70 mt-1">
              Tailors your homepage feeds, match notifications, prediction receipts, and Mchambuzi AI breakdowns.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-lg font-bold p-1 transition-colors"
            aria-label="Skip onboarding"
          >
            ✕
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search club or competition (e.g. Arsenal, FKF)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#FFD700] transition-colors"
        />

        {/* Club Grid */}
        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredClubs.map(club => {
            const isSelected = followed.includes(club.id);
            const isPrimary = primary === club.id;

            return (
              <div
                key={club.id}
                onClick={() => toggleFollow(club.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#181d2a] border-[#FFD700]/60 shadow-md"
                    : "bg-white/5 border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow">
                    <img src={club.logo} alt={club.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{club.name}</h3>
                    <span className="text-[10px] text-white/50">{club.league} • {club.country}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  {isSelected && (
                    <button
                      onClick={() => setPrimary(club.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        isPrimary
                          ? "bg-[#FFD700] text-black shadow"
                          : "bg-white/10 text-white/70 hover:text-white"
                      }`}
                    >
                      {isPrimary ? "★ Primary" : "Set Primary"}
                    </button>
                  )}
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected ? "bg-[#B30000] text-white" : "border border-white/30 text-transparent"
                  }`}>
                    ✓
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="text-xs text-white/50 hover:text-white font-semibold transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#B30000] text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-lg"
          >
            Save Preferences ({followed.length} Selected)
          </button>
        </div>
      </div>
    </div>
  );
}
