import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  username: string;
  coins: number;
  updateCoins: (amount: number) => void;
  mockLogin: (phone: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    if (!supabase) return; // No Supabase client - run in offline/mock mode

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mockLogin = (phone: string) => {
    // Used explicitly for development bypass when SMS isn't configured
    setUser({ phone, id: 'mock-user-id', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() } as unknown as User);
    setIsLoggedIn(true);
  };

  const updateCoins = (amount: number) => {
    setCoins(prev => prev + amount);
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsLoggedIn(false);
    setCoins(0);
  };

  // For phone auth, user.phone is the primary identifier if they haven't set a username
  const displayUsername = user?.user_metadata?.username || user?.phone || user?.email?.split("@")[0] || "";

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        username: displayUsername,
        coins,
        updateCoins,
        mockLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
