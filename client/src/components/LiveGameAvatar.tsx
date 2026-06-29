import { useEffect, useState, useRef } from "react";

type Phase = "idle" | "hiding" | "hidden" | "revealing" | "revealed";
type Gender = "boy" | "girl";

interface LiveGameAvatarProps {
  phase: Phase;
  marbleCount?: number;
  isAI?: boolean;
  gender?: Gender;
  name?: string;
  isWinner?: boolean;
}

// SVG Hand animation component
function AnimatedHand({ phase, marbleCount = 0 }: { phase: Phase; marbleCount: number }) {
  const fistClosed = phase === "hidden" || phase === "hiding";
  const isRevealing = phase === "revealing" || phase === "revealed";
  const isOdd = marbleCount % 2 !== 0;

  return (
    <div className="relative flex flex-col items-center">
      {/* Hand SVG */}
      <div
        className="transition-all duration-700"
        style={{
          transform: phase === "hiding" ? "scale(1.15) rotate(-5deg)" : phase === "revealing" ? "scale(1.2) rotate(5deg)" : "scale(1)",
          filter: fistClosed ? "drop-shadow(0 0 12px rgba(233,30,140,0.6))" : isRevealing ? "drop-shadow(0 0 16px rgba(0,217,255,0.8))" : "none",
        }}
      >
        <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wrist / Palm base */}
          <rect x="25" y="75" width="50" height="35" rx="8" fill="#F5CBA7" stroke="#D4956A" strokeWidth="1.5" />

          {/* Fingers - animated open/close */}
          {fistClosed ? (
            /* Closed fist */
            <>
              <rect x="22" y="55" width="56" height="28" rx="10" fill="#F5CBA7" stroke="#D4956A" strokeWidth="1.5" />
              {/* Knuckle lines */}
              <line x1="40" y1="58" x2="40" y2="70" stroke="#D4956A" strokeWidth="1" strokeLinecap="round" />
              <line x1="54" y1="58" x2="54" y2="70" stroke="#D4956A" strokeWidth="1" strokeLinecap="round" />
              {/* Thumb */}
              <ellipse cx="22" cy="64" rx="10" ry="8" fill="#F5CBA7" stroke="#D4956A" strokeWidth="1.5" />
              {/* Shine */}
              <ellipse cx="38" cy="62" rx="8" ry="4" fill="rgba(255,255,255,0.25)" />
            </>
          ) : (
            /* Open hand / reveal */
            <>
              {/* Index finger */}
              <rect x="24" y="20" width="12" height="45" rx="6" fill="#F5CBA7" stroke="#D4956A" strokeWidth="1.5"
                style={{ transformOrigin: "30px 65px", transform: "rotate(-8deg)" }} />
              {/* Middle finger */}
              <rect x="38" y="15" width="12" height="50" rx="6" fill="#F5CBA7" stroke="#D4956A" strokeWidth="1.5" />
              {/* Ring finger */}
              <rect x="52" y="18" width="12" height="48" rx="6" fill="#F5CBA7" stroke="#D4956A" strokeWidth="1.5" />
              {/* Pinky */}
              <rect x="65" y="26" width="10" height="40" rx="5" fill="#F5CBA7" stroke="#D4956A" strokeWidth="1.5"
                style={{ transformOrigin: "70px 66px", transform: "rotate(8deg)" }} />
              {/* Thumb */}
              <ellipse cx="18" cy="72" rx="11" ry="8" fill="#F5CBA7" stroke="#D4956A" strokeWidth="1.5"
                style={{ transform: "rotate(-30deg)", transformOrigin: "18px 72px" }} />
              {/* Palm */}
              <rect x="22" y="62" width="56" height="28" rx="10" fill="#F5CBA7" stroke="#D4956A" strokeWidth="1.5" />

              {/* Marbles on open palm */}
              {isRevealing && marbleCount > 0 && (() => {
                const colors = ["#00D9FF", "#E91E8C", "#FFD700", "#00FF88", "#FF6B35", "#9C27B0"];
                const count = Math.min(marbleCount, 8);
                return Array.from({ length: count }).map((_, i) => {
                  const row = Math.floor(i / 4);
                  const col = i % 4;
                  return (
                    <circle
                      key={i}
                      cx={32 + col * 13}
                      cy={68 + row * 12}
                      r="5"
                      fill={colors[i % colors.length]}
                      stroke="rgba(0,0,0,0.3)"
                      strokeWidth="0.5"
                      style={{ filter: `drop-shadow(0 0 4px ${colors[i % colors.length]})` }}
                    />
                  );
                });
              })()}
            </>
          )}
        </svg>
      </div>

      {/* Marble count glow badge */}
      {fistClosed && (
        <div className="mt-1 bg-gradient-to-r from-[#E91E8C] to-[#9C27B0] text-white text-xs font-bold px-3 py-0.5 rounded-full animate-pulse shadow-lg">
          ðŸ”’ Hidden
        </div>
      )}
      {isRevealing && marbleCount > 0 && (
        <div
          className="mt-1 font-black text-lg px-3 py-0.5 rounded-full shadow-lg"
          style={{
            background: isOdd ? "linear-gradient(to right, #E91E8C, #FF6B35)" : "linear-gradient(to right, #00D9FF, #00FF88)",
            color: "#fff",
            textShadow: "0 0 10px rgba(0,0,0,0.5)",
            boxShadow: isOdd ? "0 0 20px rgba(233,30,140,0.6)" : "0 0 20px rgba(0,217,255,0.6)",
          }}
        >
          {marbleCount} â€” {isOdd ? "KALI âœŠ" : "JOTTA âœŒï¸"}
        </div>
      )}
    </div>
  );
}

