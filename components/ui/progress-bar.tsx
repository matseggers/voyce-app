"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  animate?: boolean;
  label?: string;
  showValue?: boolean;
}

export function ProgressBar({
  value,
  max = 10,
  color = "#E8725A",
  className,
  animate = true,
  label,
  showValue = false,
}: ProgressBarProps) {
  const [width, setWidth] = useState(animate ? 0 : (value / max) * 100);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setWidth((value / max) * 100), 100);
    return () => clearTimeout(t);
  }, [value, max, animate]);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-xs text-muted">{label}</span>}
          {showValue && (
            <span className="font-mono text-xs font-medium text-text-main">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-card-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full progress-fill"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
