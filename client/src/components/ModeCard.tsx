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
      className="marble-glass hover:border-[#00D9FF]/50 transition-all cursor-pointer hover:-translate-y-2 shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_25px_rgba(0,217,255,0.15)]"
      onClick={onClick}
      data-testid={`card-mode-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-3xl font-bold text-[#00D9FF] mb-3">{title}</h3>
        <p className="text-[#E0F7FF] mb-4 leading-relaxed">{description}</p>
        {requirement && (
          <Badge className="bg-[#E91E8C]/25 text-[#FF69B4] border border-[#E91E8C]/50 px-4 py-2">
            {requirement}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
