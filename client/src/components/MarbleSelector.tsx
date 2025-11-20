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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-primary">
          Click marbles to select ({selectedMarbleIds.length} selected)
        </h3>
        {selectedMarbleIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="bg-destructive/20 text-destructive border-destructive/40 hover:bg-destructive/40"
            data-testid="button-clear-all"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-5 gap-4 p-6 bg-black/20 rounded-2xl">
        {marbles.map((id) => {
          const isSelected = selectedMarbleIds.includes(id);
          return (
            <button
              key={id}
              onClick={() => onToggleMarble(id)}
              className={`w-16 h-16 rounded-full cursor-pointer transition-all hover:scale-110 relative ${
                isSelected
                  ? "ring-4 ring-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.6)]"
                  : "ring-2 ring-transparent hover:ring-primary/50"
              }`}
              style={{
                background: "radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(0,0,0,0.3), inset 2px 2px 6px rgba(255,255,255,0.5)"
              }}
              data-testid={`marble-${id}`}
            >
              <div
                className="absolute top-[15%] left-[25%] w-[30%] h-[30%] rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent)"
                }}
              />
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#00FF88] rounded-full flex items-center justify-center text-xs font-bold text-black">
                  {selectedMarbleIds.indexOf(id) + 1}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
