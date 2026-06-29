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
          winner: `ðŸ¤– ${t("aiGuesser")}`,
          loser: t("youHider"),
          winnerLabel: t("aiGuessedCorrectly")
        };
      } else {
        return {
          winner: t("youHider"),
          loser: `ðŸ¤– ${t("aiGuesser")}`,
          winnerLabel: t("yourMarblesSafe")
        };
      }
    } else {
      if (won) {
        return {
          winner: t("youGuesser"),
          loser: `ðŸ¤– ${t("aiHider")}`,
          winnerLabel: t("perfectGuess")
        };
      } else {
        return {
          winner: `ðŸ¤– ${t("aiHider")}`,
          loser: t("youGuesser"),
          winnerLabel: t("betterLuckNextTime")
        };
      }
    }
  };

  const info = getWinnerInfo();
  return (
    <Card className={`border-2 sm:border-3 shadow-lg sm:shadow-xl transition-all duration-500 ${
      won
        ? "bg-gradient-to-br from-[#00FF88]/20 via-primary/10 to-transparent border-[#00FF88]/60"
        : "bg-gradient-to-br from-destructive/20 via-primary/5 to-transparent border-destructive/60"
    }`}>
      <CardContent className="p-2 sm:p-4 md:p-8 text-center">
        <div className={`text-3xl sm:text-5xl md:text-7xl mb-1 sm:mb-3 ${won ? "animate-pulse" : ""}`}>
          {won ? "ðŸŽ‰" : "ðŸ˜¢"}
        </div>
        
        <div className="mb-2 sm:mb-4 space-y-1 sm:space-y-2">
          <div className={`inline-block px-2 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-lg sm:rounded-xl border sm:border-2 ${
            won
              ? "bg-[#00FF88]/20 border-[#00FF88]/50"
              : "bg-destructive/20 border-destructive/50"
          }`}>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{t("winner")} ðŸ‘‘</p>
            <p className={`text-sm sm:text-xl md:text-2xl font-bold ${
              won ? "text-[#00FF88]" : "text-destructive"
            }`}
            data-testid="text-winner">
              {info.winner}
            </p>
          </div>

          <p className="text-sm sm:text-lg md:text-xl text-primary font-bold">{t("vs")}</p>

          <div className="inline-block px-2 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-lg sm:rounded-xl border sm:border-2 bg-muted/20 border-muted/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground">{t("loser")}</p>
            <p className="text-sm sm:text-xl md:text-2xl font-bold text-muted-foreground" data-testid="text-loser">
              {info.loser}
            </p>
          </div>
        </div>
        
        <h2
          className={`text-base sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 uppercase tracking-wide ${
            won ? "text-[#00FF88]" : "text-destructive"
          }`}
          data-testid="text-result"
        >
          {info.winnerLabel}
        </h2>
        
        <div className={`inline-block px-3 py-2 sm:px-5 sm:py-3 md:px-6 md:py-4 rounded-lg sm:rounded-xl mb-2 sm:mb-4 border sm:border-2 ${
          won
            ? "bg-[#00FF88]/20 border-[#00FF88]/50"
            : "bg-destructive/20 border-destructive/50"
        }`}>
          <div
            className={`text-2xl sm:text-4xl md:text-5xl font-bold ${
              won ? "text-[#00FF88]" : "text-destructive"
            }`}
            data-testid="text-marble-change"
          >
            {won ? "+" : "-"}{Math.abs(marbleChange)} ðŸ’Ž
          </div>
          <p className="text-xs sm:text-base md:text-lg font-semibold text-muted-foreground">{won ? t("marblesWon") : t("marblesLost")}</p>
        </div>
        
        <p className="text-sm sm:text-xl md:text-2xl text-primary mb-2 sm:mb-4 font-bold" data-testid="text-details">
          {details}
        </p>

        {aiChoice && (
          <div className="mb-2 sm:mb-4 px-3 py-1.5 sm:px-5 sm:py-3 bg-gradient-to-r from-primary/30 to-primary/10 rounded-lg sm:rounded-xl border border-primary/40 inline-block" data-testid="text-ai-choice">
            <p className="text-xs sm:text-base md:text-lg text-primary font-bold">
              ðŸ¤– <span className="text-[#FFA500]">{t("aiLabel")}:</span> {aiChoice}
            </p>
          </div>
        )}
        
        <div>
          <Button
            className="bg-gradient-to-r from-primary via-[#FFA500] to-primary hover:from-primary/80 hover:via-[#FFA500]/80 hover:to-primary/80 text-primary-foreground px-4 py-2 sm:px-8 sm:py-4 md:px-12 md:py-6 text-sm sm:text-lg md:text-xl font-bold shadow-lg sm:shadow-xl transition-all uppercase tracking-wide"
            onClick={onPlayAgain}
            data-testid="button-play-again"
          >
            {t("playAgain")} ðŸŽ®
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


