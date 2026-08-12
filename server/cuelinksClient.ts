// Thin wrapper around the Cuelinks V3 API. Used by the Brand Voucher
// system — when a player redeems Reward Points for a voucher offer, we
// convert that offer's brand URL into a Cuelinks tracked link and send
// that to the player. When they shop through it, Kanche King earns a
// commission from Cuelinks.
// Docs: https://developers.cuelinks.com/docs
const CUELINKS_API_BASE = "https://developers.cuelinks.com/pub_api/v3";

interface ConvertLinkResult {
  success: boolean;
  trackedLink: string;
  error?: string;
}

// Converts a plain brand/product URL into a Cuelinks tracked link, tagged
// with subId so any resulting commission can be traced back to the player
// who redeemed it. If the Cuelinks call fails for any reason, we fall back
// to the original (untracked) URL so the voucher still works for the
// player — we just won't earn commission on that particular click.
export async function convertToTrackedLink(targetUrl: string, subId: string): Promise<ConvertLinkResult> {
  const apiKey = process.env.CUELINKS_API_KEY;
  if (!apiKey) {
    console.error("[cuelinksClient] CUELINKS_API_KEY not set — sending player the plain (untracked) link");
    return { success: false, trackedLink: targetUrl, error: "Cuelinks API key not configured" };
  }

  try {
    const response = await fetch(`${CUELINKS_API_BASE}/links/convert`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: targetUrl, subid1: subId }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[cuelinksClient] convert error:", response.status, errorBody);
      return { success: false, trackedLink: targetUrl, error: `Cuelinks API returned ${response.status}` };
    }

    const data: any = await response.json();
    // Field name has appeared as both tracking_url and short_url in
    // different Cuelinks docs/examples — check both defensively.
    const trackedLink = data.tracking_url || data.short_url || data.url || targetUrl;
    return { success: true, trackedLink };
  } catch (err) {
    console.error("[cuelinksClient] convert exception:", err);
    return { success: false, trackedLink: targetUrl, error: String(err) };
  }
}
