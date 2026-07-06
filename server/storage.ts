import { type User, type InsertUser, type CatalogItem, type MarbleTransaction, type GamePoint, type TournamentWindow, type TournamentParticipant, type TournamentMatch, type GameRoom, type FeedbackSubmission, type AdminUser, type SpinReward, catalogItems, users as usersTable, spinRewards as spinRewardsTable, tournamentWindows as tournamentWindowsTable, tournamentParticipants as tournamentParticipantsTable, tournamentMatches as tournamentMatchesTable } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser, referralCode?: string, customId?: string): Promise<User>;
  updateUserMarbles(userId: string, marbles: number): Promise<User | undefined>;
  updateUserPoints(userId: string, points: number): Promise<User | undefined>;
  updateUserStats(userId: string, stats: { gamesWon?: number; gamesPlayed?: number }): Promise<User | undefined>;
  updateUserProfile(userId: string, profile: { displayName?: string; profileImage?: string; gender?: string; email?: string }): Promise<User | undefined>;
  updateUserOnboarding(userId: string, data: { displayName?: string; dateOfBirth?: string; adPreferences?: string[]; isAgeVerified?: boolean }): Promise<User | undefined>;
  incrementAiWins(userId: string): Promise<User | undefined>;
  addEarnedMarbles(userId: string, amount: number): Promise<User | undefined>;
  adjustWallet(userId: string, marblesDelta: number, pointsDelta: number): Promise<User | undefined>;
  addPvpWinMarbles(userId: string, amount: number): Promise<User | undefined>;
  createSpinReward(userId: string, prizeName: string, prizeType: string, prizeValue: number): Promise<SpinReward>;
  getPendingSpinRewards(userId: string): Promise<SpinReward[]>;
  claimSpinReward(rewardId: string, userId: string): Promise<{ reward: SpinReward; user: User } | null>;
  updateEarnedMarbles(userId: string, earnedMarbles: number): Promise<User | undefined>;
  
  getCatalogItems(): Promise<CatalogItem[]>;
  addCatalogItem(item: Omit<CatalogItem, 'id' | 'createdAt'>): Promise<CatalogItem>;
  updateCatalogItem(id: string, item: Partial<Omit<CatalogItem, 'id' | 'createdAt'>>): Promise<CatalogItem | undefined>;
  deleteCatalogItem(id: string): Promise<void>;
  
  recordTransaction(tx: Omit<MarbleTransaction, 'id' | 'createdAt'>): Promise<MarbleTransaction>;
  getUserTransactions(userId: string): Promise<MarbleTransaction[]>;
  getTransactionByExternalId(externalId: string): Promise<MarbleTransaction | undefined>;
  
  addGamePoints(points: Omit<GamePoint, 'id' | 'createdAt'>): Promise<GamePoint>;
  getUserGamePoints(userId: string): Promise<GamePoint[]>;
  
  getTournamentWindows(): Promise<TournamentWindow[]>;
  getActiveTournamentWindow(): Promise<TournamentWindow | undefined>;
  addTournamentWindow(window: Omit<TournamentWindow, 'id' | 'createdAt'>): Promise<TournamentWindow>;
  updateTournamentPlayerCount(windowId: string, count: number): Promise<void>;
  addToPrizePool(windowId: string, amount: number): Promise<void>;
  setTournamentWinnerReward(windowId: string, winnerId: string, marblesAwarded: number): Promise<void>;
  
  createGameRoom(creatorId: string, gameMode: string): Promise<GameRoom>;
  getGameRoom(roomCode: string): Promise<GameRoom | undefined>;
  joinGameRoom(roomCode: string, playerId: string): Promise<GameRoom | undefined>;
  findMatchingPlayer(userId: string): Promise<{ roomCode: string; player: User } | null>;
  addToMatchQueue(userId: string, username: string, marbles: number): Promise<void>;
  removeFromMatchQueue(userId: string): Promise<void>;
  getUsersInMatchQueue(): Promise<Array<{ userId: string; username: string; marbles: number }>>;

  addFeedbackSubmission(feedback: Omit<FeedbackSubmission, 'id' | 'createdAt'>): Promise<FeedbackSubmission>;
  getFeedbackSubmissions(): Promise<FeedbackSubmission[]>;

  createOrUpdateAdmin(adminId: string, password: string): Promise<AdminUser>;
  getAdminByIdAndPassword(adminId: string, password: string): Promise<AdminUser | undefined>;
  updateAdminPassword(adminId: string, oldPassword: string, newPassword: string): Promise<boolean>;
  updateAdminPhone(adminId: string, phoneNumber: string): Promise<void>;
  getAdminPhone(adminId: string): Promise<string | undefined>;
  saveOTP(adminId: string, otp: string): Promise<void>;
  verifyOTP(adminId: string, otp: string): Promise<boolean>;

  updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<User | undefined>;
  setUserAsAdmin(userId: string, isAdmin: boolean): Promise<User | undefined>;
  getProduct(productId: string): Promise<any>;
  getSubscription(subscriptionId: string): Promise<any>;

  // Analytics tracking
  startGameSession(userId: string, gameType: string): Promise<{ sessionId: string }>;
  endGameSession(sessionId: string, stats: { gamesPlayed: number; gamesWon: number; marblesWon: number; marblesLost: number }): Promise<void>;
  recordAdImpression(userId: string, adType: string, adCategory: string | null, revenueAmount: number): Promise<void>;
  recordAdClick(impressionId: string): Promise<void>;
  getDailyUserStats(userId: string, date: string): Promise<any>;
  updateDailyUserStats(userId: string, date: string, stats: Partial<{ totalPlaytimeSeconds: number; gamesPlayed: number; gamesWon: number; adsViewed: number; adsClicked: number; adRevenueGenerated: number; marblesEarned: number; marblesSpent: number }>): Promise<void>;
  getEngagementAnalytics(): Promise<{ dailyStats: any[]; topUsers: any[]; adStats: any[] }>;
  
  // Tournament Bracket Methods
  getTournamentParticipants(tournamentId: string): Promise<TournamentParticipant[]>;
  addTournamentParticipant(participant: Omit<TournamentParticipant, 'id' | 'createdAt'>): Promise<TournamentParticipant>;
  getTournamentMatches(tournamentId: string): Promise<TournamentMatch[]>;
  getTournamentMatch(matchId: string): Promise<TournamentMatch | undefined>;
  createTournamentMatch(match: Omit<TournamentMatch, 'id' | 'createdAt'>): Promise<TournamentMatch>;
  updateTournamentMatch(matchId: string, updates: Partial<TournamentMatch>): Promise<TournamentMatch | undefined>;
  updateTournamentStatus(tournamentId: string, status: string): Promise<void>;
  setTournamentWinner(tournamentId: string, winnerId: string, winnerName: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private catalogItems: Map<string, CatalogItem>;
  private transactions: MarbleTransaction[];
  private gamePoints: GamePoint[];
  private gameRooms: Map<string, GameRoom>;
  private matchQueue: Map<string, { userId: string; username: string; marbles: number }>;
  private feedbackSubmissions: FeedbackSubmission[];
  private adminUsers: Map<string, AdminUser>;

  constructor() {
    this.users = new Map();
    this.catalogItems = new Map();
    this.transactions = [];
    this.gamePoints = [];
    this.gameRooms = new Map();
    this.matchQueue = new Map();
    this.feedbackSubmissions = [];
    this.adminUsers = new Map();
    
    // Initialize default admin account
    this.adminUsers.set("admin", {
      id: randomUUID(),
      adminId: "admin",
      password: "admin123",
      createdAt: new Date(),
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const cached = this.users.get(id);
    if (cached) return cached;
    try {
      let [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
      if (!user) {
        [user] = await db.select().from(usersTable).where(eq(usersTable.username, id));
      }
      if (user) this.users.set(user.id, user);
      return user;
    } catch { return undefined; }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(usersTable).where(eq((usersTable as any).email, email));
      if (user) this.users.set(user.id, user);
      return user;
    } catch { return undefined; }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const cached = Array.from(this.users.values()).find(u => u.username === username);
    if (cached) return cached;
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
      if (user) this.users.set(user.id, user);
      return user;
    } catch { return undefined; }
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === code,
    );
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const dbUsers = await db.select().from(usersTable);
      // Sync to in-memory cache
      dbUsers.forEach(u => this.users.set(u.id, u));
      return dbUsers;
    } catch {
      return Array.from(this.users.values());
    }
  }

  async createUser(insertUser: InsertUser, referralCode?: string, customId?: string): Promise<User> {
    const id = customId || randomUUID();
    const code = referralCode || `REF${Math.random().toString(36).substring(7).toUpperCase()}`;
    const userData = { 
      ...insertUser, 
      id,
      displayName: null,
      profileImage: null,
      gender: "boy",
      marbles: 150,
      earnedMarbles: 0,
      purchasedMarbles: 0,
      tournamentWinnings: 0,
      points: 0,
      gamesWon: 0,
      gamesPlayed: 0,
      aiWins: 0,
      referralCode: code,
      referredBy: referralCode || null,
      dateOfBirth: null,
      isAgeVerified: false,
      adContentRating: "family",
      adPreferences: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      isAdmin: false,
      createdAt: new Date(),
      lastActiveAt: null,
    };
    // Save to database
    try {
      const [dbUser] = await db.insert(usersTable).values(userData).returning();
      this.users.set(id, dbUser);
      return dbUser;
    } catch (err: any) {
      // If duplicate, return existing
      if (err.code === "23505") {
        const existing = await this.getUserByUsername(insertUser.username);
        if (existing) return existing;
      }
      // Fallback to in-memory
      this.users.set(id, userData as User);
      return userData as User;
    }
  }

  async updateUserMarbles(userId: string, marbles: number): Promise<User | undefined> {
    try {
      const [updated] = await db.update(usersTable).set({ marbles }).where(eq(usersTable.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) { user.marbles = marbles; this.users.set(userId, user); return user; }
      return undefined;
    }
  }

  async updateUserPoints(userId: string, points: number): Promise<User | undefined> {
    try {
      const [updated] = await db.update(usersTable).set({ points }).where(eq(usersTable.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) { user.points = points; this.users.set(userId, user); return user; }
      return undefined;
    }
  }

  async updateUserStats(userId: string, stats: { gamesWon?: number; gamesPlayed?: number }): Promise<User | undefined> {
    try {
      const updateData: any = {};
      if (stats.gamesWon !== undefined) updateData.gamesWon = stats.gamesWon;
      if (stats.gamesPlayed !== undefined) updateData.gamesPlayed = stats.gamesPlayed;
      const [updated] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        if (stats.gamesWon !== undefined) user.gamesWon = stats.gamesWon;
        if (stats.gamesPlayed !== undefined) user.gamesPlayed = stats.gamesPlayed;
        this.users.set(userId, user); return user;
      }
      return undefined;
    }
  }

  async updateUserProfile(userId: string, profile: { displayName?: string; profileImage?: string; gender?: string; email?: string }): Promise<User | undefined> {
    try {
      const updateData: any = {};
      if (profile.displayName !== undefined) updateData.displayName = profile.displayName;
      if (profile.profileImage !== undefined) updateData.profileImage = profile.profileImage;
      if (profile.gender !== undefined) updateData.gender = profile.gender;
      if (profile.email !== undefined) (updateData as any).email = profile.email;
      const [updated] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        if (profile.displayName !== undefined) user.displayName = profile.displayName;
        if (profile.profileImage !== undefined) user.profileImage = profile.profileImage;
        if (profile.gender !== undefined) user.gender = profile.gender;
        this.users.set(userId, user); return user;
      }
      return undefined;
    }
  }

  async updateUserOnboarding(userId: string, data: { displayName?: string; dateOfBirth?: string; adPreferences?: string[]; isAgeVerified?: boolean }): Promise<User | undefined> {
    try {
      const updateData: any = { lastActiveAt: new Date() };
      if (data.displayName !== undefined) updateData.displayName = data.displayName;
      if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
      if (data.isAgeVerified !== undefined) updateData.isAgeVerified = data.isAgeVerified;
      const [updated] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        if (data.displayName !== undefined) user.displayName = data.displayName;
        user.lastActiveAt = new Date();
        this.users.set(userId, user); return user;
      }
      return undefined;
    }
  }

  async incrementAiWins(userId: string): Promise<User | undefined> {
    try {
      const current = await this.getUser(userId);
      if (!current) return undefined;
      const [updated] = await db.update(usersTable).set({ aiWins: (current.aiWins || 0) + 1 }).where(eq(usersTable.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) { user.aiWins = (user.aiWins || 0) + 1; this.users.set(userId, user); return user; }
      return undefined;
    }
  }

  async adjustWallet(userId: string, marblesDelta: number, pointsDelta: number): Promise<User | undefined> {
    try {
      const current = await this.getUser(userId);
      if (!current) return undefined;
      const newMarbles = Math.max(0, (current.marbles || 0) + marblesDelta);
      const newPoints = Math.max(0, (current.points || 0) + pointsDelta);
      const [updated] = await db.update(usersTable)
        .set({ marbles: newMarbles, points: newPoints })
        .where(eq(usersTable.id, userId))
        .returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        user.marbles = Math.max(0, (user.marbles || 0) + marblesDelta);
        user.points = Math.max(0, (user.points || 0) + pointsDelta);
        this.users.set(userId, user);
        return user;
      }
      return undefined;
    }
  }

  async addEarnedMarbles(userId: string, amount: number): Promise<User | undefined> {
    try {
      const current = await this.getUser(userId);
      if (!current) return undefined;
      const newMarbles = (current.marbles || 0) + amount;
      const newEarned = (current.earnedMarbles || 0) + amount;
      const [updated] = await db.update(usersTable).set({ marbles: newMarbles, earnedMarbles: newEarned }).where(eq(usersTable.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        user.marbles = (user.marbles || 0) + amount;
        user.earnedMarbles = (user.earnedMarbles || 0) + amount;
        this.users.set(userId, user); return user;
      }
      return undefined;
    }
  }

  async createSpinReward(userId: string, prizeName: string, prizeType: string, prizeValue: number): Promise<SpinReward> {
    const [reward] = await db.insert(spinRewardsTable).values({ userId, prizeName, prizeType, prizeValue }).returning();
    return reward;
  }

  async getPendingSpinRewards(userId: string): Promise<SpinReward[]> {
    return await db.select().from(spinRewardsTable)
      .where(and(eq(spinRewardsTable.userId, userId), eq(spinRewardsTable.status, "pending")));
  }

  async claimSpinReward(rewardId: string, userId: string): Promise<{ reward: SpinReward; user: User } | null> {
    const [reward] = await db.select().from(spinRewardsTable).where(eq(spinRewardsTable.id, rewardId));
    if (!reward || reward.userId !== userId || reward.status !== "pending") return null;

    if (reward.prizeType === "marbles") {
      await this.addEarnedMarbles(userId, reward.prizeValue);
    } else if (reward.prizeType === "points") {
      const current = await this.getUser(userId);
      if (current) {
        await this.updateUserPoints(userId, (current.points || 0) + reward.prizeValue);
      }
    }

    const [updatedReward] = await db.update(spinRewardsTable)
      .set({ status: "claimed", claimedAt: new Date() })
      .where(eq(spinRewardsTable.id, rewardId))
      .returning();

    const user = await this.getUser(userId);
    if (!user) return null;
    return { reward: updatedReward, user };
  }

  async addPvpWinMarbles(userId: string, amount: number): Promise<User | undefined> {
    try {
      const current = await this.getUser(userId);
      if (!current) return undefined;
      const newPvpWins = Math.max(0, (current.pvpWinMarbles || 0) + amount);
      const [updated] = await db.update(usersTable).set({ pvpWinMarbles: newPvpWins }).where(eq(usersTable.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        user.pvpWinMarbles = (user.pvpWinMarbles || 0) + amount;
        this.users.set(userId, user); return user;
      }
      return undefined;
    }
  }

  async updateEarnedMarbles(userId: string, earnedMarbles: number): Promise<User | undefined> {
    try {
      const [updated] = await db.update(usersTable).set({ earnedMarbles }).where(eq(usersTable.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) { user.earnedMarbles = earnedMarbles; this.users.set(userId, user); return user; }
      return undefined;
    }
  }

  async getCatalogItems(): Promise<CatalogItem[]> {
    try {
      const items = await db.select().from(catalogItems);
      return items;
    } catch (error) {
      console.error("Error fetching catalog items from DB:", error);
      return [];
    }
  }

  async addCatalogItem(item: Omit<CatalogItem, 'id' | 'createdAt'>): Promise<CatalogItem> {
    try {
      const [newItem] = await db.insert(catalogItems).values({
        name: item.name,
        description: item.description,
        pointsCost: item.pointsCost,
        imageUrl: item.imageUrl,
      }).returning();
      return newItem;
    } catch (error) {
      console.error("Error adding catalog item to DB:", error);
      throw error;
    }
  }

  async deleteCatalogItem(id: string): Promise<void> {
    try {
      await db.delete(catalogItems).where(eq(catalogItems.id, id));
    } catch (error) {
      console.error("Error deleting catalog item from DB:", error);
      throw error;
    }
  }

  async updateCatalogItem(id: string, item: Partial<Omit<CatalogItem, 'id' | 'createdAt'>>): Promise<CatalogItem | undefined> {
    try {
      const [updatedItem] = await db.update(catalogItems)
        .set(item)
        .where(eq(catalogItems.id, id))
        .returning();
      return updatedItem;
    } catch (error) {
      console.error("Error updating catalog item in DB:", error);
      throw error;
    }
  }

  async recordTransaction(tx: Omit<MarbleTransaction, 'id' | 'createdAt'>): Promise<MarbleTransaction> {
    const transaction: MarbleTransaction = {
      ...tx,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.transactions.push(transaction);
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<MarbleTransaction[]> {
    return this.transactions.filter((tx) => tx.userId === userId);
  }

  async getTransactionByExternalId(externalId: string): Promise<MarbleTransaction | undefined> {
    return this.transactions.find((tx) => tx.transactionId === externalId);
  }

  async addGamePoints(points: Omit<GamePoint, 'id' | 'createdAt'>): Promise<GamePoint> {
    const gamePoint: GamePoint = {
      ...points,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.gamePoints.push(gamePoint);
    return gamePoint;
  }

  async getUserGamePoints(userId: string): Promise<GamePoint[]> {
    return this.gamePoints.filter((gp) => gp.userId === userId);
  }

  async getTournamentWindows(): Promise<TournamentWindow[]> {
    return await db.select().from(tournamentWindowsTable);
  }

  async getActiveTournamentWindow(): Promise<TournamentWindow | undefined> {
    const windows = await db.select().from(tournamentWindowsTable);
    const active = windows.find((w) => w.status === "waiting" && w.playerCount < w.maxPlayers);
    if (active) return active;

    // No open window exists yet — create the first one automatically.
    return await this.addTournamentWindow({
      windowNumber: windows.length + 1,
      playerCount: 0,
      status: "waiting",
      maxPlayers: 100,
      entryFee: 250,
      prizePool: 0,
      winnerId: null,
      winnerMarblesAwarded: 0,
      endedAt: null,
    });
  }

  async addTournamentWindow(window: Omit<TournamentWindow, 'id' | 'createdAt'>): Promise<TournamentWindow> {
    const [newWindow] = await db.insert(tournamentWindowsTable).values({
      ...window,
      winnerId: null,
      winnerMarblesAwarded: 0,
      endedAt: null,
    }).returning();
    return newWindow;
  }

  async updateTournamentPlayerCount(windowId: string, count: number): Promise<void> {
    const [window] = await db.select().from(tournamentWindowsTable).where(eq(tournamentWindowsTable.id, windowId));
    if (!window) return;

    const newStatus = count >= window.maxPlayers ? "active" : window.status;
    await db.update(tournamentWindowsTable)
      .set({ playerCount: count, status: newStatus })
      .where(eq(tournamentWindowsTable.id, windowId));

    if (count >= window.maxPlayers) {
      await this.addTournamentWindow({
        windowNumber: window.windowNumber + 1,
        playerCount: 0,
        status: "waiting",
        maxPlayers: 100,
        entryFee: 250,
        prizePool: 0,
        winnerId: null,
        winnerMarblesAwarded: 0,
        endedAt: null,
      });
    }
  }

  async addToPrizePool(windowId: string, amount: number): Promise<void> {
    const [window] = await db.select().from(tournamentWindowsTable).where(eq(tournamentWindowsTable.id, windowId));
    if (!window) return;
    await db.update(tournamentWindowsTable)
      .set({ prizePool: (window.prizePool || 0) + amount })
      .where(eq(tournamentWindowsTable.id, windowId));
  }

  async setTournamentWinnerReward(windowId: string, winnerId: string, marblesAwarded: number): Promise<void> {
    await db.update(tournamentWindowsTable)
      .set({ winnerId, winnerMarblesAwarded: marblesAwarded, status: "completed", endedAt: new Date() })
      .where(eq(tournamentWindowsTable.id, windowId));
  }

  async createGameRoom(creatorId: string, gameMode: string): Promise<GameRoom> {
    const roomCode = `ROOM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const creator = this.users.get(creatorId);
    const room: GameRoom = {
      id: randomUUID(),
      roomCode,
      player1Id: creatorId,
      player2Id: null,
      creatorId,
      status: "waiting",
      gameMode,
      player1Marbles: creator?.marbles || 0,
      player2Marbles: 0,
      winner: null,
      createdAt: new Date(),
    };
    this.gameRooms.set(roomCode, room);
    return room;
  }

  async getGameRoom(roomCode: string): Promise<GameRoom | undefined> {
    return this.gameRooms.get(roomCode);
  }

  async joinGameRoom(roomCode: string, playerId: string): Promise<GameRoom | undefined> {
    const room = this.gameRooms.get(roomCode);
    if (room && room.status === "waiting" && !room.player2Id) {
      const player = this.users.get(playerId);
      room.player2Id = playerId;
      room.player2Marbles = player?.marbles || 0;
      room.status = "active";
      this.gameRooms.set(roomCode, room);
      return room;
    }
    return undefined;
  }

  async findMatchingPlayer(userId: string): Promise<{ roomCode: string; player: User } | null> {
    const queueArray = Array.from(this.matchQueue.values());
    if (queueArray.length > 0) {
      const match = queueArray[0];
      const player = this.users.get(match.userId);
      if (player && player.id !== userId) {
        const room = await this.createGameRoom(userId, "random");
        await this.joinGameRoom(room.roomCode, match.userId);
        this.matchQueue.delete(match.userId);
        return { roomCode: room.roomCode, player };
      }
    }
    return null;
  }

  async addToMatchQueue(userId: string, username: string, marbles: number): Promise<void> {
    this.matchQueue.set(userId, { userId, username, marbles });
  }

  async removeFromMatchQueue(userId: string): Promise<void> {
    this.matchQueue.delete(userId);
  }

  async getUsersInMatchQueue(): Promise<Array<{ userId: string; username: string; marbles: number }>> {
    return Array.from(this.matchQueue.values()).map(entry => ({
      userId: entry.userId,
      username: entry.username,
      marbles: entry.marbles,
    }));
  }

  async addFeedbackSubmission(feedback: Omit<FeedbackSubmission, 'id' | 'createdAt'>): Promise<FeedbackSubmission> {
    const id = randomUUID();
    const submission: FeedbackSubmission = {
      ...feedback,
      id,
      createdAt: new Date(),
    };
    this.feedbackSubmissions.push(submission);
    return submission;
  }

  async getFeedbackSubmissions(): Promise<FeedbackSubmission[]> {
    return this.feedbackSubmissions;
  }

  async createOrUpdateAdmin(adminId: string, password: string): Promise<AdminUser> {
    const admin: AdminUser = {
      id: randomUUID(),
      adminId,
      password,
      createdAt: new Date(),
    };
    this.adminUsers.set(adminId, admin);
    return admin;
  }

  async getAdminByIdAndPassword(adminId: string, password: string): Promise<AdminUser | undefined> {
    const admin = this.adminUsers.get(adminId);
    if (admin && admin.password === password) {
      return admin;
    }
    return undefined;
  }

  async updateAdminPassword(adminId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const admin = this.adminUsers.get(adminId);
    if (admin && admin.password === oldPassword) {
      admin.password = newPassword;
      this.adminUsers.set(adminId, admin);
      return true;
    }
    return false;
  }

  private adminPhones: Map<string, string> = new Map([["admin", "9211979518"]]);
  private otpStore: Map<string, { otp: string; timestamp: number }> = new Map();

  async updateAdminPhone(adminId: string, phoneNumber: string): Promise<void> {
    this.adminPhones.set(adminId, phoneNumber);
  }

  async getAdminPhone(adminId: string): Promise<string | undefined> {
    return this.adminPhones.get(adminId);
  }

  async saveOTP(adminId: string, otp: string): Promise<void> {
    this.otpStore.set(adminId, { otp, timestamp: Date.now() });
  }

  async verifyOTP(adminId: string, otp: string): Promise<boolean> {
    const stored = this.otpStore.get(adminId);
    if (!stored) return false;

    const isExpired = Date.now() - stored.timestamp > 5 * 60 * 1000; // 5 min expiry
    if (isExpired) {
      this.otpStore.delete(adminId);
      return false;
    }

    if (stored.otp === otp) {
      this.otpStore.delete(adminId);
      return true;
    }
    return false;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      if (stripeInfo.stripeCustomerId) user.stripeCustomerId = stripeInfo.stripeCustomerId;
      if (stripeInfo.stripeSubscriptionId) user.stripeSubscriptionId = stripeInfo.stripeSubscriptionId;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async setUserAsAdmin(userId: string, isAdmin: boolean): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.isAdmin = isAdmin;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async getProduct(productId: string): Promise<any> {
    return { id: productId, name: "Marble Pack" };
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    return { id: subscriptionId };
  }

  // Analytics tracking
  private gameSessions: Map<string, any> = new Map();
  private adImpressions: Map<string, any> = new Map();
  private dailyUserStats: Map<string, any> = new Map();

  async startGameSession(userId: string, gameType: string): Promise<{ sessionId: string }> {
    const sessionId = randomUUID();
    this.gameSessions.set(sessionId, {
      id: sessionId,
      userId,
      gameType,
      startedAt: new Date(),
      endedAt: null,
      durationSeconds: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      marblesWon: 0,
      marblesLost: 0,
    });
    return { sessionId };
  }

  async endGameSession(sessionId: string, stats: { gamesPlayed: number; gamesWon: number; marblesWon: number; marblesLost: number }): Promise<void> {
    const session = this.gameSessions.get(sessionId);
    if (session) {
      const endedAt = new Date();
      const durationSeconds = Math.floor((endedAt.getTime() - new Date(session.startedAt).getTime()) / 1000);
      session.endedAt = endedAt;
      session.durationSeconds = durationSeconds;
      session.gamesPlayed = stats.gamesPlayed;
      session.gamesWon = stats.gamesWon;
      session.marblesWon = stats.marblesWon;
      session.marblesLost = stats.marblesLost;
      this.gameSessions.set(sessionId, session);

      // Update daily stats
      const date = endedAt.toISOString().split('T')[0];
      await this.updateDailyUserStats(session.userId, date, {
        totalPlaytimeSeconds: durationSeconds,
        gamesPlayed: stats.gamesPlayed,
        gamesWon: stats.gamesWon,
        marblesEarned: stats.marblesWon,
        marblesSpent: stats.marblesLost,
      });
    }
  }

  async recordAdImpression(userId: string, adType: string, adCategory: string | null, revenueAmount: number): Promise<void> {
    const id = randomUUID();
    this.adImpressions.set(id, {
      id,
      userId,
      adType,
      adCategory,
      revenueAmount,
      viewedAt: new Date(),
      clickedAt: null,
      isClicked: false,
    });

    // Update daily stats
    const date = new Date().toISOString().split('T')[0];
    await this.updateDailyUserStats(userId, date, {
      adsViewed: 1,
      adRevenueGenerated: revenueAmount,
    });
  }

  async recordAdClick(impressionId: string): Promise<void> {
    const impression = this.adImpressions.get(impressionId);
    if (impression) {
      impression.clickedAt = new Date();
      impression.isClicked = true;
      this.adImpressions.set(impressionId, impression);

      // Update daily stats
      const date = new Date().toISOString().split('T')[0];
      await this.updateDailyUserStats(impression.userId, date, {
        adsClicked: 1,
      });
    }
  }

  async getDailyUserStats(userId: string, date: string): Promise<any> {
    const key = `${userId}_${date}`;
    return this.dailyUserStats.get(key);
  }

  async updateDailyUserStats(userId: string, date: string, stats: Partial<{ totalPlaytimeSeconds: number; gamesPlayed: number; gamesWon: number; adsViewed: number; adsClicked: number; adRevenueGenerated: number; marblesEarned: number; marblesSpent: number }>): Promise<void> {
    const key = `${userId}_${date}`;
    let existing = this.dailyUserStats.get(key);
    
    if (!existing) {
      existing = {
        id: randomUUID(),
        userId,
        date,
        totalPlaytimeSeconds: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        adsViewed: 0,
        adsClicked: 0,
        adRevenueGenerated: 0,
        marblesEarned: 0,
        marblesSpent: 0,
        createdAt: new Date(),
      };
    }

    // Add incremental values
    if (stats.totalPlaytimeSeconds) existing.totalPlaytimeSeconds += stats.totalPlaytimeSeconds;
    if (stats.gamesPlayed) existing.gamesPlayed += stats.gamesPlayed;
    if (stats.gamesWon) existing.gamesWon += stats.gamesWon;
    if (stats.adsViewed) existing.adsViewed += stats.adsViewed;
    if (stats.adsClicked) existing.adsClicked += stats.adsClicked;
    if (stats.adRevenueGenerated) existing.adRevenueGenerated += stats.adRevenueGenerated;
    if (stats.marblesEarned) existing.marblesEarned += stats.marblesEarned;
    if (stats.marblesSpent) existing.marblesSpent += stats.marblesSpent;

    this.dailyUserStats.set(key, existing);
  }

  async getEngagementAnalytics(): Promise<{ dailyStats: any[]; topUsers: any[]; adStats: any[] }> {
    // Get all daily stats
    const allDailyStats = Array.from(this.dailyUserStats.values());
    
    // Aggregate by date
    const dateAggregates: Record<string, any> = {};
    allDailyStats.forEach(stat => {
      if (!dateAggregates[stat.date]) {
        dateAggregates[stat.date] = {
          date: stat.date,
          totalUsers: 0,
          totalPlaytimeSeconds: 0,
          totalGamesPlayed: 0,
          totalAdsViewed: 0,
          totalAdRevenue: 0,
        };
      }
      dateAggregates[stat.date].totalUsers++;
      dateAggregates[stat.date].totalPlaytimeSeconds += stat.totalPlaytimeSeconds;
      dateAggregates[stat.date].totalGamesPlayed += stat.gamesPlayed;
      dateAggregates[stat.date].totalAdsViewed += stat.adsViewed;
      dateAggregates[stat.date].totalAdRevenue += stat.adRevenueGenerated;
    });
    
    const dailyStats = Object.values(dateAggregates).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 30);

    // Top users by playtime
    const userAggregates: Record<string, any> = {};
    allDailyStats.forEach(stat => {
      if (!userAggregates[stat.userId]) {
        userAggregates[stat.userId] = {
          userId: stat.userId,
          totalPlaytimeSeconds: 0,
          totalGamesPlayed: 0,
          totalAdsViewed: 0,
          totalAdRevenue: 0,
        };
      }
      userAggregates[stat.userId].totalPlaytimeSeconds += stat.totalPlaytimeSeconds;
      userAggregates[stat.userId].totalGamesPlayed += stat.gamesPlayed;
      userAggregates[stat.userId].totalAdsViewed += stat.adsViewed;
      userAggregates[stat.userId].totalAdRevenue += stat.adRevenueGenerated;
    });

    const topUsers = Object.values(userAggregates)
      .sort((a: any, b: any) => b.totalPlaytimeSeconds - a.totalPlaytimeSeconds)
      .slice(0, 20);

    // Add user names
    for (const user of topUsers) {
      const userData = await this.getUser(user.userId);
      user.displayName = userData?.displayName || userData?.username || 'Unknown';
    }

    // Ad stats by type
    const adTypeStats: Record<string, any> = {};
    Array.from(this.adImpressions.values()).forEach(ad => {
      if (!adTypeStats[ad.adType]) {
        adTypeStats[ad.adType] = {
          adType: ad.adType,
          impressions: 0,
          clicks: 0,
          revenue: 0,
        };
      }
      adTypeStats[ad.adType].impressions++;
      if (ad.isClicked) adTypeStats[ad.adType].clicks++;
      adTypeStats[ad.adType].revenue += ad.revenueAmount;
    });

    const adStats = Object.values(adTypeStats);

    return { dailyStats, topUsers, adStats };
  }

  // Tournament Bracket Methods — all persisted to the real database now,
  // so tournament progress survives server restarts / free-tier spin-downs.

  async getTournamentParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    return await db.select().from(tournamentParticipantsTable)
      .where(eq(tournamentParticipantsTable.tournamentId, tournamentId));
  }

  async addTournamentParticipant(participant: Omit<TournamentParticipant, 'id' | 'createdAt'>): Promise<TournamentParticipant> {
    const [newParticipant] = await db.insert(tournamentParticipantsTable).values(participant).returning();
    return newParticipant;
  }

  async getTournamentMatches(tournamentId: string): Promise<TournamentMatch[]> {
    return await db.select().from(tournamentMatchesTable)
      .where(eq(tournamentMatchesTable.tournamentId, tournamentId));
  }

  async getTournamentMatch(matchId: string): Promise<TournamentMatch | undefined> {
    const [match] = await db.select().from(tournamentMatchesTable).where(eq(tournamentMatchesTable.id, matchId));
    return match;
  }

  async createTournamentMatch(match: Omit<TournamentMatch, 'id' | 'createdAt'>): Promise<TournamentMatch> {
    const [newMatch] = await db.insert(tournamentMatchesTable).values(match).returning();
    return newMatch;
  }

  async updateTournamentMatch(matchId: string, updates: Partial<TournamentMatch>): Promise<TournamentMatch | undefined> {
    const [updated] = await db.update(tournamentMatchesTable)
      .set(updates)
      .where(eq(tournamentMatchesTable.id, matchId))
      .returning();
    return updated;
  }

  async updateTournamentStatus(tournamentId: string, status: string): Promise<void> {
    await db.update(tournamentWindowsTable)
      .set({ status })
      .where(eq(tournamentWindowsTable.id, tournamentId));
  }

  async setTournamentWinner(tournamentId: string, winnerId: string, winnerName: string): Promise<void> {
    await db.update(tournamentWindowsTable)
      .set({ winnerId, status: "completed", endedAt: new Date() })
      .where(eq(tournamentWindowsTable.id, tournamentId));
  }
}

export const storage = new MemStorage();
