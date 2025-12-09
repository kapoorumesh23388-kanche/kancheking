import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Swords, X, Check } from "lucide-react";

interface ChallengeData {
  challengerId: string;
  challengerName: string;
  challengerMarbles: number;
  challengerImage?: string;
  roomCode: string;
}

interface ChallengePopupProps {
  challenge: ChallengeData | null;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ChallengePopup({ challenge, onAccept, onDecline }: ChallengePopupProps) {
  if (!challenge) return null;

  return (
    <Dialog open={!!challenge} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="bg-gradient-to-b from-[#1a0a2e] to-[#0d0416] border-2 border-[#E91E8C] max-w-sm mx-auto">
        <DialogTitle className="sr-only">Challenge Received</DialogTitle>
        <DialogDescription className="sr-only">
          {challenge.challengerName} wants to challenge you to a marble game
        </DialogDescription>
        
        <div className="text-center space-y-4 py-4">
          <div className="flex justify-center">
            <div className="relative">
              <Swords className="w-16 h-16 text-[#E91E8C] animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-[#E91E8C]/30 rounded-full" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
            Challenge Received!
          </h2>
          
          <div className="bg-black/50 rounded-xl p-4 border border-[#E91E8C]/30">
            <div className="flex items-center justify-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-[#E91E8C]">
                <AvatarImage src={challenge.challengerImage} />
                <AvatarFallback className="bg-[#E91E8C]/20 text-[#E91E8C] text-xl font-bold">
                  {challenge.challengerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-xl font-bold text-white" data-testid="text-challenger-name">
                  {challenge.challengerName}
                </p>
                <p className="text-[#FFD700] font-semibold" data-testid="text-challenger-marbles">
                  {challenge.challengerMarbles} marbles
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-[#C8E6F0]">
            wants to play Kanche with you!
          </p>
          
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onDecline}
              variant="outline"
              className="flex-1 border-red-500 text-red-400 hover:bg-red-500/20"
              data-testid="button-decline-challenge"
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button
              onClick={onAccept}
              className="flex-1 bg-gradient-to-r from-[#00D9FF] to-[#00FF88] text-black font-bold hover:opacity-90"
              data-testid="button-accept-challenge"
            >
              <Check className="w-4 h-4 mr-2" />
              Accept
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
