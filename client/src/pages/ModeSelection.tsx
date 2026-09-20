import ModeCard from "@/components/ModeCard";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export default function ModeSelection() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isGuest = localStorage.getItem("isGuest") === "true";

  // Guest players (Play as Guest, no account) can only play against the
  // AI — every other mode needs a real profile, since they all involve
  // saved progress, other players, or spending real marbles/points.
  const handleLockedMode = (e: React.MouseEvent) => {
    if (!isGuest) return;
    e.preventDefault();
    toast({
      title: "Create a free profile to continue",
      description: "Guest mode only supports playing against the AI. Sign up (it's free) to unlock this.",
    });
    localStorage.removeItem("isGuest");
    localStorage.removeItem("guestMarbles");
    localStorage.removeItem("playerDisplayName");
    setLocation("/onboarding");
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-7xl mx-auto px-5">
        <div className="text-center mb-10">
          <h2
            className="text-4xl md:text-5xl font-bold text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,217,255,0.5)] mb-3"
          >
            {t("chooseGameMode")}
          </h2>
          <p className="text-lg md:text-xl text-[#C8E6F0]">
            {t("selectHowToPlay")}
          </p>
          {isGuest && (
            <p className="text-sm text-yellow-400/90 mt-3">
              Playing as guest — only "Play with AI" is available. Other modes need a free profile.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 auto-rows-fr">
          <Link href="/game/ai">
            <ModeCard
              icon="🤖"
              title={t("playWithAI")}
              description={t("vsAI")}
            />
          </Link>

          <Link href="/game/friend" onClick={handleLockedMode}>
            <ModeCard
              icon="👥"
              title={t("friendChallenge")}
              description={isGuest ? "Requires a free profile" : t("createRoom")}
            />
          </Link>

          <Link href="/game/random" onClick={handleLockedMode}>
            <ModeCard
              icon="🌐"
              title={t("randomChallenge")}
              description={isGuest ? "Requires a free profile" : t("searchingForOpponent")}
            />
          </Link>

          <Link href="/tournament" onClick={handleLockedMode}>
            <ModeCard
              icon="🏆"
              title={t("tournament")}
              description={isGuest ? "Requires a free profile" : t("tournamentEntryBarrier")}
              requirement={isGuest ? undefined : t("entryFee")}
            />
          </Link>

          <Link href="/shop" onClick={handleLockedMode}>
            <ModeCard
              icon="💎"
              title={t("shop")}
              description={isGuest ? "Requires a free profile" : t("purchaseMarbles")}
            />
          </Link>

          <Link href="/leaderboard" onClick={handleLockedMode}>
            <ModeCard
              icon="📊"
              title={t("leaderboard")}
              description={isGuest ? "Requires a free profile" : t("stats")}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
