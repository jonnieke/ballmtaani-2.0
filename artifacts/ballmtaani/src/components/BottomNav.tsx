import { Link, useLocation } from "wouter";
import { Home, Trophy, Swords, User, LayoutGrid, Star } from "lucide-react";

export default function BottomNav() {
  const [location] = useLocation();

  const now = Date.now();
  const wc26Start = new Date("2026-06-11").getTime();
  const wc26End = new Date("2026-07-20").getTime();
  const showWC26 = now < wc26End; // show from now until end of tournament

  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/matches", label: "Matches", icon: Trophy },
    { href: "/rapid-fire", label: "Arcade", icon: LayoutGrid },
    showWC26
      ? { href: "/world-cup-2026", label: now >= wc26Start ? "WC26 Live" : "WC26", icon: Star, highlight: true }
      : { href: "/rivalries", label: "Duels", icon: Swords },
    { href: "/profile", label: "Fan", icon: User },
  ] as { href: string; label: string; icon: typeof Home; highlight?: boolean }[];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pointer-events-none">
      <div className="mx-auto flex h-14 max-w-sm items-center justify-between rounded-2xl border border-white/10 bg-[#111111]/90 px-1.5 shadow-[0_-10px_32px_rgba(0,0,0,0.55)] backdrop-blur-2xl pointer-events-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex-1 relative flex flex-col items-center justify-center h-full transition-all group`}
            >
              <div className="relative flex flex-col items-center justify-center z-10">
                <Icon
                  className={`h-4.5 w-4.5 transition-all duration-300 ${
                    isActive
                      ? item.highlight ? "text-[#FFD700] scale-110" : "text-primary scale-110"
                      : item.highlight ? "text-[#FFD700]/70 group-hover:text-[#FFD700]" : "text-gray-500 group-hover:text-white"
                  }`}
                />
                <span className={`mt-0.5 text-[8px] font-black uppercase tracking-tighter transition-all ${
                  isActive
                    ? "text-white opacity-100"
                    : item.highlight ? "text-[#FFD700]/70 opacity-80" : "text-gray-500 opacity-60"
                }`}>
                  {item.label}
                </span>
              </div>
              
              {isActive && (
                <>
                  <div className="absolute inset-x-1 inset-y-2 bg-primary/10 rounded-xl border border-primary/20 animate-in fade-in zoom-in duration-300" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary shadow-[0_0_10px_#B30000]" />
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
