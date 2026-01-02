import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

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
  const { t } = useLanguage();
  const getWinnerInfo = () => {
    if (isPlayer1Hider) {
      if (won) {
        return {
          winner: `🤖 ${t("aiGuesser")}`,
          loser: t("youHider"),
          winnerLabel: t("aiGuessedCorrectly")
        };
      } else {
        return {
          winner: t("youHider"),
          loser: `🤖 ${t("aiGuesser")}`,
          winnerLabel: t("yourMarblesSafe")
        };
      }
    } else {
      if (won) {
        return {
          winner: t("youGuesser"),
          loser: `🤖 ${t("aiHider")}`,
          winnerLabel: t("perfectGuess")
        };
      } else {
        return {
          winner: `🤖 ${t("aiHider")}`,
          loser: t("youGuesser"),
          winnerLabel: t("betterLuckNextTime")
        };
      }
    }
  };

  const info = getWinnerInfo();
  return (
    <Card className={`border-2 sm:border-4 shadow-xl sm:shadow-2xl transition-all duration-500 ${
      won
        ? "bg-gradient-to-br from-[#00FF88]/20 via-primary/10 to-transparent border-[#00FF88]/60 shadow-[0_0_20px_rgba(0,255,136,0.4)] sm:shadow-[0_0_40px_rgba(0,255,136,0.4)]"
        : "bg-gradient-to-br from-destructive/20 via-primary/5 to-transparent border-destructive/60 shadow-[0_0_20px_rgba(255,68,68,0.4)] sm:shadow-[0_0_40px_rgba(255,68,68,0.4)]"
    }`}>
      <CardContent className="p-3 sm:p-6 md:p-10 text-center">
        <div className={`text-4xl sm:text-6xl md:text-8xl mb-3 sm:mb-6 animate-bounce ${won ? "animate-pulse" : ""}`}>
          {won ? "🎉" : "😢"}
        </div>
        
        <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
          <div className={`inline-block px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl sm:rounded-2xl border-2 sm:border-3 mb-2 sm:mb-4 ${
            won
              ? "bg-[#00FF88]/20 border-[#00FF88]/50"
              : "bg-destructive/20 border-destructive/50"
          }`}>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t("winner")} 👑</p>
            <p className={`text-lg sm:text-2xl md:text-3xl font-bold ${
              won ? "text-[#00FF88]" : "text-destructive"
            }`}
            style={{
              textShadow: won
                ? '0 0 10px rgba(0,255,136,0.6)'
                : '0 0 10px rgba(255,68,68,0.6)'
            }}
            data-testid="text-winner">
              {info.winner}
            </p>
          </div>

          <p className="text-lg sm:text-xl md:text-2xl text-primary font-bold">{t("vs")}</p>

          <div className="inline-block px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl sm:rounded-2xl border-2 sm:border-3 bg-muted/20 border-muted/50">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t("loser")}</p>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-muted-foreground" data-testid="text-loser">
              {info.loser}
            </p>
          </div>
        </div>
        
        <h2
          className={`text-xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-5 uppercase tracking-wide sm:tracking-wider ${
            won ? "text-[#00FF88]" : "text-destructive"
          }`}
          style={{
            textShadow: won
              ? '0 0 15px rgba(0,255,136,0.7)'
              : '0 0 15px rgba(255,68,68,0.7)'
          }}
          data-testid="text-result"
        >
          {info.winnerLabel}
        </h2>
        
        <div className={`inline-block px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 border-2 sm:border-3 ${
          won
            ? "bg-[#00FF88]/20 border-[#00FF88]/50"
            : "bg-destructive/20 border-destructive/50"
        }`}>
          <div
            className={`text-3xl sm:text-5xl md:text-6xl font-bold mb-1 ${
              won ? "text-[#00FF88]" : "text-destructive"
            }`}
            style={{
              textShadow: won
                ? '0 0 15px rgba(0,255,136,0.6)'
                : '0 0 15px rgba(255,68,68,0.6)'
            }}
            data-testid="text-marble-change"
          >
            {won ? "+" : "-"}{Math.abs(marbleChange)} 💎
          </div>
          <p className="text-sm sm:text-lg md:text-xl font-semibold text-muted-foreground">{won ? t("marblesWon") : t("marblesLost")}</p>
        </div>
        
        <p className="text-lg sm:text-2xl md:text-3xl text-primary mb-4 sm:mb-6 font-bold" style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }} data-testid="text-details">
          {details}
        </p>

        {aiChoice && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-5 bg-gradient-to-r from-primary/30 to-primary/10 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border sm:border-2 border-primary/40 inline-block" data-testid="text-ai-choice">
            <p className="text-sm sm:text-lg md:text-xl text-primary font-bold">
              🤖 <span className="text-[#FFA500]">{t("aiLabel")}:</span> {aiChoice}
            </p>
          </div>
        )}
        
        <Button
          className="bg-gradient-to-r from-primary via-[#FFA500] to-primary hover:from-primary/80 hover:via-[#FFA500]/80 hover:to-primary/80 text-primary-foreground px-6 py-4 sm:px-10 sm:py-6 md:px-14 md:py-7 text-base sm:text-xl md:text-2xl font-bold shadow-xl sm:shadow-2xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 uppercase tracking-wide sm:tracking-wider"
          onClick={onPlayAgain}
          data-testid="button-play-again"
        >
          {t("playAgain")} 🎮
        </Button>
      </CardContent>
    </Card>
  );
}
