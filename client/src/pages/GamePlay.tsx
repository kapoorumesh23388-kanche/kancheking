import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PlayerBox from "@/components/PlayerBox";
import FistDisplay from "@/components/FistDisplay";
import GuessingPanel from "@/components/GuessingPanel";
import ResultDisplay from "@/components/ResultDisplay";
import MarbleSelector from "@/components/MarbleSelector";
import { Button } from "@/components/ui/button";

type GamePhase = "selecting" | "guessing" | "revealing" | "result";

type GameState = {
  lastGuess?: string;
  lastBet?: number;
};

const gameState: GameState = {};

export default function GamePlay() {
  const [phase, setPhase] = useState<GamePhase>("selecting");
  const [selectedMarbleIds, setSelectedMarbleIds] = useState<number[]>([]);
  const [fistOpen, setFistOpen] = useState(false);
  const [isHiderPlayer1, setIsHiderPlayer1] = useState(true);
  const [player1Marbles, setPlayer1Marbles] = useState(150);
  const [player2Marbles, setPlayer2Marbles] = useState(120);
  const [aiHiddenCount, setAiHiddenCount] = useState(0);
  const [showRevealButton, setShowRevealButton] = useState(false);
  const [lastGuess, setLastGuess] = useState<string>("");
  const [lastBet, setLastBet] = useState(10);
  const [gameResult, setGameResult] = useState<{
    won: boolean;
    change: number;
    details: string;
    roleSwitched?: boolean;
    aiChoice?: string;
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
    // If Player 1 is hider, AI (Player 2) is guesser - make AI guess after a delay
    if (isHiderPlayer1) {
      setTimeout(() => {
        const guesses = ["even", "odd", "kali", "jhota"];
        const randomGuess = guesses[Math.floor(Math.random() * guesses.length)];
        const randomBet = Math.floor(Math.random() * 20) + 5;
        setLastGuess(randomGuess);
        setLastBet(randomBet);
        setShowRevealButton(true);
        console.log(`AI Guessed: ${randomGuess}, Bet: ${randomBet} marbles`);
      }, 1500);
    }
    console.log("Moving to guessing phase with", selectedMarbleIds.length, "marbles");
  };

  const handleGuess = (guess: string, bet: number) => {
    console.log(`Guess: ${guess}, Bet: ${bet}`);
    setLastGuess(guess);
    setLastBet(bet);
    setShowRevealButton(true);
  };

  const handleReveal = () => {
    setPhase("revealing");
    setFistOpen(true);
    setShowRevealButton(false);
    
    setTimeout(() => {
      const actualCount = isHiderPlayer1 ? selectedMarbleIds.length : aiHiddenCount;
      const isOdd = actualCount % 2 === 1;
      let won = false;
      let message = "";
      
      // Logic: Odd marbles = Kali, Even marbles (0,2,4...) = Jhota
      if (lastGuess === "kali") {
        won = isOdd;
        message = won ? "Kali Hai! 🎉" : "Jhota Hai! 😢";
      } else if (lastGuess === "jhota") {
        won = !isOdd;
        message = won ? "Jhota Hai! 🎉" : "Kali Hai! 😢";
      } else if (lastGuess === "even") {
        won = !isOdd;
        message = won ? "Even Hai! 🎉" : "Odd Hai! 😢";
      } else if (lastGuess === "odd") {
        won = isOdd;
        message = won ? "Odd Hai! 🎉" : "Even Hai! 😢";
      }
      
      // Update marble counts - guesser wins means they stay guesser until they lose
      // isHiderPlayer1 = true means Player 1 is hiding, AI (Player 2) is guessing
      // If won = true, guesser (AI or Player 1) won
      if (isHiderPlayer1) {
        // Player 1 is hider, AI is guesser
        setPlayer1Marbles(prev => won ? prev - lastBet : prev + lastBet);
        setPlayer2Marbles(prev => won ? prev + lastBet : prev - lastBet);
      } else {
        // AI is hider, Player 1 is guesser
        setPlayer1Marbles(prev => won ? prev + lastBet : prev - lastBet);
        setPlayer2Marbles(prev => won ? prev - lastBet : prev + lastBet);
      }
      
      setGameResult({
        won,
        change: lastBet,
        details: message,
        roleSwitched: won,
        aiChoice: `${actualCount} marbles (${isOdd ? "Odd/Kali" : "Even/Jhota"})`
      });
      setPhase("result");
    }, 2000);
  };

  const handlePlayAgain = () => {
    // If guesser won, switch roles for next round
    if (gameResult?.roleSwitched) {
      setIsHiderPlayer1(!isHiderPlayer1);
    }
    setPhase("selecting");
    setSelectedMarbleIds([]);
    setFistOpen(false);
    setGameResult(null);
    setShowRevealButton(false);
    console.log("Starting new game, hider is now:", !isHiderPlayer1 ? "Player 1" : "Player 2");
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-7xl mx-auto px-5">
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <PlayerBox
                name="Player 1"
                marbles={player1Marbles}
                role={isHiderPlayer1 ? "Hider" : "Guesser"}
                isActive={isHiderPlayer1 ? phase === "selecting" : phase === "guessing"}
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
                name="Player 2 (AI)"
                marbles={player2Marbles}
                role={!isHiderPlayer1 ? "Hider" : "Guesser"}
                isActive={!isHiderPlayer1 ? phase === "selecting" : phase === "guessing"}
              />
            </div>
          </div>
        </div>
        
        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 shadow-2xl backdrop-blur-sm mb-6">
          <CardContent className="p-8">

            {phase === "selecting" && (
              <div className="space-y-6">
                {isHiderPlayer1 ? (
                  <Card className="bg-white/5 border-2 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold text-primary mb-4 text-center">
                        🎯 Select Marbles to Hide
                      </h3>
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
                        ✊ Hide Marbles ({selectedMarbleIds.length} selected)
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-white/5 border-2 border-primary/20">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-3xl font-bold text-primary mb-6">
                        🤖 AI is hiding marbles...
                      </h3>
                      <div className="text-6xl animate-bounce mb-6">✊</div>
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground py-6 text-xl font-bold"
                        onClick={() => {
                          setAiHiddenCount(Math.floor(Math.random() * 21));
                          handleConfirmSelection();
                        }}
                        data-testid="button-ai-ready"
                      >
                        AI Ready! Click to Continue
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {phase === "guessing" && (
              <div className="space-y-6">
                <FistDisplay isOpen={false} label={isHiderPlayer1 ? "Your Hidden Marbles" : "AI's Hidden Marbles"} />
                {isHiderPlayer1 ? (
                  <div className="bg-white/5 border-2 border-primary/20 rounded-lg p-6 text-center">
                    <p className="text-2xl font-bold text-primary mb-4">
                      {showRevealButton ? "🤖 AI is guessing..." : "Waiting for AI to guess..."}
                    </p>
                    {showRevealButton && (
                      <Button
                        className="w-full bg-gradient-to-r from-[#00FF88] to-[#00C853] hover:from-[#00FF88]/80 hover:to-[#00C853]/80 text-black py-6 text-2xl font-bold animate-pulse"
                        onClick={handleReveal}
                        data-testid="button-reveal"
                      >
                        🖐️ Reveal Hand
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <GuessingPanel onGuess={handleGuess} />
                    {showRevealButton && (
                      <Button
                        className="w-full bg-gradient-to-r from-[#00FF88] to-[#00C853] hover:from-[#00FF88]/80 hover:to-[#00C853]/80 text-black py-6 text-2xl font-bold animate-pulse"
                        onClick={handleReveal}
                        data-testid="button-reveal"
                      >
                        🖐️ Reveal Hand
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}

            {phase === "revealing" && (
              <FistDisplay
                isOpen={fistOpen}
                marbleCount={isHiderPlayer1 ? selectedMarbleIds.length : aiHiddenCount}
                label="Revealing..."
              />
            )}

            {phase === "result" && gameResult && (
              <ResultDisplay
                won={gameResult.won}
                marbleChange={gameResult.change}
                details={gameResult.details}
                aiChoice={gameResult.aiChoice}
                onPlayAgain={handlePlayAgain}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
