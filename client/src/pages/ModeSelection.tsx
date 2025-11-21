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
              title="Challenge Friend"
              description="Invite your friend with a room code or link. Play together in real-time!"
            />
          </Link>

          <Link href="/game/random">
            <ModeCard
              icon="🌐"
              title="Challenge Random Player"
              description="Challenge a random player from around the world. No marble limit required!"
            />
          </Link>

          <Link href="/tournament">
            <ModeCard
              icon="🏆"
              title="Tournament"
              description="100-player tournament bracket. 2500 marble entry fee. Win big prizes!"
              requirement="2500 Marbles Entry"
            />
          </Link>

          <Link href="/shop">
            <ModeCard
              icon="💎"
              title="Shop"
              description="Purchase marbles, view points catalog, and manage referrals."
            />
          </Link>

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
