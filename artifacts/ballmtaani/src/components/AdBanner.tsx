import React from "react";

interface AdBannerProps {
  label?: string;
  type?: "horizontal" | "square" | "thin";
  className?: string;
}

export default function AdBanner({ label = "Featured Partner", type = "horizontal", className = "" }: AdBannerProps) {
  const baseStyles = "relative overflow-hidden group cursor-pointer transition-all duration-500 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md";
  
  const typeStyles = {
    horizontal: "w-full h-24 md:h-32",
    square: "w-full aspect-square",
    thin: "w-full h-12"
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]} ${className}`}>
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#B30000]/10 blur-[60px] rounded-full group-hover:bg-[#B30000]/20 transition-colors duration-700"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#1E6FFF]/10 blur-[60px] rounded-full group-hover:bg-[#1E6FFF]/20 transition-colors duration-700"></div>
      
      {/* Content wrapper */}
      <div className="relative h-full w-full flex flex-col items-center justify-center p-4">
        <div className="absolute top-2 left-4">
          <span className="text-[10px] font-black uppercase tracking-[3px] text-gray-500 group-hover:text-gray-400 transition-colors">
            {label}
          </span>
        </div>
        
        <div className="text-center flex flex-col items-center gap-1">
          <div className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent font-black uppercase tracking-tighter text-xl md:text-2xl group-hover:scale-105 transition-transform duration-500">
            Ad Placeholder
          </div>
          <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest border-t border-white/5 pt-1 mt-1">
            Premium Ad Space Integration
          </div>
        </div>
        
        {/* Animated border pulse */}
        <div className="absolute inset-0 border border-[#B30000]/0 group-hover:border-[#B30000]/20 rounded-xl transition-all duration-700"></div>
      </div>
    </div>
  );
}
