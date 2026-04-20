"use client";

import { useState, useEffect } from "react";
import { scoreColor, modeLabel } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Period = "7d" | "30d" | "3m" | "all";
type ModeFilter = "all" | "bewerbung" | "praesentation" | "verkauf";

type DbSession = {
  id: string;
  mode: string;
  overall_score: number;
  avg_speaking_speed: number;
  total_filler_words: number;
  created_at: string;
};

function getWeekLabel(date: Date) {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const weekNo = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `KW${weekNo}`;
}

function formatChartDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getPeriodStart(period: Period): Date {
  const now = new Date();
  if (period === "7d") return new Date(now.getTime() - 7 * 86400000);
  if (period === "30d") return new Date(now.getTime() - 30 * 86400000);
  if (period === "3m") return new Date(now.getTime() - 90 * 86400000);
  return new Date(0);
}

export default function ProgressPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const [sessions, setSessions] = useState<DbSession[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("sessions")
        .select("id, mode, overall_score, avg_speaking_speed, total_filler_words, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      setSessions(data || []);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const periodStart = getPeriodStart(period);
  const filtered = sessions.filter((s) => {
    const inPeriod = new Date(s.created_at) >= periodStart;
    const inMode = modeFilter === "all" || s.mode === modeFilter;
    return inPeriod && inMode;
  });

  // Score trend chart
  const progressData = filtered.map((s) => ({
    date: formatChartDate(s.created_at),
    score: s.overall_score,
    [s.mode]: s.overall_score,
  }));

  // Filler words by week
  const fillerByWeek: Record<string, number[]> = {};
  filtered.forEach((s) => {
    if (s.total_filler_words == null) return;
    const wk = getWeekLabel(new Date(s.created_at));
    if (!fillerByWeek[wk]) fillerByWeek[wk] = [];
    fillerByWeek[wk].push(s.total_filler_words);
  });
  const fillerData = Object.entries(fillerByWeek).map(([week, vals]) => ({
    date: week,
    count: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
  }));

  // WPM trend
  const wpmData = filtered
    .filter((s) => s.avg_speaking_speed != null)
    .map((s, i) => ({ date: `Session ${i + 1}`, wpm: Math.round(s.avg_speaking_speed) }));

  // Sessions per week
  const sessionsByWeek: Record<string, number> = {};
  filtered.forEach((s) => {
    const wk = getWeekLabel(new Date(s.created_at));
    sessionsByWeek[wk] = (sessionsByWeek[wk] || 0) + 1;
  });
  const sessionsPerWeek = Object.entries(sessionsByWeek).map(([week, count]) => ({ week, count }));

  // Mode breakdown
  const modeProgress = ["bewerbung", "praesentation", "verkauf"].map((mode) => {
    const modeSessions = sessions.filter((s) => s.mode === mode && s.overall_score != null);
    const scores = modeSessions.map((s) => s.overall_score);
    return {
      mode,
      sessions: modeSessions.length,
      avgScore: scores.length ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0,
      best: scores.length ? parseFloat(Math.max(...scores).toFixed(1)) : 0,
    };
  });

  // Milestones
  const totalSessions = sessions.length;
  const maxScore = sessions.length ? Math.max(...sessions.map((s) => s.overall_score ?? 0)) : 0;
  const usedModes = new Set(sessions.map((s) => s.mode));
  const minFillers = sessions.filter((s) => s.total_filler_words != null).reduce((min, s) => Math.min(min, s.total_filler_words), Infinity);

  const milestones = [
    { label: "Erste Session abgeschlossen", achieved: totalSessions >= 1 },
    { label: "5 Sessions erreicht", achieved: totalSessions >= 5 },
    { label: "Score über 7.0 erreicht", achieved: maxScore >= 7.0 },
    { label: "Alle 3 Modi ausprobiert", achieved: usedModes.size >= 3 },
    { label: "Füllwörter unter 10 pro Session", achieved: minFillers < 10 },
    { label: "Score über 8.0 erreicht", achieved: maxScore >= 8.0 },
    { label: "20 Sessions insgesamt", achieved: totalSessions >= 20 },
    { label: "Score über 9.0 erreicht", achieved: maxScore >= 9.0 },
  ];

  const scoreTrend = filtered.length >= 2
    ? (filtered[filtered.length - 1].overall_score - filtered[0].overall_score).toFixed(1)
    : null;

  const periods: { value: Period; label: string }[] = [
    { value: "7d", label: "7 Tage" },
    { value: "30d", label: "30 Tage" },
    { value: "3m", label: "3 Monate" },
    { value: "all", label: "Alles" },
  ];
  const modeFilters: { value: ModeFilter; label: string }[] = [
    { value: "all", label: "Alle Modi" },
    { value: "bewerbung", label: "Bewerbung" },
    { value: "praesentation", label: "Präsentation" },
    { value: "verkauf", label: "Verkauf" },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 fade-in-up">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy mb-1">Dein Fortschritt</h1>
          <p className="text-muted">{totalSessions} Sessions insgesamt</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 fade-in-up delay-100">
        <div className="flex gap-1 bg-card-bg rounded-xl p-1">
          {periods.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.value ? "bg-white text-navy shadow-card" : "text-muted hover:text-text-main"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-card-bg rounded-xl p-1">
          {modeFilters.map((m) => (
            <button key={m.value} onClick={() => setModeFilter(m.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${modeFilter === m.value ? "bg-white text-navy shadow-card" : "text-muted hover:text-text-main"}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main chart */}
      <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card fade-in-up delay-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="font-semibold text-navy">Score-Entwicklung</div>
            <div className="text-xs text-muted mt-1">Dein Fortschritt über Zeit</div>
          </div>
          {scoreTrend && (
            <div className="flex items-center gap-2 text-sm">
              <span className={Number(scoreTrend) >= 0 ? "text-mint font-medium" : "text-coral font-medium"}>
                {Number(scoreTrend) >= 0 ? "↑ +" : "↓ "}{scoreTrend}
              </span>
              <span className="text-muted text-xs">im gewählten Zeitraum</span>
            </div>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-muted text-sm">
            {loading ? "Laden..." : "Noch keine Sessions in diesem Zeitraum"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F0ED" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[4, 10]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E2DC", borderRadius: 12, fontSize: 12 }} />
              <ReferenceLine y={8} stroke="#6BC4A6" strokeDasharray="4 4" label={{ value: "Top", fontSize: 10, fill: "#6BC4A6" }} />
              {(modeFilter === "all" || modeFilter === "bewerbung") && (
                <Line type="monotone" dataKey={modeFilter === "all" ? "score" : "bewerbung"} stroke="#E8725A" strokeWidth={2.5} dot={{ fill: "#E8725A", r: 4 }} connectNulls />
              )}
              {modeFilter === "praesentation" && (
                <Line type="monotone" dataKey="praesentation" stroke="#6BC4A6" strokeWidth={2.5} dot={{ fill: "#6BC4A6", r: 4 }} connectNulls />
              )}
              {modeFilter === "verkauf" && (
                <Line type="monotone" dataKey="verkauf" stroke="#E5A340" strokeWidth={2.5} dot={{ fill: "#E5A340", r: 4 }} connectNulls />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 fade-in-up delay-300">
        {/* Filler words */}
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card">
          <div className="font-semibold text-navy mb-1">Füllwörter</div>
          <div className="text-xs text-muted mb-4">Weniger = besser</div>
          {fillerData.length === 0 ? (
            <div className="h-[150px] flex items-center justify-center text-muted text-xs">Keine Daten</div>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={fillerData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="count" fill="#E8725A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* WPM trend */}
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card">
          <div className="font-semibold text-navy mb-1">Sprechtempo</div>
          <div className="text-xs text-muted mb-4">Idealbereich: 120–160 WPM</div>
          {wpmData.length === 0 ? (
            <div className="h-[150px] flex items-center justify-center text-muted text-xs">Keine Daten</div>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={wpmData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[100, 200]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <ReferenceLine y={120} stroke="#6BC4A6" strokeDasharray="3 3" />
                <ReferenceLine y={160} stroke="#6BC4A6" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="wpm" stroke="#E5A340" strokeWidth={2} dot={{ fill: "#E5A340", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sessions per week */}
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card">
          <div className="font-semibold text-navy mb-1">Sessions pro Woche</div>
          <div className="text-xs text-muted mb-4">Konsistenz ist der Schlüssel</div>
          {sessionsPerWeek.length === 0 ? (
            <div className="h-[150px] flex items-center justify-center text-muted text-xs">Keine Daten</div>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={sessionsPerWeek}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <ReferenceLine y={3} stroke="#6BC4A6" strokeDasharray="3 3" label={{ value: "Ziel", fontSize: 10, fill: "#6BC4A6" }} />
                <Bar dataKey="count" fill="#6BC4A6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Mode breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card">
          <div className="font-semibold text-navy mb-4">Fortschritt per Modus</div>
          <div className="flex flex-col gap-4">
            {modeProgress.map((m) => (
              <div key={m.mode} className="flex items-center gap-3">
                <div className="text-lg shrink-0">
                  {m.mode === "bewerbung" ? "🎤" : m.mode === "praesentation" ? "📊" : "💼"}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-navy">{modeLabel(m.mode)}</span>
                    <span className="text-muted">{m.sessions} Sessions</span>
                  </div>
                  <div className="h-2 bg-card-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: m.avgScore ? `${(m.avgScore / 10) * 100}%` : "0%", backgroundColor: scoreColor(m.avgScore) }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-muted">Ø {m.avgScore || "—"}</span>
                    <span style={{ color: m.best ? scoreColor(m.best) : undefined }}>Best: {m.best || "—"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-card fade-in-up delay-400">
        <h2 className="font-semibold text-navy mb-5">Meilensteine</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((m, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${m.achieved ? "bg-mint/5" : "bg-card-bg opacity-60"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.achieved ? "bg-mint text-white" : "bg-border"}`}>
                {m.achieved ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="#9CA3AF" /></svg>
                )}
              </div>
              <div className="text-sm font-medium text-navy">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
