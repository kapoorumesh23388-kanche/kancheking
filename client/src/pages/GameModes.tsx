import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Users, Zap, Trophy } from "lucide-react";
import AnimatedPlayers from "@/components/AnimatedPlayers";

export default function GameModes() {
  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4" style={{ textShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            Kali Jotta - Choose Game Mode
          </h1>
          <p className="text-xl text-muted-foreground">Pick your challenge and start playing!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Mode */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30 hover:shadow-2xl transition-all cursor-pointer flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Zap className="w-6 h-6 text-purple-400" />
                Play AI
              </CardTitle>
              <CardDescription>Test your skills against the AI opponent</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              <div className="flex-1">
                <AnimatedPlayers gameMode="ai" />
              </div>
              <p className="text-sm text-muted-foreground">
                🤖 Challenge the intelligent AI <br />
                ⚡ Fast-paced gameplay <br />
                💯 Perfect for practice
              </p>
              <Link href="/game/ai" className="mt-auto">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6" data-testid="button-play-ai">
                  Play vs AI
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Challenge Friend */}
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 hover:shadow-2xl transition-all cursor-pointer flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="w-6 h-6 text-green-400" />
                Challenge Friend
              </CardTitle>
              <CardDescription>Play with friends using room codes</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              <div className="flex-1">
                <AnimatedPlayers gameMode="friend" />
              </div>
              <p className="text-sm text-muted-foreground">
                👥 Invite friends with a code <br />
                🔗 Shareable room links <br />
                🎮 Real-time multiplayer
              </p>
              <Link href="/game/friend" className="mt-auto">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6" data-testid="button-challenge-friend">
                  Challenge Friend
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Random Player */}
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 hover:shadow-2xl transition-all cursor-pointer flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="w-6 h-6 text-orange-400" />
                Challenge Random
              </CardTitle>
              <CardDescription>Auto-match with random players</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              <div className="flex-1">
                <AnimatedPlayers gameMode="random" />
              </div>
              <p className="text-sm text-muted-foreground">
                🎲 Find opponents instantly <br />
                ⚔️ Competitive matches <br />
                🏆 Win marbles & points
              </p>
              <Link href="/game/random" className="mt-auto">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-6" data-testid="button-challenge-random">
                  Find Opponent
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Link href="/kanchey-king">
            <Button variant="outline" className="px-6 py-3" data-testid="button-back-home">
              ← Back to Games
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
