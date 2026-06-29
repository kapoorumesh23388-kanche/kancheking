import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface AdsPreferenceCardProps {
  currentPreference: string;
  userAge?: number;
  onPreferenceChange: (preference: string) => void;
}

export default function AdsPreferenceCard({
  currentPreference,
  userAge,
  onPreferenceChange,
}: AdsPreferenceCardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const preferences = [
    {
      id: "kids",
      label: "Kids Only",
      description: "Only kid-friendly, educational ads",
      icon: "ðŸ‘¶",
    },
    {
      id: "family",
      label: "Family Friendly",
      description: "General audience, safe for all ages",
      icon: "ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦",
    },
    {
      id: "all",
      label: "All Ads",
      description: "Show all available advertisements",
      icon: "ðŸ‘¤",
    },
  ];

  const handlePreferenceChange = async (preference: string) => {
    if (userAge && userAge < 15 && preference === "all") {
      toast({
        title: "Age Restricted",
        description: "Adult ads are not available for users under 15 years old",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      onPreferenceChange(preference);
      localStorage.setItem("playerAdsPreference", preference);
      window.dispatchEvent(new Event("adsPreferenceChanged"));
      
      toast({
        title: "Success",
        description: `Ads preference updated to ${
          preferences.find((p) => p.id === preference)?.label
        }`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ads preference",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-background/50 border-2 border-primary/10">
      <CardHeader>
        <CardTitle className="text-lg">Ads Preference</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {preferences.map((pref) => {
          const isDisabledPref = !!(userAge && userAge < 15 && pref.id === "all");
          const isSelected = currentPreference === pref.id;

          return (
            <Button
              key={pref.id}
              onClick={() => handlePreferenceChange(pref.id)}
              disabled={isLoading || isDisabledPref}
              variant={isSelected ? "default" : "outline"}
              className={`w-full h-auto py-3 px-4 justify-start text-left ${
                isSelected ? "bg-primary text-primary-foreground" : ""
              } ${isDisabledPref ? "opacity-50 cursor-not-allowed" : ""}`}
              data-testid={`button-ads-preference-${pref.id}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{pref.icon}</span>
                <div>
                  <p className="font-semibold">{pref.label}</p>
                  <p className="text-xs opacity-75">{pref.description}</p>
                  {isDisabledPref && (
                    <p className="text-xs text-orange-500 mt-1">
                      Only for 15+ years
                    </p>
                  )}
                </div>
              </div>
            </Button>
          );
        })}
        <p className="text-xs text-muted-foreground mt-4 p-2 bg-primary/5 rounded">
          Choose what type of ads match your age and interests
        </p>
      </CardContent>
    </Card>
  );
}


