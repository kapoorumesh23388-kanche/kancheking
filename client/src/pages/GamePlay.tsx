import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PlayerBox from "@/components/PlayerBox";
import FistDisplay from "@/components/FistDisplay";
import GuessingPanel from "@/components/GuessingPanel";
import ResultDisplay from "@/components/ResultDisplay";
import MarbleSelector from "@/components/MarbleSelector";
import GameChat from "@/components/GameChat";
import { Button } from "@/components/ui/button";
import { MessageCircle, Volume2, VolumeX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  addMarbles, 
  loseMarbles,
  getTotalMarbles, 
  initializeMarbles,
  recordGameResult 
} from "@/lib/marbleStorage";
import {
  initializeDailyRewards,
  updatePlaytime,
  recordAiDefeat,
  checkAndClaimLoginReward,
  checkAndClaimHourlyRewards,
  checkAndClaimDefeatBonuses,
} from "@/lib/rewardsStorage";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Home } from "lucide-react";

type GamePhase = "selecting" | "guessing" | "revealing" | "result";

type GameState = {
  lastGuess?: string;
  lastBet?: number;
};

const gameState: GameState = {};

export default function GamePlay() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<GamePhase>("selecting");
  const [selectedMarbleIds, setSelectedMarbleIds] = useState<number[]>([]);
  const [fistOpen, setFistOpen] = useState(false);
  const [isHiderPlayer1, setIsHiderPlayer1] = useState(true);
  const [player1Marbles, setPlayer1Marbles] = useState(() => {
    initializeMarbles();
    initializeDailyRewards();
    return getTotalMarbles();
  });
  const [player2Marbles, setPlayer2Marbles] = useState(120);
  const [player1Name, setPlayer1Name] = useState(() => localStorage.getItem("playerDisplayName") || "You");
  const [player1Image, setPlayer1Image] = useState<string | null>(() => localStorage.getItem("playerProfileImageUpdate"));
  const [player1Gender, setPlayer1Gender] = useState<"boy" | "girl">(() => {
    const saved = localStorage.getItem("playerGender");
    return (saved as "boy" | "girl") || "boy";
  });
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: string;
    senderName: string;
    type: "text" | "voice";
    content: string;
    timestamp: Date;
    audioUrl?: string;
  }>>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const guessingAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const lossAudioRef = useRef<HTMLAudioElement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Initialize background music
  useEffect(() => {
    // Create audio element for background music
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.3;
    
    // Use a royalty-free game music URL (Incompetech)
    audio.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    
    audioRef.current = audio;
    if (isMusicEnabled) {
      audio.play().catch(err => console.log("Audio autoplay prevented:", err));
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Toggle music
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicEnabled) {
        audioRef.current.play().catch(err => console.log("Audio play error:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicEnabled]);

  // Trigger header update when marbles change
  useEffect(() => {
    window.dispatchEvent(new Event("marbleUpdate"));
    window.dispatchEvent(new Event("storage"));
  }, [player1Marbles]);

  // Load player profile from API and localStorage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          // Fetch fresh profile from API - ensures latest picture
          const response = await fetch(`/api/user/${userId}`);
          const userData = await response.json();
          if (userData.displayName) setPlayer1Name(userData.displayName);
          if (userData.profileImage) setPlayer1Image(userData.profileImage);
        }
      } catch (err) {
        // Fallback to localStorage if API fails
        const name = localStorage.getItem("playerDisplayName") || "You";
        const image = localStorage.getItem("playerProfileImageUpdate");
        setPlayer1Name(name);
        setPlayer1Image(image);
      }
    };
    loadProfile();
    window.addEventListener("profileUpdated", loadProfile);
    return () => window.removeEventListener("profileUpdated", loadProfile);
  }, []);

  // Play guessing sound when in guessing phase
  useEffect(() => {
    if (phase === "guessing") {
      // Create guessing audio if it doesn't exist
      if (!guessingAudioRef.current) {
        const guessingAudio = new Audio();
        guessingAudio.src = "/guessing-sound.mp3";
        guessingAudio.loop = true;
        guessingAudio.volume = 0.5;
        guessingAudioRef.current = guessingAudio;
      }
      // Play the guessing sound
      guessingAudioRef.current.currentTime = 0;
      guessingAudioRef.current.play().catch(err => console.log("Guessing sound play error:", err));
    } else if (phase === "revealing" || phase === "result" || phase === "selecting") {
      // Stop the guessing sound when phase changes
      if (guessingAudioRef.current) {
        guessingAudioRef.current.pause();
        guessingAudioRef.current.currentTime = 0;
      }
    }
  }, [phase]);

  // Play win/loss sounds when result is revealed
  useEffect(() => {
    if (gameResult) {
      // Pause background music
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Play appropriate sound with a small delay using Web Audio API
      setTimeout(() => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          if (gameResult.won) {
            // Win sound: Two ascending notes - celebratory
            // First note
            const osc1 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(523, audioContext.currentTime); // C5
            osc1.frequency.setValueAtTime(659, audioContext.currentTime + 0.2); // E5
            gain1.gain.setValueAtTime(0.5, audioContext.currentTime);
            gain1.gain.setValueAtTime(0, audioContext.currentTime + 0.3);
            osc1.connect(gain1);
            gain1.connect(audioContext.destination);
            osc1.start(audioContext.currentTime);
            osc1.stop(audioContext.currentTime + 0.3);

            // Second note
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(659, audioContext.currentTime + 0.3); // E5
            osc2.frequency.setValueAtTime(784, audioContext.currentTime + 0.5); // G5
            gain2.gain.setValueAtTime(0.5, audioContext.currentTime + 0.3);
            gain2.gain.setValueAtTime(0, audioContext.currentTime + 0.6);
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.start(audioContext.currentTime + 0.3);
            osc2.stop(audioContext.currentTime + 0.6);

            // Third note - high
            const osc3 = audioContext.createOscillator();
            const gain3 = audioContext.createGain();
            osc3.type = "sine";
            osc3.frequency.setValueAtTime(784, audioContext.currentTime + 0.6); // G5
            osc3.frequency.setValueAtTime(1047, audioContext.currentTime + 0.8); // C6
            gain3.gain.setValueAtTime(0.6, audioContext.currentTime + 0.6);
            gain3.gain.setValueAtTime(0, audioContext.currentTime + 0.9);
            osc3.connect(gain3);
            gain3.connect(audioContext.destination);
            osc3.start(audioContext.currentTime + 0.6);
            osc3.stop(audioContext.currentTime + 0.9);

            console.log("Win sound playing!");
          } else {
            // Loss sound: Descending tone - sad
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = "sine";
            
            osc.frequency.setValueAtTime(400, audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.4);
            
            gain.gain.setValueAtTime(0.5, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0, audioContext.currentTime + 0.5);
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.5);

            console.log("Loss sound playing!");
          }
        } catch (error) {
          console.log("Sound play error:", error);
        }
      }, 500);
    }
  }, [gameResult]);

  // Resume background music when result dialog closes
  useEffect(() => {
    if (!gameResult && isMusicEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [gameResult, isMusicEnabled]);

  // Show celebration when AI loses all marbles
  useEffect(() => {
    if (player2Marbles === 0) {
      recordAiDefeat();
      setTimeout(() => {
        setShowCelebration(true);
        const defeatBonus = checkAndClaimDefeatBonuses();
        if (defeatBonus.claimed) {
          toast({
            title: "Bonus Points Earned!",
            description: `+${defeatBonus.points} points for defeating AI!`,
          });
        }
      }, 1000);
    }
  }, [player2Marbles, toast]);

  // Track playtime every minute and check for rewards
  useEffect(() => {
    const interval = setInterval(() => {
      updatePlaytime();
      
      const loginReward = checkAndClaimLoginReward();
      if (loginReward.claimed) {
        toast({
          title: "Daily Login Reward!",
          description: `+${loginReward.points} points for playing 10+ minutes!`,
        });
      }
      
      const hourlyReward = checkAndClaimHourlyRewards();
      if (hourlyReward.claimed) {
        toast({
          title: "Hourly Reward!",
          description: `+${hourlyReward.points} points for ${hourlyReward.hours} hour(s) of gameplay!`,
        });
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [toast]);

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
        const guesses = ["kali", "jotta"];
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
      
      // Logic: Odd marbles = Kali, Even marbles (0,2,4...) = Jotta
      if (lastGuess === "kali") {
        won = isOdd;
        message = won ? "Kali Hai! 🎉" : "Jotta Hai! 😢";
      } else if (lastGuess === "jotta") {
        won = !isOdd;
        message = won ? "Jotta Hai! 🎉" : "Kali Hai! 😢";
      }
      
      // Determine if player won or lost this round
      let playerWon = false;
      if (isHiderPlayer1) {
        // Player 1 is hider, AI is guesser - if AI guess was wrong, player wins
        playerWon = !won;
      } else {
        // AI is hider, Player 1 is guesser - if player guess was correct, player wins
        playerWon = won;
      }
      
      // Update marble counts using marble storage utility
      let newPlayer1Marbles = player1Marbles;
      let newPlayer2Marbles = player2Marbles;

      if (playerWon) {
        // Player won against AI - add to 'ai' bucket (gameplay only, not tournament eligible)
        addMarbles('ai', lastBet);
        newPlayer1Marbles = getTotalMarbles();
        newPlayer2Marbles = player2Marbles - lastBet;
      } else {
        // Player lost to AI - lose marbles (cascades through all buckets)
        loseMarbles(lastBet);
        newPlayer1Marbles = getTotalMarbles();
        newPlayer2Marbles = player2Marbles + lastBet;
      }
      
      // Record game result for stats
      recordGameResult(playerWon);

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

      // Track AI defeats and update game stats
      const userId = localStorage.getItem("userId");
      if (userId) {
        if (won && !isHiderPlayer1) {
          // Player won against AI
          fetch("/api/ai-defeat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
          }).catch(() => {});
        }

        // Save game points and stats to backend
        fetch("/api/game-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            won,
            opponentType: "ai",
            pointsEarned: won ? 10 : 0,
          })
        })
        .then(() => {
          // Dispatch event to refresh profile stats
          window.dispatchEvent(new Event("gameStatsUpdated"));
        })
        .catch(() => {});
      }

      setGameResult({
        won,
        change: lastBet,
        details: message,
        roleSwitched: won, // If guesser won, they switch to hider
        aiChoice: `${actualCount} marbles (${isOdd ? "Odd/Kali" : "Even/Jotta"})`
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
    
    // Resume background music
    setTimeout(() => {
      if (isMusicEnabled && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }, 100);
    
    console.log("Starting new game, hider is now:", !isHiderPlayer1 ? "Player 1" : "AI");
  };

  const handleWatchAd = () => {
    if (adRewardPlayer === "player1") {
      setPlayer1Marbles(prev => prev + 25);
    } else if (adRewardPlayer === "player2") {
      setPlayer2Marbles(prev => prev + 25);
    }
  };

  const handleSendChatMessage = (msg: { type: "text" | "voice"; content: string; duration?: number }) => {
    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      sender: "player1",
      senderName: "You",
      type: msg.type as "text" | "voice",
      content: msg.type === "text" ? msg.content : `Voice message (${msg.duration}s)`,
      timestamp: new Date(),
      audioUrl: msg.type === "voice" ? msg.content : undefined,
    };
    setChatMessages(prev => [...prev, userMessage]);

    // AI responds with a message after a delay
    setTimeout(() => {
      const aiResponses = [
        "Nice move! 🎮",
        "Let's go! 💪",
        "Good luck! 🍀",
        "I'm ready! 🔥",
        "Bring it on! 💯",
        "Haha, got you! 😎",
        "You're good at this! 👏",
        "One more round? 🎲",
      ];
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: "player2",
        senderName: "Player 2 (AI)",
        type: "text" as const,
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 800);
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      {/* Music Toggle Button */}
      <div className="fixed top-20 right-2 sm:right-5 z-30 flex gap-2">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full bg-primary/20 text-primary hover:bg-primary/40 border-primary/50"
          onClick={() => setIsMusicEnabled(!isMusicEnabled)}
          title={isMusicEnabled ? "Mute Music" : "Unmute Music"}
          data-testid="button-music-toggle"
        >
          {isMusicEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
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

      <div className="container max-w-7xl mx-auto px-2 sm:px-5">
        <div className="mb-4 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 items-center">
            <div className="text-center">
              <PlayerBox
                name={player1Name}
                avatar={player1Image || undefined}
                marbles={player1Marbles}
                role={isHiderPlayer1 ? "Hider" : "Guesser"}
                isActive={isHiderPlayer1 ? phase === "selecting" : phase === "guessing"}
                gender={player1Gender}
                isGuesser={!isHiderPlayer1 && phase === "guessing"}
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
                name="AI Opponent"
                marbles={player2Marbles}
                role={!isHiderPlayer1 ? "Hider" : "Guesser"}
                isActive={!isHiderPlayer1 ? phase === "selecting" : phase === "guessing"}
                gender="boy"
                isGuesser={isHiderPlayer1 && phase === "guessing"}
              />
            </div>
          </div>
        </div>
        
        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 shadow-2xl backdrop-blur-sm mb-6">
          <CardContent className="p-4 sm:p-8">

            {phase === "selecting" && (
              <div className="space-y-6">
                {isHiderPlayer1 ? (
                  <Card className="bg-white/5 border-2 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg sm:text-2xl font-bold text-primary mb-4 text-center">
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
                      <h3 className="text-xl sm:text-3xl font-bold text-primary mb-6">
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
                isPlayer1Hider={isHiderPlayer1}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Celebration Dialog - AI Defeated */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="bg-gradient-to-b from-primary/30 to-black border-4 border-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="space-y-4">
                <div className="text-7xl animate-bounce">🎉</div>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500]">
                  YOU WIN!
                </h2>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4 text-center">
            <div className="text-6xl animate-pulse">👑</div>
            <p className="text-2xl font-bold text-[#00FF88]">
              AI DEFEATED!
            </p>
            <p className="text-lg text-foreground">
              Congratulations! You've defeated the AI opponent and won all their marbles! 
            </p>
            <div className="bg-primary/20 border-2 border-primary/50 rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">VICTORY BONUS</p>
              <p className="text-3xl font-black text-[#00FF88]">
                +25 Points
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="bg-gradient-to-r from-[#00D9FF] to-[#00FF88] hover:opacity-90 text-black font-bold py-6 text-lg"
                onClick={() => {
                  setShowCelebration(false);
                  setPlayer2Marbles(120);
                  setPhase("selecting");
                  setSelectedMarbleIds([]);
                  setFistOpen(false);
                  setGameResult(null);
                  setShowRevealButton(false);
                  setIsHiderPlayer1(true);
                }}
                data-testid="button-play-again"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              <Button
                variant="outline"
                className="border-primary text-primary font-bold py-6 text-lg"
                onClick={() => {
                  setShowCelebration(false);
                  window.location.href = "/modes";
                }}
                data-testid="button-victory-home"
              >
                <Home className="w-5 h-5 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Chat Component */}
      <GameChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentPlayerId="player1"
        currentPlayerName="You"
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
      />
    </div>
  );
}
