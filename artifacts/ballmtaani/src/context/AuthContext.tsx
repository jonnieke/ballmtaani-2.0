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
  user: User | null;
  username: string;
  coins: number;
  updateCoins: (amount: number) => void;
  awardCoins: (action: CoinAction) => number;
  mockLogin: (phone: string) => LoginStreakInfo;
  logout: () => Promise<void>;
  pendingLoginStreak: LoginStreakInfo | null;
  clearPendingLoginStreak: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    const mockSession = localStorage.getItem("mock_auth_session");
    if (mockSession) {
      try { return JSON.parse(mockSession).user; } catch { return null; }
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    localStorage.getItem("mock_auth_session") !== null
  );

  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem("mtaani_coins");
    if (saved !== null) {
      const val = parseInt(saved, 10);
      return isNaN(val) ? 0 : val;
    }
    return 0;
  });

  const [pendingLoginStreak, setPendingLoginStreak] = useState<LoginStreakInfo | null>(null);

  useEffect(() => {
    if (coins > 0) {
      localStorage.setItem("mtaani_coins", coins.toString());
    } else if (coins === 0 && !isLoggedIn) {
      localStorage.removeItem("mtaani_coins");
    }
  }, [coins, isLoggedIn]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
        // Award daily login on Supabase session restore
        const streakInfo = processLoginStreak();
        if (streakInfo.isNewDay) {
          const total = streakInfo.coinsEarned + streakInfo.bonusEarned;
          if (total > 0) {
            setCoins(prev => prev + total);
            playCoinSound();
            window.dispatchEvent(new CustomEvent('coinsAdded', { detail: { amount: total } }));
            addCoinTransaction({ action: 'daily_login', label: 'Daily Login', emoji: '📅', amount: streakInfo.coinsEarned });
            if (streakInfo.bonusEarned > 0) {
              addCoinTransaction({ action: 'login_streak', label: `${streakInfo.streak}-Day Streak Bonus`, emoji: '🔥', amount: streakInfo.bonusEarned });
            }
          }
          setPendingLoginStreak(streakInfo);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
      } else {
        const hasMock = localStorage.getItem("mock_auth_session");
        if (!hasMock) { setUser(null); setIsLoggedIn(false); }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const mockLogin = (phone: string): LoginStreakInfo => {
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
        addCoinTransaction({ action: 'daily_login', label: 'Daily Login', emoji: '📅', amount: streakInfo.coinsEarned });
        if (streakInfo.bonusEarned > 0) {
          addCoinTransaction({ action: `login_streak_${streakInfo.streak}`, label: `${streakInfo.streak}-Day Streak Bonus`, emoji: '🔥', amount: streakInfo.bonusEarned });
        }
      }
      setPendingLoginStreak(streakInfo);
    }

    // Check referral
    const ref = sessionStorage.getItem("mtaani_referral");
    if (ref && ref !== (mockUser.phone || '')) {
      // Award referral bonus to the new user (invitee)
      setCoins(prev => prev + 500);
      addCoinTransaction({ action: 'invite_redeemed', label: 'Joined via Invite', emoji: '🤝', amount: 500 });
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
   * Award coins for a specific engagement action.
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
    user?.user_metadata?.username ||
    user?.phone ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        username: displayUsername,
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
