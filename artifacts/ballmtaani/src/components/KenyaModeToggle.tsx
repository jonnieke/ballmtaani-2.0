import { Shield, Sparkles } from "lucide-react";

interface KenyaModeToggleProps {
  isKenyaFirst: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function KenyaModeToggle({ isKenyaFirst, onToggle }: KenyaModeToggleProps) {
  return (
    <button
      onClick={() => onToggle(!isKenyaFirst)}
      className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
        isKenyaFirst
          ? "border-emerald-500 bg-emerald-950/80 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
      }`}
    >
      <span className="text-sm">🇰🇪</span>
      <span>{isKenyaFirst ? "KPL & HARAMBEE STARS MODE" : "KENYA FIRST MODE"}</span>
      {isKenyaFirst && <Sparkles className="h-3 w-3 text-emerald-400 animate-pulse" />}
    </button>
  );
}
