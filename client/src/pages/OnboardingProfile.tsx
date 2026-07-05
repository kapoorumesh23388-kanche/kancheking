import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Upload, Mail, Shield } from "lucide-react";

type Step = "contact" | "otp" | "profile";

export default function OnboardingProfile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Step control
  const [step, setStep] = useState<Step>("contact");

  // Contact step
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [existingUserId, setExistingUserId] = useState("");
  const [existingName, setExistingName] = useState("");

  // Profile step
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [gender, setGender] = useState<"boy" | "girl">("boy");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
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

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Error", description: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
      setStep("otp");
      toast({ title: "OTP Sent!", description: `Check your email ${email}` });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      toast({ title: "Error", description: "Enter 6-digit OTP", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      if (data.isNewUser) {
        // New user — do NOT touch localStorage account state yet.
        // The account is only created once the profile (name) step is submitted.
        setIsNewUser(true);
        setStep("profile");
      } else {
        // Existing user — login directly
        setExistingUserId(data.userId);
        setExistingName(data.displayName);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("playerId", data.userId);
        localStorage.setItem("playerDisplayName", data.displayName);
        localStorage.setItem("playerProfileCompleted", "true");
        window.dispatchEvent(new Event("profileUpdated"));
        toast({ title: "Welcome back!", description: `Logged in as ${data.displayName}` });
        navigate("/");
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Invalid OTP", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Save Profile (new users only) - creates the account atomically with the name
  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast({ title: "Error", description: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!dateOfBirth) {
      toast({ title: "Error", description: "Please enter your date of birth", variant: "destructive" });
      return;
    }
    const age = calculateAge(dateOfBirth);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          displayName: displayName.trim(),
          gender,
          dateOfBirth,
          age,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");

      const userId = data.userId;
      localStorage.setItem("userId", userId);
      localStorage.setItem("playerId", userId);
      localStorage.setItem("playerRewardPoints", "0");
      localStorage.setItem("playerMarbles", "150");
      localStorage.setItem("gamesPlayed", "0");
      localStorage.setItem("gamesWon", "0");
      localStorage.setItem("playerDisplayName", data.displayName);
      localStorage.setItem("playerGender", gender);
      localStorage.setItem("playerDateOfBirth", dateOfBirth);
      localStorage.setItem("playerAge", String(age));
      localStorage.setItem("playerIsAgeVerified", age >= 15 ? "true" : "false");
      localStorage.setItem("playerProfileCompleted", "true");

      // Upload profile image separately if one was chosen (non-critical, best-effort)
      if (profileImage) {
        fetch("/api/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, profileImage }),
        }).catch(() => {});
      }

      window.dispatchEvent(new Event("profileUpdated"));
      if (age >= 15) window.dispatchEvent(new Event("ageVerified"));
      navigate("/");
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
      <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40 max-w-md w-full mx-5">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary mb-2">
            {step === "contact" ? "Welcome to Kanche King!" : step === "otp" ? "Enter OTP" : "Create Profile"}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {step === "contact" ? "Login or create account with your email" : step === "otp" ? `OTP sent to ${email}` : "Set up your player profile"}
          </p>
        </CardHeader>

        <CardContent className="space-y-5">

          {/* STEP 1: Email */}
          {step === "contact" && (
            <>
              <div>
                <Label className="text-primary font-semibold mb-2 block">
                  <Mail className="w-4 h-4 inline mr-1" /> Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-primary/10 border-primary/30 text-white placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                />
              </div>
              <Button
                onClick={handleSendOTP}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-[#FFA500] font-bold py-6 text-lg"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : "Send OTP"}
              </Button>
            </>
          )}

          {/* STEP 2: OTP Verify */}
          {step === "otp" && (
            <>
              <div>
                <Label className="text-primary font-semibold mb-2 block">
                  <Shield className="w-4 h-4 inline mr-1" /> Enter 6-digit OTP
                </Label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="bg-primary/10 border-primary/30 text-white text-center text-2xl tracking-widest"
                  maxLength={6}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
                />
              </div>
              <Button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-primary to-[#FFA500] font-bold py-6 text-lg"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : "Verify OTP"}
              </Button>
              <Button variant="ghost" onClick={() => setStep("contact")} className="w-full text-muted-foreground">
                ← Change Email
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Didn't receive? <span className="text-primary cursor-pointer" onClick={handleSendOTP}>Resend OTP</span>
              </p>
            </>
          )}

          {/* STEP 3: Profile Setup (new users only) */}
          {step === "profile" && (
            <>
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
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </Label>
              </div>

              <div>
                <Label className="text-primary font-semibold mb-2 block">Your Name</Label>
                <Input
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-primary/10 border-primary/30 text-white placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <Label className="text-primary font-semibold mb-2 block">Gender</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as "boy" | "girl")}>
                  <SelectTrigger className="bg-primary/10 border-primary/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-primary/40">
                    <SelectItem value="boy" className="text-white">Boy</SelectItem>
                    <SelectItem value="girl" className="text-white">Girl</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-primary font-semibold mb-2 block">Date of Birth</Label>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="bg-primary/10 border-primary/30 text-white"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-[#FFA500] font-bold py-6 text-lg"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up...</> : "Let's Play! 🎮"}
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
