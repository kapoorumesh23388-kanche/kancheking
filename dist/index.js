var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/twilioClient.ts
var twilioClient_exports = {};
__export(twilioClient_exports, {
  getTwilioClient: () => getTwilioClient,
  sendOTPSMS: () => sendOTPSMS,
  sendOTPViaTwilio: () => sendOTPViaTwilio,
  verifyOTPViaTwilio: () => verifyOTPViaTwilio
});
import twilio from "twilio";
async function getClient() {
  if (twilioClient) return twilioClient;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    console.warn("Twilio not configured - TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing");
    return null;
  }
  console.log("Twilio client initialized with Account SID:", accountSid.slice(0, 10) + "...");
  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
}
function formatPhone(phoneNumber) {
  if (phoneNumber.startsWith("+")) return phoneNumber;
  if (phoneNumber.length === 10) return "+91" + phoneNumber;
  if (phoneNumber.length === 12 && phoneNumber.startsWith("91")) return "+" + phoneNumber;
  return phoneNumber;
}
async function sendOTPViaTwilio(phoneNumber) {
  try {
    const client = await getClient();
    if (!client) {
      console.log(`[DEV] Twilio not configured - OTP not sent`);
      return false;
    }
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!serviceSid) {
      console.error("TWILIO_VERIFY_SERVICE_SID missing");
      return false;
    }
    const toPhone = formatPhone(phoneNumber);
    console.log(`Sending OTP via Twilio Verify to: ${toPhone}`);
    await client.verify.v2.services(serviceSid).verifications.create({ to: toPhone, channel: "sms" });
    console.log(`OTP sent successfully to ${toPhone}`);
    return true;
  } catch (error) {
    console.error("Twilio send error:", error);
    return false;
  }
}
async function verifyOTPViaTwilio(phoneNumber, code) {
  try {
    const client = await getClient();
    if (!client) return false;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!serviceSid) return false;
    const toPhone = formatPhone(phoneNumber);
    console.log(`Verifying OTP for: ${toPhone}`);
    const result = await client.verify.v2.services(serviceSid).verificationChecks.create({ to: toPhone, code });
    console.log(`OTP verify status: ${result.status}`);
    return result.status === "approved";
  } catch (error) {
    console.error("Twilio verify error:", error);
    return false;
  }
}
async function sendOTPSMS(phoneNumber, otp) {
  return sendOTPViaTwilio(phoneNumber);
}
async function getTwilioClient() {
  const client = await getClient();
  if (!client) return null;
  return { client, phoneNumber: process.env.TWILIO_PHONE_NUMBER || "" };
}
var twilioClient;
var init_twilioClient = __esm({
  "server/twilioClient.ts"() {
    "use strict";
    twilioClient = null;
  }
});

