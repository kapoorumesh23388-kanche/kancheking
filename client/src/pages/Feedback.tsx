import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

export default function Feedback() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({ title: "Error", description: "Please enter your feedback", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Thank you for your feedback! 🙏" });
        setName("");
        setEmail("");
        setMessage("");
      } else {
        toast({ title: "Error", description: "Failed to submit feedback", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit feedback", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-2xl mx-auto px-5">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2" style={{ textShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            📝 Send Us Feedback
          </h1>
          <p className="text-muted-foreground">Help us improve the game! Your thoughts matter.</p>
        </div>

        <Card className="bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary/40">
          <CardHeader>
            <CardTitle>Share Your Thoughts</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Your Name (Optional)
                </label>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/30 border-primary/30"
                  data-testid="input-feedback-name"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Email (Optional)
                </label>
                <Input
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/30 border-primary/30"
                  data-testid="input-feedback-email"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Your Feedback
                </label>
                <Textarea
                  placeholder="Tell us what you think about the game, features you'd like, bugs you found, etc..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-black/30 border-primary/30 min-h-32"
                  data-testid="textarea-feedback-message"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground font-bold py-6"
                data-testid="button-submit-feedback"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Send Feedback
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Types of feedback we love:</strong>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Feature requests or game mechanics suggestions</li>
                <li>• Bugs or crashes you encountered</li>
                <li>• Design feedback or UI improvements</li>
                <li>• Performance issues</li>
                <li>• General thoughts and experiences</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
