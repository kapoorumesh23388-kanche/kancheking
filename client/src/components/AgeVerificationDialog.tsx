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
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDayChange = (value: string) => {
    const num = parseInt(value);
    if (value === "" || (value.length <= 2 && num >= 0 && num <= 31)) {
      setDay(value);
    }
  };

  const handleMonthChange = (value: string) => {
    const num = parseInt(value);
    if (value === "" || (value.length <= 2 && num >= 0 && num <= 12)) {
      setMonth(value);
    }
  };

  const handleYearChange = (value: string) => {
    if (value === "" || (value.length <= 4 && /^\d*$/.test(value))) {
      setYear(value);
    }
  };

  const calculateAge = (d: number, m: number, y: number): number => {
    const today = new Date();
    const birthDate = new Date(y, m - 1, d);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleVerify = async () => {
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    if (!day || !month || !year || isNaN(d) || isNaN(m) || isNaN(y)) {
      toast({
        title: "Error",
        description: "Please enter your complete date of birth",
        variant: "destructive",
      });
      return;
    }

    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > new Date().getFullYear()) {
      toast({
        title: "Error",
        description: "Please enter a valid date of birth",
        variant: "destructive",
      });
      return;
    }

    const age = calculateAge(d, m, y);

    if (age < 15) {
      toast({
        title: "Age Restriction",
        description: "You must be at least 15 years old to make purchases",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const dob = `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
      localStorage.setItem("playerDateOfBirth", dob);
      localStorage.setItem("playerIsAgeVerified", "true");

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
            <Label className="text-base font-semibold">
              Date of Birth (DD-MM-YYYY)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="DD"
                value={day}
                onChange={(e) => handleDayChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-2 border-primary/30 bg-white/5 text-base h-12 text-center text-lg font-semibold w-16"
                data-testid="input-day"
                maxLength={2}
              />
              <span className="text-xl text-muted-foreground">-</span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="MM"
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-2 border-primary/30 bg-white/5 text-base h-12 text-center text-lg font-semibold w-16"
                data-testid="input-month"
                maxLength={2}
              />
              <span className="text-xl text-muted-foreground">-</span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="YYYY"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-2 border-primary/30 bg-white/5 text-base h-12 text-center text-lg font-semibold flex-1"
                data-testid="input-year"
                maxLength={4}
              />
            </div>
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
            disabled={isLoading || !day || !month || !year}
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
