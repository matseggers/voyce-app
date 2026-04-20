# Voyce – Projekt-Kontext

Deutschsprachige KI-Kommunikationsplattform. Nutzer üben Bewerbungsgespräche, Präsentationen und Verkaufsgespräche mit einer KI und erhalten danach detailliertes Feedback zu Stimme, Struktur und Überzeugungskraft.

## Stack

- **Next.js 15** (App Router, Turbopack) · TypeScript · Tailwind CSS
- **Supabase** – Auth + PostgreSQL (Projekt: `dvhjphopmfbskqkabggw`)
- **Anthropic Claude** (`claude-sonnet-4-6`) – KI-Gespräche + Feedback-Analyse
- **Zustand** – Client State (`store/useStore.ts`)
- **Recharts** – Fortschritts-Charts
- Dev läuft auf **http://localhost:3001**

## Farbpalette & Design-Token

| Token | Wert | Verwendung |
|---|---|---|
| `navy` | `#1E2A3A` | Primary, Headlines |
| `coral` | `#E8725A` | CTA, Accent, Bewerbungs-Modus |
| `mint` | `#6BC4A6` | Success, Präsentations-Modus |
| `amber-brand` | `#E5A340` | Warning, Verkaufs-Modus |
| `cream` | `#FAF9F6` | Haupt-Hintergrund |
| `card-bg` | `#F2F0ED` | Karten-Hintergrund |
| `border` | `#E5E2DC` | Trennlinien |

Fonts: `font-serif` = Fraunces · `font-sans` = Plus Jakarta Sans · `font-mono` = JetBrains Mono

## Dateistruktur

```
app/
  page.tsx                          # Landing Page (public)
  layout.tsx                        # Root layout, Google Fonts
  globals.css                       # Custom CSS, Animationen, Design-Token
  (auth)/
    login/page.tsx                  # Supabase signInWithPassword + Google OAuth
    register/page.tsx               # 3-Step Onboarding → supabase.auth.signUp
  (main)/
    layout.tsx                      # Wrapper mit <Navbar>
    dashboard/page.tsx              # Begrüßung, Quick-Start, Wochenziel, letzte Sessions
    new/page.tsx                    # Modus-Auswahl (bewerbung/praesentation/verkauf) + Input-Typ
    progress/page.tsx               # Recharts-Diagramme, Meilensteine
    library/page.tsx                # Sessions-Liste + Szenarien-Bibliothek
    settings/page.tsx               # Profil, Ziele, Audio, Abo, DSGVO
    session/
      interview/page.tsx            # KI-Bewerbungsgespräch (Chat-Interface)
      bewerbung/page.tsx            # re-export → interview/page
      sales/page.tsx                # KI-Verkaufsgespräch
      verkauf/page.tsx              # re-export → sales/page
      presentation/page.tsx         # Präsentations-Aufnahme (Timer + Wellenform)
      praesentation/page.tsx        # re-export → presentation/page
      record/page.tsx               # Live-Aufnahme (MediaRecorder API), alle Modi
      upload/page.tsx               # Drag & Drop Audio/Video/Text
      [id]/feedback/page.tsx        # Feedback: ScoreCircle, RadarChart, Tabs, Füllwörter
  api/
    conversation/route.ts           # POST – Claude als Interviewer/Kunde (streaming-ready)
    analyze/route.ts                # POST – Claude Feedback-Analyse · PUT – Whisper Transkription
    extract-url/route.ts            # POST – Stellenanzeigen-URL → Text extrahieren
  auth/
    callback/route.ts               # OAuth + E-Mail-Bestätigung Code-Exchange
    reset-password/page.tsx         # Passwort zurücksetzen

components/
  layout/navbar.tsx                 # Sticky Nav, User-Avatar-Dropdown, Logout
  ui/
    button.tsx                      # variant: primary|secondary|ghost|outline|danger
    card.tsx                        # Card, CardHeader, CardContent, CardFooter
    badge.tsx                       # variant: default|coral|mint|amber|navy|outline
    input.tsx                       # Input + Textarea mit label/error/hint
    score-circle.tsx                # Animierter SVG-Kreis (0–10 Score)
    progress-bar.tsx                # Animierter Fortschrittsbalken
    waveform.tsx                    # Mikrofon-Wellenform-Animation
    loading-states.tsx              # AnalyzingLoader (motivierende Texte) + CardSkeleton

lib/
  utils.ts                          # cn(), formatDuration, scoreColor, modeLabel, countFillerWords
  prompts.ts                        # buildInterviewSystemPrompt, buildSalesSystemPrompt, buildAnalysisPrompt
  supabase.ts                       # createClient (browser-seitig, Typen)
  supabase-server.ts                # createSupabaseServerClient (Server Components)
  supabase-browser.ts               # createSupabaseBrowserClient (Client Components)

store/useStore.ts                   # Zustand: sessionSetup, messages, analysisResult, isRecording
middleware.ts                       # Auth-Guard: /dashboard/* etc. → /login wenn kein User
database/schema.sql                 # Vollständiges Supabase-Schema inkl. RLS + Seed
```

