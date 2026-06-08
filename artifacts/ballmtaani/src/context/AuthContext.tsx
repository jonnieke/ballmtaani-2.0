import { useContext, createContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import { playCoinSound } from "../lib/audio";
import {
  CoinAction,
  COIN_REWARDS,
  canAwardCoins,
  getDailyActionCount,
  incrementDailyActionCount,
  markOneTimeActionDone,
} from "../lib/coins-config";
import { addCoinTransaction } from "../lib/coin-history";

export interface LoginStreakInfo {
  streak: number;
  coinsEarned: number;
  bonusEarned: number;
  isNewDay: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  authLoading: boolean;
  user: User | null;
  username: string;
  dbProfile: any | null;
  coins: number;
  updateCoins: (amount: number) => void;
  awardCoins: (action: CoinAction) => number;
  mockLogin: (phone: string) => LoginStreakInfo;
  logout: () => Promise<void>;
  pendingLoginStreak: LoginStreakInfo | null;
  clearPendingLoginStreak: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ENABLE_MOCK_AUTH = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_AUTH === "true";

function getLoginStreak(): { streak: number; lastLoginDate: string | null } {
  const lastLogin = localStorage.getItem("mtaani_last_login_date");
  const streak = parseInt(localStorage.getItem("mtaani_login_streak") || "0", 10);
  return { streak, lastLoginDate: lastLogin };
}

function processLoginStreak(): LoginStreakInfo {
  const today = new Date().toISOString().split('T')[0];
  const { streak: currentStreak, lastLoginDate } = getLoginStreak();

  // Already logged in today
  if (lastLoginDate === today) {
    return { streak: currentStreak, coinsEarned: 0, bonusEarned: 0, isNewDay: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Continue streak or start fresh
  const newStreak = lastLoginDate === yesterdayStr ? currentStreak + 1 : 1;

  localStorage.setItem("mtaani_login_streak", newStreak.toString());
  localStorage.setItem("mtaani_last_login_date", today);

  // Calculate coins earned
  const baseCoins = COIN_REWARDS.daily_login.amount; // 50
  let bonusCoins = 0;
  if (newStreak === 3) bonusCoins = COIN_REWARDS.login_streak_3.amount;
  else if (newStreak === 7) bonusCoins = COIN_REWARDS.login_streak_7.amount;
  else if (newStreak === 30) bonusCoins = COIN_REWARDS.login_streak_30.amount;

  return { streak: newStreak, coinsEarned: baseCoins, bonusEarned: bonusCoins, isNewDay: true };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (!ENABLE_MOCK_AUTH) return null;
    const mockSession = localStorage.getItem("mock_auth_session");
    if (mockSession) {
      try { return JSON.parse(mockSession).user; } catch { return null; }
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => ENABLE_MOCK_AUTH && localStorage.getItem("mock_auth_session") !== null);
  const [authLoading, setAuthLoading] = useState(!ENABLE_MOCK_AUTH);

  const [dbProfile, setDbProfile] = useState<any | null>(null);

  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem("mtaani_coins");
    if (saved !== null) {
      const val = parseInt(saved, 10);
      return isNaN(val) ? 0 : val;
    }
    return 0;
  });

  const [pendingLoginStreak, setPendingLoginStreak] = useState<LoginStreakInfo | null>(null);

  // Sync coins to Supabase when they change
  useEffect(() => {
    if (coins > 0) {
      localStorage.setItem("mtaani_coins", coins.toString());
    } else if (coins === 0 && !isLoggedIn) {
      localStorage.removeItem("mtaani_coins");
    }

    if (user && supabase && coins > 0) {
      // Debounce this in a real app, but fine for now
      supabase.from('profiles').update({ coins }).eq('id', user.id).then(({ error }) => {
        if (error) console.error("Failed to sync coins to Supabase:", error);
      });
    }
  }, [coins, isLoggedIn, user]);

  // Load profile from Supabase
  const loadProfile = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setDbProfile(data);
      // Sync local coins if DB has more (e.g. from another device)
      if (data.coins > coins) {
        setCoins(data.coins);
      }
    }
  };

  useEffect(() => {
    if (!ENABLE_MOCK_AUTH) {
      localStorage.removeItem("mock_auth_session");
    }

    if (!supabase) { setAuthLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthLoading(false);
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
        loadProfile(session.user.id);
        
        // Award daily login on Supabase session restore
        const streakInfo = processLoginStreak();
        if (streakInfo.isNewDay) {
          const total = streakInfo.coinsEarned + streakInfo.bonusEarned;
          if (total > 0) {
            setCoins(prev => prev + total);
            playCoinSound();
            window.dispatchEvent(new CustomEvent('coinsAdded', { detail: { amount: total } }));
            addCoinTransaction({ action: 'daily_login', label: 'Daily Login', emoji: 'Login', amount: streakInfo.coinsEarned });
            if (streakInfo.bonusEarned > 0) {
              addCoinTransaction({ action: 'login_streak', label: `${streakInfo.streak}-Day Streak Bonus`, emoji: 'Streak', amount: streakInfo.bonusEarned });
            }
          }
          setPendingLoginStreak(streakInfo);
          // Also sync streak to DB
          supabase.from('profiles').update({ streak: streakInfo.streak, last_login_date: new Date().toISOString().split('T')[0] }).eq('id', session.user.id);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
        loadProfile(session.user.id);
        // Award login coins on new sign-in (Google OAuth redirect flow)
        // getSession() handles page-reload case; this handles fresh sign-in
        if (event === "SIGNED_IN") {
          const streakInfo = processLoginStreak();
          if (streakInfo.isNewDay) {
            const total = streakInfo.coinsEarned + streakInfo.bonusEarned;
            if (total > 0) {
              setCoins(prev => prev + total);
              playCoinSound();
              window.dispatchEvent(new CustomEvent('coinsAdded', { detail: { amount: total } }));
              addCoinTransaction({ action: 'daily_login', label: 'Daily Login', emoji: 'Login', amount: streakInfo.coinsEarned });
              if (streakInfo.bonusEarned > 0) {
                addCoinTransaction({ action: 'login_streak', label: `${streakInfo.streak}-Day Streak Bonus`, emoji: 'Streak', amount: streakInfo.bonusEarned });
              }
            }
            setPendingLoginStreak(streakInfo);
            supabase.from('profiles').update({ streak: streakInfo.streak, last_login_date: new Date().toISOString().split('T')[0] }).eq('id', session.user.id);
          }
        }
      } else {
        const hasMock = ENABLE_MOCK_AUTH ? localStorage.getItem("mock_auth_session") : null;
        if (!hasMock) { setUser(null); setIsLoggedIn(false); setDbProfile(null); }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const mockLogin = (phone: string): LoginStreakInfo => {
    if (!ENABLE_MOCK_AUTH) {
      return { streak: 0, coinsEarned: 0, bonusEarned: 0, isNewDay: false };
    }

    const mockUser = {
      phone,
      id: '00000000-0000-0000-0000-000000000000',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as unknown as User;

    setUser(mockUser);
    setIsLoggedIn(true);
    localStorage.setItem("mock_auth_session", JSON.stringify({ user: mockUser }));

    // Process daily login streak
    const streakInfo = processLoginStreak();
    if (streakInfo.isNewDay) {
      const total = streakInfo.coinsEarned + streakInfo.bonusEarned;
      if (total > 0) {
        setCoins(prev => prev + total);
        playCoinSound();
        window.dispatchEvent(new CustomEvent('coinsAdded', { detail: { amount: total } }));
        addCoinTransaction({ action: 'daily_login', label: 'Daily Login', emoji: 'Login', amount: streakInfo.coinsEarned });
        if (streakInfo.bonusEarned > 0) {
          addCoinTransaction({ action: `login_streak_${streakInfo.streak}`, label: `${streakInfo.streak}-Day Streak Bonus`, emoji: 'Streak', amount: streakInfo.bonusEarned });
        }
      }
      setPendingLoginStreak(streakInfo);
    }

    // Check referral
    const ref = sessionStorage.getItem("mtaani_referral");
    if (ref && ref !== (mockUser.phone || '')) {
      // Award referral bonus to the new user (invitee)
      setCoins(prev => prev + 500);
      addCoinTransaction({ action: 'invite_redeemed', label: 'Joined via Invite', emoji: 'Invite', amount: 500 });
      sessionStorage.removeItem("mtaani_referral");
    }

    return streakInfo;
  };

  const updateCoins = (amount: number) => {
    if (isNaN(amount)) return;
    setCoins(prev => {
      const next = prev + amount;
      return isNaN(next) ? prev : next;
    });
    if (amount > 0) {
      playCoinSound();
      window.dispatchEvent(new CustomEvent('coinsAdded', { detail: { amount } }));
    }
  };

  /**
   * Award MTC status points for a specific engagement action.
   * Returns the amount actually awarded (0 if blocked by limits).
   */
  const awardCoins = (action: CoinAction): number => {
    const check = canAwardCoins(action);
    if (!check.allowed) return 0;

    const reward = COIN_REWARDS[action];
    incrementDailyActionCount(action);
    if (reward.oneTime) markOneTimeActionDone(action);

    setCoins(prev => prev + check.amount);
    playCoinSound();
    window.dispatchEvent(new CustomEvent('coinsAdded', { detail: { amount: check.amount } }));
    addCoinTransaction({
      action,
      label: reward.label,
      emoji: reward.emoji,
      amount: check.amount,
    });

    return check.amount;
  };

  const clearPendingLoginStreak = () => setPendingLoginStreak(null);

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem("mock_auth_session");
    setUser(null);
    setIsLoggedIn(false);
    setCoins(0);
  };

  const displayUsername =
    dbProfile?.username ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.username ||
    user?.phone ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        authLoading,
        user,
        username: displayUsername,
        dbProfile,
        coins,
        updateCoins,
        awardCoins,
        mockLogin,
        logout,
        pendingLoginStreak,
        clearPendingLoginStreak,
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
