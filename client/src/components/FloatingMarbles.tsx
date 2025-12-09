export default function FloatingMarbles() {
  const marbles = Array.from({ length: 9 }, (_, i) => i);
  
  const neonColors = [
    { bg: "from-[#00D9FF] to-[#0099CC]", shadow: "0 0 15px rgba(0,217,255,0.6)" },
    { bg: "from-[#E91E8C] to-[#A01060]", shadow: "0 0 15px rgba(233,30,140,0.6)" },
    { bg: "from-[#8A2BE2] to-[#5A1A90]", shadow: "0 0 15px rgba(138,43,226,0.6)" },
    { bg: "from-[#FFD700] to-[#CC9900]", shadow: "0 0 15px rgba(255,215,0,0.6)" },
    { bg: "from-[#00FF88] to-[#00AA55]", shadow: "0 0 15px rgba(0,255,136,0.6)" },
    { bg: "from-[#FF6B6B] to-[#CC4444]", shadow: "0 0 15px rgba(255,107,107,0.6)" },
    { bg: "from-[#00D9FF] to-[#E91E8C]", shadow: "0 0 15px rgba(0,217,255,0.8)" },
    { bg: "from-[#E91E8C] to-[#8A2BE2]", shadow: "0 0 15px rgba(233,30,140,0.8)" },
    { bg: "from-[#8A2BE2] to-[#00D9FF]", shadow: "0 0 15px rgba(138,43,226,0.8)" },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {marbles.map((i) => {
        const color = neonColors[i % neonColors.length];
        return (
          <div
            key={i}
            className={`absolute w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br ${color.bg} animate-marble-jump`}
            style={{
              left: `${8 + i * 10}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2.5 + i * 0.15}s`,
              boxShadow: color.shadow,
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-transparent" />
          </div>
        );
      })}
    </div>
  );
}
