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
          <Link href="/game/solo">
            <ModeCard
              icon="🎯"
              title="Solo Practice"
              description="Practice your guessing skills against the computer. Perfect for learning the game!"
            />
          </Link>

          <ModeCard
            icon="🌐"
            title="Online Multiplayer"
            description="Challenge players from around the world in real-time matches."
            requirement="100 Marbles Required"
          />

          <ModeCard
            icon="🏆"
            title="Tournament"
            description="Compete in brackets against multiple players for big prizes!"
            requirement="500 Marbles Entry"
          />

          <ModeCard
            icon="⭐"
            title="Daily Challenge"
            description="Complete special challenges and earn bonus marbles every day."
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
