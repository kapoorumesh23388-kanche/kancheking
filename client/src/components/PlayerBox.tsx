import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedPlayerAvatar from "@/components/AnimatedPlayerAvatar";

interface PlayerBoxProps {
  name: string;
  avatar?: string;
  marbles: number;
  role: string;
  isActive?: boolean;
  gender?: "boy" | "girl";
  isGuesser?: boolean;
  phase?: "idle" | "hiding" | "hidden" | "revealing" | "revealed";
  isAI?: boolean;
  isWinner?: boolean;
}

export default function PlayerBox({
  name, avatar, marbles, role,
  isActive = false, gender = "boy", isGuesser = false,
  phase = "idle", isAI = false, isWinner = false,
}: PlayerBoxProps) {
  return (
    <Card
      className={`flex-1 min-w-0 transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-br from-[#00FF88]/30 to-[#00FF88]/10 border-2 border-[#00FF88]/70 shadow-[0_0_30px_rgba(0,255,136,0.6)] scale-[1.02]"
          : "bg-gradient-to-br from-white/10 to-white/5 border border-white/15 shadow-xl"
      }`}
      data-testid={`player-box-${name.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <CardContent className="p-2 sm:p-3 text-center">
        <div className="flex justify-center mb-1">
          {avatar ? (
            <Avatar className={`w-14 h-14 border-2 ${isActive ? "border-[#00FF88]" : "border-primary"}`}>
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-[#FFA500] text-xl font-bold">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <AnimatedPlayerAvatar
              gender={gender} playerName="" isGuesser={isGuesser}
              size="md" phase={phase} isAI={isAI} isWinner={isWinner}
            />
          )}
        </div>
        <h4
          className="text-xs sm:text-sm font-bold text-primary mb-1 uppercase tracking-wide truncate"
          data-testid={`text-player-name-${name.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {name}
        </h4>
        <div
          className="text-lg sm:text-2xl font-bold text-[#00FF88] py-1 px-2 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30 mb-1"
          style={{ textShadow: "0 0 20px rgba(0,255,136,0.7)" }}
          data-testid={`text-marbles-${name.toLowerCase().replace(/\s+/g, "-")}`}
        >
          ðŸ’Ž {marbles}
        </div>
        <Badge className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
          isActive ? "bg-[#00FF88]/30 text-[#00FF88] border-[#00FF88]/50" : "bg-primary/20 text-primary border-primary/40"
        }`}>
          {role}
        </Badge>
      </CardContent>
    </Card>
  );
}


