import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeAtmosphere = "default" | "gunners-city" | "el-clasico" | "night-mtaani";

interface ThemeContextType {
  atmosphere: ThemeAtmosphere;
  setAtmosphere: (theme: ThemeAtmosphere) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [atmosphere, setAtmosphere] = useState<ThemeAtmosphere>("default");

  useEffect(() => {
    const root = document.documentElement;
    
    // Smooth transitions
    root.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";

    switch (atmosphere) {
      case "gunners-city":
        root.style.setProperty("--theme-primary", "0 100% 35%"); // Arsenal Red
        root.style.setProperty("--theme-secondary", "197 91% 65%"); // City Blue
        root.style.setProperty("--theme-glow", "rgba(179, 0, 0, 0.3)");
        break;
      case "el-clasico":
        root.style.setProperty("--theme-primary", "225 100% 25%"); // Barca Blue (Primary for contrast)
        root.style.setProperty("--theme-secondary", "0 0% 100%"); // Real Madrid White
        root.style.setProperty("--theme-glow", "rgba(30, 58, 138, 0.3)");
        break;
      case "night-mtaani":
        root.style.setProperty("--theme-primary", "142 72% 50%"); // Grass Green
        root.style.setProperty("--theme-secondary", "45 100% 55%"); // Golden Lights
        root.style.setProperty("--theme-glow", "rgba(34, 197, 94, 0.3)");
        break;
      default:
        // Reset to CSS defined defaults
        root.style.setProperty("--theme-primary", "var(--brand-red)");
        root.style.setProperty("--theme-secondary", "var(--brand-blue)");
        root.style.setProperty("--theme-glow", "rgba(179, 0, 0, 0.3)");
    }
  }, [atmosphere]);

  return (
    <ThemeContext.Provider value={{ atmosphere, setAtmosphere }}>
      <div className={`atmosphere-${atmosphere}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
