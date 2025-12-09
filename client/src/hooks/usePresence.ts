import { useState, useEffect, useRef, useCallback } from "react";

interface OnlinePlayer {
  id: string;
  name: string;
  marbles: number;
  profileImage?: string;
  currentMode?: string;
}

interface ChallengeData {
  challengerId: string;
  challengerName: string;
  challengerMarbles: number;
  challengerImage?: string;
  roomCode: string;
}

interface UsePresenceResult {
  isConnected: boolean;
  onlinePlayers: OnlinePlayer[];
  totalOnline: number;
  pendingChallenge: ChallengeData | null;
  challengePlayer: (targetPlayerId: string) => void;
  respondToChallenge: (accepted: boolean) => void;
  refreshPlayers: () => void;
}

export function usePresence(): UsePresenceResult {
  const [isConnected, setIsConnected] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [totalOnline, setTotalOnline] = useState(0);
  const [pendingChallenge, setPendingChallenge] = useState<ChallengeData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const playerId = localStorage.getItem("playerId") || `player_${Date.now()}`;
  const playerName = localStorage.getItem("playerDisplayName") || `Player_${playerId.slice(-6)}`;
  const playerMarbles = parseInt(localStorage.getItem("playerMarbles") || "150");
  const profileImage = localStorage.getItem("playerProfileImageUpdate") || "";

  if (!localStorage.getItem("playerId")) {
    localStorage.setItem("playerId", playerId);
  }

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        setIsConnected(true);
        ws.send(JSON.stringify({
          type: "presence",
          playerId,
          data: {
            name: playerName,
            marbles: playerMarbles,
            profileImage,
            currentMode: window.location.pathname,
          }
        }));
        
        ws.send(JSON.stringify({
          type: "get_online_players",
          playerId,
          data: {}
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === "online_players") {
            setOnlinePlayers(message.data.players || []);
            setTotalOnline(message.data.total || 0);
          } else if (message.type === "challenge_received") {
            setPendingChallenge(message.data);
          } else if (message.type === "challenge_result") {
            if (message.data.accepted) {
              window.location.href = `/multiplayer-game/${message.data.roomCode}`;
            }
          } else if (message.type === "challenge_failed") {
            console.log("Challenge failed:", message.data.error);
          }
        } catch (e) {
          console.error("WebSocket message parse error:", e);
        }
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };
      
      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      console.error("WebSocket connection error:", e);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, [playerId, playerName, playerMarbles, profileImage]);

  useEffect(() => {
    connect();
    
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "get_online_players",
          playerId,
          data: {}
        }));
      }
    }, 3000);
    
    return () => {
      clearInterval(interval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, playerId]);

  const challengePlayer = useCallback((targetPlayerId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const roomCode = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      wsRef.current.send(JSON.stringify({
        type: "challenge",
        playerId,
        data: {
          targetPlayerId,
          roomCode,
        }
      }));
    }
  }, [playerId]);

  const respondToChallenge = useCallback((accepted: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && pendingChallenge) {
      wsRef.current.send(JSON.stringify({
        type: "challenge_response",
        playerId,
        data: {
          accepted,
          challengerId: pendingChallenge.challengerId,
          roomCode: pendingChallenge.roomCode,
        }
      }));
      
      if (accepted) {
        window.location.href = `/multiplayer-game/${pendingChallenge.roomCode}`;
      }
      
      setPendingChallenge(null);
    }
  }, [playerId, pendingChallenge]);

  const refreshPlayers = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "get_online_players",
        playerId,
        data: {}
      }));
    }
  }, [playerId]);

  return {
    isConnected,
    onlinePlayers,
    totalOnline,
    pendingChallenge,
    challengePlayer,
    respondToChallenge,
    refreshPlayers,
  };
}
