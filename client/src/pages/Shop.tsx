import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export default function Shop() {
  const [copiedCode, setCopiedCode] = useState(false);
  const referralCode = "RAJESH123";
  const marbleCount = 1000;
  const pointCount = 250;

  const marblePacks = [
    { price: 10, marbles: 100, savings: 0 },
    { price: 20, marbles: 250, savings: 0 },
    { price: 30, marbles: 400, savings: 0 },
    { price: 40, marbles: 550, savings: 0 },
    { price: 50, marbles: 700, savings: 0 },
    { price: 100, marbles: 1500, savings: 0 },
  ];

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-6xl mx-auto px-5">
        <h2 className="text-5xl font-bold text-primary mb-8 text-center" style={{ textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
          Shop & Marketplace
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Available Marbles</p>
                <p className="text-3xl font-bold text-yellow-500">{marbleCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Redeemable Points</p>
                <p className="text-3xl font-bold text-purple-500">{pointCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Games Won</p>
                <p className="text-3xl font-bold text-blue-500">15</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Section */}
        <Card className="mb-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardHeader>
            <CardTitle>🎁 Referral Program - Earn 50 Marbles per Friend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <p className="text-muted-foreground mb-3">Share your referral code with friends. Get 50 marbles when they join!</p>
                <div className="bg-background rounded-lg p-4 flex items-center justify-between">
                  <code className="text-lg font-mono font-bold text-primary">{referralCode}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyReferralCode}
                    className="gap-2"
                    data-testid="button-copy-referral"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marble Packages */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">💎 Buy Marbles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marblePacks.map((pack) => (
              <Card key={pack.price} className="hover:shadow-lg transition-shadow border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center">₹{pack.price}/-</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-yellow-500 mb-4">{pack.marbles}</p>
                  <p className="text-muted-foreground mb-4">Marbles</p>
                  {pack.savings > 0 && (
                    <p className="text-sm text-green-500 font-semibold mb-4">Save {pack.savings}%</p>
                  )}
                  <Button className="w-full" data-testid={`button-buy-${pack.marbles}`}>
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Catalog */}
        <div>
          <h3 className="text-2xl font-bold mb-6">🎪 Points Catalog (Updated every 6 months)</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Gold Badge", points: 100 },
                  { name: "Premium Avatar", points: 150 },
                  { name: "Special Marble Skin", points: 200 },
                  { name: "Tournament Pass", points: 300 },
                  { name: "Elite Title", points: 250 },
                  { name: "Exclusive Theme", points: 400 },
                ].map((item) => (
                  <div key={item.name} className="border border-primary/20 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.points} points</p>
                    </div>
                    <Button size="sm" variant="outline" data-testid={`button-redeem-${item.name}`}>
                      Redeem
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
