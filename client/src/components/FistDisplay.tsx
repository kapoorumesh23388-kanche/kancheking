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
      { grad: "from-red-500 to-red-700", glow: "rgba(239, 68, 68, 0.6)" },
      { grad: "from-blue-500 to-blue-700", glow: "rgba(59, 130, 246, 0.6)" },
      { grad: "from-purple-500 to-purple-700", glow: "rgba(168, 85, 247, 0.6)" },
      { grad: "from-green-500 to-green-700", glow: "rgba(34, 197, 94, 0.6)" },
    ];

    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      marbles.push(
        <div
          key={i}
          className={`w-10 h-10 rounded-full inline-block mx-1 bg-gradient-to-br ${color.grad} transform transition-all animate-bounce`}
          style={{
            boxShadow: `0 0 20px ${color.glow}, 0 4px 8px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.5)`,
            animationDelay: `${i * 0.1}s`
          }}
        >
          <div
            className="absolute top-[20%] left-[30%] w-[25%] h-[25%] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.9), transparent)"
            }}
          />
        </div>
      );
    }
    return marbles;
  };

  return (
    <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-3 border-primary/40 shadow-2xl">
      <CardContent className="p-12 text-center">
        <h3
          className="text-3xl font-bold text-primary mb-6 uppercase tracking-wider"
          style={{ textShadow: '0 0 20px rgba(255,215,0,0.7)' }}
        >
          {label}
        </h3>
        
        {isOpen && marbleCount > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-3 animate-in fade-in duration-500">
            {renderMarbles()}
          </div>
        )}

        <div
          className={`text-9xl cursor-pointer transition-all duration-500 hover:scale-125 ${
            animate ? "animate-bounce scale-110" : "hover:scale-110"
          }`}
          onClick={handleClick}
          data-testid="fist-icon"
        >
          {isOpen ? "🖐️" : "✊"}
        </div>

        {marbleCount > 0 && !isOpen && (
          <div className="mt-6 text-2xl font-bold text-[#00FF88]" style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>
            {marbleCount} marble{marbleCount !== 1 ? 's' : ''} hidden 🔒
          </div>
        )}
      </CardContent>
    </Card>
  );
}
