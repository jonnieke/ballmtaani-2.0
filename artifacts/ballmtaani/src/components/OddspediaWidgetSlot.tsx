import { useEffect, useId, useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import OddspediaCredit from "./OddspediaCredit";

type OddspediaWidgetSlotProps = {
  title: string;
  description: string;
  widgetKey: string;
  preferredWidget: string;
  selector?: string;
  globalName?: string;
  config?: Record<string, string>;
  widgetId?: string;
};

const ODDSPEDIA_INIT_URL = "https://widgets.oddspedia.com/js/widget/init.js";

declare global {
  interface Window {
    [key: string]: unknown;
  }
}

export default function OddspediaWidgetSlot({
  title,
  description,
  widgetKey,
  preferredWidget,
  selector,
  globalName,
  config,
  widgetId,
}: OddspediaWidgetSlotProps) {
  const reactId = useId();
  const elementId = selector || `oddspedia-${widgetKey}-${reactId.replace(/:/g, "")}`;
  const configuredDomain = config?.domain;
  const [domainAllowed, setDomainAllowed] = useState(true);

  useEffect(() => {
    if (!config || !globalName || !widgetId) return;
    const hostname = window.location.hostname.replace(/^www\./, "");
    const allowedHostname = configuredDomain?.replace(/^www\./, "");
    const isAllowedDomain = !allowedHostname || hostname === allowedHostname;

    setDomainAllowed(isAllowedDomain);
    if (!isAllowedDomain) return;

    window[globalName] = config;

    const script = document.createElement("script");
    script.src = `${ODDSPEDIA_INIT_URL}?widgetId=${widgetId}`;
    script.async = true;
    script.dataset.ballmtaaniOddspedia = widgetId;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [config, configuredDomain, globalName, widgetId]);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0c121b]/88 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 px-4 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{preferredWidget}</p>
          <h2 className="mt-1 text-xl font-bold uppercase text-white">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/56">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-green-400/25 bg-green-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-green-300">
          <ShieldCheck className="h-4 w-4" />
          Context only
        </div>
      </div>

      <div className="bg-black/24 p-4">
        {config && domainAllowed ? (
          <>
            <div
              id={elementId}
              data-oddspedia-widget={widgetKey}
              className="mx-auto min-h-[280px] w-full overflow-hidden rounded-2xl border border-white/8 bg-[#05070b]"
            />
            <OddspediaCredit className="mt-4" />
          </>
        ) : config ? (
          <div className="flex min-h-[230px] flex-col items-center justify-center rounded-2xl border border-[#FFD700]/18 bg-[#090d14] p-5 text-center">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-white">Standings widget is domain restricted</div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/52">
              Oddspedia allows this embed on {configuredDomain}. Local preview keeps the verified standings slot hidden so a provider warning is not shown as match data.
            </p>
            <a
              href={`https://${configuredDomain || "ballmtaani.com"}/world-cup-2026`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-primary"
            >
              View live page <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <OddspediaCredit className="mt-5 justify-center" />
          </div>
        ) : (
          <div className="flex min-h-[230px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/14 bg-white/[0.03] p-5 text-center">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-white">Oddspedia widget slot ready</div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/52">
              Paste the Oddspedia widget configuration for this module and BallMtaani will mount it as football intelligence, odds movement and match context.
            </p>
            <a
              href="https://widgets.oddspedia.com/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-primary"
            >
              Configure widget <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
