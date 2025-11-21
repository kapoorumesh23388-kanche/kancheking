import { type User, type InsertUser, type CatalogItem, type MarbleTransaction, type GamePoint, type TournamentWindow } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(user: InsertUser, referralCode?: string): Promise<User>;
  updateUserMarbles(userId: string, marbles: number): Promise<User | undefined>;
  updateUserPoints(userId: string, points: number): Promise<User | undefined>;
  
  // Catalog
  getCatalogItems(): Promise<CatalogItem[]>;
  addCatalogItem(item: Omit<CatalogItem, 'id' | 'createdAt'>): Promise<CatalogItem>;
  deleteCatalogItem(id: string): Promise<void>;
  
  // Transactions
  recordTransaction(tx: Omit<MarbleTransaction, 'id' | 'createdAt'>): Promise<MarbleTransaction>;
  getUserTransactions(userId: string): Promise<MarbleTransaction[]>;
  
  // Game Points
  addGamePoints(points: Omit<GamePoint, 'id' | 'createdAt'>): Promise<GamePoint>;
  getUserGamePoints(userId: string): Promise<GamePoint[]>;
  
  // Tournament
  getTournamentWindows(): Promise<TournamentWindow[]>;
  getActiveTournamentWindow(): Promise<TournamentWindow | undefined>;
  addTournamentWindow(window: Omit<TournamentWindow, 'id' | 'createdAt'>): Promise<TournamentWindow>;
  updateTournamentPlayerCount(windowId: string, count: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private catalogItems: Map<string, CatalogItem>;
  private transactions: MarbleTransaction[];
  private gamePoints: GamePoint[];
  private tournamentWindows: Map<string, TournamentWindow>;

  constructor() {
    this.users = new Map();
    this.catalogItems = new Map();
    this.transactions = [];
    this.gamePoints = [];
    this.tournamentWindows = new Map();
    
    // Initialize first tournament window
    const window: TournamentWindow = {
      id: randomUUID(),
      windowNumber: 1,
      playerCount: 0,
      status: "waiting",
      maxPlayers: 100,
      entryFee: 2500,
      prizePool: 0,
      createdAt: new Date(),
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

  async createUser(insertUser: InsertUser, referralCode?: string): Promise<User> {
    const id = randomUUID();
    const code = referralCode || `REF${Math.random().toString(36).substring(7).toUpperCase()}`;
    const user: User = { 
      ...insertUser, 
      id,
      marbles: 150,
      points: 0,
      gamesWon: 0,
      gamesPlayed: 0,
      referralCode: code,
      referredBy: referralCode,
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

  async getCatalogItems(): Promise<CatalogItem[]> {
    return Array.from(this.catalogItems.values());
  }

  async addCatalogItem(item: Omit<CatalogItem, 'id' | 'createdAt'>): Promise<CatalogItem> {
    const catalogItem: CatalogItem = {
      ...item,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.catalogItems.set(catalogItem.id, catalogItem);
    return catalogItem;
  }

  async deleteCatalogItem(id: string): Promise<void> {
    this.catalogItems.delete(id);
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
        // Auto-create next window
        await this.addTournamentWindow({
          windowNumber: window.windowNumber + 1,
          playerCount: 0,
          status: "waiting",
          maxPlayers: 100,
          entryFee: 2500,
          prizePool: 0,
        });
      }
      this.tournamentWindows.set(windowId, window);
    }
  }
}

export const storage = new MemStorage();
