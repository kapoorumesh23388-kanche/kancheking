import ModeCard from "@/components/ModeCard";
import { Link } from "wouter";

export default function KancheyKing() {
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-7xl mx-auto px-5">
        <div className="text-center mb-10">
          <h1
            className="text-5xl font-bold bg-gradient-to-r from-primary via-[#FFA500] to-primary bg-clip-text text-transparent mb-3"
            style={{ textShadow: '0 0 30px #FFD700' }}
          >
            Kanchey King
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A Collection of Traditional Indian Marble Games
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          <Link href="/modes?game=kali-jotta" className="w-full">
            <ModeCard
              icon="🎯"
              title="Kali Jotta"
              description="The classic marble guessing game. Hide marbles and let your opponent guess if the count is Odd (Kali) or Even (Jotta)."
            />
          </Link>

          {/* Placeholder for future games */}
          <div className="p-6 backdrop-blur-lg bg-primary/5 rounded-2xl border-2 border-primary/20 opacity-50 cursor-not-allowed">
            <div className="text-center">
              <p className="text-xl text-muted-foreground mb-2">🔜 More Games Coming Soon</p>
              <p className="text-sm text-muted-foreground">New marble games will be added to the Kanchey King collection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
