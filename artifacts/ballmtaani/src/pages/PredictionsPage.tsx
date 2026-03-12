import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UPCOMING_FIXTURES } from "../data/mockData";
import { CheckCircle2 } from "lucide-react";

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState<"make" | "my">("make");
  const { isLoggedIn, openLoginModal } = useAuth();
  
  // State to hold predictions: fixtureId -> {home, away, saved}
  const [predictions, setPredictions] = useState<Record<string, {home: string, away: string, saved: boolean}>>({});

  const handlePredict = (fixtureId: string) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    
    // Check if both fields have values
    const pred = predictions[fixtureId];
    if (pred && pred.home !== "" && pred.away !== "") {
      setPredictions({
        ...predictions,
        [fixtureId]: { ...pred, saved: true }
      });
    }
  };

  const handleScoreChange = (fixtureId: string, team: 'home' | 'away', val: string) => {
    // Only allow numbers
    if (val !== "" && !/^\d+$/.test(val)) return;
    
    setPredictions(prev => ({
      ...prev,
      [fixtureId]: {
        home: team === 'home' ? val : (prev[fixtureId]?.home || ""),
        away: team === 'away' ? val : (prev[fixtureId]?.away || ""),
        saved: false
      }
    }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 border-b border-white/10">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-6 border-l-4 border-[#B30000] pl-4">
          Predictions
        </h1>
        
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab("make")}
            className={`pb-3 text-sm md:text-base font-black uppercase tracking-widest transition-colors relative ${activeTab === "make" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Make Prediction
            {activeTab === "make" && <span className="absolute bottom-0 left-0 w-full h-1 bg-[#B30000] rounded-t"></span>}
          </button>
          <button 
            onClick={() => setActiveTab("my")}
            className={`pb-3 text-sm md:text-base font-black uppercase tracking-widest transition-colors relative ${activeTab === "my" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            My Predictions
            {activeTab === "my" && <span className="absolute bottom-0 left-0 w-full h-1 bg-[#B30000] rounded-t"></span>}
          </button>
        </div>
      </div>

      {activeTab === "make" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {UPCOMING_FIXTURES.map(fixture => {
            const isSaved = predictions[fixture.id]?.saved;
            const hScore = predictions[fixture.id]?.home || "";
            const aScore = predictions[fixture.id]?.away || "";
            
            return (
              <div key={fixture.id} className={`bg-[rgba(20,20,25,0.95)] rounded-xl border ${isSaved ? 'border-green-500/50' : 'border-[#B30000]/30'} border-l-4 ${isSaved ? 'border-l-green-500' : 'border-l-[#B30000]'} p-6 shadow-xl relative overflow-hidden transition-all`}>
                
                {isSaved && (
                  <div className="absolute top-0 right-0 bg-green-500/10 text-green-500 px-3 py-1 rounded-bl-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Saved
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{fixture.league}</span>
                  <span className="text-gray-500 text-xs font-bold">{fixture.date}, {fixture.time}</span>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col items-center gap-2 w-1/4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white shadow-lg" style={{ backgroundColor: fixture.homeColor }}>{fixture.homeInitial}</div>
                    <span className="font-bold text-sm text-center truncate w-full">{fixture.home}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-4">
                    <input 
                      type="text" 
                      maxLength={2}
                      value={hScore}
                      onChange={(e) => handleScoreChange(fixture.id, 'home', e.target.value)}
                      disabled={isSaved}
                      className="w-14 h-16 md:w-16 md:h-20 bg-[#0B0B0B] border-2 border-white/10 focus:border-[#B30000] rounded text-center text-3xl font-black text-white focus:outline-none disabled:opacity-50 transition-colors"
                      placeholder="-"
                    />
                    <span className="text-gray-600 font-black text-xl">-</span>
                    <input 
                      type="text" 
                      maxLength={2}
                      value={aScore}
                      onChange={(e) => handleScoreChange(fixture.id, 'away', e.target.value)}
                      disabled={isSaved}
                      className="w-14 h-16 md:w-16 md:h-20 bg-[#0B0B0B] border-2 border-white/10 focus:border-[#B30000] rounded text-center text-3xl font-black text-white focus:outline-none disabled:opacity-50 transition-colors"
                      placeholder="-"
                    />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 w-1/4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white shadow-lg" style={{ backgroundColor: fixture.awayColor }}>{fixture.awayInitial}</div>
                    <span className="font-bold text-sm text-center truncate w-full">{fixture.away}</span>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3 mb-6 text-center">
                  <span className="text-xs text-gray-400 font-medium">
                    AI Insight: <span className="text-[#FFD700] font-bold">52% probability</span> of home win
                  </span>
                </div>
                
                {isSaved ? (
                  <button 
                    onClick={() => setPredictions({...predictions, [fixture.id]: { ...predictions[fixture.id], saved: false }})}
                    className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-sm py-3 rounded transition-colors"
                  >
                    Edit Prediction
                  </button>
                ) : (
                  <button 
                    onClick={() => handlePredict(fixture.id)}
                    disabled={hScore === "" || aScore === ""}
                    className="w-full bg-[#B30000] hover:bg-red-800 disabled:bg-gray-800 disabled:text-gray-500 text-white font-black uppercase tracking-wider text-sm py-3 rounded transition-colors"
                  >
                    {isLoggedIn ? "Submit Prediction" : "Log In to Predict"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {!isLoggedIn ? (
            <div className="bg-[#1B1B1B] border border-white/10 rounded-xl p-8 text-center max-w-xl mx-auto mt-12">
              <div className="w-16 h-16 bg-[#B30000]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#B30000] text-2xl font-black">?</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest mb-2">Login Required</h2>
              <p className="text-gray-400 mb-6">You need an account to view and make predictions.</p>
              <button 
                onClick={openLoginModal}
                className="bg-[#B30000] hover:bg-red-800 text-white font-bold uppercase tracking-wider px-8 py-3 rounded transition-colors"
              >
                Log In / Sign Up
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mock past predictions */}
              <div className="bg-[#1B1B1B] border border-white/5 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-1.5 h-12 bg-green-500 rounded-full"></div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Premier League • Yesterday</span>
                    <div className="flex items-center gap-2 font-bold text-sm md:text-base">
                      <span>Arsenal</span> <span className="text-gray-600">vs</span> <span>Chelsea</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full md:w-auto bg-[#0B0B0B] p-3 rounded-lg border border-white/5">
                  <div className="text-center">
                    <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Predicted</span>
                    <span className="font-black text-lg">2 - 1</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Actual</span>
                    <span className="font-black text-lg text-white">2 - 1</span>
                  </div>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-2 rounded font-black uppercase tracking-wider text-xs w-full md:w-auto text-center">
                  EXACT! +10 pts
                </div>
              </div>

              <div className="bg-[#1B1B1B] border border-white/5 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-1.5 h-12 bg-yellow-500 rounded-full"></div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Premier League • Sat</span>
                    <div className="flex items-center gap-2 font-bold text-sm md:text-base">
                      <span>Man City</span> <span className="text-gray-600">vs</span> <span>Liverpool</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full md:w-auto bg-[#0B0B0B] p-3 rounded-lg border border-white/5">
                  <div className="text-center">
                    <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Predicted</span>
                    <span className="font-black text-lg">2 - 0</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Actual</span>
                    <span className="font-black text-lg text-white">3 - 1</span>
                  </div>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded font-black uppercase tracking-wider text-xs w-full md:w-auto text-center">
                  Correct Result +5 pts
                </div>
              </div>

              <div className="bg-[#1B1B1B] border border-white/5 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-1.5 h-12 bg-red-500 rounded-full"></div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Ligue 1 • Fri</span>
                    <div className="flex items-center gap-2 font-bold text-sm md:text-base">
                      <span>PSG</span> <span className="text-gray-600">vs</span> <span>Monaco</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full md:w-auto bg-[#0B0B0B] p-3 rounded-lg border border-white/5">
                  <div className="text-center">
                    <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Predicted</span>
                    <span className="font-black text-lg">2 - 1</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Actual</span>
                    <span className="font-black text-lg text-white">0 - 3</span>
                  </div>
                </div>
                
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded font-black uppercase tracking-wider text-xs w-full md:w-auto text-center">
                  Missed -0 pts
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
