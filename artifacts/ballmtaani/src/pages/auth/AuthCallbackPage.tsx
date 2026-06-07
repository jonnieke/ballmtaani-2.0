/**
 * /auth/callback
 *
 * Supabase redirects here after Google OAuth.
 * Supabase JS SDK automatically exchanges the code for a session.
 * We just wait and redirect to home.
 */
import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "../../lib/supabase";

export default function AuthCallbackPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Supabase automatically handles the token exchange from the URL hash/code
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        const returnUrl = sessionStorage.getItem("auth_return_url") || "/home";
        sessionStorage.removeItem("auth_return_url");
        setLocation(returnUrl);
      }
    });

    // Fallback: if already signed in, redirect immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const returnUrl = sessionStorage.getItem("auth_return_url") || "/home";
        sessionStorage.removeItem("auth_return_url");
        setLocation(returnUrl);
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-sm font-bold uppercase tracking-widest">Signing you in...</p>
      </div>
    </div>
  );
}
