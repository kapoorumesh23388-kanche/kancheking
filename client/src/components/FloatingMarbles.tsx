export default function FloatingMarbles() {
  const marbles = Array.from({ length: 7 }, (_, i) => i);
  
  const colors = [
    "bg-gradient-to-br from-green-400 to-green-600",
    "bg-gradient-to-br from-blue-400 to-blue-600",
    "bg-gradient-to-br from-red-400 to-red-600",
    "bg-gradient-to-br from-yellow-400 to-yellow-600",
    "bg-gradient-to-br from-purple-400 to-purple-600",
    "bg-gradient-to-br from-cyan-400 to-cyan-600",
    "bg-gradient-to-br from-pink-400 to-pink-600",
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {marbles.map((i) => (
        <div
          key={i}
          className={`absolute w-8 h-8 rounded-full ${colors[i % colors.length]} shadow-lg animate-marble-jump`}
          style={{
            left: `${10 + i * 12}%`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${2 + i * 0.2}s`,
          }}
        >
          {/* Glossy shine */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/60 to-transparent" />
        </div>
      ))}
    </div>
  );
}
