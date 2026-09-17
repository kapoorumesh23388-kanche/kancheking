import { useEffect, useRef } from "react";

interface MarbleTransferAnimationProps {
  // Changing this value re-triggers the animation (e.g. Date.now() per round)
  triggerKey: number;
  // true = marbles flow from opponent's bottle into mine, false = reverse
  won: boolean;
  // how many marble dots to animate (visual only, capped for readability)
  amount: number;
  onComplete: () => void;
}

const DOT_COLORS = ["#378ADD", "#1D9E75", "#D85A30", "#D4537E", "#BA7517", "#7F77DD"];
const DOT_SIZE = 12;

// Packs `count` marble dots into a container without gaps between them,
// using a staggered (brick-like) layout so circles nest against each
// other the way real marbles settle in a jar, instead of leaving square
// gaps the way a plain flex/grid wrap would.
function packMarbles(container: HTMLDivElement, count: number) {
  const w = container.clientWidth || 56;
  const cols = Math.max(2, Math.floor(w / (DOT_SIZE * 0.9)));
  const rowH = DOT_SIZE * 0.86;
  container.innerHTML = "";
  const capped = Math.min(count, 40);
  for (let i = 0; i < capped; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const offset = row % 2 === 1 ? DOT_SIZE * 0.5 : 0;
    const x = col * (DOT_SIZE * 0.9) + offset;
    const y = row * rowH;
    const dot = document.createElement("div");
    dot.style.position = "absolute";
    dot.style.width = `${DOT_SIZE}px`;
    dot.style.height = `${DOT_SIZE}px`;
    dot.style.borderRadius = "50%";
    dot.style.background = DOT_COLORS[i % DOT_COLORS.length];
    dot.style.boxShadow = "inset -2px -2px 0 rgba(0,0,0,0.15), inset 1px 1px 0 rgba(255,255,255,0.45)";
    dot.style.left = `${x}px`;
    dot.style.bottom = `${y}px`;
    container.appendChild(dot);
  }
}

function Bottle({
  color,
  bgColor,
  jarRef,
  neckRef,
  marblesRef,
}: {
  color: string;
  bgColor: string;
  jarRef: React.RefObject<HTMLDivElement>;
  neckRef: React.RefObject<HTMLDivElement>;
  marblesRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div ref={jarRef} style={{ width: 70, height: 110, position: "relative" }}>
      <svg viewBox="0 0 100 160" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path
          d="M42 4 L58 4 L58 30 Q80 42 80 70 L80 138 Q80 156 62 156 L38 156 Q20 156 20 138 L20 70 Q20 42 42 30 Z"
          fill={bgColor}
          stroke={color}
          strokeWidth={2.5}
        />
        <path
          d="M26 60 Q24 100 26 148"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <div
        ref={marblesRef}
        style={{ position: "absolute", left: 16, right: 16, bottom: 4, top: 32 }}
      />
      <div ref={neckRef} style={{ position: "absolute", top: 0, left: 29, width: 12, height: 3 }} />
    </div>
  );
}

