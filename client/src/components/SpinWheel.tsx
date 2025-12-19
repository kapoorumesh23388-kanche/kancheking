import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface SpinWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onPrizeWon: (prize: Prize) => void;
}

interface Prize {
  id: string;
  name: string;
  value: number;
  type: "marbles" | "points" | "multiplier" | "voucher";
  color: string;
  icon: string;
}

const prizes: Prize[] = [
  { id: "1", name: "10 Marbles", value: 10, type: "marbles", color: "#FF6B6B", icon: "🔴" },
  { id: "2", name: "25 Marbles", value: 25, type: "marbles", color: "#4ECDC4", icon: "🟢" },
  { id: "3", name: "50 Points", value: 50, type: "points", color: "#45B7D1", icon: "⭐" },
  { id: "4", name: "2x Multiplier", value: 2, type: "multiplier", color: "#96CEB4", icon: "🎯" },
  { id: "5", name: "100 Points", value: 100, type: "points", color: "#FFEAA7", icon: "💫" },
  { id: "6", name: "₹20 Voucher", value: 20, type: "voucher", color: "#DDA0DD", icon: "🎟️" },
  { id: "7", name: "5 Marbles", value: 5, type: "marbles", color: "#98D8C8", icon: "🔵" },
  { id: "8", name: "₹50 Voucher", value: 50, type: "voucher", color: "#F7DC6F", icon: "🎫" },
];

export function SpinWheel({ isOpen, onClose, onPrizeWon }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowResult(false);
    setWonPrize(null);
    
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const segmentAngle = 360 / prizes.length;
    const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + (spins * 360) + targetAngle;
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(prizes[prizeIndex]);
      setShowResult(true);
      onPrizeWon(prizes[prizeIndex]);
    }, 4000);
  };

  const handleClose = () => {
    setRotation(0);
    setWonPrize(null);
    setShowResult(false);
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
                  `${p.color} ${i * (100/prizes.length)}% ${(i + 1) * (100/prizes.length)}%`
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
                    style={{
                      transform: `rotate(${angle}deg)`,
                    }}
                  >
                    <span 
                      className="text-2xl absolute" 
                      style={{ 
                        transform: `translateY(-100px) rotate(${-angle}deg)`,
                      }}
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
            <div className="text-center space-y-4 animate-bounce">
              <div className="text-5xl">{wonPrize?.icon}</div>
              <h3 className="text-2xl font-black text-[#00FF88]">
                You Won: {wonPrize?.name}!
              </h3>
              <p className="text-muted-foreground">
                {wonPrize?.type === "voucher" 
                  ? "Use this voucher on your next marble purchase!"
                  : wonPrize?.type === "multiplier"
                  ? "Your next win will be multiplied!"
                  : "Added to your account!"}
              </p>
              <Button
                onClick={handleClose}
                className="mt-4 bg-gradient-to-r from-[#00FF88] to-[#00C853] text-black font-bold"
                data-testid="button-claim-prize"
              >
                Claim Prize
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