// Cartoon character body
function CartoonCharacter({ gender, isAI, isWinner, phase }: { gender: Gender; isAI?: boolean; isWinner?: boolean; phase: Phase }) {
  const isExcited = phase === "hiding" || phase === "revealing";
  const isAIChar = isAI;

  return (
    <svg
      width="90" height="130" viewBox="0 0 90 130" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{
        transition: "transform 0.4s",
        transform: isExcited ? "translateY(-6px)" : "translateY(0)",
      }}
    >
      {/* Shadow */}
      <ellipse cx="45" cy="125" rx="22" ry="5" fill="rgba(0,0,0,0.15)" />

      {/* Body */}
      <rect x="22" y="68" width="46" height="46" rx="14"
        fill={isAIChar ? "#1a0a2e" : gender === "girl" ? "#E91E8C" : "#00D9FF"}
        stroke={isAIChar ? "#9C27B0" : gender === "girl" ? "#C2185B" : "#0097A7"}
        strokeWidth="2"
      />

      {/* Body detail */}
      {isAIChar ? (
        <rect x="30" y="80" width="30" height="20" rx="4" fill="#00D9FF" opacity="0.5"/>
      ) : (
        <>
          <rect x="30" y="76" width="30" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
          <rect x="30" y="84" width="20" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
        </>
      )}

      {/* Legs */}
      <rect x="25" y="108" width="16" height="18" rx="8"
        fill={isAIChar ? "#2a1a3e" : gender === "girl" ? "#C2185B" : "#0097A7"} />
      <rect x="49" y="108" width="16" height="18" rx="8"
        fill={isAIChar ? "#2a1a3e" : gender === "girl" ? "#C2185B" : "#0097A7"} />

      {/* Shoes */}
      <ellipse cx="33" cy="126" rx="12" ry="6" fill={isAIChar ? "#9C27B0" : "#333"} />
      <ellipse cx="57" cy="126" rx="12" ry="6" fill={isAIChar ? "#9C27B0" : "#333"} />

      {/* Neck */}
      <rect x="37" y="58" width="16" height="14" rx="5"
        fill={isAIChar ? "#555" : "#F5CBA7"} />

      {/* Head */}
      <ellipse cx="45" cy="44" rx="24" ry="26"
        fill={isAIChar ? "#333" : gender === "girl" ? "#FFCDD2" : "#FFECB3"}
        stroke={isAIChar ? "#9C27B0" : gender === "girl" ? "#E91E8C" : "#FFA000"}
        strokeWidth="2"
      />

      {/* Eyes */}
      {isAIChar ? (
        <>
          <rect x="30" y="37" width="12" height="8" rx="2" fill="#00D9FF" />
          <rect x="48" y="37" width="12" height="8" rx="2" fill="#00D9FF" />
          <rect x="34" y="39" width="4" height="4" rx="1" fill="#fff" />
          <rect x="52" y="39" width="4" height="4" rx="1" fill="#fff" />
        </>
      ) : (
        <>
          {/* Eyes */}
          <ellipse cx="35" cy="40" rx="6" ry="7" fill="white" />
          <ellipse cx="55" cy="40" rx="6" ry="7" fill="white" />
          <ellipse cx="36" cy="41" rx="3.5" ry="4" fill="#333" />
          <ellipse cx="56" cy="41" rx="3.5" ry="4" fill="#333" />
          <ellipse cx="37" cy="40" rx="1.2" ry="1.2" fill="white" />
          <ellipse cx="57" cy="40" rx="1.2" ry="1.2" fill="white" />
          {/* Eyebrows */}
          <path d="M29 33 Q35 30 41 33" stroke="#555" strokeWidth="2" strokeLinecap="round" fill="none"
            style={{ transform: isExcited ? "translateY(-2px)" : "none" }} />
          <path d="M49 33 Q55 30 61 33" stroke="#555" strokeWidth="2" strokeLinecap="round" fill="none"
            style={{ transform: isExcited ? "translateY(-2px)" : "none" }} />
        </>
      )}

      {/* Mouth */}
      {isWinner ? (
        <path d="M35 55 Q45 65 55 55" stroke={isAIChar ? "#00FF88" : "#E91E8C"} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : phase === "hidden" ? (
        <path d="M35 56 Q45 53 55 56" stroke="#888" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M35 54 Q45 63 55 54" stroke={isAIChar ? "#00D9FF" : "#E91E8C"} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Hair / hat */}
      {!isAIChar && gender === "girl" && (
        <>
          <ellipse cx="45" cy="20" rx="26" ry="10" fill="#E91E8C" />
          <ellipse cx="20" cy="30" rx="8" ry="18" fill="#E91E8C" />
          <ellipse cx="70" cy="30" rx="8" ry="18" fill="#E91E8C" />
        </>
      )}
      {!isAIChar && gender === "boy" && (
        <path d="M22 30 Q24 12 45 10 Q66 12 68 30 Q60 18 45 16 Q30 18 22 30Z" fill="#5D4037" />
      )}

      {/* AI antenna */}
      {isAIChar && (
        <>
          <line x1="45" y1="18" x2="45" y2="8" stroke="#9C27B0" strokeWidth="2" />
          <circle cx="45" cy="6" r="4" fill="#E91E8C" className="animate-pulse" />
        </>
      )}

      {/* Excited effect */}
      {isExcited && (
        <>
          <circle cx="12" cy="22" r="4" fill="#FFD700"/>
          <circle cx="68" cy="22" r="4" fill="#FFD700"/>
        </>
      )}
      {isWinner && (
        <polygon points="38,14 45,6 52,14 56,8 60,14 40,14" fill="#FFD700"/>
      )}
    </svg>
  );
}

export default function LiveGameAvatar({
  phase,
  marbleCount = 0,
  isAI = false,
  gender = "boy",
  name = "Player",
  isWinner = false,
}: LiveGameAvatarProps) {
  const [bobbing, setBobbing] = useState(false);

  useEffect(() => {
    if (phase === "hiding" || phase === "revealing") {
      setBobbing(true);
      const t = setTimeout(() => setBobbing(false), 600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      {/* Name badge */}
      <div
        className="text-xs font-bold px-2 py-0.5 rounded-full mb-1"
        style={{
          background: isAI ? "linear-gradient(to right, #9C27B0, #1a0a2e)" : "linear-gradient(to right, #00D9FF22, #E91E8C22)",
          color: isAI ? "#E91E8C" : "#00D9FF",
          border: `1px solid ${isAI ? "#9C27B0" : "#00D9FF"}40`,
        }}
      >
        {isAI ? "ðŸ¤– " : ""}{name}
      </div>

      {/* Character + Hand stacked */}
      <div
        className="flex flex-col items-center"
        style={{
          animation: bobbing ? "none" : undefined,
          transform: bobbing ? "translateY(-4px)" : "translateY(0)",
          transition: "transform 0.3s",
        }}
      >
        <CartoonCharacter gender={gender} isAI={isAI} isWinner={isWinner} phase={phase} />
        <div className="mt-0">
          <AnimatedHand phase={phase} marbleCount={marbleCount} />
        </div>
      </div>

      {/* Phase label */}
      <div className="text-[10px] text-center mt-1 text-muted-foreground">
        {phase === "idle" && "Ready..."}
        {phase === "hiding" && "ðŸ™ˆ Hiding marbles..."}
        {phase === "hidden" && "âœŠ Marbles hidden!"}
        {phase === "revealing" && "ðŸ‘ï¸ Revealing..."}
        {phase === "revealed" && "ðŸ–ï¸ Revealed!"}
      </div>
    </div>
  );
}


