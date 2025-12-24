import { useState, useEffect, useCallback } from "react";
import Leaderboard from "@/components/Leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Clock, Target, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  marbles: number;
  winRate: number;
}

export default function LeaderboardPage() {
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState({
    name: "",
    winningMarbles: 0,
    rank: 0,
  });

  // Fetch leaderboard from API with real-time polling
  const { data: leaderboardData, isLoading, refetch } = useQuery<{ leaderboard: LeaderboardEntry[] }>({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 10000, // Auto-refresh every 10 seconds for real-time updates
    staleTime: 5000,
  });

  const globalEntries: LeaderboardEntry[] = leaderboardData?.leaderboard || [];

  const getWinningMarbles = (): number => {
    const pvpWins = parseInt(localStorage.getItem("pvpWinMarbles") || "0");
    return pvpWins;
  };

  const calculatePlayerRank = useCallback((winningMarbles: number, entries: LeaderboardEntry[]): number => {
    let rank = 1;
    for (const entry of entries) {
      if (entry.marbles > winningMarbles) {
        rank++;
      }
    }
    return rank;
  }, []);

  useEffect(() => {
    const name = localStorage.getItem("playerDisplayName") || "You";
    const winningMarbles = getWinningMarbles();
    
    const rank = globalEntries.length > 0 ? calculatePlayerRank(winningMarbles, globalEntries) : 0;
    
    setCurrentPlayer({
      name,
      winningMarbles,
      rank,
    });

    const today = new Date().toISOString().split("T")[0];
    const lastBonusDate = localStorage.getItem("leaderboardBonusDate");
    
    if (lastBonusDate !== today && rank === 1 && winningMarbles > 0) {
      const currentPoints = parseInt(localStorage.getItem("playerRewardPoints") || "0");
      localStorage.setItem("playerRewardPoints", (currentPoints + 50).toString());
      localStorage.setItem("leaderboardBonusDate", today);
      
      toast({
        title: "Daily #1 Bonus!",
        description: "+50 points for being #1 on the leaderboard!",
      });
    }
  }, [toast, globalEntries, calculatePlayerRank]);

  const tournamentEntries: LeaderboardEntry[] = globalEntries.slice(0, 10);

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-4xl mx-auto px-5">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <h1
              className="text-5xl font-bold text-primary mb-3"
              style={{ textShadow: '0 0 20px rgba(255,215,0,0.5)' }}
            >
              Leaderboards
            </h1>
            <Button
              size="icon"
              variant="outline"
              onClick={() => refetch()}
              className="rounded-full"
              data-testid="button-refresh-leaderboard"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-xl text-muted-foreground">
            Ranked by Winning Marbles (PvP Wins) - Updates every 10s
          </p>
        </div>

        <Card className="bg-gradient-to-r from-[#00D9FF]/10 to-[#E91E8C]/10 border-2 border-[#00D9FF]/40 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-[#FFD700]" />
                  <div>
                    <p className="text-sm text-muted-foreground">Your Winning Marbles</p>
                    <p className="text-2xl font-bold text-[#00FF88]" data-testid="text-your-winning-marbles">
                      {currentPlayer.winningMarbles}
                    </p>
                  </div>
                </div>
                <div className="border-l border-white/20 pl-6">
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="text-2xl font-bold text-[#FFD700]" data-testid="text-your-rank">
                    #{currentPlayer.rank > 0 ? currentPlayer.rank : "-"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Badge className="bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40 px-3 py-2">
                  <Star className="w-4 h-4 mr-1" />
                  Daily #1 = +50 pts
                </Badge>
                <Badge className="bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40 px-3 py-2">
                  <Target className="w-4 h-4 mr-1" />
                  Beat Opponent = +25 pts
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0C0418]/80 border-2 border-[#E91E8C]/30 mb-6">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-[#E91E8C] mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Daily Rewards System
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-[#00D9FF] font-bold">10 min Login</p>
                <p className="text-[#FFD700]">+50 pts</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-[#00D9FF] font-bold">Every Hour</p>
                <p className="text-[#FFD700]">+50 pts</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-[#00D9FF] font-bold">Beat AI</p>
                <p className="text-[#FFD700]">+25 pts</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-[#00D9FF] font-bold">Daily #1</p>
                <p className="text-[#FFD700]">+50 pts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-card/50 p-1">
            <TabsTrigger
              value="global"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid="tab-global"
            >
              Global
            </TabsTrigger>
            <TabsTrigger
              value="tournament"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid="tab-tournament"
            >
              Tournament
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid="tab-friends"
            >
              Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <Leaderboard entries={globalEntries} />
          </TabsContent>

          <TabsContent value="tournament">
            <Leaderboard entries={tournamentEntries} />
          </TabsContent>

          <TabsContent value="friends">
            <div className="text-center p-10 text-muted-foreground">
              <p className="text-xl">Add friends to see their rankings!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
