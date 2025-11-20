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
      className="bg-white/5 border-2 border-primary/20 hover:border-primary/50 transition-all cursor-pointer hover:-translate-y-2 shadow-[0_5px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(255,215,0,0.4)]"
      onClick={onClick}
      data-testid={`card-mode-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-3xl font-bold text-primary mb-3">{title}</h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>
        {requirement && (
          <Badge className="bg-destructive/20 text-destructive border border-destructive/40 px-4 py-2">
            {requirement}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
