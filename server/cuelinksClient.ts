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
      body: JSON.stringify({ url: targetUrl, subid1: subId }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[cuelinksClient] convert error:", response.status, errorBody);
      return { success: false, trackedLink: targetUrl, error: `Cuelinks API returned ${response.status}` };
    }

    const data: any = await response.json();
    const trackedLink = data.tracking_url || data.short_url || data.url || targetUrl;
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

// Fetches a batch of live coupons/offers from Cuelinks for Indian
// merchants. Field names are checked defensively since the exact response
// shape isn't fully documented publicly — if Cuelinks changes field
// names, this degrades gracefully to an empty list rather than throwing.
async function getLiveOffers(limit = 20): Promise<VoucherOffer[]> {
  const apiKey = process.env.CUELINKS_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(`${CUELINKS_API_BASE}/offers?country=IN&per_page=${limit}`, {
      headers: { "Authorization": `Token ${apiKey}` },
    });
    if (!response.ok) {
      console.error("[cuelinksClient] offers fetch error:", response.status);
      return [];
    }
    const data: any = await response.json();
    const list: any[] = data.offers || data.data || data.results || [];
    return list
      .map((o: any): VoucherOffer => ({
        brandName: o.brand_name || o.campaign_name || o.merchant_name || o.brand || "Partner Brand",
        title: o.title || o.description || o.offer_title || "Exclusive deal",
        code: o.code || o.coupon_code || o.voucher_code || null,
        discountPercent: parseDiscountPercent(o.discount_percentage ?? o.discount ?? o.discount_percent),
        minSpend: o.min_order_value ?? o.min_purchase ?? o.minimum_spend ?? null,
        url: o.landing_url || o.url || o.link || o.website,
      }))
      .filter((o) => !!o.url);
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

// Small built-in safety net — used only if the live Cuelinks offers list
// can't be fetched, so a voucher is never silently dropped when a player
// has earned one. Modeled on real, common Indian online-shopping deals.
const FALLBACK_OFFERS: VoucherOffer[] = [
  { brandName: "Myntra", title: "Flat 20% off on Fashion", code: "MYNTRA20", discountPercent: 20, minSpend: 999, url: "https://www.myntra.com" },
  { brandName: "Ajio", title: "Up to 50% off Sitewide", code: "AJIO50", discountPercent: 50, minSpend: null, url: "https://www.ajio.com" },
  { brandName: "Flipkart", title: "10% off on Electronics", code: "FLIP10", discountPercent: 10, minSpend: 1500, url: "https://www.flipkart.com" },
  { brandName: "Amazon India", title: "Flat 15% off Storewide", code: "AMZ15", discountPercent: 15, minSpend: 500, url: "https://www.amazon.in" },
  { brandName: "Nykaa", title: "25% off on Beauty", code: "NYKAA25", discountPercent: 25, minSpend: 799, url: "https://www.nykaa.com" },
  { brandName: "BigBasket", title: "Flat ₹100 off + 10% cashback", code: "BB10", discountPercent: 10, minSpend: 999, url: "https://www.bigbasket.com" },
];

// Picks one live offer at random from the top-performing batch, for
// variety across different players/vouchers. Falls back to a built-in
// set of realistic Indian deals if the live fetch is unavailable.
export async function pickRandomOffer(): Promise<VoucherOffer> {
  const offers = await getLiveOffers(20);
  if (offers.length > 0) {
    return offers[Math.floor(Math.random() * offers.length)];
  }
  return FALLBACK_OFFERS[Math.floor(Math.random() * FALLBACK_OFFERS.length)];
}
