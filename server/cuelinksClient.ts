// Thin wrapper around the Cuelinks V3 API. Used by the Brand Voucher
// system — when a player earns a voucher (by winning), we pick a LIVE
// coupon/offer from Cuelinks (real brand, discount %, coupon code where
// one exists) and convert its landing URL into a tracked affiliate link.
// When the player shops through it, Kanche King earns a commission.
// Docs: https://developers.cuelinks.com/docs
const CUELINKS_API_BASE = "https://developers.cuelinks.com/pub_api/v3";

interface ConvertLinkResult {
  success: boolean;
  trackedLink: string;
  affiliated: boolean;
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
    return { success: false, trackedLink: targetUrl, affiliated: false, error: "Cuelinks API key not configured" };
  }

  // channel_id is optional per the Cuelinks docs, but leaving it out means
  // Cuelinks picks a default channel on the account — which turned out to
  // be an old, never-verified "/blog" channel (its ID, 309080, showed up
  // in every "not affiliated" error). Always specify the verified channel
  // explicitly so conversions never silently fall back to an unverified one.
  const channelId = process.env.CUELINKS_CHANNEL_ID;
  if (!channelId) {
    console.error("[cuelinksClient] CUELINKS_CHANNEL_ID not set — Cuelinks will pick a default channel, which may be an unverified one");
  }

  try {
    const response = await fetch(`${CUELINKS_API_BASE}/links/convert`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      // Field name per Cuelinks docs is "subid" (not "subid1"), and
      // shorten:true asks for a clean clnk.in short link in short_url.
      // channel_id pins this conversion to our verified channel explicitly
      // (see comment above) instead of an ambiguous account default.
      body: JSON.stringify({
        url: targetUrl,
        subid: subId,
        shorten: true,
        ...(channelId ? { channel_id: Number(channelId) } : {}),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[cuelinksClient] convert error:", response.status, errorBody);
      return { success: false, trackedLink: targetUrl, affiliated: false, error: `Cuelinks API returned ${response.status}` };
    }

    const body: any = await response.json();
    // The real response shape is { data: { tracking_url, short_url, affiliated, ... } }
    // — everything was previously read off the top-level object instead of
    // body.data, so trackedLink was always undefined and this silently
    // fell back to the plain (uncommissioned) URL on every single call.
    const data = body.data || body;
    const affiliated = data.affiliated !== false; // treat missing field as affiliated
    if (!affiliated) {
      console.error("[cuelinksClient] link not affiliated (this brand's program hasn't been joined/approved in the Cuelinks dashboard yet) for", targetUrl);
    }
    const trackedLink = data.short_url || data.tracking_url || targetUrl;
    return { success: true, trackedLink, affiliated };
  } catch (err) {
    console.error("[cuelinksClient] convert exception:", err);
    return { success: false, trackedLink: targetUrl, affiliated: false, error: String(err) };
  }
}

export interface VoucherOffer {
  brandName: string;
  title: string;           // human-readable, e.g. "Flat 25% off on fashion"
  code: string | null;     // coupon code, null if the discount auto-applies via the link
  discountPercent: number | null;
  minSpend: number | null; // in ₹
  url: string;
}

// Only offers from these brands are shown to players — keeps vouchers
// recognizable/relevant for an Indian audience. This is a FILTER applied
// to live data only; unlike the old FALLBACK_OFFERS list, nothing here is
// ever used as offer data itself — every code/link a player receives
// still comes straight from the live Cuelinks response.
const INDIAN_BRAND_WHITELIST = [
  "myntra", "ajio", "zudio", "pantaloons", "westside", "max fashion",
  "domino's", "dominos", "pizza hut", "zomato", "swiggy", "mcdonald's", "mcdonalds", "kfc",
  "flipkart", "amazon", "croma",
  "nykaa", "purplle",
  "bigbasket", "blinkit",
  "makemytrip", "oyo",
  "bookmyshow", "urban company",
];

function isWhitelistedIndianBrand(campaignName: string): boolean {
  const name = (campaignName || "").toLowerCase();
  return INDIAN_BRAND_WHITELIST.some((brand) => name.includes(brand));
}

// Fetches a batch of live coupons/offers from Cuelinks and filters down to
// well-known Indian brands. /offers has no country parameter (only
// /campaigns does, via a numeric country_id) so filtering happens
// client-side against INDIAN_BRAND_WHITELIST instead of guessing at an
// unverified country_id server-side.
async function getLiveOffers(): Promise<VoucherOffer[]> {
  const apiKey = process.env.CUELINKS_API_KEY;
  if (!apiKey) return [];

  try {
    // offer_type=coupon: only offers that actually carry a redeemable
    // code. per_page=500 (API max) in one call, then filter client-side —
    // cheaper and simpler than looking up a country_id and paginating
    // /campaigns first.
    const response = await fetch(`${CUELINKS_API_BASE}/offers?offer_type=coupon&per_page=500`, {
      headers: { "Authorization": `Token ${apiKey}` },
    });
    if (!response.ok) {
      console.error("[cuelinksClient] offers fetch error:", response.status, await response.text());
      return [];
    }
    const body: any = await response.json();
    // Confirmed shape per Cuelinks docs: { data: [...], meta: {...} }
    const list: any[] = body.data || [];
    return list
      .filter((o: any) => isWhitelistedIndianBrand(o.campaign_name))
      .map((o: any): VoucherOffer => ({
        brandName: o.campaign_name || "Partner Brand",
        title: o.title || o.description || "Exclusive deal",
        code: o.coupon_code || null,
        // Real field is percent_off, not discount_percentage/discount.
        discountPercent: parseDiscountPercent(o.percent_off),
        // The API has no min-spend field — only original_price/discount_price
        // (absolute amounts, not a threshold), so this stays null rather
        // than guessing at a field that doesn't exist.
        minSpend: null,
        // Real field is tracking_url — this was previously read as
        // landing_url/url/link/website, none of which ever exist on a
        // real response, so every live offer got silently dropped by the
        // filter below and the function always fell through to the fake
        // fallback list.
        url: o.tracking_url,
      }))
      .filter((o) => !!o.url && !!o.code);
  } catch (err) {
    console.error("[cuelinksClient] getLiveOffers exception:", err);
    return [];
  }
}


function parseDiscountPercent(value: any): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? parseFloat(value.replace(/[^\d.]/g, "")) : Number(value);
  return isNaN(num) ? null : Math.round(num);
}

