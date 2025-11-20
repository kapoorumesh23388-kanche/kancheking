import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PlayerBox from "@/components/PlayerBox";
import FistDisplay from "@/components/FistDisplay";
import GuessingPanel from "@/components/GuessingPanel";
import ResultDisplay from "@/components/ResultDisplay";
import MarbleSelector from "@/components/MarbleSelector";
import { Button } from "@/components/ui/button";

type GamePhase = "selecting" | "guessing" | "revealing" | "result";

export default function GamePlay() {
  const [phase, setPhase] = useState<GamePhase>("selecting");
  const [selectedMarbleIds, setSelectedMarbleIds] = useState<number[]>([]);
  const [fistOpen, setFistOpen] = useState(false);
  const [gameResult, setGameResult] = useState<{
    won: boolean;
    change: number;
    details: string;
  } | null>(null);

  const handleToggleMarble = (id: number) => {
    setSelectedMarbleIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(marbleId => marbleId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleClearAll = () => {
    setSelectedMarbleIds([]);
  };

  const handleConfirmSelection = () => {
    setPhase("guessing");
    console.log("Moving to guessing phase with", selectedMarbleIds.length, "marbles");
  };

  const handleGuess = (guess: string, bet: number) => {
    console.log(`Guess: ${guess}, Bet: ${bet}`);
    setPhase("revealing");
    setFistOpen(true);
    
    setTimeout(() => {
      const actualCount = selectedMarbleIds.length;
      const isEven = actualCount % 2 === 0;
      let won = false;
      let message = "";
      
      if (guess === "kali") {
        won = actualCount === 0;
        message = won ? "Kali Hai! 🎉" : "Jhota Hai! 😢";
      } else if (guess === "jhota") {
        won = actualCount > 0;
        message = won ? "Jhota Hai! 🎉" : "Kali Hai! 😢";
      } else if (guess === "even") {
        won = isEven;
        message = won ? "Even Hai! 🎉" : "Odd Hai! 😢";
      } else if (guess === "odd") {
        won = !isEven;
        message = won ? "Odd Hai! 🎉" : "Even Hai! 😢";
      }
      
      setGameResult({
        won,
        change: bet,
        details: message
      });
      setPhase("result");
    }, 2000);
  };

  const handlePlayAgain = () => {
    setPhase("selecting");
    setSelectedMarbleIds([]);
    setFistOpen(false);
    setGameResult(null);
    console.log("Starting new game");
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-6xl mx-auto px-5">
        <Card className="bg-white/5 border-2 border-primary/20 shadow-[0_10px_40px_rgba(0,0,0,0.3)] mb-6">
          <CardContent className="p-8">
            <div className="flex justify-between items-center gap-8 flex-wrap mb-8">
              <PlayerBox
                name="Player 1"
                marbles={150}
                role="Holder"
                isActive={phase === "selecting"}
              />
              <div className="text-5xl font-bold text-primary" style={{ textShadow: '0 0 20px rgba(255,215,0,0.8)' }}>
                VS
              </div>
              <PlayerBox
                name="Player 2"
                marbles={120}
                role="Guesser"
                isActive={phase === "guessing"}
              />
            </div>

            {phase === "selecting" && (
              <div className="space-y-6">
                <Card className="bg-white/5 border-2 border-primary/20">
                  <CardContent className="p-6">
                    <MarbleSelector
                      selectedMarbleIds={selectedMarbleIds}
                      onToggleMarble={handleToggleMarble}
                      onClearAll={handleClearAll}
                      maxMarbles={20}
                    />
                    <Button
                      className="w-full mt-6 bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground py-6 text-xl font-bold"
                      onClick={handleConfirmSelection}
                      data-testid="button-confirm-selection"
                    >
                      Confirm Selection ({selectedMarbleIds.length} marbles)
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {phase === "guessing" && (
              <div className="space-y-6">
                <FistDisplay isOpen={false} label="Opponent's Hidden Marbles" />
                <GuessingPanel onGuess={handleGuess} />
              </div>
            )}

            {phase === "revealing" && (
              <FistDisplay
                isOpen={fistOpen}
                marbleCount={selectedMarbleIds.length}
                label="Revealing..."
              />
            )}

            {phase === "result" && gameResult && (
              <ResultDisplay
                won={gameResult.won}
                marbleChange={gameResult.change}
                details={gameResult.details}
                onPlayAgain={handlePlayAgain}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
