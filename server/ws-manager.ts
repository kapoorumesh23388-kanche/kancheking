import { WebSocket } from "ws";

interface GameMessage {
  type: "join" | "join_room" | "move" | "guess" | "result" | "chat" | "sync" | "presence" | "challenge" | "challenge_response" | "get_online_players" | "game_action" | "marble_update";
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
  isCreator?: boolean;
}

interface RoomData {
  players: Map<string, ConnectedPlayer>;
  creatorId: string;
  gameState: {
    phase: string;
    currentHider: string;
    hiddenMarbles: number;
    currentBet: number;
    lastGuess: string;
  };
}

const connectedPlayers: Map<string, ConnectedPlayer> = new Map();
const roomConnections: Map<string, Set<string>> = new Map();
const onlinePlayers: Map<string, ConnectedPlayer> = new Map();
const rooms: Map<string, RoomData> = new Map();

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
        
      } else if (message.type === "join_room") {
        // New room joining with full player data
        currentPlayerId = message.playerId;
        currentRoomCode = message.roomCode || "";
        const playerData = message.data || {};
        
        const playerInfo: ConnectedPlayer = {
          ws,
          playerId: currentPlayerId,
          roomCode: currentRoomCode,
          playerName: playerData.playerName || `Player_${Math.floor(Math.random() * 10000)}`,
          marbles: playerData.marbles || 150,
          profileImage: playerData.profileImage,
          lastSeen: Date.now(),
          isCreator: playerData.isCreator || false,
        };
        
        connectedPlayers.set(currentPlayerId, playerInfo);
        
        if (currentRoomCode) {
          if (!roomConnections.has(currentRoomCode)) {
            roomConnections.set(currentRoomCode, new Set());
          }
          roomConnections.get(currentRoomCode)!.add(currentPlayerId);
          
          // Initialize room data if creator
          if (playerData.isCreator) {
            rooms.set(currentRoomCode, {
              players: new Map([[currentPlayerId, playerInfo]]),
              creatorId: currentPlayerId,
              gameState: {
                phase: "waiting",
                currentHider: currentPlayerId,
                hiddenMarbles: 0,
                currentBet: 10,
                lastGuess: "",
              }
            });
            console.log(`[ROOM] Room ${currentRoomCode} created by ${playerInfo.playerName}`);
          } else {
            // Player is joining existing room
            const room = rooms.get(currentRoomCode);
            if (room) {
              room.players.set(currentPlayerId, playerInfo);
              
              // Notify room creator that someone joined
              const allPlayersInRoom = Array.from(room.players.values());
              const otherPlayers = allPlayersInRoom.filter(p => p.playerId !== currentPlayerId);
              
              otherPlayers.forEach(player => {
                if (player.ws.readyState === 1) {
                  player.ws.send(JSON.stringify({
                    type: "player_joined",
                    roomCode: currentRoomCode,
                    playerId: currentPlayerId,
                    data: {
                      playerName: playerInfo.playerName,
                      marbles: playerInfo.marbles,
                      profileImage: playerInfo.profileImage,
                      playerCount: room.players.size,
                    }
                  }));
                }
              });
              
              // Send room info to the joining player
              ws.send(JSON.stringify({
                type: "room_info",
                roomCode: currentRoomCode,
                playerId: currentPlayerId,
                data: {
                  players: allPlayersInRoom.map(p => ({
                    id: p.playerId,
                    name: p.playerName,
                    marbles: p.marbles,
                    profileImage: p.profileImage,
                    isCreator: p.isCreator,
                  })),
                  gameState: room.gameState,
                }
              }));
              
              console.log(`[ROOM] ${playerInfo.playerName} joined room ${currentRoomCode}`);
              
              // If 2 players, room is ready
              if (room.players.size >= 2) {
                broadcastToRoom(currentRoomCode, {
                  type: "room_ready",
                  roomCode: currentRoomCode,
                  playerId: "system",
                  data: {
                    players: allPlayersInRoom.map(p => ({
                      id: p.playerId,
                      name: p.playerName,
                      marbles: p.marbles,
                      profileImage: p.profileImage,
                      isCreator: p.isCreator,
                    })),
                    phase: "selecting",
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

        const playerInfo: ConnectedPlayer = {
          ws,
          playerId: currentPlayerId,
          roomCode: currentRoomCode,
          playerName: playerData.playerName || onlinePlayers.get(currentPlayerId)?.playerName || `Player_${Math.floor(Math.random() * 10000)}`,
          marbles: playerData.marbles || onlinePlayers.get(currentPlayerId)?.marbles || 150,
          profileImage: playerData.profileImage || onlinePlayers.get(currentPlayerId)?.profileImage,
          lastSeen: Date.now(),
        };

        connectedPlayers.set(currentPlayerId, playerInfo);

        if (currentRoomCode) {
          if (!roomConnections.has(currentRoomCode)) {
            roomConnections.set(currentRoomCode, new Set());
          }
          roomConnections.get(currentRoomCode)!.add(currentPlayerId);

          // Get or create room
          let room = rooms.get(currentRoomCode);
          if (!room) {
            room = {
              players: new Map(),
              creatorId: currentPlayerId,
              gameState: {
                phase: "waiting",
                currentHider: currentPlayerId,
                hiddenMarbles: 0,
                currentBet: 10,
                lastGuess: "",
              }
            };
            rooms.set(currentRoomCode, room);
          }
          
          room.players.set(currentPlayerId, playerInfo);

          // Broadcast player joined to all in room
          const allPlayersInRoom = Array.from(room.players.values());
          
          broadcastToRoom(currentRoomCode, {
            type: "player_joined",
            roomCode: currentRoomCode,
            playerId: currentPlayerId,
            data: { 
              playerName: playerInfo.playerName,
              marbles: playerInfo.marbles,
              profileImage: playerInfo.profileImage,
              playerCount: roomConnections.get(currentRoomCode)!.size,
              allPlayers: allPlayersInRoom.map(p => ({
                id: p.playerId,
                name: p.playerName,
                marbles: p.marbles,
                profileImage: p.profileImage,
              })),
            },
          });
          
          // If 2 players connected, start game
          if (room.players.size >= 2) {
            room.gameState.phase = "selecting";
            broadcastToRoom(currentRoomCode, {
              type: "game_start",
              roomCode: currentRoomCode,
              playerId: "system",
              data: {
                phase: "selecting",
                players: allPlayersInRoom.map(p => ({
                  id: p.playerId,
                  name: p.playerName,
                  marbles: p.marbles,
                  profileImage: p.profileImage,
                })),
                currentHider: room.gameState.currentHider,
              }
            });
          }
        }

        console.log(`[ROOM] Player ${playerInfo.playerName} joined room ${currentRoomCode} (${roomConnections.get(currentRoomCode)?.size || 0} players)`);
        
      } else if (message.type === "game_action") {
        // Handle game actions (hide marbles, guess, etc.)
        const room = rooms.get(currentRoomCode);
        if (!room) return;
        
        const action = message.data.action;
        
        if (action === "hide_marbles") {
          room.gameState.hiddenMarbles = message.data.count;
          room.gameState.phase = "guessing";
          
          broadcastToRoom(currentRoomCode, {
            type: "game_state_update",
            roomCode: currentRoomCode,
            playerId: currentPlayerId,
            data: {
              phase: "guessing",
              hiddenBy: currentPlayerId,
              hiddenCount: message.data.count, // Will be revealed later
            }
          });
          
        } else if (action === "guess") {
          const guess = message.data.guess; // "kali" or "jotta"
          const bet = message.data.bet;
          const hiddenCount = room.gameState.hiddenMarbles;
          const isOdd = hiddenCount % 2 === 1;
          const guessedOdd = guess === "jotta";
          const won = isOdd === guessedOdd;
          
          // Get players
          const guesser = connectedPlayers.get(currentPlayerId);
          const hider = Array.from(room.players.values()).find(p => p.playerId !== currentPlayerId);
          
          if (guesser && hider) {
            // Update marbles
            if (won) {
              guesser.marbles += bet;
              hider.marbles -= bet;
            } else {
              guesser.marbles -= bet;
              hider.marbles += bet;
            }
            
            // Role switching logic:
            // If guesser WINS (correct guess) → guesser becomes hider
            // If guesser LOSES (wrong guess) → roles stay same (guesser stays guesser)
            const newHider = won ? guesser.playerId : hider.playerId;
            
            // Broadcast result
            broadcastToRoom(currentRoomCode, {
              type: "round_result",
              roomCode: currentRoomCode,
              playerId: currentPlayerId,
              data: {
                guess,
                bet,
                hiddenCount,
                won,
                guesser: {
                  id: guesser.playerId,
                  name: guesser.playerName,
                  marbles: guesser.marbles,
                },
                hider: {
                  id: hider.playerId,
                  name: hider.playerName,
                  marbles: hider.marbles,
                },
                pointsEarned: won ? 5 : -5,
                nextHider: newHider,
              }
            });
            
            // Update hider for next round based on who won
            room.gameState.currentHider = newHider;
            room.gameState.phase = "result";
            
            // Auto-start next round after 3 seconds
            setTimeout(() => {
              const roomCheck = rooms.get(currentRoomCode);
              if (roomCheck && roomCheck.players.size >= 2) {
                roomCheck.gameState.phase = "selecting";
                broadcastToRoom(currentRoomCode, {
                  type: "new_round",
                  roomCode: currentRoomCode,
                  playerId: "system",
                  data: {
                    phase: "selecting",
                    currentHider: roomCheck.gameState.currentHider,
                  }
                });
              }
            }, 3000);
          }
          
        } else if (action === "play_again") {
          room.gameState.phase = "selecting";
          broadcastToRoom(currentRoomCode, {
            type: "new_round",
            roomCode: currentRoomCode,
            playerId: "system",
            data: {
              phase: "selecting",
              currentHider: room.gameState.currentHider,
            }
          });
        }
        
      } else if (message.type === "marble_update") {
        // Real-time marble update
        const player = connectedPlayers.get(currentPlayerId);
        if (player) {
          player.marbles = message.data.marbles;
          
          // Update in room too
          const room = rooms.get(currentRoomCode);
          if (room && room.players.has(currentPlayerId)) {
            room.players.get(currentPlayerId)!.marbles = message.data.marbles;
          }
          
          // Broadcast to room
          broadcastToRoom(currentRoomCode, {
            type: "marble_update",
            roomCode: currentRoomCode,
            playerId: currentPlayerId,
            data: {
              playerId: currentPlayerId,
              marbles: message.data.marbles,
            }
          });
        }
        
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
      
      // Remove from room
      const room = rooms.get(currentRoomCode);
      if (room) {
        room.players.delete(currentPlayerId);
        
        // Notify others in room
        broadcastToRoom(currentRoomCode, {
          type: "player_left",
          roomCode: currentRoomCode,
          playerId: currentPlayerId,
          data: { playerId: currentPlayerId }
        });
        
        // Clean up empty room
        if (room.players.size === 0) {
          rooms.delete(currentRoomCode);
        }
      }
      
      console.log(`[PRESENCE] ${currentPlayerId} went offline`);
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
