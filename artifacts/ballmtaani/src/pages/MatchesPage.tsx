import { useState } from "react";
import { Link } from "wouter";
import { useRecentMatches, useUpcomingFixtures } from "../hooks/useData";
import TeamLogo from "../components/TeamLogo";

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<"recent" | "upcoming">("recent");

  const { data: recentMatches = [] } = useRecentMatches();
  const { data: upcomingFixtures = [] } = useUpcomingFixtures();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 border-b border-white/10">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-6 border-l-4 border-primary pl-4">
          Match Directory
        </h1>
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("recent")}
            className={`pb-3 text-sm md:text-base font-black uppercase tracking-widest transition-colors relative ${activeTab === "recent" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Recent Results
            {activeTab === "recent" && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t"></span>}
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`pb-3 text-sm md:text-base font-black uppercase tracking-widest transition-colors relative ${activeTab === "upcoming" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Upcoming Fixtures
            {activeTab === "upcoming" && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t"></span>}
          </button>
        </div>
      </div>

      {activeTab === "recent" ? (
        <div className="space-y-8">
          {recentMatches.length === 0 ? (
            <div className="text-center text-gray-400 py-10 font-bold uppercase tracking-wider">No recent matches found.</div>
          ) : (
            // Group by date
            Object.entries(
              recentMatches.reduce((groups: Record<string, any[]>, match: any) => {
                (groups[match.date] = groups[match.date] || []).push(match);
                return groups;
              }, {})
            ).map(([date, matches]) => (
              <div key={date}>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div> {date}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(matches as any[]).map((match: any) => (
                    <div key={match.id} className="bg-[rgba(20,20,25,0.95)] rounded-xl border border-white/5 p-4 md:p-5 shadow-xl relative overflow-hidden flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{match.league}</span>
                        <span className="bg-gray-800 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1.5 shrink-0">
                          FT
                        </span>
                      </div>

                      <div className="flex items-center justify-between flex-1">
                        <div className="flex flex-col items-center gap-2 w-[35%]">
                          <TeamLogo logo={match.homeLogo} initial={match.homeInitial} color={match.homeColor} size="md" shadow />
                          <span className="font-bold text-xs md:text-sm text-center truncate w-full">{match.home}</span>
                        </div>

                        <div className="flex items-center justify-center w-[30%] gap-2 md:gap-3">
                          <span className={`text-3xl md:text-4xl font-black ${match.homeScore > match.awayScore ? 'text-white' : 'text-gray-500'}`}>{match.homeScore}</span>
                          <span className="text-lg md:text-xl font-black text-gray-600">-</span>
                          <span className={`text-3xl md:text-4xl font-black ${match.awayScore > match.homeScore ? 'text-white' : 'text-gray-500'}`}>{match.awayScore}</span>
                        </div>

                        <div className="flex flex-col items-center gap-2 w-[35%]">
                          <TeamLogo logo={match.awayLogo} initial={match.awayInitial} color={match.awayColor} size="md" shadow />
                          <span className="font-bold text-xs md:text-sm text-center truncate w-full">{match.away}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {["Today", "Tomorrow"].map(date => {
            const dateFixtures = upcomingFixtures.filter((f: any) => f.date === date || (date === "Today" && f.date === "Upcoming"));
            if (dateFixtures.length === 0) return null;

            return (
              <div key={date}>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div> {date}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dateFixtures.map((fixture: any) => (
                    <div key={fixture.id} className="bg-[#1B1B1B] rounded-xl border border-white/5 p-4 shadow-lg hover:border-white/10 transition-colors flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{fixture.league}</span>
                        <span className="bg-[#0B0B0B] border border-primary/30 text-primary text-[10px] font-black uppercase px-2 py-1 rounded">
                          {fixture.time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-5 flex-1">
                        <div className="flex flex-col items-center gap-2 w-[40%]">
                          <TeamLogo logo={fixture.homeLogo} initial={fixture.homeInitial} color={fixture.homeColor} size="lg" />
                          <span className="font-bold text-sm text-center w-full truncate">{fixture.home}</span>
                        </div>
                        <div className="text-sm font-black text-gray-600">VS</div>
                        <div className="flex flex-col items-center gap-2 w-[40%]">
                          <TeamLogo logo={fixture.awayLogo} initial={fixture.awayInitial} color={fixture.awayColor} size="lg" />
                          <span className="font-bold text-sm text-center w-full truncate">{fixture.away}</span>
                        </div>
                      </div>

                      <Link href="/predictions" className="block w-full text-center bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs py-2.5 rounded transition-colors mt-auto border border-white/10">
                        Predict Score
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
