const REWARDS_KEY_PREFIX = "rewards_";

interface DailyRewardsData {
  date: string;
  loginTime: number;
  playTimeMinutes: number;
  aiDefeats: number;
  loginRewardClaimed: boolean;
  hourlyRewardsClaimed: number;
  defeatsRewarded: number;
  lastPlaytimeCheck: number;
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
  };
}

function saveDailyData(data: DailyRewardsData): void {
  localStorage.setItem(`${REWARDS_KEY_PREFIX}${data.date}`, JSON.stringify(data));
}

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

export function checkAndClaimLoginReward(): { claimed: boolean; points: number } {
  const data = getDailyData();
  
  if (data.loginRewardClaimed) {
    return { claimed: false, points: 0 };
  }
  
  if (data.playTimeMinutes >= 10) {
    data.loginRewardClaimed = true;
    saveDailyData(data);
    
    const currentPoints = parseInt(localStorage.getItem("playerRewardPoints") || "0");
    localStorage.setItem("playerRewardPoints", (currentPoints + 50).toString());
    
    return { claimed: true, points: 50 };
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
    
    return { claimed: true, points: pointsEarned, defeats: unclaimedDefeats };
  }
  
  return { claimed: false, points: 0, defeats: 0 };
}

export function getDailyStats(): {
  playTimeMinutes: number;
  aiDefeats: number;
  totalPointsToday: number;
  loginRewardEligible: boolean;
  hourlyRewardsEligible: number;
} {
  const data = getDailyData();
  
  const hourlyRewardsEligible = Math.floor(data.playTimeMinutes / 60) - data.hourlyRewardsClaimed;
  
  let totalPointsToday = 0;
  if (data.loginRewardClaimed) totalPointsToday += 50;
  totalPointsToday += data.hourlyRewardsClaimed * 50;
  totalPointsToday += data.defeatsRewarded * 25;
  
  return {
    playTimeMinutes: data.playTimeMinutes,
    aiDefeats: data.aiDefeats,
    totalPointsToday,
    loginRewardEligible: !data.loginRewardClaimed && data.playTimeMinutes >= 10,
    hourlyRewardsEligible,
  };
}

export function getRewardPointsValue(points: number): { minValue: number; maxValue: number } {
  const baseRate = 500 / 1000;
  const maxRate = 5000 / 10000;
  
  return {
    minValue: Math.floor(points * baseRate),
    maxValue: Math.floor(points * maxRate),
  };
}

export function cleanupOldRewardsData(): void {
  const today = getTodayDate();
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
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
