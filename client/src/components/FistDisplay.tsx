import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface FistDisplayProps {
  isOpen?: boolean;
  marbleCount?: number;
  label?: string;
}

const glassColors = [
  { c1: "#ff4444", c2: "#cc0000", swirl: "#ffcc00" },
  { c1: "#00cc44", c2: "#006622", swirl: "#88ffaa" },
  { c1: "#00aaff", c2: "#0044cc", swirl: "#88ddff" },
  { c1: "#ffcc00", c2: "#ff8800", swirl: "#ffffff" },
  { c1: "#cc44ff", c2: "#6600cc", swirl: "#ffaaff" },
  { c1: "#00cccc", c2: "#006688", swirl: "#aaffff" },
];

const GlassMarble = ({ color, size = 40, delay = 0 }: { color: typeof glassColors[0], size?: number, delay?: number }) => {
  const uid = color.c1.replace('#', '') + delay;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', animation: `bounce 1s ease-in-out ${delay}s infinite alternate` }}>
      <defs>
        <radialGradient id={`b-${uid}`} cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.95"/>
          <stop offset="15%" stopColor={color.c1} stopOpacity="0.85"/>
          <stop offset="55%" stopColor={color.c2} stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.8"/>
        </radialGradient>
        <radialGradient id={`s-${uid}`} cx="30%" cy="26%" r="36%">
          <stop offset="0%" stopColor="white" stopOpacity="1"/>
          <stop offset="55%" stopColor="white" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`d-${uid}`} cx="62%" cy="66%" r="42%">
          <stop offset="0%" stopColor={color.c2} stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0"/>
        </radialGradient>
        <filter id={`sh-${uid}`}>
          <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.6"/>
        </filter>
      </defs>
      <circle cx="24" cy="24" r="22" fill={`url(#b-${uid})`} filter={`url(#sh-${uid})`}/>
      <ellipse cx="27" cy="28" rx="10" ry="4" fill={color.swirl} opacity="0.2" transform="rotate(-40 27 28)"/>
      <ellipse cx="18" cy="20" rx="6" ry="2.5" fill={color.swirl} opacity="0.13" transform="rotate(25 18 20)"/>
      <circle cx="24" cy="24" r="22" fill={`url(#d-${uid})`}/>
      <ellipse cx="16" cy="14" rx="9" ry="6" fill={`url(#s-${uid})`}/>
      <circle cx="31" cy="33" r="2.5" fill="white" opacity="0.15"/>
    </svg>
  );
};

export default function FistDisplay({
  isOpen = false,
  marbleCount = 0,
  label = "Hidden Marbles"
}: FistDisplayProps) {
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 1000);
  };

  const renderMarbles = () => {
    const count = Math.min(marbleCount, 20);
    return Array.from({ length: count }, (_, i) => (
      <div key={i} style={{ display: 'inline-block' }}>
        <GlassMarble
          color={glassColors[i % glassColors.length]}
          size={42}
          delay={i * 0.08}
        />
      </div>
    ));
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

        {/* Palm hand with marbles on top when hidden */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {!isOpen && marbleCount > 0 && (
            <div style={{
              position: 'absolute',
              top: -36,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 4,
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: 120,
            }}>
              {Array.from({ length: Math.min(marbleCount, 5) }, (_, i) => (
                <GlassMarble key={i} color={glassColors[i % glassColors.length]} size={28} delay={i * 0.1} />
              ))}
            </div>
          )}
          <div
            className={`text-5xl sm:text-7xl md:text-8xl cursor-pointer transition-all duration-500 ${
              animate ? "animate-bounce scale-105" : "hover:scale-105"
            }`}
            onClick={handleClick}
            data-testid="fist-icon"
          >
            {isOpen ? "🖐️" : "✊"}
          </div>
        </div>

        {marbleCount > 0 && !isOpen && (
          <div className="mt-6 sm:mt-8 text-base sm:text-xl font-bold text-[#00FF88]"
            style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>
            {marbleCount} marble{marbleCount !== 1 ? 's' : ''} hidden 🔒
          </div>
        )}
      </CardContent>
    </Card>
  );
}
