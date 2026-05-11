import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface FlyingStatusPoint {
  id: number;
  amount: number;
  x: number;
  y: number;
}

export function CoinOverlay() {
  const [statusPoints, setStatusPoints] = useState<FlyingStatusPoint[]>([]);

  useEffect(() => {
    const handleCoinAdded = (e: CustomEvent<{ amount: number }>) => {
      const newPoint: FlyingStatusPoint = {
        id: Date.now() + Math.random(),
        amount: e.detail.amount,
        x: window.innerWidth / 2,
        y: window.innerHeight - 100,
      };

      setStatusPoints(prev => [...prev, newPoint]);

      setTimeout(() => {
        setStatusPoints(prev => prev.filter(c => c.id !== newPoint.id));
      }, 1500);
    };

    window.addEventListener('coinsAdded' as any, handleCoinAdded);
    return () => window.removeEventListener('coinsAdded' as any, handleCoinAdded);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {statusPoints.map(c => (
        <div
          key={c.id}
          className="absolute animate-coin-fly flex items-center justify-center gap-1 font-black text-[#FFD700] text-3xl drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]"
          style={{
            left: `${c.x}px`,
            top: `${c.y}px`
          }}
        >
          <div className="relative">
            <Sparkles className="w-8 h-8 text-[#FFD700]" />
            <div className="absolute inset-0 bg-[#FFD700] blur-md opacity-50 rounded-full animate-pulse" />
          </div>
          <span className="stroke-black stroke-2">+{c.amount}</span>
        </div>
      ))}
    </div>
  );
}
