import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function About() {
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

          {/* Logo + Title */}
          <div className="text-center">
            <img
              src="/favicon.png"
              alt="Kanche King Logo"
              style={{ width: 96, height: 96, borderRadius: 22, margin: '0 auto 16px', boxShadow: '0 0 30px rgba(0,217,255,0.4)' }}
            />
            <h1 className="text-4xl font-bold text-primary mb-2">Kanche King</h1>
            <p className="text-[#00D9FF]/80 text-lg">Traditional Indian Marble Game</p>
          </div>

          {/* About the Game */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">About the Game</h2>
            <p className="text-gray-200 leading-relaxed mb-3">
              Kanche King is a free-to-play digital version of the beloved traditional Indian marble game — <strong>Kali Jotta</strong>. Played across generations in streets and courtyards of India, this game brings the nostalgic joy of marble guessing to your mobile screen.
            </p>
            <p className="text-gray-200 leading-relaxed">
              Players take turns hiding marbles in their fist and challenging opponents to guess whether the count is <strong>Odd (Kali)</strong> or <strong>Even (Jotta)</strong>. Simple to learn, exciting to play — for all ages!
            </p>
          </section>

          {/* How to Play */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">How to Play</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary font-bold">1.</span><span>One player hides 1–20 marbles in their fist (the Hider).</span></li>
              <li className="flex gap-3"><span className="text-primary font-bold">2.</span><span>The other player guesses: <strong>Kali (Odd)</strong> or <strong>Jotta (Even)</strong>.</span></li>
              <li className="flex gap-3"><span className="text-primary font-bold">3.</span><span>If the guess is correct, the Guesser wins the marbles. If wrong, the Hider wins.</span></li>
              <li className="flex gap-3"><span className="text-primary font-bold">4.</span><span>Play against AI, challenge friends, or compete with random players worldwide!</span></li>
            </ul>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Game Features</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">🤖</span><span><strong>AI Mode:</strong> Practice against a smart AI opponent anytime.</span></li>
              <li className="flex gap-3"><span className="text-primary">👥</span><span><strong>Multiplayer:</strong> Challenge friends with a room code or play with random players.</span></li>
              <li className="flex gap-3"><span className="text-primary">🏆</span><span><strong>Tournaments:</strong> Compete in tournaments and win massive Reward Points.</span></li>
              <li className="flex gap-3"><span className="text-primary">🎵</span><span><strong>Hindi Voice:</strong> Game announcements in Hindi, English, and 7 more Indian languages.</span></li>
              <li className="flex gap-3"><span className="text-primary">💎</span><span><strong>Reward System:</strong> Earn points daily, redeem for marbles and catalog items.</span></li>
              <li className="flex gap-3"><span className="text-primary">🌐</span><span><strong>Free to Play:</strong> No real money involved. 100% free game.</span></li>
            </ul>
          </section>

          {/* Developer Info */}
          <section className="bg-primary/10 border border-primary/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Developer Information</h2>
            <div className="space-y-3 text-gray-200">
              <div className="flex gap-3">
                <span className="text-primary font-bold">👤</span>
                <span><strong>Developer:</strong> Umesh Kapoor</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold">🌐</span>
                <span><strong>Website:</strong> www.kancheking.com</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold">📧</span>
                <span><strong>Contact:</strong> umesh.220388@gmail.com</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold">📱</span>
                <span><strong>Platform:</strong> Android (Web App)</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold">🗓️</span>
                <span><strong>Version:</strong> 1.0.0 — June 2026</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
