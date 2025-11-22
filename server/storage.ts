import { type User, type InsertUser, type CatalogItem, type MarbleTransaction, type GamePoint, type TournamentWindow, type GameRoom } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(user: InsertUser, referralCode?: string): Promise<User>;
  updateUserMarbles(userId: string, marbles: number): Promise<User | undefined>;
  updateUserPoints(userId: string, points: number): Promise<User | undefined>;
  updateUserStats(userId: string, stats: { gamesWon?: number; gamesPlayed?: number }): Promise<User | undefined>;
  updateUserProfile(userId: string, profile: { displayName?: string; profileImage?: string }): Promise<User | undefined>;
  
  getCatalogItems(): Promise<CatalogItem[]>;
  addCatalogItem(item: Omit<CatalogItem, 'id' | 'createdAt'>): Promise<CatalogItem>;
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private catalogItems: Map<string, CatalogItem>;
  private transactions: MarbleTransaction[];
  private gamePoints: GamePoint[];
  private tournamentWindows: Map<string, TournamentWindow>;
  private gameRooms: Map<string, GameRoom>;
  private matchQueue: Map<string, { userId: string; username: string; marbles: number }>;

  constructor() {
    this.users = new Map();
    this.catalogItems = new Map();
    this.transactions = [];
    this.gamePoints = [];
    this.tournamentWindows = new Map();
    this.gameRooms = new Map();
    this.matchQueue = new Map();
    
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

  async createUser(insertUser: InsertUser, referralCode?: string): Promise<User> {
    const id = randomUUID();
    const code = referralCode || `REF${Math.random().toString(36).substring(7).toUpperCase()}`;
    const user: User = { 
      ...insertUser, 
      id,
      displayName: null,
      profileImage: null,
      marbles: 150,
      purchasedMarbles: 0,
      tournamentWinnings: 0,
      points: 0,
      gamesWon: 0,
      gamesPlayed: 0,
      referralCode: code,
      referredBy: referralCode || null,
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

  async updateUserProfile(userId: string, profile: { displayName?: string; profileImage?: string }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      if (profile.displayName !== undefined) user.displayName = profile.displayName;
      if (profile.profileImage !== undefined) user.profileImage = profile.profileImage;
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
}

export const storage = new MemStorage();
