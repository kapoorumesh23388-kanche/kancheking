import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ChallengeRandom() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [matchFound, setMatchFound] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [opponentName, setOpponentName] = useState("");
  const [opponentMarbles, setOpponentMarbles] = useState(0);
  const [gameStarting, setGameStarting] = useState(false);
  const [roomCode, setRoomCode] = useState<string>("");
  const userId = localStorage.getItem("userId") || `player_${Date.now()}`;

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const startMatching = async () => {
      try {
        // Try to find a match
        const res = await apiRequest("POST", "/api/game-room/find-random", { userId });
        const data = await res.json();

        if (!isMounted) return;

        if (data.matchFound && data.roomCode) {
          // Match found immediately
          setRoomCode(data.roomCode);
          setOpponentName(data.opponent?.name || "Opponent");
          setOpponentMarbles(data.opponent?.marbles || 100);
          setMatchFound(true);

          // Start game after 2 seconds
          setTimeout(() => {
            if (isMounted) {
              setGameStarting(true);
              setTimeout(() => {
                if (isMounted) {
                  setLocation(`/multiplayer-game/${data.roomCode}`);
                }
              }, 1500);
            }
          }, 2000);
        } else if (data.queued) {
          // In queue, start polling for match
          pollInterval = setInterval(async () => {
            try {
              const pollRes = await apiRequest("POST", "/api/game-room/find-random", { userId });
              const pollData = await pollRes.json();

              if (isMounted && pollData.matchFound && pollData.roomCode) {
                clearInterval(pollInterval);
                setRoomCode(pollData.roomCode);
                setOpponentName(pollData.opponent?.name || "Opponent");
                setOpponentMarbles(pollData.opponent?.marbles || 100);
                setMatchFound(true);

                setTimeout(() => {
                  if (isMounted) {
                    setGameStarting(true);
                    setTimeout(() => {
                      if (isMounted) {
                        setLocation(`/multiplayer-game/${pollData.roomCode}`);
                      }
                    }, 1500);
                  }
                }, 2000);
              }
            } catch (error) {
              console.error("Error polling for match:", error);
            }
          }, 2000); // Poll every 2 seconds
        }
      } catch (error) {
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to start matchmaking",
            variant: "destructive",
          });
        }
      }
    };

    startMatching();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [setLocation, userId, toast]);

  useEffect(() => {
    if (matchFound) return;

    const interval = setInterval(() => {
      setSearchTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [matchFound]);

  const handleCancel = async () => {
    await apiRequest("POST", "/api/match-queue/remove", { userId });
    setLocation("/modes");
  };

  if (gameStarting) {
    return (
      <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-bounce">⚔️</div>
          <h1 className="text-4xl font-bold text-primary mb-4">Game Starting...</h1>
          <p className="text-muted-foreground">Get ready to play!</p>
        </div>
      </div>
    );
  }

  if (matchFound) {
    return (
      <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 max-w-md w-full mx-5">
          <CardContent className="p-8 text-center space-y-6">
            <div className="animate-pulse">
              <h2 className="text-3xl font-bold text-primary mb-2">Opponent Found! 🎉</h2>
            </div>

            <div className="bg-primary/20 rounded-lg p-6 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Opponent</p>
                <p className="text-2xl font-bold text-primary">{opponentName}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Marbles</p>
                  <p className="text-xl font-bold text-yellow-400">{opponentMarbles}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-xl font-bold text-green-400">Ready</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="font-bold">Starting game...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
      <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 max-w-md w-full mx-5">
        <CardContent className="p-8 text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2" style={{ textShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
              Finding Opponent
            </h1>
            <p className="text-muted-foreground">Wait while we find a match for you...</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="absolute inset-2 bg-gradient-to-r from-primary to-[#FFA500] rounded-full flex items-center justify-center">
                  <span className="text-3xl">🔍</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/20 rounded-lg p-4">
              <p className="text-3xl font-black text-primary">{searchTime}s</p>
              <p className="text-sm text-muted-foreground mt-1">Searching...</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Matching by marble count</p>
            <p>✓ Finding skilled players</p>
            <p>✓ Balancing teams</p>
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleCancel}
            data-testid="button-cancel-search"
          >
            <X className="w-4 h-4" /> Cancel Search
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
