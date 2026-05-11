import { Link } from "wouter";
import { Megaphone, ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";

interface AdBannerProps {
  label?: string;
  type?: "horizontal" | "square";
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_CLIENT = "ca-pub-3834585323769458";
const HORIZONTAL_SLOT = import.meta.env.VITE_ADSENSE_SLOT_HORIZONTAL || "";
const SQUARE_SLOT = import.meta.env.VITE_ADSENSE_SLOT_SQUARE || "";

function AdSenseUnit({
  slot,
  format,
  responsive,
  className,
}: {
  slot: string;
  format: "auto" | "rectangle";
  responsive: boolean;
  className: string;
}) {
  const adRef = useRef<HTMLModElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!slot || initializedRef.current) return;
    if (!adRef.current) return;
    if (typeof window === "undefined") return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initializedRef.current = true;
    } catch (error) {
      console.error("AdSense init failed:", error);
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
      data-adtest={import.meta.env.DEV ? "on" : undefined}
      ref={adRef}
    />
  );
}

export default function AdBanner({ label = "Wallet", type = "horizontal" }: AdBannerProps) {
  const slot = type === "square" ? SQUARE_SLOT : HORIZONTAL_SLOT;

  if (type === "square") {
    return (
      <aside className="bg-[#0F0F0F] border border-white/10 rounded-lg p-3" aria-label={`${label} advertisement`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Advertisement</span>
          <ShieldCheck className="h-3.5 w-3.5 text-gray-600" />
        </div>
        <div className="flex min-h-[250px] flex-col items-center justify-center border border-dashed border-white/10 bg-black/30 px-4 text-center">
          {slot ? (
            <AdSenseUnit
              slot={slot}
              format="rectangle"
              responsive={false}
              className="w-full min-h-[250px]"
            />
          ) : (
            <>
              <Megaphone className="mb-3 h-6 w-6 text-gray-500" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-300">{label}</p>
              <p className="mt-2 max-w-[190px] text-[11px] leading-relaxed text-gray-500">
                Set `VITE_ADSENSE_SLOT_SQUARE` to activate this slot.
              </p>
            </>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full overflow-hidden rounded-lg border border-white/10 bg-[#0F0F0F]" aria-label={`${label} advertisement`}>
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 bg-black/40">
            <Megaphone className="h-5 w-5 text-gray-500" />
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Advertisement</span>
              <span className="h-1 w-1 rounded-full bg-gray-700" />
              <span className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">{label}</span>
            </div>
            <p className="text-xs font-bold text-gray-300 sm:text-sm">Ads help keep BallMtaani free for matchday rooms, calls, and fan receipts.</p>
          </div>
        </div>

        <div className="flex min-h-[64px] items-center justify-center border border-dashed border-white/10 bg-black/30 px-4 text-center sm:w-[320px]">
          {slot ? (
            <AdSenseUnit
              slot={slot}
              format="auto"
              responsive={true}
              className="w-full min-h-[64px]"
            />
          ) : (
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              Set `VITE_ADSENSE_SLOT_HORIZONTAL` to activate
            </p>
          )}
        </div>

        <Link
          href="/privacy"
          className="shrink-0 border border-white/10 px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-white"
        >
          Ad Info
        </Link>
      </div>
    </aside>
  );
}
