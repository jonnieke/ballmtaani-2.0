/**
 * Coin transaction history — persisted in localStorage.
 * Keeps last 50 transactions for the Wallet page.
 */

export interface CoinTransaction {
  id: string;
  action: string;
  label: string;
  emoji: string;
  amount: number;
  timestamp: number;
}

const HISTORY_KEY = 'mtaani_coin_history';
const MAX_HISTORY = 50;

export function getCoinHistory(): CoinTransaction[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CoinTransaction[];
  } catch {
    return [];
  }
}

export function addCoinTransaction(tx: Omit<CoinTransaction, 'id' | 'timestamp'>): void {
  const history = getCoinHistory();
  const newEntry: CoinTransaction = {
    ...tx,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  };

  const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Quota exceeded - clear and restart
    localStorage.removeItem(HISTORY_KEY);
  }
}

export function getTodayEarnings(): number {
  const history = getCoinHistory();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return history
    .filter(tx => tx.timestamp >= todayStart.getTime() && tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function getEarningsByCategory(): Record<string, number> {
  const history = getCoinHistory();
  const result: Record<string, number> = {};
  for (const tx of history) {
    if (tx.amount > 0) {
      result[tx.label] = (result[tx.label] || 0) + tx.amount;
    }
  }
  return result;
}
