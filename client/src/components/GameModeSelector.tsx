import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type GameMode = "solo" | "local" | "online" | "tournament" | "challenge";

interface GameModeSelectorProps {
  onModeSelect?: (mode: GameMode) => void;
}

export default function GameModeSelector({ onModeSelect }: GameModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>("local");

  const handleModeClick = (mode: GameMode) => {
    setSelectedMode(mode);
    onModeSelect?.(mode);
    console.log("Game mode selected:", mode);
  };

  const modes: Array<{
    id: GameMode;
    label: string;
    icon: string;
  }> = [
    { id: "solo", label: "Solo Practice", icon: "ðŸŽ¯" },
    { id: "local", label: "1v1 Local", icon: "ðŸ‘¥" },
    { id: "online", label: "Online", icon: "ðŸŒ" },
    { id: "tournament", label: "Tournament", icon: "ðŸ†" },
    { id: "challenge", label: "Daily Challenge", icon: "â­" },
  ];

  return (
    <Card className="bg-white/5 border-2 border-primary/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <h3 className="text-2xl font-bold text-primary text-center mb-5">
          Select Game Mode
        </h3>
        <div className="flex gap-4 justify-center flex-wrap">
          {modes.map((mode) => (
            <Badge
              key={mode.id}
              className={`cursor-pointer px-8 py-4 text-base font-semibold transition-all ${
                selectedMode === mode.id
                  ? "bg-gradient-to-r from-primary to-[#FFA500] text-primary-foreground shadow-[0_5px_15px_rgba(255,215,0,0.5)] scale-105"
                  : "bg-primary/20 border-2 border-primary/40 text-primary hover:bg-primary/30"
              }`}
              onClick={() => handleModeClick(mode.id)}
              data-testid={`button-mode-${mode.id}`}
            >
              {mode.icon} {mode.label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


