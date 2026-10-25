// Android App Links: when someone taps a Kanche King invite link
// (https://kancheking.com/join?...) and the app is installed, Android opens
// the APP instead of the browser. The app loads the live website, so here we
// just move it to the page the link points to.
//
// Safe everywhere: does nothing on the website and in older APK builds that
// don't include the @capacitor/app plugin yet.

import { Capacitor } from "@capacitor/core";

let lastHandledUrl = "";
let lastHandledAt = 0;

export async function initAppLinks(navigate: (to: string) => void): Promise<() => void> {
  try {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable("App")) {
      return () => {};
    }
    const { App } = await import("@capacitor/app");

    const go = (rawUrl?: string | null) => {
      if (!rawUrl) return;
      // The same link can arrive twice on a cold start — ignore the repeat.
      if (rawUrl === lastHandledUrl && Date.now() - lastHandledAt < 3000) return;
      try {
        const url = new URL(rawUrl);
        const host = url.hostname.replace(/^www\./, "");
        if (host !== "kancheking.com") return;
        if (!url.pathname.startsWith("/join")) return; // only invite links
        lastHandledUrl = rawUrl;
        lastHandledAt = Date.now();
        navigate(url.pathname + url.search);
      } catch {
        /* not a valid URL — ignore */
      }
    };

    // App already running (or brought to the front) by a link.
    const handle = await App.addListener("appUrlOpen", (event) => go(event.url));
    // App was started by the link.
    try {
      const launch = await App.getLaunchUrl();
      go(launch?.url);
    } catch {
      /* no launch URL */
    }
    return () => {
      void handle.remove();
    };
  } catch (e) {
    console.log("[AppLinks] init skipped:", e);
    return () => {};
  }
}
