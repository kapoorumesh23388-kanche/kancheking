import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";

export default function OnboardingProfile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [gender, setGender] = useState<"boy" | "girl">("boy");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setProfileImage(imageUrl);
        setImagePreview(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("No user ID");

      // Save profile to localStorage
      localStorage.setItem("playerDisplayName", displayName);
      localStorage.setItem("playerProfileImageUpdate", profileImage);
      localStorage.setItem("playerGender", gender);
      localStorage.setItem("playerProfileCompleted", "true");

      // Update backend
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          displayName,
          profileImage,
          gender,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      // Dispatch event to update Header
      window.dispatchEvent(new Event("profileUpdated"));

      toast({
        title: "Success!",
        description: "Profile created! Ready to play.",
      });

      // Redirect to home
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
      <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 max-w-md w-full mx-5">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary mb-2">
            Welcome to Kanche King!
          </CardTitle>
          <p className="text-muted-foreground">Create your profile to start playing</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 border-2 border-primary/50">
              <AvatarImage src={imagePreview} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                {displayName.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <Label className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 rounded-lg hover:bg-primary/30 transition">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload Photo</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                data-testid="input-profile-image"
              />
            </Label>
          </div>

          {/* Player Name */}
          <div>
            <Label htmlFor="name" className="text-primary font-semibold mb-2 block">
              Your Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-primary/10 border-primary/30 text-white placeholder:text-muted-foreground focus:border-primary"
              data-testid="input-player-name"
            />
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender" className="text-primary font-semibold mb-2 block">
              Gender
            </Label>
            <Select value={gender} onValueChange={(value) => setGender(value as "boy" | "girl")}>
              <SelectTrigger className="bg-primary/10 border-primary/30 text-white" data-testid="select-gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-primary/40">
                <SelectItem value="boy" className="text-white hover:bg-primary/20">
                  Boy
                </SelectItem>
                <SelectItem value="girl" className="text-white hover:bg-primary/20">
                  Girl
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground font-bold py-6 text-lg"
            data-testid="button-continue"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              "Let's Play!"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
