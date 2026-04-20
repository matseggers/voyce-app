"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Die Passwörter stimmen nicht überein."); return; }
    if (password.length < 6) { setError("Passwort muss mindestens 6 Zeichen haben."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError("Fehler beim Zurücksetzen. Bitte fordere einen neuen Link an."); setLoading(false); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-coral mx-auto flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
              <path d="M5 11c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-navy mb-2">Neues Passwort</h1>
          <p className="text-muted text-sm">Wähle ein neues sicheres Passwort.</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-card border border-border/50">
          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <Input label="Neues Passwort" type="password" placeholder="Mindestens 6 Zeichen" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input label="Passwort bestätigen" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}
            <Button type="submit" loading={loading} fullWidth size="lg">Passwort speichern</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
