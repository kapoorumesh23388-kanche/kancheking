import { Settings, User, ArrowLeft, Upload, Globe, HelpCircle, MessageCircle, Volume2, Volume1, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import gameIcon from "@assets/generated_images/kali_jotta_game_icon_with_marbles.png";

export default function GameHeader() {
  const [location, setLocation] = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGameInfo, setShowGameInfo] = useState(false);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem("playerDisplayName") || "Rajesh Kumar");
  const [profilePic, setProfilePic] = useState<string | null>(() => localStorage.getItem("playerProfileImageUpdate"));
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [totalMarbles, setTotalMarbles] = useState(150);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [volume, setVolume] = useState(70);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastUpdate, setLastUpdate] = useState(() => localStorage.getItem("lastProfileUpdate") || "0");

  useEffect(() => {
    const syncFromStorage = () => {
      const savedLanguage = localStorage.getItem("language") as "en" | "hi" | null;
      const savedSound = localStorage.getItem("soundEnabled");
      const savedMusic = localStorage.getItem("musicEnabled");
      const savedNotifications = localStorage.getItem("notificationsEnabled");
      const savedVolume = localStorage.getItem("volume");
      const savedDisplayName = localStorage.getItem("playerDisplayName");
      const savedProfilePic = localStorage.getItem("playerProfileImageUpdate");

      if (savedLanguage) setLanguage(savedLanguage);
      if (savedSound !== null) setSoundEnabled(savedSound === "true");
      if (savedMusic !== null) setMusicEnabled(savedMusic === "true");
      if (savedNotifications !== null) setNotificationsEnabled(savedNotifications === "true");
      if (savedVolume) setVolume(parseInt(savedVolume));
      if (savedDisplayName) {
        console.log("Header updating name from storage:", savedDisplayName);
        setPlayerName(savedDisplayName);
      }
      if (savedProfilePic) setProfilePic(savedProfilePic);
    };

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    
    // Listen for profile update event
    const handleProfileUpdate = (event: Event) => {
      console.log("Header received profileUpdated event");
      syncFromStorage();
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);

    
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [location]);
  
  const showBackButton = location !== "/";

  const handleBack = () => {
    window.history.back();
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    console.log("Profile saved:", { playerName, profilePic });
    setShowProfile(false);
  };

  const handleLanguageChange = (newLang: "en" | "hi") => {
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem("soundEnabled", String(enabled));
  };

  const handleMusicToggle = (enabled: boolean) => {
    setMusicEnabled(enabled);
    localStorage.setItem("musicEnabled", String(enabled));
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem("notificationsEnabled", String(enabled));
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    localStorage.setItem("volume", String(value[0]));
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#0d0416]/85 backdrop-blur-lg z-50 border-b border-[#00D9FF]/20">
        <div className="flex justify-between items-center px-5 py-3">
          <div className="flex gap-2 items-center">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-[#00D9FF]/15 hover:bg-[#00D9FF]/30 hover:scale-105 transition-all"
              onClick={() => setLocation("/")}
              title="Kanche King"
              data-testid="button-home-icon"
            >
              <img src={gameIcon} alt="Kanche King" className="w-5 h-5 rounded-full" />
            </Button>
            {showBackButton && (
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full bg-[#00D9FF]/15 text-[#00D9FF] hover:bg-[#00D9FF]/30 hover:scale-105 transition-all"
                onClick={handleBack}
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-[#00D9FF]/15 text-[#00D9FF] hover:bg-[#00D9FF]/30 hover:scale-105 transition-all"
              onClick={() => setLocation("/support")}
              data-testid="button-support"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-[#00D9FF]/15 text-[#00D9FF] hover:bg-[#00D9FF]/30 hover:scale-105 transition-all"
              onClick={() => setShowGameInfo(true)}
              data-testid="button-game-info"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-[#00D9FF]/15 text-[#00D9FF] hover:bg-[#00D9FF]/30 hover:scale-105 transition-all"
              onClick={() => setLocation("/profile")}
              data-testid="button-profile"
            >
              <User className="w-5 h-5" />
            </Button>
                        <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-[#00D9FF]/15 text-[#00D9FF] hover:bg-[#00D9FF]/30 hover:scale-105 transition-all"
              onClick={() => setShowSettings(true)}
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-card border-2 border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Player Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-[#FFA500] flex items-center justify-center text-4xl text-primary-foreground border-4 border-primary">
                    {playerName.charAt(0).toUpperCase()}
                  </div>
                )}
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/80"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-photo"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicChange}
                  data-testid="input-profile-pic"
                />
              </div>
              
              <div className="w-full space-y-2">
                <Label htmlFor="player-name" className="text-foreground">
                  Player Name
                </Label>
                <Input
                  id="player-name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-center text-lg font-bold bg-primary/10 border-primary/30"
                  data-testid="input-player-name"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">Player ID: #12345</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-primary/10 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Marbles</p>
                <p className="text-2xl font-bold text-[#00FF88]">{totalMarbles}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Games Played</p>
                <p className="text-2xl font-bold text-primary">{gamesPlayed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Games Won</p>
                <p className="text-2xl font-bold text-[#00FF88]">{gamesWon}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-primary">{gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0}%</p>
              </div>
            </div>
            
            <Button
              className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground font-bold"
              onClick={handleSaveProfile}
              data-testid="button-save-profile"
            >
              Save Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-card border-2 border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <span className="text-foreground font-medium">Sound Effects</span>
              <Button
                variant={soundEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => handleSoundToggle(!soundEnabled)}
                data-testid="toggle-sound"
                className="min-w-20"
              >
                {soundEnabled ? "On" : "Off"}
              </Button>
            </div>

            {/* Music Toggle */}
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <span className="text-foreground font-medium">Music</span>
              <Button
                variant={musicEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => handleMusicToggle(!musicEnabled)}
                data-testid="toggle-music"
                className="min-w-20"
              >
                {musicEnabled ? "On" : "Off"}
              </Button>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <span className="text-foreground font-medium">Notifications</span>
              <Button
                variant={notificationsEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => handleNotificationsToggle(!notificationsEnabled)}
                data-testid="toggle-notifications"
                className="min-w-20"
              >
                {notificationsEnabled ? "On" : "Off"}
              </Button>
            </div>

            {/* Volume Control */}
            <div className="p-4 bg-primary/10 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium flex items-center gap-2">
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : volume < 50 ? <Volume1 className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  Volume
                </span>
                <span className="text-sm text-primary font-bold">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={volume}
                onChange={(e) => handleVolumeChange([parseInt(e.target.value)])}
                data-testid="slider-volume"
                className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Language Selection */}
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-foreground font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleLanguageChange("en")}
                  data-testid="button-language-en"
                >
                  English
                </Button>
                <Button
                  variant={language === "hi" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleLanguageChange("hi")}
                  data-testid="button-language-hi"
                >
                  हिंदी
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game Info Dialog */}
      <Dialog open={showGameInfo} onOpenChange={setShowGameInfo}>
        <DialogContent className="bg-card border-2 border-primary/30 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-primary">
              How to Play - Kali Jotta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[#00FF88]">Game Overview</h3>
              <p className="text-foreground leading-relaxed">
                Kali Jotta is an ancient Indian marble guessing game. Players hide marbles in their fist while the opponent guesses whether the number is Odd (Kali) or Even (Jotta).
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[#00FF88]">Basic Rules</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">1.</span>
                  <span><strong>Hider:</strong> Secretly hides 0-20 marbles in their closed fist</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">2.</span>
                  <span><strong>Guesser:</strong> Guesses if the hidden marbles are Odd (Kali) or Even (Jotta)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">3.</span>
                  <span><strong>Bet:</strong> Guesser also bets how many marbles are hidden (5-20 marbles)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">4.</span>
                  <span><strong>Reveal:</strong> Hider opens their fist to reveal the actual count</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[#00FF88]">Winning & Marble Exchange</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span><strong>Guesser Wins:</strong> Gets marbles equal to their bet from the Hider</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✗</span>
                  <span><strong>Guesser Loses:</strong> Gives marbles equal to their bet to the Hider</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[#00FF88]">Role Switching</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">→</span>
                  <span><strong>If Guesser wins:</strong> Guesser becomes Hider for next round</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">→</span>
                  <span><strong>If Hider wins:</strong> Hider stays as Hider, Guesser remains Guesser</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[#00FF88]">Odd vs Even</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-primary/10 rounded-lg">
                <div>
                  <p className="font-bold text-primary">ODD = KALI</p>
                  <p className="text-sm text-muted-foreground">1, 3, 5, 7, 9, 11, 13, 15, 17, 19</p>
                </div>
                <div>
                  <p className="font-bold text-[#00FF88]">EVEN = JOTTA</p>
                  <p className="text-sm text-muted-foreground">0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[#00FF88]">Game Modes</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">🤖</span>
                  <span><strong>Play with AI:</strong> Challenge an AI opponent with auto-play features</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">👥</span>
                  <span><strong>Challenge Random Player:</strong> Play against any online player, no marble limits</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">🎁</span>
                  <span><strong>Challenge Friend:</strong> Share room code or link to play with friends</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">🏆</span>
                  <span><strong>Tournament:</strong> Compete in 100-player windows with entry fees and prizes</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[#00FF88]">Marble System</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">💎</span>
                  <span>Start with <strong>150 marbles</strong> free</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">🛒</span>
                  <span>Buy marbles from Shop: 10/- = 100 marbles (scaling available)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">🎯</span>
                  <span>Earn game points and redeem for catalog items</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">👫</span>
                  <span>Get 50 marbles bonus per successful referral</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
              <p className="text-foreground"><strong>Pro Tip:</strong> Watch your marble count carefully! Manage your bets wisely to build your marble collection and dominate the leaderboard.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
