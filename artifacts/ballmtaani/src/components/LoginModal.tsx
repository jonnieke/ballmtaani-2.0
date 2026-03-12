import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X } from "lucide-react";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login/signup logic
    login(mode === "signup" ? (name || "KamauFC") : "KamauFC");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1B1B1B] w-full max-w-md rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Accent border top */}
        <div className="h-1 w-full bg-[#B30000]"></div>
        
        <button 
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">
              {mode === "login" ? "Welcome Back" : "Join the Squad"}
            </h2>
            <p className="text-gray-400 text-sm">
              {mode === "login" ? "Log in to predict, debate, and banter." : "Create an account to start playing."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Username</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#B30000] transition-colors"
                  placeholder="e.g. KamauFC"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#B30000] transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#B30000] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#B30000] hover:bg-red-800 text-white font-black uppercase tracking-widest py-3.5 rounded-lg transition-colors mt-6"
            >
              {mode === "login" ? "Continue" : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {mode === "login" ? (
              <p>Don't have an account? <button onClick={() => setMode("signup")} className="text-white font-bold hover:text-[#B30000]">Sign Up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setMode("login")} className="text-white font-bold hover:text-[#B30000]">Log In</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
