import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
}

export function scoreColor(score: number): string {
  if (score >= 8) return "#6BC4A6";
  if (score >= 6) return "#E5A340";
  return "#E8725A";
}

export function scoreLabel(score: number): string {
  if (score >= 8.5) return "Ausgezeichnet";
  if (score >= 7) return "Sehr gut";
  if (score >= 5.5) return "Gut";
  if (score >= 4) return "In Entwicklung";
  return "Ausbaufähig";
}

export function modeLabel(mode: string): string {
  const map: Record<string, string> = {
    bewerbung: "Bewerbungsgespräch",
    praesentation: "Präsentation",
    verkauf: "Verkaufsgespräch",
  };
  return map[mode] ?? mode;
}

export function modeIcon(mode: string): string {
  const map: Record<string, string> = {
    bewerbung: "🎤",
    praesentation: "📊",
    verkauf: "💼",
  };
  return map[mode] ?? "📝";
}

export function countFillerWords(text: string): Record<string, number> {
  const fillers = ["ähm", "äh", "halt", "quasi", "sozusagen", "irgendwie", "eigentlich", "also", "ne", "genau"];
  const lower = text.toLowerCase();
  const result: Record<string, number> = {};
  fillers.forEach((f) => {
    const regex = new RegExp(`\\b${f}\\b`, "gi");
    const count = (lower.match(regex) || []).length;
    if (count > 0) result[f] = count;
  });
  return result;
}

export function estimateWPM(text: string, durationSeconds: number): number {
  if (!durationSeconds) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.round((words / durationSeconds) * 60);
}
