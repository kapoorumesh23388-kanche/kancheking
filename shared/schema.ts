import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  profileImage: varchar("profile_image"),
  gender: varchar("gender").default("boy"),
  marbles: integer("marbles").notNull().default(150),
  earnedMarbles: integer("earned_marbles").notNull().default(0),
  purchasedMarbles: integer("purchased_marbles").notNull().default(0),
  tournamentWinnings: integer("tournament_winnings").notNull().default(0),
  points: integer("points").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  aiWins: integer("ai_wins").notNull().default(0),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  dateOfBirth: varchar("date_of_birth"),
  isAgeVerified: boolean("is_age_verified").notNull().default(false),
  adContentRating: varchar("ad_content_rating").default("family"),
  adPreferences: text("ad_preferences").array(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  isAdmin: boolean("is_admin").notNull().default(false),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at"),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const catalogItems = pgTable("catalog_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  imageUrl: varchar("image_url"),
  category: varchar("category").default("gift"),
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
  winnerId: varchar("winner_id"),
  winnerMarblesAwarded: integer("winner_marbles_awarded").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  endedAt: timestamp("ended_at"),
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
  adType: varchar("ad_type").notNull(),
  revenueGenerated: integer("revenue_generated").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerRevenueShare = pgTable("player_revenue_share", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  month: varchar("month").notNull(),
  totalAdRevenue: integer("total_ad_revenue").notNull(),
  sharePercentage: integer("share_percentage").notNull().default(20),
  pointsAwarded: integer("points_awarded").notNull(),
  status: varchar("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournamentConversions = pgTable("tournament_conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  tournamentWindowId: varchar("tournament_window_id").notNull(),
  marblesWon: integer("marbles_won").notNull(),
  pointsAwarded: integer("points_awarded").notNull(),
  status: varchar("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  convertedAt: timestamp("converted_at"),
});

export const feedbackSubmissions = pgTable("feedback_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  type: varchar("type").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  status: varchar("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomCode: varchar("room_code").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderName: varchar("sender_name").notNull(),
  messageType: varchar("message_type").notNull(),
  content: text("content").notNull(),
  duration: integer("duration"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const tournamentParticipants = pgTable("tournament_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  playerId: varchar("player_id").notNull(),
  playerName: varchar("player_name").notNull(),
  profileImage: varchar("profile_image"),
  seed: integer("seed").notNull(),
  status: varchar("status").notNull().default("active"),
  eliminatedInRound: integer("eliminated_in_round"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournamentMatches = pgTable("tournament_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  roundNumber: integer("round_number").notNull(),
  matchNumber: integer("match_number").notNull(),
  player1Id: varchar("player1_id"),
  player1Name: varchar("player1_name"),
  player2Id: varchar("player2_id"),
  player2Name: varchar("player2_name"),
  winnerId: varchar("winner_id"),
  winnerName: varchar("winner_name"),
  player1Score: integer("player1_score").notNull().default(0),
  player2Score: integer("player2_score").notNull().default(0),
  roomCode: varchar("room_code"),
  status: varchar("status").notNull().default("pending"),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  gameType: varchar("game_type").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  marblesWon: integer("marbles_won").notNull().default(0),
  marblesLost: integer("marbles_lost").notNull().default(0),
});

export const adImpressions = pgTable("ad_impressions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  adType: varchar("ad_type").notNull(),
  adCategory: varchar("ad_category"),
  revenueAmount: integer("revenue_amount").notNull().default(0),
  viewedAt: timestamp("viewed_at").defaultNow(),
  clickedAt: timestamp("clicked_at"),
  isClicked: boolean("is_clicked").notNull().default(false),
});

export const dailyUserStats = pgTable("daily_user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: varchar("date").notNull(),
  totalPlaytimeSeconds: integer("total_playtime_seconds").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  adsViewed: integer("ads_viewed").notNull().default(0),
  adsClicked: integer("ads_clicked").notNull().default(0),
  adRevenueGenerated: integer("ad_revenue_generated").notNull().default(0),
  marblesEarned: integer("marbles_earned").notNull().default(0),
  marblesSpent: integer("marbles_spent").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appSettings = pgTable("app_settings", {
  key: varchar("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type CatalogItem = typeof catalogItems.$inferSelect;
export type MarbleTransaction = typeof marbleTransactions.$inferSelect;
export type GamePoint = typeof gamePoints.$inferSelect;
export type TournamentWindow = typeof tournamentWindows.$inferSelect;
export type GameRoom = typeof gameRooms.$inferSelect;
export type PlayerAdRevenue = typeof playerAdRevenue.$inferSelect;
export type PlayerRevenueShare = typeof playerRevenueShare.$inferSelect;
export type TournamentConversion = typeof tournamentConversions.$inferSelect;
export type FeedbackSubmission = typeof feedbackSubmissions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;
export type TournamentMatch = typeof tournamentMatches.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type AdImpression = typeof adImpressions.$inferSelect;
export type DailyUserStats = typeof dailyUserStats.$inferSelect;

export type AppSetting = typeof appSettings.$inferSelect;
