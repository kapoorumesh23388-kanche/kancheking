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
}

export default function PlayerBox({
  name,
  avatar,
  marbles,
  role,
  isActive = false,
  gender = "boy",
  isGuesser = false
}: PlayerBoxProps) {
  return (
    <Card
      className={`flex-1 min-w-0 transition-all duration-300 transform ${
        isActive
          ? "bg-gradient-to-br from-[#00FF88]/30 to-[#00FF88]/10 border-2 md:border-3 border-[#00FF88]/70 shadow-[0_0_30px_rgba(0,255,136,0.6)] scale-[1.02] md:scale-105"
          : "bg-gradient-to-br from-white/10 to-white/5 border border-white/15 md:border-2 shadow-xl"
      }`}
      data-testid={`player-box-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-2 sm:p-4 md:p-8 text-center">
        <div className={`relative mb-2 sm:mb-4 md:mb-6 inline-block ${isActive ? "animate-pulse" : ""}`}>
          {avatar ? (
            <Avatar
              className={`w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 border-2 md:border-4 ${
                isActive ? "border-[#00FF88]" : "border-primary"
              } shadow-[0_0_25px_rgba(255,215,0,0.5)] transition-all`}
            >
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-[#FFA500] text-primary-foreground text-lg sm:text-2xl md:text-4xl font-bold">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className={`${isActive ? "animate-pulse" : ""}`}>
              <div className="md:hidden">
                <AnimatedPlayerAvatar
                  gender={gender}
                  playerName={name}
                  isGuesser={isGuesser}
                  size="sm"
                />
              </div>
              <div className="hidden md:block">
                <AnimatedPlayerAvatar
                  gender={gender}
                  playerName={name}
                  isGuesser={isGuesser}
                  size="lg"
                />
              </div>
            </div>
          )}
          {isActive && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 bg-[#00FF88] rounded-full border border-white md:border-2 animate-pulse"></div>
          )}
        </div>
        
        <h4
          className="text-xs sm:text-sm md:text-2xl font-bold text-primary mb-1 sm:mb-2 md:mb-3 uppercase tracking-wide truncate"
          data-testid={`text-player-name-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {name}
        </h4>
        
        <div className="space-y-1 sm:space-y-2 md:space-y-4">
          <div
            className="text-lg sm:text-2xl md:text-5xl font-bold text-[#00FF88] py-1 sm:py-2 md:py-3 px-2 md:px-4 rounded-lg md:rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 md:border-2"
            style={{ textShadow: '0 0 20px rgba(0,255,136,0.7)' }}
            data-testid={`text-marbles-${name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <span className="text-sm sm:text-lg md:text-3xl">💎</span> {marbles}
          </div>
          
          <Badge className={`px-2 sm:px-4 md:px-6 py-0.5 sm:py-1 md:py-2 text-[10px] sm:text-xs md:text-lg font-bold uppercase tracking-wide border ${
            isActive
              ? "bg-[#00FF88]/30 text-[#00FF88] border-[#00FF88]/50"
              : "bg-primary/20 text-primary border-primary/40"
          }`}>
            {role}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
