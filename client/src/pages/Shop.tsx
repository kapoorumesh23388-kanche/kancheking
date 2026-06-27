import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Share2, Link, MessageCircle, Users, Tv, Gift, ShoppingBag, History, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { CatalogItem } from "@shared/schema";
import {
  getTotalMarbles,
  getRewardPoints,
  initializeMarbles,
  addMarbles,
  buyMarblesWithPoints,
} from "@/lib/marbleStorage";
import {
  getRedemptionHistory,
  addRedemptionHistoryEntry,
  getPointsHistory,
  type PointsHistoryEntry,
  type RedemptionHistoryEntry,
} from "@/lib/rewardsStorage";

function generateReferralCode(name: string): string {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName || "PLAYER"}${randomNum}`;
}

// Ad packs — player must watch ALL ads to earn marbles; no cancel button
const AD_PACKS = [
  { id: "ad1", adsCount: 1, marbles: 15, label: "Watch 1 Ad → 15 Marbles" },
  { id: "ad2", adsCount: 3, marbles: 40, label: "Watch 3 Ads → 40 Marbles" },
  { id: "ad3", adsCount: 5, marbles: 75, label: "Watch 5 Ads → 75 Marbles" },
  { id: "ad4", adsCount: 10, marbles: 170, label: "Watch 10 Ads → 170 Marbles" },
];

// Marble packs buyable with reward points
const MARBLE_PACKS_POINTS = [
  { points: 500, marbles: 50 },
  { points: 900, marbles: 100 },
  { points: 2000, marbles: 250 },
  { points: 5000, marbles: 700 },
  { points: 10000, marbles: 1600 },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const POINT_TYPE_LABELS: Record<PointsHistoryEntry["type"], string> = {
  daily_login: "🌅 Daily Login Bonus",
  hourly_play: "⏱️ Play Time Reward",
  ai_defeat: "🤖 AI Defeat Bonus",
  tournament_win: "🏆 Tournament Win",
  leaderboard_bonus: "👑 Monthly #1 Bonus",
  pvp_win: "⚔️ PvP Win Bonus",
};

export default function Shop() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [marbleCount, setMarbleCount] = useState(0);
  const [pointCount, setPointCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"ads" | "points" | "referral" | "catalog" | "history">("ads");
  const [adWatchState, setAdWatchState] = useState<{
    packId: string | null;
    adsWatched: number;
    adsTotal: number;
    marblesReward: number;
    watching: boolean;
    countdown: number;
    breakCountdown: number;
  }>({ packId: null, adsWatched: 0, adsTotal: 0, marblesReward: 0, watching: false, countdown: 30, breakCountdown: 0 });
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryEntry[]>([]);
  // OTP Modal state
  const [otpModal, setOtpModal] = useState<{ open: boolean; item: any | null }>({ open: false, item: null });
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionHistoryEntry[]>([]);

  const [referralCode] = useState(() => {
    const storedCode = localStorage.getItem("playerReferralCode");
    if (storedCode) return storedCode;
    const playerName = localStorage.getItem("playerName") || "Player";
    const newCode = generateReferralCode(playerName);
    localStorage.setItem("playerReferralCode", newCode);
    return newCode;
  });

  const referralCount = parseInt(localStorage.getItem("referralCount") || "0");
  const referralEarnings = referralCount * 50;
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  useEffect(() => {
    initializeMarbles();
  }, []);

  const updateStats = useCallback(() => {
    setMarbleCount(getTotalMarbles());
    setPointCount(getRewardPoints());
    setPointsHistory(getPointsHistory());
    setRedemptionHistory(getRedemptionHistory());
  }, []);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 2000);
    window.addEventListener("storage", updateStats);
    window.addEventListener("rewardPointsUpdate", updateStats);
    window.addEventListener("marbleUpdate", updateStats);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", updateStats);
      window.removeEventListener("rewardPointsUpdate", updateStats);
      window.removeEventListener("marbleUpdate", updateStats);
    };
  }, [updateStats]);

  const { data: catalogItems = [] } = useQuery<CatalogItem[]>({ queryKey: ["/api/catalog"] });

  // --- Ad watching logic ---
  const startWatchingAds = (pack: typeof AD_PACKS[0]) => {
    setAdWatchState({
      packId: pack.id,
      adsWatched: 0,
      adsTotal: pack.adsCount,
      marblesReward: pack.marbles,
      watching: true,
      countdown: 30,
    });
    startSingleAd();
  };

  const startSingleAd = () => {
    // Each ad is 30 seconds; no cancel allowed
    setAdWatchState((prev) => ({ ...prev, countdown: 30 }));
  };

  useEffect(() => {
    if (!adWatchState.watching) return;

    if (adWatchState.countdown > 0) {
      const timer = setTimeout(() => {
        setAdWatchState((prev) => ({ ...prev, countdown: prev.countdown - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Ad finished
      const nextWatched = adWatchState.adsWatched + 1;
      if (nextWatched >= adWatchState.adsTotal) {
        // All ads done — reward marbles
        addMarbles("ads", adWatchState.marblesReward);
        toast({
          title: "🎉 Ads Complete!",
          description: `You earned ${adWatchState.marblesReward} marbles!`,
        });
        setAdWatchState({ packId: null, adsWatched: 0, adsTotal: 0, marblesReward: 0, watching: false, countdown: 30 });
      } else {
        // Next ad — add 7 sec break between ads (AdMob policy)
        setAdWatchState((prev) => ({ ...prev, adsWatched: nextWatched, countdown: 0, breakCountdown: 7 }));
      }
    }
  }, [adWatchState.watching, adWatchState.countdown]);

  // Break timer between ads
  useEffect(() => {
    if (!adWatchState.watching || adWatchState.breakCountdown <= 0) return;
    const timer = setTimeout(() => {
      if (adWatchState.breakCountdown === 1) {
        // Break over — start next ad
        setAdWatchState((prev) => ({ ...prev, breakCountdown: 0, countdown: 30 }));
      } else {
        setAdWatchState((prev) => ({ ...prev, breakCountdown: prev.breakCountdown - 1 }));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [adWatchState.watching, adWatchState.breakCountdown]);

  // --- OTP Redeem handlers ---
  const handleSendOTP = async () => {
    if (!otpEmail || !otpEmail.includes("@")) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setOtpLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        toast({ title: "OTP Sent!", description: `Check your email: ${otpEmail}` });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send OTP", variant: "destructive" });
    }
    setOtpLoading(false);
  };

  const handleVerifyAndRedeem = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit OTP.", variant: "destructive" });
      return;
    }
    setOtpLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch("/api/otp/verify-redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp: otpCode, userId, itemId: otpModal.item?.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Redeemed! 🎉", description: `${otpModal.item?.name} redeemed successfully!` });
        setOtpModal({ open: false, item: null });
        setOtpEmail(""); setOtpCode(""); setOtpSent(false);
      } else {
        toast({ title: "Failed", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to redeem", variant: "destructive" });
    }
    setOtpLoading(false);
  };

  // --- Buy marbles with points ---
  const handleBuyWithPoints = (pack: typeof MARBLE_PACKS_POINTS[0]) => {
    if (pointCount < pack.points) {
      toast({ title: "Not enough points", description: `You need ${pack.points} points.`, variant: "destructive" });
      return;
    }
    const success = buyMarblesWithPoints(pack.marbles, pack.points);
    if (success) {
      addRedemptionHistoryEntry({
        date: new Date().toISOString(),
        type: "marble_purchase",
        pointsSpent: pack.points,
        marblesReceived: pack.marbles,
        description: `Bought ${pack.marbles} marbles for ${pack.points} points`,
      });
      updateStats();
      toast({ title: "✅ Purchase Successful!", description: `${pack.marbles} marbles added to your account.` });
    }
  };

  // --- Referral actions ---
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast({ title: "Link Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const message = `Hey! Join me on Kanchey King - the classic marble game! Use my code ${referralCode} to get bonus marbles. Download now: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join Kanchey King!", text: `Play the classic marble game! Use code ${referralCode}`, url: referralLink });
      } catch {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const tabs = [
    { id: "ads", label: "Watch Ads", icon: <Tv className="w-4 h-4" /> },
    { id: "points", label: "Redeem Points", icon: <Gift className="w-4 h-4" /> },
    { id: "catalog", label: "Catalog", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "referral", label: "Referral", icon: <Users className="w-4 h-4" /> },
    { id: "history", label: "History", icon: <History className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-primary mb-2 text-center" style={{ textShadow: "0 0 20px rgba(255,215,0,0.5)" }}>
          Shop & Rewards
        </h2>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-muted-foreground text-sm">🪨 Marbles</p>
              <p className="text-2xl font-bold text-yellow-400">{marbleCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-muted-foreground text-sm">⭐ Reward Points</p>
              <p className="text-2xl font-bold text-purple-400">{pointCount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Ad Watch Modal */}
        {adWatchState.watching && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <Card className="w-full max-w-sm mx-4 bg-gradient-to-b from-[#1a0a2e] to-[#0d0416] border-2 border-[#00D9FF]/50">
              <CardHeader>
                <CardTitle className="text-center text-[#00D9FF]">
                  📺 Watching Ad {adWatchState.adsWatched + 1} of {adWatchState.adsTotal}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="relative mx-auto w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff20" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke="#00D9FF" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (adWatchState.countdown / 30)}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s linear" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {adWatchState.breakCountdown > 0 ? (
                      <span className="text-2xl font-bold text-yellow-400">⏳{adWatchState.breakCountdown}</span>
                    ) : (
                      <span className="text-3xl font-bold text-white">{adWatchState.countdown}</span>
                    )}
                  </div>
                </div>
                <div className="bg-black/40 rounded-xl p-4 flex items-center justify-center" style={{ minHeight: 120 }}>
                  <p className="text-[#00D9FF]/70 text-sm">[ Ad Playing... ]</p>
                </div>
                <p className="text-yellow-400 font-semibold">
                  Reward: {adWatchState.marblesReward} marbles after all ads
                </p>
                <div className="flex gap-2 justify-center">
                  {Array.from({ length: adWatchState.adsTotal }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${i < adWatchState.adsWatched ? "bg-green-400" : i === adWatchState.adsWatched ? "bg-[#00D9FF] animate-pulse" : "bg-white/20"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">⚠️ You must watch all ads to receive marbles.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab nav */}
        <div className="flex gap-1 mb-6 bg-black/30 p-1 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Watch Ads Tab */}
        {activeTab === "ads" && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-muted-foreground text-sm">Watch ads to earn free marbles. You must watch every ad — no skipping!</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AD_PACKS.map((pack) => (
                <Card key={pack.id} className="border-[#00D9FF]/30 bg-gradient-to-br from-[#00D9FF]/10 to-transparent">
                  <CardContent className="pt-5 pb-5 text-center space-y-3">
                    <div className="text-4xl">📺</div>
                    <p className="font-bold text-lg text-[#00D9FF]">{pack.label}</p>
                    <p className="text-sm text-muted-foreground">{pack.adsCount} × 30s ads</p>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40">
                      +{pack.marbles} Marbles
                    </Badge>
                    <Button
                      className="w-full bg-gradient-to-r from-[#00D9FF] to-[#E91E8C] font-bold"
                      onClick={() => startWatchingAds(pack)}
                    >
                      Watch Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Redeem Points Tab */}
        {activeTab === "points" && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-muted-foreground text-sm">
                Use your Reward Points to buy marbles. Your balance: <span className="text-purple-400 font-bold">{pointCount.toLocaleString()} pts</span>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MARBLE_PACKS_POINTS.map((pack) => (
                <Card key={pack.points} className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
                  <CardContent className="pt-5 pb-5 text-center space-y-3">
                    <div className="text-4xl">💎</div>
                    <p className="text-2xl font-bold text-yellow-400">{pack.marbles} Marbles</p>
                    <p className="text-purple-400 font-semibold">{pack.points.toLocaleString()} Points</p>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold"
                      disabled={pointCount < pack.points}
                      onClick={() => handleBuyWithPoints(pack)}
                    >
                      {pointCount >= pack.points ? "Redeem" : "Need More Points"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Catalog Tab */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-muted-foreground text-sm">Exclusive items redeemable with Reward Points. Updated quarterly by admin.</p>
            </div>
            {catalogItems.length === 0 ? (
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="pt-6 text-center py-10">
                  <p className="text-muted-foreground mb-2">📦 No Premium Items Available</p>
                  <p className="text-sm text-muted-foreground">Check back when catalog updates quarterly!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catalogItems.map((item) => (
                  <Card key={item.id} className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-3">
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                      <p className="text-2xl font-bold text-purple-400">{item.pointsCost?.toLocaleString()} Points</p>
                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold"
                        disabled={pointCount < (item.pointsCost || 0)}
                        data-testid={`button-redeem-${item.id}`}
                        onClick={() => { if (pointCount >= (item.pointsCost || 0)) { setOtpModal({ open: true, item }); setOtpSent(false); setOtpCode(""); setOtpEmail(""); } }}
                      >
                        {pointCount >= (item.pointsCost || 0) ? "Redeem" : "Not Enough Points"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OTP Redemption Modal */}
        {otpModal.open && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-purple-500/50 rounded-xl p-6 w-full max-w-md space-y-4">
              <h2 className="text-xl font-bold text-purple-400 text-center">🔐 Verify to Redeem</h2>
              <p className="text-center text-sm text-gray-300">Redeeming: <strong>{otpModal.item?.name}</strong></p>
              <p className="text-center text-purple-400 font-bold">{otpModal.item?.pointsCost?.toLocaleString()} Points</p>
              {!otpSent ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Enter your email to receive OTP:</p>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={otpEmail}
                    onChange={e => setOtpEmail(e.target.value)}
                    className="bg-gray-800 border-purple-500/30"
                  />
                  <Button onClick={handleSendOTP} disabled={otpLoading} className="w-full bg-purple-600 hover:bg-purple-700">
                    {otpLoading ? "Sending..." : "Send OTP"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Enter the 6-digit OTP sent to <strong>{otpEmail}</strong>:</p>
                  <Input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="bg-gray-800 border-purple-500/30 text-center text-2xl tracking-widest"
                  />
                  <Button onClick={handleVerifyAndRedeem} disabled={otpLoading} className="w-full bg-green-600 hover:bg-green-700">
                    {otpLoading ? "Verifying..." : "Verify & Redeem"}
                  </Button>
                  <button onClick={handleSendOTP} className="text-xs text-purple-400 underline w-full text-center">Resend OTP</button>
                </div>
              )}
              <Button variant="outline" onClick={() => setOtpModal({ open: false, item: null })} className="w-full">Cancel</Button>
            </div>
          </div>
        )}

        {/* Referral Tab */}}
        {activeTab === "referral" && (
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-green-400" />
                Referral Program — Earn 50 Marbles per Friend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
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
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your Unique Referral Code</p>
                <div className="bg-background rounded-lg p-4 flex items-center justify-between gap-2">
                  <code className="text-xl font-mono font-bold text-primary tracking-wider" data-testid="text-referral-code">{referralCode}</code>
                  <Button size="sm" variant="outline" onClick={copyReferralCode} className="gap-2" data-testid="button-copy-referral">
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCode ? "Copied" : "Copy Code"}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={shareViaWhatsApp} className="bg-green-600 hover:bg-green-700 gap-2" data-testid="button-share-whatsapp">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </Button>
                <Button onClick={copyReferralLink} variant="outline" className="gap-2" data-testid="button-copy-link">
                  {copiedLink ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                  {copiedLink ? "Copied!" : "Copy Link"}
                </Button>
                <Button onClick={shareNative} variant="secondary" className="gap-2" data-testid="button-share-native">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Your Referral Link</p>
                <p className="text-sm font-mono text-muted-foreground truncate" data-testid="text-referral-link">{referralLink}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-6">
            {/* Points History */}
            <Card className="border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Clock className="w-5 h-5" /> Points Earned History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pointsHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No points earned yet. Play to start earning!</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {pointsHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2">
                        <div>
                          <p className="font-semibold text-sm">{POINT_TYPE_LABELS[entry.type] || entry.type}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                          <p className="text-xs text-muted-foreground/70">{entry.description}</p>
                        </div>
                        <span className="text-green-400 font-bold text-lg">+{entry.points}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Redemption History */}
            <Card className="border-yellow-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <History className="w-5 h-5" /> Points Redemption History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {redemptionHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No redemptions yet. Use points to buy marbles!</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {redemptionHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2">
                        <div>
                          <p className="font-semibold text-sm">🪨 {entry.marblesReceived} Marbles</p>
                          <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                          <p className="text-xs text-muted-foreground/70">{entry.description}</p>
                        </div>
                        <span className="text-red-400 font-bold text-lg">-{entry.pointsSpent} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
