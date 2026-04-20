"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea, Input } from "@/components/ui/input";
import { Waveform } from "@/components/ui/waveform";
import { AnalyzingLoader } from "@/components/ui/loading-states";
import { cn } from "@/lib/utils";

type Phase = "setup" | "chat" | "analyzing";
type Message = { role: "user" | "assistant"; content: string };

function SalesContent() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("setup");
  const [product, setProduct] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [conversationType, setConversationType] = useState("Erstgespräch");
  const [difficulty, setDifficulty] = useState("Skeptisch");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [roundCount, setRoundCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const maxRounds = 7;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startSession() {
    setPhase("chat");
    setIsLoading(true);
    const res = await fetch("/api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "verkauf",
        messages: [],
        context: { product, websiteUrl, targetCustomer, conversationType, difficulty },
        action: "start",
      }),
    });
    const data = await res.json();
    setMessages([{ role: "assistant", content: data.message }]);
    setIsLoading(false);
  }

  async function sendMessage() {
    if (!userInput.trim() || isLoading) return;
    const newMessages: Message[] = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsLoading(true);
    const newRound = roundCount + 1;
    setRoundCount(newRound);

    if (newRound >= maxRounds) {
      const closing: Message[] = [
        ...newMessages,
        { role: "assistant", content: "Okay, vielen Dank für das Gespräch. Ich denke, das reicht für heute. Wir werden das intern besprechen." },
      ];
      setMessages(closing);
      setIsLoading(false);
      setTimeout(() => finishSession(closing), 1500);
      return;
    }

    const res = await fetch("/api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "verkauf",
        messages: newMessages,
        context: { product, websiteUrl, targetCustomer, conversationType, difficulty },
        action: "continue",
      }),
    });
    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.message }]);
    setIsLoading(false);
  }

  async function finishSession(finalMessages: Message[]) {
    setPhase("analyzing");
    const transcript = finalMessages
      .map((m) => `${m.role === "user" ? "Verkäufer" : "Kunde"}: ${m.content}`)
      .join("\n\n");
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "verkauf", transcript, context: { product, targetCustomer }, durationSeconds: roundCount * 90 }),
    });
    const data = await res.json();
    router.push(`/session/${data.sessionId || "demo"}/feedback`);
  }

  const convTypes = ["Kaltakquise", "Erstgespräch", "Follow-up", "Verhandlung"];
  const difficulties = ["Interessiert", "Skeptisch", "Abweisend"];

  if (phase === "analyzing") {
    return <div className="max-w-lg mx-auto"><div className="bg-white rounded-3xl border border-border/50 shadow-card"><AnalyzingLoader /></div></div>;
  }

  if (phase === "setup") {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-8 fade-in-up">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy mb-2">Verkaufsgespräch</h1>
          <p className="text-muted">Beschreibe dein Produkt und deinen Zielkunden – dann startet das Training.</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card flex flex-col gap-5">
          <Textarea
            label="Was verkaufst du?"
            placeholder="Beschreibe dein Produkt oder deine Dienstleistung..."
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            rows={4}
          />
          <div className="flex gap-3">
            <Input
              label="Website (optional)"
              placeholder="https://dein-unternehmen.de"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="flex-1"
            />
          </div>
          <Input
            label="Zielkunde"
            placeholder="z.B. IT-Leiter Mittelstand, Geschäftsführer Startup..."
            value={targetCustomer}
            onChange={(e) => setTargetCustomer(e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-navy block mb-3">Gesprächstyp</label>
            <div className="grid grid-cols-2 gap-2">
              {convTypes.map((t) => (
                <button key={t} onClick={() => setConversationType(t)}
                  className={cn("py-2.5 rounded-xl text-sm font-medium transition-all border",
                    conversationType === t ? "bg-amber-brand text-white border-amber-brand" : "bg-white text-muted border-border hover:border-amber-brand/50"
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-navy block mb-3">Kundenhaltung</label>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={cn("flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border",
                    difficulty === d ? "bg-amber-brand text-white border-amber-brand" : "bg-white text-muted border-border hover:border-amber-brand/50"
                  )}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={startSession} fullWidth size="lg" disabled={!product || !targetCustomer}>
            Gespräch starten
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-card mb-4 flex items-center justify-between">
        <div>
          <div className="font-semibold text-navy text-sm">Verkaufsgespräch · {conversationType}</div>
          <div className="text-xs text-muted">Runde {roundCount}/{maxRounds} · Kunde: {difficulty}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-brand animate-pulse" />
          <span className="text-xs text-muted">KI aktiv</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-1 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-amber-brand flex items-center justify-center shrink-0 mt-1 text-white text-xs font-bold">K</div>
            )}
            <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user" ? "bg-coral text-white rounded-br-sm" : "bg-white border border-border/50 text-text-main rounded-bl-sm shadow-card"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-brand flex items-center justify-center shrink-0 text-white text-xs font-bold">K</div>
            <div className="bg-white border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-card">
              <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}</div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-card">
        {isRecording ? (
          <div className="flex items-center gap-4">
            <Waveform active bars={16} height={32} color="#E5A340" />
            <span className="text-sm text-amber-brand font-medium flex-1">Aufnahme läuft...</span>
            <Button variant="danger" size="sm" onClick={() => { setIsRecording(false); setUserInput("Ich verstehe Ihre Bedenken vollkommen..."); }}>Stopp</Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              placeholder="Deine Antwort eingeben..." rows={2}
              className="flex-1 resize-none px-4 py-3 rounded-xl border border-border bg-cream text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all"
            />
            <div className="flex flex-col gap-2">
              <button onClick={() => setIsRecording(true)} className="w-10 h-10 rounded-xl bg-amber-brand/10 text-amber-brand flex items-center justify-center hover:bg-amber-brand/20 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="2" width="6" height="12" rx="3" /></svg>
              </button>
              <button onClick={sendMessage} disabled={!userInput.trim() || isLoading} className="w-10 h-10 rounded-xl bg-coral text-white flex items-center justify-center hover:bg-[#d4614a] transition-colors disabled:opacity-40">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {roundCount >= 5 && (
          <div className="mt-2 text-right">
            <button onClick={() => finishSession(messages)} className="text-xs text-coral hover:underline">Gespräch beenden →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SalesPage() {
  return <Suspense><SalesContent /></Suspense>;
}
