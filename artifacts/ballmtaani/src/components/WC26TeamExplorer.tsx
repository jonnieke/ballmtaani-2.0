import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import type { TournamentStandingEntry } from "../lib/football-api";

type Props = {
  standings: Record<string, TournamentStandingEntry[]>;
};

type VerifiedTeam = TournamentStandingEntry & { group: string };

export default function WC26TeamExplorer({ standings }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<VerifiedTeam | null>(null);

  const teams = useMemo(
    () => Object.entries(standings)
      .filter(([group]) => /^Group [A-L]$/.test(group))
      .flatMap(([group, rows]) => rows.map((row) => ({ ...row, group: group.replace("Group ", "") })))
      .sort((a, b) => a.group.localeCompare(b.group) || a.rank - b.rank),
    [standings],
  );

  const filteredTeams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return teams;
    return teams.filter((team) => team.team.toLowerCase().includes(query) || team.group.toLowerCase() === query);
  }, [searchQuery, teams]);

  if (!teams.length) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
        <p className="text-sm font-bold text-white/65">Verified tournament teams are currently unavailable.</p>
        <p className="mt-2 text-xs leading-5 text-white/35">BallMtaani does not substitute a static draw when the API-Football group feed is unavailable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          aria-label="Search verified World Cup teams"
          placeholder="Search verified teams or group..."
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setSelectedTeam(null);
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 transition-colors focus:border-[#FFD700]/40 focus:outline-none"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {filteredTeams.map((team) => (
          <button
            key={`${team.group}-${team.team}`}
            type="button"
            onClick={() => setSelectedTeam(selectedTeam?.team === team.team ? null : team)}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              selectedTeam?.team === team.team
                ? "border-[#FFD700]/50 bg-[#FFD700]/10"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
            }`}
          >
            {team.logo ? (
              <img src={team.logo} alt="" className="h-7 w-7 object-contain" loading="lazy" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[9px] font-black text-white/50">
                {team.team.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="min-w-0 flex-1 truncate text-xs font-black text-white">{team.team}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{team.group}</span>
          </button>
        ))}
      </div>

      {selectedTeam && (
        <div className="rounded-2xl border border-[#FFD700]/20 bg-[#0d1018]/90 p-5">
          <div className="flex flex-wrap items-center gap-4">
            {selectedTeam.logo && <img src={selectedTeam.logo} alt="" className="h-11 w-11 object-contain" />}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-black text-white">{selectedTeam.team}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">Group {selectedTeam.group} · Position {selectedTeam.rank}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/8 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" /> API-Football
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[
              ["Played", selectedTeam.played], ["Won", selectedTeam.won], ["Drawn", selectedTeam.draw],
              ["Lost", selectedTeam.lost], ["Goal diff", selectedTeam.gd],
              ["Points", selectedTeam.points],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-center">
                <dt className="text-[8px] font-black uppercase tracking-widest text-white/30">{label}</dt>
                <dd className="mt-1 text-base font-black tabular-nums text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {!filteredTeams.length && (
        <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center text-sm text-white/50">No verified team matches that search.</div>
      )}
    </div>
  );
}
