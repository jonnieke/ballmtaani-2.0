import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Menu, X, Coins, Sparkles, Paintbrush } from "lucide-react";

import { useTheme, ThemeAtmosphere } from "../context/ThemeContext";

export function Navbar() {
  const [location] = useLocation();
  const { isLoggedIn, username, coins, logout } = useAuth();
  const { atmosphere, setAtmosphere } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [walletAnimating, setWalletAnimating] = useState(false);

  useEffect(() => {
    if (coins > 0) {
      setWalletAnimating(true);
      const timer = setTimeout(() => setWalletAnimating(false), 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [coins]);


  const atmospheres: { id: ThemeAtmosphere; label: string; icon: string }[] = [
    { id: "default", label: "Classic Brand", icon: "⚽" },
    { id: "gunners-city", label: "Gunners vs City", icon: "⚔️" },
    { id: "el-clasico", label: "El Clasico", icon: "👑" },
    { id: "night-mtaani", label: "Night Mtaani", icon: "🌃" },
  ];

  const menuCategories = [
    {
      label: "Matches",
      links: [
        { href: "/matches", label: "Directory" },
        { href: "/live-center", label: "Live Bounties" },
      ]
    },
    {
      label: "Games",
      links: [
        { href: "/predictions", label: "A.I. Predictions" },
        { href: "/rapid-fire", label: "Rapid Fire" },
        { href: "/trivia", label: "Millionaire" },
      ]
    },
    {
      label: "Social",
      links: [
        { href: "/debates", label: "Debates" },
        { href: "/rivalries", label: "Rivalries" },
        { href: "/fan-zones", label: "Fan Zones" },
        { href: "/leaderboard", label: "Leaderboard" },
      ]
    }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0B0B]/95 backdrop-blur-md border-b border-[#1B1B1B]">
      <div className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.png" alt="BallMtaani" className="h-36 w-auto" />
        </Link>

        {/* Desktop Nav - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-6 mx-4">
          <Link
            href="/"
            className={`font-bold text-xs xl:text-sm uppercase tracking-wider transition-all ${
              location === "/" ? "text-primary" : "text-gray-400 hover:text-white"
            }`}
          >
            Home
          </Link>
          
          {menuCategories.map((category) => {
            const isActive = category.links.some(link => location.startsWith(link.href) && link.href !== "/");
            return (
              <div key={category.label} className="relative group/nav py-6">
                <button
                  className={`font-bold text-xs xl:text-sm uppercase tracking-wider transition-all flex items-center gap-1 ${
                    isActive ? "text-primary border-b-2 border-primary pb-1" : "text-gray-400 hover:text-white border-b-2 border-transparent pb-1"
                  }`}
                >
                  {category.label}
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute top-16 left-0 w-48 bg-[#111111]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 transform translate-y-2 group-hover/nav:translate-y-0 p-2 z-[100]">
                  {category.links.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors ${
                        location.startsWith(link.href) ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Controls (Atmosphere & Wallet) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Atmosphere Switcher */}
          <div className="relative">
            <button 
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all group relative"
              title="Change Atmosphere"
            >
              <Paintbrush className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_5px_rgba(255,214,0,0.8)]" />
            </button>

            {themeMenuOpen && (
              <div className="absolute top-full mt-3 right-0 w-64 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl p-2 animate-in slide-in-from-top-2 duration-200 z-[100]">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-3 py-2 border-b border-white/5 mb-1">
                  App Atmosphere
                </div>
                {atmospheres.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setAtmosphere(t.id);
                      setThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${atmosphere === t.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{t.icon}</span>
                      <span className="text-[11px] font-black uppercase tracking-wider">{t.label}</span>
                    </div>
                    {atmosphere === t.id && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#B30000]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <>
              {/* Coin Wallet */}
              <Link href="/store" className={`flex items-center gap-1.5 bg-[#1B1B1B] border px-3 py-1.5 rounded-full transition-all group duration-300 ${walletAnimating ? 'border-[#FFD700] scale-110 shadow-[0_0_20px_rgba(255,215,0,0.6)]' : 'border-[#FFD700]/30 hover:border-[#FFD700]/60 shadow-[0_0_10px_rgba(255,215,0,0.1)] hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]'}`}>
                <Coins className={`w-4 h-4 text-[#FFD700] transition-transform duration-300 ${walletAnimating ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                <span className={`font-black text-sm transition-colors duration-300 ${walletAnimating ? 'text-white drop-shadow-[0_0_8px_white]' : 'text-[#FFD700]'}`}>{coins.toLocaleString()}</span>
              </Link>

              <Link href="/profile" className="hidden lg:flex items-center gap-2 hover:opacity-80 transition-opacity ml-1">
                <div className="w-10 h-10 rounded-full bg-[#1B1B1B] border border-primary flex items-center justify-center text-primary font-black text-sm">
                  {username.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-bold text-sm text-white hidden xl:block">{username}</span>
              </Link>
            </>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <Link 
                href="/login"
                onClick={() => sessionStorage.setItem("auth_return_url", window.location.pathname)}
                className="px-5 py-2 text-sm font-bold uppercase tracking-wider text-white border border-white/20 rounded hover:bg-white/5 transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/login"
                onClick={() => sessionStorage.setItem("auth_return_url", window.location.pathname)}
                className="px-5 py-2 text-sm font-bold uppercase tracking-wider text-white bg-primary rounded hover:bg-red-800 transition-colors shadow-[0_0_15px_rgba(179,0,0,0.3)]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-24 left-0 w-full bg-[#0B0B0B] border-b border-[#1B1B1B] shadow-2xl py-4 px-4 flex flex-col gap-2">
          {menuCategories.flatMap(c => c.links).map((link) => {
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded font-bold text-sm uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div className="h-px bg-white/10 my-2"></div>

          {/* Mobile Atmosphere Swatches */}
          <div className="px-4 py-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Atmosphere</div>
            <div className="grid grid-cols-4 gap-2">
              {atmospheres.map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setAtmosphere(t.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${atmosphere === t.id ? 'bg-primary/10 border-primary/50' : 'bg-white/5 border-white/10 opacity-60'}`}
                >
                  <span className="text-lg mb-1">{t.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-none">{t.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-px bg-white/10 my-2"></div>
          
          {isLoggedIn ? (
            <div className="flex flex-col gap-2 px-4 py-2">
              <div className="flex items-center justify-between w-full">
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B1B1B] border border-primary flex items-center justify-center text-primary font-black">
                    {username.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-white">{username}</span>
                </Link>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs font-bold uppercase text-gray-500 hover:text-white"
                >
                  Logout
                </button>
              </div>
              <Link 
                href="/store" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#1B1B1B] border border-[#FFD700]/30 py-2 rounded-lg mt-2"
              >
                <Coins className="w-4 h-4 text-[#FFD700]" />
                <span className="font-black text-[#FFD700] uppercase text-xs tracking-wider">{coins.toLocaleString()} Coins</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Link 
                href="/login"
                onClick={() => { sessionStorage.setItem("auth_return_url", window.location.pathname); setMobileMenuOpen(false); }}
                className="py-3 text-sm font-bold uppercase tracking-wider text-white border border-white/20 rounded hover:bg-white/5 transition-colors text-center block w-full"
              >
                Log In
              </Link>
              <Link 
                href="/login"
                onClick={() => { sessionStorage.setItem("auth_return_url", window.location.pathname); setMobileMenuOpen(false); }}
                className="py-3 text-sm font-bold uppercase tracking-wider text-white bg-primary rounded hover:bg-red-800 transition-colors text-center block w-full"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
