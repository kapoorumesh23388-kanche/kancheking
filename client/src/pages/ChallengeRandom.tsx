import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, X, Swords, Wifi, WifiOff, RefreshCw, Copy, Check } from "lucide-react";
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
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  // Generate a unique match session ID for this page load
  // Each time you visit Challenge Random, you get a fresh ID
  const [matchSessionId] = useState(() => {
    // Generate a completely random ID - no dependency on localStorage
    const randomPart = Math.random().toString(36).slice(2, 10);
    const timePart = Date.now().toString(36).slice(-4);
    return `device_${randomPart}_${timePart}`;
  });
  
  const userId = matchSessionId;
  const playerName = localStorage.getItem("playerDisplayName") || `Player_${userId.slice(-6)}`;
  const playerMarbles = parseInt(localStorage.getItem("playerMarbles") || "150");
  const shortId = userId.slice(-8);
  
  // Get the current page URL to share with other device
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${currentUrl}/challenge-random`;
  
  // Copy URL to clipboard
  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      toast({ title: "URL Copied!", description: "Share this with your friend" });
    } catch (e) {
      toast({ title: "Copy Failed", description: "Please copy the URL manually", variant: "destructive" });
    }
  };

  // Fetch live players with connectivity check
  useEffect(() => {
    let isMounted = true;
    let refreshInterval: NodeJS.Timeout;

    const fetchPlayers = async () => {
      try {
        // Get list of other players
        const res = await apiRequest("POST", "/api/match-queue/list", { userId });
        const data = await res.json();
        
        // Also get total queue count for debugging (gracefully handle errors)
        let totalPlayers = 0;
        try {
          const debugRes = await fetch("/api/match-queue/debug");
          if (debugRes.ok) {
            const debugData = await debugRes.json();
            totalPlayers = debugData.totalPlayers || 0;
          }
        } catch (debugError) {
          console.log("Debug endpoint not available, using fallback");
          totalPlayers = (data.players?.length || 0) + 1; // Estimate: others + self
        }
        
        if (isMounted) {
          setIsConnected(true);
          setConnectionError(null);
          if (data.players) {
            console.log(`[CHALLENGE RANDOM] My ID: ${shortId}, Total in queue: ${totalPlayers}, Available for me: ${data.players.length}`);
            setPlayers(data.players.filter((p: LivePlayer) => p.id !== userId));
          }
          setTotalInQueue(totalPlayers);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching players:", error);
        if (isMounted) {
          setIsConnected(false);
          setConnectionError(error instanceof Error ? error.message : "Connection failed");
        }
        setIsLoading(false);
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
        {/* CONNECTION STATUS & DEBUG PANEL */}
        <Card className={`mb-4 border-2 ${isConnected === false ? 'bg-gradient-to-b from-red-900/50 to-red-950/50 border-red-500/60' : 'bg-gradient-to-b from-green-900/50 to-green-950/50 border-green-500/60'}`}>
          <CardContent className="p-4 space-y-3">
            {/* Connection Status */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {isConnected === null ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-bold">Connecting...</span>
                </>
              ) : isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-bold">Connected to Server</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400 font-bold">Connection Failed</span>
                </>
              )}
            </div>
            
            {connectionError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-center">
                <p className="text-sm text-red-400">{connectionError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Retry
                </Button>
              </div>
            )}
            
            <div className="text-center">
              <div className="bg-black/50 rounded-lg p-3 mb-2">
                <p className="text-xs text-muted-foreground mb-1">Your Device ID:</p>
                <p className="text-xl font-bold text-green-400 font-mono" data-testid="text-device-id">{shortId}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-black/30 rounded p-2">
                  <p className="text-xs text-muted-foreground">Total in Queue</p>
                  <p className="text-2xl font-bold text-yellow-400" data-testid="text-total-queue">{totalInQueue}</p>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <p className="text-xs text-muted-foreground">Can Challenge</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-available-players">{players.length}</p>
                </div>
              </div>
            </div>
            
            {/* Share URL Section */}
            <div className="bg-black/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-2 text-center">
                Share this URL with your friend to play together:
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl}
                  className="flex-1 bg-black/50 border border-primary/30 rounded px-2 py-1 text-xs font-mono text-blue-400"
                  data-testid="input-share-url"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={copyShareUrl}
                  data-testid="button-copy-url"
                >
                  {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Live Players</CardTitle>
            <p className="text-muted-foreground mt-2">Tap any player to challenge them</p>
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
