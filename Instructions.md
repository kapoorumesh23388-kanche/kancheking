# Multiplayer Bug Fix Instructions

## Overview
This document contains a comprehensive analysis of the multiplayer functionality bugs in the "Kanche King" game, specifically affecting the "Challenge Friend" and "Challenge Random" modes. The "Play with AI" mode works perfectly, so these issues are isolated to the real-time multiplayer WebSocket communication system.

---

## 1. Related Files and Functions

### Core Files
| File | Purpose |
|------|---------|
| `server/ws-manager.ts` | WebSocket server - handles all multiplayer communication, room management, game actions |
| `client/src/pages/MultiplayerGame.tsx` | Main game UI - renders game phases (selecting, guessing, result), handles WebSocket messages |
| `client/src/pages/ChallengeFriend.tsx` | Room creation/joining UI for friend challenges |
| `client/src/pages/ChallengeRandom.tsx` | Online player list and challenge UI |
| `client/src/hooks/usePresence.ts` | Manages presence WebSocket for online status, player list, challenge sending/receiving |
| `client/src/components/ChallengePopup.tsx` | UI popup when receiving a challenge from another player |
| `server/routes.ts` | HTTP API endpoints for room creation (`/api/game-room/create`), room joining (`/api/game-room/join`) |

### Key Functions

#### Server-Side (ws-manager.ts)
- `handleNewConnection(ws)` - Entry point for all WebSocket connections
- `broadcastToRoom(roomCode, message)` - Sends messages to all players in a room
- Message handlers for: `presence`, `join_room`, `join`, `game_action`, `challenge`, `challenge_response`
- Game action handlers: `hide_marbles`, `guess`, `play_again`

#### Client-Side (MultiplayerGame.tsx)
- `handleGameMessage(message)` - Routes incoming WebSocket messages
- `sendGameAction(action, data)` - Sends game actions to server
- `handleConfirmSelection()` - When hider confirms marble selection
- `handleGuess(guess, bet)` - When guesser makes a guess
- Phase states: `waiting`, `selecting`, `guessing`, `result`

---

## 2. Identified Bugs and Root Causes

### BUG #1: Game Freezes After Round 1 (CRITICAL)
**Symptom:** After completing Round 1, the game shows "Waiting for Guess..." instead of transitioning to Round 2's marble selection phase.

**Root Cause Analysis:**
1. After a guess is made, the server broadcasts `round_result` with `nextHider` field
2. The server schedules `new_round` broadcast after 3 seconds via `setTimeout`
3. **PROBLEM:** When `new_round` fires, the WebSocket connections in `room.players` Map may be stale
4. The `broadcastToRoom` function checks `player.ws.readyState === 1` but the WebSocket reference stored during `join_room` may not match the current active connection
5. Client's fallback mechanism (set to 3.5s) should trigger but may not work if `nextHiderRef.current` is null

**Evidence from code (ws-manager.ts lines 467-513):**
```javascript
setTimeout(() => {
  // ... room check ...
  roomCheck.players.forEach((player, playerId) => {
    if (player.ws.readyState === 1) { // WebSocket may be stale
      player.ws.send(messageStr);
    }
  });
}, 3000);
```

### BUG #2: WebSocket Connection Mismatch
**Symptom:** Players sometimes don't receive messages even though they appear connected.

**Root Cause:**
1. When navigating from ChallengeFriend.tsx to MultiplayerGame.tsx, the old WebSocket is closed
2. MultiplayerGame.tsx creates a NEW WebSocket and sends `join` message
3. But the `rooms` Map still has the OLD WebSocket reference from `join_room` message
4. The `join` handler updates `connectedPlayers` but may not properly update `room.players` with the new WebSocket

**Code issue (ws-manager.ts):**
- `join_room` message creates room with creator's WebSocket at line 172-183
- `join` message (from MultiplayerGame) updates room.players at line 282-350
- But if the player was already in the room via `join_room`, their WebSocket reference may not be updated

### BUG #3: Phase State Desynchronization
**Symptom:** One player sees marble selection UI while the other still sees waiting/result screen.

**Root Cause:**
1. The `game_state_update` message (sent when hider hides marbles) only updates phase for the guesser
2. If guesser's WebSocket connection was briefly interrupted, they miss the phase change
3. No periodic state sync mechanism exists to recover from missed messages

### BUG #4: Challenge Random - Room Not Created Properly
**Symptom:** When challenging a random player, sometimes the game room isn't properly created.

**Root Cause:**
1. In `usePresence.ts`, `challengePlayer` generates a client-side room code (line 166)
2. This room code is only sent via WebSocket, never registered with the HTTP API
3. The `rooms` Map in ws-manager is only populated when someone sends `join_room` with `isCreator: true`
4. If challenger doesn't create room via `join_room`, the room doesn't exist server-side

---

## 3. Fix Plan

### Phase 1: Fix WebSocket Reference Updates (CRITICAL)

**File: server/ws-manager.ts**

