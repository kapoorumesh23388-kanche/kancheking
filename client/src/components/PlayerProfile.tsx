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
    <Card className="marble-glass shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
      <CardContent className="p-4 md:p-8">
        <div className="flex items-center gap-3 md:gap-6 flex-wrap">
          <Avatar className="w-20 md:w-30 h-20 md:h-30 border-3 md:border-4 border-[#00D9FF] shadow-[0_0_25px_rgba(0,217,255,0.5)] cursor-pointer flex-shrink-0">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-[#00D9FF] to-[#E91E8C] text-white text-3xl md:text-5xl">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h2
              className="text-xl md:text-4xl font-bold text-[#00D9FF] neon-text-cyan cursor-pointer hover:text-[#E91E8C] transition-colors mb-1 md:mb-2 truncate"
              data-testid="text-player-name"
            >
              {name}
            </h2>
            
            <div className="flex gap-1 md:gap-4 flex-wrap mt-2 md:mt-4">
              <Badge
                className="bg-gradient-to-r from-[#00D9FF]/20 to-[#E91E8C]/20 text-[#00D9FF] border border-[#00D9FF]/40 px-2 md:px-5 py-1 md:py-2 text-xs md:text-base"
                data-testid="badge-marbles"
              >
                💎 {marbles}
              </Badge>
              <Badge
                className="bg-gradient-to-r from-[#00D9FF]/20 to-[#E91E8C]/20 text-[#00D9FF] border border-[#00D9FF]/40 px-2 md:px-5 py-1 md:py-2 text-xs md:text-base"
                data-testid="badge-games-played"
              >
                🎮 {gamesPlayed}
              </Badge>
              <Badge
                className="bg-gradient-to-r from-[#00D9FF]/20 to-[#E91E8C]/20 text-[#00D9FF] border border-[#00D9FF]/40 px-2 md:px-5 py-1 md:py-2 text-xs md:text-base"
                data-testid="badge-win-rate"
              >
                🏆 {winRate}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
