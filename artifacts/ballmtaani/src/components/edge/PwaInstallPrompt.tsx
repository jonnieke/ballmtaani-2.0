import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Download, X, Smartphone, Zap, Sparkles, Share, PlusSquare } from "lucide-react";

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

    // Android/Desktop Chrome beforeinstallprompt event
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // If iOS and not installed, show after 3 seconds
    if (isIosDevice && !window.matchMedia("(display-mode: standalone)").matches) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
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
      <div className="relative rounded-2xl border border-emerald-500/40 bg-[#121212]/95 backdrop-blur-md p-4 shadow-2xl space-y-3 text-white">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white p-1"
          aria-label="Dismiss app prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-black text-sm shadow-md shrink-0">
            BM
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-white">Install BallMtaani Edge</h4>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] px-1.5 py-0">
                0 MB
              </Badge>
            </div>
            <p className="text-[11px] text-gray-300">Fast offline access &amp; instant lineup receipts</p>
          </div>
        </div>

        {isIos ? (
          <div className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-[11px] text-gray-300 space-y-1">
            <p className="flex items-center gap-1.5">
              1. Tap Share <Share className="h-3.5 w-3.5 text-blue-400 inline" /> in Safari toolbar.
            </p>
            <p className="flex items-center gap-1.5">
              2. Select <strong>Add to Home Screen</strong> <PlusSquare className="h-3.5 w-3.5 text-emerald-400 inline" />.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 shadow-md"
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
