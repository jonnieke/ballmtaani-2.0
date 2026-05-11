/**
 * Central Coin Economy Config
 * BCLB-Compliant: Coins are earned through participation ONLY.
 * No cash-out path. Coins can only be spent on platform perks.
 */

export type CoinAction =
  | 'daily_login'
  | 'login_streak_3'
  | 'login_streak_7'
  | 'login_streak_30'
  | 'rapid_fire_vote'
  | 'rapid_fire_streak_5'
  | 'trivia_correct'
  | 'trivia_complete'
  | 'debate_vote'
  | 'banter_posted'
  | 'prediction_submitted'
  | 'prediction_correct'
  | 'invite_redeemed'
  | 'profile_complete'
  | 'grudge_match_won'
  | 'war_room_daily_complete';

export interface CoinReward {
  action: CoinAction;
  amount: number;
  label: string;
  emoji: string;
  /** Maximum times this can be awarded per day. null = unlimited (but usually one-time). */
  dailyLimit: number | null;
  /** If true, awarded at most once ever (not per day). */
  oneTime?: boolean;
}

export const COIN_REWARDS: Record<CoinAction, CoinReward> = {
  daily_login: {
    action: 'daily_login',
    amount: 50,
    label: 'Daily Login',
    emoji: 'Login',
    dailyLimit: 1,
  },
  login_streak_3: {
    action: 'login_streak_3',
    amount: 150,
    label: '3-Day Streak Bonus',
    emoji: 'Streak',
    dailyLimit: 1,
  },
  login_streak_7: {
    action: 'login_streak_7',
    amount: 500,
    label: '7-Day Streak Bonus',
    emoji: 'Boost',
    dailyLimit: 1,
  },
  login_streak_30: {
    action: 'login_streak_30',
    amount: 2000,
    label: '30-Day Streak Bonus',
    emoji: 'Legend',
    dailyLimit: 1,
  },
  rapid_fire_vote: {
    action: 'rapid_fire_vote',
    amount: 10,
    label: 'Rapid Fire Vote',
    emoji: 'Rapid',
    dailyLimit: 20,
  },
  rapid_fire_streak_5: {
    action: 'rapid_fire_streak_5',
    amount: 25,
    label: 'Rapid Fire 5-Streak',
    emoji: 'Streak',
    dailyLimit: 4,
  },
  trivia_correct: {
    action: 'trivia_correct',
    amount: 15,
    label: 'Trivia Correct Answer',
    emoji: 'Correct',
    dailyLimit: 50,
  },
  trivia_complete: {
    action: 'trivia_complete',
    amount: 50,
    label: 'Trivia Game Completed',
    emoji: 'Done',
    dailyLimit: 5,
  },
  debate_vote: {
    action: 'debate_vote',
    amount: 10,
    label: 'Debate Vote',
    emoji: 'Debate',
    dailyLimit: 5,
  },
  banter_posted: {
    action: 'banter_posted',
    amount: 20,
    label: 'Banter Posted',
    emoji: 'Banter',
    dailyLimit: 10,
  },
  prediction_submitted: {
    action: 'prediction_submitted',
    amount: 25,
    label: 'Call Submitted',
    emoji: 'Call',
    dailyLimit: 10,
  },
  prediction_correct: {
    action: 'prediction_correct',
    amount: 75,
    label: 'Correct Call',
    emoji: 'Receipt',
    dailyLimit: 10,
  },
  invite_redeemed: {
    action: 'invite_redeemed',
    amount: 500,
    label: 'Friend Joined via Invite',
    emoji: 'Invite',
    dailyLimit: null,
  },
  profile_complete: {
    action: 'profile_complete',
    amount: 100,
    label: 'Profile Completed',
    emoji: 'Profile',
    dailyLimit: 1,
    oneTime: true,
  },
  grudge_match_won: {
    action: 'grudge_match_won',
    amount: 200,
    label: 'Fan Duel Won',
    emoji: 'Duel',
    dailyLimit: 5,
  },
  war_room_daily_complete: {
    action: 'war_room_daily_complete',
    amount: 40,
    label: 'War Room Daily Complete',
    emoji: 'War',
    dailyLimit: 1,
  },
};

/**
 * Get how many times an action has been performed today.
 * Uses localStorage keys in the format: mtaani_action_count_{action}_{YYYY-MM-DD}
 */
export function getDailyActionCount(action: CoinAction): number {
  const today = new Date().toISOString().split('T')[0];
  const key = `mtaani_action_count_${action}_${today}`;
  return parseInt(localStorage.getItem(key) || '0', 10);
}

/**
 * Increment the daily count for an action. Returns the new count.
 */
export function incrementDailyActionCount(action: CoinAction): number {
  const today = new Date().toISOString().split('T')[0];
  const key = `mtaani_action_count_${action}_${today}`;
  const newCount = getDailyActionCount(action) + 1;
  localStorage.setItem(key, newCount.toString());
  return newCount;
}

/**
 * Check if a one-time action has already been awarded.
 */
export function isOneTimeActionDone(action: CoinAction): boolean {
  return localStorage.getItem(`mtaani_onetime_${action}`) === 'done';
}

/**
 * Mark a one-time action as done.
 */
export function markOneTimeActionDone(action: CoinAction): void {
  localStorage.setItem(`mtaani_onetime_${action}`, 'done');
}

/**
 * Try to award coins for an action. Returns the amount awarded (0 if blocked by limits).
 */
export function canAwardCoins(action: CoinAction): { allowed: boolean; amount: number; reason?: string } {
  const reward = COIN_REWARDS[action];
  if (!reward) return { allowed: false, amount: 0, reason: 'Unknown action' };

  if (reward.oneTime && isOneTimeActionDone(action)) {
    return { allowed: false, amount: 0, reason: 'Already awarded (one-time)' };
  }

  if (reward.dailyLimit !== null) {
    const count = getDailyActionCount(action);
    if (count >= reward.dailyLimit) {
      return { allowed: false, amount: 0, reason: `Daily limit of ${reward.dailyLimit} reached` };
    }
  }

  return { allowed: true, amount: reward.amount };
}
