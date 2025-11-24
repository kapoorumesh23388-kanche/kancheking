import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MarbleSelectorProps {
  selectedMarbleIds: number[];
  onToggleMarble: (id: number) => void;
  onClearAll: () => void;
  maxMarbles?: number;
}

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
      
      <div className="p-8 bg-gradient-to-b from-black/40 to-black/20 rounded-3xl border-2 border-primary/30 shadow-2xl">
        <div className="grid grid-cols-6 gap-3 md:gap-4">
          {marbles.map((id) => {
            const isSelected = selectedMarbleIds.includes(id);
            const order = isSelected ? selectedMarbleIds.indexOf(id) + 1 : null;
            
            return (
              <button
                key={id}
                onClick={() => onToggleMarble(id)}
                className={`aspect-square rounded-full cursor-pointer transition-all duration-300 transform hover:scale-125 relative group ${
                  isSelected
                    ? "ring-4 ring-[#00FF88] shadow-[0_0_30px_rgba(0,255,136,0.8)] scale-110"
                    : "ring-2 ring-primary/50 hover:ring-primary hover:shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                }`}
                style={{
                  background: isSelected
                    ? "radial-gradient(circle at 30% 30%, #ff1744, #d50000)"
                    : "radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a)",
                  boxShadow: isSelected
                    ? "0 8px 16px rgba(255, 23, 68, 0.4), inset -3px -3px 8px rgba(0,0,0,0.5), inset 3px 3px 8px rgba(255,255,255,0.3)"
                    : "0 4px 8px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(0,0,0,0.3), inset 2px 2px 6px rgba(255,255,255,0.5)"
                }}
                data-testid={`marble-${id}`}
              >
                <div
                  className="absolute top-[15%] left-[25%] w-[30%] h-[30%] rounded-full group-hover:opacity-100 transition-opacity"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.9), transparent)",
                    opacity: isSelected ? 1 : 0.8
                  }}
                />
                {isSelected && (
                  <div className="absolute -top-3 -right-3 w-7 h-7 bg-gradient-to-br from-[#00FF88] to-[#00CC6F] rounded-full flex items-center justify-center text-xs font-bold text-black border-2 border-white shadow-lg animate-pulse">
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
