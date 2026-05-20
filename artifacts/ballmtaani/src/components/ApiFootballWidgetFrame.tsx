import { createElement, useEffect, type CSSProperties } from "react";
import { LockKeyhole } from "lucide-react";

type WidgetType = "livescore" | "fixtures" | "fixture" | "standings";

type ApiFootballWidgetFrameProps = {
  type: WidgetType;
  title: string;
  subtitle?: string;
  height?: number;
  league?: number | string;
  season?: number | string;
  fixtureId?: number | string;
  date?: string;
  team?: number | string;
  className?: string;
};

const WIDGET_SCRIPT = "https://widgets.api-sports.io/3.1.0/widgets.js";
const API_HOST = "v3.football.api-sports.io";
const SCRIPT_ID = "ballmtaani-api-sports-widgets";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function apiWidgetType(type: WidgetType) {
  if (type === "fixture") return "game";
  if (type === "standings") return "standings";
  return "games";
}

export default function ApiFootballWidgetFrame({
  type,
  title,
  subtitle,
  height = 360,
  league,
  season,
  fixtureId,
  date,
  team,
  className,
}: ApiFootballWidgetFrameProps) {
  const apiKey = import.meta.env.VITE_API_FOOTBALL_KEY;
  const widgetKey = `${type}-${league || ""}-${season || ""}-${fixtureId || ""}-${date || ""}-${team || ""}`;

  useEffect(() => {
    if (!apiKey) return;
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = WIDGET_SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }

    const timer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("api-sports-widget-refresh"));
    }, 150);

    return () => window.clearTimeout(timer);
  }, [apiKey, widgetKey]);

  const configProps = {
    "data-type": "config",
    "data-host": API_HOST,
    "data-key": apiKey,
    "data-sport": "football",
    "data-theme": "dark",
    "data-lang": "en",
    "data-refresh": type === "livescore" || type === "fixture" ? "30" : "120",
    "data-show-error": "true",
    "data-favorite": "true",
    style: { display: "none" },
  };

  const widgetProps: Record<string, string | undefined | CSSProperties> = {
    key: widgetKey,
    "data-type": apiWidgetType(type),
    "data-sport": "football",
    "data-show-logos": "true",
    "data-date": type === "livescore" ? todayIso() : date,
    "data-league": league ? String(league) : undefined,
    "data-season": season ? String(season) : undefined,
    "data-team": team ? String(team) : undefined,
    "data-game-id": fixtureId ? String(fixtureId) : undefined,
    "data-modal-game": type === "fixtures" || type === "livescore" ? "true" : undefined,
    "data-modal-standings": type === "fixtures" || type === "livescore" ? "true" : undefined,
    style: {
      display: "block",
      minHeight: height,
      width: "100%",
      background: "#070a0f",
    },
  };

  return (
    <section className={`overflow-hidden rounded-xl border border-white/10 bg-[#090d14] shadow-[0_18px_50px_rgba(0,0,0,0.4)] ${className || ""}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0d131c] px-3 py-2.5">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-white">{title}</h2>
          {subtitle ? <p className="mt-0.5 truncate text-[11px] font-medium text-white/44">{subtitle}</p> : null}
        </div>
        <div className="h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_12px_rgba(239,35,48,0.8)]" />
      </div>

      {apiKey ? (
        <div className="bg-[#070a0f]" style={{ minHeight: height }}>
          {createElement("api-sports-widget", configProps)}
          {createElement("api-sports-widget", widgetProps)}
        </div>
      ) : (
        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
          <LockKeyhole className="mb-3 h-8 w-8 text-primary" />
          <p className="text-sm font-semibold text-white">API-Football key required</p>
          <p className="mt-2 max-w-sm text-xs leading-5 text-white/45">
            Add `VITE_API_FOOTBALL_KEY` to render live widgets here.
          </p>
        </div>
      )}
    </section>
  );
}
