import { WebSocket } from "ws";

interface GameMessage {
  type: "join" | "join_room" | "move" | "guess" | "result" | "chat" | "sync" | "presence" | "challenge" | "challenge_response" | "get_online_players" | "game_action" | "marble_update" | "request_sync";
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
  // Grace period for reconnections
  pendingDisconnects: Map<string, NodeJS.Timeout>;
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
        
        // Prevent self-challenge
        if (targetId === message.playerId) {
          ws.send(JSON.stringify({
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
              },
              pendingDisconnects: new Map(),
            });
            console.log(`[ROOM] Room ${currentRoomCode} created by ${playerInfo.playerName}`);
          } else {
            // Player is joining existing room
            const room = rooms.get(currentRoomCode);
            if (room) {
              // Cancel any pending disconnect for this player (they're reconnecting)
              if (room.pendingDisconnects.has(currentPlayerId)) {
                clearTimeout(room.pendingDisconnects.get(currentPlayerId)!);
                room.pendingDisconnects.delete(currentPlayerId);
                console.log(`[RECONNECT] Player ${playerInfo.playerName} reconnected via join_room to ${currentRoomCode}`);
              }
              
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
              },
              pendingDisconnects: new Map(),
            };
            rooms.set(currentRoomCode, room);
          }
          
          // Cancel any pending disconnect for this player (they're reconnecting)
          const isReconnecting = room.pendingDisconnects.has(currentPlayerId);
          if (isReconnecting) {
            clearTimeout(room.pendingDisconnects.get(currentPlayerId)!);
            room.pendingDisconnects.delete(currentPlayerId);
            console.log(`[RECONNECT] Player ${playerInfo.playerName} reconnected to room ${currentRoomCode}`);
          }
          
          room.players.set(currentPlayerId, playerInfo);
          
          // Send current game state to reconnecting player
          const allPlayersInRoomForSync = Array.from(room.players.values());
          ws.send(JSON.stringify({
            type: "game_sync",
            roomCode: currentRoomCode,
            playerId: currentPlayerId,
            data: {
              phase: room.gameState.phase,
              currentHider: room.gameState.currentHider,
              players: allPlayersInRoomForSync.map(p => ({
                id: p.playerId,
                name: p.playerName,
                marbles: p.marbles,
                profileImage: p.profileImage,
              })),
              isReconnecting,
            }
          }));

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
        
      } else if (message.type === "request_sync") {
        // Handle state sync requests - critical for round transitions
        const syncRoomCode = message.roomCode || currentRoomCode;
        if (message.roomCode) {
          currentRoomCode = message.roomCode;
        }
        const syncRoom = rooms.get(syncRoomCode);
        if (syncRoom) {
          // CRITICAL: Update WebSocket reference for this player
          if (syncRoom.players.has(currentPlayerId)) {
            syncRoom.players.get(currentPlayerId)!.ws = ws;
            syncRoom.players.get(currentPlayerId)!.lastSeen = Date.now();
          }
          
          const allPlayers = Array.from(syncRoom.players.values());
          ws.send(JSON.stringify({
            type: "game_sync",
            roomCode: syncRoomCode,
            playerId: currentPlayerId,
            data: {
              phase: syncRoom.gameState.phase,
              currentHider: syncRoom.gameState.currentHider,
              hiddenMarbles: syncRoom.gameState.hiddenMarbles,
              players: allPlayers.map(p => ({
                id: p.playerId,
                name: p.playerName,
                marbles: p.marbles,
                profileImage: p.profileImage,
              }))
            }
          }));
          console.log(`[SYNC] Sent game_sync to ${currentPlayerId} in room ${syncRoomCode}, phase: ${syncRoom.gameState.phase}`);
        }
        
      } else if (message.type === "game_action") {
        // Handle game actions (hide marbles, guess, etc.)
        // Use message.roomCode if available, fallback to currentRoomCode
        const roomCode = message.roomCode || currentRoomCode;
        if (message.roomCode) {
          currentRoomCode = message.roomCode;
        }
        const room = rooms.get(roomCode);
        if (!room) {
          console.log(`[GAME_ACTION] Room ${roomCode} not found`);
          return;
        }
        
        // CRITICAL: Update WebSocket reference for this player on every game action
        if (room.players.has(currentPlayerId)) {
          room.players.get(currentPlayerId)!.ws = ws;
          room.players.get(currentPlayerId)!.lastSeen = Date.now();
        }
        
        const action = message.data.action;
        
        if (action === "hide_marbles") {
          room.gameState.hiddenMarbles = message.data.count;
          room.gameState.phase = "guessing";
          console.log(`[GAME] ${currentPlayerId} hid ${message.data.count} marbles in room ${roomCode}`);
          
          broadcastToRoom(roomCode, {
            type: "game_state_update",
            roomCode: roomCode,
            playerId: currentPlayerId,
            data: {
              phase: "guessing",
              hiddenBy: currentPlayerId,
              hiddenCount: message.data.count, // Will be revealed later
            }
          });
          
        } else if (action === "guess") {
          const guess = message.data.guess; // "kali" = odd, "jotta" = even
          const bet = message.data.bet;
          const hiddenCount = room.gameState.hiddenMarbles;
          const isOdd = hiddenCount % 2 === 1; // 1,3,5,7,9... = odd
          const guessedOdd = guess === "kali"; // kali = odd (1,3,5,7,9...), jotta = even (2,4,6,8...)
          const won = isOdd === guessedOdd;
          console.log(`[GAME] Hidden: ${hiddenCount}, isOdd: ${isOdd}, guess: ${guess}, guessedOdd: ${guessedOdd}, won: ${won}`);
          
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
            console.log(`[GAME] Guess result in room ${roomCode}: ${won ? 'correct' : 'wrong'}, bet: ${bet}`);
            broadcastToRoom(roomCode, {
              type: "round_result",
              roomCode: roomCode,
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
            const savedRoomCode = roomCode;
            const savedNewHider = newHider;
            console.log(`[AUTO-RESTART] Scheduling new round in 3 seconds for room ${savedRoomCode}, next hider: ${savedNewHider}`);
            
            setTimeout(() => {
              const roomCheck = rooms.get(savedRoomCode);
              if (!roomCheck) {
                console.log(`[AUTO-RESTART] Room ${savedRoomCode} no longer exists`);
                return;
              }
              
              // Always update room state and broadcast new_round
              // Don't skip based on connection count - let clients handle reconnection
              roomCheck.gameState.phase = "selecting";
              roomCheck.gameState.hiddenMarbles = 0;
              
              const newRoundMessage = {
                type: "new_round",
                roomCode: savedRoomCode,
                playerId: "system",
                data: {
                  phase: "selecting",
                  currentHider: savedNewHider,
                }
              };
              
              console.log(`[AUTO-RESTART] Broadcasting new_round to room ${savedRoomCode}:`, JSON.stringify(newRoundMessage));
              
              // Broadcast to all players - send even if WebSocket might be reconnecting
              const messageStr = JSON.stringify(newRoundMessage);
              let sentCount = 0;
              let failedCount = 0;
              
              roomCheck.players.forEach((player, playerId) => {
                try {
                  if (player.ws.readyState === 1) { // OPEN
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
            }, 3000);
          }
          
        } else if (action === "play_again") {
          room.gameState.phase = "selecting";
          room.gameState.hiddenMarbles = 0;
          console.log(`[GAME] Manual play_again in room ${roomCode}`);
          broadcastToRoom(roomCode, {
            type: "new_round",
            roomCode: roomCode,
            playerId: "system",
            data: {
              phase: "selecting",
              currentHider: room.gameState.currentHider,
            }
          });
        }
        
      } else if (message.type === "marble_update") {
        // Real-time marble update - use message.roomCode if available
        const marbleRoomCode = message.roomCode || currentRoomCode;
        if (message.roomCode) {
          currentRoomCode = message.roomCode;
        }
        
        const player = connectedPlayers.get(currentPlayerId);
        if (player) {
          player.marbles = message.data.marbles;
          
          // Update in room too
          const room = rooms.get(marbleRoomCode);
          if (room && room.players.has(currentPlayerId)) {
            room.players.get(currentPlayerId)!.marbles = message.data.marbles;
          }
          
          // Broadcast to room
          broadcastToRoom(marbleRoomCode, {
            type: "marble_update",
            roomCode: marbleRoomCode,
            playerId: currentPlayerId,
            data: {
              playerId: currentPlayerId,
              marbles: message.data.marbles,
            }
          });
        }
        
      } else if (message.type === "chat") {
        // Use message.roomCode if available
        const chatRoomCode = message.roomCode || currentRoomCode;
        if (message.roomCode) {
          currentRoomCode = message.roomCode;
        }
        console.log(`[CHAT] Message in room ${chatRoomCode} from ${currentPlayerId}`);
        broadcastToRoom(chatRoomCode, message);
      } else {
        // For other message types, also check for roomCode
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

  ws.on("close", () => {
    if (currentPlayerId) {
      onlinePlayers.delete(currentPlayerId);
      connectedPlayers.delete(currentPlayerId);
      
      // Handle room disconnection with grace period for reconnection
      const room = rooms.get(currentRoomCode);
      if (room) {
        // Give player 5 seconds to reconnect (e.g., during page navigation)
        const RECONNECT_GRACE_PERIOD = 5000;
        
        // Clear any existing pending disconnect
        if (room.pendingDisconnects.has(currentPlayerId)) {
          clearTimeout(room.pendingDisconnects.get(currentPlayerId)!);
        }
        
        // Set up delayed disconnect
        const disconnectTimeout = setTimeout(() => {
          const roomCheck = rooms.get(currentRoomCode);
          if (roomCheck) {
            roomCheck.players.delete(currentPlayerId);
            roomCheck.pendingDisconnects.delete(currentPlayerId);
            
            // Notify others in room
            broadcastToRoom(currentRoomCode, {
              type: "player_left",
              roomCode: currentRoomCode,
              playerId: currentPlayerId,
              data: { playerId: currentPlayerId }
            });
            
            console.log(`[DISCONNECT] ${currentPlayerId} removed from room ${currentRoomCode} after grace period`);
            
            // Clean up empty room
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
  // Use rooms Map instead of roomConnections for more reliable broadcasting
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

export function broadcastToPlayer(playerId: string, message: any) {
  const player = connectedPlayers.get(playerId);
  if (player && player.ws.readyState === 1) {
    player.ws.send(JSON.stringify(message));
  }
}
