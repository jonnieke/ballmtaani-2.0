import { useState } from "react";
import { Bell, BellOff, X, Loader2 } from "lucide-react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell({ compact = false }: { compact?: boolean }) {
  const { isLoggedIn } = useAuth();
  const { isSupported, isSubscribed, isLoading, pushError, subscribeToPush, unsubscribeFromPush } = usePushNotifications();
  const [showPanel, setShowPanel] = useState(false);

  if (!isSupported) return null;

  const toggle = async () => {
    if (!isLoggedIn) { setShowPanel(true); return; }
    if (isSubscribed) await unsubscribeFromPush();
    else await subscribeToPush();
  };

  if (compact) {
    return (
      <button
        onClick={toggle}
        disabled={isLoading}
        title={isSubscribed ? "Disable match alerts" : "Enable match alerts"}
        aria-label={isSubscribed ? "Disable match alerts" : "Enable match alerts"}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95
          ${isSubscribed ? "bg-[#FFD700]/15 text-[#FFD700]" : "bg-white/6 text-white/40 hover:bg-white/12 hover:text-white"}`}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
         isSubscribed ? <Bell className="h-4 w-4 fill-[#FFD700]/40" /> :
         <Bell className="h-4 w-4" />}
        {isSubscribed && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#FFD700]" />}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(s => !s)}
        disabled={isLoading}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-95
          ${isSubscribed
            ? "border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700]"
            : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"}`}
        aria-label="Match alerts"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
         isSubscribed ? <Bell className="h-4 w-4 fill-[#FFD700]/30" /> :
         <Bell className="h-4 w-4" />}
        {isSubscribed && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-[#FFD700]" />
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1018] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-widest text-white">Match Alerts</p>
            <button onClick={() => setShowPanel(false)} className="text-white/30 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="p-4">
            {!isLoggedIn ? (
              <p className="text-sm text-white/50">
                <a href="/login" className="font-black text-[#B30000] hover:underline">Sign in</a> to enable live match alerts.
              </p>
            ) : (
              <>
                <p className="mb-3 text-sm text-white/60">
                  {isSubscribed
                    ? "🔔 You'll get alerts for live matches, WC26 updates and duel challenges."
                    : "Get notified when matches go live, WC26 updates drop, and fans challenge you to a duel."}
                </p>
                {pushError && <p className="mb-3 rounded-lg bg-[#B30000]/15 px-3 py-2 text-xs text-[#ff6b6b]">{pushError}</p>}
                <button
                  onClick={async () => { await toggle(); setShowPanel(false); }}
                  disabled={isLoading}
                  className={`w-full rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95
                    ${isSubscribed ? "border border-white/10 bg-white/5 text-white/50 hover:bg-white/10" : "bg-[#FFD700] text-black hover:bg-yellow-300"}`}
                >
                  {isLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> :
                   isSubscribed ? <><BellOff className="mr-2 inline h-3.5 w-3.5" />Turn Off Alerts</> :
                   <>🔔 Enable Match Alerts</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



