import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "wouter";
import { ChevronLeft, Coins, Zap, ShieldCheck, Loader2, Info } from "lucide-react";

export default function StorePage() {
  const { isLoggedIn, coins, updateCoins } = useAuth();
  const [processingTier, setProcessingTier] = useState<number | null>(null);

  const coinTiers = [
    { id: 1, ksh: 10, coins: 1000, label: "Starter Pack", color: "from-[#1E6FFF] to-blue-500", popular: false },
    { id: 2, ksh: 50, coins: 7000, label: "Pro Baller", color: "from-[#B30000] to-red-600", popular: true },
    { id: 3, ksh: 100, coins: 20000, label: "Club Legend", color: "from-[#FFD700] to-[#FFA500]", popular: false },
  ];

  const handlePurchase = (tierId: number, coinAmount: number) => {
    setProcessingTier(tierId);
    // Simulate M-Pesa payment latency
    setTimeout(() => {
      updateCoins(coinAmount);
      setProcessingTier(null);
      alert(`Success! ${coinAmount.toLocaleString()} Mtaani Coins added to your wallet.`);
    }, 2000);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center p-4">
        <Coins className="w-16 h-16 text-[#FFD700] mb-4 opacity-50" />
        <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Login Required</h2>
        <p className="text-gray-400 mb-6 text-center">Log in to view the Mtaani Coin Market and purchase tokens.</p>
        <Link href="/login" className="bg-[#B30000] hover:bg-red-800 text-white font-bold uppercase tracking-wider px-8 py-3 rounded transition-colors">
          Log In / Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pb-20">
      {/* ── HEADER ── */}
      <div className="relative bg-[#111] border-b border-white/5 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1E6FFF]/10 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 relative z-10">
          <Link href="/" className="inline-flex items-center gap-1 text-gray-400 hover:text-white mb-6 font-bold uppercase text-[10px] tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                Coin Market
              </h1>
              <p className="text-gray-400 font-medium">Use Mtaani Coins ($MTC) to unlock Premium Fan Zones, Legend's Intel, and flash bets.</p>
            </div>
            
            <div className="bg-black/50 border border-[#FFD700]/30 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_30px_rgba(255,215,0,0.1)] flex items-center gap-6 shrink-0">
              <div className="w-16 h-16 bg-[#FFD700]/10 rounded-full flex items-center justify-center">
                <Coins className="w-8 h-8 text-[#FFD700]" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Your Balance</span>
                <span className="font-black text-4xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{coins.toLocaleString()}</span>
                <span className="text-[#FFD700] ml-1 font-bold">MTC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-2 mb-10 bg-white/5 border border-white/10 rounded-lg p-4 text-sm font-medium text-gray-300">
          <Info className="w-5 h-5 text-gray-400" />
          <span>Note: To maintain an active economy, all <strong className="text-white">Mtaani Coins expire globally at the end of every month.</strong> Spend them while they're hot!</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coinTiers.map((tier) => (
            <div 
              key={tier.id}
              className={`bg-[#111] rounded-3xl border ${tier.popular ? 'border-[#FFD700]/50 shadow-[0_0_40px_rgba(255,215,0,0.15)] scale-105 z-10' : 'border-white/5 shadow-xl'} relative overflow-hidden flex flex-col`}
            >
              {tier.popular && (
                <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-center py-1.5 font-black uppercase tracking-[0.2em] text-[10px]">
                  Most Popular
                </div>
              )}
              
              <div className={`p-8 ${tier.popular ? 'pt-10' : ''} flex flex-col items-center flex-1`}>
                <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-6 text-center">{tier.label}</h3>
                
                <div className="relative mb-8">
                  <div className={`absolute inset-0 bg-gradient-to-r ${tier.color} blur-2xl opacity-20`} />
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${tier.color} p-[2px] shadow-2xl`}>
                    <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                      <Coins className={`w-10 h-10 ${tier.popular ? 'text-[#FFD700]' : 'text-white'}`} />
                    </div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <span className="block text-4xl font-black text-white mb-2">{tier.coins.toLocaleString()} <span className="text-sm">Coins</span></span>
                  <span className="bg-white/5 px-4 py-1.5 rounded-full text-sm font-bold border border-white/5">Ksh {tier.ksh}</span>
                </div>

                <button
                  onClick={() => handlePurchase(tier.id, tier.coins)}
                  disabled={processingTier !== null}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all flex justify-center items-center gap-2 mt-auto ${
                    tier.popular 
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {processingTier === tier.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Zap className="w-4 h-4" /> Purchase</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-xs font-bold text-gray-500 flex flex-col items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-green-500/50" />
          <p>Secure payments via M-Pesa. Transactions verify instantly.</p>
        </div>
      </div>
    </div>
  );
}
