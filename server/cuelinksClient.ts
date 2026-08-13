// Thin wrapper around the Cuelinks V3 API. Used by the Brand Voucher
// system — when a player earns a voucher (by winning), we pick a LIVE
// campaign from Cuelinks (no manually-curated brand list) and convert its
// URL into a tracked affiliate link. When the player shops through it,
// Kanche King earns a commission from Cuelinks.
// Docs: https://developers.cuelinks.com/docs
const CUELINKS_API_BASE = "https://developers.cuelinks.com/pub_api/v3";

interface ConvertLinkResult {
  success: boolean;
  trackedLink: string;
  error?: string;
}

// Converts a plain brand/product URL into a Cuelinks tracked link, tagged
// with subId so any resulting commission can be traced back to the player
// who earned it. Falls back to the original (untracked) URL if the
// Cuelinks call fails, so the voucher still works for the player.
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

interface Campaign {
  name: string;
  url: string;
}

// Fetches a batch of live, high-performing campaigns from Cuelinks
// (sorted by 7-day EPC — earnings per click). Field names are checked
// defensively since the exact response shape isn't fully documented
// publicly; if Cuelinks changes field names, this degrades gracefully to
// an empty list rather than throwing.
async function getTopCampaigns(limit = 10): Promise<Campaign[]> {
  const apiKey = process.env.CUELINKS_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(`${CUELINKS_API_BASE}/campaigns?sort=epc_7d&per_page=${limit}`, {
      headers: { "Authorization": `Token ${apiKey}` },
    });
    if (!response.ok) {
      console.error("[cuelinksClient] campaigns fetch error:", response.status);
      return [];
    }
    const data: any = await response.json();
    const list: any[] = data.campaigns || data.data || data.results || [];
    return list
      .map((c: any) => ({
        name: c.name || c.campaign_name || c.brand_name || "Partner Brand",
        url: c.landing_url || c.url || c.website || c.tracking_url,
      }))
      .filter((c: Campaign) => !!c.url);
  } catch (err) {
    console.error("[cuelinksClient] getTopCampaigns exception:", err);
    return [];
  }
}

// Small built-in safety net — only used if the live Cuelinks campaign
// list can't be fetched for some reason, so a voucher is never silently
// dropped when a player has earned one.
const FALLBACK_BRANDS: Campaign[] = [
  { name: "Amazon", url: "https://www.amazon.in" },
  { name: "Flipkart", url: "https://www.flipkart.com" },
  { name: "Myntra", url: "https://www.myntra.com" },
];

// Picks one live campaign at random from the top-performing batch, for
// variety across different players/vouchers.
export async function pickRandomCampaign(): Promise<Campaign> {
  const campaigns = await getTopCampaigns(10);
  if (campaigns.length > 0) {
    return campaigns[Math.floor(Math.random() * campaigns.length)];
  }
  return FALLBACK_BRANDS[Math.floor(Math.random() * FALLBACK_BRANDS.length)];
}
