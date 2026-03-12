import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { isLoggedIn, username, openLoginModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/matches", label: "Matches" },
    { href: "/predictions", label: "Predictions" },
    { href: "/debates", label: "Debates" },
    { href: "/fan-zones", label: "Fan Zones" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0B0B]/95 backdrop-blur-md border-b border-[#1B1B1B]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.png" alt="BallMtaani" className="h-12 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1 mx-4">
          {links.map((link) => {
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md font-bold text-xs xl:text-sm uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-[#B30000]/10 text-[#B30000] border-b-2 border-[#B30000]"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border-b-2 border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {isLoggedIn ? (
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-[#1B1B1B] border border-[#B30000] flex items-center justify-center text-[#B30000] font-black text-sm">
                {username.substring(0, 2).toUpperCase()}
              </div>
              <span className="font-bold text-sm text-white hidden xl:block">{username}</span>
            </Link>
          ) : (
            <>
              <button 
                onClick={openLoginModal}
                className="px-5 py-2 text-sm font-bold uppercase tracking-wider text-white border border-white/20 rounded hover:bg-white/5 transition-colors"
              >
                Log In
              </button>
              <button 
                onClick={openLoginModal}
                className="px-5 py-2 text-sm font-bold uppercase tracking-wider text-white bg-[#B30000] rounded hover:bg-red-800 transition-colors shadow-[0_0_15px_rgba(179,0,0,0.3)]"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden text-white p-2 -mr-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-[#0B0B0B] border-b border-[#1B1B1B] shadow-2xl py-4 px-4 flex flex-col gap-2">
          {links.map((link) => {
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded font-bold text-sm uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-[#B30000] text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div className="h-px bg-white/10 my-2"></div>
          
          {isLoggedIn ? (
            <div className="flex items-center justify-between px-4 py-2">
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1B1B1B] border border-[#B30000] flex items-center justify-center text-[#B30000] font-black">
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
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button 
                onClick={() => { openLoginModal(); setMobileMenuOpen(false); }}
                className="py-3 text-sm font-bold uppercase tracking-wider text-white border border-white/20 rounded hover:bg-white/5 transition-colors"
              >
                Log In
              </button>
              <button 
                onClick={() => { openLoginModal(); setMobileMenuOpen(false); }}
                className="py-3 text-sm font-bold uppercase tracking-wider text-white bg-[#B30000] rounded hover:bg-red-800 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
