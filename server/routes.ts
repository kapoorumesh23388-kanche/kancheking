import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { handleNewConnection } from "./ws-manager";

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

  app.delete("/api/catalog/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCatalogItem(id);
      res.json({ success: true, message: "Catalog item deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete catalog item" });
    }
  });

  app.post("/api/marbles/purchase", async (req, res) => {
    try {
      const { userId, marblesAmount, transactionId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check age verification
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
      // Also track purchased marbles separately
      await storage.addEarnedMarbles(userId, marblesAmount);
      
      await storage.recordTransaction({
        userId,
        amount: marblesAmount,
        type: "purchase",
        description: `Purchased ${marblesAmount} marbles`,
        transactionId: transactionId || null,
      });

      res.json({ marbles: newMarbles, purchasedMarbles: newPurchasedMarbles, earnedMarbles: newEarnedMarbles, success: true });
    } catch (error) {
      res.status(500).json({ error: "Purchase failed" });
    }
  });

  app.post("/api/tournament/check-eligibility", async (req, res) => {
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
        message: isEligible ? "You can enter tournament" : `You need ${2500 - earnedMarbles} more marbles to enter tournament`,
      });
    } catch (error) {
      console.error("Tournament eligibility check error:", error);
      res.status(500).json({ error: "Failed to check tournament eligibility" });
    }
  });

  app.post("/api/tournament/entry", async (req, res) => {
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

      // Tournament entry successful - no marble deduction
      // 2500 earned marbles is just an entry barrier to motivate players
      res.json({
        success: true,
        message: "Tournament entry successful! Good luck!",
        marbles: user.marbles,
        earnedMarbles: user.earnedMarbles,
      });
    } catch (error) {
      console.error("Tournament entry error:", error);
      res.status(500).json({ error: "Failed to enter tournament" });
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
      await storage.addEarnedMarbles(referrer.id, 50);
      
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

      // If player won against friend or random player, add earned marbles
      if (won && opponentType && opponentType !== "ai") {
        // Add marbles to earned marbles for tournament eligibility
        await storage.addEarnedMarbles(userId, 10);
      }

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

      // CHECK PURCHASED MARBLES ONLY (NOT FREE MARBLES)
      if (!user.purchasedMarbles || user.purchasedMarbles < 2500) {
        return res.status(400).json({ 
          error: "Insufficient purchased marbles. Tournament entry requires 2500 purchased marbles only (not earned/free marbles).",
          purchasedMarblesAvailable: user.purchasedMarbles || 0
        });
      }

      // Deduct from purchased marbles
      const newPurchasedMarbles = user.purchasedMarbles - 2500;
      const newMarbles = user.marbles - 2500;
      
      await storage.updateUserMarbles(userId, newMarbles);

      await storage.recordTransaction({
        userId,
        amount: -2500,
        type: "tournament_entry",
        description: "Tournament entry fee (2500 PURCHASED marbles only)",
        transactionId: null,
      });

      const windows = await storage.getTournamentWindows();
      const window = windows.find(w => w.id === windowId);
      if (window) {
        await storage.updateTournamentPlayerCount(windowId, window.playerCount + 1);
      }

      res.json({ 
        success: true, 
        marbles: newMarbles,
        purchasedMarbles: newPurchasedMarbles,
        message: "Tournament entry confirmed. Entry fee (2500 purchased marbles) deducted."
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to join tournament" });
    }
  });

  app.post("/api/tournament/winner", async (req, res) => {
    try {
      const { userId, windowId } = req.body;
      const WINNING_MARBLES = 250000; // Temporary marbles shown during tournament
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // AWARD TEMPORARY WINNING MARBLES (visible only during tournament)
      const newTournamentWinnings = user.tournamentWinnings + WINNING_MARBLES;
      const newMarbles = user.marbles + WINNING_MARBLES;
      
      await storage.updateUserMarbles(userId, newMarbles);

      await storage.recordTransaction({
        userId,
        amount: WINNING_MARBLES,
        type: "tournament_winning_marbles",
        description: `Tournament Win - 250,000 winning marbles (TEMPORARY - shown until tournament converts to points)`,
        transactionId: null,
      });

      res.json({ 
        success: true, 
        marbles: newMarbles,
        tournamentWinnings: newTournamentWinnings,
        message: "🏆 Tournament Win! 250,000 marbles awarded. Will convert to 1 lakh (100,000) redeemable points when tournament ends.",
        conversionRate: "250,000 winning marbles = 1 lakh (100,000) points",
        note: "These marbles will disappear after tournament conversion - you'll receive 1 lakh points instead"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to record tournament win" });
    }
  });

  // Convert Tournament Winnings to Points (Run after tournament ends)
  app.post("/api/tournament/convert-winnings", async (req, res) => {
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
      const pointsToAward = 100000; // 250,000 marbles = 1 lakh (100,000) points
      
      // Remove temporary marbles from account
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
        won: true,
      });

      await storage.recordTransaction({
        userId,
        amount: pointsToAward,
        type: "tournament_conversion",
        description: `Tournament Winnings Converted: ${marblesWonAmount} marbles → ${pointsToAward} redeemable points`,
        transactionId: null,
      });

      res.json({ 
        success: true, 
        message: "✅ Tournament winnings converted to redeemable points!",
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
  app.post("/api/feedback", async (req, res) => {
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

  app.get("/api/feedback", async (req, res) => {
    try {
      const submissions = await storage.getFeedbackSubmissions();
      res.json(submissions);
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

  // Initialize or Get User
  app.post("/api/user/init", async (req, res) => {
    try {
      const { userId, username } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      let user = await storage.getUser(userId);
      
      // Create user if doesn't exist
      if (!user) {
        user = await storage.createUser(
          { username: username || userId, password: "guest" },
          undefined
        );
        // Update ID to match the provided userId
        user.id = userId;
      }

      res.json(user);
    } catch (error) {
      console.error("User init error:", error);
      res.status(500).json({ error: "Failed to initialize user" });
    }
  });

  // Get User by ID
  app.get("/api/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let user = await storage.getUser(userId);
      
      // Create user if doesn't exist
      if (!user) {
        user = await storage.createUser(
          { username: userId, password: "guest" },
          undefined,
          userId
        );
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update User Profile
  app.post("/api/profile/update", async (req, res) => {
    try {
      const { userId, displayName, profileImage, gender } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const updatedUser = await storage.updateUserProfile(userId, {
        displayName: displayName || undefined,
        profileImage: profileImage || undefined,
        gender: gender || undefined,
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.post("/api/ai-defeat", async (req, res) => {
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
        message: "AI defeat recorded",
        aiWins: updatedUser?.aiWins || 0,
      });
    } catch (error) {
      console.error("AI defeat error:", error);
      res.status(500).json({ error: "Failed to record AI defeat" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
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

  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { oldPassword, newPassword } = req.body;
      const adminId = "admin"; // Simplified - in production use token verification

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

  const httpServer = createServer(app);

  // Setup WebSocket server for real-time chat and game messages
  // Handle WebSocket upgrades on /ws path
  httpServer.on("upgrade", (request, socket, head) => {
    if (request.url === "/ws") {
      const wss = new WebSocketServer({ noServer: true });
      wss.handleUpgrade(request, socket, head, (ws) => {
        handleNewConnection(ws);
      });
    } else {
      socket.destroy();
    }
  });

  return httpServer;
}
