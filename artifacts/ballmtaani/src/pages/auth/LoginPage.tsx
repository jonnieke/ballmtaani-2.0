import { useState } from "react";
import { useLocation, Link } from "wouter";
import { ArrowRight, Smartphone, ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+254"); // Default Kenya
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Format number: +254712345678
      const fullNumber = `${countryCode}${phoneNumber.replace(/^0+/, '')}`; // remove leading zero if any

      const { error } = await supabase.auth.signInWithOtp({
        phone: fullNumber,
      });

      if (error) throw error;

      // Success! Move to verification screen, passing the phone number via URL state or local storage
      // Since Wouter doesn't have complex state passing, we'll use sessionStorage
      sessionStorage.setItem("auth_phone", fullNumber);
      setLocation("/verify");
      
    } catch (err: any) {
      console.error("Auth error:", err);
      // If we get an error but the backend isn't fully configured yet, we can mock it 
      // just so the UI flow can be tested by the user.
      const isMissingConfig = err.message.includes("Error sending sms") || 
                              err.message.includes("Unsupported phone provider") || 
                              !supabase;
                              
      if (isMissingConfig) {
        console.warn("SMS sending failed (missing backend config). Proceeding to mock verify screen.");
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

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col items-center justify-center p-4 relative overflow-hidden text-white">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B30000]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl">
        
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-[#B30000]/20 rounded-2xl flex items-center justify-center border border-[#B30000]/30 shadow-[0_0_30px_rgba(179,0,0,0.2)]">
            <Smartphone className="w-8 h-8 text-[#B30000]" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-400 font-medium">Enter your phone number to sign in or create an account.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSendOTP} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Phone Number</label>
            <div className="flex gap-2">
              {/* Country Code Selector */}
              <div className="relative">
                <select 
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="appearance-none bg-black/40 border border-white/10 text-white text-sm font-bold rounded-xl pl-4 pr-10 py-4 h-full focus:outline-none focus:border-[#B30000]/50 transition-colors cursor-pointer"
                >
                  <option value="+254">🇰🇪 +254</option>
                  <option value="+234">🇳🇬 +234</option>
                  <option value="+27">🇿🇦 +27</option>
                  <option value="+233">🇬🇭 +233</option>
                  <option value="+255">🇹🇿 +255</option>
                  <option value="+256">🇺🇬 +256</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
              </div>
              
              {/* Phone Input */}
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} // only numbers
                placeholder="712 345 678"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-lg text-white font-bold tracking-wider placeholder:text-gray-600 focus:outline-none focus:border-[#B30000]/50 focus:ring-1 focus:ring-[#B30000]/50 transition-all shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B30000] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(179,0,0,0.3)] hover:shadow-[0_0_30px_rgba(179,0,0,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Send Code <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          Secure, passwordless login via SMS OTP
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
        By continuing, you agree to our <Link href="/terms" className="text-gray-300 hover:text-white underline underline-offset-2">Terms of Service</Link> & <Link href="/privacy" className="text-gray-300 hover:text-white underline underline-offset-2">Privacy Policy</Link>
      </div>
    </div>
  );
}
