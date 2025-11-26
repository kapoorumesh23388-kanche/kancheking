import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/");
      return;
    }

    // Fetch user data
    fetch(`/api/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser({...data, userId}); // Store userId in user object
        setDisplayName(data.displayName || "");
        setProfileImage(data.profileImage || "");
        setImagePreview(data.profileImage || "");
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [navigate]);

  // Handle image input
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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User not found");

      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          displayName: displayName || null,
          profileImage: profileImage || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUser({...data.user, userId: localStorage.getItem("userId")});
      
      // Save name to localStorage FIRST
      localStorage.setItem("playerDisplayName", displayName);
      localStorage.setItem("playerProfileImageUpdate", profileImage);
      localStorage.setItem("lastProfileUpdate", Date.now().toString());
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully!",
      });
      
      // Navigate back to home
      setTimeout(() => {
        navigate("/");
      }, 500);
      
      queryClient.invalidateQueries({ queryKey: ["/api/catalog"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-secondary">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Please log in to access your profile</p>
          <Button onClick={() => navigate("/")} data-testid="button-go-home">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">My Profile</h1>

        <Card className="p-8 bg-card/50 backdrop-blur border-primary/20">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-6 mb-8">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={imagePreview} alt={displayName || user.username} />
              <AvatarFallback className="text-lg font-bold">
                {(displayName || user.username || "P").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="w-full">
              <Label htmlFor="profile-image" className="text-sm font-medium">
                Profile Picture
              </Label>
              <Input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2"
                data-testid="input-profile-image"
              />
              <p className="text-xs text-secondary mt-2">
                Upload a JPG or PNG image (max 5MB)
              </p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Username (Read-only) */}
            <div>
              <Label className="text-sm font-medium">Username</Label>
              <div className="mt-2 p-3 bg-background/50 rounded-md border border-primary/10">
                <p className="font-semibold" data-testid="text-username">
                  {user.username || "Unknown"}
                </p>
              </div>
              <p className="text-xs text-secondary mt-2">Cannot be changed</p>
            </div>

            {/* Display Name */}
            <div>
              <Label htmlFor="display-name" className="text-sm font-medium">
                Display Name (Optional)
              </Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="mt-2"
                maxLength={50}
                data-testid="input-display-name"
              />
              <p className="text-xs text-secondary mt-2">
                How other players will see you ({displayName.length}/50)
              </p>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 p-4 rounded-md border border-primary/10">
                <p className="text-xs text-secondary mb-1">Games Played</p>
                <p className="text-2xl font-bold text-primary" data-testid="text-games-played">
                  {user.gamesPlayed || 0}
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-md border border-primary/10">
                <p className="text-xs text-secondary mb-1">Games Won</p>
                <p className="text-2xl font-bold text-accent" data-testid="text-games-won">
                  {user.gamesWon || 0}
                </p>
              </div>
            </div>

            {/* Inventory Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 p-4 rounded-md border border-primary/10">
                <p className="text-xs text-secondary mb-1">Marbles</p>
                <p className="text-2xl font-bold text-primary" data-testid="text-marbles">
                  {user.marbles || 0}
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-md border border-primary/10">
                <p className="text-xs text-secondary mb-1">Points</p>
                <p className="text-2xl font-bold text-accent" data-testid="text-points">
                  {user.points || 0}
                </p>
              </div>
            </div>

            {/* Purchased Marbles Info */}
            {user.purchasedMarbles > 0 && (
              <div className="bg-primary/10 p-4 rounded-md border border-primary/20">
                <p className="text-xs text-secondary mb-1">Purchased Marbles</p>
                <p className="text-xl font-bold text-primary" data-testid="text-purchased-marbles">
                  {user.purchasedMarbles}
                </p>
                <p className="text-xs text-secondary mt-2">
                  Available for tournament entry
                </p>
              </div>
            )}

            {/* Tournament Winnings Info */}
            {user.tournamentWinnings > 0 && (
              <div className="bg-accent/10 p-4 rounded-md border border-accent/20">
                <p className="text-xs text-secondary mb-1">Tournament Winnings (Temporary)</p>
                <p className="text-xl font-bold text-accent" data-testid="text-tournament-winnings">
                  {user.tournamentWinnings}
                </p>
                <p className="text-xs text-secondary mt-2">
                  Will convert to points when tournament ends
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <Button
              onClick={() => updateProfileMutation.mutate()}
              disabled={updateProfileMutation.isPending}
              className="flex-1"
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              data-testid="button-cancel-profile"
            >
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
