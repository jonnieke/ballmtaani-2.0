import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Search, Shield, X } from "lucide-react";
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
  return String(league || "MATCH").split(" ")[0].toUpperCase();
}
function short(name: string) { return String(name || "").replace(/\s+(FC|SC|AFC|City|United|Town|Rovers|Athletic|Stars?)$/i, "").trim().slice(0, 3).toUpperCase(); }
function score(match: any) { return typeof match?.homeScore === "number" && typeof match?.awayScore === "number" ? `${match.homeScore}-${match.awayScore}` : match?.status || match?.time || "TBC"; }

const publication = [["MTAA DAILY", "/#mtaa-daily"], ["KENYA", "/#kenya"], ["AFRICA", "/#africa"], ["EPL", "/#epl"], ["EUROPE", "/leagues"], ["ANALYSIS", "/#analysis"], ["TRANSFERS", "/news"], ["OPINION", "/articles"]] as const;
const tools = [["Scores", "/matches"], ["Fixtures", "/matches"], ["Tables", "/leagues"], ["Mchambuzi", "/mchambuzi-halisi"], ["Predictions", "/predictions"], ["Fan Zone", "/fan-zones"], ["Leaderboard", "/leaderboard"]] as const;

export function Navbar() {
  const [location] = useLocation();
  const { isLoggedIn, username } = useAuth();
  const { data: live = [] } = useMatches(); const { data: upcoming = [] } = useUpcomingFixtures();
  const [menuOpen, setMenuOpen] = useState(false); const [clubsOpen, setClubsOpen] = useState(false);
  const ticker = useMemo(() => [...live, ...upcoming].slice(0, 4), [live, upcoming]);
  const now = new Date();
  return <>
    <ChooseClubModal isOpen={clubsOpen} onClose={() => setClubsOpen(false)} />
    <header className="relative z-50 bg-black text-white">
      <div className="border-b border-white/10">
        <div className="mx-auto flex h-10 max-w-[1500px] items-center gap-5 overflow-x-auto px-4 whitespace-nowrap hide-scrollbar">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#ef3038]"><span className="h-2 w-2 rounded-full bg-[#ef3038]" />Live scores</span>
          {ticker.length ? ticker.map((match: any) => <Link key={String(match.id)} href={`/live-center/${match.id}`} className="inline-flex h-full items-center gap-2 border-l border-white/10 pl-5 text-[10px] font-bold text-white/75 hover:text-white"><span className="text-white/38">{leagueTag(match.league)}</span><TeamLogo logo={match.homeLogo} initial={short(match.home)} color={match.homeColor || "#1f2937"} size="xs" /><span>{short(match.home)}</span><span className="text-[#f5ca55]">{score(match)}</span><span>{short(match.away)}</span><span className="text-white/35">{match.minute || ""}</span></Link>) : <Link href="/matches" className="border-l border-white/10 pl-5 text-[10px] text-white/45 hover:text-white">Today&apos;s fixtures and live scores</Link>}
          <Link href="/matches" className="ml-auto text-[9px] font-bold text-white/55 hover:text-white">View all live scores</Link>
        </div>
      </div>

      <div className="mx-auto grid min-h-[102px] max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4">
        <div className="hidden text-[10px] leading-5 text-white/55 lg:block"><p>{now.toLocaleDateString("en-KE", { weekday: "long" })}</p><p>{now.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</p><p>Nairobi, Kenya</p></div>
        <Link href="/" className="text-center"><div className="font-serif text-[2.45rem] font-black leading-none tracking-[-.045em] sm:text-[3.35rem]">BALLMTAANI</div><div className="mt-1.5 text-[9px] font-black uppercase tracking-[.22em] text-[#ef3038] sm:text-[11px]">Football. From where we stand.</div></Link>
        <div className="flex items-center justify-end gap-2"><Link href="/search" aria-label="Search" className="grid h-9 w-9 place-items-center text-white/70 hover:text-white"><Search className="h-5 w-5" /></Link><NotificationBell compact /><button onClick={() => setClubsOpen(true)} className="hidden h-9 items-center gap-2 bg-[#b91b24] px-4 text-[10px] font-black sm:inline-flex"><Shield className="h-3.5 w-3.5" />My Clubs</button>{isLoggedIn ? <Link href="/profile" className="hidden text-[10px] font-black text-white/70 md:block">{username}</Link> : <Link href="/login" className="hidden text-[10px] font-black text-white/70 md:block">Sign in</Link>}<button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" className="grid h-10 w-10 place-items-center lg:hidden">{menuOpen ? <X /> : <Menu />}</button></div>
      </div>

      <div className="hidden border-y border-white/10 lg:block"><div className="mx-auto flex h-11 max-w-[1500px] items-center justify-between px-4"><nav className="flex h-full items-center gap-8">{publication.map(([label, href]) => <a key={label} href={href} className={`flex h-full items-center border-b-2 text-[10px] font-black tracking-[.1em] ${location === href ? "border-[#ef3038] text-[#ef3038]" : "border-transparent text-white/75 hover:text-white"}`}>{label}</a>)}</nav><span className="text-[10px] font-black tracking-[.14em] text-[#f5ca55]">TOOLS</span></div></div>
      <div className="hidden border-b border-white/10 bg-[#0c0c0c] lg:block"><nav className="mx-auto flex h-11 max-w-[1500px] items-center gap-9 px-4">{tools.map(([label, href]) => <Link key={label} href={href} className={`text-[10px] font-bold ${location === href ? "text-[#ef3038]" : "text-white/68 hover:text-white"}`}>{label}</Link>)}</nav></div>

      {menuOpen && <div className="border-t border-white/10 bg-[#080808] p-3 lg:hidden"><nav className="grid grid-cols-2 gap-px bg-white/10">{publication.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)} className="bg-[#0b0b0b] px-3 py-3 text-[10px] font-black tracking-[.1em] text-white/80">{label}</a>)}</nav><nav className="mt-3 flex gap-4 overflow-x-auto pb-1 whitespace-nowrap hide-scrollbar">{tools.map(([label, href]) => <Link key={label} href={href} onClick={() => setMenuOpen(false)} className="text-[10px] font-bold text-[#f5ca55]">{label}</Link>)}</nav></div>}
    </header>
  </>;
}
