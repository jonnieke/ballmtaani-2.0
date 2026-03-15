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
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem("mtaani_coins");
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem("mtaani_coins", coins.toString());
  }, [coins]);

  useEffect(() => {
    // Check local storage for mock session first
    const mockSession = localStorage.getItem("mock_auth_session");
    if (mockSession) {
       try {
         const sessionData = JSON.parse(mockSession);
         setUser(sessionData.user);
         setIsLoggedIn(true);
       } catch (e) {}
    }

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
    // Apply streak multiplier (1.0x + 0.1x per day streak)
    const multiplier = 1 + (streak * 0.1);
    const finalAmount = Math.floor(amount * multiplier);

    setCoins(prev => prev + finalAmount);
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
