import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, X, Swords } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LivePlayer {
  id: string;
  name: string;
  marbles: number;
  profileImage?: string;
  gender?: string;
}

export default function ChallengeRandom() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<LivePlayer | null>(null);
  const [isChallenging, setIsChallenging] = useState(false);
  const [totalInQueue, setTotalInQueue] = useState(0);
  
  // Use sessionStorage for unique session ID per tab/window
  // This ensures each browser tab gets a unique ID even if localStorage is shared
  const getSessionUserId = () => {
    let sessionId = sessionStorage.getItem("matchSessionId");
    if (!sessionId) {
      const baseId = localStorage.getItem("userId") || `player_${Date.now()}`;
      // Add a unique suffix for this tab/session
      sessionId = `${baseId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      sessionStorage.setItem("matchSessionId", sessionId);
    }
    return sessionId;
  };
  
  const userId = getSessionUserId();
  const playerName = localStorage.getItem("playerDisplayName") || `Player_${userId.slice(-6)}`;
  const playerMarbles = parseInt(localStorage.getItem("playerMarbles") || "150");
  const shortId = userId.slice(-8);

  // Fetch live players
  useEffect(() => {
    let isMounted = true;
    let refreshInterval: NodeJS.Timeout;

    const fetchPlayers = async () => {
      try {
        // Get list of other players
        const res = await apiRequest("POST", "/api/match-queue/list", { userId });
        const data = await res.json();
        
        // Also get total queue count for debugging
        const debugRes = await fetch("/api/match-queue/debug");
        const debugData = await debugRes.json();
        
        if (isMounted) {
          if (data.players) {
            console.log(`[CHALLENGE RANDOM] My ID: ${shortId}, Total in queue: ${debugData.totalPlayers}, Available for me: ${data.players.length}`);
            setPlayers(data.players.filter((p: LivePlayer) => p.id !== userId));
          }
          setTotalInQueue(debugData.totalPlayers || 0);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
    
    // Refresh every 2 seconds
    refreshInterval = setInterval(fetchPlayers, 2000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [userId, shortId]);

  // Add player to queue on mount
  useEffect(() => {
    const addToQueue = async () => {
      try {
        await apiRequest("POST", "/api/match-queue/add", {
          userId,
          username: playerName,
          marbles: playerMarbles,
          profileImage: localStorage.getItem("playerProfileImageUpdate"),
          gender: localStorage.getItem("playerGender"),
        });
      } catch (error) {
        console.error("Error adding to queue:", error);
      }
    };

    addToQueue();

    return () => {
      // Remove from queue on unmount
      apiRequest("POST", "/api/match-queue/remove", { userId }).catch(() => {});
    };
  }, [userId, playerName, playerMarbles]);

  const challengePlayer = async (opponent: LivePlayer) => {
    setIsChallenging(true);
    setSelectedPlayer(opponent);

    try {
      // Create a game room
      const roomRes = await apiRequest("POST", "/api/game-room/challenge", {
        player1Id: userId,
        player2Id: opponent.id,
      });

      const roomData = await roomRes.json();

      if (roomData.success && roomData.roomCode) {
        toast({
          title: "Challenge Sent!",
          description: `Connecting to ${opponent.name}...`,
        });

        // Simulate connection delay, then redirect
        setTimeout(() => {
          navigate(`/multiplayer-game/${roomData.roomCode}`);
        }, 1500);
      } else {
        throw new Error(roomData.error || "Failed to create room");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to challenge player",
        variant: "destructive",
      });
      setIsChallenging(false);
      setSelectedPlayer(null);
    }
  };

  const handleCancel = () => {
    navigate("/modes");
  };

  if (isChallenging && selectedPlayer) {
    return (
      <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 max-w-md w-full mx-5">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-5xl">⚔️</div>
            <h2 className="text-3xl font-bold text-primary">Challenging</h2>
            <div className="bg-primary/20 rounded-lg p-4">
              <p className="text-xl font-bold text-primary">{selectedPlayer.name}</p>
              <p className="text-yellow-400">{selectedPlayer.marbles} marbles</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="font-bold">Connecting...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-2xl mx-auto px-5">
        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Live Players</CardTitle>
            <p className="text-muted-foreground mt-2">Tap any player to challenge them</p>
            <div className="mt-3 p-2 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Your ID: <span className="text-primary font-mono">{shortId}</span> | 
                Total in Queue: <span className="text-green-400 font-bold">{totalInQueue}</span> | 
                Available for you: <span className="text-yellow-400 font-bold">{players.length}</span>
              </p>
            </div>
          </CardHeader>
        </Card>

        {isLoading ? (
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Finding players...</p>
            </CardContent>
          </Card>
        ) : players.length === 0 ? (
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40">
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-lg text-muted-foreground">No players available right now</p>
              <p className="text-sm text-muted-foreground">Try again in a moment...</p>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full"
                data-testid="button-cancel"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 mb-6">
            {players.map((player) => (
              <Card
                key={player.id}
                className="bg-gradient-to-r from-primary/20 to-transparent border-2 border-primary/40 hover:border-primary/60 transition cursor-pointer hover-elevate"
                onClick={() => !isChallenging && challengePlayer(player)}
                data-testid={`card-player-${player.id}`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-primary/50">
                      <AvatarImage src={player.profileImage} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {player.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-primary">{player.name}</p>
                      <p className="text-sm text-yellow-400">{player.marbles} marbles</p>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      challengePlayer(player);
                    }}
                    disabled={isChallenging}
                    data-testid={`button-challenge-${player.id}`}
                  >
                    <Swords className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleCancel}
          disabled={isChallenging}
          data-testid="button-cancel-main"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
