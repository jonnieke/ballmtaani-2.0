import React, { useState } from "react";
import { GrassrootsTalent } from "../../lib/talanta/talanta-data";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Heart, Share2, Award, Sparkles, CheckCircle2, Shield, MapPin, User, MessageCircle } from "lucide-react";

interface TalentScoutCardProps {
  talent: GrassrootsTalent;
}

export default function TalentScoutCard({ talent }: TalentScoutCardProps) {
  const [endorsed, setEndorsed] = useState(false);
  const [endorsementCount, setEndorsementCount] = useState(talent.endorsements);
  const [copied, setCopied] = useState(false);

  const handleEndorse = () => {
    if (endorsed) {
      setEndorsed(false);
      setEndorsementCount((c) => c - 1);
    } else {
      setEndorsed(true);
      setEndorsementCount((c) => c + 1);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `🌟 *Talanta Mtaani Spotlight: ${talent.name} (${talent.position}, ${talent.age} yrs)*
🏫 Institution: ${talent.institution}
📍 Region: ${talent.region}
⚽ Stats: ${talent.stats.goals ? `${talent.stats.goals} Goals, ` : ""}${talent.stats.assists ? `${talent.stats.assists} Assists, ` : ""}${talent.stats.appearances} Apps

🗣️ *Scout Verdict:* "${talent.scoutVerdict}"

🔥 Endorse and put this talent on the national radar on BallMtaani:
https://ballmtaani.com/talanta`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-xl relative overflow-hidden group">
      {/* Top Banner / Verification */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
            {talent.position} • {talent.age} Yrs
          </Badge>

          {talent.verifiedBy && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3" /> {talent.verifiedBy}
            </span>
          )}
        </div>

        {/* Player Name & School / Academy */}
        <div>
          <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
            {talent.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium mt-0.5">
            <span className="text-emerald-400 font-bold">{talent.institution}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
            <MapPin className="h-3 w-3 text-gray-500" />
            <span>{talent.region}</span>
            <span className="mx-1">•</span>
            <span className="text-gray-400">{talent.currentLeague}</span>
          </div>
        </div>

        {/* Key Strengths */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {talent.strengths.map((str, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 font-medium"
            >
              ⚡ {str}
            </span>
          ))}
        </div>

        {/* Stats Matrix */}
        <div className="grid grid-cols-3 gap-2 bg-black/40 border border-white/5 p-2.5 rounded-xl text-center font-mono text-xs">
          {talent.stats.goals !== undefined && (
            <div>
              <span className="text-[10px] text-gray-400 font-sans block">Goals</span>
              <span className="font-extrabold text-emerald-400 text-sm">{talent.stats.goals}</span>
            </div>
          )}
          {talent.stats.assists !== undefined && (
            <div>
              <span className="text-[10px] text-gray-400 font-sans block">Assists</span>
              <span className="font-extrabold text-teal-300 text-sm">{talent.stats.assists}</span>
            </div>
          )}
          {talent.stats.cleanSheets !== undefined && (
            <div>
              <span className="text-[10px] text-gray-400 font-sans block">Clean Sheets</span>
              <span className="font-extrabold text-blue-400 text-sm">{talent.stats.cleanSheets}</span>
            </div>
          )}
          <div>
            <span className="text-[10px] text-gray-400 font-sans block">Matches</span>
            <span className="font-extrabold text-white text-sm">{talent.stats.appearances}</span>
          </div>
        </div>

        {/* Scout Report */}
        <div className="rounded-xl bg-white/5 border border-white/5 p-3 space-y-1.5 text-xs">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] block flex items-center gap-1">
            <Award className="h-3.5 w-3.5" /> Scout Assessment:
          </span>
          <p className="text-gray-300 text-[11px] leading-relaxed italic">
            "{talent.scoutVerdict}"
          </p>
        </div>
      </div>

      {/* Footer: Endorsements & Share */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
        <button
          onClick={handleEndorse}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            endorsed
              ? "bg-red-500/20 text-red-400 border border-red-500/40"
              : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${endorsed ? "fill-current text-red-400" : ""}`} />
          <span>{endorsementCount} Endorsements</span>
        </button>

        <Button
          onClick={handleShareWhatsApp}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 gap-1 shadow-md"
        >
          <Share2 className="h-3 w-3" /> Share Talent
        </Button>
      </div>
    </div>
  );
}
