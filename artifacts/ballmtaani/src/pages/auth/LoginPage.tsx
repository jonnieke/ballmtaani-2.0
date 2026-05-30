import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { ArrowRight, ShieldCheck, Heart, Gift, MessageCircle, Radio, Trophy, Users } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { CLUB_LOGOS } from "../../data/mockData";
import { useTheme } from "../../context/ThemeContext";
const ENABLE_MOCK_AUTH = import.meta.env.VITE_ENABLE_MOCK_AUTH === "true";

export default function LoginPage() {
  const [, setLocation] = useLocation();
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fullNumber = `${countryCode}${phoneNumber.replace(/^0+/, '')}`;

      const { error } = await supabase.auth.signInWithOtp({
        phone: fullNumber,
      });

      if (error) throw error;

      if (favoriteClub) {
        sessionStorage.setItem("mtaani_pending_club", favoriteClub);
      }
      sessionStorage.setItem("auth_phone", fullNumber);
      setLocation("/verify");
      
    } catch (err: any) {
      console.error("Auth error:", err);
      const isMissingConfig = err.message.includes("Error sending sms") || 
                              err.message.includes("Unsupported phone provider") || 
                              !supabase;
                              
      if (isMissingConfig && ENABLE_MOCK_AUTH) {
        const mockNumber = `${countryCode}${phoneNumber.replace(/^0+/, '')}`;
        sessionStorage.setItem("auth_phone", mockNumber);
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

        <form onSubmit={handleSendOTP} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1 flex items-center gap-1.5">
              <MessageCircle className="w-3 h-3 text-primary" /> Phone Login
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
                Send Matchday Code <ArrowRight className="w-5 h-5" />
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
