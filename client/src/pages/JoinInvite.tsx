import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Landing page for invite links:  /join?room=ROOMCODE&ref=REFCODE
//  - Logged-in player  -> straight into the friend's room (or the mode list)
//  - New / logged-out  -> short welcome, then signup; after signup the app
//    sends them into the room automatically (see OnboardingProfile.tsx).
export default function JoinInvite() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const room = (params.get("room") || "").trim().toUpperCase();
  const ref = (params.get("ref") || "").trim();

  const userId = localStorage.getItem("userId");
  const isGuest = localStorage.getItem("isGuest") === "true";
  const profileDone = localStorage.getItem("playerProfileCompleted") === "true";
  const loggedIn = !!userId && profileDone && !isGuest;

  const [inviterName, setInviterName] = useState<string | null>(null);

  useEffect(() => {
    if (loggedIn) {
      // Existing player: no referral bonus (that is for brand-new accounts),
      // just take them where the link points.
      if (room) {
        setLocation(`/game/friend-join?code=${encodeURIComponent(room)}`);
      } else {
        setLocation("/modes");
      }
      return;
    }
    // New player: remember the invite until the signup is finished.
    try {
      if (ref) localStorage.setItem("pendingReferralCode", ref);
      if (room) localStorage.setItem("pendingInviteRoom", room);
    } catch {
      /* storage can be unavailable in private mode — the link still works */
    }
    if (ref) {
      fetch(`/api/referral/inviter/${encodeURIComponent(ref)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setInviterName(d?.displayName || null))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const startSignup = () => {
    // A guest who wants to join a friend needs a real profile.
    localStorage.removeItem("isGuest");
    setLocation("/onboarding");
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
      <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 max-w-md w-full mx-5">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary mb-2" data-testid="heading-join-invite">
            {inviterName ? `${inviterName} invited you!` : "You're invited!"}
          </CardTitle>
          <CardDescription className="text-sm">
            {room
              ? "A friend is waiting in a Kali Jotta room. Create your free profile and you'll join the game right away."
              : "Play Kali Jotta (Kanche King), the classic Indian marble game, with friends. It's free to play."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 text-center text-sm">
            🎁 Finish your first game and get <span className="font-bold text-[#00FF88]">25 bonus marbles</span>
          </div>
          <Button className="w-full" size="lg" onClick={startSignup} data-testid="button-join-signup">
            Create Free Profile &amp; Play
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">
            You must be 18 or older. Sign up takes less than a minute (email OTP).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
