import { Link, useLocation } from "wouter";
import { Home, Trophy, Swords, User, LayoutGrid } from "lucide-react";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/matches", label: "Matches", icon: Trophy },
    { href: "/rapid-fire", label: "Arcade", icon: LayoutGrid },
    { href: "/rivalries", label: "Duels", icon: Swords },
    { href: "/profile", label: "Fan", icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] px-6 pb-6 pointer-events-none">
      <div className="max-w-md mx-auto h-16 bg-[#111111]/90 border border-white/10 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex items-center justify-between px-2 pointer-events-auto">
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
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? "text-primary scale-110" : "text-gray-500 group-hover:text-white"
                  }`}
                />
                <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 transition-all ${
                  isActive ? "text-white opacity-100" : "text-gray-500 opacity-60"
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
