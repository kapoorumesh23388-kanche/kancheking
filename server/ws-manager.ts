import { WebSocket } from "ws";

interface GameMessage {
  type: "join" | "move" | "guess" | "result" | "chat" | "sync";
  roomCode: string;
  playerId: string;
  data: any;
}

interface ConnectedPlayer {
  ws: WebSocket;
  playerId: string;
  roomCode: string;
  playerName: string;
}

const connectedPlayers: Map<string, ConnectedPlayer> = new Map();
const roomConnections: Map<string, Set<string>> = new Map();

export function handleNewConnection(ws: WebSocket) {
  let currentPlayerId: string = "";
  let currentRoomCode: string = "";

  ws.on("message", (data: string) => {
    try {
      const message: GameMessage = JSON.parse(data);

      if (message.type === "join") {
        currentPlayerId = message.playerId;
        currentRoomCode = message.roomCode;

        // Store player connection
        connectedPlayers.set(currentPlayerId, {
          ws,
          playerId: currentPlayerId,
          roomCode: currentRoomCode,
          playerName: `Player_${Math.floor(Math.random() * 10000)}`,
        });

        // Add to room
        if (!roomConnections.has(currentRoomCode)) {
          roomConnections.set(currentRoomCode, new Set());
        }
        roomConnections.get(currentRoomCode)!.add(currentPlayerId);

        // Notify others in room
        broadcastToRoom(currentRoomCode, {
          type: "join",
          roomCode: currentRoomCode,
          playerId: currentPlayerId,
          data: { playerCount: roomConnections.get(currentRoomCode)!.size },
        });

        console.log(`Player ${currentPlayerId} joined room ${currentRoomCode}`);
      } else if (message.type === "chat") {
        // Broadcast chat to entire room
        broadcastToRoom(currentRoomCode, message);
      } else {
        // Broadcast other game messages to room
        broadcastToRoom(currentRoomCode, message);
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  ws.on("close", () => {
    if (currentPlayerId && currentRoomCode) {
      connectedPlayers.delete(currentPlayerId);
      const room = roomConnections.get(currentRoomCode);
      if (room) {
        room.delete(currentPlayerId);
        if (room.size === 0) {
          roomConnections.delete(currentRoomCode);
        }
      }
      console.log(`Player ${currentPlayerId} left room ${currentRoomCode}`);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
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
