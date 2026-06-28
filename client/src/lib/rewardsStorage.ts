const REWARDS_KEY_PREFIX = "rewards_";
const POINTS_HISTORY_KEY = "pointsHistory";
const POINTS_REDEMPTION_KEY = "pointsRedemptionHistory";

// Cheating fix: only count playtime when user is actually active
// (tab visible + recent interaction within this window)
const ACTIVITY_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

interface DailyRewardsData {
  date: string;
  loginTime: number;
  playTimeMinutes: number;
  aiDefeats: number;
  dailyLoginBonusClaimed: boolean;
  playtimeMilestonesClaimed: number; // number of 30-min blocks already rewarded
  defeatsRewarded: number;
  lastPlaytimeCheck: number;
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
    const parsed = JSON.parse(stored);
    // Defensive defaults for users upgrading from old version
    if (parsed.playtimeMilestonesClaimed === undefined) parsed.playtimeMilestonesClaimed = 0;
    return parsed;
  }

  return {
    date: today,
    loginTime: Date.now(),
    playTimeMinutes: 0,
    aiDefeats: 0,
    dailyLoginBonusClaimed: false,
    playtimeMilestonesClaimed: 0,
    defeatsRewarded: 0,
    lastPlaytimeCheck: Date.now(),
    tournamentWinsRewarded: 0,
  };
}

function saveDailyData(data: DailyRewardsData): void {
  localStorage.setItem(`${REWARDS_KEY_PREFIX}${data.date}`, JSON.stringify(data));
}

// --- Activity tracking (anti-cheat) ---
// Points are only earned while the user is actually interacting with the
// page (click/touch/scroll/keypress) and the tab is visible. Simply
// leaving the game open in the background no longer earns playtime.
let lastActivityTime = Date.now();
let activityTrackingInitialized = false;

function recordActivity(): void {
  lastActivityTime = Date.now();
}

export function initActivityTracking(): void {
  if (activityTrackingInitialized || typeof window === "undefined") return;
  activityTrackingInitialized = true;

  const events: (keyof WindowEventMap)[] = ["click", "touchstart", "keydown", "mousemove", "scroll", "wheel"];
  events.forEach((ev) => window.addEventListener(ev, recordActivity, { passive: true }));

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") recordActivity();
  });

  recordActivity();
}

function isUserActive(): boolean {
  if (typeof document === "undefined") return true;
  if (document.visibilityState !== "visible") return false;
  if (!document.hasFocus()) return false;
  return Date.now() - lastActivityTime < ACTIVITY_TIMEOUT_MS;
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
  initActivityTracking();
  const data = getDailyData();
  if (!data.loginTime) {
    data.loginTime = Date.now();
  }
  saveDailyData(data);
}

// Called periodically (every minute) while a game page is open.
// Only adds to playTimeMinutes if the user has been actively
// interacting with the page recently (anti-AFK).
export function updatePlaytime(): number {
  const data = getDailyData();
  const now = Date.now();
  const minutesSinceLastCheck = Math.floor((now - data.lastPlaytimeCheck) / 60000);

  if (minutesSinceLastCheck > 0) {
    if (isUserActive()) {
      data.playTimeMinutes += minutesSinceLastCheck;
    }
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

// Daily Login Bonus: +20 points, once per day
export function checkAndClaimDailyLoginBonus(): { claimed: boolean; points: number } {
  const data = getDailyData();

  if (data.dailyLoginBonusClaimed) {
    return { claimed: false, points: 0 };
  }

  data.dailyLoginBonusClaimed = true;
  saveDailyData(data);

  const points = 20;
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

// Points for a given 30-minute milestone (1-based index):
//   milestone 1 (30 min)  -> +30
//   milestone 2 (60 min)  -> +50   (total at 1hr = 30+50 = 80, +20 daily = 100)
//   milestone 3+ (every additional 30 min) -> +30 each
function getMilestonePoints(milestoneIndex: number): number {
  if (milestoneIndex === 1) return 30;
  if (milestoneIndex === 2) return 50;
  return 30;
}

// Active-playtime reward system (anti-cheat aware).
// Call this periodically while the user is on a game page.
export function checkAndClaimPlaytimeRewards(): { claimed: boolean; points: number; milestones: number } {
  const data = getDailyData();

  const eligibleMilestones = Math.floor(data.playTimeMinutes / 30);
  const claimedMilestones = data.playtimeMilestonesClaimed || 0;
  const unclaimed = eligibleMilestones - claimedMilestones;

  if (unclaimed > 0) {
    let totalPoints = 0;
    for (let i = claimedMilestones + 1; i <= eligibleMilestones; i++) {
      totalPoints += getMilestonePoints(i);
    }

    data.playtimeMilestonesClaimed = eligibleMilestones;
    saveDailyData(data);

    const currentPoints = parseInt(localStorage.getItem("playerRewardPoints") || "0");
    localStorage.setItem("playerRewardPoints", (currentPoints + totalPoints).toString());

    addPointsHistoryEntry({
      date: new Date().toISOString(),
      type: "hourly_play",
      points: totalPoints,
      description: `${unclaimed * 30} minutes of active gameplay`,
    });

    window.dispatchEvent(new Event("rewardPointsUpdate"));
    return { claimed: true, points: totalPoints, milestones: unclaimed };
  }

  return { claimed: false, points: 0, milestones: 0 };
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
  const points = 2500;
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
  playtimeMilestonesClaimed: number;
  nextMilestoneIn: number; // minutes until next 30-min reward
  dailyLoginBonusClaimed: boolean;
} {
  const data = getDailyData();

  const claimedMilestones = data.playtimeMilestonesClaimed || 0;
  let totalPointsToday = 0;
  if (data.dailyLoginBonusClaimed) totalPointsToday += 20;
  for (let i = 1; i <= claimedMilestones; i++) totalPointsToday += getMilestonePoints(i);
  totalPointsToday += data.defeatsRewarded * 25;

  const nextMilestoneAt = (claimedMilestones + 1) * 30;
  const nextMilestoneIn = Math.max(0, nextMilestoneAt - data.playTimeMinutes);

  return {
    playTimeMinutes: data.playTimeMinutes,
    aiDefeats: data.aiDefeats,
    totalPointsToday,
    playtimeMilestonesClaimed: claimedMilestones,
    nextMilestoneIn,
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
