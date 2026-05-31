import { useState, useEffect, useMemo, useRef } from "react";
import Leaderboard from "@/components/Leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Clock, Target, RefreshCw, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { awardLeaderboardBonus } from "@/lib/rewardsStorage";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  marbles: number;
  winRate: number;
}

// Check if it's within the first-day bonus window: 1st day of month, before 11:59:59 AM
function isMonthlyBonusWindow(): boolean {
  const now = new Date();
  const isFirstDay = now.getDate() === 1;
  const beforeCutoff =
    now.getHours() < 11 ||
    (now.getHours() === 11 && now.getMinutes() < 59) ||
    (now.getHours() === 11 && now.getMinutes() === 59 && now.getSeconds() <= 59);
  return isFirstDay && beforeCutoff;
}

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

export default function LeaderboardPage() {
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState({
    name: "",
    winningMarbles: 0,
    rank: 0,
  });
  const bonusCheckedRef = useRef(false);
  const [timeUntilReset, setTimeUntilReset] = useState("");

  const { data: leaderboardData, isLoading, refetch } = useQuery<{ leaderboard: LeaderboardEntry[] }>({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const globalEntries = useMemo(() => leaderboardData?.leaderboard || [], [leaderboardData]);

  const getWinningMarbles = (): number =>
    parseInt(localStorage.getItem("pvpWinMarbles") || "0");

  // Countdown to next 1st of month
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
      const diff = next.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilReset(`${days}d ${hours}h ${mins}m ${secs}s`);
    };
    updateCountdown();
    const id = setInterval(updateCountdown, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const name = localStorage.getItem("playerDisplayName") || "You";
    const winningMarbles = getWinningMarbles();

    // Rank is determined purely by pvpWinMarbles count
    let rank = 1;
    for (const entry of globalEntries) {
      if (entry.marbles > winningMarbles) rank++;
    }
    const finalRank = globalEntries.length > 0 ? rank : 0;

    setCurrentPlayer({ name, winningMarbles, rank: finalRank });

    // Monthly #1 bonus: only on 1st of month before 11:59:59 AM
    if (!bonusCheckedRef.current && finalRank === 1 && winningMarbles > 0) {
      const monthKey = getMonthKey();
      const lastBonusMonth = localStorage.getItem("leaderboardMonthlyBonusMonth");

      if (isMonthlyBonusWindow() && lastBonusMonth !== monthKey) {
        awardLeaderboardBonus();
        localStorage.setItem("leaderboardMonthlyBonusMonth", monthKey);
        bonusCheckedRef.current = true;
        toast({
          title: "👑 Monthly #1 Bonus!",
          description: "+500 points for holding #1 rank at the start of the month!",
        });
      }
    }
  }, [globalEntries, toast]);

  return (
    <div className="min-h-screen pt-20 pb-10 overflow-x-hidden">
      <div className="container max-w-4xl mx-auto px-3 sm:px-5">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-5xl font-bold text-primary mb-3" style={{ textShadow: "0 0 20px rgba(255,215,0,0.5)" }}>
              Leaderboards
            </h1>
            <Button
              size="icon"
              variant="outline"
              onClick={() => refetch()}
              className="rounded-full mb-3"
              data-testid="button-refresh-leaderboard"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Ranked by <strong className="text-[#00FF88]">PvP Win Marbles only</strong> — updates every 10 seconds
          </p>
        </div>

        {/* Player card */}
        <Card className="bg-gradient-to-r from-[#00D9FF]/10 to-[#E91E8C]/10 border-2 border-[#00D9FF]/40 mb-4 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-[#FFD700]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Your PvP Win Marbles</p>
                    <p className="text-2xl font-bold text-[#00FF88]" data-testid="text-your-winning-marbles">
                      {currentPlayer.winningMarbles}
                    </p>
                  </div>
                </div>
                <div className="border-l border-white/20 pl-4">
                  <p className="text-xs text-muted-foreground">Your Rank</p>
                  <p className="text-2xl font-bold text-[#FFD700]" data-testid="text-your-rank">
                    {currentPlayer.rank > 0 ? `#${currentPlayer.rank}` : "-"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40 px-2 py-1 text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Monthly #1 = +500 pts
                </Badge>
                <Badge className="bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40 px-2 py-1 text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  PvP Win = +25 pts
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly reset countdown */}
        <Card className="bg-[#0C0418]/80 border-2 border-[#FFD700]/30 mb-4 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#FFD700] flex items-center gap-2">
                  <Crown className="w-4 h-4" /> Monthly #1 Bonus System
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  The player holding <strong>#1 rank</strong> on the 1st of each month (before 11:59 AM) earns <strong className="text-yellow-400">+500 Reward Points</strong>. Rank is decided by PvP Win Marbles count and updates in real-time.
                </p>
              </div>
              <div className="bg-black/40 rounded-xl px-4 py-2 text-center min-w-[140px]">
                <p className="text-xs text-muted-foreground">Next Reset In</p>
                <p className="font-mono text-[#00D9FF] font-bold text-sm">{timeUntilReset}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily rewards info */}
        <Card className="bg-[#0C0418]/80 border-2 border-[#E91E8C]/30 mb-6 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <h3 className="text-sm font-bold text-[#E91E8C] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> How to Earn Reward Points
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-black/30 rounded-lg p-2 text-center">
                <p className="text-[#00D9FF] font-bold">Daily Login</p>
                <p className="text-[#FFD700]">+100 pts</p>
              </div>
              <div className="bg-black/30 rounded-lg p-2 text-center">
                <p className="text-[#00D9FF] font-bold">Every Hour</p>
                <p className="text-[#FFD700]">+50 pts</p>
              </div>
              <div className="bg-black/30 rounded-lg p-2 text-center">
                <p className="text-[#00D9FF] font-bold">Beat AI</p>
                <p className="text-[#FFD700]">+25 pts</p>
              </div>
              <div className="bg-black/30 rounded-lg p-2 text-center">
                <p className="text-[#00D9FF] font-bold">Monthly #1</p>
                <p className="text-[#FFD700]">+500 pts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-card/50 p-1">
            <TabsTrigger value="global" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-global">
              Global
            </TabsTrigger>
            <TabsTrigger value="tournament" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-tournament">
              Top 10
            </TabsTrigger>
            <TabsTrigger value="friends" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-friends">
              Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <Leaderboard entries={globalEntries} />
          </TabsContent>
          <TabsContent value="tournament">
            <Leaderboard entries={globalEntries.slice(0, 10)} />
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
