import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PlayerProfile from "@/components/PlayerProfile";
import FloatingMarbles from "@/components/FloatingMarbles";
import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { t, LANGUAGES, getMarbleName, type Language } from "@/lib/translations";
import { Volume2, VolumeX } from "lucide-react";
import { checkAndClaimDailyLoginBonus, initializeDailyRewards } from "@/lib/rewardsStorage";

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const [playerName, setPlayerName] = useState("");
  const [playerImage, setPlayerImage] = useState<string | null>(null);
  const [playerMarbles, setPlayerMarbles] = useState(150);
  const [playerRewardPoints, setPlayerRewardPoints] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState(() => localStorage.getItem("socialInstagram") || "");
  const [youtubeUrl, setYoutubeUrl] = useState(() => localStorage.getItem("socialYoutube") || "");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and play background music
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.3;
    audio.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    audioRef.current = audio;

    // Try to play on first user interaction
    const playOnInteraction = () => {
      if (audioRef.current && !isMusicPlaying) {
        audioRef.current.play().then(() => {
          setIsMusicPlaying(true);
        }).catch(err => console.log("Audio autoplay prevented:", err));
      }
      document.removeEventListener("click", playOnInteraction);
      document.removeEventListener("touchstart", playOnInteraction);
    };

    document.addEventListener("click", playOnInteraction);
    document.addEventListener("touchstart", playOnInteraction);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      document.removeEventListener("click", playOnInteraction);
      document.removeEventListener("touchstart", playOnInteraction);
    };
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play().catch(err => console.log("Audio play error:", err));
        setIsMusicPlaying(true);
      }
    }
  };

  // Claim daily login bonus on first visit each day
  useEffect(() => {
    initializeDailyRewards();
    const result = checkAndClaimDailyLoginBonus();
    if (result.claimed) {
      // Dispatch so UI updates
      window.dispatchEvent(new Event("rewardPointsUpdate"));
    }
  }, []);

  useEffect(() => {
    const loadPlayerProfile = () => {
      const name = localStorage.getItem("playerDisplayName") || "";
      const image = localStorage.getItem("playerProfileImageUpdate");
      const marbles = localStorage.getItem("playerMarbles") || "150";
      const points = localStorage.getItem("playerRewardPoints") || "0";
      const played = localStorage.getItem("gamesPlayed") || "0";
      const won = localStorage.getItem("gamesWon") || "0";

      setPlayerName(name);
      setPlayerImage(image);
      setPlayerMarbles(parseInt(marbles));
      setPlayerRewardPoints(parseInt(points));
      setGamesPlayed(parseInt(played));
      setGamesWon(parseInt(won));
    };

    loadPlayerProfile();
    window.addEventListener("profileUpdated", loadPlayerProfile);
    window.addEventListener("marbleUpdate", loadPlayerProfile);
    window.addEventListener("rewardPointsUpdate", loadPlayerProfile);
    window.addEventListener("storage", loadPlayerProfile);

    return () => {
      window.removeEventListener("profileUpdated", loadPlayerProfile);
      window.removeEventListener("marbleUpdate", loadPlayerProfile);
      window.removeEventListener("rewardPointsUpdate", loadPlayerProfile);
      window.removeEventListener("storage", loadPlayerProfile);
    };
  }, []);

  useEffect(() => {
    const updateSocial = () => {
      setInstagramUrl(localStorage.getItem("socialInstagram") || "");
      setYoutubeUrl(localStorage.getItem("socialYoutube") || "");
    };
    window.addEventListener("socialLinksUpdated", updateSocial);
    return () => window.removeEventListener("socialLinksUpdated", updateSocial);
  }, []);

  return (
    <div className="min-h-screen pt-8 md:pt-20 pb-8 md:pb-20 flex flex-col">
      {/* Floating Music Toggle */}
      <div className="fixed bottom-4 right-2 z-30">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full bg-primary/20 text-primary hover:bg-primary/40 border-primary/50 w-10 h-10"
          onClick={toggleMusic}
          title={isMusicPlaying ? "Mute Music" : "Play Music"}
          data-testid="button-music-toggle-home"
        >
          {isMusicPlaying ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </Button>
      </div>
      <FloatingMarbles />
      <div className="container max-w-6xl mx-auto px-3 md:px-5 flex-1">
        <div className="text-center mb-4 md:mb-8 p-4 md:p-10 marble-glass rounded-2xl md:rounded-3xl neon-glow-cyan">
          {/* Game Logo */}
          <div className="flex justify-center mb-3 md:mb-5">
            <img
              src="/favicon.png"
              alt="Kanche King Logo"
              style={{
                width: 'clamp(72px, 18vw, 120px)',
                height: 'clamp(72px, 18vw, 120px)',
                borderRadius: 24,
                objectFit: 'cover',
                display: 'block',
                boxShadow: '0 0 30px rgba(0,217,255,0.5), 0 0 60px rgba(233,30,140,0.3)',
              }}
            />
          </div>

          <h1
            className={`${language !== 'en' ? 'text-4xl md:text-7xl leading-tight' : 'text-3xl md:text-6xl'} font-bold mb-2 md:mb-3 bg-gradient-to-r from-[#00D9FF] via-[#E91E8C] to-[#00D9FF] bg-clip-text text-transparent neon-text-cyan lang-${language}`}
            lang={language}
          >
            {t('appTitle', language)}
          </h1>
          <p className={`${language !== 'en' ? 'text-lg md:text-3xl leading-relaxed' : 'text-sm md:text-2xl'} text-[#00D9FF]/90 mb-3 md:mb-8 lang-${language}`} lang={language}>
            {t('appSubtitle', language)}
          </p>
          
          <div className="mb-3 md:mb-6 flex justify-center" data-testid="language-selector">
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger className={`w-full md:w-96 bg-[#00D9FF]/10 border-2 border-[#00D9FF]/40 text-[#00D9FF] font-semibold px-2 md:px-4 py-2 md:py-3 h-auto text-xs md:text-base ${language !== 'en' ? 'text-sm md:text-lg' : ''} lang-${language}`} lang={language}>
                <SelectValue placeholder={t('selectLanguage', language)} />
              </SelectTrigger>
              <SelectContent className={`bg-[#1a0a2e] border-2 border-[#00D9FF]/40 min-w-full md:w-96 lang-${language}`} lang={language}>
                {(Object.entries(LANGUAGES) as Array<[Language, { nativeName: string; marblesName: string }]>).map(([code, { nativeName, marblesName }]) => (
                  <SelectItem key={code} value={code} className={`text-[#00D9FF] hover:bg-[#00D9FF]/20 font-semibold py-2 md:py-4 px-2 md:px-3 whitespace-normal ${code !== 'en' ? 'text-xs md:text-base' : 'text-xs md:text-sm'} lang-${code}`} lang={code}>
                    <div className="flex flex-col gap-1 md:gap-2">
                      <span className={`block font-bold ${code !== 'en' ? 'text-sm md:text-2xl leading-relaxed' : 'text-sm md:text-xl'}`}>{nativeName}</span>
                      <span className={`block text-[#00D9FF]/70 text-xs md:text-sm ${code !== 'en' ? 'md:text-lg' : ''}`}>{marblesName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4 md:mb-10">
          <PlayerProfile
            name={playerName}
            avatar={playerImage || undefined}
            marbles={playerMarbles}
            gamesPlayed={gamesPlayed}
            gamesWon={gamesWon}
          />
        </div>

        <div className="flex justify-center items-center w-full">
          <Link href="/kanchey-king" className="w-full flex justify-center">
            <Button
              className={`bg-gradient-to-r from-[#00D9FF] to-[#E91E8C] hover:from-[#00D9FF]/90 hover:to-[#E91E8C]/90 text-white px-6 md:px-15 py-3 md:py-8 font-bold rounded-full shadow-[0_5px_20px_rgba(0,217,255,0.3)] hover:shadow-[0_8px_25px_rgba(0,217,255,0.4)] hover:-translate-y-1 transition-all uppercase tracking-wider flex items-center justify-center gap-2 md:gap-3 h-12 md:h-24 text-sm md:text-3xl lang-${language}`}
              data-testid="button-start-game"
              lang={language}
            >
              <span className="text-xl md:text-4xl">🎮</span> <span>{t('startGame', language)}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#00D9FF]/20 bg-[#0d0416]/60 backdrop-blur-sm mt-10 py-6">
        <div className="container max-w-6xl mx-auto px-5">
          <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-[#00D9FF]/70">
            <div>
              <p>&copy; 2025 {t('appTitle', language)}. All rights reserved.</p>
            </div>
            <div className="flex gap-4 flex-wrap items-center">
              {/* Social Media Icons */}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                  title="Instagram"
                  data-testid="link-instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 transition-colors"
                  title="YouTube"
                  data-testid="link-youtube"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>
                  </svg>
                </a>
              )}
              <Link href="/about" className="text-[#00D9FF] hover:text-[#E91E8C] transition-colors" data-testid="link-about">
                About Us
              </Link>
              <Link href="/terms" className="text-[#00D9FF] hover:text-[#E91E8C] transition-colors" data-testid="link-terms">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="text-[#00D9FF] hover:text-[#E91E8C] transition-colors" data-testid="link-privacy-policy">
                {t('privacyPolicy', language)}
              </Link>
              <Link href="/admin-login" className="text-[#E91E8C]/70 hover:text-[#E91E8C] transition-colors" data-testid="link-admin-login">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
