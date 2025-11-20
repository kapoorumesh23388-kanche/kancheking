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
      className={`flex-1 min-w-[200px] transition-all ${
        isActive
          ? "bg-[#00FF88]/20 border-2 border-[#00FF88]/50 shadow-[0_8px_25px_rgba(0,255,136,0.4)]"
          : "bg-white/5 border-2 border-white/10"
      }`}
      data-testid={`player-box-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-6 text-center">
        <Avatar
          className={`w-20 h-20 mx-auto mb-4 border-3 border-primary shadow-[0_0_20px_rgba(255,215,0,0.5)] ${
            isActive ? "animate-pulse" : ""
          }`}
        >
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-[#FFA500] text-primary-foreground text-4xl">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <h4
          className="text-2xl font-bold text-primary mb-2"
          data-testid={`text-player-name-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {name}
        </h4>
        
        <div
          className="text-3xl font-bold text-[#00FF88] my-3"
          style={{ textShadow: '0 0 15px rgba(0,255,136,0.5)' }}
          data-testid={`text-marbles-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          💎 {marbles}
        </div>
        
        <Badge className="bg-primary/20 text-primary border border-primary/30 px-4 py-1 mt-2">
          {role}
        </Badge>
      </CardContent>
    </Card>
  );
}
