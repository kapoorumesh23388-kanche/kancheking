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
  { c1: "#ff4444", c2: "#cc0000", swirl: "#ffcc00" },
  { c1: "#00aaff", c2: "#0044cc", swirl: "#88ddff" },
  { c1: "#00cc44", c2: "#006622", swirl: "#88ffaa" },
  { c1: "#cc44ff", c2: "#6600cc", swirl: "#ffaaff" },
  { c1: "#ffcc00", c2: "#ff8800", swirl: "#ffffff" },
  { c1: "#00cccc", c2: "#006688", swirl: "#aaffff" },
  { c1: "#ff4488", c2: "#cc0044", swirl: "#ffaacc" },
  { c1: "#88cc00", c2: "#446600", swirl: "#ccff44" },
  { c1: "#ff6600", c2: "#cc2200", swirl: "#ffaa44" },
  { c1: "#4444ff", c2: "#000099", swirl: "#aaaaff" },
];

const GlassMarble = ({ color, isSelected, order }: { color: typeof marbleColors[0], isSelected: boolean, order: number | null }) => {
  const uid = color.c1.replace('#', '') + color.c2.replace('#', '');
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg width="44" height="44" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <defs>
          <radialGradient id={`base-${uid}`} cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="white" stopOpacity="0.92"/>
            <stop offset="18%" stopColor={color.c1} stopOpacity="0.8"/>
            <stop offset="55%" stopColor={color.c2} stopOpacity="0.65"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0.75"/>
          </radialGradient>
          <radialGradient id={`shine-${uid}`} cx="30%" cy="26%" r="36%">
            <stop offset="0%" stopColor="white" stopOpacity="1"/>
            <stop offset="55%" stopColor="white" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id={`depth-${uid}`} cx="62%" cy="66%" r="42%">
            <stop offset="0%" stopColor={color.c2} stopOpacity="0.45"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0"/>
          </radialGradient>
          <filter id={`shadow-${uid}`}>
            <feDropShadow dx="1" dy="2.5" stdDeviation="2.5" floodColor="#000" floodOpacity="0.6"/>
          </filter>
        </defs>
        {/* Main glass body */}
        <circle cx="24" cy="24" r="22" fill={`url(#base-${uid})`} filter={`url(#shadow-${uid})`}/>
        {/* Inner glass swirls */}
        <ellipse cx="27" cy="28" rx="10" ry="4.5" fill={color.swirl} opacity="0.16" transform="rotate(-40 27 28)"/>
        <ellipse cx="19" cy="21" rx="6" ry="2.5" fill={color.swirl} opacity="0.11" transform="rotate(25 19 21)"/>
        {/* Depth */}
        <circle cx="24" cy="24" r="22" fill={`url(#depth-${uid})`}/>
        {/* Main shine highlight */}
        <ellipse cx="16" cy="14" rx="9" ry="6" fill={`url(#shine-${uid})`}/>
        {/* Small bottom shine */}
        <circle cx="31" cy="33" r="2.5" fill="white" opacity="0.13"/>
        {/* Selected ring */}
        {isSelected && <circle cx="24" cy="24" r="21.5" fill="none" stroke="#00FF88" strokeWidth="2.8" opacity="0.95"/>}
      </svg>
      {/* Selection number badge */}
      {isSelected && order !== null && (
        <div style={{
          position: 'absolute', top: -4, right: -4,
          width: 18, height: 18,
          background: 'linear-gradient(135deg, #00FF88, #00CC6F)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 'bold', color: '#000',
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

      {/* Quick Select */}
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

      {/* Glass Marbles Grid */}
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
                className={`rounded-full cursor-pointer transition-all duration-200 transform hover:scale-110 relative flex items-center justify-center ${
                  isSelected ? "scale-110 z-10" : ""
                }`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  filter: isSelected ? 'drop-shadow(0 0 6px rgba(0,255,136,0.7))' : 'none',
                }}
                data-testid={`marble-${id}`}
              >
                <GlassMarble color={color} isSelected={isSelected} order={order} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
