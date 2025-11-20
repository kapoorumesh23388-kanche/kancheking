import { Settings, User, ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GameHeader() {
  const [location, setLocation] = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playerName, setPlayerName] = useState("Rajesh Kumar");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const showBackButton = location !== "/";

  const handleBack = () => {
    window.history.back();
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    console.log("Profile saved:", { playerName, profilePic });
    setShowProfile(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-lg z-50 border-b border-primary/30">
        <div className="flex justify-between items-center px-5 py-3">
          <div className="flex gap-2">
            {showBackButton && (
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full bg-primary/20 text-primary hover:bg-primary/40 hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                onClick={handleBack}
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-primary/20 text-primary hover:bg-primary/40 hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,215,0,0.5)]"
              onClick={() => setShowProfile(true)}
              data-testid="button-profile"
            >
              <User className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-primary/20 text-primary hover:bg-primary/40 hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,215,0,0.5)]"
              onClick={() => setShowSettings(true)}
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-card border-2 border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Player Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-[#FFA500] flex items-center justify-center text-4xl text-primary-foreground border-4 border-primary">
                    {playerName.charAt(0).toUpperCase()}
                  </div>
                )}
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/80"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-photo"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicChange}
                  data-testid="input-profile-pic"
                />
              </div>
              
              <div className="w-full space-y-2">
                <Label htmlFor="player-name" className="text-foreground">
                  Player Name
                </Label>
                <Input
                  id="player-name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-center text-lg font-bold bg-primary/10 border-primary/30"
                  data-testid="input-player-name"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">Player ID: #12345</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-primary/10 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Marbles</p>
                <p className="text-2xl font-bold text-[#00FF88]">1000</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Games Played</p>
                <p className="text-2xl font-bold text-primary">45</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Games Won</p>
                <p className="text-2xl font-bold text-[#00FF88]">32</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-primary">71%</p>
              </div>
            </div>
            
            <Button
              className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground font-bold"
              onClick={handleSaveProfile}
              data-testid="button-save-profile"
            >
              Save Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-card border-2 border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <span className="text-foreground">Sound Effects</span>
              <Button variant="outline" size="sm">
                On
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <span className="text-foreground">Music</span>
              <Button variant="outline" size="sm">
                On
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <span className="text-foreground">Language</span>
              <Button variant="outline" size="sm">
                English
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <span className="text-foreground">Notifications</span>
              <Button variant="outline" size="sm">
                On
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
