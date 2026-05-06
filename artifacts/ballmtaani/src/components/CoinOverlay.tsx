import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';

interface FlyingCoin {
  id: number;
  amount: number;
  x: number;
  y: number;
}

export function CoinOverlay() {
  const [coins, setCoins] = useState<FlyingCoin[]>([]);

  useEffect(() => {
    const handleCoinAdded = (e: CustomEvent<{ amount: number }>) => {
      // Default origins near bottom center for generic interactions, 
      // but ideally we'd pass mouse coordinates via the event
      const newCoin: FlyingCoin = {
        id: Date.now() + Math.random(),
        amount: e.detail.amount,
        x: window.innerWidth / 2,     // Start horizontal center
        y: window.innerHeight - 100,  // Start lower on the screen
      };

      setCoins(prev => [...prev, newCoin]);

      // Remove after animation completes (1.5s)
      setTimeout(() => {
        setCoins(prev => prev.filter(c => c.id !== newCoin.id));
      }, 1500);
    };

    window.addEventListener('coinsAdded' as any, handleCoinAdded);
    return () => window.removeEventListener('coinsAdded' as any, handleCoinAdded);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {coins.map(c => (
        <div
          key={c.id}
          className="absolute animate-coin-fly flex items-center justify-center gap-1 font-black text-[#FFD700] text-3xl drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]"
          style={{
            left: `${c.x}px`,
            top: `${c.y}px`
          }}
        >
          <div className="relative">
            <Coins className="w-8 h-8 fill-[#FFD700] border-[#FFD700]" />
            <div className="absolute inset-0 bg-[#FFD700] blur-md opacity-50 rounded-full animate-pulse" />
          </div>
          <span className="stroke-black stroke-2">+{c.amount}</span>
        </div>
      ))}
    </div>
  );
}
