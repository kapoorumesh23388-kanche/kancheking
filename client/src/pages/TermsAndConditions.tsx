import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditions() {
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
          <h1 className="text-4xl font-bold text-primary mb-8">Terms & Conditions</h1>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">1. Game Play Rules</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Each game requires players to hide marbles (1-20) in their fist</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Opponent must guess if the count is Odd or Even</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Correct guess wins the marbles; incorrect guess loses marbles</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Minimum marble bet: 10, Maximum bet: Your total marbles</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">2. Marble System</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Earned Marbles:</strong> Won from defeating other players</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Purchased Marbles:</strong> Bought using real money (Razorpay)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>AI Wins:</strong> Marbles from defeating AI opponents (cannot be used for tournaments)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Total Marbles:</strong> Sum of all marbles (earned + purchased + AI wins)</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">3. Game Modes</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Play with AI:</strong> Earn marbles by defeating AI opponents (no tournament value)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Challenge Friend:</strong> Play with friends using room codes (earn tournament-eligible marbles)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Challenge Random:</strong> Play with random players (earn tournament-eligible marbles)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Tournament:</strong> Compete in tournaments for 250,000 reward points (restricted to eligible players)</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">4. Tournament Entry Requirements</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Entry Fee:</strong> 2500 marbles</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Eligible Marbles:</strong> Earned marbles (from player wins) + Purchased marbles</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>NOT Counted:</strong> Marbles earned from AI wins or ad rewards</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Winner Prize:</strong> 250,000 reward points (bonus marbles may apply)</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">5. Reward Points System</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Daily Login Bonus:</strong> 10 reward points</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Playtime Bonus:</strong> 60 reward points per hour of gameplay</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Tournament Winner:</strong> 250,000 reward points</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Reward points can be redeemed from our catalog for exclusive items</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">6. Fair Play Policy</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>All games are played fairly - no cheating or manipulation allowed</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Accounts found engaging in unfair play may be banned</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Disconnect during games results in automatic loss</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Tournament disputes are resolved by admin review</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">7. Age Restrictions</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>General Play:</strong> Available for all ages</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Marble Purchases:</strong> Age 15+ only</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Players under 15 cannot purchase marbles with real money</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">8. Liability & Disputes</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>The platform is not responsible for connectivity issues during gameplay</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>All game results are final once recorded</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>For disputes, contact our support team with game details</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">9. Data Privacy</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Your profile data is private and secure</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>We never share personal information with third parties</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>See our Privacy Policy for complete details</span>
              </li>
            </ul>
          </section>

          <section className="pt-6 border-t border-primary/20">
            <p className="text-gray-300">
              By playing Kanche King, you agree to these Terms & Conditions. Violation of these rules may result in account suspension or permanent ban.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
