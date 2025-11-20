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
    for (let i = 0; i < count; i++) {
      marbles.push(
        <div
          key={i}
          className="w-8 h-8 rounded-full inline-block mx-1 animate-bounce"
          style={{
            background: "radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.5)",
            animationDelay: `${i * 0.1}s`
          }}
        >
          <div
            className="absolute top-[15%] left-[25%] w-[30%] h-[30%] rounded-full"
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
    <Card className="bg-primary/10 border-2 border-primary/20">
      <CardContent className="p-10 text-center">
        <h3
          className="text-2xl font-semibold text-primary mb-4"
          style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}
        >
          {label}
        </h3>
        
        {isOpen && marbleCount > 0 && (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {renderMarbles()}
          </div>
        )}
        
        <div
          className={`text-9xl cursor-pointer transition-all duration-500 ${
            animate ? "animate-bounce" : ""
          }`}
          onClick={handleClick}
          data-testid="fist-icon"
        >
          {isOpen ? "🖐️" : "✊"}
        </div>
      </CardContent>
    </Card>
  );
}
