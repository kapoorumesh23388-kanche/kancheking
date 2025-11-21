import ModeCard from "@/components/ModeCard";
import { Link } from "wouter";

export default function ModeSelection() {
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-7xl mx-auto px-5">
        <div className="text-center mb-10">
          <h2
            className="text-5xl font-bold text-primary mb-3"
            style={{ textShadow: '0 0 20px rgba(255,215,0,0.5)' }}
          >
            Choose Your Game Mode
          </h2>
          <p className="text-xl text-muted-foreground">
            Select how you want to play
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/game/ai">
            <ModeCard
              icon="🤖"
              title="Play with AI"
              description="Test your skills against an intelligent computer opponent. Great for practice!"
            />
          </Link>

          <Link href="/game/friend">
            <ModeCard
              icon="👥"
              title="Play with Friend"
              description="Invite your friend with a room code or link. Play together in real-time!"
            />
          </Link>

          <ModeCard
            icon="🌐"
            title="Play Random Online"
            description="Challenge a random player from around the world in real-time matches."
            requirement="100 Marbles Required"
          />

          <ModeCard
            icon="🏆"
            title="Tournament"
            description="Compete in brackets against multiple players for big prizes!"
            requirement="500 Marbles Entry"
          />

          <Link href="/leaderboard">
            <ModeCard
              icon="📊"
              title="Leaderboard"
              description="View top players and see where you rank globally."
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
