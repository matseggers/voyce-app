"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Waveform } from "@/components/ui/waveform";
import { AnalyzingLoader } from "@/components/ui/loading-states";
import { formatDuration, modeLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Mode = "bewerbung" | "praesentation" | "verkauf";

function RecordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") || "bewerbung") as Mode;

  const [phase, setPhase] = useState<"setup" | "recording" | "analyzing">("setup");
  const [context, setContext] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const modeColors: Record<Mode, string> = {
    bewerbung: "#E8725A",
    praesentation: "#6BC4A6",
    verkauf: "#E5A340",
  };

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        new Blob(chunksRef.current, { type: "audio/webm" });
      };
      mr.start();
      setIsRecording(true);
    } catch {
      alert("Bitte erlaube den Mikrofonzugriff, um aufnehmen zu können.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function finishSession() {
    setPhase("analyzing");
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        transcript: context || `[Live-Aufnahme: ${formatDuration(elapsed)}]`,
        context: { topic: context },
        input_type: "aufnahme",
        scenario_title: context.slice(0, 80) || `${modeLabel(mode)} – Live`,
        durationSeconds: elapsed,
      }),
    });
    const data = await res.json();
    router.push(`/session/${data.sessionId || "demo"}/feedback`);
  }

  if (phase === "analyzing") {
    return <div className="max-w-lg mx-auto"><div className="bg-white rounded-3xl border border-border/50 shadow-card"><AnalyzingLoader /></div></div>;
  }

  const color = modeColors[mode];

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-8 fade-in-up">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
          style={{ backgroundColor: `${color}15`, color }}>
          {modeLabel(mode)}
        </div>
        <h1 className="font-serif text-3xl font-bold text-navy mb-2">Live aufnehmen</h1>
        <p className="text-muted">Nimm deine Übung auf und erhalte danach detailliertes Feedback.</p>
      </div>

      {phase === "setup" && (
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card flex flex-col gap-5">
          <Input
            label="Worum geht es? (optional)"
            placeholder="z.B. Vorstellungsgespräch für UX Designer / Pitch für Produkt X..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
          <Button onClick={() => { setPhase("recording"); startRecording(); }} fullWidth size="lg">
            Aufnahme starten
          </Button>
        </div>
      )}

      {phase === "recording" && (
        <div className="bg-white rounded-3xl p-10 border border-border/50 shadow-card text-center flex flex-col items-center gap-6">
          {/* Timer */}
          <div className="font-mono text-5xl font-bold text-navy">{formatDuration(elapsed)}</div>

          {/* Mic button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "w-28 h-28 rounded-full flex items-center justify-center transition-all",
              isRecording
                ? "bg-red-500 shadow-[0_0_0_12px_rgba(239,68,68,0.2)] record-ring"
                : "hover:scale-105"
            )}
            style={!isRecording ? { backgroundColor: color, boxShadow: `0 4px 24px ${color}60` } : {}}
          >
            {isRecording ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
                <path d="M5 11c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
          </button>

          {isRecording && <Waveform active bars={28} height={40} color={color} />}

          {isRecording ? (
            <p className="text-sm font-medium" style={{ color }}>Aufnahme läuft – klicke zum Stoppen</p>
          ) : elapsed > 0 ? (
            <p className="text-muted text-sm">Pausiert</p>
          ) : null}

          {!isRecording && elapsed > 0 && (
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={startRecording} fullWidth>Weiter aufnehmen</Button>
              <Button onClick={finishSession} fullWidth>Feedback erhalten</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RecordPage() {
  return <Suspense><RecordContent /></Suspense>;
}
