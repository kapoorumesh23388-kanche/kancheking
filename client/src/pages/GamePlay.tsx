import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PlayerBox from "@/components/PlayerBox";
import FistDisplay from "@/components/FistDisplay";
import GuessingPanel from "@/components/GuessingPanel";
import ResultDisplay from "@/components/ResultDisplay";
import MarbleSelector from "@/components/MarbleSelector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [player1Marbles, setPlayer1Marbles] = useState(() => {
    const saved = localStorage.getItem("playerMarbles");
    return saved ? parseInt(saved) : 150;
  });
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
  const [showAdReward, setShowAdReward] = useState(false);
  const [adRewardPlayer, setAdRewardPlayer] = useState<"player1" | "player2" | null>(null);

  // Sync marbles to localStorage and trigger header update
  useEffect(() => {
    localStorage.setItem("playerMarbles", player1Marbles.toString());
    window.dispatchEvent(new Event("marbleUpdate"));
  }, [player1Marbles]);

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
    if (isHiderPlayer1) {
      setTimeout(() => {
        const guesses = ["kali", "jhota"];
        const randomGuess = guesses[Math.floor(Math.random() * guesses.length)];
        const maxAiBet = player2Marbles;
        const randomBet = Math.floor(Math.random() * Math.min(20, maxAiBet)) + 1;
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
      }
      
      // Update marble counts
      let newPlayer1Marbles = player1Marbles;
      let newPlayer2Marbles = player2Marbles;

      if (isHiderPlayer1) {
        // Player 1 is hider, AI is guesser
        if (won) {
          // AI (guesser) won: AI gets marbles from Player 1
          newPlayer1Marbles = player1Marbles - lastBet;
          newPlayer2Marbles = player2Marbles + lastBet;
        } else {
          // Player 1 (hider) won: Player 1 gets marbles from AI
          newPlayer1Marbles = player1Marbles + lastBet;
          newPlayer2Marbles = player2Marbles - lastBet;
        }
      } else {
        // AI is hider, Player 1 is guesser
        if (won) {
          // Player 1 (guesser) won: Player 1 gets marbles from AI
          newPlayer1Marbles = player1Marbles + lastBet;
          newPlayer2Marbles = player2Marbles - lastBet;
        } else {
          // AI (hider) won: AI gets marbles from Player 1
          newPlayer1Marbles = player1Marbles - lastBet;
          newPlayer2Marbles = player2Marbles + lastBet;
        }
      }

      // Check for zero marbles and show ads
      if (newPlayer1Marbles <= 0) {
        setAdRewardPlayer("player1");
        setShowAdReward(true);
        newPlayer1Marbles = 0;
      }
      if (newPlayer2Marbles <= 0) {
        setAdRewardPlayer("player2");
        setShowAdReward(true);
        newPlayer2Marbles = 0;
      }

      setPlayer1Marbles(newPlayer1Marbles);
      setPlayer2Marbles(newPlayer2Marbles);

      setGameResult({
        won,
        change: lastBet,
        details: message,
        roleSwitched: won, // If guesser won, they switch to hider
        aiChoice: `${actualCount} marbles (${isOdd ? "Odd/Kali" : "Even/Jhota"})`
      });
      setPhase("result");
    }, 2000);
  };

  const handlePlayAgain = () => {
    // If guesser won, they BECOME the hider in next round
    if (gameResult?.roleSwitched) {
      setIsHiderPlayer1(!isHiderPlayer1);
    }
    setPhase("selecting");
    setSelectedMarbleIds([]);
    setFistOpen(false);
    setGameResult(null);
    setShowRevealButton(false);
    console.log("Starting new game, hider is now:", !isHiderPlayer1 ? "Player 1" : "AI");
  };

  const handleWatchAd = () => {
    if (adRewardPlayer === "player1") {
      setPlayer1Marbles(prev => prev + 25);
    } else if (adRewardPlayer === "player2") {
      setPlayer2Marbles(prev => prev + 25);
    }
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
                        maxMarbles={Math.min(20, player1Marbles)}
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
                          setAiHiddenCount(Math.floor(Math.random() * Math.min(21, player2Marbles + 1)));
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
                    <GuessingPanel onGuess={handleGuess} maxBet={player1Marbles} />
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
                label={isHiderPlayer1 ? "Your Hidden Marbles" : "AI's Hidden Marbles"}
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

      {/* Ad Reward Modal */}
      <Dialog open={showAdReward} onOpenChange={setShowAdReward}>
        <DialogContent className="bg-card border-2 border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-primary text-center">
              💔 Out of Marbles!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <p className="text-center text-lg text-foreground">
              You've run out of marbles! Watch an ad to earn <span className="text-[#00FF88] font-bold">25 marbles</span> to continue playing.
            </p>
            
            <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">📺</div>
              <p className="text-sm text-muted-foreground mb-4">
                Ad would play here (in production)
              </p>
              <p className="text-lg font-bold text-[#00FF88]">
                +25 Marbles
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="py-3"
                onClick={() => setShowAdReward(false)}
                data-testid="button-skip-ad"
              >
                Skip
              </Button>
              <Button
                className="bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground font-bold py-3"
                onClick={() => {
                  handleWatchAd();
                  setShowAdReward(false);
                }}
                data-testid="button-watch-ad"
              >
                Watch Ad
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              You can watch ads multiple times to earn more marbles!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
