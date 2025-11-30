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
  const [playerName, setPlayerName] = useState("Rajesh Kumar");
  const [playerImage, setPlayerImage] = useState<string | null>(null);
  const [playerMarbles, setPlayerMarbles] = useState(1000);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);

  useEffect(() => {
    const loadPlayerProfile = () => {
      const name = localStorage.getItem("playerDisplayName") || "Rajesh Kumar";
      const image = localStorage.getItem("playerProfileImageUpdate");
      const marbles = localStorage.getItem("playerMarbles") || "1000";
      const played = localStorage.getItem("gamesPlayed") || "0";
      const won = localStorage.getItem("gamesWon") || "0";

      setPlayerName(name);
      setPlayerImage(image);
      setPlayerMarbles(parseInt(marbles));
      setGamesPlayed(parseInt(played));
      setGamesWon(parseInt(won));
    };

    loadPlayerProfile();
    window.addEventListener("profileUpdated", loadPlayerProfile);
    window.addEventListener("marbleUpdate", loadPlayerProfile);
    window.addEventListener("storage", loadPlayerProfile);

    return () => {
      window.removeEventListener("profileUpdated", loadPlayerProfile);
      window.removeEventListener("marbleUpdate", loadPlayerProfile);
      window.removeEventListener("storage", loadPlayerProfile);
    };
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-20 flex flex-col">
      <FloatingMarbles />
      <div className="container max-w-6xl mx-auto px-5 flex-1">
        <div className="text-center mb-8 p-10 backdrop-blur-lg bg-primary/10 rounded-3xl border-2 border-primary/30 shadow-[0_10px_40px_rgba(255,215,0,0.2)]">
          <h1
            className="text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-[#FFA500] to-primary bg-clip-text text-transparent"
            style={{ textShadow: '0 0 30px #FFD700' }}
          >
            {t('appTitle', language)}
          </h1>
          <p className="text-2xl text-primary/90 mb-8">
            {t('appSubtitle', language)}
          </p>
          
          <div className="mb-6 flex justify-center" data-testid="language-selector">
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger className="w-80 bg-primary/20 border-2 border-primary/40 text-primary text-base font-semibold px-4 py-3 h-auto">
                <SelectValue placeholder={t('selectLanguage', language)} />
              </SelectTrigger>
              <SelectContent className="bg-black border-2 border-primary/40 w-80 min-w-max">
                {(Object.entries(LANGUAGES) as Array<[Language, { nativeName: string; marblesName: string }]>).map(([code, { nativeName, marblesName }]) => (
                  <SelectItem key={code} value={code} className="text-primary hover:bg-primary/20 text-base font-semibold py-4 px-3 whitespace-normal">
                    <div className="flex flex-col gap-1">
                      <span className="block text-lg">{nativeName}</span>
                      <span className="block text-sm text-primary/70">{marblesName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-10">
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
              className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:from-[#FF6B6B]/80 hover:to-[#FF8E53]/80 text-white px-15 py-8 text-3xl font-bold rounded-full shadow-[0_10px_30px_rgba(255,107,107,0.4)] hover:shadow-[0_15px_40px_rgba(255,107,107,0.6)] hover:-translate-y-1 transition-all uppercase tracking-wider flex items-center justify-center gap-3 leading-none h-24"
              data-testid="button-start-game"
            >
              <span className="text-4xl leading-none">🎮</span> <span className="leading-none">{t('startGame', language)}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-primary/20 bg-black/40 backdrop-blur-sm mt-10 py-6">
        <div className="container max-w-6xl mx-auto px-5">
          <div className="flex justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              <p>&copy; 2025 {t('appTitle', language)}. All rights reserved.</p>
            </div>
            <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors" data-testid="link-privacy-policy">
              {t('privacyPolicy', language)}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
