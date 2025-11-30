import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/LanguageContext";
import GameHeader from "@/components/GameHeader";
import Home from "@/pages/Home";
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
import Tournament from "@/pages/Tournament";
import Profile from "@/pages/Profile";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/kanchey-king" component={KancheyKing} />
      <Route path="/modes" component={ModeSelection} />
      <Route path="/game-modes" component={GameModes} />
      <Route path="/game/friend" component={ChallengeFriend} />
      <Route path="/game/friend-join" component={ChallengeFriend} />
      <Route path="/game/random" component={ChallengeRandom} />
      <Route path="/game/:mode" component={GamePlay} />
      <Route path="/multiplayer-game/:roomCode" component={MultiplayerGame} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/support" component={Support} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/shop" component={Shop} />
      <Route path="/tournament" component={Tournament} />
      <Route path="/profile" component={Profile} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize userId if not present
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = `player-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem("userId", userId);
      
      // Create user in backend
      fetch("/api/user/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, username: userId }),
      }).catch(() => {
        // Silently fail if backend not ready
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <GameHeader />
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
