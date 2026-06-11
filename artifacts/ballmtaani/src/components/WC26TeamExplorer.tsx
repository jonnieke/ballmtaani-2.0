import { useState, useMemo } from "react";
import { Search, MapPin, Users, Calendar } from "lucide-react";
import { WC26_TEAMS, WC26_STADIUMS, searchTeams, type WC26TeamData } from "../data/wc26-teams";

export default function WC26TeamExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<WC26TeamData | null>(null);

  const filteredTeams = useMemo(
    () => (searchQuery.trim() ? searchTeams(searchQuery) : WC26_TEAMS),
    [searchQuery]
  );

  const teamStadiums = useMemo(() => {
    if (!selectedTeam) return [];
    return WC26_STADIUMS.filter(s =>
      selectedTeam.fixtures.some(f => f.stadium === s.name)
    );
  }, [selectedTeam]);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search teams by name, group, or region..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedTeam(null);
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[#FFD700]/30 focus:bg-white/8 focus:outline-none"
        />
      </div>

      {/* Teams grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team) => (
          <button
            key={team.name}
            onClick={() => setSelectedTeam(selectedTeam?.name === team.name ? null : team)}
            className={`text-left rounded-xl border p-3 transition-all ${
              selectedTeam?.name === team.name
                ? "border-[#FFD700]/50 bg-[#FFD700]/10"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
            }`}
          >
            <div className="flex items-center gap-2">
              <img src={team.logo} alt={team.name} className="h-5 w-5" />
              <span className="font-bold text-white">{team.name}</span>
              <span className="ml-auto text-[10px] font-bold text-white/50">
                {team.group}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Team detail panel */}
      {selectedTeam && (
        <div className="space-y-4 rounded-2xl border border-[#FFD700]/20 bg-[#0d1018]/90 p-5">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <img src={selectedTeam.logo} alt={selectedTeam.name} className="h-10 w-10" />
              <div>
                <h3 className="text-lg font-black text-white">{selectedTeam.name}</h3>
                <p className="text-[10px] text-white/50">
                  {selectedTeam.confederation}  -  Group {selectedTeam.group}
                </p>
              </div>
            </div>
          </div>

          {/* Two-column layout: Fixtures + Stadiums | Players */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Fixtures & Stadiums */}
            <div className="space-y-4">
              {/* Fixtures */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#FFD700]" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-white">
                    Group Stage Fixtures
                  </h4>
                </div>
                <div className="space-y-2">
                  {selectedTeam.fixtures.map((f) => (
                    <div
                      key={`${f.matchday}`}
                      className="rounded-lg border border-white/8 bg-white/3 p-2.5 text-[11px]"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-bold text-white">
                          {f.home ? selectedTeam.name : f.opponent} vs{" "}
                          {f.home ? f.opponent : selectedTeam.name}
                        </span>
                        <span className="text-[9px] text-white/50">MD {f.matchday}</span>
                      </div>
                      <div className="text-white/60">
                        {f.date}  -  {f.time} EAT
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-white/50">
                        <MapPin className="h-3 w-3" />
                        {f.stadium}  -  {f.city}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stadiums */}
              {teamStadiums.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#FFD700]" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">
                      Venues
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {teamStadiums.map((s) => (
                      <div
                        key={s.name}
                        className="rounded-lg border border-white/8 bg-white/3 p-2.5 text-[11px]"
                      >
                        <div className="font-bold text-white">{s.name}</div>
                        <div className="text-white/60">
                          {s.city}, {s.country}
                        </div>
                        <div className="mt-1 text-white/50">
                          Capacity: {s.capacity.toLocaleString()}
                        </div>
                        {s.note && <div className="mt-1 text-[#FFD700]/80">{s.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Players */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-[#FFD700]" />
                <h4 className="text-xs font-black uppercase tracking-widest text-white">
                  Squad ({selectedTeam.players.length} players)
                </h4>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {selectedTeam.players.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-white/3 px-2.5 py-1.5 text-[10px]"
                  >
                    <div>
                      <span className="font-bold text-white">{p.name}</span>
                      <span className="ml-2 text-white/50">{p.club}</span>
                    </div>
                    <span className="rounded bg-[#FFD700]/20 px-1.5 py-0.5 font-bold text-[#FFD700]">
                      {p.position}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredTeams.length === 0 && (
        <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
          <p className="text-sm text-white/50">No teams match your search</p>
        </div>
      )}
    </div>
  );
}
