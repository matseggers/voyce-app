"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Mode = "bewerbung" | "praesentation" | "verkauf";
type InputType = "ki_gespraech" | "aufnahme" | "upload";

const modes = [
  {
    value: "bewerbung" as Mode,
    label: "Bewerbungsgespräch",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="9" y="2" width="6" height="12" rx="3" fill="#E8725A" />
        <path d="M5 11c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="#E8725A" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="18" x2="12" y2="22" stroke="#E8725A" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    description: "Übe dein nächstes Interview und überzeuge mit Klarheit und Ausstrahlung.",
    color: "coral",
    border: "border-coral",
    bg: "bg-coral/5",
  },
  {
    value: "praesentation" as Mode,
    label: "Präsentation",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="14" rx="2" stroke="#6BC4A6" strokeWidth="2" />
        <path d="M8 21h8M12 17v4" stroke="#6BC4A6" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 8l3 3 2-2 3 3" stroke="#6BC4A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    description: "Halte Vorträge, die ankommen – mit Feedback zu Struktur, Stimme und Wirkung.",
    color: "mint",
    border: "border-mint",
    bg: "bg-mint/5",
  },
  {
    value: "verkauf" as Mode,
    label: "Verkaufsgespräch",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="7" width="20" height="14" rx="2" stroke="#E5A340" strokeWidth="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#E5A340" strokeWidth="2" />
        <line x1="12" y1="12" x2="12" y2="16" stroke="#E5A340" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="14" x2="14" y2="14" stroke="#E5A340" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    description: "Schließe Deals souverän ab – trainiere Argumentation, Einwandbehandlung und Überzeugungskraft.",
    color: "amber",
    border: "border-amber-brand",
    bg: "bg-amber-brand/5",
  },
];

const inputTypes = [
  {
    value: "ki_gespraech" as InputType,
    label: "KI-Gespräch führen",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8725A" strokeWidth="2">
        <path d="M12 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3z" />
        <path d="M19 10c0 3.87-3.13 7-7 7s-7-3.13-7-7" strokeLinecap="round" />
        <line x1="12" y1="17" x2="12" y2="22" strokeLinecap="round" />
        <line x1="8" y1="22" x2="16" y2="22" strokeLinecap="round" />
      </svg>
    ),
    description: "Führe ein realistisches Gespräch mit einer KI, die sich wie ein echter Gesprächspartner verhält.",
  },
  {
    value: "aufnahme" as InputType,
    label: "Live aufnehmen",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6BC4A6" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" fill="#6BC4A6" />
      </svg>
    ),
    description: "Nimm dich selbst auf, während du übst – z.B. vor dem Spiegel oder beim Probelauf.",
  },
  {
    value: "upload" as InputType,
    label: "Datei hochladen",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E5A340" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
        <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
      </svg>
    ),
    description: "Lade eine bestehende Aufnahme hoch (Audio/Video) oder füge eine Transkription ein.",
  },
];

function NewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") as Mode | null;

  const [selectedMode, setSelectedMode] = useState<Mode | null>(initialMode);
  const [selectedInput, setSelectedInput] = useState<InputType | null>(null);

  function proceed() {
    if (!selectedMode || !selectedInput) return;
    const routes: Record<InputType, string> = {
      ki_gespraech: `/session/${selectedMode}`,
      aufnahme: "/session/record",
      upload: "/session/upload",
    };
    router.push(`${routes[selectedInput]}?mode=${selectedMode}`);
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10">
      {/* Step 1: Mode */}
      <div className="fade-in-up">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-navy mb-2">Neue Session starten</h1>
          <p className="text-muted">Wähle deinen Trainingsmodus und die Art der Eingabe.</p>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-coral text-white text-xs flex items-center justify-center font-bold">1</div>
          <span className="font-medium text-navy">Trainingsmodus wählen</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMode(m.value)}
              className={cn(
                "flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all",
                selectedMode === m.value
                  ? `${m.border} ${m.bg} ring-2 ring-offset-1 ring-current`
                  : "border-border/50 bg-white hover:border-border hover:shadow-card"
              )}
              style={{}}
            >
              <div className="w-14 h-14 rounded-2xl bg-card-bg flex items-center justify-center mb-4">
                {m.icon}
              </div>
              <div className="font-semibold text-navy text-sm mb-1">{m.label}</div>
              <div className="text-xs text-muted leading-relaxed">{m.description}</div>
              {selectedMode === m.value && (
                <div className="mt-3 w-5 h-5 rounded-full bg-coral flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Input type */}
      {selectedMode && (
        <div className="fade-in-up">
          <div className="mb-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-coral text-white text-xs flex items-center justify-center font-bold">2</div>
            <span className="font-medium text-navy">Wie möchtest du üben?</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            {inputTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedInput(t.value)}
                className={cn(
                  "flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all",
                  selectedInput === t.value
                    ? "border-coral bg-coral/5 ring-2 ring-coral/20"
                    : "border-border/50 bg-white hover:border-border hover:shadow-card"
                )}
              >
                <div className="w-11 h-11 rounded-xl bg-card-bg flex items-center justify-center mb-3">
                  {t.icon}
                </div>
                <div className="font-semibold text-navy text-sm mb-1">{t.label}</div>
                <div className="text-xs text-muted leading-relaxed">{t.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {selectedMode && selectedInput && (
        <div className="fade-in-up flex gap-4">
          <button
            onClick={proceed}
            className="flex-1 py-4 rounded-2xl bg-coral text-white font-semibold text-lg hover:bg-[#d4614a] transition-all shadow-coral hover:-translate-y-0.5 text-center"
          >
            Session starten →
          </button>
        </div>
      )}
    </div>
  );
}

export default function NewPage() {
  return (
    <Suspense>
      <NewSessionContent />
    </Suspense>
  );
}
