-- ============================================
-- Voyce – Supabase Schema
-- Ausführen im Supabase SQL Editor
-- ============================================

-- Tabellen erstellen
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  current_position TEXT,
  target_position TEXT,
  industry TEXT,
  experience_level TEXT CHECK (experience_level IN ('einsteiger', 'mittel', 'senior', 'fuehrung')),
  weekly_goal INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('bewerbung', 'praesentation', 'verkauf')),
  input_type TEXT NOT NULL CHECK (input_type IN ('ki_gespraech', 'aufnahme', 'upload')),
  scenario_title TEXT,
  scenario_details JSONB DEFAULT '{}',
  overall_score FLOAT,
  scores JSONB DEFAULT '{}',
  summary TEXT,
  strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  next_tip TEXT,
  duration_seconds INT,
  avg_speaking_speed FLOAT,
  total_filler_words INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.session_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  question_text TEXT,
  answer_transcription TEXT,
  audio_url TEXT,
  duration_seconds INT,
  filler_words JSONB DEFAULT '{}',
  speaking_speed_wpm INT,
  score FLOAT,
  feedback TEXT,
  optimized_answer TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL CHECK (mode IN ('bewerbung', 'praesentation', 'verkauf')),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('leicht', 'mittel', 'schwer')),
  context JSONB DEFAULT '{}',
  questions TEXT[] DEFAULT '{}',
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Eigenes Profil lesen" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Eigenes Profil erstellen" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Eigenes Profil aktualisieren" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Sessions
CREATE POLICY "Eigene Sessions lesen" ON public.sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Eigene Sessions erstellen" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Eigene Sessions aktualisieren" ON public.sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Eigene Sessions löschen" ON public.sessions FOR DELETE USING (auth.uid() = user_id);

-- Session Answers
CREATE POLICY "Antworten lesen" ON public.session_answers FOR SELECT
  USING (session_id IN (SELECT id FROM public.sessions WHERE user_id = auth.uid()));
CREATE POLICY "Antworten erstellen" ON public.session_answers FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM public.sessions WHERE user_id = auth.uid()));

-- Milestones
CREATE POLICY "Eigene Meilensteine" ON public.milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Meilensteine erstellen" ON public.milestones FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scenarios (öffentlich lesbar)
CREATE POLICY "Szenarien sind öffentlich" ON public.scenarios FOR SELECT USING (true);

-- ============================================
-- Trigger: Profil automatisch bei Registrierung anlegen
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Seed: Szenarien
-- ============================================
INSERT INTO public.scenarios (mode, title, description, difficulty, questions) VALUES
('bewerbung', 'Marketing Manager Mittelstand', 'Klassisches Interview bei einem B2B-Unternehmen', 'mittel',
  ARRAY['Erzählen Sie mir kurz über sich.', 'Warum interessiert Sie diese Position?', 'Beschreiben Sie Ihre größten Erfolge im Marketing.', 'Wie gehen Sie mit einem Misserfolg um?', 'Wo sehen Sie sich in 5 Jahren?', 'Was sind Ihre Gehaltsvorstellungen?']),
('bewerbung', 'Junior Developer Startup', 'Tech-Interview mit Fokus auf Teamwork', 'leicht',
  ARRAY['Was hat Sie zur Softwareentwicklung gebracht?', 'Wie arbeiten Sie in einem Team?', 'Welche Technologien beherrschen Sie?', 'Wie lösen Sie Probleme, wenn Sie nicht weiterkommen?', 'Was begeistert Sie an unserem Produkt?']),
('bewerbung', 'Vertriebsleiter DAX-Konzern', 'Anspruchsvolles Interview mit Stressfragen', 'schwer',
  ARRAY['Warum sollten wir genau Sie einstellen?', 'Nennen Sie mir Ihre größte Niederlage.', 'Was würden Sie in den ersten 90 Tagen ändern?', 'Wie gehen Sie mit einem schwierigen Stakeholder um?', 'Welche Zahlen haben Sie in Ihrer letzten Rolle verantwortet?']),
('bewerbung', 'Projektmanager Beratung', 'Strukturiertes Interview mit STAR-Methodik', 'mittel',
  ARRAY['Beschreiben Sie ein komplexes Projekt, das Sie geleitet haben.', 'Wie priorisieren Sie bei konkurrierenden Anforderungen?', 'Wie motivieren Sie ein Team in stressigen Phasen?', 'Erzählen Sie von einem Projekt, das gescheitert ist.', 'Was macht einen guten Projektmanager aus?']),
('praesentation', 'Quartals-Update Vorstand (5 Min)', 'Kennzahlen klar und prägnant kommunizieren', 'schwer', ARRAY[]::TEXT[]),
('praesentation', 'Produkt-Pitch Messe (3 Min)', 'Kurzer, wirkungsvoller Pitch für Neukunden', 'mittel', ARRAY[]::TEXT[]),
('praesentation', 'Team-Meeting Ergebnis (10 Min)', 'Resultate strukturiert präsentieren', 'leicht', ARRAY[]::TEXT[]),
('praesentation', 'Keynote Konferenz (15 Min)', 'Inspirierende Präsentation vor großem Publikum', 'schwer', ARRAY[]::TEXT[]),
('verkauf', 'SaaS-Tool an IT-Leiter', 'Technische Lösung an kritischen Entscheider verkaufen', 'schwer', ARRAY[]::TEXT[]),
('verkauf', 'Beratung an Geschäftsführer', 'Vertrauensaufbau und ROI-Argumentation', 'mittel', ARRAY[]::TEXT[]),
('verkauf', 'Recruiting-Lösung an HR', 'Einwände gegen Kosten und Implementierung behandeln', 'mittel', ARRAY[]::TEXT[]),
('verkauf', 'Werbekampagne an Marketing-Dir.', 'Kreativer Pitch mit Zahlen und Cases', 'leicht', ARRAY[]::TEXT[])
ON CONFLICT DO NOTHING;
