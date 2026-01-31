import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AgeVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export default function AgeVerificationDialog({
  isOpen,
  onClose,
  onVerified,
}: AgeVerificationDialogProps) {
  const [age, setAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAgeChange = (value: string) => {
    const num = parseInt(value);
    if (value === "" || (num >= 1 && num <= 120)) {
      setAge(value);
    }
  };

  const handleVerify = async () => {
    if (!age) {
      toast({
        title: "Error",
        description: "Please enter your age",
        variant: "destructive",
      });
      return;
    }

    const ageNum = parseInt(age);

    if (ageNum < 15) {
      toast({
        title: "Age Restriction",
        description: "You must be at least 15 years old to make purchases",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Save to localStorage for now (later will be saved to backend)
      localStorage.setItem("playerAge", age);
      localStorage.setItem("playerIsAgeVerified", "true");

      // Dispatch event for other components to listen
      window.dispatchEvent(new Event("ageVerified"));

      toast({
        title: "Success",
        description: "Age verification completed! You can now purchase marbles.",
      });

      onVerified();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify age. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background/95 to-background/80 border-2 border-primary/30 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Age Verification Required
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            In-app purchases are only available for players 15 years or older.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="age" className="text-base font-semibold">
              Your Age
            </Label>
            <Input
              id="age"
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              placeholder="Enter your age (e.g., 18)"
              value={age}
              onChange={(e) => handleAgeChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-2 border-primary/30 bg-white/5 text-base h-12 text-center text-lg font-semibold"
              data-testid="input-age"
            />
            <p className="text-xs text-muted-foreground mt-2">
              You must be 15 years or older to make purchases. This information is kept private and secure.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel-age-verify"
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={isLoading || !age}
            className="flex-1 bg-gradient-to-r from-primary to-[#FFA500]"
            data-testid="button-verify-age"
          >
            {isLoading ? "Verifying..." : "Verify & Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
