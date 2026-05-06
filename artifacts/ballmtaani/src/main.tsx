import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// import { registerSW } from "virtual:pwa-register";

// Register the PWA service worker
// registerSW({ immediate: true });

// Global monitor for resource 404s (helps identify "and trivia" type errors)
window.addEventListener('error', (event) => {
  const target = event.target as HTMLElement;
  if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
    const url = (target as any).src || (target as any).href;
    console.error(`🚨 Resource Load Failure: [${target.tagName}] ${url}`);
  }
}, true);

createRoot(document.getElementById("root")!).render(<App />);
