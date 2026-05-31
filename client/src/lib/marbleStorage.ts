export type MarbleSource = 'free' | 'purchase' | 'pvp' | 'ai' | 'ads';

export interface MarbleBalances {
  freeMarbles: number;
  purchasedMarbles: number;
  pvpWinMarbles: number;
  aiWinMarbles: number;
  adsMarbles: number;
  totalMarbles: number;
}

const STORAGE_KEYS = {
  free: 'freeMarbles',
  purchase: 'purchasedMarbles',
  pvp: 'pvpWinMarbles',
  ai: 'aiWinMarbles',
  ads: 'adsMarbles',
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
      localStorage.setItem(STORAGE_KEYS.ads, '0');
      localStorage.setItem(STORAGE_KEYS.total, '150');
    } else {
      localStorage.setItem(STORAGE_KEYS.free, '150');
      const remaining = Math.max(0, existingTotal - 150);
      localStorage.setItem(STORAGE_KEYS.pvp, String(remaining));
      localStorage.setItem(STORAGE_KEYS.purchase, '0');
      localStorage.setItem(STORAGE_KEYS.ai, '0');
      localStorage.setItem(STORAGE_KEYS.ads, '0');
    }

    localStorage.setItem('marblesInitialized', 'true');
  }

  // Ensure ads key always exists
  if (!localStorage.getItem(STORAGE_KEYS.ads)) {
    localStorage.setItem(STORAGE_KEYS.ads, '0');
  }
}

export function getMarbleBalances(): MarbleBalances {
  return {
    freeMarbles: parseInt(localStorage.getItem(STORAGE_KEYS.free) || '0'),
    purchasedMarbles: parseInt(localStorage.getItem(STORAGE_KEYS.purchase) || '0'),
    pvpWinMarbles: parseInt(localStorage.getItem(STORAGE_KEYS.pvp) || '0'),
    aiWinMarbles: parseInt(localStorage.getItem(STORAGE_KEYS.ai) || '0'),
    adsMarbles: parseInt(localStorage.getItem(STORAGE_KEYS.ads) || '0'),
    totalMarbles: parseInt(localStorage.getItem(STORAGE_KEYS.total) || '0'),
  };
}

// Tournament eligibility: only PvP win marbles count
export function getEligibleMarbles(): number {
  return parseInt(localStorage.getItem(STORAGE_KEYS.pvp) || '0');
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
  window.dispatchEvent(new Event('marbleUpdate'));
}

// Add marbles bought with reward points
export function buyMarblesWithPoints(marblesAmount: number, pointsCost: number): boolean {
  const currentPoints = getRewardPoints();
  if (currentPoints < pointsCost) return false;

  localStorage.setItem(STORAGE_KEYS.points, String(currentPoints - pointsCost));

  // Add as free marbles (redeemed with points)
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.free) || '0');
  localStorage.setItem(STORAGE_KEYS.free, String(current + marblesAmount));
  const total = parseInt(localStorage.getItem(STORAGE_KEYS.total) || '0');
  localStorage.setItem(STORAGE_KEYS.total, String(total + marblesAmount));

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('marbleUpdate'));
  window.dispatchEvent(new Event('rewardPointsUpdate'));
  return true;
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

  if (remaining > 0 && balances.adsMarbles > 0) {
    const deduct = Math.min(remaining, balances.adsMarbles);
    localStorage.setItem(STORAGE_KEYS.ads, String(balances.adsMarbles - deduct));
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
  window.dispatchEvent(new Event('marbleUpdate'));
  return true;
}

export function loseMarbles(amount: number): boolean {
  if (amount <= 0) return true;

  const total = getTotalMarbles();
  if (amount > total) return false;

  let remaining = amount;
  const balances = getMarbleBalances();

  if (remaining > 0 && balances.freeMarbles > 0) {
    const deduct = Math.min(remaining, balances.freeMarbles);
    localStorage.setItem(STORAGE_KEYS.free, String(balances.freeMarbles - deduct));
    remaining -= deduct;
  }

  if (remaining > 0 && balances.adsMarbles > 0) {
    const deduct = Math.min(remaining, balances.adsMarbles);
    localStorage.setItem(STORAGE_KEYS.ads, String(balances.adsMarbles - deduct));
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

  localStorage.setItem(STORAGE_KEYS.total, String(total - amount));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('marbleUpdate'));
  return true;
}

export function addPoints(amount: number): void {
  if (amount <= 0) return;
  const current = getRewardPoints();
  localStorage.setItem(STORAGE_KEYS.points, String(current + amount));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('rewardPointsUpdate'));
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

// Tournament: only PvP wins count for eligibility
export function isTournamentEligible(): boolean {
  return getEligibleMarbles() >= 2500;
}

export function getMarblesNeededForTournament(): number {
  return Math.max(0, 2500 - getEligibleMarbles());
}
