import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModeCardProps {
  icon: string;
  title: string;
  description: string;
  requirement?: string;
  onClick?: () => void;
}

export default function ModeCard({
  icon,
  title,
  description,
  requirement,
  onClick
}: ModeCardProps) {
  return (
    <Card
      className="bg-[#0C0418]/90 border-2 border-[#00D9FF]/40 hover:border-[#00D9FF]/70 transition-all cursor-pointer hover:-translate-y-2 shadow-[0_0_20px_rgba(0,217,255,0.15)] hover:shadow-[0_0_30px_rgba(0,217,255,0.25)] backdrop-blur-sm h-full"
      onClick={onClick}
      data-testid={`card-mode-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-4 md:p-8 text-center relative overflow-hidden h-full flex flex-col items-center justify-center min-h-[160px]">
        {/* Subtle inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/5 via-transparent to-[#E91E8C]/5 pointer-events-none" />
        
        <div className="text-4xl md:text-6xl mb-3 relative z-10">{icon}</div>
        <h3 className="text-base md:text-3xl font-bold text-[#00E5FF] mb-2 relative z-10 drop-shadow-[0_0_8px_rgba(0,217,255,0.5)] leading-tight">{title}</h3>
        <p className="text-[#F4FBFF] text-xs md:text-base mb-3 leading-relaxed relative z-10 line-clamp-2">{description}</p>
        {requirement && (
          <Badge className="bg-[#E91E8C]/30 text-[#FF8DC7] border border-[#E91E8C]/60 px-2 md:px-4 py-1 md:py-2 font-semibold relative z-10 text-xs md:text-sm">
            {requirement}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}


