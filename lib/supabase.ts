import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Session = {
  id: string;
  user_id: string;
  mode: "bewerbung" | "praesentation" | "verkauf";
  input_type: "ki_gespraech" | "aufnahme" | "upload";
  scenario_title?: string;
  scenario_details?: Record<string, unknown>;
  overall_score?: number;
  scores?: {
    relevanz: number;
    struktur: number;
    ueberzeugung: number;
    klarheit: number;
    stimmwirkung: number;
    ausstrahlung: number;
  };
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  next_tip?: string;
  duration_seconds?: number;
  avg_speaking_speed?: number;
  total_filler_words?: number;
  created_at: string;
};

export type SessionAnswer = {
  id: string;
  session_id: string;
  question_text?: string;
  answer_transcription?: string;
  audio_url?: string;
  duration_seconds?: number;
  filler_words?: Record<string, number>;
  speaking_speed_wpm?: number;
  score?: number;
  feedback?: string;
  optimized_answer?: string;
  sort_order?: number;
  created_at: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  current_position?: string;
  target_position?: string;
  industry?: string;
  experience_level?: "einsteiger" | "mittel" | "senior" | "fuehrung";
  weekly_goal: number;
  created_at: string;
};
