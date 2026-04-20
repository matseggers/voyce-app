"use client";

interface WaveformProps {
  active?: boolean;
  bars?: number;
  color?: string;
  height?: number;
}

export function Waveform({ active = false, bars = 20, color = "#E8725A", height = 40 }: WaveformProps) {
  const delays = Array.from({ length: bars }, (_, i) => (i / bars) * 1.2);
  const heights = Array.from({ length: bars }, (_, i) => {
    const x = (i / (bars - 1)) * Math.PI * 2;
    return 0.3 + 0.7 * Math.abs(Math.sin(x));
  });

  return (
    <div
      className="flex items-center justify-center gap-[3px]"
      style={{ height }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={active ? "waveform-bar" : ""}
          style={{
            width: 3,
            height: active ? `${heights[i] * 100}%` : "30%",
            backgroundColor: color,
            borderRadius: 2,
            animationDelay: active ? `${delays[i]}s` : "0s",
            transition: "height 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}
