import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function GameRules() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F2027] via-[#203A43] to-[#2C5364] text-white py-10">
      <div className="container max-w-4xl mx-auto px-5">
        <Link href="/">
          <Button variant="ghost" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <div className="backdrop-blur-lg bg-black/40 rounded-2xl border border-primary/20 p-8 space-y-8">
          <h1 className="text-4xl font-bold text-primary mb-8">Game Rules - Kali Jhota</h1>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">How to Play Kali Jhota</h2>
            <p className="text-gray-200 mb-4">
              Kali Jhota is a traditional Indian marble guessing game where players use strategy, intuition, and nerve to win marbles from their opponents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Basic Gameplay</h2>
            <ol className="space-y-4 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                <span><strong>Hide Marbles:</strong> The "hider" puts 1-10 marbles in their closed fist</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                <span><strong>Guess:</strong> The "guesser" must predict if the count is "Odd" or "Even"</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                <span><strong>Reveal:</strong> The hider opens their fist to reveal the actual count</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">4.</span>
                <span><strong>Win/Lose:</strong> If guess is correct, guesser wins; if wrong, hider wins</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Marble Betting</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Minimum Bet:</strong> 10 marbles per round</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Maximum Bet:</strong> All your available marbles</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Winner Gets:</strong> All marbles bet by both players</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Loser Loses:</strong> The marbles they bet in that round</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Game Modes Explained</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-primary/80 mb-2">Play with AI</h3>
                <ul className="space-y-2 text-gray-200 ml-4">
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Play against computer-controlled opponents</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Great for practice and learning the game</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>AI Wins count as marbles but NOT for tournament entry</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>No cooldown - play anytime</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary/80 mb-2">Challenge Friend</h3>
                <ul className="space-y-2 text-gray-200 ml-4">
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Create a private room with a unique code</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Share the code with your friend</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Play with marbles earned from defeating friends (TOURNAMENT ELIGIBLE)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Best for real competitive gameplay</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary/80 mb-2">Challenge Random</h3>
                <ul className="space-y-2 text-gray-200 ml-4">
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Join matchmaking queue with random players</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Real-time player list updated every 2 seconds</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Play with marbles earned from random players (TOURNAMENT ELIGIBLE)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Most popular - largest competition</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary/80 mb-2">Tournament</h3>
                <ul className="space-y-2 text-gray-200 ml-4">
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Entry Fee: 2500 marbles (earned from players OR purchased)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>AI wins DO NOT count for tournament eligibility</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Tournament winner gets 250,000 reward points</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary/60">•</span>
                    <span>Compete with top players for the ultimate prize</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Strategy Tips</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>As Hider:</strong> Vary your marble count - don't fall into patterns</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>As Hider:</strong> Watch your opponent's body language for tells</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>As Guesser:</strong> Observe opponent habits and patterns</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>As Guesser:</strong> Use probability - but don't be predictable</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>General:</strong> Manage your marbles - bigger bets = higher risk</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>General:</strong> Play consistently to build your tournament fund</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Reward System</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Daily Login:</strong> 10 reward points (every day)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Playtime:</strong> 60 reward points per hour of active gameplay</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Tournament Victory:</strong> 250,000 reward points</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Use reward points in catalog to redeem exclusive items</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Important Rules</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Cannot hide 0 marbles - minimum is 1</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Cannot hide more than 10 marbles at once</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Disconnect during game = automatic loss</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Cheating or unfair play results in account ban</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>All games are final - results cannot be reversed</span>
              </li>
            </ul>
          </section>

          <section className="pt-6 border-t border-primary/20">
            <p className="text-gray-300 text-sm">
              For questions or disputes, contact our support team. Good luck and may the odds be in your favor! 🎮
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
