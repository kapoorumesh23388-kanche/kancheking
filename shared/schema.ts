import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  marbles: integer("marbles").notNull().default(150),
  points: integer("points").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const catalogItems = pgTable("catalog_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marbleTransactions = pgTable("marble_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: varchar("type").notNull(),
  description: text("description"),
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gamePoints = pgTable("game_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  points: integer("points").notNull(),
  gameType: varchar("game_type").notNull(),
  opponent: varchar("opponent"),
  won: boolean("won").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournamentWindows = pgTable("tournament_windows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  windowNumber: integer("window_number").notNull(),
  playerCount: integer("player_count").notNull().default(0),
  status: varchar("status").notNull().default("waiting"),
  maxPlayers: integer("max_players").notNull().default(100),
  entryFee: integer("entry_fee").notNull().default(2500),
  prizePool: integer("prize_pool").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameRooms = pgTable("game_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomCode: varchar("room_code").unique().notNull(),
  player1Id: varchar("player1_id"),
  player2Id: varchar("player2_id"),
  creatorId: varchar("creator_id").notNull(),
  status: varchar("status").notNull().default("waiting"),
  gameMode: varchar("game_mode").notNull(),
  player1Marbles: integer("player1_marbles").notNull().default(0),
  player2Marbles: integer("player2_marbles").notNull().default(0),
  winner: varchar("winner"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matchQueue = pgTable("match_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  username: varchar("username").notNull(),
  marbles: integer("marbles").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerAdRevenue = pgTable("player_ad_revenue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  adType: varchar("ad_type").notNull(), // "banner", "rewarded", "interstitial"
  revenueGenerated: integer("revenue_generated").notNull(), // in paise (1 rupee = 100 paise)
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerRevenueShare = pgTable("player_revenue_share", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  month: varchar("month").notNull(), // "2025-11" format
  totalAdRevenue: integer("total_ad_revenue").notNull(),
  sharePercentage: integer("share_percentage").notNull().default(20),
  pointsAwarded: integer("points_awarded").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, awarded
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CatalogItem = typeof catalogItems.$inferSelect;
export type MarbleTransaction = typeof marbleTransactions.$inferSelect;
export type GamePoint = typeof gamePoints.$inferSelect;
export type TournamentWindow = typeof tournamentWindows.$inferSelect;
export type GameRoom = typeof gameRooms.$inferSelect;
export type PlayerAdRevenue = typeof playerAdRevenue.$inferSelect;
export type PlayerRevenueShare = typeof playerRevenueShare.$inferSelect;
