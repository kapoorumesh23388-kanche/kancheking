import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
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
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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

  const MIN_AGE = 18;

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
    if (loginMethod === "email") {
      if (!email.trim() || !email.includes("@")) {
        toast({ title: "Error", description: "Please enter a valid email", variant: "destructive" });
        return;
      }
    } else {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 10) {
        toast({ title: "Error", description: "Please enter a valid mobile number", variant: "destructive" });
        return;
      }
    }
    setIsLoading(true);
    try {
      const url = loginMethod === "email" ? "/api/auth/send-otp" : "/api/auth/mobile/send-otp";
      const body = loginMethod === "email"
        ? { email: email.trim().toLowerCase() }
        : { phone: phone.replace(/\D/g, "") };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
      setStep("otp");
      toast({
        title: "OTP Sent!",
        description: loginMethod === "email" ? `Check your email ${email}` : `Check your mobile ${phone}`,
      });
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
      const url = loginMethod === "email" ? "/api/auth/verify-otp" : "/api/auth/mobile/verify-otp";
      const body = loginMethod === "email"
        ? { email: email.trim().toLowerCase(), otp }
        : { phone: phone.replace(/\D/g, ""), otp };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

    // Hard block: Kanche King requires players to be 18 or older.
    // No account is created for anyone under this age — this is checked
    // again on the server too, this is just the first line of defense.
    if (age < MIN_AGE) {
      toast({
        title: "Age Requirement Not Met",
        description: `Kanche King is only available to players aged ${MIN_AGE} and above. We're not able to create an account for you at this time.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const url = loginMethod === "email" ? "/api/auth/complete-signup" : "/api/auth/mobile/complete-signup";
      const body = loginMethod === "email"
        ? { email: email.trim().toLowerCase(), displayName: displayName.trim(), gender, dateOfBirth, age }
        : { phone: phone.replace(/\D/g, ""), displayName: displayName.trim(), gender, dateOfBirth, age };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      localStorage.setItem("playerIsAgeVerified", age >= MIN_AGE ? "true" : "false");
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
      window.dispatchEvent(new Event("ageVerified"));
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
            {step === "contact" ? "Login or create account with email or mobile" : step === "otp" ? `OTP sent to ${loginMethod === "email" ? email : phone}` : "Set up your player profile"}
          </p>
        </CardHeader>

        <CardContent className="space-y-5">

          {/* STEP 1: Email or Mobile */}
          {step === "contact" && (
            <>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant={loginMethod === "email" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setLoginMethod("email")}
                  data-testid="button-login-method-email"
                >
                  <Mail className="w-4 h-4 mr-1" /> Email
                </Button>
                <Button
                  type="button"
                  variant={loginMethod === "mobile" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setLoginMethod("mobile")}
                  data-testid="button-login-method-mobile"
                >
                  📱 Mobile
                </Button>
              </div>

              {loginMethod === "email" ? (
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
              ) : (
                <div>
                  <Label className="text-primary font-semibold mb-2 block">
                    📱 Mobile Number
                  </Label>
                  <Input
                    type="tel"
                    placeholder="Enter your 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                    className="bg-primary/10 border-primary/30 text-white placeholder:text-muted-foreground"
                    onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                  />
                </div>
              )}

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
                ← Change {loginMethod === "email" ? "Email" : "Mobile Number"}
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
                <p className="text-xs text-muted-foreground mt-2">You must be 18 or older to create an account.</p>
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

      {/* Footer — same public links as the logged-in Home page footer.
          These work without OTP because App.tsx whitelists these paths
          (see PUBLIC_PATHS) so the onboarding wall doesn't block them. */}
      <footer className="w-full max-w-md mx-5 mt-6">
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/about" className="text-[#00D9FF] hover:text-[#E91E8C] transition-colors" data-testid="link-about">
            About Us
          </Link>
          <Link href="/blog" className="text-[#00D9FF] hover:text-[#E91E8C] transition-colors" data-testid="link-blog">
            Blogs
          </Link>
          <Link href="/terms" className="text-[#00D9FF] hover:text-[#E91E8C] transition-colors" data-testid="link-terms">
            Terms & Conditions
          </Link>
          <Link href="/privacy" className="text-[#00D9FF] hover:text-[#E91E8C] transition-colors" data-testid="link-privacy-policy">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