// Picks a live offer AND converts its link in one step, skipping any
// candidate whose brand program hasn't actually been joined/approved in
// the Cuelinks dashboard yet (platform-level API approval does NOT mean
// every individual brand is auto-approved — each one has to be joined
// separately). Tries up to 5 different live offers before giving up, so a
// couple of not-yet-joined brands in the whitelist don't block every
// voucher. Returns null if nothing affiliated could be found — callers
// must handle this by asking the player to try again, rather than ever
// handing out a voucher for a brand that isn't really affiliated (which is
// exactly what was happening before: real live coupon data, real code,
// but the tracked link came back unaffiliated because the account had
// never joined that brand's specific program).
export async function pickAffiliatedOffer(subId: string): Promise<{ offer: VoucherOffer; trackedLink: string } | null> {
  const offers = await getLiveOffers();
  if (offers.length === 0) return null;

  // Shuffle so repeated calls don't always hammer the same few offers in
  // the same order.
  const shuffled = [...offers].sort(() => Math.random() - 0.5);
  const candidates = shuffled.slice(0, 5);

  for (const offer of candidates) {
    const result = await convertToTrackedLink(offer.url, subId);
    if (result.success && result.affiliated) {
      return { offer, trackedLink: result.trackedLink };
    }
  }

  console.error("[cuelinksClient] No affiliated offer found among", candidates.length, "candidates — check which brand programs are actually joined/approved in the Cuelinks dashboard");
  return null;
}
