// Helpers for the "Invite a friend" links (Challenge Friend + Profile).
//
// A link looks like:
//   https://kancheking.com/join?room=ROOMABC123&ref=REFXYZ12
//   https://kancheking.com/join?ref=REFXYZ12            (general invite)
// "room" is optional (only when sharing a live challenge room), "ref" is the
// sender's personal referral code (used for the bonus).

export function buildInviteUrl(referralCode?: string | null, roomCode?: string | null): string {
  const params = new URLSearchParams();
  if (roomCode) params.set("room", roomCode);
  if (referralCode) params.set("ref", referralCode);
  const query = params.toString();
  return `${window.location.origin}/join${query ? `?${query}` : ""}`;
}

export function buildInviteText(roomCode?: string | null): string {
  return roomCode
    ? "🎯 I challenge you to Kali Jotta (Kanche King)! Tap the link to join my room and play:"
    : "🎯 Play Kali Jotta (Kanche King) with me — the classic Indian marble game! Join with my link:";
}

export function whatsappShareUrl(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
}

export function telegramShareUrl(text: string, url: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/** Copy text to the clipboard (works in browsers and in the Android WebView). */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy method */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}
