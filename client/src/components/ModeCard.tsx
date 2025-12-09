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
      className="bg-[#0C0418]/90 border-2 border-[#00D9FF]/40 hover:border-[#00D9FF]/70 transition-all cursor-pointer hover:-translate-y-2 shadow-[0_0_20px_rgba(0,217,255,0.15)] hover:shadow-[0_0_30px_rgba(0,217,255,0.25)] backdrop-blur-sm"
      onClick={onClick}
      data-testid={`card-mode-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-6 md:p-8 text-center relative overflow-hidden">
        {/* Subtle inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/5 via-transparent to-[#E91E8C]/5 pointer-events-none" />
        
        <div className="text-5xl md:text-6xl mb-4 relative z-10">{icon}</div>
        <h3 className="text-2xl md:text-3xl font-bold text-[#00E5FF] mb-3 relative z-10 drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]">{title}</h3>
        <p className="text-[#F4FBFF] text-sm md:text-base mb-4 leading-relaxed relative z-10">{description}</p>
        {requirement && (
          <Badge className="bg-[#E91E8C]/30 text-[#FF8DC7] border border-[#E91E8C]/60 px-4 py-2 font-semibold relative z-10">
            {requirement}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
