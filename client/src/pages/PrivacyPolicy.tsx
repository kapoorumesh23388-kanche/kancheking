import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black pt-24 pb-10">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
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
          <p className="text-muted-foreground">Last updated: November 2025</p>
        </div>

        {/* Content */}
        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 shadow-2xl">
          <CardContent className="p-8 space-y-8 text-justify">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Introduction</h2>
              <p className="text-base leading-relaxed">
                Kanche King ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Personal Information</h3>
                  <p>
                    We collect information you provide directly, including:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                    <li>Username and display name</li>
                    <li>Profile picture/avatar</li>
                    <li>Email address (if provided)</li>
                    <li>Age verification data (15+ for in-app purchases)</li>
                    <li>Gender preference for avatar customization</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Game Data</h3>
                  <p>
                    We automatically collect:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                    <li>Game statistics (wins, losses, games played)</li>
                    <li>Marble balances and transactions</li>
                    <li>Tournament participation and rankings</li>
                    <li>Chat messages during gameplay</li>
                    <li>Device information and IP address</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide and maintain our service</li>
                <li>To process payments for marble purchases</li>
                <li>To verify age eligibility for in-app purchases</li>
                <li>To track game statistics and rankings</li>
                <li>To enable multiplayer gameplay and tournaments</li>
                <li>To send service updates and promotional offers</li>
                <li>To improve user experience and fix bugs</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            {/* Age Restrictions */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Age Restrictions</h2>
              <p className="leading-relaxed">
                Kanche King is available to anyone who can count marbles. However, in-app purchases (marble transactions) are restricted to users aged 15+ who provide age verification. We do not knowingly collect personal information from children under 13 without parental consent.
              </p>
            </section>

            {/* Sharing of Information */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Sharing of Information</h2>
              <p className="leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share information only:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>With service providers who assist in operating our application</li>
                <li>For payment processing (with PCI-compliant processors)</li>
                <li>When required by law or government requests</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Cookies and Local Storage</h2>
              <p className="leading-relaxed">
                We use local storage and similar technologies to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Remember your login information</li>
                <li>Store game preferences and settings</li>
                <li>Track your marbles and game statistics</li>
                <li>Provide personalized gaming experience</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Your Rights</h2>
              <p className="leading-relaxed mb-4">
                Depending on your location, you may have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of promotional communications</li>
                <li>Data portability</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                To exercise these rights, please contact us at support@kancheking.com
              </p>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Third-Party Links</h2>
              <p className="leading-relaxed">
                Our application may contain links to third-party websites and services that are not operated by us. This Privacy Policy applies only to information we collect through our service. We are not responsible for the privacy practices of third-party services.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, and other factors. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date above.
              </p>
            </section>

            {/* Contact Us */}
            <section className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Contact Us</h2>
              <p className="leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> privacy@kancheking.com</p>
                <p><strong>Website:</strong> www.kancheking.com</p>
                <p className="text-sm text-muted-foreground mt-4">
                  This Privacy Policy was last updated November 2025.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
