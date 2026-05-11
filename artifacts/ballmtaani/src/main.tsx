import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// import { registerSW } from "virtual:pwa-register";

// Register the PWA service worker
// registerSW({ immediate: true });

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

createRoot(document.getElementById("root")!).render(<App />);
