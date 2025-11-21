import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResultDisplayProps {
  won: boolean;
  marbleChange: number;
  details: string;
  aiChoice?: string;
  onPlayAgain?: () => void;
}

export default function ResultDisplay({
  won,
  marbleChange,
  details,
  aiChoice,
  onPlayAgain
}: ResultDisplayProps) {
  return (
    <Card className="bg-white/5 border-2 border-primary/20">
      <CardContent className="p-10 text-center">
        <div className="text-8xl mb-5">{won ? "🎉" : "😢"}</div>
        
        <h2
          className={`text-5xl font-bold mb-4 ${
            won ? "text-[#00FF88]" : "text-destructive"
          }`}
          style={{
            textShadow: won
              ? '0 0 20px rgba(0,255,136,0.5)'
              : '0 0 20px rgba(255,68,68,0.5)'
          }}
          data-testid="text-result"
        >
          {won ? "You Won!" : "You Lost!"}
        </h2>
        
        <div
          className={`text-6xl font-bold mb-4 ${
            won ? "text-[#00FF88]" : "text-destructive"
          }`}
          style={{
            textShadow: won
              ? '0 0 20px rgba(0,255,136,0.5)'
              : '0 0 20px rgba(255,68,68,0.5)'
          }}
          data-testid="text-marble-change"
        >
          {won ? "+" : "-"}{Math.abs(marbleChange)} 💎
        </div>
        
        <p className="text-2xl text-muted-foreground mb-4 font-bold" data-testid="text-details">
          {details}
        </p>

        {aiChoice && (
          <p className="text-lg text-primary mb-6 bg-primary/20 px-6 py-3 rounded-lg" data-testid="text-ai-choice">
            🤖 AI had: {aiChoice}
          </p>
        )}
        
        <Button
          className="bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground px-12 py-6 text-xl font-bold shadow-lg transition-all hover:-translate-y-1"
          onClick={onPlayAgain}
          data-testid="button-play-again"
        >
          Play Again
        </Button>
      </CardContent>
    </Card>
  );
}
