"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea, Input } from "@/components/ui/input";
import { Waveform } from "@/components/ui/waveform";
import { AnalyzingLoader } from "@/components/ui/loading-states";
import { cn } from "@/lib/utils";

type Phase = "setup" | "chat" | "analyzing";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "bewerbung";

  const [phase, setPhase] = useState<Phase>("setup");
  const [jobPosting, setJobPosting] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [background, setBackground] = useState("");
  const [difficulty, setDifficulty] = useState<"freundlich" | "realistisch" | "herausfordernd">("realistisch");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
        mode,
        messages: [],
        context: { jobPosting, jobUrl, background, difficulty },
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
      const closingMessages: Message[] = [
        ...newMessages,
        {
          role: "assistant",
          content: "Vielen Dank! Das war unser Gespräch. Ich habe jetzt ein umfassendes Bild von Ihnen gewonnen. Lassen Sie uns Ihre Performance gemeinsam anschauen.",
        },
      ];
      setMessages(closingMessages);
      setIsLoading(false);
      setTimeout(() => finishSession(closingMessages), 1500);
      return;
    }

    const res = await fetch("/api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        messages: newMessages,
        context: { jobPosting, jobUrl, background, difficulty },
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
      .map((m) => `${m.role === "user" ? "Bewerber" : "Interviewer"}: ${m.content}`)
      .join("\n\n");

    const scenarioTitle = jobPosting.split("\n")[0].replace(/[<>]/g, "").trim().slice(0, 80) || "Bewerbungsgespräch";
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        transcript,
        context: { jobPosting, difficulty },
        input_type: "ki_gespraech",
        scenario_title: scenarioTitle,
        durationSeconds: roundCount * 90,
      }),
    });

    const data = await res.json();
    const sessionId = data.sessionId || "demo";
    router.push(`/session/${sessionId}/feedback`);
  }

  const difficulties = [
    { value: "freundlich", label: "Freundlich" },
    { value: "realistisch", label: "Realistisch" },
    { value: "herausfordernd", label: "Herausfordernd" },
  ] as const;

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
          <h1 className="font-serif text-3xl font-bold text-navy mb-2">Bewerbungsgespräch</h1>
          <p className="text-muted">Konfiguriere dein Interview – je mehr Kontext du gibst, desto realistischer wird es.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-navy block mb-3">Stellenanzeige</label>
            <div className="flex gap-3 mb-3">
              <Input
                placeholder="URL der Stellenanzeige (optional)"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="md"
                onClick={async () => {
                  if (!jobUrl) return;
                  const res = await fetch("/api/extract-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: jobUrl }),
                  });
                  const data = await res.json();
                  if (data.text) setJobPosting(data.text);
                }}
              >
                Laden
              </Button>
            </div>
            <Textarea
              placeholder="Oder füge die Stellenanzeige hier ein (Position, Anforderungen, Unternehmen)..."
              value={jobPosting}
              onChange={(e) => setJobPosting(e.target.value)}
              rows={5}
            />
          </div>

          <Textarea
            label="Dein Hintergrund (optional)"
            placeholder="Kurz über dich: aktuelle Position, Erfahrung, warum dieser Job..."
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            rows={3}
            hint="Hilft der KI, passendere Fragen zu stellen"
          />

          <div>
            <label className="text-sm font-medium text-navy block mb-3">Schwierigkeitsgrad</label>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border",
                    difficulty === d.value
                      ? "bg-coral text-white border-coral shadow-coral"
                      : "bg-white text-muted border-border hover:border-coral/50 hover:text-text-main"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={startSession} fullWidth size="lg">
            Gespräch starten
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-card mb-4 flex items-center justify-between">
        <div>
          <div className="font-semibold text-navy text-sm">Bewerbungsgespräch</div>
          <div className="text-xs text-muted">Runde {roundCount}/{maxRounds}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
          <span className="text-xs text-muted">KI aktiv</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-1 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center shrink-0 mt-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
                  <path d="M5 11c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-coral text-white rounded-br-sm"
                  : "bg-white border border-border/50 text-text-main rounded-bl-sm shadow-card"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
                <path d="M5 11c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="bg-white border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-card">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-muted animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-card">
        {isRecording ? (
          <div className="flex items-center gap-4">
            <Waveform active bars={16} height={32} />
            <span className="text-sm text-coral font-medium flex-1">Aufnahme läuft...</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setIsRecording(false);
                setUserInput("Ich habe meine Antwort fertig.");
              }}
            >
              Stopp
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Deine Antwort eingeben oder Mikrofon nutzen..."
              rows={2}
              className="flex-1 resize-none px-4 py-3 rounded-xl border border-border bg-cream text-sm text-text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsRecording(true)}
                className="w-10 h-10 rounded-xl bg-coral/10 text-coral flex items-center justify-center hover:bg-coral/20 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                </svg>
              </button>
              <button
                onClick={sendMessage}
                disabled={!userInput.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-coral text-white flex items-center justify-center hover:bg-[#d4614a] transition-colors disabled:opacity-40"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted">Enter zum Senden · Shift+Enter für neue Zeile</span>
          {roundCount >= 5 && (
            <button
              onClick={() => finishSession(messages)}
              className="text-xs text-coral hover:underline"
            >
              Gespräch beenden →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense>
      <InterviewContent />
    </Suspense>
  );
}
