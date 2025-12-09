import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import greenMarbleImage from "@assets/image_1764089214310.png";
import { useLanguage } from "@/lib/LanguageContext";

interface MarbleSelectorProps {
  selectedMarbleIds: number[];
  onToggleMarble: (id: number) => void;
  onClearAll: () => void;
  maxMarbles?: number;
}

const marbleColors = [
  // Deep Green glass marbles with swirls
  { bg: "conic-gradient(from 45deg at 25% 25%, rgba(255,255,255,0.9), rgba(150,220,120,0.5) 15%, rgba(80,180,60,0.4) 35%, rgba(100,200,80,0.35) 60%, rgba(40,120,40,0.3) 100%) , radial-gradient(circle at 25% 25%, rgba(255,255,255,0.6), transparent 40%)", name: "green1" },
  { bg: "radial-gradient(ellipse 60% 60% at 30% 30%, rgba(255,255,255,0.85), rgba(120,200,100,0.45) 20%, rgba(70,160,50,0.35) 50%, rgba(50,130,40,0.25) 100%)", name: "green2" },
  // Bright Blue glass marbles
  { bg: "conic-gradient(from 45deg at 25% 25%, rgba(255,255,255,0.88), rgba(150,200,255,0.45) 20%, rgba(80,160,240,0.35) 45%, rgba(100,180,255,0.3) 75%, rgba(40,100,200,0.25) 100%), radial-gradient(circle at 25% 25%, rgba(255,255,255,0.55), transparent 45%)", name: "blue1" },
  { bg: "radial-gradient(ellipse 60% 60% at 28% 28%, rgba(255,255,255,0.82), rgba(120,180,255,0.5) 18%, rgba(60,140,220,0.4) 48%, rgba(40,100,180,0.3) 100%)", name: "blue2" },
  // Warm Red/Brown glass marbles
  { bg: "conic-gradient(from 45deg at 25% 25%, rgba(255,255,255,0.9), rgba(220,120,80,0.5) 18%, rgba(180,80,60,0.4) 40%, rgba(200,100,70,0.35) 70%, rgba(140,50,30,0.28) 100%), radial-gradient(circle at 25% 25%, rgba(255,255,255,0.6), transparent 42%)", name: "red1" },
  { bg: "radial-gradient(ellipse 60% 60% at 28% 28%, rgba(255,255,255,0.84), rgba(200,100,70,0.48) 20%, rgba(160,70,50,0.38) 50%, rgba(140,50,40,0.28) 100%)", name: "red2" },
  // Sunshine Yellow glass marbles
  { bg: "conic-gradient(from 45deg at 25% 25%, rgba(255,255,255,0.92), rgba(255,230,100,0.55) 15%, rgba(220,180,60,0.4) 38%, rgba(240,200,80,0.35) 65%, rgba(180,140,40,0.3) 100%), radial-gradient(circle at 25% 25%, rgba(255,255,255,0.65), transparent 40%)", name: "yellow1" },
  { bg: "radial-gradient(ellipse 60% 60% at 28% 28%, rgba(255,255,255,0.88), rgba(240,220,80,0.52) 18%, rgba(200,160,50,0.42) 48%, rgba(180,130,30,0.32) 100%)", name: "yellow2" },
  // Clear/Frosted glass marbles
  { bg: "radial-gradient(ellipse 70% 70% at 25% 25%, rgba(255,255,255,0.95), rgba(220,230,240,0.35) 25%, rgba(180,200,220,0.2) 55%, rgba(140,160,180,0.12) 100%)", name: "white" },
  { bg: "conic-gradient(from 45deg at 25% 25%, rgba(255,255,255,0.92), rgba(200,220,240,0.4) 20%, rgba(160,190,220,0.25) 50%, rgba(140,170,200,0.15) 100%), radial-gradient(circle at 25% 25%, rgba(255,255,255,0.5), transparent 50%)", name: "clear" },
  // Deep Teal/Cyan glass marbles
  { bg: "conic-gradient(from 45deg at 25% 25%, rgba(255,255,255,0.88), rgba(100,220,200,0.5) 18%, rgba(50,180,160,0.4) 42%, rgba(80,200,180,0.33) 70%, rgba(30,120,100,0.25) 100%), radial-gradient(circle at 25% 25%, rgba(255,255,255,0.58), transparent 44%)", name: "teal" },
  { bg: "radial-gradient(ellipse 60% 60% at 28% 28%, rgba(255,255,255,0.85), rgba(80,200,180,0.48) 20%, rgba(50,160,140,0.38) 50%, rgba(30,120,100,0.28) 100%)", name: "teal2" },
  // Deep Purple glass marbles
  { bg: "conic-gradient(from 45deg at 25% 25%, rgba(255,255,255,0.87), rgba(180,120,220,0.48) 19%, rgba(140,80,180,0.38) 43%, rgba(160,100,200,0.33) 72%, rgba(100,40,140,0.26) 100%), radial-gradient(circle at 25% 25%, rgba(255,255,255,0.56), transparent 43%)", name: "purple" },
  { bg: "radial-gradient(ellipse 60% 60% at 28% 28%, rgba(255,255,255,0.82), rgba(160,100,200,0.48) 20%, rgba(130,70,160,0.38) 50%, rgba(110,50,140,0.28) 100%)", name: "purple2" },
  // Amber/Orange glass marbles
  { bg: "conic-gradient(from 45deg at 25% 25%, rgba(255,255,255,0.9), rgba(255,160,60,0.52) 17%, rgba(220,120,40,0.42) 41%, rgba(240,140,60,0.35) 68%, rgba(180,80,30,0.27) 100%), radial-gradient(circle at 25% 25%, rgba(255,255,255,0.62), transparent 41%)", name: "orange" },
  { bg: "radial-gradient(ellipse 60% 60% at 28% 28%, rgba(255,255,255,0.86), rgba(230,140,50,0.52) 19%, rgba(190,100,40,0.42) 50%, rgba(170,80,30,0.32) 100%)", name: "orange2" },
  // Light Cyan/Sky glass marbles
  { bg: "conic-gradient(from 45deg at 25% 25%, rgba(255,255,255,0.89), rgba(120,220,255,0.52) 17%, rgba(70,190,240,0.42) 40%, rgba(100,210,255,0.35) 69%, rgba(40,150,200,0.27) 100%), radial-gradient(circle at 25% 25%, rgba(255,255,255,0.59), transparent 42%)", name: "cyan" },
  { bg: "radial-gradient(ellipse 60% 60% at 28% 28%, rgba(255,255,255,0.84), rgba(100,210,255,0.52) 19%, rgba(60,180,230,0.42) 50%, rgba(50,150,200,0.32) 100%)", name: "cyan2" },
];

