import React from "react";
import { SupportedLanguage } from "../../lib/edge/personalization/multilingual-explanation-engine";
import { Globe } from "lucide-react";

export interface LanguageSwitcherProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1 text-xs font-mono">
      <Globe className="h-3.5 w-3.5 text-gray-400 ml-1.5 mr-1" />
      <button
        onClick={() => onLanguageChange("en")}
        className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
          currentLanguage === "en" ? "bg-emerald-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onLanguageChange("sw")}
        className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
          currentLanguage === "sw" ? "bg-emerald-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
        }`}
      >
        SW
      </button>
      <button
        onClick={() => onLanguageChange("sh")}
        className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
          currentLanguage === "sh" ? "bg-emerald-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
        }`}
      >
        SH
      </button>
    </div>
  );
}
