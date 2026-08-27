import React, { useEffect, useRef } from "react";

interface ArticleAdUnitProps {
  slot?: "horizontal" | "square";
  className?: string;
}

const PUBLISHER_ID = "ca-pub-3834585323769458";
const SLOT_HORIZONTAL = "3367181351";
const SLOT_SQUARE = "1843866604";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

/**
 * Compliant Google AdSense unit.
 * IMPORTANT: This component is exclusively mounted inside substantive long-form
 * editorial article views (ArticlePage) to strictly adhere to Google's policy
 * against ads on functional, navigational, and utility screens.
 */
export default function ArticleAdUnit({ slot = "horizontal", className = "" }: ArticleAdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const adInitialized = useRef(false);

  const adSlot = slot === "square" ? SLOT_SQUARE : SLOT_HORIZONTAL;

  useEffect(() => {
    // Check if script is already present; if not, dynamically load it safely
    if (!document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    if (adInitialized.current) return;

    try {
      if (typeof window !== "undefined" && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adInitialized.current = true;
      }
    } catch {
      // Ignore Adsbygoogle push error
    }
  }, []);

  return (
    <div className={`my-8 flex flex-col items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#0d0d0d] p-3 ${className}`}>
      <span className="mb-2 text-[8px] font-black uppercase tracking-[0.25em] text-white/30">
        Advertisement
      </span>
      <div className="w-full flex items-center justify-center min-h-[90px] overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center", minWidth: "250px", width: "100%" }}
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