export default function MarbleSelector({
  selectedMarbleIds,
  onToggleMarble,
  onClearAll,
  maxMarbles = 20
}: MarbleSelectorProps) {
  const { t } = useLanguage();
  const marbles = Array.from({ length: maxMarbles }, (_, i) => i);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h3 className="text-2xl font-bold text-primary uppercase tracking-wider">
            {t("selectMarbles")}
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
                    : "ring-1 ring-white/30 hover:ring-2 hover:ring-white/50 hover:shadow-[0_-4px_12px_rgba(0,0,0,0.6)]"
                }`}
                style={{
                  background: marbleColor.bg,
                  boxShadow: isSelected
                    ? "0 8px 16px rgba(0, 255, 136, 0.3), inset -4px -4px 10px rgba(0,0,0,0.6), inset 4px 4px 10px rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.8)"
                    : "0 6px 14px rgba(0,0,0,0.7), inset -3px -3px 8px rgba(0,0,0,0.5), inset 3px 3px 8px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.5)"
                }}
                data-testid={`marble-${id}`}
              >
                {/* Realistic glossy shine with reflection */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse 40% 40% at 25% 25%, rgba(255,255,255,0.8), rgba(255,255,255,0.3) 15%, transparent 50%)",
                    opacity: isSelected ? 0.6 : 0.4,
                    filter: "blur(0.5px)"
                  }}
                />
                {/* Inner depth effect */}
                <div
                  className="absolute inset-1 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at 65% 65%, rgba(0,0,0,0.2), transparent 70%)",
                    opacity: 0.5
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
