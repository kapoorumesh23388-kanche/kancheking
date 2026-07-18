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
            <h2 className="text-2xl font-bold text-primary mb-4">1. Logging In</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Every player signs in with their email address. We send a 6-digit one-time code (OTP) to that inbox, and entering it logs you in — there's no password to create or remember.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>New players are asked for a display name, gender for their avatar, and date of birth right after verifying their OTP, before an account is created.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Your account, marbles, and progress are tied to your email — not to a specific phone or browser — so clearing your browser data or switching devices won't wipe your progress as long as you can access that inbox.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Redeeming Reward Points for a catalog item requires a second, separate OTP sent to your email at the time of redemption, as an extra confirmation step.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">2. Age Requirements</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Kanche King is intended for players aged <strong>18 and above</strong>. We ask for your date of birth during signup to confirm this.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>By creating an account, you're confirming that you are 18 or older.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>There is no real money, gambling, or wagering anywhere in Kanche King. It's a traditional Indian marble-guessing game — Kali Jotta — built around skill and a bit of luck, nothing more.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">3. How a Round Works</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>One player hides a handful of marbles (anywhere from 1 to 20) in a closed fist.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>The other player guesses whether that count is Odd (Kali) or Even (Jotta).</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Guess right, and the marbles wagered that round come to you. Guess wrong, and they go the other way.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>You choose how many marbles to wager each round, up to whatever you currently have.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">4. Marbles — What Counts Where</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Every new account starts with 150 free marbles to play with.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>PvP Win Marbles</strong> — earned only by beating other real players — are the ones that count toward tournament eligibility and your leaderboard rank.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Marbles earned by beating the AI, watching ads, or converting Reward Points are great for continuing to play, but they don't move your leaderboard rank or unlock tournament entry.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>None of this has any real-world money value. Marbles can't be bought with cash and can't be cashed out.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">5. Playing Against the AI</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Your AI opponent starts at 150 marbles and grows stronger the more you beat it — the first time you fully defeat it, it comes back next time with 200; every defeat after that adds another 100.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>If the AI beats you instead, it simply keeps whatever it won and starts your next match at that level — think of it as a rival that remembers, rather than resetting every time.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>This difficulty is personal to your account — other players face their own version of the AI, growing at their own pace.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Fully defeating the AI opens the Victory Spin Wheel for a bonus prize (see Section 8).</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">6. Tournaments</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Entering a tournament costs 250 PvP Win Marbles — this comes only from marbles won against real players, nothing else.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Whatever you win from opponents during the tournament stays in your account regardless of how far you go.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>The tournament winner receives the full accumulated entry pool as marbles, plus a flat 2,500 Reward Points.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">7. Reward Points</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Daily login:</strong> +20 points just for showing up each day.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Active play:</strong> +30 points after 30 minutes of genuinely playing (completing rounds — not just leaving the tab open), and +50 more at the one-hour mark. This keeps repeating every half hour you're actively playing.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Beating the AI:</strong> +25 points each time.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Winning a PvP match:</strong> +25 points; losing one costs 5 points from that match's tally.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Monthly #1 on the leaderboard:</strong> +500 points, awarded to whoever holds rank #1 at the start of the month.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span><strong>Winning a tournament:</strong> +2,500 points.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">8. The Victory Spin Wheel</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Fully defeating an opponent — AI or player — unlocks a spin for a bonus prize: extra marbles, bonus points, or better luck next time.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>You can claim your prize immediately or leave it for later — unclaimed prizes wait for you in your Profile page under "Unclaimed Rewards" until you come back for them.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>A prize only actually lands in your account once you claim it — spinning the wheel alone doesn't credit anything.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">9. Watching Ads for Marbles</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Four ad packs are available in the Shop, each watched fully (no skipping) in exchange for marbles.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Each of the four packs can be claimed once per calendar day — this resets at midnight.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>A short pause is built in between ads within a pack, in line with ad network policies.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">10. Shop & Redeeming Rewards</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Reward Points can be converted into marbles at fixed rates directly in the Shop.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Premium catalog items, refreshed periodically by the admin team, can be redeemed with Reward Points — this requires confirming a one-time code sent to your email before the redemption goes through.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Everything in the Shop runs on Reward Points and marbles only. There is no way to spend real money in Kanche King.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">11. Leaderboard</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Ranking is based purely on PvP Win Marbles and updates roughly every ten seconds.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>The board shows the current top 20 players; your own rank and marble count are always shown separately, even if you're outside the top 20.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">12. Referrals</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Every player gets a personal referral code to share.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>When someone joins using your code, you receive 50 marbles as a thank-you.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">13. Fair Play</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex gap-3"><span className="text-primary">•</span><span>Exploiting bugs, using bots, or manipulating the app to earn marbles or points outside of genuine gameplay isn't allowed, and accounts found doing this may be suspended or banned.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>We may adjust rules, rewards, or the catalog as the game evolves — this page will always reflect the current version.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Reward Points and marbles exist only inside Kanche King. They can't be transferred, sold, or withdrawn as cash.</span></li>
              <li className="flex gap-3"><span className="text-primary">•</span><span>Playing Kanche King means you're agreeing to the terms on this page.</span></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
