"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { modeLabel, scoreColor, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Tab = "sessions" | "szenarien";
type Mode = "all" | "bewerbung" | "praesentation" | "verkauf";

type Session = {
  id: string;
  mode: string;
  scenario_title: string;
  overall_score: number;
  created_at: string;
  input_type: string;
  duration_seconds: number;
};

const szenarien = {
  bewerbung: [
    { title: "Marketing Manager Mittelstand", desc: "Klassisches Interview bei einem B2B-Unternehmen.", difficulty: "mittel", usage: 842 },
    { title: "Junior Developer Startup", desc: "Tech-Interview mit Fokus auf Teamwork und Lernbereitschaft.", difficulty: "leicht", usage: 1203 },
    { title: "Vertriebsleiter DAX-Konzern", desc: "Anspruchsvolles Interview mit Stressfragen.", difficulty: "schwer", usage: 567 },
    { title: "Projektmanager Beratung", desc: "Strukturiertes Interview mit STAR-Methodik.", difficulty: "mittel", usage: 445 },
    { title: "HR Business Partner", desc: "Fokus auf Soft Skills und Führungserfahrung.", difficulty: "mittel", usage: 312 },
  ],
  praesentation: [
    { title: "Quartals-Update Vorstand (5 Min)", desc: "Kennzahlen klar und prägnant kommunizieren.", difficulty: "schwer", usage: 623 },
    { title: "Produkt-Pitch Messe (3 Min)", desc: "Kurzer, wirkungsvoller Pitch für Neukunden.", difficulty: "mittel", usage: 891 },
    { title: "Team-Meeting Ergebnis (10 Min)", desc: "Resultate einer Projektwoche strukturiert präsentieren.", difficulty: "leicht", usage: 743 },
    { title: "Keynote Konferenz (15 Min)", desc: "Inspirierende Präsentation vor großem Publikum.", difficulty: "schwer", usage: 289 },
  ],
  verkauf: [
    { title: "SaaS-Tool an IT-Leiter", desc: "Technische Lösung an kritischen Entscheider verkaufen.", difficulty: "schwer", usage: 748 },
    { title: "Beratung an Geschäftsführer", desc: "Vertrauensaufbau und ROI-Argumentation.", difficulty: "mittel", usage: 532 },
    { title: "Recruiting-Lösung an HR", desc: "Einwände gegen Kosten und Implementierung behandeln.", difficulty: "mittel", usage: 421 },
    { title: "Werbekampagne an Marketing-Dir.", desc: "Kreativer Pitch mit Zahlen und Cases.", difficulty: "leicht", usage: 387 },
  ],
};

const inputLabels: Record<string, string> = {
  ki_gespraech: "KI-Gespräch",
  aufnahme: "Live-Aufnahme",
  upload: "Upload",
};

