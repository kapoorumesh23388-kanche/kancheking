interface MarbleDisplayProps {
  count: number;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
}

export default function MarbleDisplay({
  count,
  size = "md",
  selected = false,
  onClick
}: MarbleDisplayProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-15 h-15",
    lg: "w-20 h-20"
  };

  const marbles = Array.from({ length: Math.min(count, 20) }, (_, i) => (
    <div
      key={i}
      className={`${sizeClasses[size]} rounded-full cursor-pointer transition-all hover:scale-110 ${
        selected
          ? "border-3 border-[#00FF88] shadow-[0_0_0_3px_rgba(0,255,136,0.5)] animate-pulse"
          : "border-3 border-transparent"
      }`}
      style={{
        background: "radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a)",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2), inset -2px -2px 6px rgba(0,0,0,0.3), inset 2px 2px 6px rgba(255,255,255,0.5)",
        position: "relative"
      }}
      onClick={onClick}
      data-testid={`marble-${i}`}
    >
      <div
        className="absolute top-[15%] left-[25%] w-[30%] h-[30%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent)"
        }}
      />
    </div>
  ));

  return (
    <div className="flex flex-wrap gap-4 justify-center p-5 bg-black/20 rounded-2xl">
      {marbles}
      {count > 20 && (
        <div className="text-primary text-2xl font-bold self-center">
          +{count - 20} more
        </div>
      )}
    </div>
  );
}
