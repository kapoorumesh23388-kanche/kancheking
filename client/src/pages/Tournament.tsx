import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getEligibleMarbles, 
  getRewardPoints, 
  getTotalMarbles,
  isTournamentEligible,
  getMarblesNeededForTournament,
  spendMarbles,
  initializeMarbles
} from "@/lib/marbleStorage";

export default function Tournament() {
  const { toast } = useToast();
  const [activeWindow, setActiveWindow] = useState(1);
  const [isJoining, setIsJoining] = useState(false);
  
  // Eligible marbles (purchased + pvp wins only) for tournament
  const [eligibleMarbles, setEligibleMarbles] = useState(0);
  const [totalMarbles, setTotalMarbles] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  
  const entryFee = 2500;
  const winnerPoints = 250000;
  const pointValue = 25000;
  
  // Initialize marbles on first load
  useEffect(() => {
    initializeMarbles();
  }, []);
  
  // Real-time update of player stats
  const updatePlayerStats = useCallback(() => {
    setEligibleMarbles(getEligibleMarbles());
    setTotalMarbles(getTotalMarbles());
    setUserPoints(getRewardPoints());
    setGamesWon(parseInt(localStorage.getItem("gamesWon") || "0"));
    setGamesPlayed(parseInt(localStorage.getItem("gamesPlayed") || "0"));
  }, []);
  
  // Update stats every 2 seconds for real-time display
  useEffect(() => {
    updatePlayerStats();
    const interval = setInterval(updatePlayerStats, 2000);
    
    // Also listen for storage changes from other tabs
    const handleStorageChange = () => updatePlayerStats();
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [updatePlayerStats]);

  const tournamentWindows = [
    {
      id: 1,
      players: 85,
      status: "Open",
      pointPool: 85 * 50000, // Each player's participation points
      winnerReward: winnerPoints,
    },
    {
      id: 2,
      players: 0,
      status: "Waiting",
      pointPool: 0,
      winnerReward: winnerPoints,
    },
  ];

  const handleJoinTournament = async () => {
    if (!isTournamentEligible()) {
      const needed = getMarblesNeededForTournament();
      toast({
        title: "Not Eligible",
        description: `You need ${needed.toLocaleString()} more eligible marbles (purchased or PvP wins). AI wins don't count.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsJoining(true);
    try {
      const userId = localStorage.getItem("userId") || `player_${Date.now()}`;
      const response = await fetch("/api/tournament/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          windowId: activeWindow,
        }),
      });
      
      if (response.ok) {
        // Deduct marbles using proper accounting
        const deducted = spendMarbles(entryFee);
        if (!deducted) {
          toast({
            title: "Deduction Failed",
            description: "Could not deduct entry fee. You may not have enough eligible marbles.",
            variant: "destructive",
          });
          return;
        }
        updatePlayerStats();
        
        toast({
          title: "Tournament Joined!",
          description: `You've entered Window ${activeWindow}. ${entryFee} marbles deducted.`,
        });
      } else {
        throw new Error("Failed to join tournament");
      }
    } catch (error) {
      console.error("Failed to join tournament:", error);
      toast({
        title: "Error",
        description: "Failed to join tournament. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-6xl mx-auto px-5">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-primary mb-3" style={{ textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
            🏆 Kali Jotta Tournament
          </h2>
          <p className="text-xl text-muted-foreground">100-Player Battles | 2500 Marble Entry | 250,000 Points for Winner</p>
        </div>

        {/* Real-time Player Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2 text-xs flex items-center justify-center gap-1">
                  Eligible Marbles
                  <Info className="w-3 h-3 text-muted-foreground" />
                </p>
                <p className="text-2xl font-bold text-yellow-500" data-testid="text-eligible-marbles">
                  {eligibleMarbles.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Purchased + PvP Wins</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2 text-xs">Your Points</p>
                <p className="text-2xl font-bold text-purple-500" data-testid="text-user-points">
                  {userPoints.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2 text-xs">Games Won</p>
                <p className="text-2xl font-bold text-green-500" data-testid="text-games-won">
                  {gamesWon}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2 text-xs">Total Marbles</p>
                <p className="text-2xl font-bold text-blue-500" data-testid="text-total-marbles">
                  {totalMarbles.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">For Gameplay</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Entry Fee & Eligibility */}
        <Card className={`mb-8 ${eligibleMarbles >= entryFee ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30' : 'bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/30'}`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Entry Fee (Eligible Marbles Only)</p>
                  <p className="text-xl font-bold text-primary">{entryFee.toLocaleString()} Marbles</p>
                </div>
              </div>
              <div className="text-right">
                {eligibleMarbles >= entryFee ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Eligible to Join
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Need {(entryFee - eligibleMarbles).toLocaleString()} more eligible marbles
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Points System Info */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-xl">💎 Points & Rewards System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">Tournament Winner</p>
                <p className="text-2xl font-bold text-yellow-400">{winnerPoints.toLocaleString()} Points</p>
                <p className="text-xs text-muted-foreground mt-1">Worth ~₹{(winnerPoints / 10).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Points Value</p>
                <p className="text-2xl font-bold text-green-400">~₹{pointValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Approx redemption value</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Redemption</p>
                <p className="text-2xl font-bold text-purple-400">Premium Items</p>
                <p className="text-xs text-muted-foreground mt-1">Available in Shop catalog</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground bg-black/30 p-3 rounded">
              ℹ️ Win tournaments to earn massive points! Redeem points in the Shop when catalog updates with premium products. You can participate in unlimited tournaments.
            </p>
          </CardContent>
        </Card>

        {/* Tournament Windows */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">Tournament Windows</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tournamentWindows.map((window) => (
              <Card
                key={window.id}
                className={`cursor-pointer transition-all ${
                  activeWindow === window.id
                    ? "border-primary ring-2 ring-primary"
                    : "border-primary/20"
                }`}
                onClick={() => setActiveWindow(window.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Window {window.id}</CardTitle>
                    <Badge variant={window.status === "Open" ? "default" : "secondary"}>
                      {window.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground mb-2">Players Enrolled</p>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-bold text-primary">{window.players}</p>
                        <p className="text-muted-foreground mb-1">/ 100</p>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 mt-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${window.players}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2">Winner Gets</p>
                      <p className="text-2xl font-bold text-yellow-400">{window.winnerReward.toLocaleString()} Points</p>
                    </div>
                    {window.status === "Open" && (
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground font-bold"
                        size="lg"
                        data-testid="button-join-tournament"
                        disabled={eligibleMarbles < entryFee || isJoining}
                        onClick={handleJoinTournament}
                      >
                        {isJoining ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          `Join Tournament (${entryFee.toLocaleString()} Marbles)`
                        )}
                      </Button>
                    )}
                    {window.status === "Waiting" && (
                      <Button className="w-full" size="lg" disabled>
                        Waiting for Players...
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                <span>100 players compete in each tournament window</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                <span>Entry fee: 2500 eligible marbles (Purchased + PvP wins only)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                <span>Winner (beats all 99 players) receives bonus points</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">4.</span>
                <span>When Window 1 reaches 100 players, Window 2 automatically opens</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">5.</span>
                <span>Points earned can be redeemed in the Shop catalog</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400 font-semibold mb-2">Marble Types:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <span className="text-green-400">Purchased Marbles</span> - Count for tournament</li>
                <li>• <span className="text-green-400">PvP Win Marbles</span> - Count for tournament</li>
                <li>• <span className="text-yellow-400">AI Win Marbles</span> - Gameplay only</li>
                <li>• <span className="text-yellow-400">Free Marbles (150)</span> - Gameplay only</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
