import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Download, X, Share, PlusSquare } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if dismissed recently in localStorage
    const dismissed = localStorage.getItem("ballmtaani_pwa_dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Check if already in standalone mode (already installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    let installAvailable = isIosDevice;
    let delayElapsed = false;
    const hasEngaged = () => {
      const pageHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      return window.scrollY / pageHeight >= 0.3;
    };
    const revealAfterEngagement = () => {
      if (installAvailable && (delayElapsed || hasEngaged())) setShowPrompt(true);
    };

    // Keep the native install event, but do not cover editorial content on arrival.
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      installAvailable = true;
      revealAfterEngagement();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("scroll", revealAfterEngagement, { passive: true });

    const timer = window.setTimeout(() => {
      delayElapsed = true;
      revealAfterEngagement();
    }, 45_000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("scroll", revealAfterEngagement);
      window.clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("ballmtaani_pwa_dismissed", String(Date.now()));
  };

  if (!showPrompt || installed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative space-y-3 rounded-xl border border-red-500/35 bg-[#121212]/95 p-4 text-white shadow-2xl backdrop-blur-md">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white p-1"
          aria-label="Dismiss app prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d71920] text-sm font-black text-white shadow-md">
            BM
          </div>
          <div>
            <h4 className="text-xs font-black text-white">Add BallMtaani to your phone</h4>
            <p className="text-[11px] text-gray-300">Quick access to fixtures, verified tables and football news.</p>
          </div>
        </div>

        {isIos ? (
          <div className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-[11px] text-gray-300 space-y-1">
            <p className="flex items-center gap-1.5">
              1. Tap Share <Share className="h-3.5 w-3.5 text-blue-400 inline" /> in Safari toolbar.
            </p>
            <p className="flex items-center gap-1.5">
              2. Select <strong>Add to Home Screen</strong> <PlusSquare className="inline h-3.5 w-3.5 text-red-400" />.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="h-8 flex-1 bg-[#d71920] text-xs font-bold text-white shadow-md hover:bg-[#b31319]"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Install App
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-xs text-gray-400 hover:text-white h-8"
            >
              Maybe Later
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
