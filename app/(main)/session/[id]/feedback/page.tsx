"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ScoreCircle } from "@/components/ui/score-circle";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { scoreColor, modeLabel, formatDate } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip,
} from "recharts";

type Answer = {
  question_text: string;
  answer_transcription: string;
  score: number;
  feedback: string;
  optimized_answer: string;
  sort_order: number;
};

type Session = {
  id: string;
  mode: string;
  scenario_title: string;
  overall_score: number;
  scores: Record<string, number>;
  summary: string;
  strengths: string[];
  improvements: string[];
  next_tip: string;
  duration_seconds: number;
  avg_speaking_speed: number;
  total_filler_words: number;
  created_at: string;
};

const scoreLabels: Record<string, string> = {
  relevanz: "Inhaltliche Relevanz",
  struktur: "Struktur & Aufbau",
  ueberzeugung: "Überzeugungskraft",
  klarheit: "Klarheit & Prägnanz",
  stimmwirkung: "Stimmwirkung",
  ausstrahlung: "Ausstrahlung",
};

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"inhalt" | "stimme" | "tipps">("inhalt");
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [prevScore, setPrevScore] = useState<number | null>(null);
  const [wpmHistory, setWpmHistory] = useState<{ name: string; wpm: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function load() {
      if (!id || id === "demo") { setLoading(false); return; }

      const { data: sessionData } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", id)
        .single();

      if (!sessionData) { setLoading(false); return; }
      setSession(sessionData);

      const { data: answerData } = await supabase
        .from("session_answers")
        .select("*")
        .eq("session_id", id)
        .order("sort_order", { ascending: true });

      setAnswers(answerData || []);

      // Load previous session score for comparison
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prevSessions } = await supabase
          .from("sessions")
          .select("overall_score, avg_speaking_speed, created_at")
          .eq("user_id", user.id)
          .eq("mode", sessionData.mode)
          .lt("created_at", sessionData.created_at)
          .order("created_at", { ascending: false })
          .limit(1);

        if (prevSessions?.length) setPrevScore(prevSessions[0].overall_score);

        // WPM history for this mode
        const { data: wpmSessions } = await supabase
          .from("sessions")
          .select("avg_speaking_speed, created_at")
          .eq("user_id", user.id)
          .eq("mode", sessionData.mode)
          .not("avg_speaking_speed", "is", null)
          .order("created_at", { ascending: true })
          .limit(8);

        if (wpmSessions?.length) {
          setWpmHistory(
            (wpmSessions as Session[]).map((s, i) => ({
              name: s.created_at === sessionData.created_at ? "Aktuell" : `Session ${i + 1}`,
              wpm: Math.round(s.avg_speaking_speed),
            }))
          );
        }
      }

      setLoading(false);
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-border/50 h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="font-serif text-2xl font-bold text-navy mb-2">Session nicht gefunden</h2>
        <p className="text-muted mb-6">Diese Session existiert nicht oder du hast keinen Zugriff darauf.</p>
        <Link href="/library"><Button>Zur Bibliothek</Button></Link>
      </div>
    );
  }

  const scores = session.scores || {};
  const radarData = Object.entries(scores).map(([key, val]) => ({
    subject: scoreLabels[key]?.split(" ")[0] || key,
    value: val,
    fullMark: 10,
  }));

  const scoreDiff = prevScore != null ? (session.overall_score - prevScore) : null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="navy">{modeLabel(session.mode)}</Badge>
            <span className="text-xs text-muted">{formatDate(session.created_at)}</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy">{session.scenario_title}</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/new">
            <Button variant="outline" size="md">Nochmal üben</Button>
          </Link>
          <Link href="/progress">
            <Button variant="secondary" size="md">Fortschritt</Button>
          </Link>
        </div>
      </div>

      {/* Score + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card flex flex-col items-center gap-4">
          <div className="text-sm font-medium text-muted">Gesamtbewertung</div>
          <ScoreCircle score={session.overall_score} size={160} />
          <p className="text-center text-sm text-muted max-w-sm leading-relaxed">{session.summary}</p>
          {scoreDiff != null && (
            <div className="w-full bg-card-bg rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-muted">Vorherige Session</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted line-through">{prevScore?.toFixed(1)}</span>
                <span className={`font-medium text-sm ${scoreDiff >= 0 ? "text-mint" : "text-coral"}`}>
                  → {session.overall_score.toFixed(1)}
                </span>
                <span className={`text-xs ${scoreDiff >= 0 ? "text-mint" : "text-coral"}`}>
                  {scoreDiff >= 0 ? "↑ +" : "↓ "}{scoreDiff.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card">
          <div className="text-sm font-medium text-muted mb-4">Stärken-Profil</div>
          {radarData.length > 0 && (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#F2F0ED" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6B7280" }} />
                <Radar dataKey="value" stroke="#E8725A" fill="#E8725A" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-col gap-2 mt-2">
            {Object.entries(scores).map(([key, val]) => (
              <ProgressBar
                key={key}
                label={scoreLabels[key] || key}
                value={val}
                max={10}
                color={scoreColor(val)}
                showValue
                animate
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stärken & Verbesserungen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-mint/5 border border-mint/20 rounded-2xl p-5">
          <div className="font-semibold text-[#3a9b7a] mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#6BC4A6" />
            </svg>
            Deine Stärken
          </div>
          <ul className="flex flex-col gap-2">
            {(session.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-main">
                <span className="text-mint mt-0.5">✓</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-amber-brand/5 border border-amber-brand/20 rounded-2xl p-5">
          <div className="font-semibold text-[#b8812e] mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#E5A340" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="#E5A340" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Potenzial
          </div>
          <ul className="flex flex-col gap-2">
            {(session.improvements || []).map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-main">
                <span className="text-amber-brand mt-0.5">→</span>{v}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detail tabs */}
      <div className="bg-white rounded-3xl border border-border/50 shadow-card overflow-hidden">
        <div className="flex border-b border-border">
          {(["inhalt", "stimme", "tipps"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === t ? "text-coral border-b-2 border-coral bg-coral/5" : "text-muted hover:text-text-main"}`}>
              {t === "inhalt" ? "Inhalt & Struktur" : t === "stimme" ? "Stimme & Ausdruck" : "Tipps & nächste Schritte"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "inhalt" && (
            <div className="flex flex-col gap-4">
              {answers.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">Keine Einzelfragen-Auswertung für diese Session.</p>
              ) : (
                answers.map((q, i) => (
                  <div key={i} className="border border-border rounded-2xl overflow-hidden">
                    <button onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-card-bg transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="shrink-0 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
                          style={{ backgroundColor: scoreColor(q.score) }}>
                          {i + 1}
                        </span>
                        <span className="font-medium text-navy text-sm truncate">{q.question_text}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="font-mono font-bold text-sm" style={{ color: scoreColor(q.score) }}>{q.score}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"
                          className={`transition-transform ${expandedQ === i ? "rotate-180" : ""}`}>
                          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                    {expandedQ === i && (
                      <div className="p-4 pt-0 border-t border-border flex flex-col gap-4">
                        {q.answer_transcription && (
                          <div>
                            <div className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">Deine Antwort</div>
                            <p className="text-sm text-text-main bg-card-bg rounded-xl p-3 leading-relaxed italic">
                              &quot;{q.answer_transcription}&quot;
                            </p>
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">Feedback</div>
                          <p className="text-sm text-text-main leading-relaxed">{q.feedback}</p>
                        </div>
                        {q.optimized_answer && (
                          <div>
                            <div className="text-xs font-medium text-mint mb-2 uppercase tracking-wide">Optimierte Version</div>
                            <p className="text-sm text-text-main bg-mint/5 border border-mint/20 rounded-xl p-3 leading-relaxed">
                              {q.optimized_answer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "stimme" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-card-bg rounded-2xl p-4 text-center">
                  <div className="font-mono text-2xl font-bold text-navy">
                    {session.avg_speaking_speed ? Math.round(session.avg_speaking_speed) : "—"}
                  </div>
                  <div className="text-xs text-muted mt-1">WPM</div>
                  <div className="text-xs text-mint mt-0.5">Ideal: 120-160</div>
                </div>
                <div className="bg-card-bg rounded-2xl p-4 text-center">
                  <div className="font-mono text-2xl font-bold text-navy">
                    {session.total_filler_words ?? "—"}
                  </div>
                  <div className="text-xs text-muted mt-1">Füllwörter</div>
                </div>
                <div className="bg-card-bg rounded-2xl p-4 text-center">
                  <div className="font-mono text-2xl font-bold text-navy">
                    {session.duration_seconds ? `${Math.round(session.duration_seconds / 60)} Min` : "—"}
                  </div>
                  <div className="text-xs text-muted mt-1">Dauer</div>
                </div>
              </div>

              {wpmHistory.length > 1 && (
                <div>
                  <div className="text-sm font-medium text-navy mb-3">Sprechtempo-Entwicklung</div>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={wpmHistory}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[100, 200]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="wpm" stroke="#E8725A" strokeWidth={2} dot={{ fill: "#E8725A" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {activeTab === "tipps" && (
            <div className="flex flex-col gap-6">
              {session.next_tip && (
                <div className="bg-navy rounded-2xl p-5 text-white">
                  <div className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wide">Dein wichtigster nächster Schritt</div>
                  <p className="text-sm leading-relaxed text-white/90">{session.next_tip}</p>
                </div>
              )}
              {(session.improvements || []).length > 0 && (
                <div>
                  <div className="text-sm font-medium text-navy mb-3">3 Dinge für die nächste Session</div>
                  <div className="flex flex-col gap-3">
                    {session.improvements.slice(0, 3).map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 bg-card-bg rounded-xl p-4">
                        <div className="w-6 h-6 rounded-full bg-coral text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm text-text-main">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="border border-border rounded-2xl p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-navy text-sm mb-1">Nächste Session starten</div>
                  <div className="text-xs text-muted">Weiter trainieren und verbessern</div>
                </div>
                <Link href={`/new?mode=${session.mode}`}>
                  <Button size="sm">Jetzt üben</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pb-8">
        <Link href="/new" className="flex-1">
          <Button fullWidth size="lg">Nochmal üben</Button>
        </Link>
        <Link href="/progress" className="flex-1">
          <Button variant="outline" fullWidth size="lg">Fortschritt ansehen</Button>
        </Link>
      </div>
    </div>
  );
}
