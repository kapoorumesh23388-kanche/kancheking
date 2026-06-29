import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface FistDisplayProps {
  isOpen?: boolean;
  marbleCount?: number;
  label?: string;
}

const glassColors = [
  { swirl: "#00e8cc", swirl2: "#006655" },
  { swirl: "#2288ff", swirl2: "#003388" },
  { swirl: "#ff8822", swirl2: "#883300" },
  { swirl: "#22cc44", swirl2: "#005522" },
  { swirl: "#ddcc00", swirl2: "#665500" },
  { swirl: "#aaddee", swirl2: "#335566" },
  { swirl: "#ff4488", swirl2: "#880022" },
  { swirl: "#88cc00", swirl2: "#335500" },
  { swirl: "#aa66ff", swirl2: "#440088" },
  { swirl: "#ff6622", swirl2: "#882200" },
];

const GlassMarble = ({ color, size = 40 }: { color: typeof glassColors[0], size?: number }) => {
  const uid = color.swirl.replace('#','') + color.swirl2.replace('#','') + size;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`sw-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color.swirl} stopOpacity="0.0"/>
          <stop offset="35%" stopColor={color.swirl} stopOpacity="0.55"/>
          <stop offset="100%" stopColor={color.swirl2} stopOpacity="0.78"/>
        </radialGradient>
        <radialGradient id={`gl-${uid}`} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55"/>
          <stop offset="18%" stopColor="#d8f0f5" stopOpacity="0.32"/>
          <stop offset="45%" stopColor="#90ccd8" stopOpacity="0.18"/>
          <stop offset="75%" stopColor="#4a8fa0" stopOpacity="0.14"/>
          <stop offset="100%" stopColor="#1a4a55" stopOpacity="0.42"/>
        </radialGradient>
        <radialGradient id={`sp1-${uid}`} cx="35%" cy="28%" r="28%">
          <stop offset="0%" stopColor="white" stopOpacity="0.92"/>
          <stop offset="55%" stopColor="white" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`sp2-${uid}`} cx="68%" cy="72%" r="18%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <filter id={`shd-${uid}`}>
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5"/>
        </filter>
      </defs>
      <circle cx="24" cy="24" r="22" fill={`url(#sw-${uid})`} filter={`url(#shd-${uid})`} opacity="0.88"/>
      <path d="M16,8 C20,16 12,24 18,34 C22,40 16,42 18,44" stroke={color.swirl} strokeWidth="2.8" fill="none" strokeOpacity="0.65" strokeLinecap="round"/>
      <path d="M26,6 C30,14 22,22 28,32" stroke={color.swirl} strokeWidth="1.5" fill="none" strokeOpacity="0.38" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="22" fill={`url(#gl-${uid})`}/>
      <circle cx="24" cy="24" r="22" fill={`url(#sp1-${uid})`}/>
      <circle cx="24" cy="24" r="22" fill={`url(#sp2-${uid})`}/>
      <circle cx="24" cy="24" r="21.5" fill="none" stroke={color.swirl} strokeWidth="0.7" strokeOpacity="0.28"/>
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
          {/* Marbles sitting ON the palm â€” shown when hidden */}
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
            {isOpen ? "ðŸ–ï¸" : "âœŠ"}
          </div>
        </div>

        {marbleCount > 0 && !isOpen && (
          <div className="mt-3 text-base sm:text-xl font-bold text-[#00FF88]"
            style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>
            {marbleCount} marble{marbleCount !== 1 ? 's' : ''} hidden ðŸ”’
          </div>
        )}
      </CardContent>
    </Card>
  );
}


