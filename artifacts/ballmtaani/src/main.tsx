import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";
// import { registerSW } from "virtual:pwa-register";

// Initialize Sentry for error tracking
Sentry.init({
  dsn: "https://6c49f59cbda59aa740fbf911c5410182@o4511495051018240.ingest.de.sentry.io/4511495057965136",
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
});

// Register the PWA service worker
// registerSW({ immediate: true });

// Auto-reload once when a stale asset (JS chunk or CSS) 404s after a deploy.
// SW v8 no longer caches index.html, so a reload always fetches fresh chunk hashes.
const RELOAD_KEY = "chunk_reload_v2";

function tryStaleReload(url: string) {
  if (url.includes("/assets/") && !sessionStorage.getItem(RELOAD_KEY)) {
    console.warn("[BallMtaani] Stale asset detected, reloading:", url);
    sessionStorage.setItem(RELOAD_KEY, "1");
    window.location.reload();
  }
}

// Catch SCRIPT and LINK (CSS) tag load failures
window.addEventListener("error", (event) => {
  const target = event.target as HTMLElement;
  if (target?.tagName === "SCRIPT") {
    tryStaleReload((target as HTMLScriptElement).src || "");
  } else if (target?.tagName === "LINK") {
    tryStaleReload((target as HTMLLinkElement).href || "");
  }
}, true);

// Catch dynamic import() failures (React lazy chunks)
window.addEventListener("unhandledrejection", (event) => {
  const msg = String(event.reason?.message || event.reason || "");
  if (msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Importing a module script failed")) {
    const urlMatch = msg.match(/https?:\/\/[^\s"')]+/);
    tryStaleReload(urlMatch?.[0] || "/assets/");
  }
});

// Optional monitor for resource load failures during local debugging.
if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_RESOURCES === "true") {
  window.addEventListener(
    "error",
    (event) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === "IMG" || target.tagName === "SCRIPT" || target.tagName === "LINK")) {
        const url = (target as HTMLImageElement).src || (target as HTMLLinkElement).href || "";
        console.warn(`[Resource Load Failure] [${target.tagName}] ${url}`);
      }
    },
    true
  );
}

const SentryApp = Sentry.withProfiler(App);

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>Something went wrong. Please refresh the page.</div>} showDialog>
    <SentryApp />
  </Sentry.ErrorBoundary>
);
