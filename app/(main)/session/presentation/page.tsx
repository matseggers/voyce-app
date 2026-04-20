"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea, Input } from "@/components/ui/input";
import { Waveform } from "@/components/ui/waveform";
import { AnalyzingLoader } from "@/components/ui/loading-states";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Phase = "setup" | "recording" | "analyzing";

function PresentationContent() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("setup");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [duration, setDuration] = useState("5");
  const [goal, setGoal] = useState("informieren");
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const targetSeconds = parseInt(duration) * 60;

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  async function finishRecording() {
    setIsRecording(false);
    setPhase("analyzing");

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "praesentation",
        transcript: transcript || `[Präsentation über: ${topic}. Dauer: ${elapsed} Sekunden.]`,
        context: { topic, audience, goal },
        durationSeconds: elapsed,
      }),
    });

    const data = await res.json();
    const sessionId = data.sessionId || "demo";
    router.push(`/session/${sessionId}/feedback`);
  }

  const durations = [
    { value: "3", label: "3 Min" },
    { value: "5", label: "5 Min" },
    { value: "10", label: "10 Min" },
    { value: "15", label: "15 Min" },
  ];

  const goals = [
    { value: "informieren", label: "Informieren" },
    { value: "ueberzeugen", label: "Überzeugen" },
    { value: "verkaufen", label: "Verkaufen" },
    { value: "motivieren", label: "Motivieren" },
  ];

  if (phase === "analyzing") {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl border border-border/50 shadow-card">
          <AnalyzingLoader />
        </div>
      </div>
    );
  }

  if (phase === "setup") {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-8 fade-in-up">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy mb-2">Präsentation trainieren</h1>
          <p className="text-muted">Beschreibe deine Präsentation – dann nimmst du dich auf und erhältst Feedback.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card flex flex-col gap-5">
          <Textarea
            label="Thema der Präsentation"
            placeholder="z.B. Unsere neue Produktstrategie für Q3 / Klimawandel und Energiewende..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
          />

          <Input
            label="Dein Publikum"
            placeholder="z.B. Vorstand, Kunden-Meeting, Konferenz mit 200 Personen..."
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />

          <div>
            <label className="text-sm font-medium text-navy block mb-3">Zieldauer</label>
            <div className="flex gap-2">
              {durations.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border",
                    duration === d.value
                      ? "bg-mint text-white border-mint"
                      : "bg-white text-muted border-border hover:border-mint/50"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-navy block mb-3">Dein Ziel</label>
            <div className="grid grid-cols-2 gap-2">
              {goals.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-medium transition-all border",
                    goal === g.value
                      ? "bg-mint text-white border-mint"
                      : "bg-white text-muted border-border hover:border-mint/50"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={() => setPhase("recording")} fullWidth size="lg" disabled={!topic}>
            Präsentation starten
          </Button>
        </div>
      </div>
    );
  }

  const progress = Math.min(elapsed / targetSeconds, 1);

  return (
    <div className="max-w-2xl mx-auto fade-in-up">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-card mb-6 flex items-center justify-between">
        <div>
          <div className="font-semibold text-navy text-sm truncate max-w-[200px]">{topic}</div>
          <div className="text-xs text-muted">{audience}</div>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-lg text-navy">{formatDuration(elapsed)}</div>
          <div className="text-xs text-muted">Ziel: {duration} Min</div>
        </div>
      </div>

      {/* Main recording area */}
      <div className="bg-white rounded-3xl p-10 border border-border/50 shadow-card text-center mb-6">
        {/* Progress ring */}
        <div className="relative w-40 h-40 mx-auto mb-6">
          <svg width="160" height="160" className="-rotate-90">
            <circle cx="80" cy="80" r="70" fill="none" stroke="#F2F0ED" strokeWidth="8" />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={isRecording ? "#6BC4A6" : "#E5E2DC"}
              strokeWidth="8"
              strokeDasharray={`${progress * 440} 440`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s linear" }}
            />
          </svg>
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              "absolute inset-0 m-auto w-24 h-24 rounded-full flex items-center justify-center transition-all",
              isRecording
                ? "bg-red-500 shadow-[0_0_0_8px_rgba(239,68,68,0.2)] record-ring"
                : "bg-mint shadow-[0_4px_16px_rgba(107,196,166,0.4)] hover:scale-105"
            )}
          >
            {isRecording ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
                <path d="M5 11c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        {isRecording ? (
          <>
            <Waveform active bars={24} height={40} color="#6BC4A6" />
            <p className="text-mint font-medium mt-4 text-sm">Aufnahme läuft...</p>
          </>
        ) : elapsed > 0 ? (
          <p className="text-muted text-sm">Pausiert – klicke zum Fortfahren</p>
        ) : (
          <p className="text-muted text-sm">Klicke auf das Mikrofon, um zu starten</p>
        )}
      </div>

      {/* Notes sidebar */}
      <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-card mb-6">
        <div className="text-xs font-medium text-navy mb-2">Stichpunkte</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notizen für dich..."
          rows={3}
          className="w-full text-sm text-text-main placeholder:text-muted bg-transparent resize-none focus:outline-none"
        />
      </div>

      {elapsed > 10 && (
        <Button onClick={finishRecording} fullWidth size="lg" variant="secondary">
          Präsentation beenden & Feedback erhalten
        </Button>
      )}
    </div>
  );
}

export default function PresentationPage() {
  return (
    <Suspense>
      <PresentationContent />
    </Suspense>
  );
}
