import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface FistDisplayProps {
  isOpen?: boolean;
  marbleCount?: number;
  label?: string;
}

export default function FistDisplay({
  isOpen = false,
  marbleCount = 0,
  label = "Hidden Marbles"
}: FistDisplayProps) {
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 1000);
    console.log("Fist clicked!");
  };

  const renderMarbles = () => {
    const marbles = [];
    const count = Math.min(marbleCount, 20);
    const colors = [
      { grad: "from-green-600 via-green-500 to-green-700", glow: "rgba(34, 197, 94, 0.8)" },
      { grad: "from-emerald-600 via-emerald-500 to-emerald-700", glow: "rgba(5, 150, 105, 0.8)" },
      { grad: "from-teal-600 via-teal-500 to-teal-700", glow: "rgba(20, 184, 166, 0.8)" },
      { grad: "from-cyan-600 via-cyan-500 to-cyan-700", glow: "rgba(34, 211, 238, 0.8)" },
      { grad: "from-lime-600 via-lime-500 to-lime-700", glow: "rgba(132, 204, 22, 0.8)" },
      { grad: "from-green-700 via-green-600 to-green-800", glow: "rgba(21, 128, 61, 0.8)" },
    ];

    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      marbles.push(
        <div
          key={i}
          className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full inline-block bg-gradient-to-br ${color.grad} transform transition-all animate-bounce relative shadow-md`}
          style={{
            boxShadow: `0 0 15px ${color.glow}, 0 4px 8px rgba(0,0,0,0.4), inset -2px -2px 5px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.3)`,
            animationDelay: `${i * 0.05}s`
          }}
        >
          <div
            className="absolute top-[20%] left-[25%] w-[28%] h-[28%] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent)"
            }}
          />
        </div>
      );
    }
    return marbles;
  };

  return (
    <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/40 shadow-xl">
      <CardContent className="p-4 sm:p-6 md:p-10 text-center">
        <h3
          className="text-lg sm:text-2xl md:text-3xl font-bold text-primary mb-2 sm:mb-4 uppercase tracking-wider"
          style={{ textShadow: '0 0 15px rgba(255,215,0,0.7)' }}
        >
          {label}
        </h3>
        
        {isOpen && marbleCount > 0 && (
          <div className="mb-3 sm:mb-6 flex flex-wrap justify-center gap-1.5 sm:gap-2 animate-in fade-in duration-500">
            {renderMarbles()}
          </div>
        )}

        <div
          className={`text-5xl sm:text-7xl md:text-8xl cursor-pointer transition-all duration-500 hover:scale-110 ${
            animate ? "animate-bounce scale-105" : "hover:scale-105"
          }`}
          onClick={handleClick}
          data-testid="fist-icon"
        >
          {isOpen ? "🖐️" : "✊"}
        </div>

        {marbleCount > 0 && !isOpen && (
          <div className="mt-2 sm:mt-4 text-base sm:text-xl font-bold text-[#00FF88]" style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>
            {marbleCount} marble{marbleCount !== 1 ? 's' : ''} hidden 🔒
          </div>
        )}
      </CardContent>
    </Card>
  );
}
