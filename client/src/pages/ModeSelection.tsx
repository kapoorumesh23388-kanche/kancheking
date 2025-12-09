import ModeCard from "@/components/ModeCard";
import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";

export default function ModeSelection() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-7xl mx-auto px-5">
        <div className="text-center mb-10">
          <h2
            className="text-5xl font-bold text-[#00D9FF] neon-text-cyan mb-3"
          >
            {t("chooseGameMode")}
          </h2>
          <p className="text-xl text-[#00D9FF]/70">
            {t("selectHowToPlay")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/game/ai">
            <ModeCard
              icon="🤖"
              title={t("playWithAI")}
              description={t("vsAI")}
            />
          </Link>

          <Link href="/game/friend">
            <ModeCard
              icon="👥"
              title={t("friendChallenge")}
              description={t("createRoom")}
            />
          </Link>

          <Link href="/game/random">
            <ModeCard
              icon="🌐"
              title={t("randomChallenge")}
              description={t("searchingForOpponent")}
            />
          </Link>

          <Link href="/tournament">
            <ModeCard
              icon="🏆"
              title={t("tournament")}
              description={t("tournamentEntryBarrier")}
              requirement={t("entryFee")}
            />
          </Link>

          <Link href="/shop">
            <ModeCard
              icon="💎"
              title={t("shop")}
              description={t("purchaseMarbles")}
            />
          </Link>

          <Link href="/leaderboard">
            <ModeCard
              icon="📊"
              title={t("leaderboard")}
              description={t("stats")}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
