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
          <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">1. Game Play Rules</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Each game requires players to hide marbles (1–20) in their fist.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Opponent must guess if the count is Odd or Even.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Correct guess wins the marbles; incorrect guess loses marbles.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Minimum marble bet: 10. Maximum bet: Your total marbles.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">2. Marble System</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Free Marbles (150):</strong> Given on signup. Used for gameplay only.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>PvP Win Marbles:</strong> Won by defeating other players. These are the only marbles that count for tournament eligibility and leaderboard ranking.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>AI Win Marbles:</strong> Earned by defeating AI opponents. Cannot be used for tournaments.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Ad Marbles:</strong> Earned by watching rewarded ads. Cannot be used for tournaments.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Points-Redeemed Marbles:</strong> Bought using Reward Points. Cannot be used for tournaments.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">3. Game Modes</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Play with AI:</strong> Earn AI Win Marbles and +25 Reward Points per win.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Challenge Friend / Random:</strong> Play PvP matches and earn PvP Win Marbles (+25 Reward Points per win).</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Tournament:</strong> Compete for 250,000 Reward Points. Requires 2,500 PvP Win Marbles to enter.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">4. Tournament Entry Requirements</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Entry Fee:</strong> 2,500 Marbles (deducted from your balance).</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Eligibility:</strong> You must have at least 2,500 PvP Win Marbles.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>NOT Counted:</strong> Free marbles, AI Win Marbles, Ad Marbles, and Points-redeemed marbles do not count toward eligibility.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Winner Prize:</strong> 250,000 Reward Points.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">5. Reward Points System</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Daily Login Bonus:</strong> +100 points just for logging in each day.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>10-Minute Active Play:</strong> +50 points after staying active for 10 minutes.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Hourly Playtime Bonus:</strong> +50 points for every full hour of active gameplay.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>AI Defeat Bonus:</strong> +25 points per AI opponent defeated.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>PvP Win Bonus:</strong> +25 points per PvP match won.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Monthly #1 Leaderboard Bonus:</strong> +500 points (see Section 6).</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Tournament Winner:</strong> +250,000 points.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">6. Leaderboard & Monthly #1 Bonus</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Ranking:</strong> Leaderboard rank is determined solely by the number of PvP Win Marbles a player has. Rankings update in real-time throughout the month.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Monthly #1 Bonus:</strong> On the 1st day of each month, the player holding Rank #1 at any point before 11:59:59 AM receives +500 Reward Points.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Eligibility for Bonus:</strong> The player must have at least 1 PvP Win Marble to qualify. Ties are resolved in favor of whoever achieved the count first.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>One Bonus Per Month:</strong> Each player can receive the Monthly #1 Bonus only once per calendar month.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">7. Shop & Rewards Redemption</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Watch Ads:</strong> Players can earn marbles by watching rewarded video ads. Multiple ad packs are available (1, 3, 5, or 10 ads).</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>No Cancel:</strong> Once an ad starts, it must be watched in full to receive the marble reward. There is no cancel/skip option during rewarded ads.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Points-to-Marbles:</strong> Reward Points can be redeemed to purchase marbles at fixed exchange rates in the Shop.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Catalog Items:</strong> Premium catalog items are updated quarterly by the admin and can be redeemed with Reward Points.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>No Real-Money Purchases:</strong> Marbles cannot be purchased with real money through this app.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">8. Points History & Transparency</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Players can view their full Reward Points earning history in the Shop → History tab.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Redemption history (points spent on marbles) is also recorded and visible.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>History logs store up to 200 entries per category.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">9. Referral Program</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Each player receives a unique referral code.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Earn 50 marbles for each new friend who joins using your referral code.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Referral bonuses are added as free marbles and cannot be used for tournament entry.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">10. Age Requirements</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Minimum age to play: 10 years.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Players under 10 years may not access the game.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">11. General Rules</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Cheating, exploiting bugs, or using third-party tools is strictly prohibited and will result in a permanent ban.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>The admin reserves the right to modify the game rules, rewards, and catalog at any time.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Reward Points have no cash value and cannot be transferred or withdrawn.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>By playing Kanchey King, you agree to these terms and conditions.</span></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
