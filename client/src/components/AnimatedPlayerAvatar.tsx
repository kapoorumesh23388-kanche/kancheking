import { useEffect, useRef } from "react";

interface AnimatedPlayerAvatarProps {
  gender: "boy" | "girl";
  playerName: string;
  isGuesser?: boolean;
  size?: "sm" | "md" | "lg";
  phase?: "idle" | "hiding" | "hidden" | "revealing" | "revealed";
  isAI?: boolean;
  isWinner?: boolean;
}

export default function AnimatedPlayerAvatar({
  gender,
  playerName,
  isGuesser = false,
  size = "lg",
  phase = "idle",
  isAI = false,
  isWinner = false,
}: AnimatedPlayerAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const scale = W / 120;

    function drawFrame() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const bob = Math.sin(elapsed * 2.5) * 3 * scale;
      const excited = phase === "hiding" || phase === "revealing";
      const eBob = excited ? Math.sin(elapsed * 8) * 5 * scale : 0;
      const totalBob = bob + eBob;
      const baseY = H * 0.52 + totalBob;

      if (isAI) {
        drawAIRobot(ctx, cx, baseY, scale, elapsed, phase);
      } else if (gender === "girl") {
        drawGirl(ctx, cx, baseY, scale, elapsed, phase, isWinner);
      } else {
        drawBoy(ctx, cx, baseY, scale, elapsed, phase, isWinner);
      }

      // Winner crown
      if (isWinner) {
        ctx.font = `${18 * scale}px serif`;
        ctx.textAlign = "center";
        // Winner crown â€” drawn with canvas shapes
      if (isWinner) {
        ctx.save();
        ctx.fillStyle = "#FFD700";
        ctx.strokeStyle = "#FFA000";
        ctx.lineWidth = 1 * scale;
        const crownY = baseY - 70 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, crownY + 8 * scale);
        ctx.lineTo(cx - 10 * scale, crownY);
        ctx.lineTo(cx - 5 * scale, crownY + 5 * scale);
        ctx.lineTo(cx, crownY - 2 * scale);
        ctx.lineTo(cx + 5 * scale, crownY + 5 * scale);
        ctx.lineTo(cx + 10 * scale, crownY);
        ctx.lineTo(cx + 10 * scale, crownY + 8 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      }

      // Guesser glow ring
      if (isGuesser) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,215,0,0.7)";
        ctx.lineWidth = 2 * scale;
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, baseY - 10 * scale, 40 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(drawFrame);
    }

    animFrameRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gender, isGuesser, phase, isAI, isWinner]);

  const sizeMap = { sm: 70, md: 90, lg: 130 };
  const dim = sizeMap[size];

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={dim}
        height={dim}
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

