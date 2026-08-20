import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";
import GoogleSignInButton from "./GoogleSignInButton";

const HIDE_ON = ["/login", "/verify", "/auth/callback"];

export default function StickySignUpBanner() {
  const { isLoggedIn } = useAuth();
  const [location] = useLocation();

  if (isLoggedIn) return null;
  if (location === "/" || location === "/home") return null;
  if (HIDE_ON.some(p => location.startsWith(p))) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95 backdrop-blur-xl px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-white uppercase tracking-wider">The 2026/27 season starts here</p>
          <p className="text-[10px] text-white/40">Join free, choose your club and keep every receipt</p>
        </div>
        <GoogleSignInButton size="sm" label="Join Google" />
      </div>
    </div>
  );
}
