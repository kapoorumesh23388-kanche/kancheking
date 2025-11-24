import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PlayerBoxProps {
  name: string;
  avatar?: string;
  marbles: number;
  role: string;
  isActive?: boolean;
}

export default function PlayerBox({
  name,
  avatar,
  marbles,
  role,
  isActive = false
}: PlayerBoxProps) {
  return (
    <Card
      className={`flex-1 min-w-[220px] transition-all duration-300 transform ${
        isActive
          ? "bg-gradient-to-br from-[#00FF88]/30 to-[#00FF88]/10 border-3 border-[#00FF88]/70 shadow-[0_0_30px_rgba(0,255,136,0.6)] scale-105"
          : "bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/15 shadow-xl"
      }`}
      data-testid={`player-box-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-8 text-center">
        <div className={`relative mb-6 inline-block ${isActive ? "animate-pulse" : ""}`}>
          <Avatar
            className={`w-24 h-24 border-4 ${
              isActive ? "border-[#00FF88]" : "border-primary"
            } shadow-[0_0_25px_rgba(255,215,0,0.5)] transition-all`}
          >
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-[#FFA500] text-primary-foreground text-4xl font-bold">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isActive && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#00FF88] rounded-full border-2 border-white animate-pulse"></div>
          )}
        </div>
        
        <h4
          className="text-2xl font-bold text-primary mb-3 uppercase tracking-wide"
          data-testid={`text-player-name-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {name}
        </h4>
        
        <div className="space-y-4">
          <div
            className="text-5xl font-bold text-[#00FF88] py-3 px-4 rounded-xl bg-[#00FF88]/10 border-2 border-[#00FF88]/30"
            style={{ textShadow: '0 0 20px rgba(0,255,136,0.7)' }}
            data-testid={`text-marbles-${name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            💎 {marbles}
          </div>
          
          <Badge className={`px-6 py-2 text-lg font-bold uppercase tracking-wide border-2 ${
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
