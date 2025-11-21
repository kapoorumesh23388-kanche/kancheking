import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  marbles: integer("marbles").default(150),
  points: integer("points").default(0),
  gamesWon: integer("games_won").default(0),
  gamesPlayed: integer("games_played").default(0),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const catalogItems = pgTable("catalog_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const marbleTransactions = pgTable("marble_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: varchar("type").notNull(), // "purchase", "referral", "game_win", "game_loss"
  description: text("description"),
  transactionId: varchar("transaction_id").unique(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerCode: varchar("referrer_code").notNull().unique(),
  referrerId: varchar("referrer_id").notNull(),
  referredUserId: varchar("referred_user_id"),
  bonusAwarded: boolean("bonus_awarded").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const gamePoints = pgTable("game_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  points: integer("points").notNull(),
  gameType: varchar("game_type").notNull(), // "ai", "friend", "random", "tournament"
  opponent: varchar("opponent"),
  won: boolean("won").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const tournamentWindows = pgTable("tournament_windows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  windowNumber: integer("window_number").notNull(),
  playerCount: integer("player_count").default(0),
  status: varchar("status").default("waiting"), // "waiting", "active", "completed"
  maxPlayers: integer("max_players").default(100),
  entryFee: integer("entry_fee").default(2500),
  prizePool: integer("prize_pool").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const tournamentParticipants = pgTable("tournament_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  userId: varchar("user_id").notNull(),
  position: integer("position"),
  createdAt: timestamp("created_at").default(sql`now()`),
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
