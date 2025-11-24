import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AnimatedPlayersProps {
  gameMode: "ai" | "friend" | "random";
}

export default function AnimatedPlayers({ gameMode }: AnimatedPlayersProps) {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 6);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const getPlayerName = () => {
    switch (gameMode) {
      case "ai":
        return "AI Master";
      case "friend":
        return "Friend";
      case "random":
        return "Random Player";
      default:
        return "Player";
    }
  };

  const getPlayerColor = () => {
    switch (gameMode) {
      case "ai":
        return "from-purple-500 to-blue-500";
      case "friend":
        return "from-green-500 to-emerald-500";
      case "random":
        return "from-orange-500 to-red-500";
      default:
        return "from-primary to-primary";
    }
  };

  const fistStates = ["✊", "✌️", "👊", "✋"];
  const currentFist = fistStates[animationStep % fistStates.length];
  const isPlayerTurn = animationStep < 2;
  const isOpponentTurn = animationStep >= 2 && animationStep < 4;
  const isResult = animationStep >= 4;

  return (
    <div className="w-full py-8">
      <div className="flex justify-between items-center gap-8 max-w-2xl mx-auto">
        {/* Player */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <Avatar className="h-20 w-20 border-4 border-primary shadow-lg">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=player" />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-sm font-bold text-muted-foreground">You</p>
            <p className="text-3xl my-2 transition-all duration-300" style={{
              transform: isPlayerTurn ? "scale(1.3)" : "scale(1)",
              opacity: isPlayerTurn ? 1 : 0.6
            }}>
              {isPlayerTurn ? "✊" : "👤"}
            </p>
            <p className={`text-xs font-semibold transition-all ${isPlayerTurn ? "text-primary" : "text-muted-foreground"}`}>
              {isPlayerTurn ? "Your Turn" : isResult ? "Guessing..." : "Waiting..."}
            </p>
          </div>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary via-[#FFA500] to-primary bg-clip-text text-transparent mb-2">
            VS
          </div>
          {isResult && (
            <div className="text-2xl animate-pulse" style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>
              🎯
            </div>
          )}
        </div>

        {/* Opponent */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <Avatar className={`h-20 w-20 border-4 shadow-lg bg-gradient-to-r ${getPlayerColor()}`}>
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${gameMode}`} />
            <AvatarFallback>{gameMode === "ai" ? "AI" : "?"}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-sm font-bold text-muted-foreground">{getPlayerName()}</p>
            <p className="text-3xl my-2 transition-all duration-300" style={{
              transform: isOpponentTurn ? "scale(1.3)" : "scale(1)",
              opacity: isOpponentTurn ? 1 : 0.6
            }}>
              {isOpponentTurn ? "✊" : "👤"}
            </p>
            <p className={`text-xs font-semibold transition-all ${isOpponentTurn ? "text-primary" : "text-muted-foreground"}`}>
              {isOpponentTurn ? "Guessing..." : isResult ? "Revealed!" : "Waiting..."}
            </p>
          </div>
        </div>
      </div>

      {/* Game Status */}
      <div className="mt-8 text-center">
        <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/40 backdrop-blur-sm">
          {isPlayerTurn && (
            <p className="text-sm font-semibold text-primary">
              🎮 Hide marbles in your fist
            </p>
          )}
          {isOpponentTurn && (
            <p className="text-sm font-semibold text-primary">
              🤔 {gameMode === "ai" ? "AI" : "Opponent"} is guessing...
            </p>
          )}
          {isResult && (
            <p className="text-sm font-semibold text-[#00FF88]">
              ✅ Guess revealed! Check if correct
            </p>
          )}
        </div>
      </div>

      {/* Animated dots */}
      <div className="mt-6 flex justify-center gap-2">
        {[0, 1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className="h-2 w-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: dot === animationStep % 6 ? "#FFD700" : "rgba(255, 215, 0, 0.2)",
              transform: dot === animationStep % 6 ? "scale(1.2)" : "scale(1)"
            }}
          />
        ))}
      </div>
    </div>
  );
}
