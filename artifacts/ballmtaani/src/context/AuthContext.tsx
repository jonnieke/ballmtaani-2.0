import { useContext, createContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import { playCoinSound } from "../lib/audio";


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
  const [user, setUser] = useState<User | null>(() => {
    const mockSession = localStorage.getItem("mock_auth_session");
    if (mockSession) {
      try {
        const sessionData = JSON.parse(mockSession);
        return sessionData.user;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("mock_auth_session") !== null;
  });
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem("mtaani_coins");
    const val = saved ? parseInt(saved, 10) : 0;
    const finalVal = isNaN(val) ? 0 : val;
    console.log(`[AuthContext] Coins initialized from storage: ${finalVal}`);
    return finalVal;
  });

  useEffect(() => {
    // Only save to localStorage if coins > 0 OR if explicitly changed by user
    // This prevents accidental 0-resets during the mount-sync phase
    if (coins > 0) {
      localStorage.setItem("mtaani_coins", coins.toString());
    }
  }, [coins]);

  useEffect(() => {
    // session is already restored synchronously in useState initializer

    if (!supabase) return; // No Supabase client - run in offline/mock mode

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
      } else {
        const hasMock = localStorage.getItem("mock_auth_session");
        if (!hasMock) {
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const mockLogin = (phone: string) => {
    // Used explicitly for development bypass when SMS isn't configured
    const mockUser = { phone, id: 'mock-user-id', app_metadata: {}, user_metadata: { streak: 3 }, aud: 'authenticated', created_at: new Date().toISOString() } as unknown as User;
    setUser(mockUser);
    setIsLoggedIn(true);
    localStorage.setItem("mock_auth_session", JSON.stringify({ user: mockUser }));
  };

  const streak = user?.user_metadata?.streak || 3;

  const updateCoins = (amount: number) => {
    if (isNaN(amount)) {
      console.warn("[AuthContext] updateCoins received NaN");
      return;
    }
    // Apply streak multiplier (1.0x + 0.1x per day streak)
    const validStreak = isNaN(streak) ? 0 : streak;
    const multiplier = 1 + (validStreak * 0.1);
    const finalAmount = Math.floor(amount * multiplier);

    if (isNaN(finalAmount)) {
      console.warn("[AuthContext] finalAmount calculated as NaN");
      return;
    }

    setCoins(prev => {
      const next = prev + finalAmount;
      console.log(`[AuthContext] Updating coins: ${prev} + ${finalAmount} = ${next}`);
      return isNaN(next) ? prev : next;
    });

    if (finalAmount > 0) {
      playCoinSound();
      window.dispatchEvent(new CustomEvent('coinsAdded', { detail: { amount: finalAmount } }));
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("mock_auth_session");
    setUser(null);
    setIsLoggedIn(false);
    console.log("[AuthContext] Resetting coins to 0 via logout");
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