## Datenbank-Tabellen

| Tabelle | Zweck |
|---|---|
| `users` | Profil (name, position, weekly_goal) – auto-angelegt via Trigger bei auth.signup |
| `sessions` | Eine Trainings-Session mit scores JSONB, strengths[], improvements[] |
| `session_answers` | Einzelne Fragen/Antworten einer Session |
| `milestones` | Erreichte Meilensteine pro User |
| `scenarios` | Vorgefertigte Szenarien (12 Seeds) |

RLS ist aktiv – jeder User sieht nur eigene Daten. Scenarios sind public-read.

## API-Routen

### POST /api/conversation
KI-Gespräch. Body: `{ mode, messages[], context, action: "start"|"continue" }`
- `mode: bewerbung` → Claude spielt HR-Interviewer (Prompt aus `buildInterviewSystemPrompt`)
- `mode: verkauf` → Claude spielt Kunde (Prompt aus `buildSalesSystemPrompt`)
- Gibt `{ message: string }` zurück

### POST /api/analyze
Feedback nach Session. Body: `{ mode, transcript, context, durationSeconds }`
- Ruft `buildAnalysisPrompt` auf, parst JSON-Antwort von Claude
- Gibt `{ sessionId, analysis, metadata }` zurück
- `analysis` hat: `gesamtscore, scores{}, staerken[], verbesserungen[], pro_frage[], naechster_tipp`

### PUT /api/analyze
Whisper-Transkription. FormData mit `audio` (File). Benötigt `OPENAI_API_KEY`.

### POST /api/extract-url
Stellenanzeige von URL laden. Body: `{ url }`. Gibt `{ text, title }` zurück.

## Auth-Flow

1. Register → `supabase.auth.signUp()` → Trigger legt `users`-Row an → `/dashboard`
2. Login → `supabase.auth.signInWithPassword()` → `/dashboard`
3. Google OAuth → `/auth/callback` tauscht Code gegen Session
4. Middleware schützt alle `/(main)/*` Routen

## Wichtige Konventionen

- **Sprache:** Alles Deutsch, Du-Form. Fehlermeldungen immer auf Deutsch.
- **Modus-Keys:** `bewerbung` / `praesentation` / `verkauf` (nicht "interview", "sales" etc. in DB)
- **Score:** Float 0–10. `scoreColor(score)` gibt coral/amber/mint zurück. `scoreLabel()` gibt Textlabel.
- **Mock-Daten:** Dashboard, Progress, Library und Feedback nutzen noch Mocks – echte DB-Queries kommen als nächstes.
- **Session-Routing:** Nach Analyse immer `router.push('/session/${sessionId}/feedback')`. Demo-Fallback: `sessionId = "demo"`.
- **CSS-Klassen:** `card-hover`, `fade-in-up`, `delay-100..500`, `pulse-record`, `waveform-bar`, `gradient-text` sind in globals.css definiert.
- **Kein shadcn/ui** – alle UI-Komponenten sind custom in `components/ui/`.

## Nächste offene Tasks

- Echte Supabase-Queries in Dashboard, Progress, Library einbauen (ersetzen Mocks)
- `sessionId` nach Analyse in DB speichern und zurückgeben
- Vercel Deployment einrichten
