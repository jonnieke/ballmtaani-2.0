import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Menu, X, Coins, ChevronDown, Search, Bell, Shield } from "lucide-react";
import { ChooseClubModal } from "./ChooseClubModal";
import { useTheme, ThemeAtmosphere } from "../context/ThemeContext";

export function Navbar() {
  const [location] = useLocation();
  const { isLoggedIn, username, coins, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chooseClubOpen, setChooseClubOpen] = useState(false);
  const { atmosphere, setAtmosphere } = useTheme();

  const [walletAnimating, setWalletAnimating] = useState(false);
  const [prevCoins, setPrevCoins] = useState(coins);

  useEffect(() => {
    if (coins > prevCoins && prevCoins !== 0) {
      setWalletAnimating(true);
      setPrevCoins(coins);
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
        { href: "/leagues", label: "Leagues Hub" },
        { href: "/live-center", label: "Live Pulse" },
        { href: "/mchambuzi-halisi", label: "Mchambuzi AI" },
        { href: "/world-cup-2026", label: "World Cup Archive" },
      ]
    },
    {
      label: "Games",
      links: [
        { href: "/predictions", label: "Calls" },
        { href: "/war-room", label: "War Room" },
        { href: "/rapid-fire", label: "Rapid Fire" },
      ]
    },
    {
      label: "Social",
      links: [
        { href: "/debates", label: "Debates" },
        { href: "/fan-zones", label: "Fan Zones" },
        { href: "/leaderboard", label: "Leaderboard" },
      ]
    }
  ];

  return (
    <>
      <ChooseClubModal isOpen={chooseClubOpen} onClose={() => setChooseClubOpen(false)} />
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

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-5 2xl:gap-7 mx-auto flex-1 justify-center px-4">
            {[
              { href: "/home", label: "HOME" },
              { href: "/leagues", label: "LEAGUES" },
              { href: "/matches?search=KPL", label: "KPL" },
              { href: "/matches?search=Champions", label: "UCL" },
              { href: "/matches?search=Premier", label: "EPL" },
              { href: "/matches?search=LaLiga", label: "LA LIGA" },
            ].map(({ href, label }) => {
              const isActive = location === href || (location.startsWith(href.split("?")[0]) && href.includes("?"));
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
          </div>

          {/* Global Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setChooseClubOpen(true)}
              className="px-3 py-1.5 rounded-full bg-[#1B1B1B] border border-white/15 text-[#FFD700] hover:text-white hover:border-[#FFD700]/60 text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 mr-1"
            >
              <Shield className="w-3.5 h-3.5" /> MY CLUBS
            </button>
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
            <button
              onClick={() => { setChooseClubOpen(true); setMobileMenuOpen(false); }}
              className="text-left px-4 py-3 rounded font-bold text-sm uppercase tracking-wider text-[#FFD700] hover:bg-white/5 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" /> My Clubs & Preferences
            </button>
            {menuCategories.flatMap(c => c.links).map((link) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded text-sm font-bold uppercase transition-all ${
                    isActive ? "text-primary bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}
