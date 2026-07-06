import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface Prize {
  id: string;
  name: string;
  value: number;
  type: "marbles" | "points" | "none";
  color: string;
  icon: string;
}

interface SpinWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onPrizeWon?: (prize: Prize) => void;
  userId: string;
}

const prizes: Prize[] = [
  { id: "1", name: "5 Marbles", value: 5, type: "marbles", color: "#98D8C8", icon: "🔵" },
  { id: "2", name: "10 Marbles", value: 10, type: "marbles", color: "#FF6B6B", icon: "🔴" },
  { id: "3", name: "25 Marbles", value: 25, type: "marbles", color: "#4ECDC4", icon: "🟢" },
  { id: "4", name: "50 Points", value: 50, type: "points", color: "#45B7D1", icon: "⭐" },
  { id: "5", name: "100 Points", value: 100, type: "points", color: "#FFEAA7", icon: "💫" },
  { id: "6", name: "3x Marbles!", value: 30, type: "marbles", color: "#96CEB4", icon: "🎯" },
  { id: "7", name: "5x Marbles!", value: 50, type: "marbles", color: "#DDA0DD", icon: "💎" },
  { id: "8", name: "2x Points!", value: 100, type: "points", color: "#F7DC6F", icon: "✨" },
  { id: "9", name: "3x Points!", value: 150, type: "points", color: "#FFB6C1", icon: "🌟" },
  { id: "10", name: "Better Luck Next Time", value: 0, type: "none", color: "#8899AA", icon: "😔" },
  { id: "11", name: "Better Luck Next Time", value: 0, type: "none", color: "#778899", icon: "🍀" },
];

export function SpinWheel({ isOpen, onClose, onPrizeWon, userId }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [rewardId, setRewardId] = useState<string | null>(null);
  const [claimState, setClaimState] = useState<"idle" | "claiming" | "claimed">("idle");
  const [newBalance, setNewBalance] = useState<{ marbles?: number; points?: number } | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    setWonPrize(null);
    setRewardId(null);
    setClaimState("idle");
    setNewBalance(null);

    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const segmentAngle = 360 / prizes.length;
    const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + (spins * 360) + targetAngle;

    setRotation(finalRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      const prize = prizes[prizeIndex];
      setWonPrize(prize);
      setShowResult(true);

      // Record the win on the server as PENDING — nothing is credited yet.
      try {
        const res = await fetch("/api/spin/win", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            prizeName: prize.name,
            prizeType: prize.type,
            prizeValue: prize.value,
          }),
        });
        const data = await res.json();
        if (data.reward) setRewardId(data.reward.id);
      } catch (err) {
        console.error("Failed to record spin win:", err);
      }

      if (onPrizeWon) onPrizeWon(prize);
    }, 4000);
  };

  const handleClaim = async () => {
    if (!rewardId || claimState !== "idle") return;
    setClaimState("claiming");
    try {
      const res = await fetch(`/api/spin/claim/${rewardId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimState("claimed");
        setNewBalance({ marbles: data.user.marbles, points: data.user.points });
      } else {
        setClaimState("idle");
        alert(data.error || "Could not claim reward. Try again.");
      }
    } catch (err) {
      console.error("Claim failed:", err);
      setClaimState("idle");
      alert("Network error while claiming. Try again.");
    }
  };

  const handleClose = () => {
    setRotation(0);
    setWonPrize(null);
    setShowResult(false);
    setRewardId(null);
    setClaimState("idle");
    setNewBalance(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-b from-primary/20 to-black border-4 border-primary max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-black text-primary" style={{ textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
            🎰 Victory Spin Wheel 🎰
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <div className="relative w-72 h-72 mb-6">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
            </div>

            <motion.div
              ref={wheelRef}
              className="w-full h-full rounded-full border-8 border-primary shadow-2xl overflow-hidden"
              style={{
                background: `conic-gradient(${prizes.map((p, i) =>
                  `${p.color} ${i * (100 / prizes.length)}% ${(i + 1) * (100 / prizes.length)}%`
                ).join(', ')})`,
              }}
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: "easeOut" }}
            >
              {prizes.map((prize, index) => {
                const angle = (index * 360) / prizes.length + (180 / prizes.length);
                return (
                  <div
                    key={prize.id}
                    className="absolute w-full h-full flex items-center justify-center"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <span
                      className="text-2xl absolute"
                      style={{ transform: `translateY(-100px) rotate(${-angle}deg)` }}
                    >
                      {prize.icon}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {!showResult ? (
            <Button
              onClick={spinWheel}
              disabled={isSpinning}
              className="w-full max-w-xs bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-black font-bold py-6 text-xl"
              data-testid="button-spin-wheel"
            >
              {isSpinning ? "🎰 Spinning..." : "🎯 SPIN TO WIN!"}
            </Button>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-5xl">{wonPrize?.icon}</div>
              <h3 className="text-2xl font-black text-[#00FF88]">
                {wonPrize?.type === "none" ? wonPrize?.name : `You Won: ${wonPrize?.name}!`}
              </h3>

              {wonPrize?.type === "none" ? (
                <Button
                  onClick={handleClose}
                  className="mt-4 bg-gradient-to-r from-primary to-[#FFA500] text-black font-bold"
                  data-testid="button-close-no-prize"
                >
                  Close
                </Button>
              ) : claimState === "claimed" ? (
                <>
                  <p className="text-[#00FF88] font-bold">
                    ✅ Claimed! Your {wonPrize?.type === "marbles" ? "marbles" : "points"} balance is now{" "}
                    {wonPrize?.type === "marbles" ? newBalance?.marbles : newBalance?.points}.
                  </p>
                  <Button
                    onClick={handleClose}
                    className="mt-2 bg-gradient-to-r from-[#00FF88] to-[#00C853] text-black font-bold"
                    data-testid="button-close-after-claim"
                  >
                    Close
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm">
                    Your prize is saved. Claim it now, or claim it later from your Profile page.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={handleClaim}
                      disabled={claimState === "claiming" || !rewardId}
                      className="bg-gradient-to-r from-[#00FF88] to-[#00C853] text-black font-bold"
                      data-testid="button-claim-prize"
                    >
                      {claimState === "claiming" ? "Claiming..." : "Claim Now"}
                    </Button>
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      data-testid="button-claim-later"
                    >
                      Claim Later
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
