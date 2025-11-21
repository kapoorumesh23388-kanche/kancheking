import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface GuessingPanelProps {
  onGuess?: (guess: string, bet: number) => void;
}

export default function GuessingPanel({ onGuess }: GuessingPanelProps) {
  const [bet, setBet] = useState(10);

  const handleGuess = (guessType: string) => {
    onGuess?.(guessType, bet);
    console.log(`Guessed: ${guessType}, Bet: ${bet} marbles`);
  };

  return (
    <Card className="bg-white/5 border-2 border-primary/20">
      <CardContent className="p-8">
        <h3
          className="text-3xl font-bold text-primary text-center mb-6"
          style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}
        >
          Make Your Guess
        </h3>
        
        <div className="flex gap-4 items-center justify-center mb-6 flex-wrap">
          <Label htmlFor="bet-input" className="text-xl font-semibold text-primary">
            Bet Amount:
          </Label>
          <Input
            id="bet-input"
            type="number"
            value={bet}
            onChange={(e) => setBet(parseInt(e.target.value) || 0)}
            className="w-40 text-center text-xl border-2 border-primary/30 bg-black/30 text-white focus:border-primary focus:shadow-[0_0_15px_rgba(255,215,0,0.5)]"
            min={1}
            data-testid="input-bet"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            className="h-auto py-5 text-2xl font-bold bg-gradient-to-r from-[#00C853] to-[#00E676] hover:from-[#00C853]/80 hover:to-[#00E676]/80 text-white shadow-lg transition-all hover:-translate-y-1"
            onClick={() => handleGuess("even")}
            data-testid="button-guess-even"
          >
            <div className="flex flex-col items-center gap-1">
              <span>Even</span>
              <span className="text-sm opacity-90">(Jhota)</span>
            </div>
          </Button>
          <Button
            className="h-auto py-5 text-2xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:from-[#FF6B6B]/80 hover:to-[#FF8E53]/80 text-white shadow-lg transition-all hover:-translate-y-1"
            onClick={() => handleGuess("odd")}
            data-testid="button-guess-odd"
          >
            <div className="flex flex-col items-center gap-1">
              <span>Odd</span>
              <span className="text-sm opacity-90">(Kali)</span>
            </div>
          </Button>
          <Button
            className="h-auto py-5 text-2xl font-bold bg-gradient-to-r from-[#9C27B0] to-[#E91E63] hover:from-[#9C27B0]/80 hover:to-[#E91E63]/80 text-white shadow-lg transition-all hover:-translate-y-1"
            onClick={() => handleGuess("kali")}
            data-testid="button-guess-kali"
          >
            <div className="flex flex-col items-center gap-1">
              <span>Kali</span>
              <span className="text-sm opacity-90">(Odd)</span>
            </div>
          </Button>
          <Button
            className="h-auto py-5 text-2xl font-bold bg-gradient-to-r from-[#2196F3] to-[#00BCD4] hover:from-[#2196F3]/80 hover:to-[#00BCD4]/80 text-white shadow-lg transition-all hover:-translate-y-1"
            onClick={() => handleGuess("jhota")}
            data-testid="button-guess-jhota"
          >
            <div className="flex flex-col items-center gap-1">
              <span>Jhota</span>
              <span className="text-sm opacity-90">(Even)</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
