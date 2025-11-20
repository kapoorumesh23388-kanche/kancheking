import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PlayerProfileProps {
  name: string;
  avatar?: string;
  marbles: number;
  gamesPlayed: number;
  gamesWon: number;
}

export default function PlayerProfile({
  name,
  avatar,
  marbles,
  gamesPlayed,
  gamesWon
}: PlayerProfileProps) {
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  return (
    <Card className="bg-white/5 border-2 border-primary/20 backdrop-blur-sm shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
      <CardContent className="p-8">
        <div className="flex items-center gap-6 flex-wrap">
          <Avatar className="w-30 h-30 border-4 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] cursor-pointer">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-[#FFA500] text-primary-foreground text-5xl">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2
              className="text-4xl font-bold text-primary cursor-pointer hover:text-[#FFA500] transition-colors mb-2"
              style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}
              data-testid="text-player-name"
            >
              {name}
            </h2>
            
            <div className="flex gap-4 flex-wrap mt-4">
              <Badge
                className="bg-gradient-to-r from-primary/30 to-[#FFA500]/30 text-white border border-primary/40 px-5 py-2 text-base hover:from-primary/50 hover:to-[#FFA500]/50"
                data-testid="badge-marbles"
              >
                💎 {marbles} Marbles
              </Badge>
              <Badge
                className="bg-gradient-to-r from-primary/30 to-[#FFA500]/30 text-white border border-primary/40 px-5 py-2 text-base hover:from-primary/50 hover:to-[#FFA500]/50"
                data-testid="badge-games-played"
              >
                🎮 {gamesPlayed} Games
              </Badge>
              <Badge
                className="bg-gradient-to-r from-primary/30 to-[#FFA500]/30 text-white border border-primary/40 px-5 py-2 text-base hover:from-primary/50 hover:to-[#FFA500]/50"
                data-testid="badge-win-rate"
              >
                🏆 {winRate}% Win Rate
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
