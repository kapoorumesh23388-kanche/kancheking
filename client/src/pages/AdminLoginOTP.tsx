import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

type Step = "credentials" | "phone" | "otp";

export default function AdminLoginOTP() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("credentials");
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState("");

  const handleLoginStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminId || !password) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/admin/send-otp", { adminId, password });
      const data = await res.json();
      
      if (data.success) {
        setMaskedPhone(data.phoneNumber);
        setStep("otp");
        toast({ title: "Success", description: "OTP sent to your phone!" });
      } else {
        toast({ title: "Error", description: data.error || "Failed to send OTP", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send OTP", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      toast({ title: "Error", description: "Please enter OTP", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/admin/verify-otp", { adminId, otp });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        toast({ title: "Success", description: "Logged in successfully!" });
        setLocation("/admin");
      } else {
        toast({ title: "Error", description: data.error || "Invalid OTP", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "OTP verification failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black flex items-center justify-center">
      <div className="container max-w-md mx-auto px-5">
        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-primary mb-2">Admin Login</CardTitle>
            <CardDescription>
              {step === "credentials" && "Enter your credentials"}
              {step === "otp" && "Enter the OTP sent to your phone"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "credentials" && (
              <form onSubmit={handleLoginStep1} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Admin ID</label>
                  <Input
                    placeholder="Enter admin ID"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    disabled={isLoading}
                    data-testid="input-admin-id"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      data-testid="input-admin-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground font-bold py-6"
                  disabled={isLoading}
                  data-testid="button-send-otp"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Phone className="w-5 h-5 text-primary" />
                    <p className="text-muted-foreground">OTP sent to phone ending in <strong>{maskedPhone}</strong></p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Enter OTP (6 digits)</label>
                  <Input
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    disabled={isLoading}
                    data-testid="input-otp"
                    maxLength={6}
                    className="text-center text-2xl font-bold tracking-widest"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground font-bold py-6"
                  disabled={isLoading || otp.length !== 6}
                  data-testid="button-verify-otp"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep("credentials");
                    setOtp("");
                  }}
                  data-testid="button-back-login"
                >
                  Back
                </Button>
              </form>
            )}

            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-muted-foreground text-center">
              <p><strong>Default Admin Credentials:</strong></p>
              <p>ID: admin</p>
              <p>Password: admin123</p>
              <p className="text-xs mt-2 text-yellow-500">⚠️ Change password immediately after first login!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
