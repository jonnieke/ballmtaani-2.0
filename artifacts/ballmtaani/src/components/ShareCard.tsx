import { useState, useEffect, useRef } from "react";
import { Share2, X, Copy, CheckCheck, MessageCircle, Twitter } from "lucide-react";

interface ShareCardProps {
  achievement: string;       // "I scored 12/15 in Trivia!"
  subtitle?: string;         // "Playing on BallMtaani"
  coinsEarned?: number;      // 150
  emoji?: string;
  shareUrl?: string;         // referral URL
  onClose: () => void;
}

export function ShareCard({ achievement, subtitle, coinsEarned, emoji = "B", shareUrl, onClose }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Build share text
  const refUrl = shareUrl || `https://ballmtaani.com`;
  const shareText = `${emoji} ${achievement}\n\n${subtitle || "Playing on BallMtaani - Kenyan fans, big match banter"}${coinsEarned ? `\n\nStacked ${coinsEarned.toLocaleString()} MTC status points.` : ""}\n\nJoin me: ${refUrl}`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareTwitter = () => {
    const tweet = `${emoji} ${achievement}\n\n${subtitle || "Playing on BallMtaani - Kenyan fans, big match banter"}\n\nJoin: ${refUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, '_blank');
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Trap focus on mount
  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={cardRef}
        tabIndex={-1}
        className="relative w-full max-w-sm outline-none"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* The Card - designed to look great in a screenshot */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(179,0,0,0.3)]">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A0000] via-[#0B0B0B] to-[#001020]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B30000]/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1E6FFF]/15 blur-[80px] rounded-full pointer-events-none" />

          {/* Card Content */}
          <div className="relative z-10 p-8 text-center">
            {/* Logo / Brand */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-6 h-6 bg-[#B30000] rounded flex items-center justify-center text-[10px] font-black text-white">B</div>
              <span className="text-white font-black text-sm uppercase tracking-[0.3em] opacity-70">BallMtaani</span>
            </div>

            {/* Achievement badge */}
            <div className="text-7xl mb-4 animate-in zoom-in duration-500">{emoji}</div>

            {/* Achievement text */}
            <h2 className="text-white font-black text-xl uppercase tracking-wider mb-2 leading-tight">
              {achievement}
            </h2>
            {subtitle && (
              <p className="text-gray-400 text-sm font-medium mb-4">{subtitle}</p>
            )}

            {/* Coins earned badge */}
            {coinsEarned && coinsEarned > 0 && (
              <div className="inline-flex items-center gap-2 bg-[#FFD700]/15 border border-[#FFD700]/30 rounded-full px-5 py-2 mb-6">
                <span className="text-[#FFD700] font-black text-lg">+{coinsEarned.toLocaleString()}</span>
                <span className="text-[#FFD700] font-bold text-sm">MTC Status</span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-white/10 my-6" />

            {/* Call to action */}
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">
              Kenyan fans. Big match banter.
            </p>
            <p className="text-gray-600 text-[10px] font-mono">ballmtaani.com</p>
          </div>
        </div>

        {/* Share Buttons — below card */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <button
            onClick={shareWhatsApp}
            className="flex flex-col items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-2xl py-4 transition-all hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-6 h-6 text-[#25D366]" />
            <span className="text-[#25D366] text-[10px] font-black uppercase tracking-wider">WhatsApp</span>
          </button>

          <button
            onClick={shareTwitter}
            className="flex flex-col items-center gap-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 rounded-2xl py-4 transition-all hover:scale-105 active:scale-95"
          >
            <Twitter className="w-6 h-6 text-[#1DA1F2]" />
            <span className="text-[#1DA1F2] text-[10px] font-black uppercase tracking-wider">Twitter/X</span>
          </button>

          <button
            onClick={copyToClipboard}
            className={`flex flex-col items-center gap-2 border rounded-2xl py-4 transition-all hover:scale-105 active:scale-95 ${
              copied
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}
          >
            {copied ? (
              <CheckCheck className="w-6 h-6 text-green-400" />
            ) : (
              <Copy className="w-6 h-6 text-gray-400" />
            )}
            <span className={`text-[10px] font-black uppercase tracking-wider ${copied ? 'text-green-400' : 'text-gray-400'}`}>
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>
        </div>

        {/* Native share API (mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={() => navigator.share({ title: 'BallMtaani', text: shareText, url: refUrl })}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 transition-colors"
          >
            <Share2 className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-xs font-black uppercase tracking-widest">Share via...</span>
          </button>
        )}
      </div>
    </div>
  );
}
