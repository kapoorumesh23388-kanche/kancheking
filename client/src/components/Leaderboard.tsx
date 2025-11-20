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
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <Card className="bg-white/5 border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary text-center" style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
          🏆 Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry) => (
          <Card
            key={entry.rank}
            className={`border ${
              entry.rank <= 3
                ? "bg-primary/10 border-primary/40"
                : "bg-white/5 border-white/10"
            }`}
            data-testid={`leaderboard-entry-${entry.rank}`}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="text-3xl font-bold text-primary min-w-[60px]">
                {getRankBadge(entry.rank)}
              </div>
              
              <Avatar className="w-12 h-12 border-2 border-primary">
                <AvatarImage src={entry.avatar} alt={entry.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-[#FFA500] text-primary-foreground">
                  {entry.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h4 className="text-lg font-bold text-primary" data-testid={`text-name-${entry.rank}`}>
                  {entry.name}
                </h4>
              </div>
              
              <div className="flex gap-3">
                <Badge className="bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40 px-3 py-1">
                  💎 {entry.marbles}
                </Badge>
                <Badge className="bg-primary/20 text-primary border border-primary/40 px-3 py-1">
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
