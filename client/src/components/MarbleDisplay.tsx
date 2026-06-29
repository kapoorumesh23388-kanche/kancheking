interface MarbleDisplayProps {
  count: number;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
}

const glassColors = [
  { swirl: "#00e8cc", swirl2: "#006655" },
  { swirl: "#2288ff", swirl2: "#003388" },
  { swirl: "#ff8822", swirl2: "#883300" },
  { swirl: "#22cc44", swirl2: "#005522" },
  { swirl: "#ddcc00", swirl2: "#665500" },
  { swirl: "#aaddee", swirl2: "#335566" },
];

const TransparentMarble = ({ color, px, selected }: { color: typeof glassColors[0], px: number, selected: boolean }) => {
  const uid = color.swirl.replace('#', '') + px;
  return (
    <svg width={px} height={px} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
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
          <feDropShadow dx="1" dy="2.5" stdDeviation="2.5" floodColor="#000" floodOpacity="0.55"/>
        </filter>
      </defs>
      <circle cx="24" cy="24" r="22" fill={`url(#sw-${uid})`} filter={`url(#shd-${uid})`} opacity="0.88"/>
      <path d="M16,8 C20,16 12,24 18,34 C22,40 16,42 18,44" stroke={color.swirl} strokeWidth="2.8" fill="none" strokeOpacity="0.65" strokeLinecap="round"/>
      <path d="M26,6 C30,14 22,22 28,32" stroke={color.swirl} strokeWidth="1.5" fill="none" strokeOpacity="0.38" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="22" fill={`url(#gl-${uid})`}/>
      <circle cx="24" cy="24" r="22" fill={`url(#sp1-${uid})`}/>
      <circle cx="24" cy="24" r="22" fill={`url(#sp2-${uid})`}/>
      <circle cx="24" cy="24" r="21.5" fill="none" stroke={color.swirl} strokeWidth="0.7" strokeOpacity="0.28"/>
      {selected && <circle cx="24" cy="24" r="21.5" fill="none" stroke="#00FF88" strokeWidth="2.8" opacity="0.95"/>}
    </svg>
  );
};

export default function MarbleDisplay({
  count,
  size = "md",
  selected = false,
  onClick
}: MarbleDisplayProps) {
  const px = size === "sm" ? 32 : size === "lg" ? 60 : 44;

  const marbles = Array.from({ length: Math.min(count, 20) }, (_, i) => (
    <div
      key={i}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s',
        filter: selected ? 'drop-shadow(0 0 6px rgba(0,255,136,0.8))' : 'none',
      }}
      className="hover:scale-110"
    >
      <TransparentMarble color={glassColors[i % glassColors.length]} px={px} selected={selected} />
    </div>
  ));

  return (
    <div className="flex flex-wrap gap-3 justify-center p-5 bg-black/20 rounded-2xl">
      {marbles}
      {count > 20 && (
        <div className="text-primary text-2xl font-bold self-center">
          +{count - 20} more
        </div>
      )}
    </div>
  );
}


