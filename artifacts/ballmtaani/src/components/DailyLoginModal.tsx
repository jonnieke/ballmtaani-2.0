import { useEffect, useState } from "react";
import { Flame, Coins, X, Calendar } from "lucide-react";

interface DailyLoginModalProps {
  streak: number;
  coinsEarned: number;
  bonusEarned?: number;
  onClose: () => void;
}

export function DailyLoginModal({ streak, coinsEarned, bonusEarned = 0, onClose }: DailyLoginModalProps) {
  const [visible, setVisible] = useState(false);
  const [coinAnim, setCoinAnim] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setCoinAnim(true), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const days = Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    filled: i < streak,
    today: i === streak - 1,
  }));

  const totalEarned = coinsEarned + bonusEarned;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      <div className={`relative w-full max-w-md bg-[#0F0F0F] border border-[#FFD700]/30 rounded-3xl shadow-[0_0_80px_rgba(255,215,0,0.15)] overflow-hidden transition-all duration-500 ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
        <div className="h-1 w-full bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700]" />

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full px-4 py-1.5 mb-6">
            <Flame className="w-4 h-4 text-[#FFD700]" />
            <span className="text-[#FFD700] font-black text-xs uppercase tracking-widest">Day {streak} Streak</span>
          </div>

          <div className={`transition-all duration-700 ${coinAnim ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-[0_0_60px_rgba(255,215,0,0.5)] mb-4 relative">
              <Coins className="w-14 h-14 text-black" />
              <div className="absolute -top-2 -right-2 bg-[#B30000] text-white font-black text-xs rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                +
              </div>
            </div>

            <div className="text-5xl font-black text-white mb-1">
              +{totalEarned.toLocaleString()}
            </div>
            <div className="text-[#FFD700] font-black text-sm uppercase tracking-widest mb-2">
              MTC Status
            </div>

            {bonusEarned > 0 && (
              <div className="inline-block bg-[#B30000]/20 border border-[#B30000]/40 text-[#FF6B6B] text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Includes +{bonusEarned} streak bonus
              </div>
            )}
          </div>

          <div className="mt-6 mb-6">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">
              <Calendar className="w-3 h-3 inline mr-1" />
              Your Week
            </p>
            <div className="flex justify-center gap-2">
              {days.map(({ day, filled, today }) => (
                <div
                  key={day}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                    today
                      ? "bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.6)] scale-110"
                      : filled
                      ? "bg-[#FFD700]/30 text-[#FFD700] border border-[#FFD700]/40"
                      : "bg-white/5 text-gray-600 border border-white/5"
                  }`}
                >
                  {filled ? (today ? "D" : "OK") : day}
                </div>
              ))}
            </div>
            {streak >= 3 && streak < 7 && (
              <p className="text-gray-500 text-[10px] font-bold mt-3">
                {7 - streak} more days for +500 MTC bonus
              </p>
            )}
            {streak >= 7 && (
              <p className="text-[#FFD700] text-[10px] font-black mt-3 uppercase tracking-wide">
                7-Day Legend. Maximum streak bonus unlocked.
              </p>
            )}
          </div>

          <button
            onClick={handleClose}
            className="w-full py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black uppercase tracking-widest rounded-xl text-sm hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all active:scale-95"
          >
            Continue
          </button>

          <p className="text-gray-600 text-[10px] font-bold mt-4 uppercase tracking-widest">
            Build MTC status by making calls, joining rooms, and inviting friends
          </p>
        </div>
      </div>
    </div>
  );
}
