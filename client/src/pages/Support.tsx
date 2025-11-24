import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, MessageCircle, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Support() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("support");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !message.trim()) {
      toast({ 
        title: "Error", 
        description: "Please enter your email and message", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          phone,
          subject,
          message,
          type: activeTab
        }),
      });

      if (response.ok) {
        toast({ 
          title: "Success", 
          description: activeTab === "support" 
            ? "We received your support request! We'll reply on WhatsApp/Email soon. 🙏" 
            : "Thank you for your feedback! 🙏" 
        });
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
      } else {
        toast({ title: "Error", description: "Failed to submit", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-b from-black via-blue-950 to-black">
      <div className="container max-w-3xl mx-auto px-5">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-[#FFA500] to-primary bg-clip-text text-transparent mb-3 uppercase tracking-wider" 
            style={{ textShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            Support & Feedback
          </h1>
          <p className="text-lg text-muted-foreground">We're here to help! Share your feedback or report an issue.</p>
        </div>

        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-3 border-primary/40 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">How can we help?</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-primary/20 border-2 border-primary/30">
                <TabsTrigger value="support" className="text-lg">🆘 Support</TabsTrigger>
                <TabsTrigger value="feedback" className="text-lg">💬 Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="support" className="mt-8 space-y-6">
                <div className="p-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg">
                  <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    We'll respond via WhatsApp or Email
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Submit your issue and provide your contact details. Our team will get back to you as soon as possible!
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label className="text-lg font-semibold text-primary">Your Name *</Label>
                    <Input
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-black/30 border-primary/30 mt-2"
                      data-testid="input-support-name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-lg font-semibold text-primary">Email *</Label>
                      <Input
                        placeholder="your@email.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/30 border-primary/30 mt-2"
                        data-testid="input-support-email"
                      />
                    </div>
                    <div>
                      <Label className="text-lg font-semibold text-primary">WhatsApp Number</Label>
                      <Input
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-black/30 border-primary/30 mt-2"
                        data-testid="input-support-phone"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold text-primary">Subject *</Label>
                    <Input
                      placeholder="Brief description of your issue"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-black/30 border-primary/30 mt-2"
                      data-testid="input-support-subject"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-semibold text-primary">Your Issue *</Label>
                    <Textarea
                      placeholder="Describe your issue in detail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-black/30 border-primary/30 min-h-40 mt-2"
                      data-testid="textarea-support-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-6 text-lg"
                    data-testid="button-submit-support"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" /> Submit Support Request
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="feedback" className="mt-8 space-y-6">
                <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-lg">
                  <h3 className="font-bold text-green-400 mb-3">We love your feedback!</h3>
                  <p className="text-sm text-muted-foreground">
                    Help us improve the game with your suggestions, ideas, and bug reports.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label className="text-lg font-semibold text-primary">Your Name (Optional)</Label>
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-black/30 border-primary/30 mt-2"
                      data-testid="input-feedback-name"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-semibold text-primary">Email (Optional)</Label>
                    <Input
                      placeholder="your@email.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-black/30 border-primary/30 mt-2"
                      data-testid="input-feedback-email"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-semibold text-primary">Your Feedback *</Label>
                    <Textarea
                      placeholder="Tell us what you think, feature requests, bugs you found, design suggestions, etc..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-black/30 border-primary/30 min-h-40 mt-2"
                      data-testid="textarea-feedback-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-[#FFA500] hover:from-primary/80 hover:to-[#FFA500]/80 text-primary-foreground font-bold py-6 text-lg"
                    data-testid="button-submit-feedback"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" /> Send Feedback
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>💡 We love hearing about:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Feature requests or game mechanics suggestions</li>
                    <li>• Bugs or crashes you encountered</li>
                    <li>• Design feedback or UI improvements</li>
                    <li>• Performance issues</li>
                    <li>• General thoughts and experiences</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
