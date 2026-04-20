"use client";

import { useEffect, useState } from "react";
import { scoreColor, scoreLabel } from "@/lib/utils";

interface ScoreCircleProps {
  score: number;
  size?: number;
  animate?: boolean;
}

export function ScoreCircle({ score, size = 120, animate = true }: ScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 10) * circumference;
  const color = scoreColor(displayScore);

  useEffect(() => {
    if (!animate) return;
    const duration = 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(parseFloat((eased * score).toFixed(1)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score, animate]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F2F0ED"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-2xl text-text-main leading-none">
            {displayScore.toFixed(1)}
          </span>
          <span className="text-xs text-muted">/10</span>
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color }}>{scoreLabel(displayScore)}</span>
    </div>
  );
}
