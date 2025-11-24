import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function ChallengeFriend() {
  const [location, setLocation] = useLocation();
  const [gameMode] = useState<"friend" | "join">(location.includes("join") ? "join" : "friend");
  const [roomCode, setRoomCode] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [opponentWaiting, setOpponentWaiting] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      // Simulate room creation
      const code = `ROOM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setRoomCode(code);
      setOpponentWaiting(true);
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    setIsJoining(true);
    try {
      // Simulate room join
      setRoomCode(joinCode);
      setGameStarted(true);
      // Redirect to game after 2 seconds
      setTimeout(() => {
        setLocation(`/multiplayer-game/${joinCode}`);
      }, 2000);
    } catch (error) {
      console.error("Failed to join room:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareRoom = async () => {
    const shareUrl = `${window.location.origin}/game/friend-join?code=${roomCode}`;
    if (navigator.share) {
      await navigator.share({
        title: "Kali Jotta Challenge",
        text: "Join me in Kali Jotta!",
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  if (gameMode === "friend" && roomCode && opponentWaiting && !gameStarted) {
    return (
      <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
        <div className="container max-w-2xl mx-auto px-5">
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-primary mb-2">
                Room Created! 🎮
              </CardTitle>
              <CardDescription>Share this code with your friend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/20 rounded-lg p-8 border-2 border-primary/50">
                <p className="text-sm text-muted-foreground text-center mb-2">Room Code</p>
                <p className="text-5xl font-black text-primary text-center tracking-widest font-mono">
                  {roomCode}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                  onClick={copyToClipboard}
                  data-testid="button-copy-code"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Code
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 flex items-center justify-center gap-2 text-primary-foreground font-bold"
                  onClick={shareRoom}
                  data-testid="button-share-room"
                >
                  <Share2 className="w-4 h-4" /> Share Link
                </Button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <p className="font-bold text-primary">Waiting for opponent...</p>
                </div>
                <p className="text-sm text-muted-foreground">Your friend will join automatically</p>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setRoomCode("");
                  setOpponentWaiting(false);
                }}
                data-testid="button-cancel-room"
              >
                Cancel Room
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-2xl mx-auto px-5">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2" style={{ textShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            Challenge a Friend
          </h1>
          <p className="text-muted-foreground">Create a room or join your friend's room</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Room */}
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">➕</span> Create Room
              </CardTitle>
              <CardDescription>Create a new room and invite your friend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a unique room code and share it with your friend. They can join using this code.
              </p>
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold py-6"
                onClick={handleCreateRoom}
                disabled={isCreating}
                data-testid="button-create-room"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Room"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔗</span> Join Room
              </CardTitle>
              <CardDescription>Join your friend's room using their code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter room code (e.g., ROOM1A2B3C)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-bold tracking-widest"
                data-testid="input-join-code"
              />
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-bold py-6"
                onClick={handleJoinRoom}
                disabled={isJoining || !joinCode.trim()}
                data-testid="button-join-room"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Joining...
                  </>
                ) : (
                  "Join Room"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            className="px-6"
            onClick={() => setLocation("/modes")}
            data-testid="button-back-modes"
          >
            ← Back to Game Modes
          </Button>
        </div>
      </div>
    </div>
  );
}
