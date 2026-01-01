import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Loader2, Share2, Link, MessageCircle, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AgeVerificationDialog from "@/components/AgeVerificationDialog";
import type { CatalogItem } from "@shared/schema";
import { getTotalMarbles, getRewardPoints, initializeMarbles, addMarbles } from "@/lib/marbleStorage";

// Generate unique referral code from player name
function generateReferralCode(name: string): string {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName || 'PLAYER'}${randomNum}`;
}

export default function Shop() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [marbleCount, setMarbleCount] = useState(0);
  const [pointCount, setPointCount] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [isAgeVerified, setIsAgeVerified] = useState(() => 
    localStorage.getItem("playerIsAgeVerified") === "true"
  );
  const [showAgeDialog, setShowAgeDialog] = useState(false);
  const userId = localStorage.getItem("userId") || "test-user";
  
  // Generate and persist unique referral code per player
  const [referralCode] = useState(() => {
    const storedCode = localStorage.getItem("playerReferralCode");
    if (storedCode) return storedCode;
    
    const playerName = localStorage.getItem("playerName") || "Player";
    const newCode = generateReferralCode(playerName);
    localStorage.setItem("playerReferralCode", newCode);
    return newCode;
  });
  
  // Track referral stats
  const referralCount = parseInt(localStorage.getItem("referralCount") || "0");
  const referralEarnings = referralCount * 50; // 50 marbles per referral
  
  // Get referral link
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

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
    { price: 10, marbles: 50, savings: 0 },
    { price: 20, marbles: 120, savings: 0 },
    { price: 50, marbles: 350, savings: 0 },
    { price: 100, marbles: 800, savings: 0 },
    { price: 200, marbles: 1800, savings: 0 },
    { price: 500, marbles: 5000, savings: 0 },
  ];

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };
  
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast({
      title: "Link Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };
  
  const shareViaWhatsApp = () => {
    const message = `Hey! Join me on Kanchey King - the classic marble game! Use my code ${referralCode} to get bonus marbles. Download now: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };
  
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Kanchey King!',
          text: `Play the classic marble game with me! Use code ${referralCode} for bonus marbles.`,
          url: referralLink,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        copyReferralLink();
      }
    } else {
      // Fallback for browsers without native share
      copyReferralLink();
    }
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
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create checkout session",
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

  // Handle payment success/cancel from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId) {
      // Verify payment and add marbles
      const verifyPayment = async () => {
        try {
          const res = await apiRequest("POST", "/api/marble-purchase/verify", {
            sessionId,
          });
          const data = await res.json();
          
          if (data.success && !data.alreadyProcessed) {
            updateStats();
            toast({
              title: "Payment Successful!",
              description: "Marbles have been added to your account!",
            });
          } else if (data.alreadyProcessed) {
            toast({
              title: "Already Processed",
              description: "This payment was already verified.",
            });
          }
        } catch (error) {
          console.error("Payment verification error:", error);
        }
        
        // Clean up URL params
        window.history.replaceState({}, '', '/shop');
      };
      
      verifyPayment();
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/shop');
    }
  }, []);

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
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-green-400" />
              Referral Program - Earn 50 Marbles per Friend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Friends Referred</p>
                <p className="text-3xl font-bold text-green-400" data-testid="text-referral-count">{referralCount}</p>
              </div>
              <div className="bg-yellow-500/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Marbles Earned</p>
                <p className="text-3xl font-bold text-yellow-400" data-testid="text-referral-earnings">{referralEarnings}</p>
              </div>
            </div>

            {/* Referral Code */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Your Unique Referral Code</p>
              <div className="bg-background rounded-lg p-4 flex items-center justify-between gap-2">
                <code className="text-xl font-mono font-bold text-primary tracking-wider" data-testid="text-referral-code">{referralCode}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyReferralCode}
                  className="gap-2"
                  data-testid="button-copy-referral"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? "Copied" : "Copy Code"}
                </Button>
              </div>
            </div>

            {/* Share Options */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">Share with friends</p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={shareViaWhatsApp}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                  data-testid="button-share-whatsapp"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                <Button
                  onClick={copyReferralLink}
                  variant="outline"
                  className="gap-2"
                  data-testid="button-copy-link"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                  {copiedLink ? "Copied!" : "Copy Link"}
                </Button>
                <Button
                  onClick={shareNative}
                  variant="secondary"
                  className="gap-2"
                  data-testid="button-share-native"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Referral Link Preview */}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Your Referral Link</p>
              <p className="text-sm font-mono text-muted-foreground truncate" data-testid="text-referral-link">{referralLink}</p>
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
