import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2, Loader2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getTotalMarbles } from "@/lib/marbleStorage";

export default function ChallengeFriend() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [roomCode, setRoomCode] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  
  const playerId = localStorage.getItem("playerId") || `player_${Date.now()}`;
  const playerName = localStorage.getItem("playerDisplayName") || `Player_${playerId.slice(-6)}`;
  const playerMarbles = getTotalMarbles();
  const profileImage = localStorage.getItem("playerProfileImageUpdate") || "";

  // Connect to WebSocket when room is created
  useEffect(() => {
    if (roomCode && waitingForOpponent) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        
        ws.onopen = () => {
          console.log("Room creator connected to WebSocket");
          // Join the room as creator
          ws.send(JSON.stringify({
            type: "join_room",
            roomCode,
            playerId,
            data: {
              playerName,
              marbles: playerMarbles,
              profileImage,
              isCreator: true,
            }
          }));
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("Creator received:", message);
            
            if (message.type === "player_joined") {
              // Opponent joined - close this socket and navigate to game
              toast({
                title: "Opponent Connected!",
                description: `${message.data.playerName} has joined the game`,
              });
              // Close lobby socket before navigating to prevent duplicate connections
              if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
              }
              setLocation(`/multiplayer-game/${roomCode}`);
            } else if (message.type === "room_ready") {
              // Both players ready - close socket and navigate to game
              if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
              }
              setLocation(`/multiplayer-game/${roomCode}`);
            }
          } catch (e) {
            console.error("Parse error:", e);
          }
        };
        
        ws.onclose = () => {
          console.log("WebSocket disconnected");
        };
        
        ws.onerror = (err) => {
          console.error("WebSocket error:", err);
        };
      } catch (error) {
        console.error("Failed to connect:", error);
      }
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [roomCode, waitingForOpponent, playerId, playerName, playerMarbles, profileImage, setLocation, toast]);

  const createRoom = async () => {
    setIsCreating(true);
    try {
      const res = await apiRequest("POST", "/api/game-room/create", { userId: playerId });
      const data = await res.json();
      if (data.success && data.roomCode) {
        setRoomCode(data.roomCode);
        setWaitingForOpponent(true);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create room",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareLink = async () => {
    const url = `${window.location.origin}/game/friend-join?code=${roomCode}`;
    if (navigator.share) {
      await navigator.share({
        title: "Kali Jotta Challenge",
        text: "Join me in Kali Jotta!",
        url: url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard",
      });
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) return;
    setIsJoining(true);
    try {
      const res = await apiRequest("POST", "/api/game-room/join", { 
        roomCode: joinCode.toUpperCase(), 
        userId: playerId 
      });
      const data = await res.json();
      if (data.success) {
        setLocation(`/multiplayer-game/${joinCode.toUpperCase()}`);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join room",
          variant: "destructive",
        });
        setIsJoining(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join room",
        variant: "destructive",
      });
      setIsJoining(false);
    }
  };

  const cancelRoom = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setRoomCode("");
    setWaitingForOpponent(false);
  };

  // Show room code and share options after creating room
  if (roomCode) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-6 sm:pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
        <div className="container max-w-2xl mx-auto px-3 sm:px-5">
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40">
            <CardHeader className="text-center py-3 sm:py-6">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">
                Room Created!
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Share this with your friend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-5 px-3 sm:px-6">
              {/* Room Code Display */}
              <div className="bg-primary/20 rounded-lg p-3 sm:p-6 border-2 border-primary/50">
                <p className="text-xs sm:text-sm text-muted-foreground text-center mb-2 font-semibold">Room Code</p>
                <p className="text-2xl sm:text-4xl md:text-5xl font-black text-primary text-center tracking-widest font-mono" data-testid="text-room-code">
                  {roomCode}
                </p>
              </div>

              {/* Share Link Display */}
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-primary/80 mb-2 font-semibold">Share Link</p>
                <div className="bg-black/50 rounded p-2 sm:p-3 mb-3 border border-primary/20">
                  <p className="text-[10px] sm:text-xs text-muted-foreground break-all font-mono" data-testid="text-share-link">
                    {`${window.location.origin}/game/friend-join?code=${roomCode}`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <Button
                  size="default"
                  variant="outline"
                  className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  onClick={copyCode}
                  data-testid="button-copy-code"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Code
                    </>
                  )}
                </Button>
                <Button
                  size="default"
                  className="bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 flex items-center justify-center gap-1 sm:gap-2 text-primary-foreground font-bold text-xs sm:text-sm"
                  onClick={shareLink}
                  data-testid="button-share-room"
                >
                  <Share2 className="w-4 h-4" /> Share Link
                </Button>
              </div>

              {/* Waiting Status */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <p className="font-bold text-primary text-sm sm:text-base">Waiting for opponent...</p>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Share the code or link with your friend</p>
              </div>

              {/* Cancel Button */}
              <Button
                variant="ghost"
                className="w-full text-xs sm:text-sm"
                onClick={cancelRoom}
                data-testid="button-cancel-room"
              >
                Cancel & Create New Room
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Initial screen with Create/Join options
  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-2xl mx-auto px-5">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-3" style={{ textShadow: '0 0 30px rgba(255,215,0,0.5)' }} data-testid="heading-challenge-friend">
            Challenge a Friend
          </h1>
          <p className="text-lg text-muted-foreground">Create a room or join your friend's room</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Create Room Card */}
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-green-500/30 hover-elevate" data-testid="card-create-room">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span>+</span> Create Room
              </CardTitle>
              <CardDescription>Invite your friend to play</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a room code and share it with your friend. They can join using the code.
              </p>
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold text-white py-6 text-lg"
                onClick={createRoom}
                disabled={isCreating}
                data-testid="button-create-room"
              >
                {isCreating ? <Loader2 className="inline mr-2 animate-spin w-4 h-4" /> : null}
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-blue-500/30 hover-elevate" data-testid="card-join-room">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span>🔗</span> Join Room
              </CardTitle>
              <CardDescription>Enter your friend's code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="ROOM1A2B3C"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-bold tracking-widest py-6"
                data-testid="input-join-code"
              />
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-bold text-white py-6 text-lg"
                onClick={joinRoom}
                disabled={isJoining || !joinCode.trim()}
                data-testid="button-join-room"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Joining...
                  </>
                ) : (
                  "Join Room"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => setLocation("/modes")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </div>
    </div>
  );
}
