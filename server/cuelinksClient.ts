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
      // Field name per Cuelinks docs is "subid" (not "subid1"), and
      // shorten:true asks for a clean clnk.in short link in short_url.
      body: JSON.stringify({ url: targetUrl, subid: subId, shorten: true }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[cuelinksClient] convert error:", response.status, errorBody);
      return { success: false, trackedLink: targetUrl, error: `Cuelinks API returned ${response.status}` };
    }

    const body: any = await response.json();
    // The real response shape is { data: { tracking_url, short_url, affiliated, ... } }
    // — everything was previously read off the top-level object instead of
    // body.data, so trackedLink was always undefined and this silently
    // fell back to the plain (uncommissioned) URL on every single call.
    const data = body.data || body;
    if (data.affiliated === false) {
      console.error("[cuelinksClient] link not affiliated (campaign inactive or access not granted) for", targetUrl);
    }
    const trackedLink = data.short_url || data.tracking_url || targetUrl;
    return { success: true, trackedLink };
  } catch (err) {
    console.error("[cuelinksClient] convert exception:", err);
    return { success: false, trackedLink: targetUrl, error: String(err) };
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

// Picks one live offer at random from the top-performing batch, for
// variety across different players/vouchers. Returns null if no live
// offers could be fetched (API down, key missing/invalid, network issue,
// or no live coupon offers currently available) — callers must handle
// this by asking the player to try again, rather than ever substituting
// a fabricated/unverified code. A previous built-in fallback list of
// guessed coupon codes (e.g. "DOM25") was removed because those codes
// were never real and always failed at checkout.
export async function pickRandomOffer(): Promise<VoucherOffer | null> {
  const offers = await getLiveOffers();
  if (offers.length > 0) {
    return offers[Math.floor(Math.random() * offers.length)];
  }
  return null;
}
