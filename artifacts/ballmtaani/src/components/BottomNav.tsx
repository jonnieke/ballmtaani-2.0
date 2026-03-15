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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pointer-events-none">
      <div className="max-w-md mx-auto h-16 bg-[#111] border border-white/10 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center justify-around px-2 pointer-events-auto overflow-hidden relative">
        {/* Active Indicator Background (Optional) */}
        
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center w-12 h-12 transition-all group">
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-xl animate-in fade-in zoom-in duration-300" />
              )}
              <Icon 
                className={`w-5 h-5 transition-all duration-300 ${
                  isActive ? "text-primary scale-110" : "text-gray-500 group-hover:text-white"
                }`}
              />
              <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 transition-all ${
                isActive ? "text-white opacity-100" : "text-gray-500 opacity-60 group-hover:opacity-100"
              }`}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_#B30000]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
