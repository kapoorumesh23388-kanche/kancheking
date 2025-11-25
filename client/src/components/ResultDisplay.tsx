import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResultDisplayProps {
  won: boolean;
  marbleChange: number;
  details: string;
  aiChoice?: string;
  onPlayAgain?: () => void;
  isPlayer1Hider?: boolean;
}

export default function ResultDisplay({
  won,
  marbleChange,
  details,
  aiChoice,
  onPlayAgain,
  isPlayer1Hider = true
}: ResultDisplayProps) {
  // Determine winner and loser with their roles
  const getWinnerInfo = () => {
    if (isPlayer1Hider) {
      // Player 1 is hider, AI is guesser
      if (won) {
        // Guesser (AI) won, hider (you) lost
        return {
          winner: "🤖 AI (Guesser)",
          loser: "You (Hider)",
          winnerLabel: "AI Guessed Correctly!"
        };
      } else {
        // Hider (you) won, guesser (AI) lost
        return {
          winner: "You (Hider)",
          loser: "🤖 AI (Guesser)",
          winnerLabel: "Your Marbles Safe!"
        };
      }
    } else {
      // AI is hider, Player 1 is guesser
      if (won) {
        // Guesser (you) won, hider (AI) lost
        return {
          winner: "You (Guesser)",
          loser: "🤖 AI (Hider)",
          winnerLabel: "Perfect Guess!"
        };
      } else {
        // Hider (AI) won, guesser (you) lost
        return {
          winner: "🤖 AI (Hider)",
          loser: "You (Guesser)",
          winnerLabel: "Better Luck Next Time!"
        };
      }
    }
  };

  const info = getWinnerInfo();
  return (
    <Card className={`border-4 shadow-2xl transition-all duration-500 ${
      won
        ? "bg-gradient-to-br from-[#00FF88]/20 via-primary/10 to-transparent border-[#00FF88]/60 shadow-[0_0_40px_rgba(0,255,136,0.4)]"
        : "bg-gradient-to-br from-destructive/20 via-primary/5 to-transparent border-destructive/60 shadow-[0_0_40px_rgba(255,68,68,0.4)]"
    }`}>
      <CardContent className="p-12 text-center">
        <div className={`text-9xl mb-8 animate-bounce ${won ? "animate-pulse" : ""}`}>
          {won ? "🎉" : "😢"}
        </div>
        
        {/* Winner and Loser Display */}
        <div className="mb-8 space-y-4">
          <div className={`inline-block px-8 py-4 rounded-2xl border-3 mb-4 ${
            won
              ? "bg-[#00FF88]/20 border-[#00FF88]/50"
              : "bg-destructive/20 border-destructive/50"
          }`}>
            <p className="text-sm text-muted-foreground mb-2">WINNER 👑</p>
            <p className={`text-3xl font-bold ${
              won ? "text-[#00FF88]" : "text-destructive"
            }`}
            style={{
              textShadow: won
                ? '0 0 20px rgba(0,255,136,0.6)'
                : '0 0 20px rgba(255,68,68,0.6)'
            }}
            data-testid="text-winner">
              {info.winner}
            </p>
          </div>

          <p className="text-2xl text-primary font-bold">vs</p>

          <div className="inline-block px-8 py-4 rounded-2xl border-3 bg-muted/20 border-muted/50">
            <p className="text-sm text-muted-foreground mb-2">LOSER</p>
            <p className="text-3xl font-bold text-muted-foreground" data-testid="text-loser">
              {info.loser}
            </p>
          </div>
        </div>
        
        <h2
          className={`text-5xl font-bold mb-6 uppercase tracking-wider ${
            won ? "text-[#00FF88]" : "text-destructive"
          }`}
          style={{
            textShadow: won
              ? '0 0 30px rgba(0,255,136,0.7)'
              : '0 0 30px rgba(255,68,68,0.7)'
          }}
          data-testid="text-result"
        >
          {info.winnerLabel}
        </h2>
        
        <div className={`inline-block px-8 py-6 rounded-2xl mb-8 border-3 ${
          won
            ? "bg-[#00FF88]/20 border-[#00FF88]/50"
            : "bg-destructive/20 border-destructive/50"
        }`}>
          <div
            className={`text-7xl font-bold mb-2 ${
              won ? "text-[#00FF88]" : "text-destructive"
            }`}
            style={{
              textShadow: won
                ? '0 0 25px rgba(0,255,136,0.6)'
                : '0 0 25px rgba(255,68,68,0.6)'
            }}
            data-testid="text-marble-change"
          >
            {won ? "+" : "-"}{Math.abs(marbleChange)} 💎
          </div>
          <p className="text-xl font-semibold text-muted-foreground">Marbles {won ? "gained" : "lost"}</p>
        </div>
        
        <p className="text-3xl text-primary mb-8 font-bold" style={{ textShadow: '0 0 15px rgba(255,215,0,0.5)' }} data-testid="text-details">
          {details}
        </p>

        {aiChoice && (
          <div className="mb-8 p-6 bg-gradient-to-r from-primary/30 to-primary/10 px-8 py-5 rounded-2xl border-2 border-primary/40 inline-block" data-testid="text-ai-choice">
            <p className="text-xl text-primary font-bold">
              🤖 <span className="text-[#FFA500]">AI revealed:</span> {aiChoice}
            </p>
          </div>
        )}
        
        <Button
          className="bg-gradient-to-r from-primary via-[#FFA500] to-primary hover:from-primary/80 hover:via-[#FFA500]/80 hover:to-primary/80 text-primary-foreground px-16 py-8 text-2xl font-bold shadow-2xl transition-all hover:-translate-y-2 uppercase tracking-wider"
          onClick={onPlayAgain}
          data-testid="button-play-again"
        >
          Play Again 🎮
        </Button>
      </CardContent>
    </Card>
  );
}