// â”€â”€â”€ BOY CHARACTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function drawBoy(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number, s: number,
  t: number, phase: string, isWinner: boolean
) {
  const armSwing = Math.sin(t * 3) * 12 * s;
  const legSwing = Math.sin(t * 3) * 10 * s;
  const fistClosed = phase === "hidden" || phase === "hiding";

  // Shadow
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 38 * s, 22 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Legs
  ctx.save();
  ctx.strokeStyle = "#1a237e";
  ctx.lineWidth = 8 * s;
  ctx.lineCap = "round";
  // Left leg
  ctx.beginPath();
  ctx.moveTo(cx - 5 * s, baseY + 20 * s);
  ctx.lineTo(cx - 7 * s + legSwing * 0.5, baseY + 38 * s);
  ctx.stroke();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(cx + 5 * s, baseY + 20 * s);
  ctx.lineTo(cx + 7 * s - legSwing * 0.5, baseY + 38 * s);
  ctx.stroke();
  ctx.restore();

  // Shoes
  ctx.save();
  ctx.fillStyle = "#e53935";
  ctx.beginPath();
  ctx.ellipse(cx - 7 * s + legSwing * 0.5, baseY + 39 * s, 8 * s, 4 * s, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 7 * s - legSwing * 0.5, baseY + 39 * s, 8 * s, 4 * s, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body â€” colorful jersey
  ctx.save();
  const grad = ctx.createLinearGradient(cx - 16 * s, baseY - 15 * s, cx + 16 * s, baseY + 20 * s);
  grad.addColorStop(0, "#1565c0");
  grad.addColorStop(1, "#0d47a1");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(cx - 16 * s, baseY - 15 * s, 32 * s, 36 * s, 6 * s);
  ctx.fill();
  // Jersey stripes
  ctx.strokeStyle = "#42a5f5";
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 6 * s, baseY - 15 * s);
  ctx.lineTo(cx - 6 * s, baseY + 20 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 6 * s, baseY - 15 * s);
  ctx.lineTo(cx + 6 * s, baseY + 20 * s);
  ctx.stroke();
  ctx.restore();

  // Arms
  ctx.save();
  ctx.strokeStyle = "#f4a460";
  ctx.lineWidth = 7 * s;
  ctx.lineCap = "round";
  // Left arm
  ctx.beginPath();
  ctx.moveTo(cx - 16 * s, baseY - 10 * s);
  ctx.lineTo(cx - 26 * s, baseY + 5 * s + armSwing);
  ctx.stroke();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(cx + 16 * s, baseY - 10 * s);
  ctx.lineTo(cx + 26 * s, baseY + 5 * s - armSwing);
  ctx.stroke();
  ctx.restore();

  // Fists / hands
  if (fistClosed) {
    // Closed fist (hiding marbles)
    drawFist(ctx, cx - 26 * s, baseY + 5 * s + armSwing, s, "#f4a460");
    drawFist(ctx, cx + 26 * s, baseY + 5 * s - armSwing, s, "#f4a460");
  } else {
    // Open hand
    ctx.save();
    ctx.fillStyle = "#f4a460";
    ctx.beginPath();
    ctx.arc(cx - 26 * s, baseY + 5 * s + armSwing, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 26 * s, baseY + 5 * s - armSwing, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Neck
  ctx.save();
  ctx.fillStyle = "#f4a460";
  ctx.fillRect(cx - 5 * s, baseY - 25 * s, 10 * s, 12 * s);
  ctx.restore();

  // Head
  ctx.save();
  const headGrad = ctx.createRadialGradient(cx - 3 * s, baseY - 40 * s, 2 * s, cx, baseY - 37 * s, 18 * s);
  headGrad.addColorStop(0, "#FDDBB4");
  headGrad.addColorStop(1, "#e8a87c");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(cx, baseY - 37 * s, 18 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Hair
  ctx.save();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(cx, baseY - 48 * s, 16 * s, Math.PI, 0);
  ctx.fill();
  // Hair spikes
  for (let i = 0; i < 5; i++) {
    const sx = cx - 14 * s + i * 7 * s;
    const spike = Math.sin(t * 2 + i) * 1.5 * s;
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(sx - 3 * s, baseY - 48 * s);
    ctx.lineTo(sx, baseY - 56 * s + spike);
    ctx.lineTo(sx + 3 * s, baseY - 48 * s);
    ctx.fill();
  }
  ctx.restore();

  // Eyes
  drawEyes(ctx, cx, baseY - 38 * s, s, t, phase);

  // Mouth
  drawMouth(ctx, cx, baseY - 29 * s, s, phase, isWinner);

  // Phase: revealed â€” marbles on palm
  if (phase === "revealed" || phase === "revealing") {
    drawMarblesOnPalm(ctx, cx + 26 * s, baseY + 5 * s - armSwing, s);
  }
}

// â”€â”€â”€ GIRL CHARACTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function drawGirl(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number, s: number,
  t: number, phase: string, isWinner: boolean
) {
  const armSwing = Math.sin(t * 3) * 10 * s;
  const legSwing = Math.sin(t * 3) * 8 * s;
  const fistClosed = phase === "hidden" || phase === "hiding";

  // Shadow
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 38 * s, 22 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Skirt
  ctx.save();
  ctx.fillStyle = "#e91e8c";
  ctx.beginPath();
  ctx.moveTo(cx - 18 * s, baseY + 10 * s);
  ctx.lineTo(cx - 22 * s, baseY + 30 * s);
  ctx.lineTo(cx + 22 * s, baseY + 30 * s);
  ctx.lineTo(cx + 18 * s, baseY + 10 * s);
  ctx.closePath();
  ctx.fill();
  // Skirt pattern
  ctx.fillStyle = "#ff4db2";
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 22 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Legs
  ctx.save();
  ctx.strokeStyle = "#FDDBB4";
  ctx.lineWidth = 7 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 6 * s, baseY + 30 * s);
  ctx.lineTo(cx - 7 * s + legSwing * 0.5, baseY + 40 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 6 * s, baseY + 30 * s);
  ctx.lineTo(cx + 7 * s - legSwing * 0.5, baseY + 40 * s);
  ctx.stroke();
  ctx.restore();

  // Shoes
  ctx.save();
  ctx.fillStyle = "#9c27b0";
  ctx.beginPath();
  ctx.ellipse(cx - 7 * s, baseY + 41 * s, 7 * s, 3.5 * s, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 7 * s, baseY + 41 * s, 7 * s, 3.5 * s, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body â€” top
  ctx.save();
  const grad = ctx.createLinearGradient(cx, baseY - 15 * s, cx, baseY + 12 * s);
  grad.addColorStop(0, "#9c27b0");
  grad.addColorStop(1, "#7b1fa2");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(cx - 15 * s, baseY - 15 * s, 30 * s, 28 * s, 5 * s);
  ctx.fill();
  // Star decoration
  ctx.fillStyle = "#ff4db2";
  ctx.font = `${10 * s}px serif`;
  ctx.textAlign = "center";
  // Draw star shape on body
  ctx.save();
  ctx.fillStyle = "#ff4db2";
  ctx.beginPath();
  const starX = cx, starY = baseY + 2 * s, starR = 5 * s;
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = starX + starR * Math.cos(angle);
    const y = starY + starR * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();

  // Arms
  ctx.save();
  ctx.strokeStyle = "#FDDBB4";
  ctx.lineWidth = 6 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 15 * s, baseY - 10 * s);
  ctx.lineTo(cx - 24 * s, baseY + 5 * s + armSwing);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 15 * s, baseY - 10 * s);
  ctx.lineTo(cx + 24 * s, baseY + 5 * s - armSwing);
  ctx.stroke();
  ctx.restore();

  // Hands/fists
  if (fistClosed) {
    drawFist(ctx, cx - 24 * s, baseY + 5 * s + armSwing, s, "#FDDBB4");
    drawFist(ctx, cx + 24 * s, baseY + 5 * s - armSwing, s, "#FDDBB4");
  } else {
    ctx.save();
    ctx.fillStyle = "#FDDBB4";
    ctx.beginPath();
    ctx.arc(cx - 24 * s, baseY + 5 * s + armSwing, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 24 * s, baseY + 5 * s - armSwing, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Neck
  ctx.save();
  ctx.fillStyle = "#FDDBB4";
  ctx.fillRect(cx - 5 * s, baseY - 25 * s, 10 * s, 12 * s);
  ctx.restore();

  // Head
  ctx.save();
  const headGrad = ctx.createRadialGradient(cx - 3 * s, baseY - 40 * s, 2 * s, cx, baseY - 37 * s, 17 * s);
  headGrad.addColorStop(0, "#FDDBB4");
  headGrad.addColorStop(1, "#e8c49a");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(cx, baseY - 37 * s, 17 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Hair â€” long flowing
  ctx.save();
  ctx.fillStyle = "#c2185b";
  ctx.beginPath();
  ctx.arc(cx, baseY - 47 * s, 19 * s, Math.PI, 0);
  ctx.fill();
  // Side hair
  const hairWave = Math.sin(t * 2) * 2 * s;
  ctx.fillStyle = "#e91e8c";
  ctx.beginPath();
  ctx.ellipse(cx - 20 * s, baseY - 32 * s + hairWave, 5 * s, 12 * s, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 20 * s, baseY - 32 * s - hairWave, 5 * s, 12 * s, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Hair bow
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.ellipse(cx - 5 * s, baseY - 55 * s, 6 * s, 4 * s, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 5 * s, baseY - 55 * s, 6 * s, 4 * s, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFA000";
  ctx.beginPath();
  ctx.arc(cx, baseY - 55 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Eyes
  drawEyes(ctx, cx, baseY - 38 * s, s, t, phase);

  // Mouth
  drawMouth(ctx, cx, baseY - 29 * s, s, phase, isWinner);

  // Revealed marbles
  if (phase === "revealed" || phase === "revealing") {
    drawMarblesOnPalm(ctx, cx + 24 * s, baseY + 5 * s - armSwing, s);
  }
}

// â”€â”€â”€ AI ROBOT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function drawAIRobot(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number, s: number,
  t: number, phase: string
) {
  const pulse = Math.sin(t * 4) * 0.3 + 0.7;
  const fistClosed = phase === "hidden" || phase === "hiding";

  // Shadow
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 38 * s, 20 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Legs
  ctx.save();
  ctx.strokeStyle = "#37474f";
  ctx.lineWidth = 8 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 7 * s, baseY + 22 * s);
  ctx.lineTo(cx - 8 * s, baseY + 38 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 7 * s, baseY + 22 * s);
  ctx.lineTo(cx + 8 * s, baseY + 38 * s);
  ctx.stroke();
  ctx.restore();

  // Feet
  ctx.save();
  ctx.fillStyle = "#9c27b0";
  ctx.beginPath();
  ctx.ellipse(cx - 8 * s, baseY + 39 * s, 9 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 8 * s, baseY + 39 * s, 9 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body
  ctx.save();
  const grad = ctx.createLinearGradient(cx - 18 * s, baseY - 15 * s, cx + 18 * s, baseY + 22 * s);
  grad.addColorStop(0, "#1a237e");
  grad.addColorStop(1, "#0a0a2e");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(cx - 18 * s, baseY - 15 * s, 36 * s, 38 * s, 8 * s);
  ctx.fill();
  // Body panel lights
  ctx.fillStyle = `rgba(0,217,255,${pulse})`;
  ctx.beginPath();
  ctx.roundRect(cx - 10 * s, baseY - 5 * s, 20 * s, 8 * s, 3 * s);
  ctx.fill();
  // Dots
  ["#ff4444", "#44ff44", "#4444ff"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(cx - 6 * s + i * 6 * s, baseY + 10 * s, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Arms
  ctx.save();
  ctx.strokeStyle = "#546e7a";
  ctx.lineWidth = 7 * s;
  ctx.lineCap = "round";
  const armBob = Math.sin(t * 2) * 5 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 18 * s, baseY - 5 * s);
  ctx.lineTo(cx - 28 * s, baseY + 10 * s + armBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 18 * s, baseY - 5 * s);
  ctx.lineTo(cx + 28 * s, baseY + 10 * s - armBob);
  ctx.stroke();
  ctx.restore();

  // Robot hands/fists
  if (fistClosed) {
    ctx.save();
    ctx.fillStyle = "#9c27b0";
    ctx.beginPath();
    ctx.roundRect(cx - 33 * s, baseY + 5 * s + armBob, 10 * s, 10 * s, 3 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx + 23 * s, baseY + 5 * s - armBob, 10 * s, 10 * s, 3 * s);
    ctx.fill();
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle = "#546e7a";
    ctx.beginPath();
    ctx.arc(cx - 28 * s, baseY + 10 * s + armBob, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 28 * s, baseY + 10 * s - armBob, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Head
  ctx.save();
  ctx.fillStyle = "#263238";
  ctx.beginPath();
  ctx.roundRect(cx - 20 * s, baseY - 52 * s, 40 * s, 38 * s, 10 * s);
  ctx.fill();
  // Head border glow
  ctx.strokeStyle = `rgba(156,39,176,${pulse})`;
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.roundRect(cx - 20 * s, baseY - 52 * s, 40 * s, 38 * s, 10 * s);
  ctx.stroke();
  ctx.restore();

  // Antenna
  ctx.save();
  ctx.strokeStyle = "#9c27b0";
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 52 * s);
  ctx.lineTo(cx, baseY - 63 * s);
  ctx.stroke();
  ctx.fillStyle = `rgba(233,30,140,${pulse})`;
  ctx.shadowColor = "#e91e8c";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(cx, baseY - 65 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Robot eyes â€” glowing
  ctx.save();
  ctx.fillStyle = `rgba(0,217,255,${pulse})`;
  ctx.shadowColor = "#00D9FF";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.roundRect(cx - 14 * s, baseY - 44 * s, 10 * s, 7 * s, 2 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(cx + 4 * s, baseY - 44 * s, 10 * s, 7 * s, 2 * s);
  ctx.fill();
  ctx.restore();

  // Robot mouth
  ctx.save();
  ctx.strokeStyle = `rgba(0,217,255,${pulse * 0.7})`;
  ctx.lineWidth = 2 * s;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - 10 * s + i * 5 * s, baseY - 27 * s);
    ctx.lineTo(cx - 10 * s + i * 5 * s, baseY - 22 * s);
    ctx.stroke();
  }
  ctx.restore();

  // Revealed marbles
  if (phase === "revealed" || phase === "revealing") {
    drawMarblesOnPalm(ctx, cx + 28 * s, baseY + 10 * s - armBob, s);
  }
}

// â”€â”€â”€ HELPER FUNCTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function drawFist(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = "#e91e8c";
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.roundRect(x - 7 * s, y - 6 * s, 14 * s, 12 * s, 3 * s);
  ctx.fill();
  // Knuckle lines
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1 * s;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 4 * s + i * 4 * s, y - 6 * s);
    ctx.lineTo(x - 4 * s + i * 4 * s, y - 2 * s);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEyes(ctx: CanvasRenderingContext2D, cx: number, eyeY: number, s: number, t: number, phase: string) {
  const blink = Math.sin(t * 0.5) > 0.95;
  ctx.save();
  // Eye whites
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(cx - 7 * s, eyeY, 5 * s, blink ? 1 * s : 6 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 7 * s, eyeY, 5 * s, blink ? 1 * s : 6 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!blink) {
    // Pupils
    const lookX = Math.sin(t * 0.8) * 1.5 * s;
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(cx - 7 * s + lookX, eyeY + 1 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 7 * s + lookX, eyeY + 1 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    // Shine
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cx - 6 * s + lookX, eyeY - 1 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 8 * s + lookX, eyeY - 1 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMouth(ctx: CanvasRenderingContext2D, cx: number, mY: number, s: number, phase: string, isWinner: boolean) {
  ctx.save();
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2 * s;
  ctx.lineCap = "round";
  if (isWinner || phase === "revealed") {
    // Big smile
    ctx.beginPath();
    ctx.arc(cx, mY - 2 * s, 7 * s, 0.1, Math.PI - 0.1);
    ctx.stroke();
    // Teeth
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cx, mY + 1 * s, 4 * s, 0, Math.PI);
    ctx.fill();
  } else if (phase === "hiding" || phase === "hidden") {
    // Determined/focused
    ctx.beginPath();
    ctx.moveTo(cx - 6 * s, mY);
    ctx.lineTo(cx + 6 * s, mY);
    ctx.stroke();
  } else {
    // Normal smile
    ctx.beginPath();
    ctx.arc(cx, mY - 2 * s, 5 * s, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMarblesOnPalm(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const colors = ["#00D9FF", "#E91E8C", "#FFD700", "#00FF88"];
  ctx.save();
  // Palm glow
  ctx.shadowColor = "#FFD700";
  ctx.shadowBlur = 10;
  colors.forEach((c, i) => {
    const mx = x - 6 * s + (i % 2) * 8 * s;
    const my = y - 6 * s + Math.floor(i / 2) * 8 * s;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(mx, my, 4 * s, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}


