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

  const handleBetChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue <= maxBet && numValue > 0) {
      setBet(numValue);
    }
  };

  const handleGuess = (guessType: string) => {
    if (bet > 0 && bet <= maxBet) {
      onGuess?.(guessType, bet);
      console.log(`Guessed: ${guessType}, Bet: ${bet} marbles`);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-3 border-primary/40 shadow-2xl">
      <CardContent className="p-10">
        <h3
          className="text-4xl font-bold text-primary text-center mb-8 uppercase tracking-wider"
          style={{ textShadow: '0 0 20px rgba(255,215,0,0.7)' }}
        >
          {t("guessOddEven")}
        </h3>
        
        <div className="flex gap-6 items-center justify-center mb-10 flex-wrap">
          <div className="flex items-center gap-3">
            <Label htmlFor="bet-input" className="text-xl font-bold text-primary uppercase">
              {t("betAmount")}:
            </Label>
            <Input
              id="bet-input"
              type="number"
              value={bet}
              onChange={(e) => handleBetChange(e.target.value)}
              className="w-32 text-center text-2xl font-bold border-3 border-primary/50 bg-black/40 text-[#00FF88] focus:border-primary focus:shadow-[0_0_25px_rgba(255,215,0,0.6)]"
              min={1}
              max={maxBet}
              data-testid="input-bet"
            />
            <span className="text-sm text-muted-foreground font-semibold">/ {maxBet}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <Button
            className="h-auto py-8 px-6 text-3xl font-bold bg-gradient-to-br from-[#9C27B0] via-[#E91E63] to-[#9C27B0] hover:from-[#9C27B0]/80 hover:via-[#E91E63]/80 hover:to-[#9C27B0]/80 text-white shadow-2xl transition-all hover:-translate-y-2 transform active:scale-95 uppercase tracking-wider border-2 border-white/20"
            onClick={() => handleGuess("kali")}
            data-testid="button-guess-kali"
          >
            ⬆️ {t("odd")}
            <div className="text-sm">Kali</div>
          </Button>
          <Button
            className="h-auto py-8 px-6 text-3xl font-bold bg-gradient-to-br from-[#2196F3] via-[#00BCD4] to-[#2196F3] hover:from-[#2196F3]/80 hover:via-[#00BCD4]/80 hover:to-[#2196F3]/80 text-white shadow-2xl transition-all hover:-translate-y-2 transform active:scale-95 uppercase tracking-wider border-2 border-white/20"
            onClick={() => handleGuess("jotta")}
            data-testid="button-guess-jotta"
          >
            ⬇️ {t("even")}
            <div className="text-sm">Jotta</div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
