import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, X, Swords, Wifi, WifiOff, Users, Gamepad2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { usePresence } from "@/hooks/usePresence";
import { Badge } from "@/components/ui/badge";

export default function ChallengeRandom() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isConnected, onlinePlayers, totalOnline, challengePlayer } = usePresence();
  const [challengingPlayer, setChallengingPlayer] = useState<string | null>(null);

  const handleChallenge = (playerId: string, playerName: string) => {
    setChallengingPlayer(playerId);
    challengePlayer(playerId);
    
    toast({
      title: "Challenge Sent!",
      description: `Waiting for ${playerName} to accept...`,
    });
    
    setTimeout(() => {
      setChallengingPlayer(null);
    }, 10000);
  };

  const handleCancel = () => {
    navigate("/modes");
  };

  const getModeLabel = (mode?: string) => {
    if (!mode) return "Online";
    if (mode.includes("ai")) return "Playing AI";
    if (mode.includes("friend")) return "With Friend";
    if (mode.includes("random")) return "Looking for Match";
    if (mode.includes("tournament")) return "Tournament";
    if (mode.includes("shop")) return "In Shop";
    if (mode.includes("modes")) return "Browsing";
    return "Online";
  };

  const getModeColor = (mode?: string) => {
    if (!mode) return "bg-gray-500/50";
    if (mode.includes("ai")) return "bg-purple-500/50";
    if (mode.includes("friend")) return "bg-blue-500/50";
    if (mode.includes("random")) return "bg-green-500/50";
    if (mode.includes("tournament")) return "bg-yellow-500/50";
    return "bg-cyan-500/50";
  };

  return (
    <div className="min-h-screen pt-24 pb-10">
      <div className="container max-w-2xl mx-auto px-5">
        <Card className="bg-[#0C0418]/90 border-2 border-[#00D9FF]/40 mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-bold">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400 font-bold">Connecting...</span>
                </>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <div className="bg-black/50 rounded-lg px-4 py-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00D9FF]" />
                <span className="text-2xl font-bold text-[#00D9FF]" data-testid="text-total-online">
                  {totalOnline}
                </span>
                <span className="text-sm text-[#C8E6F0]">Online</span>
              </div>
              <div className="bg-black/50 rounded-lg px-4 py-2 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-[#E91E8C]" />
                <span className="text-2xl font-bold text-[#E91E8C]" data-testid="text-available-players">
                  {onlinePlayers.length}
                </span>
                <span className="text-sm text-[#C8E6F0]">Can Challenge</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0C0418]/90 border-2 border-[#00D9FF]/40 mb-6">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
              Live Players
            </CardTitle>
            <p className="text-[#C8E6F0] mt-2">Challenge any online player!</p>
          </CardHeader>
        </Card>

        {!isConnected ? (
          <Card className="bg-[#0C0418]/90 border-2 border-[#00D9FF]/40">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#00D9FF] mx-auto mb-4" />
              <p className="text-[#C8E6F0]">Connecting to server...</p>
            </CardContent>
          </Card>
        ) : onlinePlayers.length === 0 ? (
          <Card className="bg-[#0C0418]/90 border-2 border-[#00D9FF]/40">
            <CardContent className="p-8 text-center space-y-4">
              <Users className="w-16 h-16 text-[#00D9FF]/50 mx-auto" />
              <p className="text-lg text-[#C8E6F0]">No other players online right now</p>
              <p className="text-sm text-[#8AA8B8]">Share the game with friends to play together!</p>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full border-[#00D9FF]/50 text-[#00D9FF]"
                data-testid="button-cancel"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 mb-6">
            {onlinePlayers.map((player) => (
              <Card
                key={player.id}
                className="bg-[#0C0418]/90 border-2 border-[#00D9FF]/40 hover:border-[#00D9FF]/80 transition cursor-pointer"
                onClick={() => !challengingPlayer && handleChallenge(player.id, player.name)}
                data-testid={`card-player-${player.id}`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-[#00D9FF]/50">
                      <AvatarImage src={player.profileImage} />
                      <AvatarFallback className="bg-[#00D9FF]/20 text-[#00D9FF]">
                        {player.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-white">{player.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#FFD700]">{player.marbles} marbles</span>
                        <Badge className={`text-xs ${getModeColor(player.currentMode)}`}>
                          {getModeLabel(player.currentMode)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    className="bg-gradient-to-r from-[#00D9FF] to-[#00FF88] text-black hover:opacity-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChallenge(player.id, player.name);
                    }}
                    disabled={challengingPlayer === player.id}
                    data-testid={`button-challenge-${player.id}`}
                  >
                    {challengingPlayer === player.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Swords className="w-4 h-4" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full border-[#E91E8C]/50 text-[#E91E8C]"
          onClick={handleCancel}
          disabled={!!challengingPlayer}
          data-testid="button-cancel-main"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
