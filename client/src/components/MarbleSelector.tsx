import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import greenMarbleImage from "@assets/image_1764089214310.png";

interface MarbleSelectorProps {
  selectedMarbleIds: number[];
  onToggleMarble: (id: number) => void;
  onClearAll: () => void;
  maxMarbles?: number;
}

const marbleColors = [
  { bg: "radial-gradient(circle at 30% 30%, #4ade80, #22c55e)", name: "green" },
  { bg: "radial-gradient(circle at 30% 30%, #60a5fa, #3b82f6)", name: "blue" },
  { bg: "radial-gradient(circle at 30% 30%, #f87171, #dc2626)", name: "red" },
  { bg: "radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b)", name: "amber" },
  { bg: "radial-gradient(circle at 30% 30%, #a78bfa, #8b5cf6)", name: "purple" },
  { bg: "radial-gradient(circle at 30% 30%, #fb7185, #ec4899)", name: "pink" },
  { bg: "radial-gradient(circle at 30% 30%, #67e8f9, #06b6d4)", name: "cyan" },
  { bg: "radial-gradient(circle at 30% 30%, #fca5a5, #ef4444)", name: "rose" },
];

export default function MarbleSelector({
  selectedMarbleIds,
  onToggleMarble,
  onClearAll,
  maxMarbles = 20
}: MarbleSelectorProps) {
  const marbles = Array.from({ length: maxMarbles }, (_, i) => i);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h3 className="text-2xl font-bold text-primary uppercase tracking-wider">
            Select Your Marbles
          </h3>
          <p className="text-lg text-[#00FF88] mt-1" style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>
            {selectedMarbleIds.length} / {maxMarbles} selected
          </p>
        </div>
        {selectedMarbleIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="bg-destructive/30 text-destructive border-destructive/60 hover:bg-destructive/50 font-bold hover:-translate-y-1 transition-all"
            data-testid="button-clear-all"
          >
            <X className="w-5 h-5 mr-2" />
            Clear All
          </Button>
        )}
      </div>
      
      <div className="p-6 bg-gradient-to-b from-black/40 to-black/20 rounded-3xl border-2 border-primary/30 shadow-2xl">
        <div className="grid grid-cols-8 gap-2">
          {marbles.map((id) => {
            const isSelected = selectedMarbleIds.includes(id);
            const order = isSelected ? selectedMarbleIds.indexOf(id) + 1 : null;
            const colorIndex = id % marbleColors.length;
            const marbleColor = marbleColors[colorIndex];
            
            return (
              <button
                key={id}
                onClick={() => onToggleMarble(id)}
                className={`aspect-square rounded-full cursor-pointer transition-all duration-300 transform hover:scale-110 relative group overflow-hidden ${
                  isSelected
                    ? "ring-3 ring-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.6)] scale-105"
                    : "ring-1 ring-white/30 hover:ring-primary/60 hover:shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                }`}
                style={{
                  background: marbleColor.bg,
                  boxShadow: isSelected
                    ? "0 6px 12px rgba(0, 255, 136, 0.3), inset -2px -2px 5px rgba(0,0,0,0.4), inset 2px 2px 5px rgba(255,255,255,0.2)"
                    : "0 3px 6px rgba(0,0,0,0.3), inset -1px -1px 4px rgba(0,0,0,0.3), inset 1px 1px 4px rgba(255,255,255,0.3)"
                }}
                data-testid={`marble-${id}`}
              >
                <div
                  className="absolute inset-0 rounded-full group-hover:opacity-100 transition-opacity"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)",
                    opacity: isSelected ? 0.5 : 0.2
                  }}
                />
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#00FF88] to-[#00CC6F] rounded-full flex items-center justify-center text-xs font-bold text-black border border-white shadow-md animate-pulse">
                    {order}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
