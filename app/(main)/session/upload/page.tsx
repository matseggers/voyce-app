"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { AnalyzingLoader } from "@/components/ui/loading-states";
import { modeLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Mode = "bewerbung" | "praesentation" | "verkauf";
type Tab = "audio" | "video" | "text";

function UploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") || "bewerbung") as Mode;

  const [tab, setTab] = useState<Tab>("audio");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function analyze() {
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2500));
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        transcript: text || `[Hochgeladene Datei: ${file?.name}]`,
        context: { topic: context },
        input_type: "upload",
        scenario_title: context.slice(0, 80) || file?.name?.replace(/\.[^.]+$/, "").slice(0, 80) || `${modeLabel(mode)} – Upload`,
        durationSeconds: 300,
      }),
    });
    const data = await res.json();
    router.push(`/session/${data.sessionId || "demo"}/feedback`);
  }

  const tabs = [
    { value: "audio" as Tab, label: "Audio", accept: ".mp3,.wav,.m4a,.webm,.ogg" },
    { value: "video" as Tab, label: "Video", accept: ".mp4,.mov,.webm" },
    { value: "text" as Tab, label: "Transkription", accept: "" },
  ];

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  if (isAnalyzing) {
    return <div className="max-w-lg mx-auto"><div className="bg-white rounded-3xl border border-border/50 shadow-card"><AnalyzingLoader /></div></div>;
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 fade-in-up">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/10 text-navy text-xs font-medium mb-4">
          {modeLabel(mode)}
        </div>
        <h1 className="font-serif text-3xl font-bold text-navy mb-2">Datei hochladen</h1>
        <p className="text-muted">Lade eine Aufnahme hoch oder füge eine Transkription ein.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-card-bg rounded-xl p-1">
          {tabs.map((t) => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                tab === t.value ? "bg-white text-navy shadow-card" : "text-muted hover:text-text-main"
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Upload zone */}
        {tab !== "text" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
              isDragging ? "border-coral bg-coral/5" : "border-border hover:border-coral/50 hover:bg-card-bg"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={tabs.find((t) => t.value === tab)?.accept}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-mint/10 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6BC4A6" strokeWidth="2">
                    <path d="M9 12l2 2 4-4M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3 3-3M12 12v8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="font-medium text-navy text-sm">{file.name}</div>
                <div className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-red-400 hover:underline">Entfernen</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <div className="font-medium text-navy text-sm">Datei hierher ziehen</div>
                  <div className="text-xs text-muted mt-1">oder klicken zum Auswählen</div>
                </div>
                <div className="text-xs text-muted">
                  {tab === "audio" ? "MP3, WAV, M4A, WebM" : "MP4, MOV, WebM"} · max. 100 MB
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text input */}
        {tab === "text" && (
          <Textarea
            label="Transkription einfügen"
            placeholder="Füge hier die Transkription deines Gesprächs oder deiner Präsentation ein..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
          />
        )}

        <Textarea
          label="Kontext (optional)"
          placeholder="Was war das Ziel dieser Aufnahme? z.B. Vorstellungsgespräch, Präsentation vor Kunden..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={2}
        />

        <Button
          onClick={analyze}
          fullWidth size="lg"
          disabled={(tab !== "text" && !file) || (tab === "text" && !text.trim())}
        >
          Analysieren
        </Button>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return <Suspense><UploadContent /></Suspense>;
}
