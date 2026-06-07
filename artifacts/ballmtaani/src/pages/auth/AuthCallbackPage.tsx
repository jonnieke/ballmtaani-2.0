/**
 * /auth/callback
 *
 * Supabase redirects here after Google OAuth.
 * Supabase JS SDK automatically exchanges the code for a session.
 * We just wait and redirect to home.
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../../lib/supabase";

export default function AuthCallbackPage() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error in URL params first
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error_description") || params.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError.replace(/\+/g, " ")));
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        const returnUrl = sessionStorage.getItem("auth_return_url") || "/";
        sessionStorage.removeItem("auth_return_url");
        setLocation(returnUrl);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const returnUrl = sessionStorage.getItem("auth_return_url") || "/";
        sessionStorage.removeItem("auth_return_url");
        setLocation(returnUrl);
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-white font-black uppercase tracking-widest mb-3">Sign-in failed</h2>
          <p className="text-white/40 text-sm mb-6">{error}</p>
          <button
            onClick={() => setLocation("/login")}
            className="bg-green-600 text-white font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-green-500 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-sm font-bold uppercase tracking-widest">Signing you in...</p>
      </div>
    </div>
  );
}
