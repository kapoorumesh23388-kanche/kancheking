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
  const [isHolderPlayer1, setIsHolderPlayer1] = useState(true);
  const [gameResult, setGameResult] = useState<{
    won: boolean;
    change: number;
    details: string;
    roleSwitched?: boolean;
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
      const isOdd = actualCount % 2 === 1;
      let won = false;
      let message = "";
      
      // Logic: Odd marbles = Kali, Even marbles (0,2,4...) = Jhota
      if (guess === "kali") {
        won = isOdd;
        message = won ? "Kali Hai! 🎉" : "Jhota Hai! 😢";
      } else if (guess === "jhota") {
        won = !isOdd;
        message = won ? "Jhota Hai! 🎉" : "Kali Hai! 😢";
      } else if (guess === "even") {
        won = !isOdd;
        message = won ? "Even Hai! 🎉" : "Odd Hai! 😢";
      } else if (guess === "odd") {
        won = isOdd;
        message = won ? "Odd Hai! 🎉" : "Even Hai! 😢";
      }
      
      setGameResult({
        won,
        change: bet,
        details: message,
        roleSwitched: won
      });
      setPhase("result");
    }, 2000);
  };

  const handlePlayAgain = () => {
    // If guesser won, switch roles for next round
    if (gameResult?.roleSwitched) {
      setIsHolderPlayer1(!isHolderPlayer1);
    }
    setPhase("selecting");
    setSelectedMarbleIds([]);
    setFistOpen(false);
    setGameResult(null);
    console.log("Starting new game, holder is now:", !isHolderPlayer1 ? "Player 1" : "Player 2");
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-7xl mx-auto px-5">
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <PlayerBox
                name="Player 1"
                marbles={150}
                role={isHolderPlayer1 ? "Holder" : "Guesser"}
                isActive={isHolderPlayer1 ? phase === "selecting" : phase === "guessing"}
              />
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary animate-pulse" style={{ textShadow: '0 0 30px rgba(255,215,0,0.8)' }}>
                ⚔️
              </div>
              <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest font-bold">Battle</p>
            </div>
            <div className="text-center">
              <PlayerBox
                name="Player 2"
                marbles={120}
                role={!isHolderPlayer1 ? "Holder" : "Guesser"}
                isActive={!isHolderPlayer1 ? phase === "selecting" : phase === "guessing"}
              />
            </div>
          </div>
        </div>
        
        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 shadow-2xl backdrop-blur-sm mb-6">
          <CardContent className="p-8">

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
