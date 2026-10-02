// AdMob (native Android app only).
//
// The website itself keeps using AdSense. Inside the Capacitor Android app
// (which loads https://kancheking.com in a WebView) we use real AdMob ads via
// the @capacitor-community/admob native plugin. Everything here is a safe
// no-op on the normal website and on older APK builds that don't have the
// plugin yet, so this file can be deployed to Render before the new APK ships.

import { Capacitor } from "@capacitor/core";

// ---------------------------------------------------------------------------
// 1) SET THESE BEFORE RELEASE
// ---------------------------------------------------------------------------
// Keep true while developing. Google's official TEST ad units are used, so
// you can click ads freely without risking an account ban.
// Before uploading the Play Store build: set to false AND paste your real
// ad unit IDs below (AdMob console -> Apps -> Kanche King -> Ad units).
export const USE_TEST_ADS = true;

const REAL_AD_UNITS = {
  banner: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  interstitial: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  rewarded: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
};

// Google's public sample IDs (safe for testing, never earn money).
const TEST_AD_UNITS = {
  banner: "ca-app-pub-3940256099942544/6300978111",
  interstitial: "ca-app-pub-3940256099942544/1033173712",
  rewarded: "ca-app-pub-3940256099942544/5224354917",
};

const AD_UNITS = USE_TEST_ADS ? TEST_AD_UNITS : REAL_AD_UNITS;

// Interstitial pacing: never more than one every 3 finished games, and never
// closer than 2 minutes apart. Keeps the game pleasant and policy-safe.
const INTERSTITIAL_EVERY_N_GAMES = 3;
const INTERSTITIAL_MIN_GAP_MS = 2 * 60 * 1000;

// ---------------------------------------------------------------------------
// 2) Plugin loading
// ---------------------------------------------------------------------------
type AdMobModule = typeof import("@capacitor-community/admob");

let modulePromise: Promise<AdMobModule> | null = null;
let initPromise: Promise<boolean> | null = null;

/** True only inside the Android app AND only if this APK includes the plugin. */
export function isAdMobAvailable(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("AdMob");
  } catch {
    return false;
  }
}

function loadModule(): Promise<AdMobModule> {
  if (!modulePromise) modulePromise = import("@capacitor-community/admob");
  return modulePromise;
}

/** Initialise the SDK once (safe to call many times). Resolves false if ads are unavailable. */
export function initAdMob(): Promise<boolean> {
  if (!isAdMobAvailable()) return Promise.resolve(false);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const { AdMob, MaxAdContentRating, AdmobConsentStatus } = await loadModule();

      await AdMob.initialize({
        initializeForTesting: USE_TEST_ADS,
        // The game is family-friendly: only show ads suitable for general /
        // parental-guidance audiences.
        maxAdContentRating: MaxAdContentRating.ParentalGuidance,
      });

      // Consent (GDPR / EEA users). For users outside those regions this
      // returns NOT_REQUIRED and no form is shown.
      try {
        const info = await AdMob.requestConsentInfo();
        if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
          await AdMob.showConsentForm();
        }
      } catch (e) {
        console.log("[AdMob] consent step skipped:", e);
      }
      return true;
    } catch (e) {
      console.log("[AdMob] init failed:", e);
      return false;
    }
  })();

  return initPromise;
}

// ---------------------------------------------------------------------------
// 3) Banner
// ---------------------------------------------------------------------------
// Height reserved at the bottom of the page while the native banner is up, so
// it never covers buttons. (Adaptive banner is ~50-60dp on phones.)
export const BANNER_SPACE_PX = 64;

let bannerVisible = false;

export async function showBanner(): Promise<void> {
  if (!(await initAdMob())) return;
  if (bannerVisible) return;
  try {
    const { AdMob, BannerAdSize, BannerAdPosition } = await loadModule();
    await AdMob.showBanner({
      adId: AD_UNITS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: USE_TEST_ADS,
    });
    bannerVisible = true;
  } catch (e) {
    console.log("[AdMob] banner failed:", e);
  }
}

export async function removeBanner(): Promise<void> {
  if (!bannerVisible) return;
  bannerVisible = false;
  try {
    const { AdMob } = await loadModule();
    await AdMob.removeBanner();
  } catch (e) {
    console.log("[AdMob] removeBanner failed:", e);
  }
}

// ---------------------------------------------------------------------------
// 4) Interstitial (between games)
// ---------------------------------------------------------------------------
let gamesSinceInterstitial = 0;
let lastInterstitialAt = 0;
let interstitialReady = false;

async function prepareInterstitial(): Promise<void> {
  if (interstitialReady || !(await initAdMob())) return;
  try {
    const { AdMob } = await loadModule();
    await AdMob.prepareInterstitial({ adId: AD_UNITS.interstitial, isTesting: USE_TEST_ADS });
    interstitialReady = true;
  } catch (e) {
    console.log("[AdMob] prepareInterstitial failed:", e);
  }
}

/** Call once at app start so the first interstitial is already loaded. */
export function preloadInterstitial(): void {
  void prepareInterstitial();
}

/**
 * Call when a game/round finishes (e.g. on "Play Again"). Shows an interstitial
 * only every Nth call and only if enough time has passed. Never throws, never
 * blocks the game for more than the ad itself.
 */
export async function maybeShowInterstitial(): Promise<void> {
  if (!isAdMobAvailable()) return;

  gamesSinceInterstitial += 1;
  if (gamesSinceInterstitial < INTERSTITIAL_EVERY_N_GAMES) {
    void prepareInterstitial();
    return;
  }
  if (Date.now() - lastInterstitialAt < INTERSTITIAL_MIN_GAP_MS) return;

  if (!interstitialReady) await prepareInterstitial();
  if (!interstitialReady) return;

  try {
    const { AdMob } = await loadModule();
    interstitialReady = false;
    gamesSinceInterstitial = 0;
    lastInterstitialAt = Date.now();
    await AdMob.showInterstitial();
  } catch (e) {
    console.log("[AdMob] showInterstitial failed:", e);
  } finally {
    void prepareInterstitial(); // load the next one in the background
  }
}

// ---------------------------------------------------------------------------
// 5) Rewarded video (Shop -> Watch Ads)
// ---------------------------------------------------------------------------
export type RewardedResult = "rewarded" | "not_completed" | "unavailable";

/**
 * Loads and plays one rewarded video.
 *  - "rewarded"      -> user watched it fully, safe to give the reward
 *  - "not_completed" -> user closed it early
 *  - "unavailable"   -> no ad could be loaded/shown (no fill, offline, web)
 */
export async function showRewardedAd(): Promise<RewardedResult> {
  if (!(await initAdMob())) return "unavailable";

  const { AdMob, RewardAdPluginEvents } = await loadModule();
  const handles: Array<{ remove: () => Promise<void> }> = [];
  let earned = false;

  try {
    handles.push(
      await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        earned = true;
      }),
    );

    await AdMob.prepareRewardVideoAd({ adId: AD_UNITS.rewarded, isTesting: USE_TEST_ADS });

    // showRewardVideoAd resolves when the ad is finished / dismissed.
    await AdMob.showRewardVideoAd();
    return earned ? "rewarded" : "not_completed";
  } catch (e) {
    console.log("[AdMob] rewarded failed:", e);
    return earned ? "rewarded" : "unavailable";
  } finally {
    for (const h of handles) {
      try {
        await h.remove();
      } catch {
        /* ignore */
      }
    }
  }
}
