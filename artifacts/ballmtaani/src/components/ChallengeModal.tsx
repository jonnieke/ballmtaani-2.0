import { useState } from "react";
import { X, Swords, Shield, Loader2 } from "lucide-react";
import { useMatches } from "../hooks/useData";

interface ChallengeModalProps {
  rivalName: string;
  rivalId: string;
  onClose: () => void;
  onChallenge: (matchId: string, prediction: string, bragLine: string) => void;
}

export function ChallengeModal({ rivalName, onClose, onChallenge }: ChallengeModalProps) {
  const { data: matches = [], isLoading } = useMatches();
  const [selectedMatch, setSelectedMatch] = useState("");
  const [prediction, setPrediction] = useState("");
  const [bragLine, setBragLine] = useState("Receipt match");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(false);

  const handleSubmit = () => {
    if (!selectedMatch || !prediction) {
      setValidationError(true);
      setTimeout(() => setValidationError(false), 3000);
      return;
    }
    setValidationError(false);
    setIsSubmitting(true);
    setTimeout(() => {
      onChallenge(selectedMatch, prediction, bragLine);
      setIsSubmitting(false);
      onClose();
    }, 1200);
  };

  const bragLines = ["Receipt match", "Club pride", "Timeline brag", "Silent treatment"];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#111111] rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(179,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B30000] to-[#1E6FFF]" />

        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#B30000]/10 rounded-2xl border border-[#B30000]/30 text-[#B30000]">
                <Swords className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest text-white">Start Fan Duel</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Against {rivalName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1">Pick Match</label>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-gray-600" /></div>
                ) : matches.slice(0, 5).map((m: any) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMatch(m.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${selectedMatch === m.id ? "bg-[#1E6FFF]/10 border-[#1E6FFF] text-white" : "bg-black border-white/5 text-gray-400 hover:border-white/20"}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={m.homeLogo} className="w-6 h-6 object-contain" alt="" />
                      <span className="text-xs font-bold">{m.home} vs {m.away}</span>
                    </div>
                    <span className="text-[9px] font-black opacity-50">{m.minute || "Upcoming"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1">Bragging Rights</label>
              <div className="grid grid-cols-2 gap-2">
                {bragLines.map((line) => (
                  <button
                    key={line}
                    onClick={() => setBragLine(line)}
                    className={`py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${bragLine === line ? "bg-[#FFD700] text-black border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]" : "bg-black border-white/5 text-gray-500 hover:border-white/20"}`}
                  >
                    {line}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1">Your Scoreline Call</label>
              <input
                type="text"
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                placeholder="e.g. 2-1"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold placeholder:text-gray-700 focus:outline-none focus:border-[#B30000] transition-colors"
              />
            </div>

            {validationError && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400">
                Pick a match and enter your scoreline call first.
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#B30000] to-red-800 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl shadow-[0_10px_30px_rgba(179,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(179,0,0,0.5)] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <Shield className="w-5 h-5" />
                  Send Duel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