const difficultyColor: Record<string, string> = {
  leicht: "mint",
  mittel: "amber",
  schwer: "coral",
} as const;

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("sessions");
  const [modeFilter, setModeFilter] = useState<Mode>("all");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("sessions")
        .select("id, mode, scenario_title, overall_score, created_at, input_type, duration_seconds")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setSessions(data || []);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSessions = sessions
    .filter((s) => modeFilter === "all" || s.mode === modeFilter)
    .sort((a, b) =>
      sortBy === "date"
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : b.overall_score - a.overall_score
    );

  const allSzenarien =
    modeFilter === "all"
      ? [
          ...szenarien.bewerbung.map((s) => ({ ...s, mode: "bewerbung" })),
          ...szenarien.praesentation.map((s) => ({ ...s, mode: "praesentation" })),
          ...szenarien.verkauf.map((s) => ({ ...s, mode: "verkauf" })),
        ]
      : modeFilter === "bewerbung" || modeFilter === "praesentation" || modeFilter === "verkauf"
      ? szenarien[modeFilter].map((s) => ({ ...s, mode: modeFilter }))
      : [];

  void allSzenarien;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="fade-in-up">
        <h1 className="font-serif text-3xl font-bold text-navy mb-1">Bibliothek</h1>
        <p className="text-muted">Deine Sessions und vorgefertigte Übungsszenarien.</p>
      </div>

      <div className="flex gap-1 bg-card-bg rounded-xl p-1 w-fit fade-in-up delay-100">
        {[
          { value: "sessions" as Tab, label: "Meine Sessions" },
          { value: "szenarien" as Tab, label: "Szenarien" },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn("px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
              tab === t.value ? "bg-white text-navy shadow-card" : "text-muted hover:text-text-main"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 fade-in-up delay-200">
        <div className="flex gap-1 bg-card-bg rounded-xl p-1">
          {(["all", "bewerbung", "praesentation", "verkauf"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setModeFilter(m)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                modeFilter === m ? "bg-white text-navy shadow-card" : "text-muted hover:text-text-main"
              )}>
              {m === "all" ? "Alle" : modeLabel(m)}
            </button>
          ))}
        </div>

        {tab === "sessions" && (
          <div className="flex gap-1 bg-card-bg rounded-xl p-1">
            {[{ value: "date", label: "Datum" }, { value: "score", label: "Score" }].map((s) => (
              <button key={s.value} onClick={() => setSortBy(s.value as "date" | "score")}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  sortBy === s.value ? "bg-white text-navy shadow-card" : "text-muted hover:text-text-main"
                )}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "sessions" && (
        <div className="flex flex-col gap-3 fade-in-up delay-300">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-border/50 shadow-card h-20 animate-pulse" />
            ))
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <div className="text-4xl mb-4">🎙️</div>
              <div className="font-medium text-navy mb-2">Noch keine Sessions</div>
              <Link href="/new" className="text-coral text-sm hover:underline">Erste Session starten →</Link>
            </div>
          ) : (
            filteredSessions.map((s) => (
              <Link key={s.id} href={`/session/${s.id}/feedback`}
                className="bg-white rounded-2xl p-5 border border-border/50 shadow-card card-hover flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: `${scoreColor(s.overall_score)}15` }}>
                  {s.mode === "bewerbung" ? "🎤" : s.mode === "praesentation" ? "📊" : "💼"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy text-sm truncate">{s.scenario_title}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">{modeLabel(s.mode)}</Badge>
                    {s.input_type && <Badge variant="outline" className="text-xs">{inputLabels[s.input_type] || s.input_type}</Badge>}
                    <span className="text-xs text-muted">{formatDate(s.created_at)}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono font-bold text-xl" style={{ color: scoreColor(s.overall_score) }}>
                    {s.overall_score?.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted">/10</div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === "szenarien" && (
        <div className="flex flex-col gap-6 fade-in-up delay-300">
          {(modeFilter === "all" ? ["bewerbung", "praesentation", "verkauf"] as const : [modeFilter as "bewerbung" | "praesentation" | "verkauf"]).map((mode) => (
            <div key={mode}>
              {modeFilter === "all" && (
                <h2 className="font-semibold text-navy mb-3 flex items-center gap-2">
                  <span>{mode === "bewerbung" ? "🎤" : mode === "praesentation" ? "📊" : "💼"}</span>
                  {modeLabel(mode)}
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {szenarien[mode].map((s, i) => (
                  <Link
                    key={i}
                    href={`/new?mode=${mode}`}
                    className="bg-white rounded-2xl p-5 border border-border/50 shadow-card card-hover group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-navy text-sm flex-1 pr-2">{s.title}</div>
                      <Badge variant={difficultyColor[s.difficulty] as "coral" | "mint" | "amber"} className="shrink-0 text-xs">
                        {s.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted leading-relaxed mb-3">{s.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">{s.usage.toLocaleString("de-DE")}× geübt</span>
                      <span className="text-coral text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Jetzt starten →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
