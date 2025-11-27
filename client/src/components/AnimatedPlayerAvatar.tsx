import { useEffect, useRef } from "react";

interface AnimatedPlayerAvatarProps {
  gender: "boy" | "girl";
  playerName: string;
  isGuesser?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function AnimatedPlayerAvatar({
  gender,
  playerName,
  isGuesser = false,
  size = "lg",
}: AnimatedPlayerAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const time = (Date.now() % 3000) / 3000; // 3 second cycle
    const bobbing = Math.sin(time * Math.PI * 2) * 3;

    if (gender === "girl") {
      // Girl avatar - animated with pink/purple theme

      // Head
      ctx.fillStyle = "#FDBCB4";
      ctx.beginPath();
      ctx.arc(centerX, centerY - 25 + bobbing, 20, 0, Math.PI * 2);
      ctx.fill();

      // Hair - flowing
      ctx.fillStyle = "#E91E63";
      ctx.beginPath();
      ctx.arc(centerX, centerY - 35 + bobbing, 22, 0, Math.PI * 2);
      ctx.fill();

      // Hair accent
      const hairWave = Math.sin(time * Math.PI * 2 + 1) * 2;
      ctx.fillStyle = "#C2185B";
      ctx.beginPath();
      ctx.arc(centerX - 15, centerY - 30 + bobbing + hairWave, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + 15, centerY - 30 + bobbing - hairWave, 4, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(centerX - 8, centerY - 28 + bobbing, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + 8, centerY - 28 + bobbing, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 24 + bobbing, 5, 0, Math.PI);
      ctx.stroke();

      // Body - dress
      ctx.fillStyle = "#FF69B4";
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 5 + bobbing, 18, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dress pattern
      ctx.fillStyle = "#FFB6C1";
      ctx.beginPath();
      ctx.arc(centerX - 10, centerY + bobbing, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + 10, centerY + bobbing, 4, 0, Math.PI * 2);
      ctx.fill();

      // Arms - swinging
      const armSwing = Math.sin(time * Math.PI * 2) * 8;
      ctx.strokeStyle = "#FDBCB4";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(centerX - 18, centerY - 5 + bobbing);
      ctx.lineTo(centerX - 28 - armSwing, centerY + 15 + bobbing);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + 18, centerY - 5 + bobbing);
      ctx.lineTo(centerX + 28 + armSwing, centerY + 15 + bobbing);
      ctx.stroke();

      // Legs
      ctx.strokeStyle = "#FDBCB4";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(centerX - 8, centerY + 28 + bobbing);
      ctx.lineTo(centerX - 8, centerY + 45 + bobbing);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + 8, centerY + 28 + bobbing);
      ctx.lineTo(centerX + 8, centerY + 45 + bobbing);
      ctx.stroke();
    } else {
      // Boy avatar - animated with blue/green theme

      // Head
      ctx.fillStyle = "#F4A460";
      ctx.beginPath();
      ctx.arc(centerX, centerY - 25 + bobbing, 20, 0, Math.PI * 2);
      ctx.fill();

      // Hair - spiky
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(centerX, centerY - 35 + bobbing, 22, 0, Math.PI * 2);
      ctx.fill();

      // Hair spikes
      const spikeLength = 8;
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI;
        const spikeWave = Math.sin(time * Math.PI * 2 + i) * 2;
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(
          centerX - 15 + i * 7.5,
          centerY - 40 + bobbing - spikeLength + spikeWave,
          3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Eyes
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(centerX - 8, centerY - 28 + bobbing, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + 8, centerY - 28 + bobbing, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 24 + bobbing, 5, 0, Math.PI);
      ctx.stroke();

      // Body - shirt
      ctx.fillStyle = "#4169E1";
      ctx.fillRect(centerX - 18, centerY - 5 + bobbing, 36, 28);

      // Shirt pattern
      ctx.strokeStyle = "#1E90FF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 8, centerY - 5 + bobbing);
      ctx.lineTo(centerX - 8, centerY + 23 + bobbing);
      ctx.stroke();

      // Arms - punching animation
      const armExtend = Math.sin(time * Math.PI * 2) * 8;
      ctx.fillStyle = "#F4A460";
      ctx.fillRect(centerX - 25, centerY - 5 + bobbing, 7, 25);
      ctx.fillRect(centerX + 18, centerY - 5 + bobbing, 7, 25);

      // Fists
      ctx.fillStyle = "#F4A460";
      ctx.beginPath();
      ctx.arc(centerX - 23, centerY + 20 + bobbing, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + 23, centerY + 20 + bobbing, 5, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.strokeStyle = "#2C5282";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(centerX - 8, centerY + 23 + bobbing);
      ctx.lineTo(centerX - 8, centerY + 45 + bobbing);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + 8, centerY + 23 + bobbing);
      ctx.lineTo(centerX + 8, centerY + 45 + bobbing);
      ctx.stroke();
    }

    // Glow effect for guesser
    if (isGuesser) {
      ctx.shadowColor = "rgba(255, 215, 0, 0.6)";
      ctx.shadowBlur = 15;
      ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY + bobbing, 35, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [gender, isGuesser]);

  const sizeMap = {
    sm: 60,
    md: 80,
    lg: 120,
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        width={sizeMap[size]}
        height={sizeMap[size]}
        className="rounded-full border-2 border-yellow-400/30"
      />
      <p className="text-sm font-semibold text-white text-center max-w-24 truncate">
        {playerName}
      </p>
    </div>
  );
}
