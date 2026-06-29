import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  marbles: number;
  winRate: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return "ðŸ¥‡";
    if (rank === 2) return "ðŸ¥ˆ";
    if (rank === 3) return "ðŸ¥‰";
    return `#${rank}`;
  };

  return (
    <Card className="bg-white/5 border-2 border-primary/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-primary text-center" style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
          ðŸ† Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 px-2 sm:px-4">
        {entries.map((entry) => (
          <Card
            key={entry.rank}
            className={`border overflow-hidden ${
              entry.rank <= 3
                ? "bg-primary/10 border-primary/40"
                : "bg-white/5 border-white/10"
            }`}
            data-testid={`leaderboard-entry-${entry.rank}`}
          >
            <CardContent className="p-2 sm:p-4 flex items-center gap-2 sm:gap-4">
              <div className="text-xl sm:text-3xl font-bold text-primary min-w-[40px] sm:min-w-[60px] text-center">
                {getRankBadge(entry.rank)}
              </div>
              
              <Avatar className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-primary flex-shrink-0">
                <AvatarImage src={entry.avatar} alt={entry.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-[#FFA500] text-primary-foreground text-xs sm:text-base">
                  {entry.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-lg font-bold text-primary truncate" data-testid={`text-name-${entry.rank}`}>
                  {entry.name}
                </h4>
              </div>
              
              <div className="flex gap-1 sm:gap-3 flex-shrink-0">
                <Badge className="bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40 px-1.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                  ðŸ’Ž {entry.marbles}
                </Badge>
                <Badge className="bg-primary/20 text-primary border border-primary/40 px-1.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                  {entry.winRate}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}


