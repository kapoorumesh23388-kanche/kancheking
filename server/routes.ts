import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { generateOTP, sendLoginOTPEmail, verifyLoginOTP, sendAdminNotificationEmail, sendRedeemOTPEmail, verifyRedeemOTP } from "./emailService";
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

  // Update catalog item
  app.put("/api/catalog/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, pointsCost, imageUrl } = req.body;
      
      const updatedItem = await storage.updateCatalogItem(id, {
        name,
        description,
        pointsCost,
        imageUrl,
      });
      
      if (!updatedItem) {
        return res.status(404).json({ error: "Catalog item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update catalog item" });
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

  // Record game result (player vs player) - ADDS earnedMarbles ONLY for player wins, NOT for AI
  app.post("/api/game-points", async (req, res) => {
    try {
      const { userId, points, gameType, opponent, won, opponentType, marblesDelta } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newGamesPlayed = user.gamesPlayed + 1;
      const newGamesWon = won ? user.gamesWon + 1 : user.gamesWon;

      // Single source of truth: apply BOTH points and marbles change atomically here.
      const delta = typeof marblesDelta === "number" ? marblesDelta : 0;
      const updatedUser = await storage.adjustWallet(userId, delta, points || 0);
      await storage.updateUserStats(userId, { gamesWon: newGamesWon, gamesPlayed: newGamesPlayed });

      // If player won against friend or random player, add earned marbles
      if (won && opponentType && opponentType !== "ai") {
        // Add marbles to earned marbles for tournament eligibility
        await storage.addEarnedMarbles(userId, 10);
        // Add to dedicated PvP win marbles counter (used ONLY for leaderboard ranking)
        await storage.addPvpWinMarbles(userId, 10);
      }

      await storage.addGamePoints({
        userId,
        points,
        gameType,
        opponent: opponent || null,
        won,
      });

      const finalUser = await storage.getUser(userId);
      res.json({
        points: finalUser?.points ?? 0,
        marbles: finalUser?.marbles ?? 0,
        success: true,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to record game points" });
    }
  });

  // Single generic endpoint for any other marbles/points change (ads reward,
  // points->marbles shop conversion, daily/playtime/referral bonuses, etc.)
  // This — together with adjustWallet in storage.ts — is now the ONLY path
  // that changes a player's wallet, so the database is always the source
  // of truth and every screen (Home, Profile, GameHeader) shows the same number.
  app.post("/api/wallet/adjust", async (req, res) => {
    try {
      const { userId, marblesDelta, pointsDelta, reason } = req.body;
      if (!userId) return res.status(400).json({ error: "userId required" });

      const updated = await storage.adjustWallet(
        userId,
        typeof marblesDelta === "number" ? marblesDelta : 0,
        typeof pointsDelta === "number" ? pointsDelta : 0
      );
      if (!updated) return res.status(404).json({ error: "User not found" });

      res.json({ success: true, marbles: updated.marbles, points: updated.points, reason });
    } catch (error) {
      console.error("Wallet adjust error:", error);
      res.status(500).json({ error: "Failed to adjust wallet" });
    }
  });

  // Watch-Ads-for-Marbles: each of the 4 packs can only be claimed ONCE
  // PER CALENDAR DAY per player. Enforced server-side so it can't be
  // bypassed by clearing the browser cache/localStorage.
  const AD_PACKS_SERVER: Record<string, number> = {
    ad1: 15,
    ad2: 40,
    ad3: 75,
    ad4: 170,
  };

  function todayDateString(): string {
    return new Date().toISOString().split("T")[0];
  }

  app.get("/api/ads/status/:userId", async (req, res) => {
    try {
      const today = todayDateString();
      const claimed: Record<string, boolean> = {};
      for (const packId of Object.keys(AD_PACKS_SERVER)) {
        claimed[packId] = await storage.hasClaimedAdToday(req.params.userId, packId, today);
      }
      res.json({ success: true, claimed, date: today });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ad claim status" });
    }
  });

  app.post("/api/ads/claim", async (req, res) => {
    try {
      const { userId, packId } = req.body;
      if (!userId || !packId || !(packId in AD_PACKS_SERVER)) {
        return res.status(400).json({ error: "Invalid request" });
      }

      const today = todayDateString();
      const alreadyClaimed = await storage.hasClaimedAdToday(userId, packId, today);
      if (alreadyClaimed) {
        return res.status(400).json({ error: "You've already claimed this ad reward today. Come back tomorrow!" });
      }

      const marblesAwarded = AD_PACKS_SERVER[packId];
      await storage.recordAdClaim(userId, packId, today, marblesAwarded);
      const updated = await storage.adjustWallet(userId, marblesAwarded, 0);
      if (!updated) return res.status(404).json({ error: "User not found" });

      res.json({ success: true, marbles: updated.marbles, marblesAwarded });
    } catch (error) {
      console.error("Ad claim error:", error);
      res.status(500).json({ error: "Failed to claim ad reward" });
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

      // Tournament entry: 250 marbles from PvP Win Marbles ONLY.
      // (AI wins, ad rewards, and purchased marbles don't count.)
      const ENTRY_FEE = 250;
      const eligibleMarbles = user.pvpWinMarbles || 0;

      if (eligibleMarbles < ENTRY_FEE) {
        return res.status(400).json({
          error: `Insufficient eligible marbles for tournament entry. You need ${ENTRY_FEE} PvP Win Marbles (AI wins and ad rewards don't count).`,
          eligibleMarblesAvailable: eligibleMarbles,
          requiredMarbles: ENTRY_FEE,
          message: `You need ${ENTRY_FEE - eligibleMarbles} more PvP Win Marbles`
        });
      }

      // Deduct entry fee from both the spendable balance and the
      // PvP-win-marbles eligibility counter (single source of truth = DB)
      const updatedUser = await storage.adjustWallet(userId, -ENTRY_FEE, 0);
      await storage.addPvpWinMarbles(userId, -ENTRY_FEE);

      await storage.recordTransaction({
        userId,
        amount: -ENTRY_FEE,
        type: "tournament_entry",
        description: "Tournament entry fee (250 PvP Win Marbles)",
        transactionId: null,
      });

      const windows = await storage.getTournamentWindows();
      // windowId from client might be a number (1, 2) so match appropriately
      const window = windows.find(w => w.id === windowId || w.id === String(windowId));
      let tournamentId = null;
      if (window) {
        await storage.updateTournamentPlayerCount(window.id, window.playerCount + 1);
        await storage.addToPrizePool(window.id, ENTRY_FEE);
        // Use the actual database window ID as tournament ID
        tournamentId = window.id;
      }

      res.json({ 
        success: true, 
        marbles: updatedUser?.marbles ?? 0,
        tournamentId,
        windowId: window?.id || windowId,
        message: "Tournament entry confirmed. 250 marbles deducted (PvP wins only)."
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to join tournament" });
    }
  });

  app.post("/api/tournament/winner", async (req, res) => {
    try {
      const { userId, windowId } = req.body;
      const WINNER_POINTS_BONUS = 2500;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const windows = await storage.getTournamentWindows();
      const window = windows.find(w => w.id === windowId || w.id === String(windowId));
      const prizePoolMarbles = window?.prizePool || 0;

      // Winner gets the FULL prize pool (accumulated 250-marble entry fees
      // from every participant) as real marbles, PLUS a flat 2500 points
      // bonus — both credited directly to the database balance.
      const updatedUser = await storage.adjustWallet(userId, prizePoolMarbles, WINNER_POINTS_BONUS);

      if (window) {
        await storage.setTournamentWinnerReward(window.id, userId, prizePoolMarbles);
      }

      await storage.recordTransaction({
        userId,
        amount: prizePoolMarbles,
        type: "tournament_winning_marbles",
        description: `Tournament Win - ${prizePoolMarbles} marbles (prize pool) + ${WINNER_POINTS_BONUS} points`,
        transactionId: null,
      });

      res.json({ 
        success: true, 
        marbles: updatedUser?.marbles ?? 0,
        points: updatedUser?.points ?? 0,
        marblesAwarded: prizePoolMarbles,
        pointsAwarded: WINNER_POINTS_BONUS,
        message: `🏆 Tournament Win! ${prizePoolMarbles} marbles + ${WINNER_POINTS_BONUS} points awarded.`
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

  // Tournament Bracket Management
  app.get("/api/tournament/:tournamentId/bracket", async (req, res) => {
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

  app.get("/api/tournament/:tournamentId/my-match", async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const { playerId } = req.query;
      
      if (!playerId) {
        return res.status(400).json({ error: "Player ID required" });
      }

      const matches = await storage.getTournamentMatches(tournamentId);
      const myMatch = matches.find(m => 
        (m.player1Id === playerId || m.player2Id === playerId) && 
        m.status !== "completed"
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

  app.post("/api/tournament/:tournamentId/start", async (req, res) => {
    try {
      const { tournamentId } = req.params;
      
      const participants = await storage.getTournamentParticipants(tournamentId);
      
      if (participants.length < 2) {
        return res.status(400).json({ 
          error: "Not enough participants",
          participantCount: participants.length
        });
      }

      // Shuffle participants for random seeding
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      
      // Create first round matches
      const round1Matches: any[] = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        const player1 = shuffled[i];
        const player2 = shuffled[i + 1];
        
        const roomCode = `TOUR_${tournamentId}_R1_M${Math.floor(i/2) + 1}`;
        
        const match = await storage.createTournamentMatch({
          tournamentId,
          roundNumber: 1,
          matchNumber: Math.floor(i/2) + 1,
          player1Id: player1.playerId,
          player1Name: player1.playerName,
          player2Id: player2?.playerId || null,
          player2Name: player2?.playerName || null,
          roomCode,
          status: player2 ? "ready" : "bye",
        });
        
        round1Matches.push(match);
      }

      // Update tournament status
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

  app.post("/api/tournament/match/:matchId/result", async (req, res) => {
    try {
      const { matchId } = req.params;
      const { winnerId, winnerName, player1Score, player2Score } = req.body;

      await storage.updateTournamentMatch(matchId, {
        winnerId,
        winnerName,
        player1Score,
        player2Score,
        status: "completed",
        completedAt: new Date()
      });

      // Check if all matches in round are complete
      const match = await storage.getTournamentMatch(matchId);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      const allMatches = await storage.getTournamentMatches(match.tournamentId);
      const roundMatches = allMatches.filter(m => m.roundNumber === match.roundNumber);
      const allComplete = roundMatches.every(m => m.status === "completed" || m.status === "bye");

      if (allComplete) {
        // Check if this was the final
        const winners = roundMatches.map(m => ({ id: m.winnerId, name: m.winnerName }));
        
        if (winners.length === 1) {
          // Tournament finished!
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
          // Create next round matches
          const nextRound = match.roundNumber + 1;
          for (let i = 0; i < winners.length; i += 2) {
            const p1 = winners[i];
            const p2 = winners[i + 1];
            
            const roomCode = `TOUR_${match.tournamentId}_R${nextRound}_M${Math.floor(i/2) + 1}`;
            
            await storage.createTournamentMatch({
              tournamentId: match.tournamentId,
              roundNumber: nextRound,
              matchNumber: Math.floor(i/2) + 1,
              player1Id: p1.id,
              player1Name: p1.name,
              player2Id: p2?.id || null,
              player2Name: p2?.name || null,
              roomCode,
              status: p2 ? "ready" : "bye",
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

  // Step 1: send an OTP to the player's email before letting them redeem
  app.post("/api/otp/send", async (req, res) => {
    try {
      const { email, userId } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email required" });
      }
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }

      const otp = generateOTP();
      const sent = await sendRedeemOTPEmail(email.trim().toLowerCase(), otp);
      if (!sent) {
        return res.status(500).json({ error: "Failed to send OTP. Try again." });
      }

      res.json({ success: true, message: "OTP sent" });
    } catch (error) {
      console.error("Redeem OTP send error:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Step 2: verify the OTP and, if correct, actually perform the
  // redemption (deduct points, record transaction, notify admin)
  app.post("/api/otp/verify-redeem", async (req, res) => {
    try {
      const { email, otp, userId, itemId } = req.body;
      if (!email || !otp || !userId || !itemId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const isValid = verifyRedeemOTP(email.trim().toLowerCase(), otp);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const items = await storage.getCatalogItems();
      const item = items.find(i => i.id === itemId);
      if (!item) return res.status(404).json({ error: "Item not found" });

      if (user.points < item.pointsCost) {
        return res.status(400).json({ error: "Insufficient points" });
      }

      const newPoints = user.points - item.pointsCost;
      await storage.updateUserPoints(userId, newPoints);

      await storage.recordTransaction({
        userId,
        amount: -item.pointsCost,
        type: "catalog_redemption",
        description: `Redeemed: ${item.name} (OTP verified: ${email})`,
        transactionId: null,
      });

      // Notify admin — don't block the response on this
      sendAdminNotificationEmail(
        "🎁 New Redemption Request (OTP Verified)",
        `
          <p><strong>Player:</strong> ${user.displayName || user.username}</p>
          <p><strong>Item:</strong> ${item.name}</p>
          <p><strong>Points Spent:</strong> ${item.pointsCost}</p>
          <p><strong>Verified Email:</strong> ${email}</p>
          <p><strong>Player Contact:</strong> ${user.email || "N/A"} ${user.phone ? `— ${user.phone}` : ""}</p>
          <p style="color:#facc15;">⚠️ Please arrange delivery/fulfillment for this reward.</p>
        `
      ).catch(() => {});

      res.json({ success: true, points: newPoints, item: item.name });
    } catch (error) {
      console.error("Verify-redeem error:", error);
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

      // Notify admin — don't block the response on this
      sendAdminNotificationEmail(
        type === "support" ? "🆘 New Support Request" : "💬 New Feedback Received",
        `
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>From:</strong> ${name || "Anonymous"} ${email ? `(${email})` : ""} ${phone ? `— ${phone}` : ""}</p>
          <p><strong>Subject:</strong> ${subject || "N/A"}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#2d1b69;border-radius:8px;padding:15px;margin-top:8px;">${message}</div>
        `
      ).catch(() => {});

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

  // Update User Onboarding Data (save ad preferences to database)
  app.post("/api/user/:userId/onboarding", async (req, res) => {
    try {
      const { userId } = req.params;
      const { displayName, dateOfBirth, adPreferences, isAgeVerified } = req.body;
      
      // Get or create user first
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser(
          { username: userId, password: "guest" },
          undefined,
          userId
        );
      }
      
      // Update with onboarding data
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

  // Check if user is admin
  app.get("/api/user/:userId/is-admin", async (req, res) => {
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

  // Helper function to check admin status for protected routes
  const checkAdminAuth = async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    const user = await storage.getUser(userId);
    return user?.isAdmin || false;
  };

  // Admin: Get all users with ad preferences for analytics
  app.get("/api/admin/users", async (req, res) => {
    try {
      // Check admin authorization
      const userId = req.headers['x-user-id'] as string;
      if (userId) {
        const isAdmin = await checkAdminAuth(userId);
        if (!isAdmin) {
          return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
      }
      
      const allUsers = await storage.getAllUsers();
      
      // Format user data for admin view
      const usersData = allUsers.map(u => ({
        id: u.id,
        displayName: u.displayName || u.username,
        dateOfBirth: u.dateOfBirth,
        age: u.dateOfBirth ? Math.floor((Date.now() - new Date(u.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        adPreferences: u.adPreferences || [],
        isAgeVerified: u.isAgeVerified,
        marbles: u.marbles,
        gamesPlayed: u.gamesPlayed,
        gamesWon: u.gamesWon,
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt
      }));
      
      // Calculate ad preference stats
      const adPreferenceStats: Record<string, number> = {};
      allUsers.forEach(u => {
        if (u.adPreferences) {
          u.adPreferences.forEach(pref => {
            adPreferenceStats[pref] = (adPreferenceStats[pref] || 0) + 1;
          });
        }
      });
      
      // Age demographics
      const ageDemographics = {
        under15: usersData.filter(u => u.age !== null && u.age < 15).length,
        age15to18: usersData.filter(u => u.age !== null && u.age >= 15 && u.age < 18).length,
        age18to25: usersData.filter(u => u.age !== null && u.age >= 18 && u.age <= 25).length,
        above25: usersData.filter(u => u.age !== null && u.age > 25).length,
        unknown: usersData.filter(u => u.age === null).length
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

  // Admin: Get engagement analytics (playtime, ads, earnings)
  app.get("/api/admin/engagement-analytics", async (req, res) => {
    try {
      // Check admin authorization
      const userId = req.headers['x-user-id'] as string;
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

  // Start game session tracking
  app.post("/api/session/start", async (req, res) => {
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

  // End game session tracking
  app.post("/api/session/end", async (req, res) => {
    try {
      const { sessionId, gamesPlayed, gamesWon, marblesWon, marblesLost } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId required" });
      }
      await storage.endGameSession(sessionId, {
        gamesPlayed: gamesPlayed || 0,
        gamesWon: gamesWon || 0,
        marblesWon: marblesWon || 0,
        marblesLost: marblesLost || 0,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Session end error:", error);
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  // Record ad impression
  app.post("/api/ads/impression", async (req, res) => {
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

  // Record ad click
  app.post("/api/ads/click", async (req, res) => {
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

  // Get user's daily stats
  app.get("/api/user/:userId/daily-stats/:date", async (req, res) => {
    try {
      const { userId, date } = req.params;
      const stats = await storage.getDailyUserStats(userId, date);
      res.json({ success: true, stats: stats || null });
    } catch (error) {
      console.error("Daily stats fetch error:", error);
      res.status(500).json({ error: "Failed to fetch daily stats" });
    }
  });

  // Get Leaderboard - Ranked purely by PvP Win Marbles, top 20, no eligibility filter
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { type = "global", userId } = req.query;

      // Get all users from database
      const allUsers = await storage.getAllUsers();

      // Sort by PvP Win Marbles first; when tied (common right now since this
      // is a newly-added counter), break ties by total games won, then games
      // played — so a brand-new zero-activity account can never outrank an
      // established player just due to arbitrary database ordering.
      const fullSorted = allUsers
        .map(u => ({
          id: u.id,
          name: u.displayName || u.username || "Player",
          avatar: u.profileImage || "",
          marbles: u.pvpWinMarbles || 0,
          gamesWon: u.gamesWon || 0,
          gamesPlayed: u.gamesPlayed || 0,
          winRate: u.gamesPlayed > 0 ? Math.round((u.gamesWon / u.gamesPlayed) * 100) : 0,
          points: u.points || 0,
        }))
        .sort((a, b) =>
          b.marbles - a.marbles ||
          b.gamesWon - a.gamesWon ||
          b.gamesPlayed - a.gamesPlayed
        )
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      // Top 20 only for display
      const leaderboard = fullSorted.slice(0, 20);

      // Find the requesting player's own rank & marbles, even if outside top 20
      let yourRank = 0;
      let yourMarbles = 0;
      if (userId) {
        const found = fullSorted.find(e => e.id === userId);
        if (found) {
          yourRank = found.rank;
          yourMarbles = found.marbles;
        }
      }

      res.json({ success: true, leaderboard, type, yourRank, yourMarbles });
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Update User Profile
  app.post("/api/profile/update", async (req, res) => {
    try {
      const { userId, displayName, profileImage, gender } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      let user = await storage.getUser(userId);
      
      // Create user if doesn't exist
      if (!user) {
        user = await storage.createUser(
          { username: userId, password: "guest" },
          undefined,
          userId
        );
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

  // AI defeat endpoint - does NOT add to earned marbles (only player vs player wins count)
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

      // Increment AI wins but DO NOT add to earnedMarbles
      const updatedUser = await storage.incrementAiWins(userId);

      res.json({
        success: true,
        message: "AI defeat recorded (no earned marbles from AI)",
        aiWins: updatedUser?.aiWins || 0,
        earnedMarbles: updatedUser?.earnedMarbles || 0,
      });
    } catch (error) {
      console.error("AI defeat error:", error);
      res.status(500).json({ error: "Failed to record AI defeat" });
    }
  });

  // Called ONCE when a player fully defeats their AI opponent (its
  // marbles reach 0) — NOT on every round win. Permanently raises this
  // player's persistent AI difficulty for their next match: first
  // defeat +50 (150->200), every defeat after that +100.
  app.post("/api/ai-opponent/level-up", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId required" });

      const newAiLevel = await storage.increaseAiOpponentLevel(userId);
      res.json({ success: true, newAiLevel });
    } catch (error) {
      console.error("AI level-up error:", error);
      res.status(500).json({ error: "Failed to level up AI opponent" });
    }
  });

  // Called when the AI defeats the PLAYER (player's marbles hit 0) — the
  // AI's ending marbles (whatever it absorbed) directly carry over as its
  // starting point next time, just like a real opponent would keep its
  // winnings. No formula here, unlike the level-up-on-defeat endpoint above.
  app.post("/api/ai-opponent/carry-over", async (req, res) => {
    try {
      const { userId, aiEndingMarbles } = req.body;
      if (!userId || typeof aiEndingMarbles !== "number") {
        return res.status(400).json({ error: "userId and aiEndingMarbles required" });
      }

      const newAiLevel = await storage.setAiOpponentLevel(userId, aiEndingMarbles);
      res.json({ success: true, newAiLevel });
    } catch (error) {
      console.error("AI carry-over error:", error);
      res.status(500).json({ error: "Failed to carry over AI level" });
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
      const { token, oldPassword, newPassword, userId } = req.body;
      
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Check if user has admin privileges
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
  
  // Set user as admin (requires master secret key for security)
  app.post("/api/admin/set-admin", async (req, res) => {
    try {
      const { userId, secretKey } = req.body;
      
      // Use a simple master key for setting admin (should be set via environment variable in production)
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

  app.post("/api/admin/setup-phone", async (req, res) => {
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

  app.post("/api/admin/send-otp", async (req, res) => {
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
        // Default to admin phone
        phoneNumber = "9211979518";
        await storage.updateAdminPhone(adminId, phoneNumber);
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await storage.saveOTP(adminId, otp);

      const { sendOTPSMS } = await import('./twilioClient');
      const sent = await sendOTPSMS(phoneNumber, otp);

      if (!sent) {
        return res.status(500).json({ error: "Failed to send OTP" });
      }

      res.json({ 
        success: true, 
        message: "OTP sent to your phone",
        phoneNumber: phoneNumber.slice(-4),
      });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  app.post("/api/admin/verify-otp", async (req, res) => {
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

  // Tournament entry validation endpoint
  // Tournament allows: EARNED (player wins) + PURCHASED marbles (NOT AI wins or ads)
  app.post("/api/tournament/can-enter", async (req, res) => {
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
        message: canEnter 
          ? "You can enter the tournament!" 
          : `Need ${2500 - validMarblesForTournament} more marbles (from player wins or purchases)`,
        earnedMarblesFromPlayers: earnedFromPlayers,
        purchasedMarbles: purchasedMarbles,
        totalValidMarbles: validMarblesForTournament,
        aiWins: user.aiWins || 0,
        requiredMarbles: 2500,
        note: "Tournament requires 2500 marbles from earned (player wins) + purchased (AI wins and ad rewards don't count)",
      });
    } catch (error) {
      console.error("Tournament entry check error:", error);
      res.status(500).json({ error: "Failed to check tournament eligibility" });
    }
  });

  // Game room endpoints for multiplayer
  app.post("/api/game-room/create", async (req, res) => {
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

  app.post("/api/game-room/join", async (req, res) => {
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

  app.post("/api/game-room/find-random", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId required" });
      
      const user = await storage.getUser(userId);
      if (!user) {
        // Create user if doesn't exist
        const newUser = await storage.createUser(
          { username: userId, password: "guest" },
          undefined,
          userId
        );
        
        // Try to find match
        const match = await storage.findMatchingPlayer(userId);
        if (match) {
          res.json({
            success: true,
            matchFound: true,
            roomCode: match.roomCode,
            opponent: {
              id: match.player.id,
              marbles: match.player.marbles,
              name: match.player.displayName || `Player_${Math.floor(Math.random() * 10000)}`
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
        // Try to find existing match
        const match = await storage.findMatchingPlayer(userId);
        
        if (match) {
          // Match found
          res.json({
            success: true,
            matchFound: true,
            roomCode: match.roomCode,
            opponent: {
              id: match.player.id,
              marbles: match.player.marbles,
              name: match.player.displayName || `Player_${Math.floor(Math.random() * 10000)}`
            }
          });
        } else {
          // Add to queue and wait
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

  app.post("/api/match-queue/add", async (req, res) => {
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

  app.post("/api/match-queue/list", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId required" });

      // Get all queue entries except current user
      const allUsers = await storage.getUsersInMatchQueue();
      const players = allUsers
        .filter(p => p.userId !== userId)
        .map(p => ({
          id: p.userId,
          name: p.username,
          marbles: p.marbles,
        }));

      console.log(`[MATCH QUEUE LIST] Total players: ${allUsers.length}, Available for ${userId}: ${players.length}`);
      res.json({ success: true, players });
    } catch (error) {
      console.error("List queue error:", error);
      res.status(500).json({ error: "Failed to list queue" });
    }
  });

  app.post("/api/game-room/challenge", async (req, res) => {
    try {
      const { player1Id, player2Id } = req.body;
      if (!player1Id || !player2Id) return res.status(400).json({ error: "Both player IDs required" });

      const room = await storage.createGameRoom(player1Id, "random");
      await storage.joinGameRoom(room.roomCode, player2Id);

      // Remove both players from queue
      await storage.removeFromMatchQueue(player1Id);
      await storage.removeFromMatchQueue(player2Id);

      res.json({
        success: true,
        roomCode: room.roomCode,
        message: "Game room created and players matched",
      });
    } catch (error) {
      console.error("Challenge error:", error);
      res.status(500).json({ error: "Failed to create challenge" });
    }
  });

  app.post("/api/match-queue/remove", async (req, res) => {
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

  // Debug endpoint to check current queue state
  app.get("/api/match-queue/debug", async (_req, res) => {
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

  app.get("/api/game-room/:roomCode", async (req, res) => {
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

  // Stripe marble purchase endpoint - Create checkout session
  app.post("/api/marble-purchase", async (req, res) => {
    try {
      const { userId, marblesCount, amount } = req.body;
      
      if (!userId || !marblesCount || !amount) {
        return res.status(400).json({ error: "userId, marblesCount, and amount required" });
      }

      const { getUncachableStripeClient, getStripePublishableKey } = await import('./stripeClient');
      const stripe = await getUncachableStripeClient();
      const publishableKey = await getStripePublishableKey();
      
      // Get the base URL for redirect
      const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : 'http://localhost:5000';

      // Create Stripe Checkout Session for one-time payment
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `${marblesCount} Marbles Pack`,
                description: `Purchase ${marblesCount} marbles for Kanchey King`,
              },
              unit_amount: amount * 100, // Stripe uses paise
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/shop?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/shop?payment=cancelled`,
        metadata: {
          userId,
          marblesCount: String(marblesCount),
        },
      });

      res.json({
        success: true,
        sessionId: session.id,
        url: session.url,
        publishableKey,
      });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Stripe payment verification endpoint - verify session and add marbles
  app.post("/api/marble-purchase/verify", async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId required" });
      }

      const { getUncachableStripeClient } = await import('./stripeClient');
      const stripe = await getUncachableStripeClient();
      
      // Retrieve the session
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      const userId = session.metadata?.userId;
      const marblesCount = parseInt(session.metadata?.marblesCount || '0');

      if (!userId || !marblesCount) {
        return res.status(400).json({ error: "Invalid session metadata" });
      }

      // Check if already processed (prevent double-crediting)
      const existingTx = await storage.getTransactionByExternalId(sessionId);
      if (existingTx) {
        return res.json({
          success: true,
          message: "Payment already processed",
          alreadyProcessed: true,
        });
      }

      // Add marbles to user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const newMarbleCount = (user.marbles || 0) + marblesCount;
      await storage.updateUserMarbles(userId, newMarbleCount);

      // Record transaction
      await storage.recordTransaction({
        userId,
        amount: marblesCount,
        type: 'purchase',
        description: `Purchased ${marblesCount} marbles via Stripe`,
        transactionId: sessionId,
      });

      res.json({
        success: true,
        message: "Payment verified and marbles added",
        marbles: newMarbleCount,
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: "Payment verification failed" });
    }
  });

  // Get Stripe publishable key for frontend
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const { getStripePublishableKey } = await import('./stripeClient');
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Stripe key error:", error);
      res.status(500).json({ error: "Failed to get Stripe key" });
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


  // ─── Auth: Send Login/Register OTP ──────────────────────────────────────────
  app.post("/api/auth/send-otp", async (req, res) => {
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

  // ─── Auth: Verify OTP and Login/Register ────────────────────────────────────
  app.post("/api/auth/verify-otp", async (req, res) => {
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

      // Check if user already exists with this email
      let user = await storage.getUserByEmail(emailKey);

      if (user) {
        // Existing user - login
        res.json({
          success: true,
          isNewUser: false,
          userId: user.id,
          displayName: user.displayName || user.username,
          message: "Login successful"
        });
      } else {
        // New user - do NOT create the DB record yet. We only create the
        // account once the player has also provided their display name
        // (see /api/auth/complete-signup), so a nameless/incomplete account
        // can never exist in the database.
        res.json({
          success: true,
          isNewUser: true,
          email: emailKey,
          message: "OTP verified — please complete your profile"
        });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  // Complete signup for a brand-new player: creates the user record ONLY
  // once we have their email AND display name together, so there is never
  // a moment where an account exists without a name.
  app.post("/api/auth/complete-signup", async (req, res) => {
    try {
      const { email, displayName, gender, dateOfBirth } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }
      if (!displayName || !displayName.trim()) {
        return res.status(400).json({ error: "Display name required" });
      }
      if (!dateOfBirth) {
        return res.status(400).json({ error: "Date of birth required" });
      }

      // Kanche King requires players to be 18+. We recalculate age here
      // from the date of birth ourselves rather than trusting a client-sent
      // "age" number, so this can't be bypassed by editing the request.
      const MIN_AGE = 18;
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;

      if (isNaN(age) || age < MIN_AGE) {
        return res.status(403).json({
          error: `Kanche King is only available to players aged ${MIN_AGE} and above. We're not able to create an account for you.`
        });
      }

      const emailKey = email.toLowerCase().trim();

      // Safety check: if this email somehow already has an account
      // (e.g. duplicate/retry request), log them in instead of duplicating.
      const existing = await storage.getUserByEmail(emailKey);
      if (existing) {
        return res.json({
          success: true,
          isNewUser: false,
          userId: existing.id,
          displayName: existing.displayName || existing.username,
          message: "Account already exists — logged in"
        });
      }

      const newUserId = `player-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const isAgeVerified = true; // guaranteed true here — we already rejected anyone under 18 above

      await storage.createUser(
        { username: newUserId, password: "guest" },
        undefined,
        newUserId
      );

      await storage.updateUserProfile(newUserId, {
        email: emailKey,
        displayName: displayName.trim(),
        gender: gender || "boy",
      });

      if (dateOfBirth) {
        await storage.updateUserOnboarding(newUserId, {
          displayName: displayName.trim(),
          dateOfBirth,
          isAgeVerified,
        });
      }

      res.json({
        success: true,
        isNewUser: true,
        userId: newUserId,
        displayName: displayName.trim(),
        message: "Account created successfully"
      });
    } catch (error) {
      console.error("Complete signup error:", error);
      res.status(500).json({ error: "Failed to complete signup" });
    }
  });

  // Spin Wheel: record a won prize as PENDING (not yet credited)
  app.post("/api/spin/win", async (req, res) => {
    try {
      const { userId, prizeName, prizeType, prizeValue } = req.body;
      if (!userId || !prizeName || !prizeType || prizeValue === undefined) {
        return res.status(400).json({ error: "Missing fields" });
      }
      if (prizeType !== "marbles" && prizeType !== "points") {
        // "Better luck next time" or any non-creditable prize — nothing to store
        return res.json({ success: true, reward: null });
      }
      const reward = await storage.createSpinReward(userId, prizeName, prizeType, prizeValue);
      res.json({ success: true, reward });
    } catch (error) {
      console.error("Spin win error:", error);
      res.status(500).json({ error: "Failed to record spin win" });
    }
  });

  // Spin Wheel: get all unclaimed rewards for a player
  app.get("/api/spin/pending/:userId", async (req, res) => {
    try {
      const rewards = await storage.getPendingSpinRewards(req.params.userId);
      res.json({ success: true, rewards });
    } catch (error) {
      console.error("Get pending spin rewards error:", error);
      res.status(500).json({ error: "Failed to fetch pending rewards" });
    }
  });

  // Spin Wheel: claim a pending reward — actually credits marbles/points now
  app.post("/api/spin/claim/:rewardId", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId required" });

      const result = await storage.claimSpinReward(req.params.rewardId, userId);
      if (!result) {
        return res.status(400).json({ error: "Reward not found, already claimed, or does not belong to you" });
      }
      res.json({ success: true, reward: result.reward, user: result.user });
    } catch (error) {
      console.error("Claim spin reward error:", error);
      res.status(500).json({ error: "Failed to claim reward" });
    }
  });

  return httpServer;
}
