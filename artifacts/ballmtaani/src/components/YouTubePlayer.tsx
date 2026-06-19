import { useEffect, useRef } from "react";

/**
 * YouTube embed via the IFrame Player API so we can detect videos the current
 * viewer cannot play (deleted, embed-disabled or region-restricted) and let the
 * parent swap in the next playable one. Playback stays on the official player.
 */

let apiPromise: Promise<any> | null = null;
function loadIframeApi(): Promise<any> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise(resolve => {
    const w = window as any;
    if (w.YT?.Player) { resolve(w.YT); return; }
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => { prev?.(); resolve(w.YT); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  });
  return apiPromise;
}

// 2: invalid id · 5: player error · 100: removed/private · 101/150: embed or region blocked
const UNAVAILABLE_CODES = new Set([2, 5, 100, 101, 150]);

export default function YouTubePlayer({
  videoId,
  title,
  autoplay = false,
  className = "",
  onUnavailable,
}: {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  className?: string;
  onUnavailable?: (videoId: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onUnavailableRef = useRef(onUnavailable);
  onUnavailableRef.current = onUnavailable;

  useEffect(() => {
    const host = hostRef.current;
    let player: any = null;
    let cancelled = false;

    loadIframeApi().then(YT => {
      if (cancelled || !host) return;
      const mount = document.createElement("div");
      host.appendChild(mount);
      player = new YT.Player(mount, {
        videoId,
        width: "100%",
        height: "100%",
        host: "https://www.youtube-nocookie.com",
        // fs:0 keeps playback inside our page chrome (no fullscreen takeover)
        playerVars: { rel: 0, modestbranding: 1, autoplay: autoplay ? 1 : 0, playsinline: 1, fs: 0 },
        events: {
          onError: (e: any) => {
            if (UNAVAILABLE_CODES.has(Number(e?.data))) onUnavailableRef.current?.(videoId);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try { player?.destroy(); } catch { /* already gone */ }
      if (host) host.innerHTML = "";
    };
  }, [videoId, autoplay]);

  return <div ref={hostRef} title={title} className={`[&_iframe]:h-full [&_iframe]:w-full ${className}`} />;
}
