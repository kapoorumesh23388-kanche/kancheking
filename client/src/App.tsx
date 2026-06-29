import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/LanguageContext";
import GameHeader from "@/components/GameHeader";
import ChallengePopup from "@/components/ChallengePopup";
import { usePresence } from "@/hooks/usePresence";
import Home from "@/pages/Home";
import OnboardingProfile from "@/pages/OnboardingProfile";
import KancheyKing from "@/pages/KancheyKing";
import ModeSelection from "@/pages/ModeSelection";
import GameModes from "@/pages/GameModes";
import GamePlay from "@/pages/GamePlay";
import ChallengeFriend from "@/pages/ChallengeFriend";
import ChallengeRandom from "@/pages/ChallengeRandom";
import MultiplayerGame from "@/pages/MultiplayerGame";
import Feedback from "@/pages/Feedback";
import Support from "@/pages/Support";
import LeaderboardPage from "@/pages/LeaderboardPage";
import Shop from "@/pages/Shop";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLoginOTP";
import Tournament from "@/pages/Tournament";
import Profile from "@/pages/Profile";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

function Router({ needsOnboarding }: { needsOnboarding: boolean }) {
  // Redirect to onboarding if needed (except for specific pages)
  if (needsOnboarding) {
    return <OnboardingProfile />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={OnboardingProfile} />
      <Route path="/kanchey-king" component={KancheyKing} />
      <Route path="/modes" component={ModeSelection} />
      <Route path="/game-modes" component={GameModes} />
      <Route path="/game/friend" component={ChallengeFriend} />
      <Route path="/game/friend-join" component={ChallengeFriend} />
      <Route path="/challenge-friend" component={ChallengeFriend} />
      <Route path="/game/random" component={ChallengeRandom} />
      <Route path="/challenge-random" component={ChallengeRandom} />
      <Route path="/game/:mode" component={GamePlay} />
      <Route path="/multiplayer-game/:roomCode" component={MultiplayerGame} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/support" component={Support} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/shop" component={Shop} />
      <Route path="/adminrights" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route path="/tournament" component={Tournament} />
      <Route path="/profile" component={Profile} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsAndConditions} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent({ needsOnboarding }: { needsOnboarding: boolean }) {
  const { pendingChallenge, respondToChallenge } = usePresence();
  
  return (
    <>
      {!needsOnboarding && <GameHeader />}
      <Toaster />
      <Router needsOnboarding={needsOnboarding} />
      <ChallengePopup
        challenge={pendingChallenge}
        onAccept={() => respondToChallenge(true)}
        onDecline={() => respondToChallenge(false)}
      />
    </>
  );
}

function App() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      localStorage.clear();
      
      userId = `player-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem("userId", userId);
      localStorage.setItem("playerId", userId);
      localStorage.setItem("playerProfileCompleted", "false");
      localStorage.setItem("playerMarbles", "150");
      localStorage.setItem("playerRewardPoints", "0");
      localStorage.setItem("gamesPlayed", "0");
      localStorage.setItem("gamesWon", "0");
      
      fetch("/api/user/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, username: userId }),
      }).catch(() => {});
    } else {
      if (!localStorage.getItem("playerId")) {
        localStorage.setItem("playerId", userId);
      }
    }

    const profileCompleted = localStorage.getItem("playerProfileCompleted");
    const profileName = localStorage.getItem("playerDisplayName");
    
    if (profileCompleted !== "true" && !profileName) {
      setNeedsOnboarding(true);
    } else {
      setNeedsOnboarding(false);
    }

    const handleProfileUpdated = () => {
      setNeedsOnboarding(false);
    };

    window.addEventListener("profileUpdated", handleProfileUpdated);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdated);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <AppContent needsOnboarding={needsOnboarding} />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;


