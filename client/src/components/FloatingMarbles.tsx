export default function FloatingMarbles() {
  const slowMarbles = Array.from({ length: 4 }, (_, i) => i);
  const fastMarbles = Array.from({ length: 3 }, (_, i) => i);
  
  const neonColors = [
    { bg: "from-[#00D9FF] to-[#0077AA]", glow: "rgba(0,217,255,0.5)" },
    { bg: "from-[#E91E8C] to-[#8B0A50]", glow: "rgba(233,30,140,0.5)" },
    { bg: "from-[#8A2BE2] to-[#4B0082]", glow: "rgba(138,43,226,0.5)" },
    { bg: "from-[#00FF88] to-[#008844]", glow: "rgba(0,255,136,0.5)" },
    { bg: "from-[#FFD700] to-[#B8860B]", glow: "rgba(255,215,0,0.5)" },
    { bg: "from-[#FF6B6B] to-[#8B0000]", glow: "rgba(255,107,107,0.5)" },
  ];

  const positions = [
    { left: '5%', top: '15%' },
    { left: '85%', top: '25%' },
    { left: '15%', top: '70%' },
    { left: '75%', top: '80%' },
  ];

  const fastPositions = [
    { left: '20%', top: '30%' },
    { left: '70%', top: '15%' },
    { left: '10%', top: '85%' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 hidden sm:block">
      {/* Neon Grid Pattern */}
      <div className="absolute inset-0 arena-grid opacity-50" />
      
      {/* Arena Pattern with color spots */}
      <div className="absolute inset-0 arena-pattern" />
      
      {/* Single Energy Vortex - Center */}
      <div 
        className="neon-vortex"
        style={{
          width: '400px',
          height: '400px',
          left: '50%',
          top: '50%',
          marginLeft: '-200px',
          marginTop: '-200px',
          opacity: 0.2,
        }}
      />
      
      {/* Slow Parallax Layer - Background marbles */}
      {slowMarbles.map((i) => {
        const color = neonColors[i % neonColors.length];
        const pos = positions[i];
        return (
          <div
            key={`slow-${i}`}
            className={`absolute rounded-full bg-gradient-to-br ${color.bg} parallax-slow opacity-40`}
            style={{
              width: `${18 + i * 4}px`,
              height: `${18 + i * 4}px`,
              left: pos.left,
              top: pos.top,
              animationDelay: `${i * 2}s`,
              boxShadow: `0 0 15px ${color.glow}, inset -2px -2px 6px rgba(0,0,0,0.4), inset 2px 2px 6px rgba(255,255,255,0.2)`,
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
          </div>
        );
      })}
      
      {/* Fast Parallax Layer - Foreground marbles */}
      {fastMarbles.map((i) => {
        const color = neonColors[(i + 2) % neonColors.length];
        const pos = fastPositions[i];
        return (
          <div
            key={`fast-${i}`}
            className={`absolute rounded-full bg-gradient-to-br ${color.bg} parallax-fast`}
            style={{
              width: `${10 + i * 3}px`,
              height: `${10 + i * 3}px`,
              left: pos.left,
              top: pos.top,
              animationDelay: `${i * 1.2}s`,
              boxShadow: `0 0 12px ${color.glow}, inset -2px -2px 4px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.3)`,
              opacity: 0.6,
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-transparent" />
          </div>
        );
      })}
      
      {/* Corner marble clusters */}
      <div className="absolute bottom-8 left-8 flex gap-2 opacity-50">
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0077AA]" style={{ boxShadow: '0 0 8px rgba(0,217,255,0.4)' }} />
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#8B0A50]" style={{ boxShadow: '0 0 8px rgba(233,30,140,0.4)' }} />
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#8A2BE2] to-[#4B0082]" style={{ boxShadow: '0 0 8px rgba(138,43,226,0.4)' }} />
      </div>
      
      <div className="absolute top-20 right-8 flex gap-2 opacity-50">
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#00FF88] to-[#008844]" style={{ boxShadow: '0 0 8px rgba(0,255,136,0.4)' }} />
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#FFD700] to-[#B8860B]" style={{ boxShadow: '0 0 8px rgba(255,215,0,0.4)' }} />
      </div>
    </div>
  );
}


