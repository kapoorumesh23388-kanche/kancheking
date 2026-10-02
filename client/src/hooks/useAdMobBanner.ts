import { useEffect } from "react";
import { showBanner, removeBanner, isAdMobAvailable, BANNER_SPACE_PX } from "@/lib/admob";

/**
 * Shows the native AdMob banner at the bottom while the calling page is
 * mounted and removes it when leaving. Does nothing on the website.
 * Returns the bottom padding (px) the page should reserve for the banner.
 */
export function useAdMobBanner(enabled: boolean = true): number {
  useEffect(() => {
    if (!enabled || !isAdMobAvailable()) return;
    void showBanner();
    return () => {
      void removeBanner();
    };
  }, [enabled]);

  return enabled && isAdMobAvailable() ? BANNER_SPACE_PX : 0;
}
