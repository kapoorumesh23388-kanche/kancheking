import { useEffect, useRef } from "react";

interface MarbleBattleBottlesProps {
  // Current balances — used only to compute each bottle's relative
  // fullness (a capped visual, not an exact 1:1 dot count, since real
  // balances can run into the thousands).
  myMarbles: number;
  opponentMarbles: number;
  // Set to a new object (e.g. { triggerKey: Date.now(), won, amount })
  // whenever a round resolves, to play the transfer animation once.
  transferSignal: { triggerKey: number; won: boolean; amount: number } | null;
  onTransferComplete: () => void;
}

const DOT_COLORS = ["#378ADD", "#1D9E75", "#D85A30", "#D4537E", "#BA7517", "#7F77DD"];
const DOT_SIZE = 7;
const MAX_DOTS = 10;

function packMarbles(container: HTMLDivElement, count: number) {
  const w = container.clientWidth || 30;
  const cols = Math.max(2, Math.floor(w / (DOT_SIZE * 0.9)));
  const rowH = DOT_SIZE * 0.86;
  container.innerHTML = "";
  const capped = Math.min(count, MAX_DOTS);
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
    dot.style.boxShadow = "inset -1px -1px 0 rgba(0,0,0,0.15), inset 0.5px 0.5px 0 rgba(255,255,255,0.45)";
    dot.style.left = `${x}px`;
    dot.style.bottom = `${y}px`;
    container.appendChild(dot);
  }
}

// Turns the two raw balances into a relative visual fullness (2 to 10
// dots each) so the bottles feel alive and reflect who's ahead, without
// needing to render thousands of literal dots.
function relativeFill(mine: number, theirs: number): [number, number] {
  const total = mine + theirs;
  if (total <= 0) return [MAX_DOTS / 2, MAX_DOTS / 2];
  const mineRatio = mine / total;
  const mineDots = Math.round(2 + mineRatio * (MAX_DOTS - 4));
  return [mineDots, MAX_DOTS - mineDots + 2];
}

function CompactBottle({
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
    <div ref={jarRef} style={{ width: 34, height: 54, position: "relative", flexShrink: 0 }}>
      <svg viewBox="0 0 100 160" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path
          d="M42 4 L58 4 L58 30 Q80 42 80 70 L80 138 Q80 156 62 156 L38 156 Q20 156 20 138 L20 70 Q20 42 42 30 Z"
          fill={bgColor}
          stroke={color}
          strokeWidth={4}
        />
        <path
          d="M26 60 Q24 100 26 148"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <div ref={marblesRef} style={{ position: "absolute", left: 6, right: 6, bottom: 2, top: 11 }} />
      <div ref={neckRef} style={{ position: "absolute", top: 0, left: 10, width: 6, height: 2 }} />
    </div>
  );
}

export default function MarbleBattleBottles({
  myMarbles,
  opponentMarbles,
  transferSignal,
  onTransferComplete,
}: MarbleBattleBottlesProps) {
  const myJarRef = useRef<HTMLDivElement>(null);
  const myNeckRef = useRef<HTMLDivElement>(null);
  const myMarblesRef = useRef<HTMLDivElement>(null);
  const oppJarRef = useRef<HTMLDivElement>(null);
  const oppNeckRef = useRef<HTMLDivElement>(null);
  const oppMarblesRef = useRef<HTMLDivElement>(null);
  const flyLayerRef = useRef<HTMLDivElement>(null);

  // Keep the bottles' fullness reflecting current balances whenever they
  // change (not just during a transfer), so they read as "live", the way
  // a real jar would.
  useEffect(() => {
    const [myDots, oppDots] = relativeFill(myMarbles, opponentMarbles);
    if (myMarblesRef.current) packMarbles(myMarblesRef.current, myDots);
    if (oppMarblesRef.current) packMarbles(oppMarblesRef.current, oppDots);
  }, [myMarbles, opponentMarbles]);

  useEffect(() => {
    if (!transferSignal) return;
    const { won, amount } = transferSignal;
    const n = Math.max(1, Math.min(amount, 5));

    const fromJar = won ? oppJarRef.current : myJarRef.current;
    const fromNeck = won ? oppNeckRef.current : myNeckRef.current;
    const toJar = won ? myJarRef.current : oppJarRef.current;
    const toNeck = won ? myNeckRef.current : oppNeckRef.current;
    const layer = flyLayerRef.current;
    if (!fromJar || !fromNeck || !toJar || !toNeck || !layer) {
      onTransferComplete();
      return;
    }

    const fromJarRect = fromJar.getBoundingClientRect();
    const fromNeckRect = fromNeck.getBoundingClientRect();
    const toJarRect = toJar.getBoundingClientRect();
    const toNeckRect = toNeck.getBoundingClientRect();
    const layerRect = layer.getBoundingClientRect();
    const size = 8;
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
          dot.style.boxShadow = "inset -1px -1px 0 rgba(0,0,0,0.15), inset 0.5px 0.5px 0 rgba(255,255,255,0.4)";
          dot.style.zIndex = "5";

          const startX = fromJarRect.left - layerRect.left + fromJarRect.width / 2 - size / 2;
          const startY = fromJarRect.bottom - layerRect.top - 12 - size / 2;
          const exitX = fromNeckRect.left - layerRect.left + fromNeckRect.width / 2 - size / 2;
          const exitY = fromNeckRect.top - layerRect.top - size / 2 - 10;
          const enterX = toNeckRect.left - layerRect.left + toNeckRect.width / 2 - size / 2;
          const enterY = toNeckRect.top - layerRect.top - size / 2 - 10;
          const settleX = toJarRect.left - layerRect.left + toJarRect.width / 2 - size / 2;
          const settleY = toJarRect.bottom - layerRect.top - 12 - size / 2;

          dot.style.left = `${startX}px`;
          dot.style.top = `${startY}px`;
          dot.style.opacity = "0";
          dot.style.transition = "left 0.3s ease-in, top 0.3s ease-in, opacity 0.12s";
          layer.appendChild(dot);

          requestAnimationFrame(() => {
            dot.style.opacity = "1";
            dot.style.top = `${exitY}px`;
          });
          setTimeout(() => {
            dot.style.transition = "left 0.4s ease-in-out, top 0.4s ease-in-out";
            dot.style.left = `${enterX}px`;
            dot.style.top = `${enterY}px`;
          }, 320);
          setTimeout(() => {
            dot.style.transition = "left 0.25s ease-out, top 0.25s ease-out, opacity 0.15s 0.1s";
            dot.style.left = `${settleX}px`;
            dot.style.top = `${settleY}px`;
            dot.style.opacity = "0";
          }, 740);
          setTimeout(() => dot.remove(), 1050);
        }, i * 130)
      );
    }

    const finishTimer = setTimeout(onTransferComplete, n * 130 + 1050);
    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(finishTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferSignal?.triggerKey]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, position: "relative" }}>
      <CompactBottle
        color="#185FA5"
        bgColor="rgba(55,138,221,0.14)"
        jarRef={myJarRef}
        neckRef={myNeckRef}
        marblesRef={myMarblesRef}
      />
      <div ref={flyLayerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      <div className="text-2xl font-black text-primary animate-pulse">⚔️</div>
      <CompactBottle
        color="#993C56"
        bgColor="rgba(212,83,126,0.14)"
        jarRef={oppJarRef}
        neckRef={oppNeckRef}
        marblesRef={oppMarblesRef}
      />
    </div>
  );
}
