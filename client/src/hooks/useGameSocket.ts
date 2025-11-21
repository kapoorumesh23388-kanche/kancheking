import { useEffect, useRef, useCallback } from "react";

interface GameMessage {
  type: "join" | "move" | "guess" | "result" | "chat" | "sync";
  roomCode: string;
  playerId: string;
  data: any;
}

export function useGameSocket(roomCode: string, playerId: string, onMessage: (msg: GameMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        ws.send(JSON.stringify({ type: "join", roomCode, playerId }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          onMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomCode, playerId, onMessage]);

  const sendMessage = useCallback((message: GameMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { sendMessage };
}
