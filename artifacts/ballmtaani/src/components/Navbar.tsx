import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Menu, X, Coins, Paintbrush, ChevronDown, Trophy, Search, Bell } from "lucide-react";

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
    { id: "default", label: "Classic Brand", icon: "BM" },
    { id: "gunners-city", label: "Gunners vs City", icon: "GC" },
    { id: "el-clasico", label: "El Clasico", icon: "EC" },
    { id: "night-mtaani", label: "Night Mtaani", icon: "NM" },
  ];

  const menuCategories = [
    {
      label: "Matches",
      links: [
        { href: "/matches", label: "Directory" },
        { href: "/live-center", label: "Live Pulse" },
        { href: "/mchambuzi-halisi", label: "Mchambuzi AI" },
        { href: "/world-cup-2026", label: "World Cup Archive" },
        { href: "/market-watch", label: "Market Watch" },
      ]
    },
    {
      label: "Games",
      links: [
        { href: "/predictions", label: "Calls" },
        { href: "/war-room", label: "War Room" },
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
    <nav className="sticky top-0 z-50 bg-[#070707] border-b border-[#2A2A2A]">
      <div className="w-full px-4 xl:px-8 h-[72px] flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/home" className="flex items-center shrink-0">
          <span className="font-black text-2xl tracking-tighter italic">
            <span className="text-white">BALL</span>
            <span className="text-[#B30000]">MTAANI</span>
          </span>
        </Link>

        {/* Hamburger — mobile only */}
        <button
          className="xl:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors ml-auto mr-3"
          onClick={() => setMobileMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Nav - exact reference match */}
        <div className="hidden xl:flex items-center gap-5 2xl:gap-7 mx-auto flex-1 justify-center px-4">
          {[
            { href: "/home", label: "HOME" },
            { href: "/matches?search=KPL", label: "KPL" },
            { href: "/matches?search=FKF", label: "FKF CUP" },
            { href: "/matches?search=Champions", label: "CHAMPIONS LEAGUE" },
            { href: "/matches?search=Premier", label: "PREMIER LEAGUE" },
            { href: "/matches?search=LaLiga", label: "LA LIGA" },
            { href: "/matches?search=Serie", label: "SERIE A" },
            { href: "/matches?search=Bundesliga", label: "BUNDESLIGA" },
            { href: "/matches?search=Ligue", label: "LIGUE 1" },
          ].map(({ href, label }) => {
            const isActive = location === href || location.startsWith(href.split("?")[0] + "?") && href.includes("?");
            return (
              <Link
                key={href}
                href={href}
                className={`relative pb-1 font-black text-[10px] 2xl:text-[11px] uppercase tracking-widest transition-colors ${
                  isActive ? "text-[#B30000]" : "text-white/60 hover:text-white"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B30000] rounded-full" />
                )}
              </Link>
            );
          })}
          <div className="group relative">
            <button className="flex items-center gap-1 font-black text-[10px] 2xl:text-[11px] uppercase tracking-widest text-white/60 hover:text-white transition-colors pb-1">
              MORE <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/search" className="p-2 text-white/50 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/notifications" className="p-2 text-white/50 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </Link>

          {isLoggedIn ? (
            <>
              {/* MTC status wallet */}
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
            <div className="hidden xl:flex items-center gap-3">
              <Link 
                href="/login"
                onClick={() => sessionStorage.setItem("auth_return_url", window.location.pathname)}
                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
              >
                LOGIN
              </Link>
              <Link 
                href="/login"
                onClick={() => sessionStorage.setItem("auth_return_url", window.location.pathname)}
                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-[#B30000] rounded-full hover:bg-red-800 transition-colors"
              >
                SIGN UP
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-24 left-0 w-full bg-[#0B0B0B] border-b border-[#1B1B1B] shadow-2xl py-4 px-4 flex flex-col gap-2">
          <Link
            href="/home"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded font-bold text-sm uppercase tracking-wider transition-all ${
              location === "/home"
                ? "bg-primary text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Home
          </Link>
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
                <span className="font-black text-[#FFD700] uppercase text-xs tracking-wider">{coins.toLocaleString()} MTC</span>
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
