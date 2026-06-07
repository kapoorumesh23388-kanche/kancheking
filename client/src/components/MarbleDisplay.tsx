interface MarbleDisplayProps {
  count: number;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
}

const glassColors = [
  { c1: "#ff4444", c2: "#cc0000", swirl: "#ffcc00" },
  { c1: "#00cc44", c2: "#006622", swirl: "#88ffaa" },
  { c1: "#00aaff", c2: "#0044cc", swirl: "#88ddff" },
  { c1: "#ffcc00", c2: "#ff8800", swirl: "#ffffff" },
  { c1: "#cc44ff", c2: "#6600cc", swirl: "#ffaaff" },
  { c1: "#00cccc", c2: "#006688", swirl: "#aaffff" },
];

const GlassMarble = ({ color, px, selected }: { color: typeof glassColors[0], px: number, selected: boolean }) => {
  const uid = color.c1.replace('#', '') + px;
  return (
    <svg width={px} height={px} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
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
  const px = size === "sm" ? 36 : size === "lg" ? 72 : 52;

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
      <GlassMarble color={glassColors[i % glassColors.length]} px={px} selected={selected} />
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
