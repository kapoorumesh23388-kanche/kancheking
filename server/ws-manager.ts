import { WebSocket } from "ws";

interface GameMessage {
  type: "join" | "move" | "guess" | "result" | "chat" | "sync" | "presence" | "challenge" | "challenge_response" | "get_online_players";
  roomCode?: string;
  playerId: string;
  data: any;
}

interface ConnectedPlayer {
  ws: WebSocket;
  playerId: string;
  roomCode: string;
  playerName: string;
  marbles: number;
  profileImage?: string;
  currentMode?: string;
  lastSeen: number;
}

const connectedPlayers: Map<string, ConnectedPlayer> = new Map();
const roomConnections: Map<string, Set<string>> = new Map();
const onlinePlayers: Map<string, ConnectedPlayer> = new Map();

export function handleNewConnection(ws: WebSocket) {
  let currentPlayerId: string = "";
  let currentRoomCode: string = "";

  ws.on("message", (data: string) => {
    try {
      const message: GameMessage = JSON.parse(data);

      if (message.type === "presence") {
        currentPlayerId = message.playerId;
        const playerData = message.data || {};
        
        onlinePlayers.set(currentPlayerId, {
          ws,
          playerId: currentPlayerId,
          roomCode: "",
          playerName: playerData.name || `Player_${currentPlayerId.slice(-6)}`,
          marbles: playerData.marbles || 0,
          profileImage: playerData.profileImage,
          currentMode: playerData.currentMode || "lobby",
          lastSeen: Date.now(),
        });
        
        console.log(`[PRESENCE] ${playerData.name || currentPlayerId} is online (mode: ${playerData.currentMode})`);
        
        ws.send(JSON.stringify({
          type: "presence_ack",
          playerId: currentPlayerId,
          data: { online: true }
        }));
        
      } else if (message.type === "get_online_players") {
        const players = Array.from(onlinePlayers.values())
          .filter(p => p.playerId !== message.playerId)
          .map(p => ({
            id: p.playerId,
            name: p.playerName,
            marbles: p.marbles,
            profileImage: p.profileImage,
            currentMode: p.currentMode,
          }));
        
        ws.send(JSON.stringify({
          type: "online_players",
          playerId: message.playerId,
          data: { players, total: onlinePlayers.size }
        }));
        
      } else if (message.type === "challenge") {
        const targetId = message.data.targetPlayerId;
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
              roomCode: message.data.roomCode,
            }
          }));
          console.log(`[CHALLENGE] ${message.playerId} challenged ${targetId}`);
        } else {
          ws.send(JSON.stringify({
            type: "challenge_failed",
            playerId: message.playerId,
            data: { error: "Player is offline", targetPlayerId: targetId }
          }));
        }
        
      } else if (message.type === "challenge_response") {
        const challengerId = message.data.challengerId;
        const challenger = onlinePlayers.get(challengerId);
        
        if (challenger && challenger.ws.readyState === 1) {
          challenger.ws.send(JSON.stringify({
            type: "challenge_result",
            playerId: message.playerId,
            data: {
              accepted: message.data.accepted,
              responderId: message.playerId,
              responderName: onlinePlayers.get(message.playerId)?.playerName,
              roomCode: message.data.roomCode,
            }
          }));
          console.log(`[CHALLENGE RESPONSE] ${message.playerId} ${message.data.accepted ? 'accepted' : 'declined'} challenge from ${challengerId}`);
        }
        
      } else if (message.type === "join") {
        currentPlayerId = message.playerId;
        currentRoomCode = message.roomCode || "";

        connectedPlayers.set(currentPlayerId, {
          ws,
          playerId: currentPlayerId,
          roomCode: currentRoomCode,
          playerName: onlinePlayers.get(currentPlayerId)?.playerName || `Player_${Math.floor(Math.random() * 10000)}`,
          marbles: onlinePlayers.get(currentPlayerId)?.marbles || 0,
          lastSeen: Date.now(),
        });

        if (currentRoomCode) {
          if (!roomConnections.has(currentRoomCode)) {
            roomConnections.set(currentRoomCode, new Set());
          }
          roomConnections.get(currentRoomCode)!.add(currentPlayerId);

          broadcastToRoom(currentRoomCode, {
            type: "join",
            roomCode: currentRoomCode,
            playerId: currentPlayerId,
            data: { playerCount: roomConnections.get(currentRoomCode)!.size },
          });
        }

        console.log(`Player ${currentPlayerId} joined room ${currentRoomCode}`);
      } else if (message.type === "chat") {
        broadcastToRoom(currentRoomCode, message);
      } else {
        broadcastToRoom(currentRoomCode, message);
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  ws.on("close", () => {
    if (currentPlayerId) {
      onlinePlayers.delete(currentPlayerId);
      connectedPlayers.delete(currentPlayerId);
      console.log(`[PRESENCE] ${currentPlayerId} went offline`);
    }
    if (currentRoomCode) {
      const room = roomConnections.get(currentRoomCode);
      if (room) {
        room.delete(currentPlayerId);
        if (room.size === 0) {
          roomConnections.delete(currentRoomCode);
        }
      }
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
}

export function getOnlinePlayers() {
  return Array.from(onlinePlayers.values()).map(p => ({
    id: p.playerId,
    name: p.playerName,
    marbles: p.marbles,
    profileImage: p.profileImage,
    currentMode: p.currentMode,
  }));
}

export function getOnlinePlayerCount() {
  return onlinePlayers.size;
}

export function broadcastToRoom(roomCode: string, message: any) {
  const room = roomConnections.get(roomCode);
  if (!room) return;

  const messageStr = JSON.stringify(message);
  room.forEach((playerId) => {
    const player = connectedPlayers.get(playerId);
    if (player && player.ws.readyState === 1) {
      // 1 = OPEN
      player.ws.send(messageStr);
    }
  });
}

export function broadcastToPlayer(playerId: string, message: any) {
  const player = connectedPlayers.get(playerId);
  if (player && player.ws.readyState === 1) {
    player.ws.send(JSON.stringify(message));
  }
}
