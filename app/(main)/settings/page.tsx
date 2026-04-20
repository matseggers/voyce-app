"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "profil" | "ziele" | "audio" | "abo" | "datenschutz";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profil");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "Anna Müller",
    email: "anna@beispiel.de",
    position: "Marketing Manager",
    industry: "B2B Software",
    experience: "mittel",
  });
  const [weeklyGoal, setWeeklyGoal] = useState(5);

  async function save() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const tabs: { value: Tab; label: string }[] = [
    { value: "profil", label: "Profil" },
    { value: "ziele", label: "Ziele" },
    { value: "audio", label: "Audio" },
    { value: "abo", label: "Abo" },
    { value: "datenschutz", label: "Datenschutz" },
  ];

  const experiences = [
    { value: "einsteiger", label: "Einsteiger" },
    { value: "mittel", label: "Berufserfahren" },
    { value: "senior", label: "Senior" },
    { value: "fuehrung", label: "Führungskraft" },
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div className="fade-in-up">
        <h1 className="font-serif text-3xl font-bold text-navy mb-1">Einstellungen</h1>
        <p className="text-muted">Passe dein Profil und Training an.</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar nav */}
        <aside className="hidden sm:flex flex-col gap-1 w-44 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn("text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                tab === t.value ? "bg-coral/10 text-coral" : "text-muted hover:bg-card-bg hover:text-text-main"
              )}
            >
              {t.label}
            </button>
          ))}
        </aside>

        {/* Mobile tabs */}
        <div className="sm:hidden w-full flex gap-1 bg-card-bg rounded-xl p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={cn("px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                tab === t.value ? "bg-white text-navy shadow-card" : "text-muted"
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === "profil" && (
            <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card flex flex-col gap-5">
              <h2 className="font-semibold text-navy">Dein Profil</h2>
              <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              <Input label="E-Mail" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              <Input label="Aktuelle Position" value={profile.position} onChange={(e) => setProfile({ ...profile, position: e.target.value })} />
              <Input label="Branche" value={profile.industry} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} />
              <div>
                <label className="text-sm font-medium text-navy block mb-3">Erfahrungslevel</label>
                <div className="grid grid-cols-2 gap-2">
                  {experiences.map((e) => (
                    <button key={e.value} onClick={() => setProfile({ ...profile, experience: e.value })}
                      className={cn("py-2.5 rounded-xl text-sm font-medium border transition-all",
                        profile.experience === e.value ? "bg-coral text-white border-coral" : "bg-white text-muted border-border hover:border-coral/50"
                      )}>
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={save} loading={saving}>{saved ? "✓ Gespeichert" : "Speichern"}</Button>
              </div>
            </div>
          )}

          {tab === "ziele" && (
            <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card flex flex-col gap-6">
              <h2 className="font-semibold text-navy">Trainingsziele</h2>
              <div>
                <label className="text-sm font-medium text-navy block mb-4">Wöchentliches Ziel: {weeklyGoal} Sessions</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setWeeklyGoal(Math.max(1, weeklyGoal - 1))}
                    className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-lg hover:bg-card-bg transition-colors">
                    −
                  </button>
                  <div className="flex gap-2 flex-1 justify-center">
                    {[1, 2, 3, 4, 5, 7].map((n) => (
                      <button key={n} onClick={() => setWeeklyGoal(n)}
                        className={cn("w-9 h-9 rounded-xl text-sm font-medium transition-all",
                          weeklyGoal === n ? "bg-coral text-white shadow-coral" : "bg-card-bg text-muted hover:bg-border"
                        )}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setWeeklyGoal(Math.min(14, weeklyGoal + 1))}
                    className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-lg hover:bg-card-bg transition-colors">
                    +
                  </button>
                </div>
                <p className="text-xs text-muted mt-3 text-center">
                  {weeklyGoal <= 2 ? "Ein guter Einstieg." : weeklyGoal <= 4 ? "Solides Wochenziel – gut für nachhaltigen Fortschritt." : "Ambitioniert! Tolle Motivation. 🔥"}
                </p>
              </div>
              <Button onClick={save} loading={saving}>{saved ? "✓ Gespeichert" : "Speichern"}</Button>
            </div>
          )}

          {tab === "audio" && (
            <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card flex flex-col gap-5">
              <h2 className="font-semibold text-navy">Audio-Einstellungen</h2>
              <div>
                <label className="text-sm font-medium text-navy block mb-2">Mikrofon</label>
                <select className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-coral/30">
                  <option>Standard-Mikrofon</option>
                  <option>AirPods (Integriertes Mikrofon)</option>
                  <option>MacBook Pro Mikrofon</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-navy block mb-2">KI-Stimme (Text-to-Speech)</label>
                <select className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-coral/30">
                  <option>Standard (Browser)</option>
                  <option>Natürlich (ElevenLabs) – Pro</option>
                </select>
              </div>
              <div className="bg-card-bg rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-navy">Mikrofon testen</span>
                  <button className="text-xs text-coral font-medium hover:underline">Test starten</button>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-mint rounded-full w-0" />
                </div>
                <p className="text-xs text-muted mt-2">Klicke "Test starten" und sprich in dein Mikrofon</p>
              </div>
            </div>
          )}

          {tab === "abo" && (
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-navy">Aktueller Plan</h2>
                    <div className="text-xs text-muted mt-1">Abgerechnet monatlich</div>
                  </div>
                  <div className="bg-coral/10 text-coral font-semibold text-sm px-3 py-1.5 rounded-full">Free</div>
                </div>
                <div className="flex flex-col gap-2 mb-5">
                  {["3 Sessions/Monat", "Basis-Feedback", "Alle 3 Modi"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-muted">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#6BC4A6" fillOpacity="0.2" /><path d="M8 12l3 3 5-5" stroke="#6BC4A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {f}
                    </div>
                  ))}
                </div>
                <Button variant="primary" fullWidth>Auf Pro upgraden – 39€/Mo.</Button>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card">
                <h2 className="font-semibold text-navy mb-4">Pro-Features</h2>
                {["Unlimitierte Sessions", "Alle Modi & Szenarien", "Fortschritts-Dashboard", "Personalisierte Tipps", "Audio-Upload", "KI-Gespräch mit Stimme"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-muted py-1">
                    <span className="text-coral">✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "datenschutz" && (
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card">
                <h2 className="font-semibold text-navy mb-4">Deine Daten</h2>
                <div className="flex flex-col gap-3">
                  <button className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-card-bg transition-colors text-left group">
                    <div>
                      <div className="font-medium text-navy text-sm">Daten herunterladen</div>
                      <div className="text-xs text-muted mt-0.5">Alle Sessions, Scores und Einstellungen als JSON</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="group-hover:stroke-coral transition-colors">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5 5-5-5M12 3v10" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button className="flex items-center justify-between p-4 rounded-xl border border-red-200 hover:bg-red-50 transition-colors text-left">
                    <div>
                      <div className="font-medium text-red-600 text-sm">Account löschen</div>
                      <div className="text-xs text-muted mt-0.5">Alle Daten werden unwiderruflich gelöscht (DSGVO Art. 17)</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" strokeLinecap="round" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-mint/5 border border-mint/20 rounded-2xl p-5">
                <div className="font-medium text-[#3a9b7a] text-sm mb-2 flex items-center gap-2">
                  <span>🇩🇪</span> DSGVO-konform
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Voyce verarbeitet deine Daten ausschließlich auf deutschen und europäischen Servern. Audio-Dateien werden nach der Analyse automatisch gelöscht, sofern du sie nicht explizit speicherst. Wir verkaufen keine Daten an Dritte.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
