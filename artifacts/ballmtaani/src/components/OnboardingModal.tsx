import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";
import { ChevronRight, X } from "lucide-react";

const CLUBS = [
  "Arsenal", "Chelsea", "Man Utd", "Liverpool",
  "Man City", "Real Madrid", "Barcelona", "Bayern",
  "Dortmund", "PSG", "Juventus", "Napoli",
  "Gor Mahia", "AFC Leopards", "Tusker FC", "Other",
];

const STEPS = [
  {
    id: "club",
    badge: "⚽",
    title: "Pick Your Side",
    subtitle: "Your club powers your rooms, rivals, and matchday receipts.",
    color: "#B30000",
    action: "Lock It In",
  },
  {
    id: "wc26",
    badge: "🏆",
    title: "World Cup Is Here",
    subtitle: "Knockout rounds are live. Make your bold call on every match and keep the receipt.",
    color: "#FFD700",
    action: "Make First Call",
    route: "/predictions",
  },
  {
    id: "fanzone",
    badge: "🔥",
    title: "Join The Room",
    subtitle: "Find your club room and watch Kenyan fans react in real time.",
    color: "#1E6FFF",
    action: "Explore Fan Zones",
    route: "/fan-zones",
  },
  {
    id: "invite",
    badge: "📲",
    title: "Bring Your Crew",
    subtitle: "Your best football arguments already live in WhatsApp. Bring that group into a room.",
    color: "#22c55e",
    action: "Invite & Earn 500 MTC",
    route: "/profile",
  },
];

export function OnboardingModal() {
  const { isLoggedIn, username } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [selectedClub, setSelectedClub] = useState<string>(() =>
    localStorage.getItem("mtaani_fav_club") || ""
  );

  useEffect(() => {
    if (!isLoggedIn) return undefined;
    const done = localStorage.getItem("mtaani_onboarding_done");
    if (!done) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isLoggedIn]);

  const handleClose = () => {
    localStorage.setItem("mtaani_onboarding_done", "1");
    setVisible(false);
  };

  const handleAction = () => {
    const current = STEPS[step];

    if (step === 0) {
      if (selectedClub) {
        localStorage.setItem("mtaani_fav_club", selectedClub);
      }
      setStep(1);
      return;
    }

    if (current.route) {
      handleClose();
      setLocation(current.route);
    } else if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  if (!visible) return null;

  const current = STEPS[step];
  const canProceed = step !== 0 || selectedClub !== "";

  return (
    <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex gap-1 p-4 pb-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: i <= step ? "100%" : "0%", backgroundColor: current.color }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center z-10"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="p-8 text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl animate-in zoom-in duration-300"
            key={step}
            style={{ boxShadow: `0 0 30px ${current.color}30` }}
          >
            {current.badge}
          </div>

          <p className="text-xs font-black uppercase tracking-[0.2em] mb-2" style={{ color: current.color }}>
            Step {step + 1} of {STEPS.length}
          </p>

          <h2 className="text-2xl font-black uppercase tracking-wider text-white mb-3">
            {current.title}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {current.subtitle}
          </p>

          {step === 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                Welcome, <span className="text-white">{username || "Fan"}</span> · 50 MTC in your wallet
              </p>
              <div className="grid grid-cols-4 gap-2">
                {CLUBS.map((club) => (
                  <button
                    key={club}
                    onClick={() => setSelectedClub(club)}
                    className={`rounded-xl border px-1 py-2.5 text-[10px] font-black uppercase tracking-wide transition-all ${
                      selectedClub === club
                        ? "border-[#B30000] bg-[#B30000]/20 text-white shadow-[0_0_12px_rgba(179,0,0,0.3)]"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {club}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mb-6 rounded-xl border border-[#FFD700]/25 bg-[#FFD700]/8 px-4 py-3 text-sm text-white/80">
              <span className="font-black text-[#FFD700]">48 teams. 104 matches.</span> Kenya watching in EAT.
            </div>
          )}

          {step === 3 && (
            <div className="mb-6 rounded-xl border border-green-500/25 bg-green-500/8 px-4 py-3 text-sm text-white/80">
              Earn <span className="font-black text-green-400">+500 MTC</span> for every fan who joins through your link.
            </div>
          )}

          <button
            onClick={handleAction}
            disabled={!canProceed}
            className="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ backgroundColor: current.color, color: current.color === "#FFD700" ? "#000" : "#fff" }}
          >
            {current.action} <ChevronRight className="w-4 h-4" />
          </button>

          {step === 0 && !selectedClub && (
            <p className="mt-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">Pick a side to continue</p>
          )}

          <button
            onClick={step < STEPS.length - 1 ? () => setStep((s) => s + 1) : handleClose}
            className="mt-3 w-full text-gray-500 hover:text-gray-300 text-xs font-bold uppercase tracking-widest transition-colors py-2"
          >
            {step < STEPS.length - 1 ? "Skip this step" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
