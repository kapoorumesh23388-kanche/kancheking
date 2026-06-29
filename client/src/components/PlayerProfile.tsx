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
    <Card className="bg-[#0C0418]/90 border-2 border-[#00D9FF]/40 backdrop-blur-sm shadow-[0_0_25px_rgba(0,217,255,0.15)]">
      <CardContent className="p-4 md:p-8">
        <div className="flex items-center gap-3 md:gap-6 flex-wrap">
          <Avatar className="w-20 md:w-30 h-20 md:h-30 border-3 md:border-4 border-[#00D9FF] shadow-[0_0_20px_rgba(0,217,255,0.4)] cursor-pointer flex-shrink-0">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-[#00D9FF] to-[#E91E8C] text-white text-3xl md:text-5xl">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h2
              className="text-xl md:text-4xl font-bold text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,217,255,0.5)] cursor-pointer hover:text-[#E91E8C] transition-colors mb-1 md:mb-2 truncate"
              data-testid="text-player-name"
            >
              {name}
            </h2>
            
            <div className="flex gap-1 md:gap-4 flex-wrap mt-2 md:mt-4">
              <Badge
                className="bg-[#00D9FF]/15 text-[#00E5FF] border border-[#00D9FF]/50 px-2 md:px-5 py-1 md:py-2 text-xs md:text-base font-semibold"
                data-testid="badge-marbles"
              >
                <span className="mr-1">ðŸ’Ž</span> {marbles}
              </Badge>
              <Badge
                className="bg-[#E91E8C]/15 text-[#FF8DC7] border border-[#E91E8C]/50 px-2 md:px-5 py-1 md:py-2 text-xs md:text-base font-semibold"
                data-testid="badge-games-played"
              >
                <span className="mr-1">ðŸŽ®</span> {gamesPlayed}
              </Badge>
              <Badge
                className="bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/50 px-2 md:px-5 py-1 md:py-2 text-xs md:text-base font-semibold"
                data-testid="badge-win-rate"
              >
                <span className="mr-1">ðŸ†</span> {winRate}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


