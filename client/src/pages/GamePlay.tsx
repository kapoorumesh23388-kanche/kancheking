import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PlayerBox from "@/components/PlayerBox";
import FistDisplay from "@/components/FistDisplay";
import GuessingPanel from "@/components/GuessingPanel";
import ResultDisplay from "@/components/ResultDisplay";
import MarbleDisplay from "@/components/MarbleDisplay";
import { Button } from "@/components/ui/button";

type GamePhase = "selecting" | "guessing" | "revealing" | "result";

export default function GamePlay() {
  const [phase, setPhase] = useState<GamePhase>("selecting");
  const [selectedMarbles, setSelectedMarbles] = useState(0);
  const [fistOpen, setFistOpen] = useState(false);
  const [gameResult, setGameResult] = useState<{
    won: boolean;
    change: number;
    details: string;
  } | null>(null);

  const handleSelectMarbles = (count: number) => {
    setSelectedMarbles(count);
    console.log(`Selected ${count} marbles`);
  };

  const handleConfirmSelection = () => {
    setPhase("guessing");
    console.log("Moving to guessing phase");
  };

  const handleGuess = (guess: string, bet: number) => {
    console.log(`Guess: ${guess}, Bet: ${bet}`);
    setPhase("revealing");
    setFistOpen(true);
    
    setTimeout(() => {
      const won = Math.random() > 0.5;
      setGameResult({
        won,
        change: bet,
        details: `The answer was ${guess === "even" ? "Odd" : "Even"}. ${won ? "Correct!" : "Wrong!"}`
      });
      setPhase("result");
    }, 2000);
  };

  const handlePlayAgain = () => {
    setPhase("selecting");
    setSelectedMarbles(0);
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
                    <h3 className="text-2xl font-bold text-primary text-center mb-4">
                      Select Marbles (0-5)
                    </h3>
                    <div className="flex gap-4 justify-center flex-wrap mb-6">
                      {[0, 1, 2, 3, 4, 5].map((count) => (
                        <Button
                          key={count}
                          variant={selectedMarbles === count ? "default" : "outline"}
                          className={`w-16 h-16 text-2xl font-bold ${
                            selectedMarbles === count
                              ? "bg-gradient-to-r from-primary to-[#FFA500] text-primary-foreground"
                              : "bg-primary/20 text-primary border-2 border-primary/40"
                          }`}
                          onClick={() => handleSelectMarbles(count)}
                          data-testid={`button-select-${count}`}
                        >
                          {count}
                        </Button>
                      ))}
                    </div>
                    {selectedMarbles > 0 && <MarbleDisplay count={selectedMarbles} />}
                    <Button
                      className="w-full mt-6 bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground py-6 text-xl font-bold"
                      onClick={handleConfirmSelection}
                      disabled={selectedMarbles === 0}
                      data-testid="button-confirm-selection"
                    >
                      Confirm Selection
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
                marbleCount={selectedMarbles}
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
