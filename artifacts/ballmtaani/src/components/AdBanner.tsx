import { Link } from "wouter";
import { Megaphone, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

interface DirectAd {
  id: string;
  name: string;
  advertiser: string | null;
  image_url: string | null;
  destination_url: string;
  cta_text: string;
  label: string;
}

async function fetchDirectAd(placement: "horizontal" | "square"): Promise<DirectAd | null> {
  if (!supabase) return null;
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("ad_campaigns")
    .select("id, name, advertiser, image_url, destination_url, cta_text, label")
    .eq("status", "active")
    .or(`placement.eq.${placement},placement.eq.both`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .lte("starts_at", now)
    .order("priority", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as DirectAd) || null;
}

async function trackImpression(id: string) {
  if (!supabase) return;
  try {
    const { error } = await supabase.rpc("increment_ad_impressions", { ad_id: id });
    if (error) throw error;
  } catch {
    const { data } = await supabase.from("ad_campaigns").select("impressions").eq("id", id).single();
    if (data) supabase.from("ad_campaigns").update({ impressions: (data.impressions || 0) + 1 }).eq("id", id);
  }
}

async function trackClick(id: string) {
  if (!supabase) return;
  try {
    const { error } = await supabase.rpc("increment_ad_clicks", { ad_id: id });
    if (error) throw error;
  } catch {
    const { data } = await supabase.from("ad_campaigns").select("clicks").eq("id", id).single();
    if (data) supabase.from("ad_campaigns").update({ clicks: (data.clicks || 0) + 1 }).eq("id", id);
  }
}

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
  onNoFill,
}: {
  slot: string;
  format: "auto" | "rectangle";
  responsive: boolean;
  className: string;
  onNoFill?: () => void;
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

  useEffect(() => {
    if (!slot || !adRef.current) return;
    const node = adRef.current;
    const localNoFill = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    const checkFill = () => {
      const status = node.getAttribute("data-ad-status");
      const googleStatus = node.getAttribute("data-adsbygoogle-status");
      const hasContent = node.children.length > 0 || Boolean(node.innerHTML.trim());
      if (status === "unfilled" || (googleStatus === "done" && !hasContent) || (localNoFill && !hasContent)) {
        onNoFill?.();
      }
    };

    const observer = new MutationObserver(checkFill);
    observer.observe(node, { attributes: true, childList: true, subtree: true });
    const timer = window.setTimeout(checkFill, localNoFill ? 1800 : 4500);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [slot, onNoFill]);

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
  const [noFill, setNoFill] = useState(false);
  const [directAd, setDirectAd] = useState<DirectAd | null>(null);
  const [directAdLoaded, setDirectAdLoaded] = useState(false);
  const showDevHint = import.meta.env.DEV;

  useEffect(() => {
    fetchDirectAd(type as "horizontal" | "square").then(ad => {
      setDirectAd(ad);
      setDirectAdLoaded(true);
      if (ad) trackImpression(ad.id);
    });
  }, [type]);

  // Show direct sponsor ad if one is active
  if (directAdLoaded && directAd) {
    return (
      <aside className={`w-full overflow-hidden rounded-lg border border-white/10 bg-[#0F0F0F] ${type === "square" ? "" : ""}`} aria-label="Sponsored">
        <a href={directAd.destination_url} target="_blank" rel="noopener noreferrer sponsored"
          onClick={() => trackClick(directAd.id)}
          className="flex items-center gap-3 p-3 transition-opacity hover:opacity-90 sm:p-4">
          {directAd.image_url && (
            <img src={directAd.image_url} alt={directAd.name}
              className={`shrink-0 rounded object-cover ${type === "square" ? "h-24 w-full" : "h-12 w-20"}`} />
          )}
          {!directAd.image_url && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-white/10 bg-black/40">
              <Megaphone className="h-5 w-5 text-gray-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Sponsored - {directAd.label}</span>
            </div>
            <p className="truncate text-sm font-bold text-white">{directAd.name}</p>
            {directAd.advertiser && <p className="text-[10px] text-white/30">{directAd.advertiser}</p>}
          </div>
          <span className="shrink-0 rounded border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/50 transition-colors hover:text-white">
            {directAd.cta_text}
          </span>
        </a>
      </aside>
    );
  }

  if (slot && noFill) return null;
  if (!slot && !showDevHint) return null;
  if (showDevHint) {
    return (
      <aside
        className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0F0F0F] px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-gray-500"
        aria-label={`${label} advertisement`}
      >
        <span>Advertisement</span>
        <span className="min-w-0 truncate text-gray-600">{label} slot off</span>
        <Link href="/privacy" className="shrink-0 text-gray-500 hover:text-white">
          Ad Info
        </Link>
      </aside>
    );
  }

  if (type === "square") {
    return (
      <aside className="bg-[#0F0F0F] border border-white/10 rounded-lg p-3" aria-label={`${label} advertisement`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Advertisement</span>
          <ShieldCheck className="h-3.5 w-3.5 text-gray-600" />
        </div>
        {slot ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center border border-dashed border-white/10 bg-black/30 px-4 text-center">
            <AdSenseUnit
              slot={slot}
              format="rectangle"
              responsive={false}
              className="w-full min-h-[250px]"
              onNoFill={() => setNoFill(true)}
            />
          </div>
        ) : showDevHint ? (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
            <Megaphone className="h-4 w-4 text-gray-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label} slot off</p>
          </div>
        ) : null}
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
            <p className="text-xs font-bold text-gray-300 sm:text-sm">Advertisement space reserved for partner campaigns.</p>
          </div>
        </div>

        {slot ? (
          <div className="flex min-h-[64px] items-center justify-center border border-dashed border-white/10 bg-black/30 px-4 text-center sm:w-[320px]">
            <AdSenseUnit
              slot={slot}
              format="auto"
              responsive={true}
              className="w-full min-h-[64px]"
              onNoFill={() => setNoFill(true)}
            />
          </div>
        ) : null}

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


