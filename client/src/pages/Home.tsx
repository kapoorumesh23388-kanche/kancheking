import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PlayerProfile from "@/components/PlayerProfile";
import FloatingMarbles from "@/components/FloatingMarbles";
import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { t, LANGUAGES, getMarbleName, type Language } from "@/lib/translations";

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const [playerName, setPlayerName] = useState("");
  const [playerImage, setPlayerImage] = useState<string | null>(null);
  const [playerMarbles, setPlayerMarbles] = useState(150);
  const [playerRewardPoints, setPlayerRewardPoints] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);

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

  return (
    <div className="min-h-screen pt-8 md:pt-20 pb-8 md:pb-20 flex flex-col">
      <FloatingMarbles />
      <div className="container max-w-6xl mx-auto px-3 md:px-5 flex-1">
        <div className="text-center mb-4 md:mb-8 p-4 md:p-10 marble-glass rounded-2xl md:rounded-3xl neon-glow-cyan">
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
            <div className="flex gap-4 flex-wrap">
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
