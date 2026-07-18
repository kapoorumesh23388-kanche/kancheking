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
            ← Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-primary mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: July 2026</p>
        </div>

        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 shadow-2xl">
          <CardContent className="p-8 space-y-8 text-justify">

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Introduction</h2>
              <p className="text-base leading-relaxed">
                Kanche King is a free-to-play version of the traditional Indian marble guessing game most of us grew up playing in our lanes and school breaks — Kali Jotta. This page explains, in plain language, what information we collect when you play, why we collect it, and what say you have over it.
              </p>
              <p className="text-base leading-relaxed mt-3">
                There's no real money anywhere in this game. Marbles, Reward Points, and everything else you earn are purely virtual — they can't be bought with cash, cashed out, or transferred outside the app.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Who This App Is For</h2>
              <p className="leading-relaxed">
                Kanche King works for pretty much any age group. That said, creating an account requires verifying an email address and a date of birth, and we treat 18 as our minimum age for creating an account — this game is intended for adults, and parents or guardians should not create accounts on behalf of a minor.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">What You Give Us Directly</h3>
                  <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                    <li><strong>Email address</strong> — this is how you log in. We send a one-time OTP to this address every time you sign in, so we don't store passwords at all.</li>
                    <li>Display name, gender selection, and date of birth (used only to verify you meet our minimum age and personalize your avatar)</li>
                    <li>A profile picture, if you choose to upload one</li>
                    <li>Anything you type into feedback, support, or in-game chat messages</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">What We Track While You Play</h3>
                  <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                    <li>Marble and Reward Point balances, and the history of how you earned or spent them</li>
                    <li>Wins, losses, games played, and your leaderboard standing</li>
                    <li>Tournament entries and results</li>
                    <li>Spin Wheel prizes you've won and claimed</li>
                    <li>Which ad-reward packs you've claimed and when (this resets daily)</li>
                    <li>Basic device and browser details, mainly to catch bugs and keep the app running smoothly</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">What We Deliberately Don't Touch</h3>
                  <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                    <li>We never ask for or store any payment details — there's nothing to buy in Kanche King</li>
                    <li>We don't track your physical location</li>
                    <li>We don't build advertising profiles based on your interests or browsing elsewhere</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">How We Use This Information</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To send your login OTP and confirm it's really you signing in</li>
                <li>To send a confirmation OTP when you redeem Reward Points for a catalog item, so nobody can redeem your rewards but you</li>
                <li>To keep your marbles, points, and match history accurate and tied to your account rather than just your browser</li>
                <li>To run multiplayer matches, tournaments, and the leaderboard</li>
                <li>To email you if you submit feedback or a support request, and occasionally to reply to it</li>
                <li>To notice when something's broken and fix it</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                That's the whole list. We're not in the business of selling data or building ad profiles — Kanche King makes no money from what you tell us, so there's no incentive for us to do anything with it beyond running the game well.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Local Storage on Your Device</h2>
              <p className="leading-relaxed">Alongside our servers, your browser keeps a small amount of information locally, so the app feels fast and remembers who you are between visits:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Your login session, so you're not asked to verify your OTP every single time</li>
                <li>Display preferences like your chosen language and sound settings</li>
                <li>A cached copy of your marble/point balance for instant display — the real, official number always lives on our server, and this local copy is refreshed from there automatically</li>
              </ul>
              <p className="leading-relaxed mt-3">
                If you clear your browser's storage, you won't lose your account or your progress — everything that matters is saved against your email on our server. You'll just need to log back in with a fresh OTP.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Who We Share Information With</h2>
              <p className="leading-relaxed mb-4">
                We don't sell or rent your information to anyone. A short list of outside services helps us actually run the app, and they only see what's strictly needed to do their job:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Resend</strong> — delivers our login and redemption OTP emails</li>
                <li><strong>Twilio</strong> — used only for the admin panel's login, not for regular players</li>
                <li>Our hosting and database providers, who store the app and its data securely</li>
                <li>Law enforcement or government bodies, but only if we're legally required to respond to a valid request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Data Security</h2>
              <p className="leading-relaxed">
                We don't store passwords at all — logins work entirely through one-time codes sent to your email, so there's no password for anyone to steal in the first place. Sensitive actions, like redeeming Reward Points, require a fresh OTP confirmation too. That said, no system connected to the internet is perfectly unbreakable, and we keep improving things as we go.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Your Rights</h2>
              <p className="leading-relaxed mb-4">You can, at any point:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ask us what data we hold against your account</li>
                <li>Ask us to correct something that's wrong</li>
                <li>Ask us to delete your account and everything tied to it</li>
                <li>Stop us from emailing you anything beyond essential OTPs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Changes to This Policy</h2>
              <p className="leading-relaxed">
                As Kanche King grows and we add new features, this page will change to match. Whenever we make a meaningful update, we'll update the date at the top, so you can always tell when something last shifted.
              </p>
            </section>

            <section className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Reach Us</h2>
              <p className="leading-relaxed mb-4">
                Questions about any of this, or want your data removed? Use the Feedback or Support page inside the app — those go straight to us.
              </p>
              <div className="space-y-2">
                <p><strong>Website:</strong> www.kancheking.com</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Last updated July 2026.
                </p>
              </div>
            </section>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
