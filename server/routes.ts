import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";

const connectedClients = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Catalog endpoints
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

  // Marble purchase endpoints
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
        transactionId,
      });

      // Notify user via WebSocket
      const ws = connectedClients.get(userId);
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "marbles_updated", marbles: newMarbles }));
      }

      res.json({ marbles: newMarbles, success: true });
    } catch (error) {
      res.status(500).json({ error: "Purchase failed" });
    }
  });

  // Referral endpoints
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

      // Award 50 marbles to referrer
      const referrerNewMarbles = referrer.marbles + 50;
      await storage.updateUserMarbles(referrer.id, referrerNewMarbles);
      
      await storage.recordTransaction({
        userId: referrer.id,
        amount: 50,
        type: "referral",
        description: `Referral bonus from ${user.username}`,
      });

      // Notify referrer
      const referrerWs = connectedClients.get(referrer.id);
      if (referrerWs && referrerWs.readyState === 1) {
        referrerWs.send(JSON.stringify({ 
          type: "marbles_updated", 
          marbles: referrerNewMarbles,
          message: "Got 50 marbles from referral!" 
        }));
      }

      res.json({ success: true, message: "Referral validated" });
    } catch (error) {
      res.status(500).json({ error: "Referral validation failed" });
    }
  });

  // Game points endpoints
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
      await storage.getUser(userId).then(u => {
        if (u) {
          u.gamesWon = newGamesWon;
          u.gamesPlayed = newGamesPlayed;
        }
      });

      await storage.addGamePoints({
        userId,
        points,
        gameType,
        opponent,
        won,
      });

      // Notify user
      const ws = connectedClients.get(userId);
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ 
          type: "points_updated", 
          points: newPoints,
          gamesWon: newGamesWon,
          gamesPlayed: newGamesPlayed,
        }));
      }

      res.json({ points: newPoints, success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record game points" });
    }
  });

  // Tournament endpoints
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

      // Deduct entry fee
      const newMarbles = user.marbles - 2500;
      await storage.updateUserMarbles(userId, newMarbles);

      await storage.recordTransaction({
        userId,
        amount: -2500,
        type: "game_loss",
        description: "Tournament entry fee",
      });

      // Update window player count
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

  const httpServer = createServer(app);
  
  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", (data: string) => {
      try {
        const message = JSON.parse(data);
        if (message.type === "subscribe" && message.userId) {
          connectedClients.set(message.userId, ws);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      for (const [userId, client] of connectedClients.entries()) {
        if (client === ws) {
          connectedClients.delete(userId);
        }
      }
    });
  });

  return httpServer;
}
