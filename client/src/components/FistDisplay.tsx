import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface FistDisplayProps {
  isOpen?: boolean;
  marbleCount?: number;
  label?: string;
}

const glassColors = [
  { c1: "#ff2222", c2: "#990000", swirl: "#ffaa00", t: "0.55" },
  { c1: "#22bb22", c2: "#005500", swirl: "#aaffaa", t: "0.5" },
  { c1: "#2288ff", c2: "#0033aa", swirl: "#aaddff", t: "0.5" },
  { c1: "#ffcc00", c2: "#cc7700", swirl: "#fff8aa", t: "0.5" },
  { c1: "#cc22ff", c2: "#660099", swirl: "#ffaaff", t: "0.5" },
  { c1: "#00cccc", c2: "#005566", swirl: "#aaffff", t: "0.5" },
];

const GlassMarble = ({ color, size = 40 }: { color: typeof glassColors[0], size?: number }) => {
  const uid = `m${color.c1.replace('#','')}${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Base transparent glass color */}
        <radialGradient id={`base-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color.c1} stopOpacity="0.7"/>
          <stop offset="70%" stopColor={color.c2} stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0.6"/>
        </radialGradient>
        {/* Main top-left shine */}
        <radialGradient id={`shine1-${uid}`} cx="35%" cy="30%" r="35%">
          <stop offset="0%" stopColor="white" stopOpacity="0.95"/>
          <stop offset="40%" stopColor="white" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        {/* Bottom right depth */}
        <radialGradient id={`depth-${uid}`} cx="65%" cy="68%" r="40%">
          <stop offset="0%" stopColor={color.c2} stopOpacity="0.6"/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </radialGradient>
        {/* Inner swirl gradient */}
        <radialGradient id={`swirl-${uid}`} cx="40%" cy="55%" r="30%">
          <stop offset="0%" stopColor={color.swirl} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color.swirl} stopOpacity="0"/>
        </radialGradient>
        {/* Small secondary shine */}
        <radialGradient id={`shine2-${uid}`} cx="68%" cy="72%" r="15%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <filter id={`shadow-${uid}`} x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.5"/>
        </filter>
      </defs>
      {/* Main glass sphere */}
      <circle cx="50" cy="50" r="46" fill={`url(#base-${uid})`} filter={`url(#shadow-${uid})`}/>
      {/* Swirl inside */}
      <ellipse cx="42" cy="58" rx="22" ry="10" fill={color.swirl} opacity="0.22" transform="rotate(-35 42 58)"/>
      <ellipse cx="58" cy="38" rx="14" ry="6" fill={color.swirl} opacity="0.15" transform="rotate(20 58 38)"/>
      {/* Inner swirl glow */}
      <circle cx="50" cy="50" r="46" fill={`url(#swirl-${uid})`}/>
      {/* Depth shadow bottom right */}
      <circle cx="50" cy="50" r="46" fill={`url(#depth-${uid})`}/>
      {/* Main shine top left */}
      <ellipse cx="33" cy="28" rx="22" ry="14" fill={`url(#shine1-${uid})`}/>
      {/* Small secondary shine bottom right */}
      <circle cx="68" cy="70" r="8" fill={`url(#shine2-${uid})`}/>
      {/* Tiny specular highlight */}
      <ellipse cx="28" cy="24" rx="7" ry="4" fill="white" opacity="0.7" transform="rotate(-20 28 24)"/>
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

  const count = Math.min(marbleCount, 20);
  const palmMarbleCount = Math.min(marbleCount, 6);

  return (
    <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/40 shadow-xl">
      <CardContent className="p-4 sm:p-6 md:p-10 text-center">
        <h3
          className="text-lg sm:text-2xl md:text-3xl font-bold text-primary mb-2 sm:mb-4 uppercase tracking-wider"
          style={{ textShadow: '0 0 15px rgba(255,215,0,0.7)' }}
        >
          {label}
        </h3>

        {/* Revealed: show all marbles above open hand */}
        {isOpen && marbleCount > 0 && (
          <div className="mb-3 sm:mb-4 flex flex-wrap justify-center gap-1 sm:gap-2 animate-in fade-in duration-500">
            {Array.from({ length: count }, (_, i) => (
              <GlassMarble key={i} color={glassColors[i % glassColors.length]} size={40}/>
            ))}
          </div>
        )}

        {/* Hand + marbles sitting on palm */}
        <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Marbles sitting ON the palm — shown when hidden */}
          {!isOpen && marbleCount > 0 && (
            <div style={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: 140,
              marginBottom: -8,
              zIndex: 2,
              position: 'relative',
            }}>
              {Array.from({ length: palmMarbleCount }, (_, i) => (
                <GlassMarble key={i} color={glassColors[i % glassColors.length]} size={32}/>
              ))}
              {marbleCount > 6 && (
                <span style={{ fontSize: 11, color: '#00FF88', alignSelf: 'center', fontWeight: 'bold' }}>
                  +{marbleCount - 6}
                </span>
              )}
            </div>
          )}

          {/* Fist / Palm emoji */}
          <div
            className={`text-6xl sm:text-7xl md:text-8xl cursor-pointer transition-all duration-500 ${
              animate ? "animate-bounce scale-105" : "hover:scale-105"
            }`}
            style={{ lineHeight: 1, zIndex: 1 }}
            onClick={handleClick}
            data-testid="fist-icon"
          >
            {isOpen ? "🖐️" : "✊"}
          </div>
        </div>

        {marbleCount > 0 && !isOpen && (
          <div className="mt-3 text-base sm:text-xl font-bold text-[#00FF88]"
            style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>
            {marbleCount} marble{marbleCount !== 1 ? 's' : ''} hidden 🔒
          </div>
        )}
      </CardContent>
    </Card>
  );
}
