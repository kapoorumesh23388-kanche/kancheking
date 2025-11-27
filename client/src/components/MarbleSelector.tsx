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
  // Green marbles with swirls
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.9), rgba(255,255,255,0.3) 15%, #10b981 50%, #047857 100%)", name: "green1" },
  { bg: "radial-gradient(circle at 28% 28%, rgba(255,255,255,0.85), rgba(200,255,200,0.4) 12%, #059669 45%, #065f46 100%)", name: "green2" },
  // Blue marbles
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.9), rgba(150,200,255,0.4) 15%, #3b82f6 50%, #1e40af 100%)", name: "blue1" },
  { bg: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.88), rgba(100,150,255,0.5) 18%, #0ea5e9 48%, #0369a1 100%)", name: "blue2" },
  // Red marbles with amber swirl
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.9), rgba(255,100,100,0.5) 12%, #dc2626 50%, #7f1d1d 100%)", name: "red1" },
  { bg: "radial-gradient(circle at 28% 28%, rgba(255,255,255,0.88), rgba(255,150,0,0.4) 14%, #ea580c 48%, #92400e 100%)", name: "red2" },
  // Yellow marbles
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.92), rgba(255,255,100,0.5) 14%, #fbbf24 50%, #b45309 100%)", name: "yellow1" },
  { bg: "radial-gradient(circle at 28% 28%, rgba(255,255,255,0.9), rgba(255,220,0,0.45) 13%, #fcd34d 48%, #78350f 100%)", name: "yellow2" },
  // White/Clear marbles
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.95), rgba(200,220,255,0.5) 15%, rgba(150,170,200,0.8) 50%, #4b5563 100%)", name: "white" },
  { bg: "radial-gradient(circle at 28% 28%, rgba(255,255,255,0.93), rgba(230,240,255,0.6) 12%, rgba(180,200,220,0.7) 45%, #374151 100%)", name: "clear" },
  // Dark Green/Teal marbles
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.88), rgba(0,255,200,0.4) 14%, #0d9488 50%, #134e4a 100%)", name: "teal" },
  { bg: "radial-gradient(circle at 28% 28%, rgba(255,255,255,0.85), rgba(100,200,150,0.45) 16%, #14b8a6 48%, #0f766e 100%)", name: "teal2" },
  // Purple marbles
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.9), rgba(200,100,255,0.4) 13%, #a855f7 50%, #5b21b6 100%)", name: "purple" },
  { bg: "radial-gradient(circle at 28% 28%, rgba(255,255,255,0.88), rgba(168,85,247,0.45) 14%, #9333ea 48%, #4c0519 100%)", name: "purple2" },
  // Orange/Amber marbles
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.92), rgba(255,150,50,0.5) 13%, #f97316 50%, #7c2d12 100%)", name: "orange" },
  { bg: "radial-gradient(circle at 28% 28%, rgba(255,255,255,0.9), rgba(255,180,100,0.45) 15%, #fb923c 48%, #5a2e0f 100%)", name: "orange2" },
  // Cyan/Sky marbles
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.9), rgba(100,220,255,0.5) 12%, #06b6d4 50%, #0c4a6e 100%)", name: "cyan" },
  { bg: "radial-gradient(circle at 28% 28%, rgba(255,255,255,0.88), rgba(150,240,255,0.45) 14%, #22d3ee 48%, #164e63 100%)", name: "cyan2" },
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
        <div className="grid grid-cols-8 gap-3">
          {marbles.map((id) => {
            const isSelected = selectedMarbleIds.includes(id);
            const order = isSelected ? selectedMarbleIds.indexOf(id) + 1 : null;
            const colorIndex = id % marbleColors.length;
            const marbleColor = marbleColors[colorIndex];
            
            return (
              <button
                key={id}
                onClick={() => onToggleMarble(id)}
                className={`w-12 h-12 rounded-full cursor-pointer transition-all duration-300 transform hover:scale-120 relative group overflow-hidden ${
                  isSelected
                    ? "ring-3 ring-[#00FF88] shadow-[0_0_25px_rgba(0,255,136,0.7)] scale-110"
                    : "ring-1 ring-white/40 hover:ring-2 hover:ring-primary/80 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                }`}
                style={{
                  background: marbleColor.bg,
                  boxShadow: isSelected
                    ? "0 8px 20px rgba(0, 255, 136, 0.4), inset -3px -3px 8px rgba(0,0,0,0.5), inset 3px 3px 8px rgba(255,255,255,0.25), inset -1px -1px 3px rgba(0,0,0,0.8)"
                    : "0 4px 12px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(0,0,0,0.4), inset 2px 2px 6px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.6)"
                }}
                data-testid={`marble-${id}`}
              >
                {/* Glossy shine effect */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6), rgba(255,255,255,0.2) 25%, transparent 60%)",
                    opacity: isSelected ? 0.7 : 0.5
                  }}
                />
                {/* Selection number */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#00FF88] to-[#00CC6F] rounded-full flex items-center justify-center text-xs font-bold text-black border border-white shadow-md animate-pulse z-10">
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
