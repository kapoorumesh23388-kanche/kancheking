const REWARDS_KEY_PREFIX = "rewards_";
const POINTS_HISTORY_KEY = "pointsHistory";
const POINTS_REDEMPTION_KEY = "pointsRedemptionHistory";

interface DailyRewardsData {
  date: string;
  loginTime: number;
  playTimeMinutes: number;
  aiDefeats: number;
  loginRewardClaimed: boolean;
  hourlyRewardsClaimed: number;
  defeatsRewarded: number;
  lastPlaytimeCheck: number;
  dailyLoginBonusClaimed: boolean;
  tournamentWinsRewarded: number;
}

export interface PointsHistoryEntry {
  id: string;
  date: string;
  type: "daily_login" | "hourly_play" | "ai_defeat" | "tournament_win" | "leaderboard_bonus" | "pvp_win";
  points: number;
  description: string;
}

export interface RedemptionHistoryEntry {
  id: string;
  date: string;
  type: "marble_purchase";
  pointsSpent: number;
  marblesReceived: number;
  description: string;
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getDailyData(): DailyRewardsData {
  const today = getTodayDate();
  const stored = localStorage.getItem(`${REWARDS_KEY_PREFIX}${today}`);

  if (stored) {
    return JSON.parse(stored);
  }

  return {
    date: today,
    loginTime: Date.now(),
    playTimeMinutes: 0,
    aiDefeats: 0,
    loginRewardClaimed: false,
    hourlyRewardsClaimed: 0,
    defeatsRewarded: 0,
    lastPlaytimeCheck: Date.now(),
    dailyLoginBonusClaimed: false,
    tournamentWinsRewarded: 0,
  };
}

function saveDailyData(data: DailyRewardsData): void {
  localStorage.setItem(`${REWARDS_KEY_PREFIX}${data.date}`, JSON.stringify(data));
}

// --- Points History ---
export function getPointsHistory(): PointsHistoryEntry[] {
  const raw = localStorage.getItem(POINTS_HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addPointsHistoryEntry(entry: Omit<PointsHistoryEntry, "id">): void {
  const history = getPointsHistory();
  const newEntry: PointsHistoryEntry = { ...entry, id: `ph_${Date.now()}_${Math.random().toString(36).slice(2)}` };
  history.unshift(newEntry);
  // Keep last 200 entries
  const trimmed = history.slice(0, 200);
  localStorage.setItem(POINTS_HISTORY_KEY, JSON.stringify(trimmed));
}

// --- Redemption History ---
export function getRedemptionHistory(): RedemptionHistoryEntry[] {
  const raw = localStorage.getItem(POINTS_REDEMPTION_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addRedemptionHistoryEntry(entry: Omit<RedemptionHistoryEntry, "id">): void {
  const history = getRedemptionHistory();
  const newEntry: RedemptionHistoryEntry = { ...entry, id: `rh_${Date.now()}_${Math.random().toString(36).slice(2)}` };
  history.unshift(newEntry);
  const trimmed = history.slice(0, 200);
  localStorage.setItem(POINTS_REDEMPTION_KEY, JSON.stringify(trimmed));
}

// --- Reward claiming functions ---

export function initializeDailyRewards(): void {
  const data = getDailyData();
  if (!data.loginTime) {
    data.loginTime = Date.now();
  }
  saveDailyData(data);
}

export function updatePlaytime(): number {
  const data = getDailyData();
  const now = Date.now();
  const minutesSinceLastCheck = Math.floor((now - data.lastPlaytimeCheck) / 60000);

  if (minutesSinceLastCheck > 0) {
    data.playTimeMinutes += minutesSinceLastCheck;
    data.lastPlaytimeCheck = now;
    saveDailyData(data);
  }

  return data.playTimeMinutes;
}

export function recordAiDefeat(): void {
  const data = getDailyData();
  data.aiDefeats += 1;
  saveDailyData(data);
}

export function checkAndClaimDailyLoginBonus(): { claimed: boolean; points: number } {
  const data = getDailyData();

  if (data.dailyLoginBonusClaimed) {
    return { claimed: false, points: 0 };
  }

  // Daily login bonus: just for logging in today
  data.dailyLoginBonusClaimed = true;
  saveDailyData(data);

  const points = 100;
  const currentPoints = parseInt(localStorage.getItem("playerRewardPoints") || "0");
  localStorage.setItem("playerRewardPoints", (currentPoints + points).toString());

  addPointsHistoryEntry({
    date: new Date().toISOString(),
    type: "daily_login",
    points,
    description: "Daily Login Bonus",
  });

  window.dispatchEvent(new Event("rewardPointsUpdate"));
  return { claimed: true, points };
}

export function checkAndClaimLoginReward(): { claimed: boolean; points: number } {
  const data = getDailyData();

  if (data.loginRewardClaimed) {
    return { claimed: false, points: 0 };
  }

  if (data.playTimeMinutes >= 10) {
    data.loginRewardClaimed = true;
    saveDailyData(data);

    const points = 50;
    const currentPoints = parseInt(localStorage.getItem("playerRewardPoints") || "0");
    localStorage.setItem("playerRewardPoints", (currentPoints + points).toString());

    addPointsHistoryEntry({
      date: new Date().toISOString(),
      type: "hourly_play",
      points,
      description: "10-minute active play reward",
    });

    window.dispatchEvent(new Event("rewardPointsUpdate"));
    return { claimed: true, points };
  }

  return { claimed: false, points: 0 };
}

export function checkAndClaimHourlyRewards(): { claimed: boolean; points: number; hours: number } {
  const data = getDailyData();

  const eligibleHours = Math.floor(data.playTimeMinutes / 60);
  const unclaimedHours = eligibleHours - data.hourlyRewardsClaimed;

  if (unclaimedHours > 0) {
    data.hourlyRewardsClaimed = eligibleHours;
    saveDailyData(data);

    const pointsEarned = unclaimedHours * 50;
    const currentPoints = parseInt(localStorage.getItem("playerRewardPoints") || "0");
    localStorage.setItem("playerRewardPoints", (currentPoints + pointsEarned).toString());

    addPointsHistoryEntry({
      date: new Date().toISOString(),
      type: "hourly_play",
      points: pointsEarned,
      description: `${unclaimedHours} hour${unclaimedHours > 1 ? "s" : ""} of gameplay`,
    });

    window.dispatchEvent(new Event("rewardPointsUpdate"));
    return { claimed: true, points: pointsEarned, hours: unclaimedHours };
  }

  return { claimed: false, points: 0, hours: 0 };
}

export function checkAndClaimDefeatBonuses(): { claimed: boolean; points: number; defeats: number } {
  const data = getDailyData();

  const unclaimedDefeats = data.aiDefeats - data.defeatsRewarded;

  if (unclaimedDefeats > 0) {
    data.defeatsRewarded = data.aiDefeats;
    saveDailyData(data);

    const pointsEarned = unclaimedDefeats * 25;
    const currentPoints = parseInt(localStorage.getItem("playerRewardPoints") || "0");
    localStorage.setItem("playerRewardPoints", (currentPoints + pointsEarned).toString());

    addPointsHistoryEntry({
      date: new Date().toISOString(),
      type: "ai_defeat",
      points: pointsEarned,
      description: `Defeated AI ${unclaimedDefeats} time${unclaimedDefeats > 1 ? "s" : ""}`,
    });

    window.dispatchEvent(new Event("rewardPointsUpdate"));
    return { claimed: true, points: pointsEarned, defeats: unclaimedDefeats };
  }

  return { claimed: false, points: 0, defeats: 0 };
}

export function awardLeaderboardBonus(): void {
  const today = getTodayDate();
  const lastBonusDate = localStorage.getItem("leaderboardBonusDate");
  if (lastBonusDate === today) return;

  const points = 500;
  const currentPoints = parseInt(localStorage.getItem("playerRewardPoints") || "0");
  localStorage.setItem("playerRewardPoints", (currentPoints + points).toString());
  localStorage.setItem("leaderboardBonusDate", today);

  addPointsHistoryEntry({
    date: new Date().toISOString(),
    type: "leaderboard_bonus",
    points,
    description: "Monthly #1 Rank Bonus (held rank at midnight)",
  });

  window.dispatchEvent(new Event("rewardPointsUpdate"));
}

export function awardTournamentWin(tournamentName?: string): void {
  const points = 250000;
  const currentPoints = parseInt(localStorage.getItem("playerRewardPoints") || "0");
  localStorage.setItem("playerRewardPoints", (currentPoints + points).toString());

  addPointsHistoryEntry({
    date: new Date().toISOString(),
    type: "tournament_win",
    points,
    description: `Tournament Win${tournamentName ? `: ${tournamentName}` : ""}`,
  });

  window.dispatchEvent(new Event("rewardPointsUpdate"));
}

export function awardPvpWin(): void {
  const points = 25;
  const currentPoints = parseInt(localStorage.getItem("playerRewardPoints") || "0");
  localStorage.setItem("playerRewardPoints", (currentPoints + points).toString());

  addPointsHistoryEntry({
    date: new Date().toISOString(),
    type: "pvp_win",
    points,
    description: "PvP Match Win",
  });

  window.dispatchEvent(new Event("rewardPointsUpdate"));
}

export function getDailyStats(): {
  playTimeMinutes: number;
  aiDefeats: number;
  totalPointsToday: number;
  loginRewardEligible: boolean;
  hourlyRewardsEligible: number;
  dailyLoginBonusClaimed: boolean;
} {
  const data = getDailyData();

  const hourlyRewardsEligible = Math.floor(data.playTimeMinutes / 60) - data.hourlyRewardsClaimed;

  let totalPointsToday = 0;
  if (data.dailyLoginBonusClaimed) totalPointsToday += 100;
  if (data.loginRewardClaimed) totalPointsToday += 50;
  totalPointsToday += data.hourlyRewardsClaimed * 50;
  totalPointsToday += data.defeatsRewarded * 25;

  return {
    playTimeMinutes: data.playTimeMinutes,
    aiDefeats: data.aiDefeats,
    totalPointsToday,
    loginRewardEligible: !data.loginRewardClaimed && data.playTimeMinutes >= 10,
    hourlyRewardsEligible,
    dailyLoginBonusClaimed: data.dailyLoginBonusClaimed,
  };
}

export function cleanupOldRewardsData(): void {
  const today = getTodayDate();
  const keys = Object.keys(localStorage);

  keys.forEach((key) => {
    if (key.startsWith(REWARDS_KEY_PREFIX) && !key.includes(today)) {
      const dateMatch = key.replace(REWARDS_KEY_PREFIX, "");
      const storedDate = new Date(dateMatch);
      const daysDiff = Math.floor((Date.now() - storedDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff > 7) {
        localStorage.removeItem(key);
      }
    }
  });
}
