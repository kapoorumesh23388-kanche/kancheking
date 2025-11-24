import { Button } from "@/components/ui/button";
import PlayerProfile from "@/components/PlayerProfile";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-6xl mx-auto px-5">
        <div className="text-center mb-8 p-10 backdrop-blur-lg bg-primary/10 rounded-3xl border-2 border-primary/30 shadow-[0_10px_40px_rgba(255,215,0,0.2)]">
          <h1
            className="text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-[#FFA500] to-primary bg-clip-text text-transparent"
            style={{ textShadow: '0 0 30px #FFD700' }}
          >
            Kanchey King
          </h1>
          <p className="text-2xl text-primary/90 mb-5">
            Traditional Indian Marble Game
          </p>
          <Button
            variant="outline"
            className="bg-primary/20 border-2 border-primary/40 text-primary hover:bg-primary/30 px-6 py-3 rounded-full font-semibold"
            data-testid="button-language-toggle"
          >
            🌐 Switch to Hindi
          </Button>
        </div>

        <div className="mb-10">
          <PlayerProfile
            name="Rajesh Kumar"
            marbles={1000}
            gamesPlayed={45}
            gamesWon={32}
          />
        </div>

        <div className="flex justify-center items-center w-full">
          <Link href="/kanchey-king" className="w-full flex justify-center">
            <Button
              className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:from-[#FF6B6B]/80 hover:to-[#FF8E53]/80 text-white px-15 py-8 text-3xl font-bold rounded-full shadow-[0_10px_30px_rgba(255,107,107,0.4)] hover:shadow-[0_15px_40px_rgba(255,107,107,0.6)] hover:-translate-y-1 transition-all uppercase tracking-wider flex items-center justify-center gap-3 leading-none h-24"
              data-testid="button-start-game"
            >
              <span className="text-4xl leading-none">🎮</span> <span className="leading-none">Start Game</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
