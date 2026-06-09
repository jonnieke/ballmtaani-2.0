import { Link, useLocation } from "wouter";
import { Home, Radio, Trophy, Sparkles, Star, Search } from "lucide-react";
import NotificationBell from "./NotificationBell";

const NAV_ITEMS = [
  { href: "/home",             label: "Home",      icon: Home },
  { href: "/search",           label: "Search",    icon: Search },
  { href: "/live-center",      label: "Live",       icon: Radio },
  { href: "/matches",          label: "Matches",    icon: Trophy },
  { href: "/world-cup-2026",   label: "WC26",       icon: Star, gold: true },
];

export default function FloatingNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[200] flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-white/12 bg-black/75 px-2 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        {/* Brand mark */}
        <Link
          href="/"
          className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B30000] shadow-[0_0_16px_rgba(179,0,0,0.5)] transition-transform hover:scale-105 active:scale-95"
          aria-label="BallMtaani Home"
        >
          <span className="text-[13px] font-black text-white">B</span>
        </Link>

        {/* Notification bell */}
        <NotificationBell compact />

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-white/10" />

        {/* Nav links */}
        {NAV_ITEMS.map(({ href, label, icon: Icon, gold }) => {
          const isActive = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                isActive
                  ? gold
                    ? "bg-[#FFD700]/15 text-[#FFD700]"
                    : "bg-[#B30000]/20 text-white"
                  : gold
                  ? "text-[#FFD700]/60 hover:text-[#FFD700]"
                  : "text-white/45 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive && !gold ? "text-[#B30000]" : ""}`} />
              <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
              {isActive && (
                <span className={`absolute top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full ${gold ? "bg-[#FFD700]" : "bg-[#B30000]"} shadow-[0_0_6px_currentColor]`} />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
