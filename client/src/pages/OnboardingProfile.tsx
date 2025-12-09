import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, TrendingUp, Smartphone, Gamepad2, Shirt, Car, Home, Utensils, Plane, Heart } from "lucide-react";

const AD_INTEREST_CATEGORIES = [
  { id: "sharemarket", label: "Share Market & Finance", icon: TrendingUp },
  { id: "electronics", label: "Electronics & Gadgets", icon: Smartphone },
  { id: "gaming", label: "Gaming & Entertainment", icon: Gamepad2 },
  { id: "fashion", label: "Fashion & Lifestyle", icon: Shirt },
  { id: "automobiles", label: "Automobiles & Vehicles", icon: Car },
  { id: "realestate", label: "Real Estate & Property", icon: Home },
  { id: "food", label: "Food & Restaurants", icon: Utensils },
  { id: "travel", label: "Travel & Tourism", icon: Plane },
  { id: "health", label: "Health & Fitness", icon: Heart },
];

export default function OnboardingProfile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [gender, setGender] = useState<"boy" | "girl">("boy");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [adInterests, setAdInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const toggleAdInterest = (interestId: string) => {
    setAdInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

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

    if (!dateOfBirth) {
      toast({
        title: "Error",
        description: "Please enter your date of birth",
        variant: "destructive",
      });
      return;
    }

    const age = calculateAge(dateOfBirth);
    if (age < 10) {
      toast({
        title: "Age Restriction",
        description: "You must be at least 10 years old to play",
        variant: "destructive",
      });
      return;
    }

    if (adInterests.length === 0) {
      toast({
        title: "Select Interests",
        description: "Please select at least one ad interest category",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("No user ID");

      // Save to localStorage FIRST
      localStorage.setItem("playerDisplayName", displayName);
      localStorage.setItem("playerProfileImageUpdate", profileImage);
      localStorage.setItem("playerGender", gender);
      localStorage.setItem("playerDateOfBirth", dateOfBirth);
      localStorage.setItem("playerAge", String(age));
      localStorage.setItem("playerAdInterests", JSON.stringify(adInterests));
      localStorage.setItem("playerIsAgeVerified", "true");
      localStorage.setItem("playerProfileCompleted", "true");

      // Then update backend
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          displayName,
          profileImage,
          gender,
          dateOfBirth,
          age,
          adInterests,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.warn("Backend profile update had issues:", data);
        // Continue anyway since localStorage is saved
      }

      console.log("✅ Profile saved:", { displayName, gender, age, adInterests });

      // Dispatch events to update Header and other components
      window.dispatchEvent(new Event("profileUpdated"));
      window.dispatchEvent(new Event("ageVerified"));

      // Redirect immediately - don't wait
      navigate("/");
    } catch (error) {
      console.error("Profile save error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive",
      });
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

          {/* Date of Birth - Age Verification */}
          <div>
            <Label htmlFor="dob" className="text-primary font-semibold mb-2 block">
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="bg-primary/10 border-primary/30 text-white focus:border-primary"
              data-testid="input-date-of-birth"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Required for age verification. Must be 10+ to play, 15+ for purchases.
            </p>
          </div>

          {/* Ad Interests Selection */}
          <div>
            <Label className="text-primary font-semibold mb-3 block">
              Ad Interests (Select categories you like)
            </Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
              {AD_INTEREST_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = adInterests.includes(category.id);
                return (
                  <div
                    key={category.id}
                    onClick={() => toggleAdInterest(category.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-primary/20 border-primary/60" 
                        : "bg-white/5 border-white/20 hover:bg-white/10"
                    }`}
                    data-testid={`checkbox-interest-${category.id}`}
                  >
                    <Checkbox 
                      checked={isSelected}
                      className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm ${isSelected ? "text-primary font-medium" : "text-white/80"}`}>
                      {category.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Select categories to see relevant ads. You can change this later in settings.
            </p>
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
