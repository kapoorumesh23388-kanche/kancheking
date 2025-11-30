import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2, Loader2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function ChallengeFriend() {
  const [location, setLocation] = useLocation();
  const [roomCode, setRoomCode] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const createRoom = () => {
    const newCode = `ROOM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setRoomCode(newCode);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareLink = async () => {
    const url = `${window.location.origin}/game/friend-join?code=${roomCode}`;
    if (navigator.share) {
      await navigator.share({
        title: "Kali Jotta Challenge",
        text: "Join me in Kali Jotta!",
        url: url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) return;
    setIsJoining(true);
    setTimeout(() => {
      setLocation(`/multiplayer-game/${joinCode}`);
    }, 1000);
  };

  // Show room code and share options after creating room
  if (roomCode) {
    return (
      <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
        <div className="container max-w-2xl mx-auto px-5">
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-primary mb-2">
                Room Created! 🎮
              </CardTitle>
              <CardDescription>Share this with your friend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Code Display */}
              <div className="bg-primary/20 rounded-lg p-8 border-2 border-primary/50">
                <p className="text-sm text-muted-foreground text-center mb-4 font-semibold">Room Code</p>
                <p className="text-6xl font-black text-primary text-center tracking-widest font-mono" data-testid="text-room-code">
                  {roomCode}
                </p>
              </div>

              {/* Share Link Display */}
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-5">
                <p className="text-sm text-primary/80 mb-3 font-semibold">Share Link</p>
                <div className="bg-black/50 rounded p-4 mb-4 border border-primary/20">
                  <p className="text-xs text-muted-foreground break-all font-mono" data-testid="text-share-link">
                    {`${window.location.origin}/game/friend-join?code=${roomCode}`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                  onClick={copyCode}
                  data-testid="button-copy-code"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-5 h-5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" /> Copy Code
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 flex items-center justify-center gap-2 text-primary-foreground font-bold"
                  onClick={shareLink}
                  data-testid="button-share-room"
                >
                  <Share2 className="w-5 h-5" /> Share Link
                </Button>
              </div>

              {/* Waiting Status */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <p className="font-bold text-primary">Waiting for opponent...</p>
                </div>
                <p className="text-sm text-muted-foreground">Share the code or link with your friend</p>
              </div>

              {/* Cancel Button */}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setRoomCode("")}
                data-testid="button-cancel-room"
              >
                Create New Room
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Initial screen with Create/Join options
  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-2xl mx-auto px-5">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-3" style={{ textShadow: '0 0 30px rgba(255,215,0,0.5)' }} data-testid="heading-challenge-friend">
            Challenge a Friend
          </h1>
          <p className="text-lg text-muted-foreground">Create a room or join your friend's room</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Create Room Card */}
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-green-500/30 hover-elevate" data-testid="card-create-room">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span>➕</span> Create Room
              </CardTitle>
              <CardDescription>Invite your friend to play</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a room code and share it with your friend. They can join using the code.
              </p>
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold text-white py-6 text-lg"
                onClick={createRoom}
                data-testid="button-create-room"
              >
                Create Room
              </Button>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-blue-500/30 hover-elevate" data-testid="card-join-room">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span>🔗</span> Join Room
              </CardTitle>
              <CardDescription>Enter your friend's code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="ROOM1A2B3C"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-bold tracking-widest py-6"
                data-testid="input-join-code"
              />
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-bold text-white py-6 text-lg"
                onClick={joinRoom}
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

        {/* Back Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => setLocation("/modes")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </div>
    </div>
  );
}
