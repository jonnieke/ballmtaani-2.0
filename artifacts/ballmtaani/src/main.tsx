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

// Auto-reload once if a JS chunk fails to load (stale service worker serving old hashes)
window.addEventListener("error", (event) => {
  const target = event.target as HTMLElement;
  if (target?.tagName === "SCRIPT") {
    const url = (target as HTMLScriptElement).src || "";
    if (url.includes("/assets/") && !sessionStorage.getItem("chunk_reload_attempted")) {
      console.warn("[BallMtaani] Stale chunk detected, reloading:", url);
      sessionStorage.setItem("chunk_reload_attempted", "1");
      window.location.reload();
    }
  }
}, true);

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
