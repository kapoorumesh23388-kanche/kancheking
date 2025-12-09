export type MarbleSource = 'free' | 'purchase' | 'pvp' | 'ai';

export interface MarbleBalances {
  freeMarbles: number;
  purchasedMarbles: number;
  pvpWinMarbles: number;
  aiWinMarbles: number;
  totalMarbles: number;
}

const STORAGE_KEYS = {
  free: 'freeMarbles',
  purchase: 'purchasedMarbles',
  pvp: 'pvpWinMarbles',
  ai: 'aiWinMarbles',
  total: 'playerMarbles',
  points: 'playerRewardPoints',
  gamesPlayed: 'gamesPlayed',
  gamesWon: 'gamesWon',
};

export function initializeMarbles(): void {
  const isInitialized = localStorage.getItem('marblesInitialized');
  
  if (!isInitialized) {
    const existingTotal = parseInt(localStorage.getItem(STORAGE_KEYS.total) || '0');
    
    if (existingTotal === 0) {
      localStorage.setItem(STORAGE_KEYS.free, '150');
      localStorage.setItem(STORAGE_KEYS.purchase, '0');
      localStorage.setItem(STORAGE_KEYS.pvp, '0');
      localStorage.setItem(STORAGE_KEYS.ai, '0');
      localStorage.setItem(STORAGE_KEYS.total, '150');
    } else {
      localStorage.setItem(STORAGE_KEYS.free, '150');
      const remaining = Math.max(0, existingTotal - 150);
      localStorage.setItem(STORAGE_KEYS.pvp, String(remaining));
      localStorage.setItem(STORAGE_KEYS.purchase, '0');
      localStorage.setItem(STORAGE_KEYS.ai, '0');
    }
    
    localStorage.setItem('marblesInitialized', 'true');
  }
}

export function getMarbleBalances(): MarbleBalances {
  return {
    freeMarbles: parseInt(localStorage.getItem(STORAGE_KEYS.free) || '0'),
    purchasedMarbles: parseInt(localStorage.getItem(STORAGE_KEYS.purchase) || '0'),
    pvpWinMarbles: parseInt(localStorage.getItem(STORAGE_KEYS.pvp) || '0'),
    aiWinMarbles: parseInt(localStorage.getItem(STORAGE_KEYS.ai) || '0'),
    totalMarbles: parseInt(localStorage.getItem(STORAGE_KEYS.total) || '0'),
  };
}

export function getEligibleMarbles(): number {
  const balances = getMarbleBalances();
  return balances.purchasedMarbles + balances.pvpWinMarbles;
}

export function getTotalMarbles(): number {
  return parseInt(localStorage.getItem(STORAGE_KEYS.total) || '0');
}

export function getRewardPoints(): number {
  return parseInt(localStorage.getItem(STORAGE_KEYS.points) || '0');
}

export function addMarbles(source: MarbleSource, amount: number): void {
  if (amount <= 0) return;
  
  const key = STORAGE_KEYS[source];
  const current = parseInt(localStorage.getItem(key) || '0');
  localStorage.setItem(key, String(current + amount));
  
  const total = parseInt(localStorage.getItem(STORAGE_KEYS.total) || '0');
  localStorage.setItem(STORAGE_KEYS.total, String(total + amount));
  
  window.dispatchEvent(new Event('storage'));
}

export function spendMarbles(amount: number): boolean {
  const total = getTotalMarbles();
  if (amount > total) return false;
  
  let remaining = amount;
  const balances = getMarbleBalances();
  
  if (balances.pvpWinMarbles > 0) {
    const deduct = Math.min(remaining, balances.pvpWinMarbles);
    localStorage.setItem(STORAGE_KEYS.pvp, String(balances.pvpWinMarbles - deduct));
    remaining -= deduct;
  }
  
  if (remaining > 0 && balances.purchasedMarbles > 0) {
    const deduct = Math.min(remaining, balances.purchasedMarbles);
    localStorage.setItem(STORAGE_KEYS.purchase, String(balances.purchasedMarbles - deduct));
    remaining -= deduct;
  }
  
  if (remaining > 0 && balances.aiWinMarbles > 0) {
    const deduct = Math.min(remaining, balances.aiWinMarbles);
    localStorage.setItem(STORAGE_KEYS.ai, String(balances.aiWinMarbles - deduct));
    remaining -= deduct;
  }
  
  if (remaining > 0 && balances.freeMarbles > 0) {
    const deduct = Math.min(remaining, balances.freeMarbles);
    localStorage.setItem(STORAGE_KEYS.free, String(balances.freeMarbles - deduct));
    remaining -= deduct;
  }
  
  localStorage.setItem(STORAGE_KEYS.total, String(total - amount));
  
  window.dispatchEvent(new Event('storage'));
  return true;
}

export function loseMarbles(amount: number): boolean {
  if (amount <= 0) return true;
  
  const total = getTotalMarbles();
  if (amount > total) return false;
  
  let remaining = amount;
  const balances = getMarbleBalances();
  
  // Deduct in priority order: free -> ai -> pvp -> purchased
  if (remaining > 0 && balances.freeMarbles > 0) {
    const deduct = Math.min(remaining, balances.freeMarbles);
    localStorage.setItem(STORAGE_KEYS.free, String(balances.freeMarbles - deduct));
    remaining -= deduct;
  }
  
  if (remaining > 0 && balances.aiWinMarbles > 0) {
    const deduct = Math.min(remaining, balances.aiWinMarbles);
    localStorage.setItem(STORAGE_KEYS.ai, String(balances.aiWinMarbles - deduct));
    remaining -= deduct;
  }
  
  if (remaining > 0 && balances.pvpWinMarbles > 0) {
    const deduct = Math.min(remaining, balances.pvpWinMarbles);
    localStorage.setItem(STORAGE_KEYS.pvp, String(balances.pvpWinMarbles - deduct));
    remaining -= deduct;
  }
  
  if (remaining > 0 && balances.purchasedMarbles > 0) {
    const deduct = Math.min(remaining, balances.purchasedMarbles);
    localStorage.setItem(STORAGE_KEYS.purchase, String(balances.purchasedMarbles - deduct));
    remaining -= deduct;
  }
  
  localStorage.setItem(STORAGE_KEYS.total, String(total - amount));
  
  window.dispatchEvent(new Event('storage'));
  return true;
}

export function addPoints(amount: number): void {
  if (amount <= 0) return;
  const current = getRewardPoints();
  localStorage.setItem(STORAGE_KEYS.points, String(current + amount));
  window.dispatchEvent(new Event('storage'));
}

export function recordGameResult(won: boolean): void {
  const played = parseInt(localStorage.getItem(STORAGE_KEYS.gamesPlayed) || '0');
  localStorage.setItem(STORAGE_KEYS.gamesPlayed, String(played + 1));
  
  if (won) {
    const wins = parseInt(localStorage.getItem(STORAGE_KEYS.gamesWon) || '0');
    localStorage.setItem(STORAGE_KEYS.gamesWon, String(wins + 1));
  }
  
  window.dispatchEvent(new Event('storage'));
}

export function isTournamentEligible(): boolean {
  return getEligibleMarbles() >= 2500;
}

export function getMarblesNeededForTournament(): number {
  return Math.max(0, 2500 - getEligibleMarbles());
}
