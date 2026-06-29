import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Users, Zap, Trophy } from "lucide-react";
import AnimatedPlayers from "@/components/AnimatedPlayers";
import { useLanguage } from "@/lib/LanguageContext";

export default function GameModes() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4" style={{ textShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            {t("appTitle")} - {t("chooseGameMode")}
          </h1>
          <p className="text-xl text-muted-foreground">{t("pickYourChallenge")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Mode */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30 hover:shadow-2xl transition-all cursor-pointer flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Zap className="w-6 h-6 text-purple-400" />
                {t("playWithAI")}
              </CardTitle>
              <CardDescription>{t("testSkillsAI")}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              <div className="flex-1">
                <AnimatedPlayers gameMode="ai" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("challengeAI")} <br />
                {t("fastPacedGameplay")} <br />
                {t("perfectForPractice")}
              </p>
              <Link href="/game/ai" className="mt-auto">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6" data-testid="button-play-ai">
                  {t("vsAI")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Challenge Friend */}
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 hover:shadow-2xl transition-all cursor-pointer flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="w-6 h-6 text-green-400" />
                {t("friendChallenge")}
              </CardTitle>
              <CardDescription>{t("playWithFriendsCodes")}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              <div className="flex-1">
                <AnimatedPlayers gameMode="friend" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("inviteFriendsCode")} <br />
                {t("shareableLinks")} <br />
                {t("realTimeMultiplayer")}
              </p>
              <Link href="/game/friend" className="mt-auto">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6" data-testid="button-challenge-friend">
                  {t("friendChallenge")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Random Player */}
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 hover:shadow-2xl transition-all cursor-pointer flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="w-6 h-6 text-orange-400" />
                {t("randomChallenge")}
              </CardTitle>
              <CardDescription>{t("autoMatchPlayers")}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              <div className="flex-1">
                <AnimatedPlayers gameMode="random" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("findOpponentsInstantly")} <br />
                {t("competitiveMatches")} <br />
                {t("winMarblesPoints")}
              </p>
              <Link href="/game/random" className="mt-auto">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-6" data-testid="button-challenge-random">
                  {t("findOpponent")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Link href="/kanchey-king">
            <Button variant="outline" className="px-6 py-3" data-testid="button-back-home">
              â† {t("backToHome")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


