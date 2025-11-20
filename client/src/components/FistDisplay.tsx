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

  return (
    <Card className="bg-primary/10 border-2 border-primary/20">
      <CardContent className="p-10 text-center">
        <h3
          className="text-2xl font-semibold text-primary mb-4"
          style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}
        >
          {label}
        </h3>
        
        <div
          className={`text-9xl cursor-pointer transition-all duration-500 ${
            animate ? "animate-bounce" : ""
          }`}
          onClick={handleClick}
          data-testid="fist-icon"
        >
          {isOpen ? "🖐️" : "✊"}
        </div>
        
        {isOpen && marbleCount > 0 && (
          <div className="mt-6">
            <p className="text-4xl font-bold text-[#00FF88]" style={{ textShadow: '0 0 15px rgba(0,255,136,0.5)' }}>
              {marbleCount} Marbles
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
