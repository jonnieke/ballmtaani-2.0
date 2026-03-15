import { useMatches } from "../hooks/useData";
import { Link } from "wouter";
import TeamLogo from "../components/TeamLogo";
import { SkeletonMatch } from "../components/Skeletons";

export default function LiveCenterIndexPage() {
  const { data: liveMatches = [], isLoading } = useMatches();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 min-h-screen">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-full px-5 py-2 mb-6 shadow-[0_0_20px_rgba(179,0,0,0.15)]">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          <span className="text-primary font-black text-xs uppercase tracking-[0.2em]">Matchday Live</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
          Premium <span className="text-primary drop-shadow-[0_0_15px_rgba(179,0,0,0.5)]">Live Center</span>
        </h1>
        <p className="text-gray-400 font-medium font-bold uppercase tracking-widest">Select a match to enter the tactical view</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <SkeletonMatch key={i} />)
        ) : liveMatches.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <span className="text-2xl opacity-50">🏟️</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">No Live Matches</h3>
            <p className="text-gray-500 font-bold">Check back later for live action from the major leagues.</p>
          </div>
        ) : (
          liveMatches.map((match: any) => (
            <Link key={match.id} href={`/live-center/${match.id}`} className="block group h-full">
              <div className="bg-[#111111] rounded-2xl border border-white/5 p-6 shadow-2xl relative overflow-hidden transition-all hover:bg-[#161616] cursor-pointer hover:border-primary/30 hover:shadow-primary/20 h-full flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors"></div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{match.league}</span>
                  <span className="bg-primary text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-[0_0_10px_rgba(179,0,0,0.5)] flex items-center gap-1.5 shrink-0 border border-[#ff4444]/30">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> {match.minute}
                  </span>
                </div>

                <div className="flex items-center justify-between flex-1 mb-6">
                  <div className="flex flex-col items-center gap-3 w-[35%]">
                    <TeamLogo logo={match.homeLogo} initial={match.homeInitial} color={match.homeColor} size="lg" shadow />
                    <span className="font-black text-sm text-center leading-tight truncate w-full">{match.home}</span>
                  </div>

                  <div className="flex items-center justify-center w-[30%] gap-3">
                    <span className="text-4xl font-black drop-shadow-md">{match.homeScore}</span>
                    <span className="text-xl font-black text-primary">-</span>
                    <span className="text-4xl font-black drop-shadow-md">{match.awayScore}</span>
                  </div>

                  <div className="flex flex-col items-center gap-3 w-[35%]">
                    <TeamLogo logo={match.awayLogo} initial={match.awayInitial} color={match.awayColor} size="lg" shadow />
                    <span className="font-black text-sm text-center leading-tight truncate w-full">{match.away}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <button className="w-full bg-white/5 hover:bg-primary text-gray-300 hover:text-white border border-white/10 hover:border-primary font-black uppercase text-xs tracking-widest py-3 rounded-xl transition-all shadow-md group-hover:shadow-[0_0_15px_rgba(179,0,0,0.4)]">
                    Enter Live Center →
                  </button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
