import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Info, Trophy, Swords, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  getEligibleMarbles, 
  getRewardPoints, 
  getTotalMarbles,
  initializeMarbles,
  setCachedTotals,
  syncEligibleMarblesFromServer,
  syncWalletFromServer,
} from "@/lib/marbleStorage";

interface TournamentMatch {
  id: string;
  tournamentId: string;
  roundNumber: number;
  matchNumber: number;
  player1Id: string | null;
  player1Name: string | null;
  player2Id: string | null;
  player2Name: string | null;
  winnerId: string | null;
  winnerName: string | null;
  player1Score: number;
  player2Score: number;
  roomCode: string | null;
  status: string;
}

export default function Tournament() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isJoining, setIsJoining] = useState(false);
  const [viewBracket, setViewBracket] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  
  // IMPORTANT: this must match whatever ID handleJoinTournament() sends as
  // `userId` when joining (see below) — that's the ID the backend stores
  // as player1Id/player2Id on the match. It previously read a different,
  // unused localStorage key ("playerId"), so the "Your Match is Ready"
  // banner and the bracket's "Join Match" button could never find a match
  // for the actual logged-in player, forcing manual room-code lookups.
  const playerId = localStorage.getItem("userId") || `player_${Date.now()}`;
  
  // Load saved tournament ID on mount
  useEffect(() => {
    const savedTournamentId = localStorage.getItem("activeTournamentId");
    if (savedTournamentId) {
      setSelectedTournamentId(savedTournamentId);
    }
  }, []);
  
  // Fetch tournament windows from API
  const { data: windowsData } = useQuery<{ windows: any[] }>({
    queryKey: ['/api/tournament/windows'],
    refetchInterval: 5000,
  });
  
  // Fetch my current match if in a tournament
  const { data: myMatchData, refetch: refetchMyMatch } = useQuery<{ success: boolean; match: TournamentMatch | null }>({
    queryKey: ['/api/tournament', selectedTournamentId, 'my-match', { playerId }],
    enabled: !!selectedTournamentId,
    refetchInterval: 5000,
  });
  
  // Fetch bracket data
  const { data: bracketData } = useQuery<{ success: boolean; matches: TournamentMatch[]; participants: any[]; totalRounds: number }>({
    queryKey: ['/api/tournament', selectedTournamentId, 'bracket'],
    enabled: !!selectedTournamentId && viewBracket,
    refetchInterval: 5000,
  });
  
  // Eligible marbles for tournament: PvP Win Marbles ONLY (purchased excluded)
  const [eligibleMarbles, setEligibleMarbles] = useState(0);
  const [totalMarbles, setTotalMarbles] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  
  // No more single fixed entry fee — players choose from several parallel
  // tiers (see TOURNAMENT_TIERS below), each running its own independent
  // 10-player windows.
  const TOURNAMENT_TIERS = [250, 500, 750, 1000, 1500];
  
  
  // Initialize marbles on first load
  useEffect(() => {
    initializeMarbles();
    const userId = localStorage.getItem("userId");
    if (userId) syncEligibleMarblesFromServer(userId).then((val) => {
      if (val !== null) setEligibleMarbles(val);
    });
    if (userId) syncWalletFromServer(userId);
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

  // Group all windows (across every tier) returned by the API by their
  // entryFee, so we can render one section per tier (250 / 500 / 750 /
  // 1000 / 1500), each showing that tier's currently open window.
  const allWindows = windowsData?.windows || [];
  const windowsByTier = TOURNAMENT_TIERS.map((tier) => ({
    tier,
    window: allWindows.find((w) => w.entryFee === tier && w.status !== "Completed")
      || allWindows.find((w) => w.entryFee === tier), // fall back to most recent even if completed, so the card isn't empty on first load
  }));

  // Auto-select tournament ID when windows data loads, based on whichever
  // window we most recently joined (see handleJoinTournament).
  useEffect(() => {
    const savedTournamentId = localStorage.getItem("activeTournamentId");
    if (savedTournamentId && allWindows.some(w => w.id === savedTournamentId)) {
      setSelectedTournamentId(savedTournamentId);
    }
  }, [allWindows]);

  const handleJoinTournament = async (window: any) => {
    // No more eligibility gate — any player can enter any tier they can
    // afford. Just check they have enough spendable marbles for this
    // specific tier's entry fee.
    if (totalMarbles < window.entryFee) {
      toast({
        title: "Not Enough Marbles",
        description: `You need ${(window.entryFee - totalMarbles).toLocaleString()} more marbles to join this ${window.entryFee.toLocaleString()}-marble tournament.`,
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
          entryFee: window.entryFee,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Server already deducted the marbles from the database (single
        // source of truth) — just sync the local cache to match, no
        // separate local deduction needed here anymore.
        if (typeof data.marbles === "number") {
          setCachedTotals(data.marbles);
        }
        updatePlayerStats();

        // Store the tournament ID for bracket viewing / match tracking
        if (data.tournamentId) {
          setSelectedTournamentId(data.tournamentId);
          localStorage.setItem("activeTournamentId", data.tournamentId);
        }

        toast({
          title: "Tournament Joined!",
          description: `You've entered the ${window.entryFee.toLocaleString()}-marble tournament. ${window.entryFee} marbles deducted.`,
        });
      } else {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || errData?.error || "Failed to join tournament");
      }
    } catch (error: any) {
      console.error("Failed to join tournament:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to join tournament. Please try again.",
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
          <p className="text-xl text-muted-foreground">10-Player Battles | Choose Your Stake | Winner Takes 10× the Pool</p>
        </div>

        {/* Real-time Player Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2 text-xs flex items-center justify-center gap-1">
                  Lifetime PvP Wins
                  <Info className="w-3 h-3 text-muted-foreground" />
                </p>
                <p className="text-2xl font-bold text-yellow-500" data-testid="text-eligible-marbles">
                  {eligibleMarbles.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">For Leaderboard Ranking</p>
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
        
        {/* Balance Summary */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-primary/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Choose your stake below — any amount from 250 to 1,500 marbles</p>
                <p className="text-xl font-bold text-primary">Your Balance: {totalMarbles.toLocaleString()} Marbles</p>
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
                <p className="text-xl font-bold text-yellow-400">10× Entry Fee</p>
                <p className="text-xs text-muted-foreground mt-1">In both marbles and points</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Points Value</p>
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

        {/* Tournament Tiers */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">Choose Your Tournament</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {windowsByTier.map(({ tier, window }) => {
              if (!window) {
                // Windows haven't loaded from the API yet for this tier
                return (
                  <Card key={tier} className="border-primary/20">
                    <CardContent className="py-10 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </CardContent>
                  </Card>
                );
              }
              return (
                <Card key={window.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{tier.toLocaleString()}-Marble Tournament</CardTitle>
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
                          <p className="text-muted-foreground mb-1">/ 10</p>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${window.players * 10}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-muted-foreground mb-1 text-sm">Entry Fee</p>
                          <p className="text-lg font-bold text-primary">{tier.toLocaleString()} Marbles</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground mb-1 text-sm">Winner Gets</p>
                          <p className="text-lg font-bold text-yellow-400">
                            {(tier * 10).toLocaleString()} Marbles + {(tier * 10).toLocaleString()} Points
                          </p>
                        </div>
                      </div>
                      {window.status === "Open" && (
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground font-bold"
                          size="lg"
                          data-testid={`button-join-tournament-${tier}`}
                          disabled={totalMarbles < tier || isJoining}
                          onClick={() => handleJoinTournament(window)}
                        >
                          {isJoining ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Joining...
                            </>
                          ) : (
                            `Join Tournament (${tier.toLocaleString()} Marbles)`
                          )}
                        </Button>
                      )}
                      {window.status === "Waiting" && (
                        <Button className="w-full" size="lg" disabled>
                          Waiting for Players...
                        </Button>
                      )}
                      {window.status === "In Progress" && (
                        <Button className="w-full" size="lg" disabled>
                          Tournament in Progress
                        </Button>
                      )}
                      {window.status === "Completed" && (
                        <Button className="w-full" size="lg" disabled>
                          Completed — Next Window Opening
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* My Active Match Notification */}
        {myMatchData?.match && myMatchData.match.status === "ready" && (
          <Card className="mb-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 animate-pulse">
            <CardContent className="py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Swords className="w-10 h-10 text-green-400" />
                  <div>
                    <p className="text-xl font-bold text-green-400">Your Match is Ready!</p>
                    <p className="text-muted-foreground">
                      Round {myMatchData.match.roundNumber} - vs {myMatchData.match.player1Id === playerId ? myMatchData.match.player2Name : myMatchData.match.player1Name}
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold"
                  onClick={() => setLocation(`/multiplayer-game/${myMatchData.match?.roomCode}`)}
                  data-testid="button-join-match"
                >
                  <Swords className="w-4 h-4 mr-2" />
                  Join Match Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bracket View Toggle */}
        {selectedTournamentId && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Tournament Bracket
                </CardTitle>
                <Button
                  variant={viewBracket ? "default" : "outline"}
                  onClick={() => setViewBracket(!viewBracket)}
                  data-testid="button-toggle-bracket"
                >
                  {viewBracket ? "Hide Bracket" : "View Bracket"}
                </Button>
              </div>
            </CardHeader>
            {viewBracket && bracketData && (
              <CardContent>
                <div className="space-y-6">
                  {Array.from({ length: bracketData.totalRounds || 1 }, (_, i) => i + 1).map(round => {
                    const roundMatches = bracketData.matches?.filter(m => m.roundNumber === round) || [];
                    return (
                      <div key={round} className="space-y-3">
                        <h4 className="font-bold text-primary flex items-center gap-2">
                          <Badge variant="outline">Round {round}</Badge>
                          {round === bracketData.totalRounds && <Trophy className="w-4 h-4 text-yellow-400" />}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {roundMatches.map(match => (
                            <Card 
                              key={match.id} 
                              className={`p-3 ${match.status === "completed" ? "bg-muted/50" : match.status === "ready" ? "border-green-500/50 bg-green-500/10" : "border-muted"}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant={match.status === "completed" ? "secondary" : match.status === "ready" ? "default" : "outline"}>
                                  {match.status === "completed" ? "Done" : match.status === "ready" ? "Live" : "Pending"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">Match #{match.matchNumber}</span>
                              </div>
                              <div className="space-y-1">
                                <div className={`flex items-center justify-between p-2 rounded ${match.winnerId === match.player1Id ? "bg-green-500/20 text-green-400" : ""}`}>
                                  <span className="font-medium truncate">{match.player1Name || "TBD"}</span>
                                  <span className="font-bold">{match.player1Score}</span>
                                </div>
                                <div className={`flex items-center justify-between p-2 rounded ${match.winnerId === match.player2Id ? "bg-green-500/20 text-green-400" : ""}`}>
                                  <span className="font-medium truncate">{match.player2Name || "TBD"}</span>
                                  <span className="font-bold">{match.player2Score}</span>
                                </div>
                              </div>
                              {match.status === "ready" && (match.player1Id === playerId || match.player2Id === playerId) && (
                                <Button
                                  size="sm"
                                  className="w-full mt-2 bg-green-500 hover:bg-green-600"
                                  onClick={() => setLocation(`/multiplayer-game/${match.roomCode}`)}
                                  data-testid={`button-join-match-${match.id}`}
                                >
                                  Join Match
                                </Button>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {(!bracketData.matches || bracketData.matches.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Tournament hasn't started yet</p>
                      <p className="text-sm">Bracket will appear once all players join</p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                <span>10 players compete in each tournament window</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                <span>Choose your entry fee: 250, 500, 750, 1,000, or 1,500 marbles — any player can join any tier they can afford</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                <span>Beat an opponent and take their locked marbles — win your way through the bracket</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">4.</span>
                <span>The tournament winner (beats all 9 opponents) takes the entire prize pool (10× the entry fee in marbles, plus matching bonus points)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">5.</span>
                <span>When a window reaches 10 players, a new window for that same tier automatically opens</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">6.</span>
                <span>Points earned can be redeemed in the Shop catalog</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
