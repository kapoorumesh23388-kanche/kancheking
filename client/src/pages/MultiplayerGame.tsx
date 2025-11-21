import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import PlayerBox from "@/components/PlayerBox";
import GuessingPanel from "@/components/GuessingPanel";
import ResultDisplay from "@/components/ResultDisplay";
import MarbleSelector from "@/components/MarbleSelector";
import GameChat from "@/components/GameChat";
import { Button } from "@/components/ui/button";
import { MessageCircle, Volume2, VolumeX } from "lucide-react";
import { useGameSocket } from "@/hooks/useGameSocket";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GamePhase = "waiting" | "selecting" | "guessing" | "revealing" | "result";

export default function MultiplayerGame() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [location, setLocation] = useLocation();
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);
  const [playerName, setPlayerName] = useState(`Player_${Math.floor(Math.random() * 10000)}`);
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [player1Name, setPlayer1Name] = useState("Player 1");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const [player1Marbles, setPlayer1Marbles] = useState(150);
  const [player2Marbles, setPlayer2Marbles] = useState(150);
  const [isPlayer1, setIsPlayer1] = useState(true);
  const [selectedMarbleIds, setSelectedMarbleIds] = useState<number[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [gameResult, setGameResult] = useState<any>(null);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState("Waiting for opponent...");

  const { sendMessage } = useGameSocket(roomCode || "", playerId, (msg) => {
    console.log("Received message:", msg);
    if (msg.type === "join") {
      setOpponentConnected(true);
      setPhase("selecting");
    } else if (msg.type === "sync") {
      setPlayer1Marbles(msg.data.player1Marbles);
      setPlayer2Marbles(msg.data.player2Marbles);
      setPhase(msg.data.phase);
    } else if (msg.type === "guess") {
      // Handle opponent's guess
      setPhase("result");
    }
  });

  const handleConfirmSelection = () => {
    setPhase("guessing");
    sendMessage({
      type: "move",
      roomCode: roomCode || "",
      playerId,
      data: { selectedCount: selectedMarbleIds.length, type: "hide" },
    });
  };

  const handleGuess = (guess: string) => {
    sendMessage({
      type: "guess",
      roomCode: roomCode || "",
      playerId,
      data: { guess },
    });
    
    // Simulate game result
    const won = Math.random() > 0.5;
    const change = won ? 10 : -10;
    
    if (isPlayer1) {
      setPlayer1Marbles(prev => prev + change);
    } else {
      setPlayer2Marbles(prev => prev + change);
    }
    
    setGameResult({ won, change, details: won ? "Correct guess!" : "Wrong guess!" });
    setPhase("result");
  };

  if (!roomCode) {
    return (
      <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
        <Card className="bg-red-500/20 border-red-500/30 max-w-md w-full mx-5">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 font-bold mb-4">Invalid room code</p>
            <Button onClick={() => setLocation("/game-modes")} className="w-full">
              Back to Game Modes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!opponentConnected) {
    return (
      <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 max-w-md w-full mx-5">
          <CardContent className="p-8 text-center space-y-6">
            <h2 className="text-2xl font-bold text-primary">Waiting for Opponent</h2>
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full animate-spin border-4 border-primary border-t-transparent" />
            </div>
            <p className="text-muted-foreground text-sm">{waitingMessage}</p>
            <Button variant="outline" onClick={() => setLocation("/game-modes")}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      {/* Music Toggle */}
      <div className="fixed top-24 right-5 z-30 flex gap-2">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full bg-primary/20 text-primary hover:bg-primary/40 border-primary/50"
          onClick={() => setIsMusicEnabled(!isMusicEnabled)}
          data-testid="button-music-toggle"
        >
          {isMusicEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full bg-primary/20 text-primary hover:bg-primary/40 border-primary/50"
          onClick={() => setIsChatOpen(!isChatOpen)}
          data-testid="button-open-chat"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>

      <div className="container max-w-7xl mx-auto px-5">
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <PlayerBox
                name={player1Name}
                marbles={player1Marbles}
                role={isPlayer1 ? "You" : "Opponent"}
                isActive={isPlayer1}
              />
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary animate-pulse">⚔️</div>
              <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest font-bold">Battle</p>
            </div>
            <div className="text-center">
              <PlayerBox
                name={player2Name}
                marbles={player2Marbles}
                role={!isPlayer1 ? "You" : "Opponent"}
                isActive={!isPlayer1}
              />
            </div>
          </div>
        </div>

        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 shadow-2xl backdrop-blur-sm mb-6">
          <CardContent className="p-8">
            {phase === "selecting" && (
              <div className="space-y-6 text-center">
                <h3 className="text-2xl font-bold text-primary">Select Marbles to Hide</h3>
                <MarbleSelector
                  selectedMarbleIds={selectedMarbleIds}
                  onToggleMarble={(id) => setSelectedMarbleIds(prev => 
                    prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
                  )}
                  onClearAll={() => setSelectedMarbleIds([])}
                  maxMarbles={20}
                />
                <Button
                  className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground py-6 text-xl font-bold"
                  onClick={handleConfirmSelection}
                  data-testid="button-confirm-selection"
                >
                  Hide Marbles ({selectedMarbleIds.length} selected)
                </Button>
              </div>
            )}

            {phase === "guessing" && (
              <GuessingPanel
                maxBet={isPlayer1 ? player1Marbles : player2Marbles}
                onGuess={(guess) => handleGuess(guess)}
              />
            )}

            {phase === "result" && gameResult && (
              <ResultDisplay
                won={gameResult.won}
                marbleChange={gameResult.change}
                details={gameResult.details}
                onPlayAgain={() => {
                  setPhase("selecting");
                  setSelectedMarbleIds([]);
                  setGameResult(null);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <GameChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
