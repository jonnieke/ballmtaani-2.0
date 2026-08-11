import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Bell, Menu, Search, Shield, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMatches, useUpcomingFixtures } from "../hooks/useData";
import { ChooseClubModal } from "./ChooseClubModal";
import NotificationBell from "./NotificationBell";
import TeamLogo from "./TeamLogo";

function leagueTag(league?: string) {
  const value = String(league || "").toLowerCase();
  if (value.includes("premier")) return "EPL";
  if (value.includes("champions")) return "UCL";
  if (value.includes("fkf") || value.includes("kpl") || value.includes("kenya")) return "KPL";
  if (value.includes("caf") || value.includes("africa")) return "CAF";
  return (league || "MATCH").split(" ")[0].toUpperCase();
}

function short(name: string) {
  return String(name || "")
    .replace(/\s+(FC|SC|AFC|City|United|Town|Rovers|Athletic|Stars?)$/i, "")
    .trim()
    .slice(0, 3)
    .toUpperCase();
}

function tickerText(match: any) {
  if (typeof match?.homeScore === "number" && typeof match?.awayScore === "number") return `${match.homeScore}–${match.awayScore}`;
  return match?.status || match?.minute || match?.time || "LIVE";
}

export function Navbar() {
  const [location] = useLocation();
  const { isLoggedIn, username } = useAuth();
  const { data: live = [] } = useMatches();
  const { data: upcoming = [] } = useUpcomingFixtures();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chooseClubOpen, setChooseClubOpen] = useState(false);

  const tickerMatches = useMemo(() => {
    const base = [...live, ...upcoming].slice(0, 4);
    return base.map((match: any) => ({
      id: match.id,
      league: leagueTag(match.league),
      home: match.home,
      away: match.away,
      homeLogo: match.homeLogo,
      awayLogo: match.awayLogo,
      homeColor: match.homeColor || "#1f2937",
      awayColor: match.awayColor || "#1f2937",
      score: tickerText(match),
      status: match.status || match.time || match.minute || "",
    }));
  }, [live, upcoming]);

  const publicationLinks = [
    ["MTAA DAILY", "/#mtaa-daily"],
    ["KENYA", "/#kenya"],
    ["AFRICA", "/#africa"],
    ["EPL", "/#epl"],
    ["EUROPE", "/#analysis"],
    ["ANALYSIS", "/#analysis"],
    ["TRANSFERS", "/news"],
    ["OPINION", "/articles"],
  ] as const;

  const tools = [
    ["Scores", "/matches"],
    ["Fixtures", "/matches"],
    ["Tables", "/leagues"],
    ["Mchambuzi", "/mchambuzi-halisi"],
    ["Predictions", "/predictions"],
    ["Fan Zone", "/fan-zones"],
    ["Leaderboard", "/leaderboard"],
  ] as const;

  return (
    <>
      <ChooseClubModal isOpen={chooseClubOpen} onClose={() => setChooseClubOpen(false)} />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
        <div className="border-b border-white/8">
          <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto px-4 py-2 whitespace-nowrap">
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#B30000]">
              <span className="h-2 w-2 rounded-full bg-[#B30000]" /> Live scores
            </span>
            {tickerMatches.map((match) => (
              <Link key={String(match.id)} href={match.score === "LIVE" ? "/matches" : `/live-center/${match.id}`} className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/75 hover:border-white/18 hover:text-white">
                <span className="text-white/45">{match.league}</span>
                <TeamLogo logo={match.homeLogo} initial={short(match.home)} color={match.homeColor} size="xs" />
                <span>{short(match.home)}</span>
                <span className="text-white/40">{match.score}</span>
                <span>{short(match.away)}</span>
                <TeamLogo logo={match.awayLogo} initial={short(match.away)} color={match.awayColor} size="xs" />
                <span className="text-white/35 normal-case tracking-normal">{match.status}</span>
              </Link>
            ))}
            <Link href="/matches" className="ml-auto inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/55 hover:text-white">
              View all live scores <ChevronRightIcon />
            </Link>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-5 lg:grid-cols-[1fr_auto_1fr]">
          <div className="hidden items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-white/45 lg:flex">
            <span>{new Date().toLocaleDateString("en-KE", { weekday: "long" })}</span>
            <span>{new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>Nairobi, Kenya</span>
          </div>

          <Link href="/" className="text-center">
            <div className="font-serif text-3xl font-black tracking-tight text-white sm:text-4xl">BALLMTAANI</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.34em] text-[#B30000]">Football. From where we stand.</div>
          </Link>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <Link href="/search" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/65 hover:text-white">
              <Search className="h-4 w-4" />
            </Link>
            <NotificationBell compact />
            <button onClick={() => setChooseClubOpen(true)} className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/75 hover:text-white md:inline-flex">
              <Shield className="h-3.5 w-3.5" /> My Clubs
            </button>
            {isLoggedIn ? (
              <Link href="/profile" className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/75 hover:text-white md:inline-flex">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#B30000] text-xs text-white">{username.slice(0, 2).toUpperCase()}</span>
                <span className="max-w-[120px] truncate">{username}</span>
              </Link>
            ) : (
              <Link href="/login" className="hidden rounded-full bg-[#B30000] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white md:inline-flex">
                Sign in
              </Link>
            )}
            <button className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75" onClick={() => setMobileMenuOpen((value) => !value)} aria-label="Toggle navigation">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="hidden border-y border-white/8 lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
            <nav className="flex flex-wrap items-center gap-5">
              {publicationLinks.map(([label, to]) => (
                <a key={label} href={to} className={`text-[10px] font-black uppercase tracking-[0.22em] transition-colors ${location === to ? "text-[#B30000]" : "text-white/70 hover:text-white"}`}>
                  {label}
                </a>
              ))}
            </nav>
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#FFD700]">Tools</span>
          </div>
        </div>

        <div className="hidden border-b border-white/8 lg:block">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
            {tools.map(([label, to]) => (
              <Link key={label} href={to} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${location === to ? "text-[#B30000]" : "text-white/65 hover:text-white"}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/8 bg-black px-4 py-4 lg:hidden">
            <nav className="grid gap-2">
              {publicationLinks.map(([label, to]) => <a key={label} href={to} onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white/80">{label}</a>)}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {tools.map(([label, to]) => <Link key={label} href={to} onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white/80">{label}</Link>)}
              </div>
              <button onClick={() => { setChooseClubOpen(true); setMobileMenuOpen(false); }} className="rounded-xl border border-white/8 bg-[#B30000]/10 px-4 py-3 text-left text-sm font-black uppercase tracking-[0.18em] text-[#FFD700]">My Clubs</button>
              {!isLoggedIn && <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-xl bg-[#B30000] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-white">Sign in</Link>}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

function ChevronRightIcon() { return <span aria-hidden>→</span>; }
