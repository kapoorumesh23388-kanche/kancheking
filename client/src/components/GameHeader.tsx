import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GameHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-lg z-50 border-b border-primary/30">
      <div className="flex justify-between items-center px-5 py-3">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full bg-primary/20 text-primary hover:bg-primary/40 hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,215,0,0.5)]"
            data-testid="button-back"
          >
            ←
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full bg-primary/20 text-primary hover:bg-primary/40 hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,215,0,0.5)]"
            data-testid="button-profile"
          >
            <User className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full bg-primary/20 text-primary hover:bg-primary/40 hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,215,0,0.5)]"
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
