import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black pt-24 pb-10">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-6"
            data-testid="button-back-home"
          >
            â† Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-primary mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: June 2026</p>
        </div>

        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 shadow-2xl">
          <CardContent className="p-8 space-y-8 text-justify">

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Introduction</h2>
              <p className="text-base leading-relaxed">
                Kanche King ("we," "us," "our") is a free-to-play traditional Indian marble guessing game. We are committed to protecting your privacy. This Privacy Policy explains what data we collect, how we use it, and your rights regarding your information.
              </p>
              <p className="text-base leading-relaxed mt-3">
                Kanche King does not involve real money, gambling, or purchases of any kind. All marbles and rewards in the game are virtual and have no real-world monetary value.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Who Can Use This App</h2>
              <p className="leading-relaxed">
                Kanche King is suitable for all ages. Anyone who can count marbles can enjoy the game â€” children, teenagers, and adults. The game contains no adult content, real-money transactions, or gambling. Players under 13 should use the app with parental awareness.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Information You Provide</h3>
                  <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                    <li>Username and display name</li>
                    <li>Profile picture (optional, uploaded by you)</li>
                    <li>Phone number (used only for OTP login via Twilio, not stored permanently)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Game Data We Collect Automatically</h3>
                  <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                    <li>Game statistics â€” wins, losses, games played</li>
                    <li>Marble balances and in-game transactions</li>
                    <li>Reward Points earned and redeemed</li>
                    <li>Tournament participation and leaderboard ranking</li>
                    <li>Chat messages sent during gameplay</li>
                    <li>Device type and browser information (for app functionality)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">What We Do NOT Collect</h3>
                  <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                    <li>Email address â€” not required or collected</li>
                    <li>Payment information â€” no real-money transactions exist</li>
                    <li>Location data â€” not collected</li>
                    <li>Advertising interest data â€” we do not collect user interests for ad targeting</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide and maintain the game service</li>
                <li>To verify your identity via OTP login</li>
                <li>To track game statistics and leaderboard rankings</li>
                <li>To enable multiplayer gameplay and tournaments</li>
                <li>To improve user experience and fix bugs</li>
                <li>To manage Reward Points and marble balances</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                We do <strong>not</strong> use your data for advertising profiling, selling to third parties, or any commercial purpose beyond operating the game.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Local Storage</h2>
              <p className="leading-relaxed">We use local storage on your device to:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Remember your login session</li>
                <li>Store game preferences and settings</li>
                <li>Track your marbles and game statistics locally</li>
                <li>Provide a personalized gaming experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Sharing of Information</h2>
              <p className="leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share information only:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>With service providers who help operate our application (e.g., Twilio for OTP)</li>
                <li>When required by law or valid government requests</li>
                <li>To protect our rights and prevent fraud or abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical measures to protect your information against unauthorized access, alteration, or disclosure. No method of transmission over the Internet is 100% secure, but we make every effort to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Your Rights</h2>
              <p className="leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data held by us</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt out of any non-essential communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page with a new "Last updated" date.
              </p>
            </section>

            <section className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Contact Us</h2>
              <p className="leading-relaxed mb-4">
                If you have questions about this Privacy Policy, please contact us through our website:
              </p>
              <div className="space-y-2">
                <p><strong>Website:</strong> www.kancheking.com</p>
                <p className="text-sm text-muted-foreground mt-4">
                  This Privacy Policy was last updated June 2026.
                </p>
              </div>
            </section>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}


