import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { ArrowRight, Mail, Phone, ShieldCheck, Heart, Gift, Radio, Trophy, Users } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { CLUB_LOGOS } from "../../data/mockData";
import { useTheme } from "../../context/ThemeContext";
const ENABLE_MOCK_AUTH = import.meta.env.VITE_ENABLE_MOCK_AUTH === "true";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+254");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAtmosphere } = useTheme();
  const [favoriteClub, setFavoriteClub] = useState("");
  const [referralFrom, setReferralFrom] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralFrom(ref);
      sessionStorage.setItem('mtaani_referral', ref);
    }
  }, []);

  const handleClubSelect = (club: string) => {
    setFavoriteClub(club);
    if (club === "Arsenal" || club === "Man City") setAtmosphere("gunners-city");
    else if (club === "Real Madrid" || club === "Barcelona") setAtmosphere("el-clasico");
    else setAtmosphere("default");
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      if (favoriteClub) sessionStorage.setItem("mtaani_pending_club", favoriteClub);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.message || "Google sign-in failed. Try email below.");
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (authMethod === "email") {
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address");
        return;
      }
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        });
        if (error) throw error;
        if (favoriteClub) sessionStorage.setItem("mtaani_pending_club", favoriteClub);
        sessionStorage.setItem("auth_email", email);
        sessionStorage.removeItem("auth_phone");
        setLocation("/verify");
      } catch (err: any) {
        console.error("Auth error:", err);
        if (ENABLE_MOCK_AUTH) {
          sessionStorage.setItem("auth_email", email);
          sessionStorage.removeItem("auth_phone");
          setLocation("/verify");
          return;
        }
        setError(err.message || "Failed to send code. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Phone flow
    if (!phoneNumber) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      const fullNumber = `${countryCode}${phoneNumber.replace(/^0+/, '')}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: fullNumber });
      if (error) throw error;
      if (favoriteClub) sessionStorage.setItem("mtaani_pending_club", favoriteClub);
      sessionStorage.setItem("auth_phone", fullNumber);
      sessionStorage.removeItem("auth_email");
      setLocation("/verify");
    } catch (err: any) {
      console.error("Auth error:", err);
      const isMissingConfig = err.message.includes("Error sending sms") ||
                              err.message.includes("Unsupported phone provider") || !supabase;
      if (isMissingConfig && ENABLE_MOCK_AUTH) {
        const mockNumber = `${countryCode}${phoneNumber.replace(/^0+/, '')}`;
        sessionStorage.setItem("auth_phone", mockNumber);
        sessionStorage.removeItem("auth_email");
        setLocation("/verify");
        return;
      }
      setError(err.message || "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clubs = [
    "Arsenal", "Chelsea", "Man Utd", "Man City",
    "Liverpool", "Real Madrid", "Barcelona", "PSG",
    "Bayern Munich", "Juventus", "AC Milan", "Dortmund",
    "Gor Mahia", "AFC Leopards", "Simba SC", "Al Ahly",
    "Kaizer Chiefs", "Orlando Pirates", "Enyimba", "TP Mazembe",
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden lg:flex flex-col justify-between border-r border-white/10 bg-black/30 px-10 py-10">
          <div>
            <Link href="/" className="text-2xl font-black uppercase tracking-widest">
              Ball<span className="text-primary">Mtaani</span>
            </Link>
            {/* WC26 urgency */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/8 px-4 py-1.5">
              <Trophy className="h-3.5 w-3.5 text-[#FFD700]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">WC26 in {Math.ceil((new Date("2026-06-11").getTime() - Date.now()) / 86400000)} days</span>
            </div>
            <div className="mt-4">
              <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-tight">
                Call the match<br/>before the<br/><span className="text-primary">group chat does.</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-400">
                Phone login takes 30 seconds. Pick your club, make your WC26 calls, and come back after full time for your receipts.
              </p>
              {/* Social proof */}
              <div className="mt-5 flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {["#B30000","#1E6FFF","#FFD700","#22c55e","#9333ea"].map(c => (
                    <div key={c} className="h-6 w-6 rounded-full border-2 border-black" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-xs font-bold text-white/40">18,000+ fans already calling it</span>
              </div>
            </div>
          </div>

          <div>
            {/* Welcome bonus — everyone gets it */}
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#FFD700]/25 bg-[#FFD700]/8 px-4 py-3">
              <Gift className="h-5 w-5 shrink-0 text-[#FFD700]" />
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-[#FFD700]">500 MTC Welcome Bonus</div>
                <div className="text-[10px] text-white/40">Free on signup — start on the leaderboard right away</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Radio, label: "Live Pulse", sub: "Match by match" },
                { icon: Trophy, label: "Receipts", sub: "Earn MTC" },
                { icon: Users, label: "Fan Rooms", sub: "Your club" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                  <Icon className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">{label}</p>
                  <p className="text-[9px] text-white/35 font-semibold">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen flex-col px-4 py-5 sm:px-6 lg:px-12 lg:py-10">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Link href="/" className="text-lg font-black uppercase tracking-widest">
              Ball<span className="text-primary">Mtaani</span>
            </Link>
            <span className="rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#FFD700]">
              Kenya Pulse
            </span>
          </div>

          <div className="mb-5 lg:hidden">
            <h1 className="text-3xl font-black uppercase leading-none tracking-tight">Join Matchday</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Phone login, club rooms, match calls, and receipts in under a minute.
            </p>
          </div>

          <div className="w-full max-w-xl lg:my-auto lg:ml-auto">
            <div className="bg-[#111]/95 border border-white/10 p-5 shadow-2xl sm:p-7 lg:p-8">
              <div className="mb-6 hidden lg:block">
                <h2 className="text-3xl font-black uppercase tracking-widest">Join Matchday</h2>
                <p className="mt-2 text-sm text-gray-400">Use your phone, pick your side, and keep your receipts across matches.</p>
              </div>

              <div className="mb-5 flex items-center gap-2 bg-[#FFD700]/8 border border-[#FFD700]/25 px-4 py-3 rounded-lg">
                <Gift className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span className="text-[#FFD700] font-black text-[11px] uppercase tracking-widest">
                  {referralFrom ? "Referral + Welcome boost: 1,000 MTC" : "Welcome boost: 500 MTC on signup"}
                </span>
              </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 mb-5 text-sm text-center font-bold">
            {error}
          </div>
        )}

        {/* ── Google Sign-In (primary) ── */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-black uppercase tracking-widest py-4 rounded-xl transition-all hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50 shadow-lg mb-5"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">or use email / phone</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSendOTP} className="space-y-5">
          {/* Method tabs */}
          <div className="flex rounded-xl border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => { setAuthMethod("email"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                authMethod === "email" ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod("phone"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all border-l border-white/10 ${
                authMethod === "phone" ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Phone
            </button>
          </div>

          {authMethod === "email" ? (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-primary" /> Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                autoComplete="email"
                className="w-full bg-black/40 border border-white/10 px-4 py-4 text-lg text-white font-bold placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
              />
              <p className="text-[11px] text-gray-500 ml-1">We send a 6-digit code to your email. No password needed.</p>
            </div>
          ) : (
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-primary" /> Phone number
            </label>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="appearance-none bg-black/40 border border-white/10 text-white text-sm font-bold pl-4 pr-10 py-4 h-full focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                >
                  <option value="+254">KE +254</option>
                  <option value="+234">NG +234</option>
                  <option value="+27">ZA +27</option>
                  <option value="+233">GH +233</option>
                  <option value="+255">TZ +255</option>
                  <option value="+256">UG +256</option>
                  <option value="+1">US +1</option>
                  <option value="+44">UK +44</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">v</div>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="712 345 678"
                className="min-w-0 flex-1 bg-black/40 border border-white/10 px-4 py-4 text-lg text-white font-bold tracking-wider placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
              />
            </div>
          </div>
          )}

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1 flex items-center gap-1">
              <Heart className="w-3 h-3 text-primary animate-pulse" /> Pick Your Side
            </label>
            <p className="text-[11px] text-gray-500 -mt-1">This shapes your rooms, rivals, and matchday atmosphere. You can change it later.</p>
            <div className="grid max-h-[280px] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:max-h-80">
              {clubs.map(club => (
                <button
                  key={club}
                  type="button"
                  onClick={() => handleClubSelect(club)}
                  className={`p-2 border flex flex-col items-center gap-1.5 transition-all duration-300 ${
                    favoriteClub === club 
                      ? 'bg-primary/20 border-primary shadow-[0_0_15px_var(--theme-glow)] scale-105' 
                      : 'bg-black/40 border-white/5 hover:border-white/20 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                  }`}
                >
                  {CLUB_LOGOS[club] ? (
                    <img src={CLUB_LOGOS[club]} alt={club} className="w-8 h-8 object-contain drop-shadow-md" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-white">
                      {club.substring(0, 2)}
                    </div>
                  )}
                  <span className="text-[8px] font-black uppercase text-center leading-tight truncate w-full text-gray-300">{club}</span>
                </button>
              ))}
            </div>
          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-4 transition-all shadow-[0_0_20px_rgba(179,0,0,0.3)] hover:shadow-[0_0_30px_rgba(179,0,0,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {authMethod === "email" ? "Send Code to Email" : "Send SMS Code"} <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          Secure phone login. We only use this to protect your account.
        </div>

              <div className="mt-5 text-center text-xs leading-relaxed text-gray-500">
                By continuing, you agree to our <a href="/terms" className="text-gray-300 hover:text-white underline underline-offset-2">Terms of Service</a> & <a href="/privacy" className="text-gray-300 hover:text-white underline underline-offset-2">Privacy Policy</a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
