import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface GuessingPanelProps {
  onGuess?: (guess: string, bet: number) => void;
  maxBet?: number;
}

export default function GuessingPanel({ onGuess, maxBet = 100 }: GuessingPanelProps) {
  const { t } = useLanguage();
  const [bet, setBet] = useState(Math.min(10, maxBet));
  // Locks both buttons the instant a guess is submitted, so a double-tap,
  // double-click, or slow-network re-tap can't fire onGuess twice for the
  // same round (this was previously unguarded — each extra tap sent a
  // brand-new "guess" message the server had no way to tell apart from a
  // genuine next round, doubling marbles/points and re-granting a spin).
  // Resets automatically each round because MultiplayerGame.tsx remounts
  // this component with a fresh key={roundNumber}.
  const [hasGuessed, setHasGuessed] = useState(false);

  const handleBetChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue <= maxBet && numValue > 0) {
      setBet(numValue);
    }
  };

  const handleGuess = (guessType: string) => {
    if (hasGuessed) return;
    if (bet > 0 && bet <= maxBet) {
      setHasGuessed(true);
      onGuess?.(guessType, bet);
      console.log(`Guessed: ${guessType}, Bet: ${bet} marbles`);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 sm:border-3 border-primary/40 shadow-xl sm:shadow-2xl">
      <CardContent className="p-3 sm:p-6 md:p-8">
        <h3
          className="text-xl sm:text-2xl md:text-3xl font-bold text-primary text-center mb-3 sm:mb-6 uppercase tracking-wide sm:tracking-wider"
          style={{ textShadow: '0 0 15px rgba(255,215,0,0.7)' }}
        >
          {t("guessOddEven")}
        </h3>
        
        <div className="flex gap-2 sm:gap-4 items-center justify-center mb-4 sm:mb-8 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3">
            <Label htmlFor="bet-input" className="text-sm sm:text-lg md:text-xl font-bold text-primary uppercase whitespace-nowrap">
              {t("betAmount")}:
            </Label>
            <Input
              id="bet-input"
              type="number"
              value={bet}
              onChange={(e) => handleBetChange(e.target.value)}
              className="w-20 sm:w-28 md:w-32 text-center text-lg sm:text-xl md:text-2xl font-bold border-2 sm:border-3 border-primary/50 bg-black/40 text-[#00FF88] focus:border-primary"
              min={1}
              max={maxBet}
              data-testid="input-bet"
            />
            <span className="text-xs sm:text-sm text-muted-foreground font-semibold">/ {maxBet}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6">
          <Button
            className="h-auto py-4 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6 text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-br from-[#9C27B0] via-[#E91E63] to-[#9C27B0] hover:from-[#9C27B0]/80 hover:via-[#E91E63]/80 hover:to-[#9C27B0]/80 text-white shadow-lg sm:shadow-xl transition-all hover:-translate-y-1 transform active:scale-95 uppercase tracking-wide border border-white/20 flex flex-col items-center disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0"
            onClick={() => handleGuess("kali")}
            disabled={hasGuessed}
            data-testid="button-guess-kali"
          >
            <span>⬆️ {t("odd")}</span>
            <span className="text-[10px] sm:text-xs md:text-sm opacity-80">Kali</span>
          </Button>
          <Button
            className="h-auto py-4 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6 text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-br from-[#2196F3] via-[#00BCD4] to-[#2196F3] hover:from-[#2196F3]/80 hover:via-[#00BCD4]/80 hover:to-[#2196F3]/80 text-white shadow-lg sm:shadow-xl transition-all hover:-translate-y-1 transform active:scale-95 uppercase tracking-wide border border-white/20 flex flex-col items-center disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0"
            onClick={() => handleGuess("jotta")}
            disabled={hasGuessed}
            data-testid="button-guess-jotta"
          >
            <span>⬇️ {t("even")}</span>
            <span className="text-[10px] sm:text-xs md:text-sm opacity-80">Jotta</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
