import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AgeVerificationDialog from "@/components/AgeVerificationDialog";
import type { CatalogItem } from "@shared/schema";
import { getTotalMarbles, getRewardPoints, initializeMarbles, addMarbles } from "@/lib/marbleStorage";

export default function Shop() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [marbleCount, setMarbleCount] = useState(0);
  const [pointCount, setPointCount] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [isAgeVerified, setIsAgeVerified] = useState(() => 
    localStorage.getItem("playerIsAgeVerified") === "true"
  );
  const [showAgeDialog, setShowAgeDialog] = useState(false);
  const referralCode = "RAJESH123";
  const userId = localStorage.getItem("userId") || "test-user";

  // Initialize marbles on first load
  useEffect(() => {
    initializeMarbles();
  }, []);

  // Real-time update of stats
  const updateStats = useCallback(() => {
    setMarbleCount(getTotalMarbles());
    setPointCount(getRewardPoints());
    setGamesWon(parseInt(localStorage.getItem("gamesWon") || "0"));
  }, []);

  // Update stats every 2 seconds for real-time display
  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 2000);
    
    const handleStorageChange = () => updateStats();
    window.addEventListener("storage", handleStorageChange);
    
    const handleAgeVerified = () => {
      setIsAgeVerified(true);
      toast({
        title: "Success",
        description: "Age verified! You can now purchase marbles.",
      });
    };
    window.addEventListener("ageVerified", handleAgeVerified);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("ageVerified", handleAgeVerified);
    };
  }, [toast, updateStats]);

  const { data: catalogItems = [], isLoading: isLoadingCatalog } = useQuery<CatalogItem[]>({
    queryKey: ["/api/catalog"],
  });

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

  const handleBuyMarbles = async (pack: typeof marblePacks[0]) => {
    if (!isAgeVerified) {
      setShowAgeDialog(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/marble-purchase", {
        userId,
        marblesCount: pack.marbles,
        amount: pack.price,
      });
      const data = await res.json();
      
      if (data.orderId && data.keyId) {
        // Initialize Razorpay checkout
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          handler: async (response: any) => {
            // Verify payment with backend
            const verifyRes = await apiRequest("POST", "/api/marble-purchase/verify", {
              userId,
              orderId: data.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              marblesCount: pack.marbles,
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              // Add marbles to the 'purchase' bucket for tournament eligibility
              addMarbles('purchase', pack.marbles);
              updateStats();
              toast({
                title: "Success!",
                description: `${pack.marbles} marbles added to your account!`,
              });
            } else {
              toast({
                title: "Error",
                description: verifyData.error || "Payment verification failed",
                variant: "destructive",
              });
            }
          },
          prefill: {
            name: localStorage.getItem("playerName") || "Player",
            contact: "9999999999",
          },
        };
        
        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          // @ts-ignore
          const rzp1 = new window.Razorpay(options);
          rzp1.open();
        };
        document.body.appendChild(script);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create order",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <AgeVerificationDialog 
        isOpen={showAgeDialog}
        onClose={() => setShowAgeDialog(false)}
        onVerified={() => {
          setShowAgeDialog(false);
          setIsAgeVerified(true);
        }}
      />
      <div className="container max-w-6xl mx-auto px-5">
        <h2 className="text-5xl font-bold text-primary mb-8 text-center" style={{ textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
          Shop & Marketplace
        </h2>

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
                <p className="text-3xl font-bold text-blue-500" data-testid="text-games-won">{gamesWon}</p>
              </div>
            </CardContent>
          </Card>
        </div>

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

        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">💎 Premium Catalog - Redeem with Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalogItems && catalogItems.length > 0 ? (
              catalogItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                    <p className="text-2xl font-bold text-purple-400">{item.pointsCost?.toLocaleString()} Points</p>
                    <p className="text-xs text-muted-foreground">Worth ~₹{(item.pointsCost || 0 / 10).toLocaleString()}</p>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                      disabled={pointCount < (item.pointsCost || 0)}
                      data-testid={`button-redeem-${item.id}`}
                    >
                      {pointCount >= (item.pointsCost || 0) ? "Redeem" : "Not Enough Points"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full bg-blue-500/10 border-blue-500/30">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-2">📦 No Premium Items Available</p>
                  <p className="text-sm text-muted-foreground">Check back when catalog updates quarterly with exclusive items!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

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
                  <Button 
                    onClick={() => handleBuyMarbles(pack)}
                    className="w-full"
                    disabled={isLoading}
                    data-testid={`button-buy-${pack.marbles}`}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {isAgeVerified ? "Buy Now" : "Verify Age to Buy"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-6">🎪 Points Catalog (Updated quarterly by admin)</h3>
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : catalogItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No items in catalog yet</p>
                  <p className="text-sm">Admin will add items each quarter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {catalogItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-primary/20">
                      <div>
                        <p className="font-semibold text-primary">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <p className="font-bold text-purple-400">{item.pointsCost?.toLocaleString()} pts</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
