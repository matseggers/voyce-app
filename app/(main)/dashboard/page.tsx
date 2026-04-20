"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getGreeting, modeLabel, scoreColor, formatDate } from "@/lib/utils";
import { ScoreCircle } from "@/components/ui/score-circle";
import { Badge } from "@/components/ui/badge";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Session = {
  id: string;
  mode: string;
  scenario_title: string;
  overall_score: number;
  created_at: string;
  summary: string;
  duration_seconds: number;
};

type ModeStat = { mode: string; count: number; lastScore: number; color: string };

const MODE_COLORS: Record<string, string> = {
  bewerbung: "#E8725A",
  praesentation: "#6BC4A6",
  verkauf: "#E5A340",
};

const MODES = ["bewerbung", "praesentation", "verkauf"];

export default function DashboardPage() {
  const greeting = getGreeting();
  const supabase = createSupabaseBrowserClient();

  const [userName, setUserName] = useState("du");
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [modeStats, setModeStats] = useState<ModeStat[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [weeklyDone, setWeeklyDone] = useState(0);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [scoreTrend, setScoreTrend] = useState<number[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserName(user.user_metadata?.name?.split(" ")[0] || "du");

      // Load user profile for weekly goal
      const { data: profile } = await supabase
        .from("users")
        .select("weekly_goal, name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setWeeklyGoal(profile.weekly_goal || 3);
        if (profile.name) setUserName(profile.name.split(" ")[0]);
      }

      // Load all sessions
      const { data: sessions } = await supabase
        .from("sessions")
        .select("id, mode, scenario_title, overall_score, created_at, summary, duration_seconds")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!sessions?.length) {
        setLoading(false);
        return;
      }

      setTotalSessions(sessions.length);

      // Recent 3
      setRecentSessions(sessions.slice(0, 3));

      // Overall score = last session score
      const validScores = sessions.filter((s) => s.overall_score != null);
      if (validScores.length) {
        setOverallScore(validScores[0].overall_score);
        setScoreTrend(validScores.slice(0, 7).reverse().map((s) => s.overall_score));
      }

      // Mode stats
      const stats: ModeStat[] = MODES.map((mode) => {
        const modeSessions = sessions.filter((s) => s.mode === mode);
        const last = modeSessions.find((s) => s.overall_score != null);
        return {
          mode,
          count: modeSessions.length,
          lastScore: last?.overall_score ?? 0,
          color: MODE_COLORS[mode],
        };
      });
      setModeStats(stats);

      // Weekly done: sessions created since last Monday
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - daysToMonday);
      monday.setHours(0, 0, 0, 0);
      const weekCount = sessions.filter((s) => new Date(s.created_at) >= monday).length;
      setWeeklyDone(weekCount);

      setLoading(false);
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trendDiff = scoreTrend.length >= 2
    ? (scoreTrend[scoreTrend.length - 1] - scoreTrend[0]).toFixed(1)
    : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 fade-in-up">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">
            {greeting}, {userName}! 👋
          </h1>
          <p className="text-muted mt-1">Bereit für dein Training heute?</p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-coral text-white font-semibold text-sm hover:bg-[#d4614a] transition-all shadow-coral hover:-translate-y-0.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
          </svg>
          Neue Session
        </Link>
      </div>

      {/* Quick start + Overall score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick start cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 fade-in-up delay-100">
          {(loading ? MODES.map((m) => ({ mode: m, count: 0, lastScore: 0, color: MODE_COLORS[m] })) : modeStats).map((m) => (
            <Link
              key={m.mode}
              href={`/new?mode=${m.mode}`}
              className="bg-white rounded-2xl p-5 border border-border/50 shadow-card card-hover group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${m.color}15` }}
                >
                  {m.mode === "bewerbung" ? "🎤" : m.mode === "praesentation" ? "📊" : "💼"}
                </div>
                <span className="font-mono text-xs text-muted">{m.count} Sessions</span>
              </div>
              <div className="font-semibold text-navy text-sm mb-1">{modeLabel(m.mode)}</div>
              {m.lastScore > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold" style={{ color: scoreColor(m.lastScore) }}>
                    {m.lastScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted">letzter Score</span>
                </div>
              ) : (
                <div className="text-xs text-muted">Noch keine Sessions</div>
              )}
              <div className="mt-3 text-xs font-medium text-coral opacity-0 group-hover:opacity-100 transition-opacity">
                Session starten →
              </div>
            </Link>
          ))}
        </div>

        {/* Overall score */}
        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-card fade-in-up delay-200 flex flex-col items-center gap-4">
          <div className="text-sm font-medium text-muted">Gesamt-Score</div>
          {overallScore != null ? (
            <ScoreCircle score={overallScore} size={130} />
          ) : (
            <div className="w-[130px] h-[130px] rounded-full border-4 border-card-bg flex items-center justify-center">
              <span className="text-muted text-sm text-center">Noch keine Sessions</span>
            </div>
          )}
          {scoreTrend.length >= 2 && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Trend ({scoreTrend.length} Sessions)</span>
                <span className={Number(trendDiff) >= 0 ? "text-mint font-medium" : "text-coral font-medium"}>
                  {Number(trendDiff) >= 0 ? "+" : ""}{trendDiff} {Number(trendDiff) >= 0 ? "↑" : "↓"}
                </span>
              </div>
              <div className="h-8 flex items-end gap-0.5">
                {scoreTrend.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${(v / 10) * 100}%`,
                      backgroundColor: i === scoreTrend.length - 1 ? "#E8725A" : "#F2F0ED",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="w-full text-center text-xs text-muted border-t border-border pt-3">
            {totalSessions} Sessions insgesamt
          </div>
        </div>
      </div>

      {/* Weekly goal + Recent sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent sessions */}
        <div className="lg:col-span-2 fade-in-up delay-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy">Letzte Sessions</h2>
            <Link href="/library" className="text-sm text-coral hover:underline">
              Alle ansehen →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-border/50 shadow-card h-20 animate-pulse" />
              ))
            ) : recentSessions.length === 0 ? (
              <div className="text-center py-12 text-muted bg-white rounded-2xl border border-border/50">
                <div className="text-3xl mb-3">🎙️</div>
                <div className="font-medium text-navy mb-2">Noch keine Sessions</div>
                <Link href="/new" className="text-coral text-sm hover:underline">Erste Session starten →</Link>
              </div>
            ) : (
              recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/session/${session.id}/feedback`}
                  className="bg-white rounded-2xl p-4 border border-border/50 shadow-card card-hover flex items-center gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                    style={{ backgroundColor: `${scoreColor(session.overall_score)}15` }}
                  >
                    {session.mode === "bewerbung" ? "🎤" : session.mode === "praesentation" ? "📊" : "💼"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-navy text-sm truncate">{session.scenario_title}</div>
                    {session.summary && <div className="text-xs text-muted mt-0.5 truncate">{session.summary}</div>}
                    <div className="text-xs text-muted mt-1">{formatDate(session.created_at)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className="font-mono font-bold text-xl"
                      style={{ color: scoreColor(session.overall_score) }}
                    >
                      {session.overall_score?.toFixed(1)}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {modeLabel(session.mode)}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Weekly goal */}
        <div className="fade-in-up delay-400 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-card">
            <h3 className="font-semibold text-navy mb-4">Wochenziel</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg width="96" height="96" className="-rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#F2F0ED" strokeWidth="8" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#6BC4A6"
                    strokeWidth="8"
                    strokeDasharray={`${Math.min(weeklyDone / weeklyGoal, 1) * 251} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono font-bold text-xl text-navy">{weeklyDone}</span>
                  <span className="text-xs text-muted">/{weeklyGoal}</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted">
              {weeklyDone >= weeklyGoal ? (
                <span className="text-mint font-medium">Wochenziel erreicht! 🎉</span>
              ) : (
                <>Noch <span className="font-semibold text-navy">{weeklyGoal - weeklyDone} Sessions</span> – du schaffst das! 💪</>
              )}
            </p>
          </div>

          {/* Tip */}
          <div className="bg-navy rounded-2xl p-5 text-white">
            <div className="text-xs font-medium text-white/50 mb-2">Dein heutiger Tipp</div>
            <p className="text-sm leading-relaxed text-white/90">
              Versuche in deiner nächsten Antwort bewusst eine kurze Pause einzulegen, bevor du antwortest. Das wirkt souveräner und gibt dir Zeit zum Denken.
            </p>
          </div>

          <Link
            href="/progress"
            className="bg-white rounded-2xl p-5 border border-border/50 shadow-card card-hover flex items-center justify-between group"
          >
            <div>
              <div className="font-medium text-navy text-sm">Fortschritt ansehen</div>
              <div className="text-xs text-muted">Charts & Meilensteine</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8725A" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
