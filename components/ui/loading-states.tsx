"use client";

import { useEffect, useState } from "react";

const analyzeMessages = [
  "Deine Antworten werden analysiert...",
  "Gleich hast du dein Feedback...",
  "Wir hören genau hin...",
  "Fast fertig – dein Coach schreibt...",
  "Wir werten deine Stärken aus...",
  "Noch einen Moment...",
];

export function AnalyzingLoader() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIdx((i) => (i + 1) % analyzeMessages.length);
    }, 2500);
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 8, 92));
    }, 400);
    return () => {
      clearInterval(msgTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-16 px-8 text-center">
      {/* Animated mic icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-coral/10 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-coral/20 flex items-center justify-center pulse-record">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="#E8725A" />
              <path d="M5 11c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="#E8725A" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="#E8725A" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full max-w-xs">
        <div className="h-1.5 bg-card-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-coral rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted mt-3 transition-all duration-500">
          {analyzeMessages[msgIdx]}
        </p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-border/50 animate-pulse">
      <div className="h-4 bg-card-bg rounded w-1/3 mb-4" />
      <div className="h-3 bg-card-bg rounded w-full mb-2" />
      <div className="h-3 bg-card-bg rounded w-5/6" />
    </div>
  );
}
