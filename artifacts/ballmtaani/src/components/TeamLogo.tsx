import { useState } from "react";

interface TeamLogoProps {
  logo?: string;
  initial: string;
  color: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  shadow?: boolean;
}

const sizeMap: Record<string, string> = {
  xs: "w-6 h-6 text-[9px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl md:w-20 md:h-20",
  xl: "w-20 h-20 md:w-24 md:h-24 text-3xl md:text-4xl",
};

export default function TeamLogo({ logo, initial, color, size = "md", className = "", shadow = false }: TeamLogoProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !logo || imgError;

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20 shrink-0 ${shadow ? "shadow-[0_0_20px_rgba(255,255,255,0.15)]" : ""} ${className}`}
      style={{ backgroundColor: showFallback ? color : "white" }}
    >
      {!showFallback ? (
        <img
          src={logo}
          alt={initial}
          className="w-full h-full object-contain p-1.5"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-black text-white" style={{ fontSize: "inherit" }}>{initial}</span>
      )}
    </div>
  );
}