// server/stripeClient.ts
var stripeClient_exports = {};
__export(stripeClient_exports, {
  getStripePublishableKey: () => getStripePublishableKey,
  getStripeSecretKey: () => getStripeSecretKey,
  getUncachableStripeClient: () => getUncachableStripeClient
});
import Stripe from "stripe";
async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  const connectorName = "stripe";
  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  const targetEnvironment = isProduction ? "production" : "development";
  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", connectorName);
  url.searchParams.set("environment", targetEnvironment);
  const response = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "X_REPLIT_TOKEN": xReplitToken
    }
  });
  const data = await response.json();
  connectionSettings = data.items?.[0];
  if (!connectionSettings || (!connectionSettings.settings.publishable || !connectionSettings.settings.secret)) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }
  return {
    publishableKey: connectionSettings.settings.publishable,
    secretKey: connectionSettings.settings.secret
  };
}
async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, {
    apiVersion: "2025-08-27.basil"
  });
}
async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}
async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
  return secretKey;
}
var connectionSettings;
var init_stripeClient = __esm({
  "server/stripeClient.ts"() {
    "use strict";
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer } from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adImpressions: () => adImpressions,
  adminUsers: () => adminUsers,
  appSettings: () => appSettings,
  catalogItems: () => catalogItems,
  chatMessages: () => chatMessages,
  dailyUserStats: () => dailyUserStats,
  feedbackSubmissions: () => feedbackSubmissions,
  gamePoints: () => gamePoints,
  gameRooms: () => gameRooms,
  gameSessions: () => gameSessions,
  insertUserSchema: () => insertUserSchema,
  marbleTransactions: () => marbleTransactions,
  matchQueue: () => matchQueue,
  playerAdRevenue: () => playerAdRevenue,
  playerRevenueShare: () => playerRevenueShare,
  tournamentConversions: () => tournamentConversions,
  tournamentMatches: () => tournamentMatches,
  tournamentParticipants: () => tournamentParticipants,
  tournamentWindows: () => tournamentWindows,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
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
  lastActiveAt: timestamp("last_active_at")
});
var adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var catalogItems = pgTable("catalog_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  imageUrl: varchar("image_url"),
  category: varchar("category").default("gift"),
  createdAt: timestamp("created_at").defaultNow()
});
var marbleTransactions = pgTable("marble_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: varchar("type").notNull(),
  description: text("description"),
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").defaultNow()
});
var gamePoints = pgTable("game_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  points: integer("points").notNull(),
  gameType: varchar("game_type").notNull(),
  opponent: varchar("opponent"),
  won: boolean("won").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var tournamentWindows = pgTable("tournament_windows", {
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
  endedAt: timestamp("ended_at")
});
var gameRooms = pgTable("game_rooms", {
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
  createdAt: timestamp("created_at").defaultNow()
});
var matchQueue = pgTable("match_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  username: varchar("username").notNull(),
  marbles: integer("marbles").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var playerAdRevenue = pgTable("player_ad_revenue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  adType: varchar("ad_type").notNull(),
  revenueGenerated: integer("revenue_generated").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var playerRevenueShare = pgTable("player_revenue_share", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  month: varchar("month").notNull(),
  totalAdRevenue: integer("total_ad_revenue").notNull(),
  sharePercentage: integer("share_percentage").notNull().default(20),
  pointsAwarded: integer("points_awarded").notNull(),
  status: varchar("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});
var tournamentConversions = pgTable("tournament_conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  tournamentWindowId: varchar("tournament_window_id").notNull(),
  marblesWon: integer("marbles_won").notNull(),
  pointsAwarded: integer("points_awarded").notNull(),
  status: varchar("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  convertedAt: timestamp("converted_at")
});
var feedbackSubmissions = pgTable("feedback_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  type: varchar("type").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  status: varchar("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});
var chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomCode: varchar("room_code").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderName: varchar("sender_name").notNull(),
  messageType: varchar("message_type").notNull(),
  content: text("content").notNull(),
  duration: integer("duration"),
  timestamp: timestamp("timestamp").defaultNow()
});
var tournamentParticipants = pgTable("tournament_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  playerId: varchar("player_id").notNull(),
  playerName: varchar("player_name").notNull(),
  profileImage: varchar("profile_image"),
  seed: integer("seed").notNull(),
  status: varchar("status").notNull().default("active"),
  eliminatedInRound: integer("eliminated_in_round"),
  createdAt: timestamp("created_at").defaultNow()
});
var tournamentMatches = pgTable("tournament_matches", {
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
  createdAt: timestamp("created_at").defaultNow()
});
var gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  gameType: varchar("game_type").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  marblesWon: integer("marbles_won").notNull().default(0),
  marblesLost: integer("marbles_lost").notNull().default(0)
});
var adImpressions = pgTable("ad_impressions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  adType: varchar("ad_type").notNull(),
  adCategory: varchar("ad_category"),
  revenueAmount: integer("revenue_amount").notNull().default(0),
  viewedAt: timestamp("viewed_at").defaultNow(),
  clickedAt: timestamp("clicked_at"),
  isClicked: boolean("is_clicked").notNull().default(false)
});
var dailyUserStats = pgTable("daily_user_stats", {
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
  createdAt: timestamp("created_at").defaultNow()
});
var appSettings = pgTable("app_settings", {
  key: varchar("key").primaryKey(),
  value: text("value").notNull().default("")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

// server/storage.ts
import { randomUUID } from "crypto";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var MemStorage = class {
  users;
  catalogItems;
  transactions;
  gamePoints;
  tournamentWindows;
  gameRooms;
  matchQueue;
  feedbackSubmissions;
  adminUsers;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.catalogItems = /* @__PURE__ */ new Map();
    this.transactions = [];
    this.gamePoints = [];
    this.tournamentWindows = /* @__PURE__ */ new Map();
    this.gameRooms = /* @__PURE__ */ new Map();
    this.matchQueue = /* @__PURE__ */ new Map();
    this.feedbackSubmissions = [];
    this.adminUsers = /* @__PURE__ */ new Map();
    this.adminUsers.set("admin", {
      id: randomUUID(),
      adminId: "admin",
      password: "admin123",
      createdAt: /* @__PURE__ */ new Date()
    });
    const window = {
      id: randomUUID(),
      windowNumber: 1,
      playerCount: 0,
      status: "waiting",
      maxPlayers: 100,
      entryFee: 2500,
      prizePool: 0,
      winnerId: null,
      winnerMarblesAwarded: 0,
      createdAt: /* @__PURE__ */ new Date(),
      endedAt: null
    };
    this.tournamentWindows.set(window.id, window);
  }
  async getUser(id) {
    const cached = this.users.get(id);
    if (cached) return cached;
    try {
      let [user] = await db.select().from(users).where(eq(users.id, id));
      if (!user) {
        [user] = await db.select().from(users).where(eq(users.username, id));
      }
      if (user) this.users.set(user.id, user);
      return user;
    } catch {
      return void 0;
    }
  }
  async getUserByEmail(email) {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (user) this.users.set(user.id, user);
      return user;
    } catch {
      return void 0;
    }
  }
  async getUserByUsername(username) {
    const cached = Array.from(this.users.values()).find((u) => u.username === username);
    if (cached) return cached;
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      if (user) this.users.set(user.id, user);
      return user;
    } catch {
      return void 0;
    }
  }
  async getUserByReferralCode(code) {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === code
    );
  }
  async getAllUsers() {
    try {
      const dbUsers = await db.select().from(users);
      dbUsers.forEach((u) => this.users.set(u.id, u));
      return dbUsers;
    } catch {
      return Array.from(this.users.values());
    }
  }
  async createUser(insertUser, referralCode, customId) {
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
      createdAt: /* @__PURE__ */ new Date(),
      lastActiveAt: null
    };
    try {
      const [dbUser] = await db.insert(users).values(userData).returning();
      this.users.set(id, dbUser);
      return dbUser;
    } catch (err) {
      if (err.code === "23505") {
        const existing = await this.getUserByUsername(insertUser.username);
        if (existing) return existing;
      }
      this.users.set(id, userData);
      return userData;
    }
  }
  async updateUserMarbles(userId, marbles) {
    try {
      const [updated] = await db.update(users).set({ marbles }).where(eq(users.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        user.marbles = marbles;
        this.users.set(userId, user);
        return user;
      }
      return void 0;
    }
  }
  async updateUserPoints(userId, points) {
    try {
      const [updated] = await db.update(users).set({ points }).where(eq(users.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        user.points = points;
        this.users.set(userId, user);
        return user;
      }
      return void 0;
    }
  }
  async updateUserStats(userId, stats) {
    try {
      const updateData = {};
      if (stats.gamesWon !== void 0) updateData.gamesWon = stats.gamesWon;
      if (stats.gamesPlayed !== void 0) updateData.gamesPlayed = stats.gamesPlayed;
      const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        if (stats.gamesWon !== void 0) user.gamesWon = stats.gamesWon;
        if (stats.gamesPlayed !== void 0) user.gamesPlayed = stats.gamesPlayed;
        this.users.set(userId, user);
        return user;
      }
      return void 0;
    }
  }
  async updateUserProfile(userId, profile) {
    try {
      const updateData = {};
      if (profile.displayName !== void 0) updateData.displayName = profile.displayName;
      if (profile.profileImage !== void 0) updateData.profileImage = profile.profileImage;
      if (profile.gender !== void 0) updateData.gender = profile.gender;
      if (profile.email !== void 0) updateData.email = profile.email;
      const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        if (profile.displayName !== void 0) user.displayName = profile.displayName;
        if (profile.profileImage !== void 0) user.profileImage = profile.profileImage;
        if (profile.gender !== void 0) user.gender = profile.gender;
        this.users.set(userId, user);
        return user;
      }
      return void 0;
    }
  }
  async updateUserOnboarding(userId, data) {
    try {
      const updateData = { lastActiveAt: /* @__PURE__ */ new Date() };
      if (data.displayName !== void 0) updateData.displayName = data.displayName;
      if (data.dateOfBirth !== void 0) updateData.dateOfBirth = data.dateOfBirth;
      if (data.isAgeVerified !== void 0) updateData.isAgeVerified = data.isAgeVerified;
      const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        if (data.displayName !== void 0) user.displayName = data.displayName;
        user.lastActiveAt = /* @__PURE__ */ new Date();
        this.users.set(userId, user);
        return user;
      }
      return void 0;
    }
  }
  async incrementAiWins(userId) {
    try {
      const current = await this.getUser(userId);
      if (!current) return void 0;
      const [updated] = await db.update(users).set({ aiWins: (current.aiWins || 0) + 1 }).where(eq(users.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        user.aiWins = (user.aiWins || 0) + 1;
        this.users.set(userId, user);
        return user;
      }
      return void 0;
    }
  }
  async addEarnedMarbles(userId, amount) {
    try {
      const current = await this.getUser(userId);
      if (!current) return void 0;
      const newMarbles = (current.marbles || 0) + amount;
      const newEarned = (current.earnedMarbles || 0) + amount;
      const [updated] = await db.update(users).set({ marbles: newMarbles, earnedMarbles: newEarned }).where(eq(users.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        user.marbles = (user.marbles || 0) + amount;
        user.earnedMarbles = (user.earnedMarbles || 0) + amount;
        this.users.set(userId, user);
        return user;
      }
      return void 0;
    }
  }
  async updateEarnedMarbles(userId, earnedMarbles) {
    try {
      const [updated] = await db.update(users).set({ earnedMarbles }).where(eq(users.id, userId)).returning();
      if (updated) this.users.set(userId, updated);
      return updated;
    } catch {
      const user = this.users.get(userId);
      if (user) {
        user.earnedMarbles = earnedMarbles;
        this.users.set(userId, user);
        return user;
      }
      return void 0;
    }
  }
  async getCatalogItems() {
    try {
      const items = await db.select().from(catalogItems);
      return items;
    } catch (error) {
      console.error("Error fetching catalog items from DB:", error);
      return [];
    }
  }
  async addCatalogItem(item) {
    try {
      const [newItem] = await db.insert(catalogItems).values({
        name: item.name,
        description: item.description,
        pointsCost: item.pointsCost,
        imageUrl: item.imageUrl
      }).returning();
      return newItem;
    } catch (error) {
      console.error("Error adding catalog item to DB:", error);
      throw error;
    }
  }
  async deleteCatalogItem(id) {
    try {
      await db.delete(catalogItems).where(eq(catalogItems.id, id));
    } catch (error) {
      console.error("Error deleting catalog item from DB:", error);
      throw error;
    }
  }
  async updateCatalogItem(id, item) {
    try {
      const [updatedItem] = await db.update(catalogItems).set(item).where(eq(catalogItems.id, id)).returning();
      return updatedItem;
    } catch (error) {
      console.error("Error updating catalog item in DB:", error);
      throw error;
    }
  }
  async recordTransaction(tx) {
    const transaction = {
      ...tx,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date()
    };
    this.transactions.push(transaction);
    return transaction;
  }
  async getUserTransactions(userId) {
    return this.transactions.filter((tx) => tx.userId === userId);
  }
  async getTransactionByExternalId(externalId) {
    return this.transactions.find((tx) => tx.transactionId === externalId);
  }
  async addGamePoints(points) {
    const gamePoint = {
      ...points,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date()
    };
    this.gamePoints.push(gamePoint);
    return gamePoint;
  }
  async getUserGamePoints(userId) {
    return this.gamePoints.filter((gp) => gp.userId === userId);
  }
  async getTournamentWindows() {
    return Array.from(this.tournamentWindows.values());
  }
  async getActiveTournamentWindow() {
    const windows = Array.from(this.tournamentWindows.values());
    return windows.find((w) => w.status === "waiting" && w.playerCount < w.maxPlayers);
  }
  async addTournamentWindow(window) {
    const newWindow = {
      ...window,
      id: randomUUID(),
      winnerId: null,
      winnerMarblesAwarded: 0,
      endedAt: null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.tournamentWindows.set(newWindow.id, newWindow);
    return newWindow;
  }
  async updateTournamentPlayerCount(windowId, count) {
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
          endedAt: null
        });
      }
      this.tournamentWindows.set(windowId, window);
    }
  }
  async createGameRoom(creatorId, gameMode) {
    const roomCode = `ROOM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const creator = this.users.get(creatorId);
    const room = {
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
      createdAt: /* @__PURE__ */ new Date()
    };
    this.gameRooms.set(roomCode, room);
    return room;
  }
  async getGameRoom(roomCode) {
    return this.gameRooms.get(roomCode);
  }
  async joinGameRoom(roomCode, playerId) {
    const room = this.gameRooms.get(roomCode);
    if (room && room.status === "waiting" && !room.player2Id) {
      const player = this.users.get(playerId);
      room.player2Id = playerId;
      room.player2Marbles = player?.marbles || 0;
      room.status = "active";
      this.gameRooms.set(roomCode, room);
      return room;
    }
    return void 0;
  }
  async findMatchingPlayer(userId) {
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
  async addToMatchQueue(userId, username, marbles) {
    this.matchQueue.set(userId, { userId, username, marbles });
  }
  async removeFromMatchQueue(userId) {
    this.matchQueue.delete(userId);
  }
  async getUsersInMatchQueue() {
    return Array.from(this.matchQueue.values()).map((entry) => ({
      userId: entry.userId,
      username: entry.username,
      marbles: entry.marbles
    }));
  }
  async addFeedbackSubmission(feedback) {
    const id = randomUUID();
    const submission = {
      ...feedback,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.feedbackSubmissions.push(submission);
    return submission;
  }
  async getFeedbackSubmissions() {
    return this.feedbackSubmissions;
  }
  async createOrUpdateAdmin(adminId, password) {
    const admin = {
      id: randomUUID(),
      adminId,
      password,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.adminUsers.set(adminId, admin);
    return admin;
  }
  async getAdminByIdAndPassword(adminId, password) {
    const admin = this.adminUsers.get(adminId);
    if (admin && admin.password === password) {
      return admin;
    }
    return void 0;
  }
  async updateAdminPassword(adminId, oldPassword, newPassword) {
    const admin = this.adminUsers.get(adminId);
    if (admin && admin.password === oldPassword) {
      admin.password = newPassword;
      this.adminUsers.set(adminId, admin);
      return true;
    }
    return false;
  }
  adminPhones = /* @__PURE__ */ new Map([["admin", "9211979518"]]);
  otpStore = /* @__PURE__ */ new Map();
  async updateAdminPhone(adminId, phoneNumber) {
    this.adminPhones.set(adminId, phoneNumber);
  }
  async getAdminPhone(adminId) {
    return this.adminPhones.get(adminId);
  }
  async saveOTP(adminId, otp) {
    this.otpStore.set(adminId, { otp, timestamp: Date.now() });
  }
  async verifyOTP(adminId, otp) {
    const stored = this.otpStore.get(adminId);
    if (!stored) return false;
    const isExpired = Date.now() - stored.timestamp > 5 * 60 * 1e3;
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
  async updateUserStripeInfo(userId, stripeInfo) {
    const user = this.users.get(userId);
    if (user) {
      if (stripeInfo.stripeCustomerId) user.stripeCustomerId = stripeInfo.stripeCustomerId;
      if (stripeInfo.stripeSubscriptionId) user.stripeSubscriptionId = stripeInfo.stripeSubscriptionId;
      this.users.set(userId, user);
      return user;
    }
    return void 0;
  }
  async setUserAsAdmin(userId, isAdmin) {
    const user = this.users.get(userId);
    if (user) {
      user.isAdmin = isAdmin;
      this.users.set(userId, user);
      return user;
    }
    return void 0;
  }
  async getProduct(productId) {
    return { id: productId, name: "Marble Pack" };
  }
  async getSubscription(subscriptionId) {
    return { id: subscriptionId };
  }
  // Analytics tracking
  gameSessions = /* @__PURE__ */ new Map();
  adImpressions = /* @__PURE__ */ new Map();
  dailyUserStats = /* @__PURE__ */ new Map();
  async startGameSession(userId, gameType) {
    const sessionId = randomUUID();
    this.gameSessions.set(sessionId, {
      id: sessionId,
      userId,
      gameType,
      startedAt: /* @__PURE__ */ new Date(),
      endedAt: null,
      durationSeconds: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      marblesWon: 0,
      marblesLost: 0
    });
    return { sessionId };
  }
  async endGameSession(sessionId, stats) {
    const session = this.gameSessions.get(sessionId);
    if (session) {
      const endedAt = /* @__PURE__ */ new Date();
      const durationSeconds = Math.floor((endedAt.getTime() - new Date(session.startedAt).getTime()) / 1e3);
      session.endedAt = endedAt;
      session.durationSeconds = durationSeconds;
      session.gamesPlayed = stats.gamesPlayed;
      session.gamesWon = stats.gamesWon;
      session.marblesWon = stats.marblesWon;
      session.marblesLost = stats.marblesLost;
      this.gameSessions.set(sessionId, session);
      const date = endedAt.toISOString().split("T")[0];
      await this.updateDailyUserStats(session.userId, date, {
        totalPlaytimeSeconds: durationSeconds,
        gamesPlayed: stats.gamesPlayed,
        gamesWon: stats.gamesWon,
        marblesEarned: stats.marblesWon,
        marblesSpent: stats.marblesLost
      });
    }
  }
  async recordAdImpression(userId, adType, adCategory, revenueAmount) {
    const id = randomUUID();
    this.adImpressions.set(id, {
      id,
      userId,
      adType,
      adCategory,
      revenueAmount,
      viewedAt: /* @__PURE__ */ new Date(),
      clickedAt: null,
      isClicked: false
    });
    const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    await this.updateDailyUserStats(userId, date, {
      adsViewed: 1,
      adRevenueGenerated: revenueAmount
    });
  }
  async recordAdClick(impressionId) {
    const impression = this.adImpressions.get(impressionId);
    if (impression) {
      impression.clickedAt = /* @__PURE__ */ new Date();
      impression.isClicked = true;
      this.adImpressions.set(impressionId, impression);
      const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      await this.updateDailyUserStats(impression.userId, date, {
        adsClicked: 1
      });
    }
  }
  async getDailyUserStats(userId, date) {
    const key = `${userId}_${date}`;
    return this.dailyUserStats.get(key);
  }
  async updateDailyUserStats(userId, date, stats) {
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
        createdAt: /* @__PURE__ */ new Date()
      };
    }
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
  async getEngagementAnalytics() {
    const allDailyStats = Array.from(this.dailyUserStats.values());
    const dateAggregates = {};
    allDailyStats.forEach((stat) => {
      if (!dateAggregates[stat.date]) {
        dateAggregates[stat.date] = {
          date: stat.date,
          totalUsers: 0,
          totalPlaytimeSeconds: 0,
          totalGamesPlayed: 0,
          totalAdsViewed: 0,
          totalAdRevenue: 0
        };
      }
      dateAggregates[stat.date].totalUsers++;
      dateAggregates[stat.date].totalPlaytimeSeconds += stat.totalPlaytimeSeconds;
      dateAggregates[stat.date].totalGamesPlayed += stat.gamesPlayed;
      dateAggregates[stat.date].totalAdsViewed += stat.adsViewed;
      dateAggregates[stat.date].totalAdRevenue += stat.adRevenueGenerated;
    });
    const dailyStats = Object.values(dateAggregates).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 30);
    const userAggregates = {};
    allDailyStats.forEach((stat) => {
      if (!userAggregates[stat.userId]) {
        userAggregates[stat.userId] = {
          userId: stat.userId,
          totalPlaytimeSeconds: 0,
          totalGamesPlayed: 0,
          totalAdsViewed: 0,
          totalAdRevenue: 0
        };
      }
      userAggregates[stat.userId].totalPlaytimeSeconds += stat.totalPlaytimeSeconds;
      userAggregates[stat.userId].totalGamesPlayed += stat.gamesPlayed;
      userAggregates[stat.userId].totalAdsViewed += stat.adsViewed;
      userAggregates[stat.userId].totalAdRevenue += stat.adRevenueGenerated;
    });
    const topUsers = Object.values(userAggregates).sort((a, b) => b.totalPlaytimeSeconds - a.totalPlaytimeSeconds).slice(0, 20);
    for (const user of topUsers) {
      const userData = await this.getUser(user.userId);
      user.displayName = userData?.displayName || userData?.username || "Unknown";
    }
    const adTypeStats = {};
    Array.from(this.adImpressions.values()).forEach((ad) => {
      if (!adTypeStats[ad.adType]) {
        adTypeStats[ad.adType] = {
          adType: ad.adType,
          impressions: 0,
          clicks: 0,
          revenue: 0
        };
      }
      adTypeStats[ad.adType].impressions++;
      if (ad.isClicked) adTypeStats[ad.adType].clicks++;
      adTypeStats[ad.adType].revenue += ad.revenueAmount;
    });
    const adStats = Object.values(adTypeStats);
    return { dailyStats, topUsers, adStats };
  }
  // Tournament Bracket Methods
  tournamentParticipants = /* @__PURE__ */ new Map();
  tournamentMatches = /* @__PURE__ */ new Map();
  async getTournamentParticipants(tournamentId) {
    return this.tournamentParticipants.get(tournamentId) || [];
  }
  async addTournamentParticipant(participant) {
    const id = randomUUID();
    const newParticipant = { ...participant, id, createdAt: /* @__PURE__ */ new Date() };
    const participants = this.tournamentParticipants.get(participant.tournamentId) || [];
    participants.push(newParticipant);
    this.tournamentParticipants.set(participant.tournamentId, participants);
    return newParticipant;
  }
  async getTournamentMatches(tournamentId) {
    return Array.from(this.tournamentMatches.values()).filter((m) => m.tournamentId === tournamentId);
  }
  async getTournamentMatch(matchId) {
    return this.tournamentMatches.get(matchId);
  }
  async createTournamentMatch(match) {
    const id = randomUUID();
    const newMatch = { ...match, id, createdAt: /* @__PURE__ */ new Date() };
    this.tournamentMatches.set(id, newMatch);
    return newMatch;
  }
  async updateTournamentMatch(matchId, updates) {
    const match = this.tournamentMatches.get(matchId);
    if (match) {
      const updated = { ...match, ...updates };
      this.tournamentMatches.set(matchId, updated);
      return updated;
    }
    return null;
  }
  async updateTournamentStatus(tournamentId, status) {
    const window = this.tournamentWindows.get(tournamentId);
    if (window) {
      window.status = status;
      this.tournamentWindows.set(tournamentId, window);
    }
  }
  async setTournamentWinner(tournamentId, winnerId, winnerName) {
    const window = this.tournamentWindows.get(tournamentId);
    if (window) {
      window.winnerId = winnerId;
      window.status = "completed";
      window.endedAt = /* @__PURE__ */ new Date();
      this.tournamentWindows.set(tournamentId, window);
    }
  }
};
var storage = new MemStorage();

// server/emailService.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});
var otpStore = /* @__PURE__ */ new Map();
function generateOTP() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}
async function sendLoginOTPEmail(email, otp) {
  try {
    await transporter.sendMail({
      from: `"Kanche King" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Kanche King \u2014 Login OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #1a0a2e; color: #fff; padding: 30px; border-radius: 12px;">
          <h2 style="color: #a855f7; text-align: center;">\u{1F3AE} Kanche King</h2>
          <p>Your login OTP is:</p>
          <div style="background: #2d1b69; border: 2px solid #a855f7; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #f0abfc; font-size: 40px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #aaa;">Valid for <strong>10 minutes</strong>. Do not share this OTP.</p>
        </div>
      `
    });
    otpStore.set(`login:${email}`, { otp, expiresAt: Date.now() + 10 * 60 * 1e3, type: "login" });
    return true;
  } catch (err) {
    console.error("[sendLoginOTPEmail] Error:", err);
    return false;
  }
}
function verifyLoginOTP(email, otp) {
  const key = `login:${email}`;
  const entry = otpStore.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return false;
  }
  if (entry.otp !== otp) return false;
  otpStore.delete(key);
  return true;
}

// server/ws-manager.ts
var connectedPlayers = /* @__PURE__ */ new Map();
var roomConnections = /* @__PURE__ */ new Map();
var onlinePlayers = /* @__PURE__ */ new Map();
var rooms = /* @__PURE__ */ new Map();
function handleNewConnection(ws2) {
  let currentPlayerId = "";
  let currentRoomCode = "";
  ws2.on("message", (data) => {
    try {
      const message = JSON.parse(data);
      if (message.type === "presence") {
        currentPlayerId = message.playerId;
        const playerData = message.data || {};
        onlinePlayers.set(currentPlayerId, {
          ws: ws2,
          playerId: currentPlayerId,
          roomCode: "",
          playerName: playerData.name || `Player_${currentPlayerId.slice(-6)}`,
          marbles: playerData.marbles || 0,
          profileImage: playerData.profileImage,
          currentMode: playerData.currentMode || "lobby",
          lastSeen: Date.now()
        });
        console.log(`[PRESENCE] ${playerData.name || currentPlayerId} is online (mode: ${playerData.currentMode})`);
        ws2.send(JSON.stringify({
          type: "presence_ack",
          playerId: currentPlayerId,
          data: { online: true }
        }));
      } else if (message.type === "get_online_players") {
        const players = Array.from(onlinePlayers.values()).filter((p) => p.playerId !== message.playerId).map((p) => ({
          id: p.playerId,
          name: p.playerName,
          marbles: p.marbles,
          profileImage: p.profileImage,
          currentMode: p.currentMode
        }));
        ws2.send(JSON.stringify({
          type: "online_players",
          playerId: message.playerId,
          data: { players, total: onlinePlayers.size }
        }));
      } else if (message.type === "challenge") {
        const targetId = message.data.targetPlayerId;
        if (targetId === message.playerId) {
          ws2.send(JSON.stringify({
            type: "challenge_failed",
            playerId: message.playerId,
            data: { error: "Cannot challenge yourself", targetPlayerId: targetId }
          }));
          console.log(`[CHALLENGE] ${message.playerId} tried to self-challenge - blocked`);
          return;
        }
        const target = onlinePlayers.get(targetId);
        if (target && target.ws.readyState === 1) {
          const challenger = onlinePlayers.get(message.playerId);
          target.ws.send(JSON.stringify({
            type: "challenge_received",
            playerId: message.playerId,
            data: {
              challengerId: message.playerId,
              challengerName: challenger?.playerName || "Unknown",
              challengerMarbles: challenger?.marbles || 0,
              challengerImage: challenger?.profileImage,
              roomCode: message.data.roomCode
            }
          }));
          console.log(`[CHALLENGE] ${message.playerId} challenged ${targetId}`);
        } else {
          ws2.send(JSON.stringify({
            type: "challenge_failed",
            playerId: message.playerId,
            data: { error: "Player is offline", targetPlayerId: targetId }
          }));
        }
      } else if (message.type === "challenge_response") {
        const challengerId = message.data.challengerId;
        const roomCode = message.data.roomCode;
        const challenger = onlinePlayers.get(challengerId);
        const responder = onlinePlayers.get(message.playerId);
        if (message.data.accepted && roomCode && challenger && responder) {
          const challengerInfo = {
            ws: challenger.ws,
            playerId: challengerId,
            roomCode,
            playerName: challenger.playerName || "Challenger",
            marbles: challenger.marbles || 150,
            profileImage: challenger.profileImage,
            lastSeen: Date.now(),
            isCreator: true
          };
          rooms.set(roomCode, {
            players: /* @__PURE__ */ new Map([[challengerId, challengerInfo]]),
            creatorId: challengerId,
            gameState: {
              phase: "waiting",
              currentHider: challengerId,
              // Challenger hides first
              hiddenMarbles: 0,
              currentBet: 10,
              lastGuess: ""
            },
            pendingDisconnects: /* @__PURE__ */ new Map()
          });
          if (!roomConnections.has(roomCode)) {
            roomConnections.set(roomCode, /* @__PURE__ */ new Set());
          }
          roomConnections.get(roomCode).add(challengerId);
          roomConnections.get(roomCode).add(message.playerId);
          console.log(`[CHALLENGE] Pre-created room ${roomCode} for challenge match`);
        }
        if (challenger && challenger.ws.readyState === 1) {
          challenger.ws.send(JSON.stringify({
            type: "challenge_result",
            playerId: message.playerId,
            data: {
              accepted: message.data.accepted,
              responderId: message.playerId,
              responderName: responder?.playerName,
              roomCode
            }
          }));
          console.log(`[CHALLENGE RESPONSE] ${message.playerId} ${message.data.accepted ? "accepted" : "declined"} challenge from ${challengerId}`);
        }
      } else if (message.type === "join_room") {
        currentPlayerId = message.playerId;
        currentRoomCode = message.roomCode || "";
        const playerData = message.data || {};
        const playerInfo = {
          ws: ws2,
          playerId: currentPlayerId,
          roomCode: currentRoomCode,
          playerName: playerData.playerName || `Player_${Math.floor(Math.random() * 1e4)}`,
          marbles: playerData.marbles || 150,
          profileImage: playerData.profileImage,
          lastSeen: Date.now(),
          isCreator: playerData.isCreator || false
        };
        connectedPlayers.set(currentPlayerId, playerInfo);
        if (currentRoomCode) {
          if (!roomConnections.has(currentRoomCode)) {
            roomConnections.set(currentRoomCode, /* @__PURE__ */ new Set());
          }
          roomConnections.get(currentRoomCode).add(currentPlayerId);
          if (playerData.isCreator) {
            rooms.set(currentRoomCode, {
              players: /* @__PURE__ */ new Map([[currentPlayerId, playerInfo]]),
              creatorId: currentPlayerId,
              gameState: {
                phase: "waiting",
                currentHider: currentPlayerId,
                hiddenMarbles: 0,
                currentBet: 10,
                lastGuess: ""
              },
              pendingDisconnects: /* @__PURE__ */ new Map()
            });
            console.log(`[ROOM] Room ${currentRoomCode} created by ${playerInfo.playerName}`);
          } else {
            const room = rooms.get(currentRoomCode);
            if (room) {
              if (room.pendingDisconnects.has(currentPlayerId)) {
                clearTimeout(room.pendingDisconnects.get(currentPlayerId));
                room.pendingDisconnects.delete(currentPlayerId);
                console.log(`[RECONNECT] Player ${playerInfo.playerName} reconnected via join_room to ${currentRoomCode}`);
              }
              room.players.set(currentPlayerId, playerInfo);
              const allPlayersInRoom = Array.from(room.players.values());
              const otherPlayers = allPlayersInRoom.filter((p) => p.playerId !== currentPlayerId);
              otherPlayers.forEach((player) => {
                if (player.ws.readyState === 1) {
                  player.ws.send(JSON.stringify({
                    type: "player_joined",
                    roomCode: currentRoomCode,
                    playerId: currentPlayerId,
                    data: {
                      playerName: playerInfo.playerName,
                      marbles: playerInfo.marbles,
                      profileImage: playerInfo.profileImage,
                      playerCount: room.players.size
                    }
                  }));
                }
              });
              ws2.send(JSON.stringify({
                type: "room_info",
                roomCode: currentRoomCode,
                playerId: currentPlayerId,
                data: {
                  players: allPlayersInRoom.map((p) => ({
                    id: p.playerId,
                    name: p.playerName,
                    marbles: p.marbles,
                    profileImage: p.profileImage,
                    isCreator: p.isCreator
                  })),
                  gameState: room.gameState
                }
              }));
              console.log(`[ROOM] ${playerInfo.playerName} joined room ${currentRoomCode}`);
              if (room.players.size >= 2) {
                broadcastToRoom(currentRoomCode, {
                  type: "room_ready",
                  roomCode: currentRoomCode,
                  playerId: "system",
                  data: {
                    players: allPlayersInRoom.map((p) => ({
                      id: p.playerId,
                      name: p.playerName,
                      marbles: p.marbles,
                      profileImage: p.profileImage,
                      isCreator: p.isCreator
                    })),
                    phase: "selecting"
                  }
                });
              }
            }
          }
        }
      } else if (message.type === "join") {
        currentPlayerId = message.playerId;
        currentRoomCode = message.roomCode || "";
        const playerData = message.data || {};
        const playerInfo = {
          ws: ws2,
          playerId: currentPlayerId,
          roomCode: currentRoomCode,
          playerName: playerData.playerName || onlinePlayers.get(currentPlayerId)?.playerName || `Player_${Math.floor(Math.random() * 1e4)}`,
          marbles: playerData.marbles || onlinePlayers.get(currentPlayerId)?.marbles || 150,
          profileImage: playerData.profileImage || onlinePlayers.get(currentPlayerId)?.profileImage,
          lastSeen: Date.now()
        };
        connectedPlayers.set(currentPlayerId, playerInfo);
        if (currentRoomCode) {
          if (!roomConnections.has(currentRoomCode)) {
            roomConnections.set(currentRoomCode, /* @__PURE__ */ new Set());
          }
          roomConnections.get(currentRoomCode).add(currentPlayerId);
          let room = rooms.get(currentRoomCode);
          if (!room) {
            room = {
              players: /* @__PURE__ */ new Map(),
              creatorId: currentPlayerId,
              gameState: {
                phase: "waiting",
                currentHider: currentPlayerId,
                hiddenMarbles: 0,
                currentBet: 10,
                lastGuess: ""
              },
              pendingDisconnects: /* @__PURE__ */ new Map()
            };
            rooms.set(currentRoomCode, room);
          }
          const isReconnecting = room.pendingDisconnects.has(currentPlayerId);
          if (isReconnecting) {
            clearTimeout(room.pendingDisconnects.get(currentPlayerId));
            room.pendingDisconnects.delete(currentPlayerId);
            console.log(`[RECONNECT] Player ${playerInfo.playerName} reconnected to room ${currentRoomCode}`);
          }
          room.players.set(currentPlayerId, playerInfo);
          const allPlayersInRoomForSync = Array.from(room.players.values());
          ws2.send(JSON.stringify({
            type: "game_sync",
            roomCode: currentRoomCode,
            playerId: currentPlayerId,
            data: {
              phase: room.gameState.phase,
              currentHider: room.gameState.currentHider,
              players: allPlayersInRoomForSync.map((p) => ({
                id: p.playerId,
                name: p.playerName,
                marbles: p.marbles,
                profileImage: p.profileImage
              })),
              isReconnecting
            }
          }));
          const allPlayersInRoom = Array.from(room.players.values());
          broadcastToRoom(currentRoomCode, {
            type: "player_joined",
            roomCode: currentRoomCode,
            playerId: currentPlayerId,
            data: {
              playerName: playerInfo.playerName,
              marbles: playerInfo.marbles,
              profileImage: playerInfo.profileImage,
              playerCount: roomConnections.get(currentRoomCode).size,
              allPlayers: allPlayersInRoom.map((p) => ({
                id: p.playerId,
                name: p.playerName,
                marbles: p.marbles,
                profileImage: p.profileImage
              }))
            }
          });
          if (room.players.size >= 2) {
            room.gameState.phase = "selecting";
            broadcastToRoom(currentRoomCode, {
              type: "game_start",
              roomCode: currentRoomCode,
              playerId: "system",
              data: {
                phase: "selecting",
                players: allPlayersInRoom.map((p) => ({
                  id: p.playerId,
                  name: p.playerName,
                  marbles: p.marbles,
                  profileImage: p.profileImage
                })),
                currentHider: room.gameState.currentHider
              }
            });
          }
        }
        console.log(`[ROOM] Player ${playerInfo.playerName} joined room ${currentRoomCode} (${roomConnections.get(currentRoomCode)?.size || 0} players)`);
      } else if (message.type === "request_sync") {
        const syncRoomCode = message.roomCode || currentRoomCode;
        if (message.roomCode) {
          currentRoomCode = message.roomCode;
        }
        const syncRoom = rooms.get(syncRoomCode);
        if (syncRoom) {
          if (syncRoom.players.has(currentPlayerId)) {
            syncRoom.players.get(currentPlayerId).ws = ws2;
            syncRoom.players.get(currentPlayerId).lastSeen = Date.now();
          }
          const allPlayers = Array.from(syncRoom.players.values());
          ws2.send(JSON.stringify({
            type: "game_sync",
            roomCode: syncRoomCode,
            playerId: currentPlayerId,
            data: {
              phase: syncRoom.gameState.phase,
              currentHider: syncRoom.gameState.currentHider,
              hiddenMarbles: syncRoom.gameState.hiddenMarbles,
              players: allPlayers.map((p) => ({
                id: p.playerId,
                name: p.playerName,
                marbles: p.marbles,
                profileImage: p.profileImage
              }))
            }
          }));
          console.log(`[SYNC] Sent game_sync to ${currentPlayerId} in room ${syncRoomCode}, phase: ${syncRoom.gameState.phase}`);
        }
      } else if (message.type === "game_action") {
        const roomCode = message.roomCode || currentRoomCode;
        if (message.roomCode) {
          currentRoomCode = message.roomCode;
        }
        const room = rooms.get(roomCode);
        if (!room) {
          console.log(`[GAME_ACTION] Room ${roomCode} not found`);
          return;
        }
        if (room.players.has(currentPlayerId)) {
          room.players.get(currentPlayerId).ws = ws2;
          room.players.get(currentPlayerId).lastSeen = Date.now();
        }
        const action = message.data.action;
        if (action === "hide_marbles") {
          room.gameState.hiddenMarbles = message.data.count;
          room.gameState.phase = "guessing";
          console.log(`[GAME] ${currentPlayerId} hid ${message.data.count} marbles in room ${roomCode}`);
          broadcastToRoom(roomCode, {
            type: "game_state_update",
            roomCode,
            playerId: currentPlayerId,
            data: {
              phase: "guessing",
              hiddenBy: currentPlayerId,
              hiddenCount: message.data.count
              // Will be revealed later
            }
          });
        } else if (action === "guess") {
          const guess = message.data.guess;
          const bet = message.data.bet;
          const hiddenCount = room.gameState.hiddenMarbles;
          const isOdd = hiddenCount % 2 === 1;
          const guessedOdd = guess === "kali";
          const won = isOdd === guessedOdd;
          console.log(`[GAME] Hidden: ${hiddenCount}, isOdd: ${isOdd}, guess: ${guess}, guessedOdd: ${guessedOdd}, won: ${won}`);
          room.gameState.currentBet = bet;
          const guesserPlayer = connectedPlayers.get(currentPlayerId);
          broadcastToRoom(roomCode, {
            type: "opponent_bet",
            roomCode,
            playerId: currentPlayerId,
            data: {
              bet,
              guess,
              guesserName: guesserPlayer?.playerName || "Opponent"
            }
          });
          let guesser = room.players.get(currentPlayerId);
          const hider = Array.from(room.players.values()).find((p) => p.playerId !== currentPlayerId);
          if (!guesser) {
            guesser = connectedPlayers.get(currentPlayerId);
          }
          console.log(`[GAME] Guesser: ${guesser?.playerId || "null"}, Hider: ${hider?.playerId || "null"}, Room players: ${room.players.size}`);
          if (guesser && hider) {
            if (won) {
              guesser.marbles += bet;
              hider.marbles -= bet;
            } else {
              guesser.marbles -= bet;
              hider.marbles += bet;
            }
            const newHider = won ? guesser.playerId : hider.playerId;
            console.log(`[GAME] Guess result in room ${roomCode}: ${won ? "correct" : "wrong"}, bet: ${bet}`);
            broadcastToRoom(roomCode, {
              type: "round_result",
              roomCode,
              playerId: currentPlayerId,
              data: {
                guess,
                bet,
                hiddenCount,
                won,
                guesser: {
                  id: guesser.playerId,
                  name: guesser.playerName,
                  marbles: guesser.marbles
                },
                hider: {
                  id: hider.playerId,
                  name: hider.playerName,
                  marbles: hider.marbles
                },
                pointsEarned: won ? 5 : -5,
                nextHider: newHider
              }
            });
            room.gameState.currentHider = newHider;
            room.gameState.phase = "result";
            const savedRoomCode = roomCode;
            const savedNewHider = newHider;
            console.log(`[AUTO-RESTART] Scheduling new round in 3 seconds for room ${savedRoomCode}, next hider: ${savedNewHider}`);
            setTimeout(() => {
              const roomCheck = rooms.get(savedRoomCode);
              if (!roomCheck) {
                console.log(`[AUTO-RESTART] Room ${savedRoomCode} no longer exists`);
                return;
              }
              roomCheck.gameState.phase = "selecting";
              roomCheck.gameState.hiddenMarbles = 0;
              const newRoundMessage = {
                type: "new_round",
                roomCode: savedRoomCode,
                playerId: "system",
                data: {
                  phase: "selecting",
                  currentHider: savedNewHider
                }
              };
              console.log(`[AUTO-RESTART] Broadcasting new_round to room ${savedRoomCode}:`, JSON.stringify(newRoundMessage));
              const messageStr = JSON.stringify(newRoundMessage);
              let sentCount = 0;
              let failedCount = 0;
              roomCheck.players.forEach((player, playerId) => {
                try {
                  if (player.ws.readyState === 1) {
                    player.ws.send(messageStr);
                    sentCount++;
                    console.log(`[AUTO-RESTART] Sent new_round to ${playerId}`);
                  } else {
                    failedCount++;
                    console.log(`[AUTO-RESTART] Player ${playerId} ws not ready (state: ${player.ws.readyState})`);
                  }
                } catch (e) {
                  failedCount++;
                  console.log(`[AUTO-RESTART] Error sending to ${playerId}:`, e);
                }
              });
              console.log(`[AUTO-RESTART] New round started for room ${savedRoomCode}: sent=${sentCount}, failed=${failedCount}, hider=${savedNewHider}`);
            }, 3e3);
          } else {
            console.log(`[GAME ERROR] Cannot process guess - guesser: ${guesser?.playerId || "null"}, hider: ${hider?.playerId || "null"}`);
            console.log(`[GAME ERROR] Room players:`, Array.from(room.players.keys()));
            console.log(`[GAME ERROR] Connected players:`, Array.from(connectedPlayers.keys()));
          }
        } else if (action === "play_again") {
          room.gameState.phase = "selecting";
          room.gameState.hiddenMarbles = 0;
          console.log(`[GAME] Manual play_again in room ${roomCode}`);
          broadcastToRoom(roomCode, {
            type: "new_round",
            roomCode,
            playerId: "system",
            data: {
              phase: "selecting",
              currentHider: room.gameState.currentHider
            }
          });
        }
      } else if (message.type === "marble_update") {
        const marbleRoomCode = message.roomCode || currentRoomCode;
        if (message.roomCode) {
          currentRoomCode = message.roomCode;
        }
        const player = connectedPlayers.get(currentPlayerId);
        if (player) {
          player.marbles = message.data.marbles;
          const room = rooms.get(marbleRoomCode);
          if (room && room.players.has(currentPlayerId)) {
            room.players.get(currentPlayerId).marbles = message.data.marbles;
          }
          broadcastToRoom(marbleRoomCode, {
            type: "marble_update",
            roomCode: marbleRoomCode,
            playerId: currentPlayerId,
            data: {
              playerId: currentPlayerId,
              marbles: message.data.marbles
            }
          });
        }
      } else if (message.type === "chat") {
        const chatRoomCode = message.roomCode || currentRoomCode;
        if (message.roomCode) {
          currentRoomCode = message.roomCode;
        }
        console.log(`[CHAT] Message in room ${chatRoomCode} from ${currentPlayerId}`);
        broadcastToRoom(chatRoomCode, message);
      } else {
        const msgRoomCode = message.roomCode || currentRoomCode;
        if (message.roomCode) {
          currentRoomCode = message.roomCode;
        }
        broadcastToRoom(msgRoomCode, message);
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });
  ws2.on("close", () => {
    if (currentPlayerId) {
      onlinePlayers.delete(currentPlayerId);
      connectedPlayers.delete(currentPlayerId);
      const room = rooms.get(currentRoomCode);
      if (room) {
        const RECONNECT_GRACE_PERIOD = 5e3;
        if (room.pendingDisconnects.has(currentPlayerId)) {
          clearTimeout(room.pendingDisconnects.get(currentPlayerId));
        }
        const disconnectTimeout = setTimeout(() => {
          const roomCheck = rooms.get(currentRoomCode);
          if (roomCheck) {
            roomCheck.players.delete(currentPlayerId);
            roomCheck.pendingDisconnects.delete(currentPlayerId);
            broadcastToRoom(currentRoomCode, {
              type: "player_left",
              roomCode: currentRoomCode,
              playerId: currentPlayerId,
              data: { playerId: currentPlayerId }
            });
            console.log(`[DISCONNECT] ${currentPlayerId} removed from room ${currentRoomCode} after grace period`);
            if (roomCheck.players.size === 0) {
              rooms.delete(currentRoomCode);
              console.log(`[ROOM] Room ${currentRoomCode} deleted (empty)`);
            }
          }
        }, RECONNECT_GRACE_PERIOD);
        room.pendingDisconnects.set(currentPlayerId, disconnectTimeout);
        console.log(`[PRESENCE] ${currentPlayerId} disconnected, waiting ${RECONNECT_GRACE_PERIOD}ms for reconnect`);
      } else {
        console.log(`[PRESENCE] ${currentPlayerId} went offline (no room)`);
      }
    }
    if (currentRoomCode) {
      const roomConns = roomConnections.get(currentRoomCode);
      if (roomConns) {
        roomConns.delete(currentPlayerId);
        if (roomConns.size === 0) {
          roomConnections.delete(currentRoomCode);
        }
      }
    }
  });
  ws2.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
}
function broadcastToRoom(roomCode, message) {
  const room = rooms.get(roomCode);
  if (!room) {
    console.log(`[BROADCAST] Room ${roomCode} not found`);
    return;
  }
  const messageStr = JSON.stringify(message);
  let sentCount = 0;
  room.players.forEach((player, playerId) => {
    if (player.ws.readyState === 1) {
      player.ws.send(messageStr);
      sentCount++;
    }
  });
  console.log(`[BROADCAST] Sent to ${sentCount}/${room.players.size} players in room ${roomCode}`);
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/catalog", async (req, res) => {
    try {
      const items = await storage.getCatalogItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch catalog" });
    }
  });
  app2.post("/api/catalog", async (req, res) => {
    try {
      const { name, description, pointsCost, imageUrl } = req.body;
      const item = await storage.addCatalogItem({
        name,
        description,
        pointsCost,
        imageUrl
      });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add catalog item" });
    }
  });
  app2.delete("/api/catalog/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCatalogItem(id);
      res.json({ success: true, message: "Catalog item deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete catalog item" });
    }
  });
  app2.put("/api/catalog/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, pointsCost, imageUrl } = req.body;
      const updatedItem = await storage.updateCatalogItem(id, {
        name,
        description,
        pointsCost,
        imageUrl
      });
      if (!updatedItem) {
        return res.status(404).json({ error: "Catalog item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update catalog item" });
    }
  });
  app2.post("/api/marbles/purchase", async (req, res) => {
    try {
      const { userId, marblesAmount, transactionId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (!user.isAgeVerified) {
        return res.status(403).json({
          error: "Age verification required",
          message: "You must be 15+ years old to purchase marbles"
        });
      }
      const newMarbles = user.marbles + marblesAmount;
      const newPurchasedMarbles = user.purchasedMarbles + marblesAmount;
      const newEarnedMarbles = user.earnedMarbles + marblesAmount;
      await storage.updateUserMarbles(userId, newMarbles);
      await storage.addEarnedMarbles(userId, marblesAmount);
      await storage.recordTransaction({
        userId,
        amount: marblesAmount,
        type: "purchase",
        description: `Purchased ${marblesAmount} marbles`,
        transactionId: transactionId || null
      });
      res.json({ marbles: newMarbles, purchasedMarbles: newPurchasedMarbles, earnedMarbles: newEarnedMarbles, success: true });
    } catch (error) {
      res.status(500).json({ error: "Purchase failed" });
    }
  });
  app2.post("/api/tournament/check-eligibility", async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const earnedMarbles = user.earnedMarbles || 0;
      const isEligible = earnedMarbles >= 2500;
      res.json({
        eligible: isEligible,
        earnedMarbles,
        required: 2500,
        message: isEligible ? "You can enter tournament" : `You need ${2500 - earnedMarbles} more marbles to enter tournament`
      });
    } catch (error) {
      console.error("Tournament eligibility check error:", error);
      res.status(500).json({ error: "Failed to check tournament eligibility" });
    }
  });
  app2.post("/api/tournament/entry", async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const earnedMarbles = user.earnedMarbles || 0;
      if (earnedMarbles < 2500) {
        return res.status(403).json({
          error: "Insufficient tournament-eligible marbles",
          message: `You need ${2500 - earnedMarbles} more marbles earned from friends, random players, or purchases to enter tournament`
        });
      }
      res.json({
        success: true,
        message: "Tournament entry successful! Good luck!",
        marbles: user.marbles,
        earnedMarbles: user.earnedMarbles
      });
    } catch (error) {
      console.error("Tournament entry error:", error);
      res.status(500).json({ error: "Failed to enter tournament" });
    }
  });
  app2.post("/api/referral/validate", async (req, res) => {
    try {
      const { referralCode, userId } = req.body;
      const referrer = await storage.getUserByReferralCode(referralCode);
      if (!referrer) {
        return res.status(404).json({ error: "Invalid referral code" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const referrerNewMarbles = referrer.marbles + 50;
      await storage.updateUserMarbles(referrer.id, referrerNewMarbles);
      await storage.addEarnedMarbles(referrer.id, 50);
      await storage.recordTransaction({
        userId: referrer.id,
        amount: 50,
        type: "referral",
        description: `Referral bonus from ${user.username}`,
        transactionId: null
      });
      res.json({ success: true, message: "Referral validated" });
    } catch (error) {
      res.status(500).json({ error: "Referral validation failed" });
    }
  });
  app2.post("/api/game-points", async (req, res) => {
    try {
      const { userId, points, gameType, opponent, won, opponentType } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const newPoints = user.points + points;
      const newGamesPlayed = user.gamesPlayed + 1;
      const newGamesWon = won ? user.gamesWon + 1 : user.gamesWon;
      await storage.updateUserPoints(userId, newPoints);
      await storage.updateUserStats(userId, { gamesWon: newGamesWon, gamesPlayed: newGamesPlayed });
      if (won && opponentType && opponentType !== "ai") {
        await storage.addEarnedMarbles(userId, 10);
      }
      await storage.addGamePoints({
        userId,
        points,
        gameType,
        opponent: opponent || null,
        won
      });
      res.json({ points: newPoints, success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record game points" });
    }
  });
  app2.get("/api/tournament/windows", async (req, res) => {
    try {
      const windows = await storage.getTournamentWindows();
      res.json(windows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournament windows" });
    }
  });
  app2.post("/api/tournament/join", async (req, res) => {
    try {
      const { userId, windowId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const earnedFromPlayers = user.earnedMarbles || 0;
      const purchasedMarbles = user.purchasedMarbles || 0;
      const validMarblesForTournament = earnedFromPlayers + purchasedMarbles;
      if (validMarblesForTournament < 2500) {
        return res.status(400).json({
          error: "Insufficient marbles for tournament entry. You need 2500 marbles from earned (player wins) or purchased marbles (AI wins and ad rewards don't count).",
          earnedMarblesAvailable: earnedFromPlayers,
          purchasedMarblesAvailable: purchasedMarbles,
          totalValidMarbles: validMarblesForTournament,
          requiredMarbles: 2500,
          message: `You need ${2500 - validMarblesForTournament} more marbles from player wins or purchases`
        });
      }
      const newMarbles = user.marbles - 2500;
      await storage.updateUserMarbles(userId, newMarbles);
      await storage.recordTransaction({
        userId,
        amount: -2500,
        type: "tournament_entry",
        description: "Tournament entry fee (2500 marbles from earned/purchased)",
        transactionId: null
      });
      const windows = await storage.getTournamentWindows();
      const window = windows.find((w) => w.id === windowId || w.id === String(windowId));
      let tournamentId = null;
      if (window) {
        await storage.updateTournamentPlayerCount(window.id, window.playerCount + 1);
        tournamentId = window.id;
      }
      res.json({
        success: true,
        marbles: newMarbles,
        tournamentId,
        windowId: window?.id || windowId,
        message: "Tournament entry confirmed. 2500 marbles deducted (from earned/purchased)."
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to join tournament" });
    }
  });
  app2.post("/api/tournament/winner", async (req, res) => {
    try {
      const { userId, windowId } = req.body;
      const WINNING_MARBLES = 25e4;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const newTournamentWinnings = user.tournamentWinnings + WINNING_MARBLES;
      const newMarbles = user.marbles + WINNING_MARBLES;
      await storage.updateUserMarbles(userId, newMarbles);
      await storage.recordTransaction({
        userId,
        amount: WINNING_MARBLES,
        type: "tournament_winning_marbles",
        description: `Tournament Win - 250,000 winning marbles (TEMPORARY - shown until tournament converts to points)`,
        transactionId: null
      });
      res.json({
        success: true,
        marbles: newMarbles,
        tournamentWinnings: newTournamentWinnings,
        message: "\u{1F3C6} Tournament Win! 250,000 marbles awarded. Will convert to 1 lakh (100,000) redeemable points when tournament ends.",
        conversionRate: "250,000 winning marbles = 1 lakh (100,000) points",
        note: "These marbles will disappear after tournament conversion - you'll receive 1 lakh points instead"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to record tournament win" });
    }
  });
  app2.post("/api/tournament/convert-winnings", async (req, res) => {
    try {
      const { userId, windowId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (!user.tournamentWinnings || user.tournamentWinnings <= 0) {
        return res.status(400).json({
          error: "No tournament winnings to convert",
          tournamentWinnings: user.tournamentWinnings || 0
        });
      }
      const marblesWonAmount = user.tournamentWinnings;
      const pointsToAward = 1e5;
      const newMarbles = user.marbles - marblesWonAmount;
      const newTournamentWinnings = 0;
      const newPoints = user.points + pointsToAward;
      await storage.updateUserMarbles(userId, newMarbles);
      await storage.updateUserPoints(userId, newPoints);
      await storage.addGamePoints({
        userId,
        points: pointsToAward,
        gameType: "tournament_conversion",
        opponent: null,
        won: true
      });
      await storage.recordTransaction({
        userId,
        amount: pointsToAward,
        type: "tournament_conversion",
        description: `Tournament Winnings Converted: ${marblesWonAmount} marbles \u2192 ${pointsToAward} redeemable points`,
        transactionId: null
      });
      res.json({
        success: true,
        message: "\u2705 Tournament winnings converted to redeemable points!",
        marblesConverted: marblesWonAmount,
        conversionRate: "250,000 marbles = 1 lakh (100,000) points",
        pointsAwarded: pointsToAward,
        marbles: newMarbles,
        tournamentWinnings: newTournamentWinnings,
        points: newPoints,
        details: "You can now redeem 1 lakh points in the Shop for exclusive items"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to convert tournament winnings" });
    }
  });
  app2.get("/api/tournament/:tournamentId/bracket", async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const matches = await storage.getTournamentMatches(tournamentId);
      const participants = await storage.getTournamentParticipants(tournamentId);
      res.json({
        success: true,
        matches,
        participants,
        totalRounds: Math.ceil(Math.log2(participants.length || 1))
      });
    } catch (error) {
      console.error("Failed to fetch tournament bracket:", error);
      res.status(500).json({ error: "Failed to fetch tournament bracket" });
    }
  });
  app2.get("/api/tournament/:tournamentId/my-match", async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const { playerId } = req.query;
      if (!playerId) {
        return res.status(400).json({ error: "Player ID required" });
      }
      const matches = await storage.getTournamentMatches(tournamentId);
      const myMatch = matches.find(
        (m) => (m.player1Id === playerId || m.player2Id === playerId) && m.status !== "completed"
      );
      if (!myMatch) {
        return res.json({
          success: true,
          match: null,
          message: "No active match found"
        });
      }
      res.json({
        success: true,
        match: myMatch
      });
    } catch (error) {
      console.error("Failed to fetch player match:", error);
      res.status(500).json({ error: "Failed to fetch player match" });
    }
  });
  app2.post("/api/tournament/:tournamentId/start", async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const participants = await storage.getTournamentParticipants(tournamentId);
      if (participants.length < 2) {
        return res.status(400).json({
          error: "Not enough participants",
          participantCount: participants.length
        });
      }
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const round1Matches = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        const player1 = shuffled[i];
        const player2 = shuffled[i + 1];
        const roomCode = `TOUR_${tournamentId}_R1_M${Math.floor(i / 2) + 1}`;
        const match = await storage.createTournamentMatch({
          tournamentId,
          roundNumber: 1,
          matchNumber: Math.floor(i / 2) + 1,
          player1Id: player1.playerId,
          player1Name: player1.playerName,
          player2Id: player2?.playerId || null,
          player2Name: player2?.playerName || null,
          roomCode,
          status: player2 ? "ready" : "bye"
        });
        round1Matches.push(match);
      }
      await storage.updateTournamentStatus(tournamentId, "in_progress");
      res.json({
        success: true,
        matches: round1Matches,
        message: "Tournament started! First round matches created."
      });
    } catch (error) {
      console.error("Failed to start tournament:", error);
      res.status(500).json({ error: "Failed to start tournament" });
    }
  });
  app2.post("/api/tournament/match/:matchId/result", async (req, res) => {
    try {
      const { matchId } = req.params;
      const { winnerId, winnerName, player1Score, player2Score } = req.body;
      await storage.updateTournamentMatch(matchId, {
        winnerId,
        winnerName,
        player1Score,
        player2Score,
        status: "completed",
        completedAt: /* @__PURE__ */ new Date()
      });
      const match = await storage.getTournamentMatch(matchId);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      const allMatches = await storage.getTournamentMatches(match.tournamentId);
      const roundMatches = allMatches.filter((m) => m.roundNumber === match.roundNumber);
      const allComplete = roundMatches.every((m) => m.status === "completed" || m.status === "bye");
      if (allComplete) {
        const winners = roundMatches.map((m) => ({ id: m.winnerId, name: m.winnerName }));
        if (winners.length === 1) {
          await storage.updateTournamentStatus(match.tournamentId, "completed");
          await storage.setTournamentWinner(match.tournamentId, winnerId, winnerName);
          res.json({
            success: true,
            tournamentComplete: true,
            winnerId,
            winnerName,
            message: "Tournament complete! Winner declared."
          });
        } else {
          const nextRound = match.roundNumber + 1;
          for (let i = 0; i < winners.length; i += 2) {
            const p1 = winners[i];
            const p2 = winners[i + 1];
            const roomCode = `TOUR_${match.tournamentId}_R${nextRound}_M${Math.floor(i / 2) + 1}`;
            await storage.createTournamentMatch({
              tournamentId: match.tournamentId,
              roundNumber: nextRound,
              matchNumber: Math.floor(i / 2) + 1,
              player1Id: p1.id,
              player1Name: p1.name,
              player2Id: p2?.id || null,
              player2Name: p2?.name || null,
              roomCode,
              status: p2 ? "ready" : "bye"
            });
          }
          res.json({
            success: true,
            nextRoundCreated: true,
            nextRound,
            message: `Round ${nextRound} matches created!`
          });
        }
      } else {
        res.json({
          success: true,
          message: "Match result recorded. Waiting for other matches."
        });
      }
    } catch (error) {
      console.error("Failed to record match result:", error);
      res.status(500).json({ error: "Failed to record match result" });
    }
  });
  app2.post("/api/catalog/redeem", async (req, res) => {
    try {
      const { userId, itemId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const items = await storage.getCatalogItems();
      const item = items.find((i) => i.id === itemId);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      if (user.points < item.pointsCost) {
        return res.status(400).json({ error: "Insufficient points" });
      }
      const newPoints = user.points - item.pointsCost;
      await storage.updateUserPoints(userId, newPoints);
      await storage.recordTransaction({
        userId,
        amount: -item.pointsCost,
        type: "catalog_redemption",
        description: `Redeemed: ${item.name}`,
        transactionId: null
      });
      res.json({ success: true, points: newPoints, item: item.name });
    } catch (error) {
      res.status(500).json({ error: "Failed to redeem item" });
    }
  });
  app2.post("/api/room/create", async (req, res) => {
    try {
      const { userId } = req.body;
      const room = await storage.createGameRoom(userId, "friend");
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to create room" });
    }
  });
  app2.get("/api/room/:roomCode", async (req, res) => {
    try {
      const { roomCode } = req.params;
      const room = await storage.getGameRoom(roomCode);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room" });
    }
  });
  app2.post("/api/room/join", async (req, res) => {
    try {
      const { roomCode, userId } = req.body;
      const room = await storage.joinGameRoom(roomCode, userId);
      if (!room) {
        return res.status(404).json({ error: "Room not available" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to join room" });
    }
  });
  app2.post("/api/match/queue", async (req, res) => {
    try {
      const { userId, username, marbles } = req.body;
      await storage.addToMatchQueue(userId, username, marbles);
      res.json({ success: true, message: "Added to match queue" });
    } catch (error) {
      res.status(500).json({ error: "Failed to join match queue" });
    }
  });
  app2.post("/api/match/find", async (req, res) => {
    try {
      const { userId } = req.body;
      const match = await storage.findMatchingPlayer(userId);
      if (match) {
        res.json(match);
      } else {
        res.json({ roomCode: null, waiting: true });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to find match" });
    }
  });
  app2.post("/api/match/leave", async (req, res) => {
    try {
      const { userId } = req.body;
      await storage.removeFromMatchQueue(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to leave match queue" });
    }
  });
  app2.post("/api/feedback", async (req, res) => {
    try {
      const { userId, name, email, phone, subject, message, type = "feedback" } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      const submission = await storage.addFeedbackSubmission({
        userId: userId || null,
        name: name || null,
        email: email || null,
        phone: phone || null,
        subject: subject || null,
        message,
        type,
        status: "pending"
      });
      console.log(`${type} received:`, submission);
      res.json({ success: true, submission });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });
  app2.get("/api/feedback", async (req, res) => {
    try {
      const submissions = await storage.getFeedbackSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });
  app2.post("/api/ad-revenue/track", async (req, res) => {
    try {
      const { userId, adType, revenueGenerated } = req.body;
      if (!userId || !adType || !revenueGenerated) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const adRecord = {
        userId,
        adType,
        revenueGenerated,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log("Ad Revenue Tracked:", adRecord);
      res.json({
        success: true,
        message: "Ad revenue tracked",
        record: adRecord
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to track ad revenue" });
    }
  });
  app2.get("/api/player/:userId/revenue-share", async (req, res) => {
    try {
      const { userId } = req.params;
      const month = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
      res.json({
        userId,
        currentMonth: month,
        totalAdRevenueThisMonth: 0,
        expectedSharePoints: 0,
        status: "tracking",
        message: "Ad revenue will be calculated and awarded monthly"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue share" });
    }
  });
  app2.post("/api/revenue-share/calculate-monthly", async (req, res) => {
    try {
      const month = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
      console.log(`Monthly revenue share calculation triggered for ${month}`);
      res.json({
        success: true,
        message: "Monthly revenue share calculation queued",
        month,
        details: "Will process all player ad revenues and award 20% as points"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate monthly revenue share" });
    }
  });
  app2.get("/api/revenue-share/leaderboard", async (req, res) => {
    try {
      res.json({
        leaderboard: [],
        message: "Revenue share leaderboard",
        details: "Shows top players earning points from ads"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue share leaderboard" });
    }
  });
  app2.post("/api/user/init", async (req, res) => {
    try {
      const { userId, username } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser(
          { username: username || userId, password: "guest" },
          void 0
        );
        user.id = userId;
      }
      res.json(user);
    } catch (error) {
      console.error("User init error:", error);
      res.status(500).json({ error: "Failed to initialize user" });
    }
  });
  app2.get("/api/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser(
          { username: userId, password: "guest" },
          void 0,
          userId
        );
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.post("/api/user/:userId/onboarding", async (req, res) => {
    try {
      const { userId } = req.params;
      const { displayName, dateOfBirth, adPreferences, isAgeVerified } = req.body;
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser(
          { username: userId, password: "guest" },
          void 0,
          userId
        );
      }
      const updatedUser = await storage.updateUserOnboarding(userId, {
        displayName,
        dateOfBirth,
        adPreferences,
        isAgeVerified
      });
      console.log(`User ${userId} onboarding saved:`, { displayName, dateOfBirth, adPreferences });
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Onboarding save error:", error);
      res.status(500).json({ error: "Failed to save onboarding data" });
    }
  });
  app2.get("/api/user/:userId/is-admin", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.json({ isAdmin: false });
      }
      res.json({ isAdmin: user.isAdmin || false });
    } catch (error) {
      console.error("Admin check error:", error);
      res.json({ isAdmin: false });
    }
  });
  const checkAdminAuth = async (userId) => {
    if (!userId) return false;
    const user = await storage.getUser(userId);
    return user?.isAdmin || false;
  };
  app2.get("/api/admin/users", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"];
      if (userId) {
        const isAdmin = await checkAdminAuth(userId);
        if (!isAdmin) {
          return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
      }
      const allUsers = await storage.getAllUsers();
      const usersData = allUsers.map((u) => ({
        id: u.id,
        displayName: u.displayName || u.username,
        dateOfBirth: u.dateOfBirth,
        age: u.dateOfBirth ? Math.floor((Date.now() - new Date(u.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1e3)) : null,
        adPreferences: u.adPreferences || [],
        isAgeVerified: u.isAgeVerified,
        marbles: u.marbles,
        gamesPlayed: u.gamesPlayed,
        gamesWon: u.gamesWon,
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt
      }));
      const adPreferenceStats = {};
      allUsers.forEach((u) => {
        if (u.adPreferences) {
          u.adPreferences.forEach((pref) => {
            adPreferenceStats[pref] = (adPreferenceStats[pref] || 0) + 1;
          });
        }
      });
      const ageDemographics = {
        under15: usersData.filter((u) => u.age !== null && u.age < 15).length,
        age15to18: usersData.filter((u) => u.age !== null && u.age >= 15 && u.age < 18).length,
        age18to25: usersData.filter((u) => u.age !== null && u.age >= 18 && u.age <= 25).length,
        above25: usersData.filter((u) => u.age !== null && u.age > 25).length,
        unknown: usersData.filter((u) => u.age === null).length
      };
      res.json({
        success: true,
        totalUsers: usersData.length,
        users: usersData,
        adPreferenceStats,
        ageDemographics
      });
    } catch (error) {
      console.error("Admin users fetch error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/engagement-analytics", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"];
      if (userId) {
        const isAdmin = await checkAdminAuth(userId);
        if (!isAdmin) {
          return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
      }
      const analytics = await storage.getEngagementAnalytics();
      res.json({ success: true, ...analytics });
    } catch (error) {
      console.error("Engagement analytics fetch error:", error);
      res.status(500).json({ error: "Failed to fetch engagement analytics" });
    }
  });
  app2.post("/api/session/start", async (req, res) => {
    try {
      const { userId, gameType } = req.body;
      if (!userId || !gameType) {
        return res.status(400).json({ error: "userId and gameType required" });
      }
      const result = await storage.startGameSession(userId, gameType);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Session start error:", error);
      res.status(500).json({ error: "Failed to start session" });
    }
  });
  app2.post("/api/session/end", async (req, res) => {
    try {
      const { sessionId, gamesPlayed, gamesWon, marblesWon, marblesLost } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId required" });
      }
      await storage.endGameSession(sessionId, {
        gamesPlayed: gamesPlayed || 0,
        gamesWon: gamesWon || 0,
        marblesWon: marblesWon || 0,
        marblesLost: marblesLost || 0
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Session end error:", error);
      res.status(500).json({ error: "Failed to end session" });
    }
  });
  app2.post("/api/ads/impression", async (req, res) => {
    try {
      const { userId, adType, adCategory, revenueAmount } = req.body;
      if (!userId || !adType) {
        return res.status(400).json({ error: "userId and adType required" });
      }
      await storage.recordAdImpression(userId, adType, adCategory || null, revenueAmount || 0);
      res.json({ success: true });
    } catch (error) {
      console.error("Ad impression error:", error);
      res.status(500).json({ error: "Failed to record ad impression" });
    }
  });
  app2.post("/api/ads/click", async (req, res) => {
    try {
      const { impressionId } = req.body;
      if (!impressionId) {
        return res.status(400).json({ error: "impressionId required" });
      }
      await storage.recordAdClick(impressionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Ad click error:", error);
      res.status(500).json({ error: "Failed to record ad click" });
    }
  });
  app2.get("/api/user/:userId/daily-stats/:date", async (req, res) => {
    try {
      const { userId, date } = req.params;
      const stats = await storage.getDailyUserStats(userId, date);
      res.json({ success: true, stats: stats || null });
    } catch (error) {
      console.error("Daily stats fetch error:", error);
      res.status(500).json({ error: "Failed to fetch daily stats" });
    }
  });
  app2.get("/api/leaderboard", async (req, res) => {
    try {
      const { type = "global" } = req.query;
      const allUsers = await storage.getAllUsers();
      const leaderboard = allUsers.filter((u) => u.gamesPlayed > 0 || u.earnedMarbles > 0).map((u) => ({
        id: u.id,
        name: u.displayName || u.username || "Player",
        avatar: u.profileImage || "",
        marbles: u.earnedMarbles || 0,
        gamesWon: u.gamesWon || 0,
        gamesPlayed: u.gamesPlayed || 0,
        winRate: u.gamesPlayed > 0 ? Math.round(u.gamesWon / u.gamesPlayed * 100) : 0,
        points: u.points || 0
      })).sort((a, b) => b.marbles - a.marbles).slice(0, 100).map((entry, index) => ({ ...entry, rank: index + 1 }));
      res.json({ success: true, leaderboard, type });
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  app2.post("/api/profile/update", async (req, res) => {
    try {
      const { userId, displayName, profileImage, gender } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser(
          { username: userId, password: "guest" },
          void 0,
          userId
        );
      }
      const updatedUser = await storage.updateUserProfile(userId, {
        displayName: displayName || void 0,
        profileImage: profileImage || void 0,
        gender: gender || void 0
      });
      res.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  app2.post("/api/ai-defeat", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const updatedUser = await storage.incrementAiWins(userId);
      res.json({
        success: true,
        message: "AI defeat recorded (no earned marbles from AI)",
        aiWins: updatedUser?.aiWins || 0,
        earnedMarbles: updatedUser?.earnedMarbles || 0
      });
    } catch (error) {
      console.error("AI defeat error:", error);
      res.status(500).json({ error: "Failed to record AI defeat" });
    }
  });
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { adminId, password } = req.body;
      if (!adminId || !password) {
        return res.status(400).json({ error: "Admin ID and password required" });
      }
      const admin = await storage.getAdminByIdAndPassword(adminId, password);
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      res.json({ success: true, token, adminId });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.post("/api/admin/change-password", async (req, res) => {
    try {
      const { token, oldPassword, newPassword, userId } = req.body;
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (userId) {
        const isAdmin = await checkAdminAuth(userId);
        if (!isAdmin) {
          return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
      }
      const adminId = "admin";
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "Old and new passwords required" });
      }
      const success = await storage.updateAdminPassword(adminId, oldPassword, newPassword);
      if (!success) {
        return res.status(401).json({ error: "Incorrect old password" });
      }
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });
  app2.post("/api/admin/set-admin", async (req, res) => {
    try {
      const { userId, secretKey } = req.body;
      const MASTER_ADMIN_KEY = process.env.ADMIN_MASTER_KEY || "kancheyking_admin_2024";
      if (secretKey !== MASTER_ADMIN_KEY) {
        return res.status(403).json({ error: "Invalid secret key" });
      }
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.setUserAsAdmin(userId, true);
      res.json({ success: true, message: `User ${userId} is now an admin` });
    } catch (error) {
      console.error("Set admin error:", error);
      res.status(500).json({ error: "Failed to set admin" });
    }
  });
  app2.post("/api/admin/setup-phone", async (req, res) => {
    try {
      const { token, phoneNumber } = req.body;
      if (!token || !phoneNumber) {
        return res.status(400).json({ error: "Token and phone number required" });
      }
      const adminId = "admin";
      await storage.updateAdminPhone(adminId, phoneNumber);
      res.json({ success: true, message: "Phone number saved for OTP" });
    } catch (error) {
      console.error("Setup phone error:", error);
      res.status(500).json({ error: "Failed to save phone number" });
    }
  });
  app2.post("/api/admin/send-otp", async (req, res) => {
    try {
      const { adminId, password } = req.body;
      if (!adminId || !password) {
        return res.status(400).json({ error: "Admin ID and password required" });
      }
      const admin = await storage.getAdminByIdAndPassword(adminId, password);
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      let phoneNumber = await storage.getAdminPhone(adminId);
      if (!phoneNumber) {
        phoneNumber = "9211979518";
        await storage.updateAdminPhone(adminId, phoneNumber);
      }
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      await storage.saveOTP(adminId, otp);
      const { sendOTPSMS: sendOTPSMS2 } = await Promise.resolve().then(() => (init_twilioClient(), twilioClient_exports));
      const sent = await sendOTPSMS2(phoneNumber, otp);
      if (!sent) {
        return res.status(500).json({ error: "Failed to send OTP" });
      }
      res.json({
        success: true,
        message: "OTP sent to your phone",
        phoneNumber: phoneNumber.slice(-4)
      });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });
  app2.post("/api/admin/verify-otp", async (req, res) => {
    try {
      const { adminId, otp } = req.body;
      if (!adminId || !otp) {
        return res.status(400).json({ error: "Admin ID and OTP required" });
      }
      const isValid = await storage.verifyOTP(adminId, otp);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid OTP" });
      }
      const token = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      res.json({ success: true, token, adminId });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });
  app2.post("/api/tournament/can-enter", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId required" });
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const earnedFromPlayers = user.earnedMarbles || 0;
      const purchasedMarbles = user.purchasedMarbles || 0;
      const validMarblesForTournament = earnedFromPlayers + purchasedMarbles;
      const canEnter = validMarblesForTournament >= 2500;
      res.json({
        success: true,
        canEnter,
        message: canEnter ? "You can enter the tournament!" : `Need ${2500 - validMarblesForTournament} more marbles (from player wins or purchases)`,
        earnedMarblesFromPlayers: earnedFromPlayers,
        purchasedMarbles,
        totalValidMarbles: validMarblesForTournament,
        aiWins: user.aiWins || 0,
        requiredMarbles: 2500,
        note: "Tournament requires 2500 marbles from earned (player wins) + purchased (AI wins and ad rewards don't count)"
      });
    } catch (error) {
      console.error("Tournament entry check error:", error);
      res.status(500).json({ error: "Failed to check tournament eligibility" });
    }
  });
  app2.post("/api/game-room/create", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId required" });
      const room = await storage.createGameRoom(userId, "friend");
      const user = await storage.getUser(userId);
      res.json({
        success: true,
        roomCode: room.roomCode,
        player1: { id: userId, marbles: user?.marbles || 0, name: user?.displayName || "You" }
      });
    } catch (error) {
      console.error("Game room creation error:", error);
      res.status(500).json({ error: "Failed to create room" });
    }
  });
  app2.post("/api/game-room/join", async (req, res) => {
    try {
      const { roomCode, userId } = req.body;
      if (!roomCode || !userId) return res.status(400).json({ error: "roomCode and userId required" });
      const room = await storage.joinGameRoom(roomCode, userId);
      if (!room) return res.status(400).json({ error: "Room not found or already has 2 players" });
      const user = await storage.getUser(userId);
      const player1 = await storage.getUser(room.player1Id || "");
      res.json({
        success: true,
        room,
        player1: { id: room.player1Id, marbles: player1?.marbles || 0, name: player1?.displayName || "Player 1" },
        player2: { id: userId, marbles: user?.marbles || 0, name: user?.displayName || "You" }
      });
    } catch (error) {
      console.error("Game room join error:", error);
      res.status(500).json({ error: "Failed to join room" });
    }
  });
  app2.post("/api/game-room/find-random", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId required" });
      const user = await storage.getUser(userId);
      if (!user) {
        const newUser = await storage.createUser(
          { username: userId, password: "guest" },
          void 0,
          userId
        );
        const match = await storage.findMatchingPlayer(userId);
        if (match) {
          res.json({
            success: true,
            matchFound: true,
            roomCode: match.roomCode,
            opponent: {
              id: match.player.id,
              marbles: match.player.marbles,
              name: match.player.displayName || `Player_${Math.floor(Math.random() * 1e4)}`
            }
          });
        } else {
          await storage.addToMatchQueue(userId, newUser.displayName || newUser.username, newUser.marbles || 0);
          res.json({
            success: true,
            matchFound: false,
            queued: true,
            message: "Added to match queue. Waiting for opponent..."
          });
        }
      } else {
        const match = await storage.findMatchingPlayer(userId);
        if (match) {
          res.json({
            success: true,
            matchFound: true,
            roomCode: match.roomCode,
            opponent: {
              id: match.player.id,
              marbles: match.player.marbles,
              name: match.player.displayName || `Player_${Math.floor(Math.random() * 1e4)}`
            }
          });
        } else {
          await storage.addToMatchQueue(userId, user.displayName || user.username, user.marbles || 0);
          res.json({
            success: true,
            matchFound: false,
            queued: true,
            message: "Added to match queue. Waiting for opponent..."
          });
        }
      }
    } catch (error) {
      console.error("Random match error:", error);
      res.status(500).json({ error: "Failed to find match" });
    }
  });
  app2.post("/api/match-queue/add", async (req, res) => {
    try {
      const { userId, username, marbles, profileImage, gender } = req.body;
      if (!userId || !username) return res.status(400).json({ error: "userId and username required" });
      await storage.addToMatchQueue(userId, username, marbles || 0);
      console.log(`[MATCH QUEUE] Added ${username} (${userId}) with ${marbles} marbles`);
      res.json({ success: true });
    } catch (error) {
      console.error("Add to queue error:", error);
      res.status(500).json({ error: "Failed to add to queue" });
    }
  });
  app2.post("/api/match-queue/list", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId required" });
      const allUsers = await storage.getUsersInMatchQueue();
      const players = allUsers.filter((p) => p.userId !== userId).map((p) => ({
        id: p.userId,
        name: p.username,
        marbles: p.marbles
      }));
      console.log(`[MATCH QUEUE LIST] Total players: ${allUsers.length}, Available for ${userId}: ${players.length}`);
      res.json({ success: true, players });
    } catch (error) {
      console.error("List queue error:", error);
      res.status(500).json({ error: "Failed to list queue" });
    }
  });
  app2.post("/api/game-room/challenge", async (req, res) => {
    try {
      const { player1Id, player2Id } = req.body;
      if (!player1Id || !player2Id) return res.status(400).json({ error: "Both player IDs required" });
      const room = await storage.createGameRoom(player1Id, "random");
      await storage.joinGameRoom(room.roomCode, player2Id);
      await storage.removeFromMatchQueue(player1Id);
      await storage.removeFromMatchQueue(player2Id);
      res.json({
        success: true,
        roomCode: room.roomCode,
        message: "Game room created and players matched"
      });
    } catch (error) {
      console.error("Challenge error:", error);
      res.status(500).json({ error: "Failed to create challenge" });
    }
  });
  app2.post("/api/match-queue/remove", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId required" });
      await storage.removeFromMatchQueue(userId);
      console.log(`[MATCH QUEUE] Removed ${userId}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove from queue error:", error);
      res.status(500).json({ error: "Failed to remove from queue" });
    }
  });
  app2.get("/api/match-queue/debug", async (_req, res) => {
    try {
      const allUsers = await storage.getUsersInMatchQueue();
      console.log(`[MATCH QUEUE DEBUG] Current queue:`, allUsers);
      res.json({
        success: true,
        totalPlayers: allUsers.length,
        players: allUsers
      });
    } catch (error) {
      console.error("Debug queue error:", error);
      res.status(500).json({ error: "Failed to get queue debug info" });
    }
  });
  app2.get("/api/game-room/:roomCode", async (req, res) => {
    try {
      const { roomCode } = req.params;
      const room = await storage.getGameRoom(roomCode);
      if (!room) return res.status(404).json({ error: "Room not found" });
      const player1 = await storage.getUser(room.player1Id || "");
      const player2 = await storage.getUser(room.player2Id || "");
      res.json({
        room,
        players: {
          player1: player1 ? { id: player1.id, name: player1.displayName || player1.username, marbles: player1.marbles } : null,
          player2: player2 ? { id: player2.id, name: player2.displayName || player2.username, marbles: player2.marbles } : null
        }
      });
    } catch (error) {
      console.error("Get room error:", error);
      res.status(500).json({ error: "Failed to get room" });
    }
  });
  app2.post("/api/marble-purchase", async (req, res) => {
    try {
      const { userId, marblesCount, amount } = req.body;
      if (!userId || !marblesCount || !amount) {
        return res.status(400).json({ error: "userId, marblesCount, and amount required" });
      }
      const { getUncachableStripeClient: getUncachableStripeClient2, getStripePublishableKey: getStripePublishableKey2 } = await Promise.resolve().then(() => (init_stripeClient(), stripeClient_exports));
      const stripe = await getUncachableStripeClient2();
      const publishableKey = await getStripePublishableKey2();
      const baseUrl = process.env.REPLIT_DOMAINS?.split(",")[0] ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "http://localhost:5000";
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: `${marblesCount} Marbles Pack`,
                description: `Purchase ${marblesCount} marbles for Kanchey King`
              },
              unit_amount: amount * 100
              // Stripe uses paise
            },
            quantity: 1
          }
        ],
        mode: "payment",
        success_url: `${baseUrl}/shop?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/shop?payment=cancelled`,
        metadata: {
          userId,
          marblesCount: String(marblesCount)
        }
      });
      res.json({
        success: true,
        sessionId: session.id,
        url: session.url,
        publishableKey
      });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });
  app2.post("/api/marble-purchase/verify", async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId required" });
      }
      const { getUncachableStripeClient: getUncachableStripeClient2 } = await Promise.resolve().then(() => (init_stripeClient(), stripeClient_exports));
      const stripe = await getUncachableStripeClient2();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return res.status(400).json({ error: "Payment not completed" });
      }
      const userId = session.metadata?.userId;
      const marblesCount = parseInt(session.metadata?.marblesCount || "0");
      if (!userId || !marblesCount) {
        return res.status(400).json({ error: "Invalid session metadata" });
      }
      const existingTx = await storage.getTransactionByExternalId(sessionId);
      if (existingTx) {
        return res.json({
          success: true,
          message: "Payment already processed",
          alreadyProcessed: true
        });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const newMarbleCount = (user.marbles || 0) + marblesCount;
      await storage.updateUserMarbles(userId, newMarbleCount);
      await storage.recordTransaction({
        userId,
        amount: marblesCount,
        type: "purchase",
        description: `Purchased ${marblesCount} marbles via Stripe`,
        transactionId: sessionId
      });
      res.json({
        success: true,
        message: "Payment verified and marbles added",
        marbles: newMarbleCount
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: "Payment verification failed" });
    }
  });
  app2.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const { getStripePublishableKey: getStripePublishableKey2 } = await Promise.resolve().then(() => (init_stripeClient(), stripeClient_exports));
      const publishableKey = await getStripePublishableKey2();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Stripe key error:", error);
      res.status(500).json({ error: "Failed to get Stripe key" });
    }
  });
  const httpServer = createServer(app2);
  httpServer.on("upgrade", (request, socket, head) => {
    if (request.url === "/ws") {
      const wss = new WebSocketServer({ noServer: true });
      wss.handleUpgrade(request, socket, head, (ws2) => {
        handleNewConnection(ws2);
      });
    } else {
      socket.destroy();
    }
  });
  app2.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email required" });
      }
      const otp = generateOTP();
      const sent = await sendLoginOTPEmail(email.toLowerCase().trim(), otp);
      if (!sent) return res.status(500).json({ error: "Failed to send OTP" });
      res.json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });
  app2.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otp, displayName, gender, dateOfBirth } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP required" });
      }
      const emailKey = email.toLowerCase().trim();
      const isValid = verifyLoginOTP(emailKey, otp);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }
      let user = await storage.getUserByEmail(emailKey);
      if (user) {
        res.json({
          success: true,
          isNewUser: false,
          userId: user.id,
          displayName: user.displayName || user.username,
          message: "Login successful"
        });
      } else {
        const newUserId = `player-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        user = await storage.createUser(
          { username: newUserId, password: "guest" },
          void 0,
          newUserId
        );
        await storage.updateUserProfile(user.id, {
          email: emailKey,
          displayName: displayName || void 0,
          gender: gender || "boy"
        });
        res.json({
          success: true,
          isNewUser: true,
          userId: newUserId,
          displayName: displayName || newUserId,
          message: "Account created successfully"
        });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      "/ws": { target: "ws://localhost:5000", ws: true }
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const possiblePaths = [
    path2.resolve(import.meta.dirname, "../dist/public"),
    path2.resolve(import.meta.dirname, "public"),
    path2.resolve(process.cwd(), "dist/public")
  ];
  const distPath = possiblePaths.find((p) => fs.existsSync(p));
  if (!distPath) {
    throw new Error(
      `Could not find the build directory. Tried: ${possiblePaths.join(", ")}`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  limit: "50mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
