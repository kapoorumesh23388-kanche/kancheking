// Full-screen splash/loading screen shown when the app first opens
// (e.g. right when the Play Store APK launches). Purely decorative —
// but it no longer dismisses on a fixed timer alone. It waits for BOTH:
//   1. `minDurationMs` to elapse (keeps the branded splash pacing/feel)
//   2. `isAppReady` to become true (the app has actually finished its
//      startup checks and the window has fully loaded — images/fonts etc.)
// Whichever finishes later is what determines when onComplete() fires.
// This avoids the splash disappearing early on a slow connection and
// dropping the player onto a half-loaded screen.
// See App.tsx for how it's wired in before the normal onboarding/home flow.
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
  isAppReady: boolean;
  minDurationMs?: number;
}

export default function SplashScreen({ onComplete, isAppReady, minDurationMs = 5000 }: SplashScreenProps) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Minimum-duration timer — guarantees the branded splash is visible for
  // at least this long even on a fast connection, same as before.
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), minDurationMs);
    return () => clearTimeout(timer);
  }, [minDurationMs]);

  // Only calls onComplete once BOTH the minimum time has passed AND the
  // app has reported itself ready. If the app is still loading (slow
  // network, etc.) the splash simply stays up past minDurationMs instead
  // of dropping the player onto an unfinished screen.
  useEffect(() => {
    if (minTimeElapsed && isAppReady) {
      onComplete();
    }
  }, [minTimeElapsed, isAppReady, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #120a2e 0%, #1c1240 50%, #2a1a4a 100%)" }}
      data-testid="screen-splash"
    >
      {/* Illustration is authored for a portrait phone canvas. On a wide
          desktop/laptop screen we don't stretch or crop it edge-to-edge
          (that squashed the marbles and cut off the title) — instead it
          stays centered as a phone-shaped panel, at a width capped
          relative to the viewport height, with the same gradient behind
          it so the edges blend in seamlessly instead of looking cut off. */}
      <svg
        viewBox="0 0 300 650"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        className="block h-full w-auto max-w-full"
        style={{ aspectRatio: "300 / 650" }}
      >
        <title>Kanche King</title>
        <desc>Dark starry night background with glowing floating marbles and the app title</desc>
        <defs>
          <linearGradient id="splashSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#120a2e" />
            <stop offset="50%" stopColor="#1c1240" />
            <stop offset="100%" stopColor="#2a1a4a" />
          </linearGradient>
          <radialGradient id="splashGlowRed" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ff8a7a" />
            <stop offset="60%" stopColor="#e8455a" />
            <stop offset="100%" stopColor="#c22a45" />
          </radialGradient>
          <radialGradient id="splashGlowBlue" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#8fd8ff" />
            <stop offset="60%" stopColor="#3ba8e8" />
            <stop offset="100%" stopColor="#1f6fb8" />
          </radialGradient>
          <radialGradient id="splashGlowGreen" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#b0f090" />
            <stop offset="60%" stopColor="#5fc85a" />
            <stop offset="100%" stopColor="#2f9840" />
          </radialGradient>
          <radialGradient id="splashGlowGold" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff0b0" />
            <stop offset="60%" stopColor="#f0b840" />
            <stop offset="100%" stopColor="#c98a1f" />
          </radialGradient>
          <radialGradient id="splashGlowPurple" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#d0a8ff" />
            <stop offset="60%" stopColor="#9860e8" />
            <stop offset="100%" stopColor="#6a38b8" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="300" height="650" fill="url(#splashSky)" />

        {/* stars */}
        {[
          [30, 60, 1.4, 0.8], [80, 40, 1, 0.6], [140, 70, 1.6, 0.9], [200, 35, 1, 0.6],
          [260, 55, 1.3, 0.8], [20, 140, 1, 0.5], [270, 130, 1.4, 0.7], [110, 20, 1, 0.5],
          [45, 230, 1.2, 0.6], [250, 220, 1, 0.5], [160, 180, 1.3, 0.7], [15, 480, 1.2, 0.5],
          [285, 460, 1.4, 0.6], [60, 580, 1, 0.5], [230, 600, 1.3, 0.6],
        ].map(([cx, cy, r, o], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#ffffff" opacity={o} />
        ))}

        {/* floating glowing marbles */}
        {[
          { cx: 42, cy: 150, r: 16, fill: "splashGlowBlue" },
          { cx: 255, cy: 105, r: 13, fill: "splashGlowGold" },
          { cx: 30, cy: 330, r: 14, fill: "splashGlowGreen" },
          { cx: 268, cy: 310, r: 17, fill: "splashGlowRed" },
          { cx: 55, cy: 500, r: 11, fill: "splashGlowPurple" },
          { cx: 245, cy: 530, r: 15, fill: "splashGlowBlue" },
          { cx: 150, cy: 40, r: 9, fill: "splashGlowGreen" },
          { cx: 12, cy: 410, r: 10, fill: "splashGlowGold" },
        ].map((m, i) => (
          <g key={i} opacity={0.85}>
            <circle cx={m.cx} cy={m.cy} r={m.r} fill={`url(#${m.fill})`} />
            <ellipse cx={m.cx - m.r * 0.3} cy={m.cy - m.r * 0.35} rx={m.r * 0.25} ry={m.r * 0.18} fill="#ffffff" opacity={0.6} />
          </g>
        ))}

        <text x="150" y="270" textAnchor="middle" fontSize="52" fontWeight="800" fill="#ffb547" stroke="#7a3a10" strokeWidth="3" paintOrder="stroke" fontFamily="Verdana, sans-serif">
          Kanche
        </text>
        <text x="150" y="325" textAnchor="middle" fontSize="52" fontWeight="800" fill="#ffb547" stroke="#7a3a10" strokeWidth="3" paintOrder="stroke" fontFamily="Verdana, sans-serif">
          King
        </text>
        <text x="150" y="365" textAnchor="middle" fontSize="14" fill="#bcd4ff" fontFamily="Verdana, sans-serif" letterSpacing="1.5">
          THE MARBLE CHAMPIONSHIP
        </text>
      </svg>

      <div className="absolute bottom-[70px] left-0 right-0 flex flex-col items-center gap-2.5">
        <div className="w-[30px] h-[30px] rounded-full border-4 border-white/20 border-t-[#ffb547] animate-spin" />
        <div className="text-sm font-medium text-[#e8e0ff] tracking-wide">Kanche King loading</div>
      </div>
    </div>
  );
}
