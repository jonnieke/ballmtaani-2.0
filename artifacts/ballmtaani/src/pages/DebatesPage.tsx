import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DEBATES } from "../data/mockData";
import { MessageSquarePlus, Check } from "lucide-react";

export default function DebatesPage() {
  const { isLoggedIn, openLoginModal } = useAuth();
  
  // Track voted states: debateId -> 'left' | 'right'
  const [votes, setVotes] = useState<Record<string, 'left' | 'right'>>({});
  
  // Track new debate input
  const [newDebate, setNewDebate] = useState("");

  const handleVote = (debateId: string, side: 'left' | 'right') => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    
    setVotes(prev => ({
      ...prev,
      [debateId]: side
    }));
  };

  const handleStartDebate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    // Mock submit
    setNewDebate("");
    alert("Debate submitted for review!");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-2">
          FAN <span className="text-[#1E6FFF]">DEBATE</span> ZONE
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-wider">Vote. Argue. Settle It.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
        {DEBATES.map(debate => {
          const userVote = votes[debate.id];
          
          // Adjust percentages slightly if user voted to simulate live update
          const displayLeftPct = userVote === 'left' ? debate.leftVotes + 1 : debate.leftVotes;
          const displayRightPct = userVote === 'right' ? debate.rightVotes + 1 : debate.rightVotes;
          
          // Normalize to 100%
          const total = displayLeftPct + displayRightPct;
          const finalLeft = Math.round((displayLeftPct / total) * 100);
          const finalRight = 100 - finalLeft;

          return (
            <div key={debate.id} className="bg-[#1B1B1B] rounded-xl border border-white/5 p-6 shadow-xl relative overflow-hidden">
              <h2 className="text-xl font-black text-center mb-6">{debate.title}</h2>
              
              <div className="flex justify-between items-end mb-2 px-2">
                <span className={`font-bold text-sm sm:text-base ${userVote === 'left' ? 'text-white' : 'text-gray-300'}`}>
                  {debate.left}
                </span>
                <span className={`font-bold text-sm sm:text-base ${userVote === 'right' ? 'text-white' : 'text-gray-300'}`}>
                  {debate.right}
                </span>
              </div>
              
              {/* Vote Bars */}
              <div className="h-10 w-full bg-white/5 rounded-lg overflow-hidden flex relative mb-6 border border-white/10 shadow-inner">
                <div 
                  className={`h-full flex items-center px-3 transition-all duration-1000 ${userVote === 'left' ? 'bg-[#1E6FFF] shadow-[0_0_15px_rgba(30,111,255,0.5)]' : 'bg-[#1E6FFF]/80'}`} 
                  style={{ width: `${finalLeft}%` }}
                >
                  <span className="font-black text-white text-sm">{finalLeft}%</span>
                </div>
                <div 
                  className={`h-full flex items-center justify-end px-3 transition-all duration-1000 ${userVote === 'right' ? 'bg-[#B30000] shadow-[0_0_15px_rgba(179,0,0,0.5)]' : 'bg-[#B30000]/80'}`} 
                  style={{ width: `${finalRight}%` }}
                >
                  <span className="font-black text-white text-sm">{finalRight}%</span>
                </div>
                
                {/* Center marker */}
                <div className="absolute top-0 left-1/2 bottom-0 w-px bg-white/30 transform -translate-x-1/2"></div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => handleVote(debate.id, 'left')}
                  disabled={userVote !== undefined}
                  className={`flex-1 py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2
                    ${userVote === 'left' ? 'bg-[#1E6FFF] text-white' : 
                      userVote === 'right' ? 'bg-white/5 text-gray-500 opacity-50' : 
                      'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'}`}
                >
                  {userVote === 'left' ? <><Check className="w-4 h-4" /> Voted</> : "Vote Left"}
                </button>
                <button 
                  onClick={() => handleVote(debate.id, 'right')}
                  disabled={userVote !== undefined}
                  className={`flex-1 py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2
                    ${userVote === 'right' ? 'bg-[#B30000] text-white' : 
                      userVote === 'left' ? 'bg-white/5 text-gray-500 opacity-50' : 
                      'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'}`}
                >
                  {userVote === 'right' ? <><Check className="w-4 h-4" /> Voted</> : "Vote Right"}
                </button>
              </div>
              
              <div className="mt-6 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {parseInt(debate.totalVotes.replace(',', '')) + (userVote ? 1 : 0)} Total Votes
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Debate Form */}
      <div className="max-w-2xl mx-auto bg-[#1B1B1B] rounded-xl border border-white/5 p-6 shadow-xl">
        <h3 className="text-xl font-black uppercase tracking-widest mb-2 flex items-center gap-2">
          <MessageSquarePlus className="w-5 h-5 text-[#1E6FFF]" />
          Start a Debate
        </h3>
        <p className="text-gray-400 text-sm mb-6">Got a hot take? Drop it below and let the community decide.</p>
        
        <form onSubmit={handleStartDebate}>
          <textarea 
            value={newDebate}
            onChange={(e) => setNewDebate(e.target.value)}
            className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-[#1E6FFF] transition-colors resize-none mb-4"
            rows={3}
            placeholder="e.g. Is prime Yaya Touré better than prime Kevin De Bruyne?"
            required
          ></textarea>
          <button 
            type="submit"
            className="bg-[#1E6FFF] hover:bg-blue-700 text-white font-black uppercase tracking-widest px-6 py-3 rounded-lg transition-colors shadow-lg"
          >
            Submit for Review
          </button>
        </form>
      </div>
    </div>
  );
}
