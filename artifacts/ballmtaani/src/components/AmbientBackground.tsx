import { useTheme } from "../context/ThemeContext";

export function AmbientBackground() {
  const { atmosphere } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden opacity-40">
      {/* Primary Atmospheric Glow */}
      <div 
        className={`absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-all duration-[2000ms] ease-in-out
          ${atmosphere === 'gunners-city' ? 'bg-red-600/30' : 
            atmosphere === 'el-clasico' ? 'bg-blue-600/30' : 
            atmosphere === 'night-mtaani' ? 'bg-green-600/30' : 'bg-red-600/20'}`} 
      />
      
      {/* Secondary Atmospheric Glow */}
      <div 
        className={`absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-all duration-[2000ms] ease-in-out
          ${atmosphere === 'gunners-city' ? 'bg-blue-500/30' : 
            atmosphere === 'el-clasico' ? 'bg-white/20' : 
            atmosphere === 'night-mtaani' ? 'bg-yellow-500/30' : 'bg-blue-600/20'}`} 
      />

      {/* Center Soft Accent */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full blur-[150px] transition-all duration-[3000ms] ease-in-out
          ${atmosphere === 'gunners-city' ? 'bg-white/5' : 
            atmosphere === 'el-clasico' ? 'bg-blue-400/10' : 
            atmosphere === 'night-mtaani' ? 'bg-white/5' : 'bg-transparent'}`} 
      />
    </div>
  );
}
