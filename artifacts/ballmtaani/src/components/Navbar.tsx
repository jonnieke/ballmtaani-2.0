import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Moon, Search, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useMatches } from "../hooks/useData";
import NotificationBell from "./NotificationBell";

const NAV_ITEMS = [
  ["News", "/news"],
  ["Scores", "/matches?tab=live"],
  ["Fixtures", "/matches?tab=fixtures"],
  ["Tables", "/matches?tab=tables"],
  ["Edge", "/edge"],
  ["Talanta Mtaani", "/talanta"],
  ["Rewards", "/rewards"],
  ["Kenya", "/news?section=kenya"],
  ["Africa", "/news?section=africa"],
  ["Fan Zone", "/fan-zones"],
  ["Mchambuzi", "/mchambuzi-halisi"],
] as const;

export function Navbar() {
  const [location] = useLocation();
  const { isLoggedIn, username } = useAuth();
  const { atmosphere, setAtmosphere } = useTheme();
  const { data: live = [] } = useMatches();
  const [open, setOpen] = useState(false);
  const pathname = useMemo(() => location.split(/[?#]/)[0], [location]);
  const active = (href: string) => pathname === href.split(/[?#]/)[0];

  return (
    <header className="relative z-50 bg-[#050505] text-white">
      <div className="border-b border-white/15">
        <div className="mx-auto flex h-[58px] max-w-[1500px] items-center justify-between gap-4 px-4">
          <Link
            href="/"
            aria-label="BallMtaani home"
            className="min-w-0 leading-none"
          >
            <span className="block whitespace-nowrap text-[24px] font-black italic sm:text-[28px]">
              BALL<span className="text-[#d8212d]">MTAANI</span>
            </span>
            <span className="mt-1 block text-[7px] font-black uppercase text-white/65">
              More than a game
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/matches?tab=live"
              className="hidden h-8 items-center gap-2 rounded-[3px] border border-[#d8212d] px-3 text-[9px] font-black uppercase sm:flex"
            >
              <i className="h-1.5 w-1.5 rounded-full bg-[#ef3038]" />
              Live scores
              {live.length > 0 && (
                <span className="text-[#ef3038]">| {live.length}</span>
              )}
            </Link>
            <Link
              href="/search"
              aria-label="Search"
              title="Search"
              className="grid h-9 w-9 place-items-center text-white/80 hover:text-white"
            >
              <Search className="h-5 w-5" />
            </Link>
            <NotificationBell compact />
            <button
              type="button"
              aria-label="Toggle matchday theme"
              title="Toggle matchday theme"
              onClick={() =>
                setAtmosphere(
                  atmosphere === "default" ? "night-mtaani" : "default",
                )
              }
              className="hidden h-9 w-9 place-items-center text-white/80 hover:text-white sm:grid"
            >
              <Moon className="h-4 w-4" />
            </button>
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="hidden max-w-[120px] truncate rounded-[3px] border border-white/20 px-3 py-2 text-[9px] font-black uppercase md:block"
              >
                {username || "Profile"}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-[3px] border border-white/25 px-3 py-2 text-[9px] font-black uppercase md:block"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="hidden rounded-[3px] bg-[#d8212d] px-3 py-2 text-[9px] font-black uppercase sm:block"
                >
                  Join
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label="Toggle navigation"
            className="grid h-10 w-10 place-items-center min-[900px]:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      <nav
        aria-label="Primary navigation"
      className="hidden border-b border-white/10 min-[900px]:block"
      >
        <div className="mx-auto flex h-[38px] max-w-[1500px] items-center justify-between px-4">
          {NAV_ITEMS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className={`flex h-full items-center border-b-2 px-1 text-[10px] font-black uppercase ${active(href) ? "border-[#d8212d] text-white" : "border-transparent text-white/78 hover:text-[#ef3038]"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
      {open && (
        <nav
          aria-label="Mobile navigation"
        className="grid grid-cols-2 gap-px border-b border-white/15 bg-white/10 p-px min-[900px]:hidden"
        >
          {NAV_ITEMS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="bg-[#0b0b0b] px-4 py-3 text-[10px] font-black uppercase text-white/82"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
