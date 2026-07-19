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
import BlogPage from "@/pages/BlogPage";
import BlogPost from "@/pages/BlogPost";
import AdminBlog from "@/pages/AdminBlog";
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
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:id" component={BlogPost} />
      <Route path="/admin/blog" component={AdminBlog} />
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
    const userId = localStorage.getItem("userId");
    const profileCompleted = localStorage.getItem("playerProfileCompleted");
    const profileName = localStorage.getItem("playerDisplayName");

    // If there's no verified account yet (no userId from OTP signup/login),
    // or profile/name isn't set, send the player to the Email OTP onboarding flow.
    // NOTE: We intentionally do NOT generate a random guest userId or call
    // /api/user/init here anymore — doing so used to create empty "ghost"
    // user rows in the database (no display name) for every visitor who
    // never completed signup. Real accounts are now only created when a
    // player verifies their email OTP (see OnboardingProfile.tsx).
    if (!userId || (profileCompleted !== "true" && !profileName)) {
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
