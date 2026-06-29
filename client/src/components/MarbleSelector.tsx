import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface MarbleSelectorProps {
  selectedMarbleIds: number[];
  onToggleMarble: (id: number) => void;
  onClearAll: () => void;
  maxMarbles?: number;
}

const marbleColors = [
  { swirl: "#00e8cc", swirl2: "#006655" },
  { swirl: "#2288ff", swirl2: "#003388" },
  { swirl: "#ff8822", swirl2: "#883300" },
  { swirl: "#22cc44", swirl2: "#005522" },
  { swirl: "#ddcc00", swirl2: "#665500" },
  { swirl: "#aaddee", swirl2: "#335566" },
  { swirl: "#ff4488", swirl2: "#880022" },
  { swirl: "#88cc00", swirl2: "#335500" },
  { swirl: "#aa66ff", swirl2: "#440088" },
  { swirl: "#ff6622", swirl2: "#882200" },
];

const TransparentMarble = ({ color, isSelected, order }: { color: typeof marbleColors[0], isSelected: boolean, order: number | null }) => {
  const uid = color.swirl.replace('#', '') + color.swirl2.replace('#', '');
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg width="38" height="38" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <defs>
          <radialGradient id={`sw-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color.swirl} stopOpacity="0.0"/>
            <stop offset="35%" stopColor={color.swirl} stopOpacity="0.55"/>
            <stop offset="100%" stopColor={color.swirl2} stopOpacity="0.78"/>
          </radialGradient>
          <radialGradient id={`gl-${uid}`} cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55"/>
            <stop offset="18%" stopColor="#d8f0f5" stopOpacity="0.32"/>
            <stop offset="45%" stopColor="#90ccd8" stopOpacity="0.18"/>
            <stop offset="75%" stopColor="#4a8fa0" stopOpacity="0.14"/>
            <stop offset="100%" stopColor="#1a4a55" stopOpacity="0.42"/>
          </radialGradient>
          <radialGradient id={`sp1-${uid}`} cx="35%" cy="28%" r="28%">
            <stop offset="0%" stopColor="white" stopOpacity="0.92"/>
            <stop offset="55%" stopColor="white" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id={`sp2-${uid}`} cx="68%" cy="72%" r="18%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </radialGradient>
          <filter id={`shd-${uid}`}>
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5"/>
          </filter>
        </defs>
        <circle cx="24" cy="24" r="22" fill={`url(#sw-${uid})`} filter={`url(#shd-${uid})`} opacity="0.88"/>
        <path d={`M16,8 C20,16 12,24 18,34 C22,40 16,42 18,44`} stroke={color.swirl} strokeWidth="2.8" fill="none" strokeOpacity="0.65" strokeLinecap="round"/>
        <path d={`M26,6 C30,14 22,22 28,32`} stroke={color.swirl} strokeWidth="1.5" fill="none" strokeOpacity="0.38" strokeLinecap="round"/>
        <circle cx="24" cy="24" r="22" fill={`url(#gl-${uid})`}/>
        <circle cx="24" cy="24" r="22" fill={`url(#sp1-${uid})`}/>
        <circle cx="24" cy="24" r="22" fill={`url(#sp2-${uid})`}/>
        <circle cx="24" cy="24" r="21.5" fill="none" stroke={color.swirl} strokeWidth="0.7" strokeOpacity="0.28"/>
        {isSelected && <circle cx="24" cy="24" r="21.5" fill="none" stroke="#00FF88" strokeWidth="2.8" opacity="0.95"/>}
      </svg>
      {isSelected && order !== null && (
        <div style={{
          position: 'absolute', top: -4, right: -4,
          width: 16, height: 16,
          background: 'linear-gradient(135deg, #00FF88, #00CC6F)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, fontWeight: 'bold', color: '#000',
          border: '1.5px solid white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          zIndex: 20,
        }}>
          {order}
        </div>
      )}
    </div>
  );
};

export default function MarbleSelector({
  selectedMarbleIds,
  onToggleMarble,
  onClearAll,
  maxMarbles = 20
}: MarbleSelectorProps) {
  const { t } = useLanguage();
  const [manualInput, setManualInput] = useState("");
  const marbles = Array.from({ length: maxMarbles }, (_, i) => i);

  const handleManualInputChange = (value: string) => {
    const num = parseInt(value);
    if (value === "" || (num >= 0 && num <= maxMarbles)) {
      setManualInput(value);
    }
  };

  const applyManualInput = () => {
    const count = parseInt(manualInput);
    if (count > 0 && count <= maxMarbles) {
      onClearAll();
      for (let i = 0; i < count; i++) {
        onToggleMarble(i);
      }
      setManualInput("");
    }
  };

  const quickSelect = (count: number) => {
    onClearAll();
    for (let i = 0; i < Math.min(count, maxMarbles); i++) {
      onToggleMarble(i);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <div>
          <h3 className="text-base sm:text-xl md:text-2xl font-bold text-primary uppercase tracking-wider">
            {t("selectMarbles")}
          </h3>
          <p className="text-sm sm:text-base text-[#00FF88]" style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>
            {selectedMarbleIds.length} / {maxMarbles} selected
          </p>
        </div>
        {selectedMarbleIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="bg-destructive/30 text-destructive border-destructive/60 hover:bg-destructive/50 font-bold text-xs sm:text-sm"
            data-testid="button-clear-all"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 p-2 bg-black/30 rounded-lg border border-primary/30">
        <span className="text-xs sm:text-sm text-primary/80 whitespace-nowrap">Quick:</span>
        <div className="flex gap-1">
          {[1, 5, 10, 15, 20].filter(n => n <= maxMarbles).map(num => (
            <Button
              key={num}
              size="sm"
              variant="outline"
              onClick={() => quickSelect(num)}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs font-bold bg-primary/20 border-primary/40 hover:bg-primary/40"
              data-testid={`quick-select-${num}`}
            >
              {num}
            </Button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min="1"
            max={maxMarbles}
            value={manualInput}
            onChange={(e) => handleManualInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyManualInput()}
            placeholder="0"
            className="w-12 h-7 sm:w-14 sm:h-8 text-center text-xs sm:text-sm bg-black/40 border-primary/40 px-1"
            data-testid="input-manual-marble-count"
          />
          <Button
            size="sm"
            onClick={applyManualInput}
            disabled={!manualInput || parseInt(manualInput) < 1}
            className="h-7 sm:h-8 px-2 text-xs bg-[#00FF88] text-black hover:bg-[#00CC6F]"
            data-testid="button-apply-manual-count"
          >
            Set
          </Button>
        </div>
      </div>

      <div className="p-2 sm:p-4 md:p-6 bg-gradient-to-b from-black/40 to-black/20 rounded-xl sm:rounded-2xl border border-primary/30 shadow-xl">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-1 sm:gap-2 md:gap-3">
          {marbles.map((id) => {
            const isSelected = selectedMarbleIds.includes(id);
            const order = isSelected ? selectedMarbleIds.indexOf(id) + 1 : null;
            const color = marbleColors[id % marbleColors.length];
            return (
              <button
                key={id}
                onClick={() => onToggleMarble(id)}
                className={`rounded-full cursor-pointer transition-all duration-200 transform hover:scale-110 relative flex items-center justify-center ${isSelected ? "scale-110 z-10" : ""}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  filter: isSelected ? 'drop-shadow(0 0 6px rgba(0,255,136,0.7))' : 'none',
                }}
                data-testid={`marble-${id}`}
              >
                <TransparentMarble color={color} isSelected={isSelected} order={order} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
