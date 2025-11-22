import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/catalog", async (req, res) => {
    try {
      const items = await storage.getCatalogItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch catalog" });
    }
  });

  app.post("/api/catalog", async (req, res) => {
    try {
      const { name, description, pointsCost, imageUrl } = req.body;
      const item = await storage.addCatalogItem({
        name,
        description,
        pointsCost,
        imageUrl,
      });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add catalog item" });
    }
  });

  app.post("/api/marbles/purchase", async (req, res) => {
    try {
      const { userId, marblesAmount, transactionId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newMarbles = user.marbles + marblesAmount;
      await storage.updateUserMarbles(userId, newMarbles);
      
      await storage.recordTransaction({
        userId,
        amount: marblesAmount,
        type: "purchase",
        description: `Purchased ${marblesAmount} marbles`,
        transactionId: transactionId || null,
      });

      res.json({ marbles: newMarbles, success: true });
    } catch (error) {
      res.status(500).json({ error: "Purchase failed" });
    }
  });

  app.post("/api/referral/validate", async (req, res) => {
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
      
      await storage.recordTransaction({
        userId: referrer.id,
        amount: 50,
        type: "referral",
        description: `Referral bonus from ${user.username}`,
        transactionId: null,
      });

      res.json({ success: true, message: "Referral validated" });
    } catch (error) {
      res.status(500).json({ error: "Referral validation failed" });
    }
  });

  app.post("/api/game-points", async (req, res) => {
    try {
      const { userId, points, gameType, opponent, won } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newPoints = user.points + points;
      const newGamesPlayed = user.gamesPlayed + 1;
      const newGamesWon = won ? user.gamesWon + 1 : user.gamesWon;

      await storage.updateUserPoints(userId, newPoints);
      await storage.updateUserStats(userId, { gamesWon: newGamesWon, gamesPlayed: newGamesPlayed });

      await storage.addGamePoints({
        userId,
        points,
        gameType,
        opponent: opponent || null,
        won,
      });

      res.json({ points: newPoints, success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record game points" });
    }
  });

  app.get("/api/tournament/windows", async (req, res) => {
    try {
      const windows = await storage.getTournamentWindows();
      res.json(windows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournament windows" });
    }
  });

  app.post("/api/tournament/join", async (req, res) => {
    try {
      const { userId, windowId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.marbles < 2500) {
        return res.status(400).json({ error: "Insufficient marbles" });
      }

      const newMarbles = user.marbles - 2500;
      await storage.updateUserMarbles(userId, newMarbles);

      await storage.recordTransaction({
        userId,
        amount: -2500,
        type: "tournament_entry",
        description: "Tournament entry fee (2500 marbles)",
        transactionId: null,
      });

      const windows = await storage.getTournamentWindows();
      const window = windows.find(w => w.id === windowId);
      if (window) {
        await storage.updateTournamentPlayerCount(windowId, window.playerCount + 1);
      }

      res.json({ success: true, marbles: newMarbles });
    } catch (error) {
      res.status(500).json({ error: "Failed to join tournament" });
    }
  });

  app.post("/api/tournament/winner", async (req, res) => {
    try {
      const { userId, windowId } = req.body;
      const WINNER_POINTS = 250000;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newPoints = user.points + WINNER_POINTS;
      await storage.updateUserPoints(userId, newPoints);

      await storage.addGamePoints({
        userId,
        points: WINNER_POINTS,
        gameType: "tournament_win",
        opponent: null,
        won: true,
      });

      await storage.recordTransaction({
        userId,
        amount: WINNER_POINTS,
        type: "tournament_reward",
        description: `Tournament Win - 250,000 Points (≈₹25,000 value)`,
        transactionId: null,
      });

      res.json({ success: true, points: newPoints, reward: WINNER_POINTS });
    } catch (error) {
      res.status(500).json({ error: "Failed to record tournament win" });
    }
  });

  app.post("/api/catalog/redeem", async (req, res) => {
    try {
      const { userId, itemId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const items = await storage.getCatalogItems();
      const item = items.find(i => i.id === itemId);
      
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
        transactionId: null,
      });

      res.json({ success: true, points: newPoints, item: item.name });
    } catch (error) {
      res.status(500).json({ error: "Failed to redeem item" });
    }
  });

  // Multiplayer Routes
  app.post("/api/room/create", async (req, res) => {
    try {
      const { userId } = req.body;
      const room = await storage.createGameRoom(userId, "friend");
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  app.get("/api/room/:roomCode", async (req, res) => {
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

  app.post("/api/room/join", async (req, res) => {
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

  app.post("/api/match/queue", async (req, res) => {
    try {
      const { userId, username, marbles } = req.body;
      await storage.addToMatchQueue(userId, username, marbles);
      res.json({ success: true, message: "Added to match queue" });
    } catch (error) {
      res.status(500).json({ error: "Failed to join match queue" });
    }
  });

  app.post("/api/match/find", async (req, res) => {
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

  app.post("/api/match/leave", async (req, res) => {
    try {
      const { userId } = req.body;
      await storage.removeFromMatchQueue(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to leave match queue" });
    }
  });

  // Feedback Collection
  const feedbackStore: Array<{ name: string; email: string; message: string; timestamp: string }> = [];

  app.post("/api/feedback", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      const feedback = {
        name: name || "Anonymous",
        email: email || "Not provided",
        message,
        timestamp: new Date().toISOString(),
      };
      feedbackStore.push(feedback);
      
      // Log feedback to console for debugging
      console.log("New feedback received:", feedback);
      
      res.json({ success: true, message: "Feedback received!" });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  app.get("/api/feedback", async (req, res) => {
    try {
      res.json({ count: feedbackStore.length, feedbacks: feedbackStore });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Ad Revenue Tracking - Track each ad view/revenue from a player
  app.post("/api/ad-revenue/track", async (req, res) => {
    try {
      const { userId, adType, revenueGenerated } = req.body;
      
      if (!userId || !adType || !revenueGenerated) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Store ad revenue tracking (in production, this would go to database)
      const adRecord = {
        userId,
        adType,
        revenueGenerated,
        timestamp: new Date().toISOString()
      };
      
      // Log for debugging
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

  // Get Player's Revenue Share Status
  app.get("/api/player/:userId/revenue-share", async (req, res) => {
    try {
      const { userId } = req.params;
      const month = new Date().toISOString().slice(0, 7); // "2025-11" format
      
      // In production, fetch from database
      // For now, return structure
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

  // Calculate and Award Monthly Revenue Share (Run monthly)
  app.post("/api/revenue-share/calculate-monthly", async (req, res) => {
    try {
      const month = new Date().toISOString().slice(0, 7); // "2025-11" format
      
      // In production:
      // 1. Query all playerAdRevenue records for this month per userId
      // 2. Sum up revenue per user
      // 3. Calculate 20% of total
      // 4. Create entry in playerRevenueShare
      // 5. Award points to user
      // 6. Mark as awarded
      
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

  // Get All Players' Revenue Share Leaderboard
  app.get("/api/revenue-share/leaderboard", async (req, res) => {
    try {
      // In production: Fetch from playerRevenueShare table
      // Order by pointsAwarded DESC
      // Return top 100 players
      
      res.json({
        leaderboard: [],
        message: "Revenue share leaderboard",
        details: "Shows top players earning points from ads"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue share leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
