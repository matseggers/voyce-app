"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", position: "", goal: "bewerbung" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleFinish() {
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, position: form.position, goal: form.goal },
      },
    });

    if (signUpError) {
      setError(
        signUpError.message.includes("already registered")
          ? "Diese E-Mail ist bereits registriert. Möchtest du dich einloggen?"
          : signUpError.message.includes("Password")
          ? "Passwort muss mindestens 6 Zeichen haben."
          : "Ups, da ist etwas schiefgelaufen. Probier es nochmal!"
      );
      setLoading(false);
      return;
    }

    if (data.user) {
      // Profil in users-Tabelle anlegen
      await supabase.from("users").upsert({
        id: data.user.id,
        email: form.email,
        name: form.name,
        current_position: form.position,
        weekly_goal: 3,
      });
    }

    router.push("/dashboard");
    router.refresh();
  }

  const goals = [
    { value: "bewerbung", label: "Bewerbungsgespräche", icon: "🎤" },
    { value: "praesentation", label: "Präsentationen", icon: "📊" },
    { value: "verkauf", label: "Verkaufsgespräche", icon: "💼" },
  ];

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-coral flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
                <path d="M5 11c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-serif font-semibold text-navy text-xl">Voyce</span>
          </Link>
          <div className="flex justify-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? "w-8 bg-coral" : s < step ? "w-4 bg-coral/40" : "w-4 bg-border"
              }`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-card border border-border/50">
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy mb-1">Hallo! Wie heißt du?</h2>
                <p className="text-muted text-sm">Wir personalisieren dein Training für dich.</p>
              </div>
              <Input label="Dein Name" placeholder="z.B. Anna Müller" value={form.name} onChange={(e) => update("name", e.target.value)} />
              <Input label="E-Mail" type="email" placeholder="du@beispiel.de" value={form.email} onChange={(e) => update("email", e.target.value)} />
              <Input label="Passwort" type="password" placeholder="Mindestens 6 Zeichen" value={form.password} onChange={(e) => update("password", e.target.value)} hint="Wähle ein sicheres Passwort" />
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}
              <Button onClick={() => { setError(""); setStep(2); }} fullWidth size="lg" disabled={!form.name || !form.email || form.password.length < 6}>
                Weiter
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy mb-1">Deine aktuelle Rolle?</h2>
                <p className="text-muted text-sm">Damit können wir passendere Szenarien vorschlagen.</p>
              </div>
              <Input label="Aktuelle Position" placeholder="z.B. Marketing Manager, Student, Freelancer" value={form.position} onChange={(e) => update("position", e.target.value)} />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} fullWidth>Zurück</Button>
                <Button onClick={() => setStep(3)} fullWidth>Weiter</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy mb-1">Dein Hauptziel?</h2>
                <p className="text-muted text-sm">Du kannst jederzeit alle Modi nutzen – das hilft uns beim Start.</p>
              </div>
              <div className="flex flex-col gap-3">
                {goals.map((g) => (
                  <button key={g.value} onClick={() => update("goal", g.value)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                      form.goal === g.value ? "border-coral bg-coral/5 ring-2 ring-coral/20" : "border-border hover:bg-card-bg"
                    }`}>
                    <span className="text-2xl">{g.icon}</span>
                    <div>
                      <div className="font-medium text-navy text-sm">{g.label}</div>
                      <div className="text-xs text-muted">Training &amp; Feedback</div>
                    </div>
                    {form.goal === g.value && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-coral flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} fullWidth>Zurück</Button>
                <Button onClick={handleFinish} loading={loading} fullWidth>Loslegen!</Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Schon registriert?{" "}
          <Link href="/login" className="text-coral font-medium hover:underline">Anmelden</Link>
        </p>
      </div>
    </div>
  );
}