export default function MarbleTransferAnimation({
  triggerKey,
  won,
  amount,
  onComplete,
}: MarbleTransferAnimationProps) {
  const myJarRef = useRef<HTMLDivElement>(null);
  const myNeckRef = useRef<HTMLDivElement>(null);
  const myMarblesRef = useRef<HTMLDivElement>(null);
  const oppJarRef = useRef<HTMLDivElement>(null);
  const oppNeckRef = useRef<HTMLDivElement>(null);
  const oppMarblesRef = useRef<HTMLDivElement>(null);
  const flyLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const n = Math.max(1, Math.min(amount, 8)); // cap visible dots for readability
    // Give both bottles a starting fill so the transfer reads visually —
    // exact counts don't matter here since the real numbers are shown in
    // the player cards already; this is a purely visual accent.
    if (myMarblesRef.current) packMarbles(myMarblesRef.current, won ? 10 : 13);
    if (oppMarblesRef.current) packMarbles(oppMarblesRef.current, won ? 13 : 10);

    const fromJar = won ? oppJarRef.current : myJarRef.current;
    const fromNeck = won ? oppNeckRef.current : myNeckRef.current;
    const toJar = won ? myJarRef.current : oppJarRef.current;
    const toNeck = won ? myNeckRef.current : oppNeckRef.current;
    const layer = flyLayerRef.current;
    if (!fromJar || !fromNeck || !toJar || !toNeck || !layer) {
      onComplete();
      return;
    }

    const fromJarRect = fromJar.getBoundingClientRect();
    const fromNeckRect = fromNeck.getBoundingClientRect();
    const toJarRect = toJar.getBoundingClientRect();
    const toNeckRect = toNeck.getBoundingClientRect();
    const layerRect = layer.getBoundingClientRect();
    const size = DOT_SIZE;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < n; i++) {
      timeouts.push(
        setTimeout(() => {
          const dot = document.createElement("div");
          dot.style.position = "absolute";
          dot.style.width = `${size}px`;
          dot.style.height = `${size}px`;
          dot.style.borderRadius = "50%";
          dot.style.background = DOT_COLORS[i % DOT_COLORS.length];
          dot.style.boxShadow = "inset -2px -2px 0 rgba(0,0,0,0.15), inset 1px 1px 0 rgba(255,255,255,0.4)";

          const startX = fromJarRect.left - layerRect.left + fromJarRect.width / 2 - size / 2;
          const startY = fromJarRect.bottom - layerRect.top - 24 - size / 2;
          const exitX = fromNeckRect.left - layerRect.left + fromNeckRect.width / 2 - size / 2;
          const exitY = fromNeckRect.top - layerRect.top - size / 2 - 16;
          const enterX = toNeckRect.left - layerRect.left + toNeckRect.width / 2 - size / 2;
          const enterY = toNeckRect.top - layerRect.top - size / 2 - 16;
          const settleX = toJarRect.left - layerRect.left + toJarRect.width / 2 - size / 2;
          const settleY = toJarRect.bottom - layerRect.top - 24 - size / 2;

          dot.style.left = `${startX}px`;
          dot.style.top = `${startY}px`;
          dot.style.opacity = "0";
          dot.style.transition = "left 0.35s ease-in, top 0.35s ease-in, opacity 0.15s";
          layer.appendChild(dot);

          requestAnimationFrame(() => {
            dot.style.opacity = "1";
            dot.style.top = `${exitY}px`;
          });
          setTimeout(() => {
            dot.style.transition = "left 0.45s ease-in-out, top 0.45s ease-in-out";
            dot.style.left = `${enterX}px`;
            dot.style.top = `${enterY}px`;
          }, 370);
          setTimeout(() => {
            dot.style.transition = "left 0.3s ease-out, top 0.3s ease-out, opacity 0.2s 0.1s";
            dot.style.left = `${settleX}px`;
            dot.style.top = `${settleY}px`;
            dot.style.opacity = "0";
          }, 850);
          setTimeout(() => dot.remove(), 1200);
        }, i * 150)
      );
    }

    const finishTimer = setTimeout(onComplete, n * 150 + 1200);
    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(finishTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 8vw",
      }}
    >
      <Bottle
        color="#185FA5"
        bgColor="rgba(55,138,221,0.14)"
        jarRef={myJarRef}
        neckRef={myNeckRef}
        marblesRef={myMarblesRef}
      />
      <div ref={flyLayerRef} style={{ position: "absolute", inset: 0 }} />
      <Bottle
        color="#993C56"
        bgColor="rgba(212,83,126,0.14)"
        jarRef={oppJarRef}
        neckRef={oppNeckRef}
        marblesRef={oppMarblesRef}
      />
    </div>
  );
}
