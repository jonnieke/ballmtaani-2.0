import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

function isInStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches
    || (window.navigator as any).standalone === true;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const lastDismissed = localStorage.getItem("mtaani_install_dismissed");
    if (lastDismissed && Date.now() - Number(lastDismissed) < 7 * 24 * 60 * 60 * 1000) return;
    if (isInStandaloneMode()) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      const timer = setTimeout(() => setShow(true), 10000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("mtaani_install_dismissed", String(Date.now()));
    setDismissed(true);
    setShow(false);
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300 md:left-auto md:right-4 md:w-80">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B30000] to-transparent" />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"
        >
          <X className="w-3 h-3 text-gray-400" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-[#B30000]/20 rounded-xl flex items-center justify-center border border-[#B30000]/30 shrink-0">
            <Smartphone className="w-6 h-6 text-[#B30000]" />
          </div>
          <div>
            <p className="font-black text-white text-sm">Keep matchday close</p>
            <p className="text-gray-500 text-xs">Fan pulse, rooms, and receipts in one tap</p>
          </div>
        </div>

        {isIOS ? (
          <div className="text-xs text-gray-400 bg-white/5 rounded-xl p-3 space-y-1">
            <p>Tap <strong className="text-white">Share</strong>, then</p>
            <p><strong className="text-white">Add to Home Screen</strong></p>
          </div>
        ) : (
          <button
            onClick={handleInstall}
            className="w-full bg-gradient-to-r from-[#B30000] to-red-700 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(179,0,0,0.4)] transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Add to Home Screen
          </button>
        )}
      </div>
    </div>
  );
}