1. **Update WebSocket on every `join` message:**
```javascript
// In the "join" message handler, ALWAYS update the WebSocket reference in room.players
if (room && room.players.has(currentPlayerId)) {
  // Update existing player's WebSocket reference
  const existingPlayer = room.players.get(currentPlayerId)!;
  existingPlayer.ws = ws; // UPDATE THE WEBSOCKET!
  existingPlayer.lastSeen = Date.now();
}
```

2. **Add WebSocket refresh on `game_action`:**
```javascript
// Before processing game actions, update the player's WebSocket
const room = rooms.get(roomCode);
if (room && room.players.has(currentPlayerId)) {
  room.players.get(currentPlayerId)!.ws = ws;
}
```

### Phase 2: Make Round Transition Reliable

**File: client/src/pages/MultiplayerGame.tsx**

1. **Strengthen the client-side auto-restart:**
- The current 3.5s fallback should work, but ensure `nextHiderRef.current` is always set
- Add logging to verify the fallback triggers

2. **Add periodic state sync request:**
```javascript
// Every 5 seconds, request game state from server
useEffect(() => {
  const syncInterval = setInterval(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "request_sync",
        roomCode,
        playerId
      }));
    }
  }, 5000);
  return () => clearInterval(syncInterval);
}, [roomCode, playerId]);
```

**File: server/ws-manager.ts**

3. **Add `request_sync` handler:**
```javascript
else if (message.type === "request_sync") {
  const room = rooms.get(message.roomCode);
  if (room) {
    // Update WebSocket reference
    if (room.players.has(currentPlayerId)) {
      room.players.get(currentPlayerId)!.ws = ws;
    }
    // Send current game state
    ws.send(JSON.stringify({
      type: "game_sync",
      roomCode: message.roomCode,
      playerId: currentPlayerId,
      data: {
        phase: room.gameState.phase,
        currentHider: room.gameState.currentHider,
        players: Array.from(room.players.values()).map(p => ({
          id: p.playerId,
          name: p.playerName,
          marbles: p.marbles,
          profileImage: p.profileImage,
        }))
      }
    }));
  }
}
```

### Phase 3: Fix Challenge Random Room Creation

**File: client/src/hooks/usePresence.ts**

1. **Create room via HTTP API before sending challenge:**
```javascript
const challengePlayer = useCallback(async (targetPlayerId: string) => {
  // First create room via HTTP API
  const res = await fetch('/api/game-room/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: playerId })
  });
  const data = await res.json();
  
  if (data.success && data.roomCode) {
    // Now send challenge with valid room code
    wsRef.current?.send(JSON.stringify({
      type: "challenge",
      playerId,
      data: { targetPlayerId, roomCode: data.roomCode }
    }));
  }
}, [playerId]);
```

### Phase 4: Improve Game Phase Handling

**File: client/src/pages/MultiplayerGame.tsx**

1. **Handle `game_sync` properly to recover from missed messages:**
```javascript
case "game_sync":
  // Always sync if game is in progress
  if (message.data.phase) {
    setPhase(message.data.phase);
    setIsHider(message.data.currentHider === playerId);
    
    // If phase is "selecting" and I'm hider, reset marble selection
    if (message.data.phase === "selecting" && message.data.currentHider === playerId) {
      setSelectedMarbleIds([]);
      setGameResult(null);
    }
  }
  break;
```

---

## 4. Testing Checklist

After implementing fixes, verify:

- [ ] **Round Transition:** Game smoothly transitions from Round 1 to Round 2, 3, 4... up to 10 rounds
- [ ] **Challenge Friend:** Create room, share code, friend joins, game plays for 10 rounds
- [ ] **Challenge Random:** Challenge online player, they accept, game plays for 10 rounds
- [ ] **Reconnection:** If a player briefly loses connection, they can rejoin and continue
- [ ] **Role Switching:** Winner of guess becomes hider in next round (traditional rules)
- [ ] **Marble Updates:** Both players see correct marble counts throughout

---

## 5. Implementation Priority

1. **FIRST:** Fix WebSocket reference update in `join` handler (Phase 1)
2. **SECOND:** Add `request_sync` mechanism (Phase 2)
3. **THIRD:** Fix Challenge Random room creation (Phase 3)
4. **FOURTH:** Improve game_sync handling (Phase 4)

---

## 6. Files to Modify

| File | Changes |
|------|---------|
| `server/ws-manager.ts` | Update WebSocket refs, add request_sync handler |
| `client/src/pages/MultiplayerGame.tsx` | Add periodic sync, improve game_sync handling |
| `client/src/hooks/usePresence.ts` | Create room via API before challenging |

---

## 7. Notes

- The "Play with AI" mode works because it uses local state management without WebSocket
- All multiplayer issues stem from WebSocket connection/reference management
- The core game logic (hide/guess/result) is correct - only the communication layer needs fixes
- Grace period for reconnection (5 seconds) exists but isn't working because WebSocket refs aren't updated
