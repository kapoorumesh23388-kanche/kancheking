import { type User, type InsertUser, type CatalogItem, type MarbleTransaction, type GamePoint, type TournamentWindow, type GameRoom, type FeedbackSubmission, type AdminUser, catalogItems } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser, referralCode?: string, customId?: string): Promise<User>;
  updateUserMarbles(userId: string, marbles: number): Promise<User | undefined>;
  updateUserPoints(userId: string, points: number): Promise<User | undefined>;
  updateUserStats(userId: string, stats: { gamesWon?: number; gamesPlayed?: number }): Promise<User | undefined>;
  updateUserProfile(userId: string, profile: { displayName?: string; profileImage?: string; gender?: string }): Promise<User | undefined>;
  incrementAiWins(userId: string): Promise<User | undefined>;
  addEarnedMarbles(userId: string, amount: number): Promise<User | undefined>;
  updateEarnedMarbles(userId: string, earnedMarbles: number): Promise<User | undefined>;
  
  getCatalogItems(): Promise<CatalogItem[]>;
  addCatalogItem(item: Omit<CatalogItem, 'id' | 'createdAt'>): Promise<CatalogItem>;
  updateCatalogItem(id: string, item: Partial<Omit<CatalogItem, 'id' | 'createdAt'>>): Promise<CatalogItem | undefined>;
  deleteCatalogItem(id: string): Promise<void>;
  
  recordTransaction(tx: Omit<MarbleTransaction, 'id' | 'createdAt'>): Promise<MarbleTransaction>;
  getUserTransactions(userId: string): Promise<MarbleTransaction[]>;
  
  addGamePoints(points: Omit<GamePoint, 'id' | 'createdAt'>): Promise<GamePoint>;
  getUserGamePoints(userId: string): Promise<GamePoint[]>;
  
  getTournamentWindows(): Promise<TournamentWindow[]>;
  getActiveTournamentWindow(): Promise<TournamentWindow | undefined>;
  addTournamentWindow(window: Omit<TournamentWindow, 'id' | 'createdAt'>): Promise<TournamentWindow>;
  updateTournamentPlayerCount(windowId: string, count: number): Promise<void>;
  
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
  getProduct(productId: string): Promise<any>;
  getSubscription(subscriptionId: string): Promise<any>;
  
  // Tournament Bracket Methods
  getTournamentParticipants(tournamentId: string): Promise<any[]>;
  addTournamentParticipant(participant: any): Promise<any>;
  getTournamentMatches(tournamentId: string): Promise<any[]>;
  getTournamentMatch(matchId: string): Promise<any>;
  createTournamentMatch(match: any): Promise<any>;
  updateTournamentMatch(matchId: string, updates: any): Promise<any>;
  updateTournamentStatus(tournamentId: string, status: string): Promise<void>;
  setTournamentWinner(tournamentId: string, winnerId: string, winnerName: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private catalogItems: Map<string, CatalogItem>;
  private transactions: MarbleTransaction[];
  private gamePoints: GamePoint[];
  private tournamentWindows: Map<string, TournamentWindow>;
  private gameRooms: Map<string, GameRoom>;
  private matchQueue: Map<string, { userId: string; username: string; marbles: number }>;
  private feedbackSubmissions: FeedbackSubmission[];
  private adminUsers: Map<string, AdminUser>;

  constructor() {
    this.users = new Map();
    this.catalogItems = new Map();
    this.transactions = [];
    this.gamePoints = [];
    this.tournamentWindows = new Map();
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
    
    const window: TournamentWindow = {
      id: randomUUID(),
      windowNumber: 1,
      playerCount: 0,
      status: "waiting",
      maxPlayers: 100,
      entryFee: 2500,
      prizePool: 0,
      winnerId: null,
      winnerMarblesAwarded: 0,
      createdAt: new Date(),
      endedAt: null,
    };
    this.tournamentWindows.set(window.id, window);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === code,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser, referralCode?: string, customId?: string): Promise<User> {
    const id = customId || randomUUID();
    const code = referralCode || `REF${Math.random().toString(36).substring(7).toUpperCase()}`;
    const user: User = { 
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
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserMarbles(userId: string, marbles: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.marbles = marbles;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async updateUserPoints(userId: string, points: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.points = points;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async updateUserStats(userId: string, stats: { gamesWon?: number; gamesPlayed?: number }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      if (stats.gamesWon !== undefined) user.gamesWon = stats.gamesWon;
      if (stats.gamesPlayed !== undefined) user.gamesPlayed = stats.gamesPlayed;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async updateUserProfile(userId: string, profile: { displayName?: string; profileImage?: string; gender?: string }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      if (profile.displayName !== undefined) user.displayName = profile.displayName;
      if (profile.profileImage !== undefined) user.profileImage = profile.profileImage;
      if (profile.gender !== undefined) user.gender = profile.gender;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async incrementAiWins(userId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.aiWins = (user.aiWins || 0) + 1;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async addEarnedMarbles(userId: string, amount: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.marbles = (user.marbles || 0) + amount;
      user.earnedMarbles = (user.earnedMarbles || 0) + amount;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async updateEarnedMarbles(userId: string, earnedMarbles: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.earnedMarbles = earnedMarbles;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
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
    return Array.from(this.tournamentWindows.values());
  }

  async getActiveTournamentWindow(): Promise<TournamentWindow | undefined> {
    const windows = Array.from(this.tournamentWindows.values());
    return windows.find((w) => w.status === "waiting" && w.playerCount < w.maxPlayers);
  }

  async addTournamentWindow(window: Omit<TournamentWindow, 'id' | 'createdAt'>): Promise<TournamentWindow> {
    const newWindow: TournamentWindow = {
      ...window,
      id: randomUUID(),
      winnerId: null,
      winnerMarblesAwarded: 0,
      endedAt: null,
      createdAt: new Date(),
    };
    this.tournamentWindows.set(newWindow.id, newWindow);
    return newWindow;
  }

  async updateTournamentPlayerCount(windowId: string, count: number): Promise<void> {
    const window = this.tournamentWindows.get(windowId);
    if (window) {
      window.playerCount = count;
      if (count >= 100) {
        window.status = "active";
        await this.addTournamentWindow({
          windowNumber: window.windowNumber + 1,
          playerCount: 0,
          status: "waiting",
          maxPlayers: 100,
          entryFee: 2500,
          prizePool: 0,
          winnerId: null,
          winnerMarblesAwarded: 0,
          endedAt: null,
        });
      }
      this.tournamentWindows.set(windowId, window);
    }
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

  async getProduct(productId: string): Promise<any> {
    return { id: productId, name: "Marble Pack" };
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    return { id: subscriptionId };
  }

  // Tournament Bracket Methods
  private tournamentParticipants: Map<string, any[]> = new Map();
  private tournamentMatches: Map<string, any> = new Map();

  async getTournamentParticipants(tournamentId: string): Promise<any[]> {
    return this.tournamentParticipants.get(tournamentId) || [];
  }

  async addTournamentParticipant(participant: any): Promise<any> {
    const id = randomUUID();
    const newParticipant = { ...participant, id, createdAt: new Date() };
    const participants = this.tournamentParticipants.get(participant.tournamentId) || [];
    participants.push(newParticipant);
    this.tournamentParticipants.set(participant.tournamentId, participants);
    return newParticipant;
  }

  async getTournamentMatches(tournamentId: string): Promise<any[]> {
    return Array.from(this.tournamentMatches.values()).filter(m => m.tournamentId === tournamentId);
  }

  async getTournamentMatch(matchId: string): Promise<any> {
    return this.tournamentMatches.get(matchId);
  }

  async createTournamentMatch(match: any): Promise<any> {
    const id = randomUUID();
    const newMatch = { ...match, id, createdAt: new Date() };
    this.tournamentMatches.set(id, newMatch);
    return newMatch;
  }

  async updateTournamentMatch(matchId: string, updates: any): Promise<any> {
    const match = this.tournamentMatches.get(matchId);
    if (match) {
      const updated = { ...match, ...updates };
      this.tournamentMatches.set(matchId, updated);
      return updated;
    }
    return null;
  }

  async updateTournamentStatus(tournamentId: string, status: string): Promise<void> {
    const window = this.tournamentWindows.get(tournamentId);
    if (window) {
      window.status = status;
      this.tournamentWindows.set(tournamentId, window);
    }
  }

  async setTournamentWinner(tournamentId: string, winnerId: string, winnerName: string): Promise<void> {
    const window = this.tournamentWindows.get(tournamentId);
    if (window) {
      window.winnerId = winnerId;
      window.status = "completed";
      window.endedAt = new Date();
      this.tournamentWindows.set(tournamentId, window);
    }
  }
}

export const storage = new MemStorage();
