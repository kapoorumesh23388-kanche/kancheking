import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Tournament() {
  const [activeWindow, setActiveWindow] = useState(1);
  const playerCount = 85;
  const entryFee = 2500;
  const userMarbles = 10000;

  const tournamentWindows = [
    {
      id: 1,
      players: 85,
      status: "Open",
      prizePool: 850000,
    },
    {
      id: 2,
      players: 0,
      status: "Waiting",
      prizePool: 0,
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-6xl mx-auto px-5">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-primary mb-3" style={{ textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
            🏆 Kali Jhota Tournament
          </h2>
          <p className="text-xl text-muted-foreground">100-Player Battles | 2500 Marble Entry | Massive Rewards</p>
        </div>

        {/* Entry Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Your Marbles</p>
                <p className="text-3xl font-bold text-yellow-500">{userMarbles}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Entry Fee</p>
                <p className="text-3xl font-bold text-red-500">{entryFee}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Can Afford</p>
                <p className="text-3xl font-bold text-purple-500">{Math.floor(userMarbles / entryFee)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tournament Windows */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">Tournament Windows</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tournamentWindows.map((window) => (
              <Card
                key={window.id}
                className={`cursor-pointer transition-all ${
                  activeWindow === window.id
                    ? "border-primary ring-2 ring-primary"
                    : "border-primary/20"
                }`}
                onClick={() => setActiveWindow(window.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Window {window.id}</CardTitle>
                    <Badge variant={window.status === "Open" ? "default" : "secondary"}>
                      {window.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground mb-2">Players Enrolled</p>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-bold text-primary">{window.players}</p>
                        <p className="text-muted-foreground mb-1">/ 100</p>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 mt-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${window.players}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2">Prize Pool</p>
                      <p className="text-2xl font-bold text-yellow-500">₹{window.prizePool.toLocaleString()}</p>
                    </div>
                    {window.status === "Open" && (
                      <Button
                        className="w-full"
                        size="lg"
                        data-testid="button-join-tournament"
                        disabled={userMarbles < entryFee}
                      >
                        Join Tournament (2500 Marbles)
                      </Button>
                    )}
                    {window.status === "Waiting" && (
                      <Button className="w-full" size="lg" disabled>
                        Waiting for Players...
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                <span>100 players compete in each tournament window</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                <span>Entry fee: 2500 marbles per player</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                <span>Winner (beats all 99 players) receives bonus points</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">4.</span>
                <span>When Window 1 reaches 100 players, Window 2 automatically opens</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">5.</span>
                <span>Points earned can be redeemed in the Shop catalog</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
