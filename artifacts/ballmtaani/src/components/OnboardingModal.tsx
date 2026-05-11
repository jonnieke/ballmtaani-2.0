import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";
import { ChevronRight, X } from "lucide-react";

const STEPS = [
  {
    id: "club",
    badge: "01",
    title: "Pick Your Side",
    subtitle: "Your club powers your rooms, rivals, and matchday receipts.",
    color: "#B30000",
    action: "Continue Setup",
  },
  {
    id: "fanzone",
    badge: "02",
    title: "Join The Room",
    subtitle: "Find your club room and watch Kenyan fans react in real time.",
    color: "#1E6FFF",
    action: "Explore Fan Zones",
    route: "/fan-zones",
  },
  {
    id: "predict",
    badge: "03",
    title: "Make Your First Call",
    subtitle: "Lock a scoreline before kickoff and come back for the receipt.",
    color: "#FFD700",
    action: "Make First Call",
    route: "/predictions",
  },
  {
    id: "invite",
    badge: "04",
    title: "Bring Your Group",
    subtitle: "Your best football arguments already live in WhatsApp. Bring that crew into a room when you are ready.",
    color: "#22c55e",
    action: "Explore Rooms",
    route: "/fan-zones",
  },
];

export function OnboardingModal() {
  const { isLoggedIn, username } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

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
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl font-black tracking-widest text-white animate-in zoom-in duration-300"
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
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {current.subtitle}
          </p>

          {step === 0 && (
            <div className="bg-white/5 rounded-xl p-3 mb-6 text-sm text-gray-300">
              Welcome, <strong className="text-white">{username || "Fan"}</strong>. Your fan wallet is active with{" "}
              <span className="text-[#FFD700] font-black">50 MTC</span> to start.
            </div>
          )}

          <button
            onClick={handleAction}
            className="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: current.color, color: current.color === "#FFD700" ? "#000" : "#fff" }}
          >
            {current.action} <ChevronRight className="w-4 h-4" />
          </button>

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
