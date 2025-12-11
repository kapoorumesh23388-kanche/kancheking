import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PlayerBox from "@/components/PlayerBox";
import GuessingPanel from "@/components/GuessingPanel";
import ResultDisplay from "@/components/ResultDisplay";
import MarbleSelector from "@/components/MarbleSelector";
import GameChat from "@/components/GameChat";
import { Button } from "@/components/ui/button";
import { MessageCircle, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import { 
  addMarbles, 
  loseMarbles, 
  getTotalMarbles, 
  initializeMarbles,
  recordGameResult 
} from "@/lib/marbleStorage";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  type: "text" | "voice";
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface PlayerInfo {
  id: string;
  name: string;
  marbles: number;
  profileImage?: string;
  isCreator?: boolean;
}

type GamePhase = "waiting" | "selecting" | "guessing" | "revealing" | "result";

export default function MultiplayerGame() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const playerId = localStorage.getItem("playerId") || `player_${Date.now()}`;
  const playerName = localStorage.getItem("playerDisplayName") || `Player_${playerId.slice(-6)}`;
  const profileImage = localStorage.getItem("playerProfileImageUpdate") || "";
  
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [myMarbles, setMyMarbles] = useState(() => {
    initializeMarbles();
    return getTotalMarbles();
  });
  const [opponentMarbles, setOpponentMarbles] = useState(150);
  const [opponentName, setOpponentName] = useState("Waiting...");
  const [opponentImage, setOpponentImage] = useState<string | null>(null);
  const [isHider, setIsHider] = useState(true);
  const [selectedMarbleIds, setSelectedMarbleIds] = useState<number[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [gameResult, setGameResult] = useState<{
    won: boolean;
    change: number;
    details: string;
    pointsEarned: number;
  } | null>(null);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [opponentHiddenCount, setOpponentHiddenCount] = useState(0);
  const [lastBet, setLastBet] = useState(10);
  const [roundPoints, setRoundPoints] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    if (!roomCode) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log("Game WebSocket connected");
        // Join the room with full player info
        ws.send(JSON.stringify({
          type: "join",
          roomCode,
          playerId,
          data: {
            playerName,
            marbles: myMarbles,
            profileImage,
          }
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("Game received:", message);
          handleGameMessage(message);
        } catch (e) {
          console.error("Parse error:", e);
        }
      };
      
      ws.onclose = () => {
        console.log("Game WebSocket disconnected");
      };
      
      ws.onerror = (err) => {
        console.error("Game WebSocket error:", err);
      };
    } catch (error) {
      console.error("Failed to connect:", error);
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [roomCode]);

  const handleGameMessage = useCallback((message: any) => {
    switch (message.type) {
      case "player_joined":
        if (message.data.allPlayers) {
          // Find opponent from all players
          const opponent = message.data.allPlayers.find((p: PlayerInfo) => p.id !== playerId);
          if (opponent) {
            setOpponentName(opponent.name);
            setOpponentMarbles(opponent.marbles);
            setOpponentImage(opponent.profileImage || null);
            setOpponentConnected(true);
          }
        } else if (message.playerId !== playerId) {
          setOpponentName(message.data.playerName);
          setOpponentMarbles(message.data.marbles);
          setOpponentImage(message.data.profileImage || null);
          setOpponentConnected(true);
        }
        
        if (message.data.playerCount >= 2) {
          setPhase("selecting");
        }
        break;
        
      case "game_start":
        setPhase("selecting");
        setIsHider(message.data.currentHider === playerId);
        
        // Set opponent info from players array
        const opponentInfo = message.data.players.find((p: PlayerInfo) => p.id !== playerId);
        if (opponentInfo) {
          setOpponentName(opponentInfo.name);
          setOpponentMarbles(opponentInfo.marbles);
          setOpponentImage(opponentInfo.profileImage || null);
          setOpponentConnected(true);
        }
        break;
        
      case "room_ready":
        setPhase("selecting");
        const opponent = message.data.players.find((p: PlayerInfo) => p.id !== playerId);
        if (opponent) {
          setOpponentName(opponent.name);
          setOpponentMarbles(opponent.marbles);
          setOpponentImage(opponent.profileImage || null);
          setOpponentConnected(true);
        }
        break;
        
      case "game_state_update":
        if (message.data.phase === "guessing" && message.data.hiddenBy !== playerId) {
          // Opponent hid marbles, now I need to guess
          setPhase("guessing");
          setIsHider(false);
        }
        break;
        
      case "round_result":
        const iAmGuesser = message.data.guesser.id === playerId;
        const won = iAmGuesser ? message.data.won : !message.data.won;
        const change = message.data.bet;
        
        // Update marbles locally
        if (won) {
          addMarbles('pvp', change);
          setMyMarbles(getTotalMarbles());
          setOpponentMarbles(iAmGuesser ? message.data.hider.marbles : message.data.guesser.marbles);
        } else {
          loseMarbles(change);
          setMyMarbles(getTotalMarbles());
          setOpponentMarbles(iAmGuesser ? message.data.hider.marbles : message.data.guesser.marbles);
        }
        
        // Record game result for stats
        recordGameResult(won);
        
        // +5 points on win, -5 points on lose
        const currentPoints = parseInt(localStorage.getItem("playerRewardPoints") || "0");
        const pointChange = won ? 5 : -5;
        const newPoints = Math.max(0, currentPoints + pointChange); // Don't go below 0
        localStorage.setItem("playerRewardPoints", newPoints.toString());
        setRoundPoints(prev => prev + pointChange);
        
        setGameResult({
          won,
          change,
          details: won 
            ? `You guessed correctly! Hidden: ${message.data.hiddenCount}` 
            : `Wrong guess! Hidden: ${message.data.hiddenCount}`,
          pointsEarned: pointChange,
        });
        setPhase("result");
        
        toast({
          title: won ? "+5 Points!" : "-5 Points",
          description: won ? "You won this round!" : "Better luck next round!",
          variant: won ? "default" : "destructive",
        });
        break;
        
      case "new_round":
        setPhase("selecting");
        setIsHider(message.data.currentHider === playerId);
        setSelectedMarbleIds([]);
        setGameResult(null);
        break;
        
      case "marble_update":
        if (message.data.playerId !== playerId) {
          setOpponentMarbles(message.data.marbles);
        }
        break;
        
      case "player_left":
        if (message.data.playerId !== playerId) {
          toast({
            title: "Opponent Left",
            description: "Your opponent has disconnected",
            variant: "destructive",
          });
          setOpponentConnected(false);
        }
        break;
        
      case "chat":
        const chatMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: message.playerId,
          senderName: message.data.senderName,
          type: message.data.messageType,
          content: message.data.content,
          timestamp: new Date(),
          audioUrl: message.data.messageType === "voice" ? message.data.content : undefined,
        };
        setChatMessages(prev => [...prev, chatMessage]);
        break;
    }
  }, [playerId, toast]);

  const sendGameAction = useCallback((action: string, data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "game_action",
        roomCode,
        playerId,
        data: { action, ...data }
      }));
    }
  }, [roomCode, playerId]);

  const handleConfirmSelection = () => {
    setPhase("guessing");
    // Send hidden marble count to server
    sendGameAction("hide_marbles", { count: selectedMarbleIds.length });
    
    // Also update my marbles on server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "marble_update",
        roomCode,
        playerId,
        data: { marbles: myMarbles }
      }));
    }
  };

  const handleGuess = (guess: string, bet: number) => {
    setLastBet(bet);
    sendGameAction("guess", { guess, bet });
  };

  const handlePlayAgain = () => {
    sendGameAction("play_again", {});
    setPhase("selecting");
    setSelectedMarbleIds([]);
    setGameResult(null);
  };

  const sendChatMessage = useCallback((msg: { type: "text" | "voice"; content: string; duration?: number }) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "chat",
        roomCode,
        playerId,
        data: {
          messageType: msg.type,
          content: msg.content,
          duration: msg.duration || 0,
          senderName: playerName,
        }
      }));
      
      // Add to local state immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: playerId,
        senderName: playerName,
        type: msg.type,
        content: msg.type === "text" ? msg.content : `Voice message (${msg.duration}s)`,
        timestamp: new Date(),
        audioUrl: msg.type === "voice" ? msg.content : undefined,
      };
      setChatMessages(prev => [...prev, userMessage]);
    }
  }, [roomCode, playerId, playerName]);

  if (!roomCode) {
    return (
      <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
        <Card className="bg-red-500/20 border-red-500/30 max-w-md w-full mx-5">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 font-bold mb-4">Invalid room code</p>
            <Button onClick={() => setLocation("/modes")} className="w-full">
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
            <p className="text-muted-foreground text-sm">Room: {roomCode}</p>
            <p className="text-xs text-muted-foreground">Share this code with your friend!</p>
            <Button variant="outline" onClick={() => setLocation("/modes")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
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
        {/* Points earned/lost this session */}
        {roundPoints !== 0 && (
          <div className="text-center mb-4">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              roundPoints > 0 
                ? "bg-green-500/20 text-green-400" 
                : "bg-red-500/20 text-red-400"
            }`}>
              {roundPoints > 0 ? `+${roundPoints}` : roundPoints} Points This Session
            </span>
          </div>
        )}
        
        {/* Player boxes */}
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* My info */}
            <div className="text-center">
              <Card className="bg-gradient-to-b from-green-500/20 to-green-500/5 border-2 border-green-500/40 p-4">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="w-16 h-16 border-2 border-green-400">
                    <AvatarImage src={profileImage} />
                    <AvatarFallback className="bg-green-500/30 text-white text-xl">
                      {playerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-bold text-white">{playerName}</p>
                  <p className="text-2xl font-black text-[#FFD700]" data-testid="text-my-marbles">
                    {myMarbles}
                  </p>
                  <p className="text-xs text-green-400">YOU {isHider ? "(Hiding)" : "(Guessing)"}</p>
                </div>
              </Card>
            </div>
            
            {/* VS */}
            <div className="text-center">
              <div className="text-4xl font-black text-primary animate-pulse">⚔️</div>
              <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest font-bold">Battle</p>
            </div>
            
            {/* Opponent info */}
            <div className="text-center">
              <Card className="bg-gradient-to-b from-red-500/20 to-red-500/5 border-2 border-red-500/40 p-4">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="w-16 h-16 border-2 border-red-400">
                    <AvatarImage src={opponentImage || ""} />
                    <AvatarFallback className="bg-red-500/30 text-white text-xl">
                      {opponentName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-bold text-white">{opponentName}</p>
                  <p className="text-2xl font-black text-[#FFD700]" data-testid="text-opponent-marbles">
                    {opponentMarbles}
                  </p>
                  <p className="text-xs text-red-400">OPPONENT {!isHider ? "(Hiding)" : "(Guessing)"}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 shadow-2xl backdrop-blur-sm mb-6">
          <CardContent className="p-8">
            {phase === "waiting" && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/20 rounded-full animate-spin border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Waiting for game to start...</p>
              </div>
            )}
            
            {phase === "selecting" && isHider && (
              <div className="space-y-6 text-center">
                <h3 className="text-2xl font-bold text-primary">Your Turn to Hide!</h3>
                <p className="text-muted-foreground">Select marbles (1-20) to hide in your fist</p>
                <MarbleSelector
                  selectedMarbleIds={selectedMarbleIds}
                  onToggleMarble={(id) => setSelectedMarbleIds(prev => 
                    prev.includes(id) ? prev.filter(m => m !== id) : prev.length < 20 ? [...prev, id] : prev
                  )}
                  onClearAll={() => setSelectedMarbleIds([])}
                  maxMarbles={20}
                />
                <Button
                  className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground py-6 text-xl font-bold"
                  onClick={handleConfirmSelection}
                  disabled={selectedMarbleIds.length === 0}
                  data-testid="button-confirm-selection"
                >
                  Hide Marbles ({selectedMarbleIds.length} selected)
                </Button>
              </div>
            )}
            
            {phase === "selecting" && !isHider && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse border-4 border-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">Opponent is Hiding...</h3>
                <p className="text-muted-foreground">Wait for {opponentName} to hide their marbles</p>
              </div>
            )}

            {phase === "guessing" && !isHider && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-primary text-center">Your Turn to Guess!</h3>
                <p className="text-muted-foreground text-center">{opponentName} has hidden marbles. Guess if it's Odd or Even!</p>
                <GuessingPanel
                  maxBet={myMarbles}
                  onGuess={handleGuess}
                />
              </div>
            )}
            
            {phase === "guessing" && isHider && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse border-4 border-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">Waiting for Guess...</h3>
                <p className="text-muted-foreground">{opponentName} is guessing your hidden marbles</p>
                <p className="text-sm text-primary mt-4">You hid: {selectedMarbleIds.length} marbles</p>
              </div>
            )}

            {phase === "result" && gameResult && (
              <div className="text-center space-y-6">
                <div className={`border-4 shadow-2xl rounded-2xl p-8 ${
                  gameResult.won
                    ? "bg-gradient-to-br from-[#00FF88]/20 via-primary/10 to-transparent border-[#00FF88]/60"
                    : "bg-gradient-to-br from-red-500/20 via-primary/5 to-transparent border-red-500/60"
                }`}>
                  <div className="text-7xl mb-4 animate-bounce">
                    {gameResult.won ? "🎉" : "😢"}
                  </div>
                  <h2 className={`text-3xl font-bold mb-4 ${gameResult.won ? "text-[#00FF88]" : "text-red-400"}`}>
                    {gameResult.won ? "YOU WON!" : "YOU LOST!"}
                  </h2>
                  <div className={`text-5xl font-bold mb-4 ${gameResult.won ? "text-[#00FF88]" : "text-red-400"}`}>
                    {gameResult.won ? "+" : "-"}{Math.abs(gameResult.change)} 💎
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">{gameResult.details}</p>
                  <div className={`inline-block px-6 py-3 rounded-full ${
                    gameResult.won 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    <p className="font-bold">
                      {gameResult.won ? "+5 Points Earned!" : "-5 Points Lost"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Next round starting in 3 seconds...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Back button */}
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/modes")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Leave Game
          </Button>
        </div>
      </div>

      <GameChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentPlayerId={playerId}
        currentPlayerName={playerName}
        messages={chatMessages}
        onSendMessage={sendChatMessage}
      />
    </div>
  );
}
