import React, { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { X, Check, Bell, Shield, ArrowRight, Heart } from "lucide-react";

export interface SubscriberOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriberOnboardingModal({ isOpen, onClose }: SubscriberOnboardingModalProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(["Arsenal", "Real Madrid"]);
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>(["Premier League", "UEFA Champions League"]);
  const [quietHours, setQuietHours] = useState<boolean>(true);

  if (!isOpen) return null;

  const toggleTeam = (team: string) => {
    if (selectedTeams.includes(team)) {
      setSelectedTeams(selectedTeams.filter((t) => t !== team));
    } else {
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-white">
      <div className="relative w-full max-w-md bg-[#121212] border border-white/15 rounded-xl p-6 shadow-2xl space-y-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Close">
          <X className="h-5 w-5" />
        </button>

        {step === 1 && (
          <div className="space-y-4">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Step 1 of 3 — Onboarding</Badge>
            <h2 className="text-xl font-bold text-white">Choose Favourite Teams</h2>
            <p className="text-xs text-gray-400">Select teams to automatically receive match predictions and lineup revisions.</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {["Arsenal", "Liverpool", "Chelsea", "Manchester City", "Real Madrid", "Barcelona", "Inter Milan"].map((team) => (
                <button
                  key={team}
                  onClick={() => toggleTeam(team)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedTeams.includes(team)
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30"
                  }`}
                >
                  {selectedTeams.includes(team) && <Check className="h-3 w-3 inline mr-1" />}
                  {team}
                </button>
              ))}
            </div>

            <Button onClick={() => setStep(2)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs mt-4">
              Next: Select Competitions <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Step 2 of 3 — Onboarding</Badge>
            <h2 className="text-xl font-bold text-white">Notification Alert Preferences</h2>
            <p className="text-xs text-gray-400">Configure your alert preferences and Africa/Nairobi quiet hours.</p>

            <div className="space-y-3 bg-white/5 p-4 rounded-lg border border-white/10 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Enable Quiet Hours (23:00 - 07:00 EAT)</span>
                <input
                  type="checkbox"
                  checked={quietHours}
                  onChange={(e) => setQuietHours(e.target.checked)}
                  className="accent-emerald-500"
                />
              </label>
              <p className="text-[10px] text-gray-400">Non-urgent alerts are suppressed during quiet hours to protect your sleep.</p>
            </div>

            <Button onClick={() => setStep(3)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs mt-4">
              Finish Onboarding
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6 space-y-4">
            <div className="h-12 w-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto font-bold">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">All Set!</h2>
            <p className="text-xs text-gray-300">Your custom alert preferences and team watchlist have been configured.</p>
            <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
              Start Exploring Edge Intelligence
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
