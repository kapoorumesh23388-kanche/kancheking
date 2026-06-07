import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PlayerBox from "@/components/PlayerBox";
import FistDisplay from "@/components/FistDisplay";
import GuessingPanel from "@/components/GuessingPanel";
import ResultDisplay from "@/components/ResultDisplay";
import MarbleSelector from "@/components/MarbleSelector";
import GameChat from "@/components/GameChat";
import { SpinWheel } from "@/components/SpinWheel";
import SoundThemeSelector from "@/components/SoundThemeSelector";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
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
import {
  startBGM, stopBGM, switchBGM, isBGMEnabled,
  playSfxMarbleHide, playSfxReveal, playSfxWin, playSfxLose, playSfxGuess, playSfxMarbleClick,
  type BGMTheme,
} from "@/lib/soundSystem";
import {
  announceResult,
  type GameLanguage,
} from "@/lib/voiceAnnouncer";
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
  const [bgmTheme, setBgmTheme] = useState<BGMTheme>(() => (localStorage.getItem("bgmTheme") as BGMTheme) || "street");
  const [gameLanguage, setGameLanguage] = useState<GameLanguage>(() => (localStorage.getItem("gameLanguage") as GameLanguage) || "hi");
  // Avatar phases
  const [playerAvatarPhase, setPlayerAvatarPhase] = useState<"idle"|"hiding"|"hidden"|"revealing"|"revealed">("idle");
  const [aiAvatarPhase, setAiAvatarPhase] = useState<"idle"|"hiding"|"hidden"|"revealing"|"revealed">("idle");
  const [isPlayerWinner, setIsPlayerWinner] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: string;
    senderName: string;
    type: "text" | "voice";
    content: string;
    timestamp: Date;
    audioUrl?: string;
  }>>([]);
  
  // Sound refs removed - using soundSystem.ts instead
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const lossAudioRef = useRef<HTMLAudioElement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);

  // Start BGM on mount
  useEffect(() => {
    if (isMusicEnabled) startBGM(bgmTheme);
    return () => stopBGM();
  }, []);

  // Toggle music
  useEffect(() => {
    if (isMusicEnabled) startBGM(bgmTheme);
    else stopBGM();
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

  // SFX on phase changes
  useEffect(() => {
    if (phase === "guessing") playSfxGuess();
    if (phase === "revealing") playSfxReveal();
  }, [phase]);

  // Sound + voice on result
  useEffect(() => {
    if (gameResult) {
      const isOdd = (isHiderPlayer1 ? selectedMarbleIds.length : aiHiddenCount) % 2 !== 0;
      // Announce result in selected language
      setTimeout(() => {
        announceResult(isOdd, gameResult.won, gameLanguage);
        if (gameResult.won) { playSfxWin(); setIsPlayerWinner(true); }
        else { playSfxLose(); setIsPlayerWinner(false); }
      }, 600);
      // Avatar phases
      if (isHiderPlayer1) {
        setPlayerAvatarPhase("revealed");
        setAiAvatarPhase("revealed");
      } else {
        setAiAvatarPhase("revealed");
        setPlayerAvatarPhase("revealed");
      }
    }
  }, [gameResult]);

  // Resume BGM when result dialog closes
  useEffect(() => {
    if (!gameResult && isMusicEnabled) startBGM(bgmTheme);
  }, [gameResult]);

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
    // Avatar: player hiding
    if (isHiderPlayer1) {
      setPlayerAvatarPhase("hiding");
      playSfxMarbleHide();

      setTimeout(() => setPlayerAvatarPhase("hidden"), 700);
      setTimeout(() => {
        const guesses = ["kali", "jotta"];
        const randomGuess = guesses[Math.floor(Math.random() * guesses.length)];
        const maxAiBet = player2Marbles;
        const randomBet = Math.floor(Math.random() * Math.min(20, maxAiBet)) + 1;
        setLastGuess(randomGuess);
        setLastBet(randomBet);
        setShowRevealButton(true);

        setAiAvatarPhase("hidden");
      }, 1500);
    } else {
      // AI is hiding
      setAiAvatarPhase("hiding");
      playSfxMarbleHide();
      setTimeout(() => setAiAvatarPhase("hidden"), 700);
    }
  };

  const handleGuess = (guess: string, bet: number) => {
    setLastGuess(guess);
    setLastBet(bet);
    setShowRevealButton(true);
    playSfxGuess();

    setPlayerAvatarPhase("hidden");
  };

  const handleReveal = () => {
    setPhase("revealing");
    setFistOpen(true);
    setShowRevealButton(false);
    // Avatar reveal animation
    setPlayerAvatarPhase("revealing");
    setAiAvatarPhase("revealing");
    playSfxReveal();
    
    setTimeout(() => {
      const actualCount = isHiderPlayer1 ? selectedMarbleIds.length : aiHiddenCount;
      const isOdd = actualCount % 2 === 1;
      let won = false;
      let message = "";
      
      // Logic: Odd marbles = Kali, Even marbles (0,2,4...) = Jotta
      if (lastGuess === "kali") {
        won = isOdd;
        message = won ? "बधाई हो! कली है — तुम जीत गए! 🎉" : "जोट्टा है! अरे नहीं 😢";
      } else if (lastGuess === "jotta") {
        won = !isOdd;
        message = won ? "बधाई हो! जोट्टा है — तुम जीत गए! 🎉" : "कली है! अरे नहीं 😢";
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
        roleSwitched: won, // Traditional rules: Only guesser who wins becomes hider next round
        aiChoice: `${actualCount} marbles (${isOdd ? "Odd/Kali" : "Even/Jotta"})`
      });
      setPhase("result");
    }, 2000);
  };

  const handlePlayAgain = () => {
    if (gameResult?.roleSwitched) {
      setIsHiderPlayer1(!isHiderPlayer1);
    }
    setPhase("selecting");
    setSelectedMarbleIds([]);
    setFistOpen(false);
    setGameResult(null);
    setShowRevealButton(false);
    setPlayerAvatarPhase("idle");
    setAiAvatarPhase("idle");
    setIsPlayerWinner(false);
    if (isMusicEnabled) startBGM(bgmTheme);
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
    <div className="min-h-screen pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-8 bg-gradient-to-b from-black via-blue-950 to-black">
      {/* Music Toggle & Chat Buttons - Bottom Right */}
      <div className="fixed bottom-4 right-2 z-30 flex flex-col items-end gap-2">
        <SoundThemeSelector
          currentTheme={bgmTheme}
          currentLanguage={gameLanguage}
          isMusicOn={isMusicEnabled}
          onThemeChange={(t) => { setBgmTheme(t); localStorage.setItem("bgmTheme", t); switchBGM(t); }}
          onLanguageChange={(l) => { setGameLanguage(l); localStorage.setItem("gameLanguage", l); }}
          onMusicToggle={() => setIsMusicEnabled(p => !p)}
        />
        <Button
          size="icon"
          variant="outline"
          className="rounded-full bg-[#00D9FF]/20 text-[#00D9FF] hover:bg-[#00D9FF]/40 border-[#00D9FF]/50 w-10 h-10"
          onClick={() => setIsChatOpen(!isChatOpen)}
          data-testid="button-open-chat"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
      </div>

      <div className="container max-w-7xl mx-auto px-1 sm:px-3 md:px-5">
        <div className="mb-2 sm:mb-4">
          <div className="grid grid-cols-3 gap-1 items-center">
            <div className="text-center">
              <PlayerBox
                name={player1Name}
                avatar={player1Image || undefined}
                marbles={player1Marbles}
                role={isHiderPlayer1 ? "Hider" : "Guesser"}
                isActive={isHiderPlayer1 ? phase === "selecting" : phase === "guessing"}
                gender={player1Gender}
                isGuesser={!isHiderPlayer1 && phase === "guessing"}
                phase={playerAvatarPhase}
                isWinner={isPlayerWinner}
              />
            </div>
            <div className="text-center flex flex-col items-center justify-center">
              <div className="text-lg sm:text-xl md:text-3xl font-black text-primary animate-pulse" style={{ textShadow: "0 0 20px rgba(255,215,0,0.8)" }}>
                ⚔️
              </div>
              <p className="text-[8px] sm:text-xs text-muted-foreground uppercase tracking-wider font-bold">Battle</p>
            </div>
            <div className="text-center">
              <PlayerBox
                name="AI Opponent"
                marbles={player2Marbles}
                role={!isHiderPlayer1 ? "Hider" : "Guesser"}
                isActive={!isHiderPlayer1 ? phase === "selecting" : phase === "guessing"}
                gender="boy"
                isGuesser={isHiderPlayer1 && phase === "guessing"}
                phase={aiAvatarPhase}
                isAI={true}
                isWinner={gameResult ? !isPlayerWinner : false}
              />
            </div>
          </div>
        </div>
        
        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 shadow-xl backdrop-blur-sm mb-4">
          <CardContent className="p-2 sm:p-4 md:p-6">

            {phase === "selecting" && (
              <div className="space-y-2 sm:space-y-4">
                {isHiderPlayer1 ? (
                  <Card className="bg-white/5 border border-primary/20">
                    <CardContent className="p-2 sm:p-4">
                      <h3 className="text-sm sm:text-lg md:text-xl font-bold text-primary mb-2 text-center">
                        🎯 Select Marbles to Hide
                      </h3>
                      <MarbleSelector
                        selectedMarbleIds={selectedMarbleIds}
                        onToggleMarble={handleToggleMarble}
                        onClearAll={handleClearAll}
                        maxMarbles={Math.min(20, player1Marbles)}
                      />
                      <Button
                        className="w-full mt-2 sm:mt-4 bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground py-3 sm:py-4 text-sm sm:text-base md:text-lg font-bold"
                        onClick={handleConfirmSelection}
                        data-testid="button-confirm-selection"
                      >
                        ✊ Hide Marbles ({selectedMarbleIds.length} selected)
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-white/5 border border-primary/20">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <h3 className="text-lg sm:text-2xl font-bold text-primary mb-3">
                        🤖 AI is hiding marbles...
                      </h3>
                      <div className="text-4xl sm:text-5xl animate-bounce mb-3">✊</div>
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground py-3 sm:py-4 text-sm sm:text-base font-bold"
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
              <div className="space-y-2 sm:space-y-4">
                <FistDisplay isOpen={false} label={isHiderPlayer1 ? "Your Hidden Marbles" : "AI's Hidden Marbles"} />
                {isHiderPlayer1 ? (
                  <div className="bg-white/5 border border-primary/20 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-base sm:text-xl font-bold text-primary mb-2 sm:mb-3">
                      {showRevealButton ? "🤖 AI is guessing..." : "Waiting for AI to guess..."}
                    </p>
                    {showRevealButton && (
                      <Button
                        className="w-full bg-gradient-to-r from-[#00FF88] to-[#00C853] hover:from-[#00FF88]/80 hover:to-[#00C853]/80 text-black py-3 sm:py-4 text-sm sm:text-lg font-bold animate-pulse"
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
                        className="w-full bg-gradient-to-r from-[#00FF88] to-[#00C853] hover:from-[#00FF88]/80 hover:to-[#00C853]/80 text-black py-3 sm:py-4 text-sm sm:text-lg font-bold animate-pulse"
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
            <Button
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:opacity-90 text-black font-bold py-6 text-xl animate-pulse"
              onClick={() => {
                setShowCelebration(false);
                setShowSpinWheel(true);
              }}
              data-testid="button-spin-prize"
            >
              🎰 Spin to Win Bonus Prize!
            </Button>
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

      {/* Victory Spin Wheel */}
      <SpinWheel
        isOpen={showSpinWheel}
        onClose={() => {
          setShowSpinWheel(false);
          setPlayer2Marbles(120);
          setPhase("selecting");
          setSelectedMarbleIds([]);
          setFistOpen(false);
          setGameResult(null);
          setShowRevealButton(false);
          setIsHiderPlayer1(true);
        }}
        onPrizeWon={(prize) => {
          if (prize.type === "marbles") {
            addMarbles('free', prize.value);
            setPlayer1Marbles(getTotalMarbles());
          }
          toast({
            title: "Prize Won!",
            description: `You won ${prize.name}!`,
          });
        }}
      />

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
