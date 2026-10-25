import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core";
import { Copy, Check, Share2, MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  buildInviteUrl,
  buildInviteText,
  whatsappShareUrl,
  telegramShareUrl,
  copyText,
} from "@/lib/invite";

interface InviteShareProps {
  /** The sender's own referral code (for the referral bonus). */
  referralCode?: string | null;
  /** Set when sharing a live Challenge Friend room. */
  roomCode?: string | null;
  /** Hide the link box when the page already shows the link. */
  showLink?: boolean;
}

// Inside the Android app the normal web share does not exist, so we use the
// native share sheet (WhatsApp, Instagram, Telegram, SMS…) from the
// @capacitor/share plugin. Falls back to the web buttons everywhere else
// (website, and older APK builds without the plugin).
function nativeShareAvailable(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("Share");
  } catch {
    return false;
  }
}

/** WhatsApp / Telegram / Copy / More share buttons for an invite link. */
export default function InviteShare({ referralCode, roomCode, showLink = true }: InviteShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const url = buildInviteUrl(referralCode, roomCode);
  const text = buildInviteText(roomCode);

  const openExternal = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async () => {
    const ok = await copyText(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied!", description: "Paste it anywhere — Instagram, Facebook, SMS…" });
    } else {
      toast({ title: "Couldn't copy", description: url, variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title: "Kanche King", text, url, dialogTitle: "Invite a friend" });
    } catch (e: any) {
      // Closing the sheet rejects with a "canceled" message — that is fine.
      if (!/cancel/i.test(String(e?.message || e))) await handleCopy();
    }
  };

  const handleMore = async () => {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: "Kanche King", text, url });
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return; // user closed the sheet
      }
    }
    await handleCopy();
  };

  return (
    <div className="space-y-3" data-testid="invite-share">
      {showLink && (
        <div className="bg-black/40 border border-primary/20 rounded-lg p-2 sm:p-3">
          <p className="text-[10px] sm:text-xs text-muted-foreground break-all font-mono" data-testid="text-invite-link">
            {url}
          </p>
        </div>
      )}
      {nativeShareAvailable() ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button
            type="button"
            className="bg-[#25D366] hover:bg-[#1ebe5a] text-black font-bold flex items-center justify-center gap-2"
            onClick={handleNativeShare}
            data-testid="button-share-native"
          >
            <Share2 className="w-4 h-4" /> Share (WhatsApp, Instagram…)
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={handleCopy}
            data-testid="button-copy-invite"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Link
              </>
            )}
          </Button>
        </div>
      ) : (
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Button
          type="button"
          className="bg-[#25D366] hover:bg-[#1ebe5a] text-black font-bold flex items-center justify-center gap-2"
          onClick={() => openExternal(whatsappShareUrl(text, url))}
          data-testid="button-share-whatsapp"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </Button>
        <Button
          type="button"
          className="bg-[#229ED9] hover:bg-[#1c8bc0] text-white font-bold flex items-center justify-center gap-2"
          onClick={() => openExternal(telegramShareUrl(text, url))}
          data-testid="button-share-telegram"
        >
          <Send className="w-4 h-4" /> Telegram
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={handleCopy}
          data-testid="button-copy-invite"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy Link
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={handleMore}
          data-testid="button-share-more"
        >
          <Share2 className="w-4 h-4" /> Instagram / More
        </Button>
      </div>
      )}
    </div>
  );
}
