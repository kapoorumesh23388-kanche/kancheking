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
  // Transparent Green glass marbles
  { bg: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.95), rgba(200,255,200,0.6) 10%, rgba(100,200,100,0.4) 40%, rgba(50,150,50,0.3) 100%)", name: "green1" },
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.92), rgba(150,220,150,0.55) 12%, rgba(80,180,80,0.35) 45%, rgba(40,140,40,0.25) 100%)", name: "green2" },
  // Transparent Blue glass marbles
  { bg: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.94), rgba(180,220,255,0.5) 10%, rgba(100,180,255,0.35) 40%, rgba(50,140,200,0.25) 100%)", name: "blue1" },
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.92), rgba(150,200,255,0.55) 12%, rgba(80,160,220,0.4) 45%, rgba(40,120,180,0.3) 100%)", name: "blue2" },
  // Transparent Red/Orange glass marbles
  { bg: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.95), rgba(255,150,100,0.5) 10%, rgba(220,100,80,0.35) 40%, rgba(180,60,40,0.25) 100%)", name: "red1" },
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.92), rgba(255,180,120,0.55) 12%, rgba(230,130,80,0.4) 45%, rgba(200,80,40,0.3) 100%)", name: "red2" },
  // Transparent Yellow glass marbles
  { bg: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.96), rgba(255,250,150,0.55) 10%, rgba(240,200,80,0.4) 40%, rgba(200,160,40,0.28) 100%)", name: "yellow1" },
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.93), rgba(255,240,100,0.6) 12%, rgba(220,180,60,0.42) 45%, rgba(180,140,30,0.32) 100%)", name: "yellow2" },
  // Transparent Clear/White glass marbles
  { bg: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.98), rgba(220,230,245,0.4) 10%, rgba(180,200,220,0.25) 40%, rgba(140,160,180,0.18) 100%)", name: "white" },
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.95), rgba(230,240,255,0.45) 12%, rgba(190,210,230,0.3) 45%, rgba(150,170,190,0.2) 100%)", name: "clear" },
  // Transparent Teal/Dark Green glass marbles
  { bg: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.94), rgba(100,240,200,0.48) 10%, rgba(60,200,150,0.35) 40%, rgba(30,150,100,0.23) 100%)", name: "teal" },
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.91), rgba(120,220,180,0.52) 12%, rgba(70,190,140,0.38) 45%, rgba(40,140,90,0.28) 100%)", name: "teal2" },
  // Transparent Purple glass marbles
  { bg: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.94), rgba(220,150,255,0.48) 10%, rgba(180,100,220,0.35) 40%, rgba(140,60,180,0.24) 100%)", name: "purple" },
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.92), rgba(210,130,240,0.52) 12%, rgba(170,80,200,0.38) 45%, rgba(130,40,160,0.28) 100%)", name: "purple2" },
  // Transparent Orange/Brown glass marbles
  { bg: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.95), rgba(255,180,80,0.5) 10%, rgba(230,140,60,0.36) 40%, rgba(190,100,30,0.25) 100%)", name: "orange" },
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.92), rgba(255,200,100,0.55) 12%, rgba(240,150,70,0.4) 45%, rgba(200,110,40,0.3) 100%)", name: "orange2" },
  // Transparent Cyan/Sky glass marbles
  { bg: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.94), rgba(120,220,255,0.5) 10%, rgba(80,190,240,0.35) 40%, rgba(40,150,200,0.25) 100%)", name: "cyan" },
  { bg: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.92), rgba(150,230,255,0.55) 12%, rgba(100,200,240,0.4) 45%, rgba(60,160,200,0.3) 100%)", name: "cyan2" },
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
