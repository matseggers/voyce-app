import Link from "next/link";
import { Waveform } from "@/components/ui/waveform";

const modes = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="9" y="2" width="6" height="12" rx="3" fill="#E8725A" />
        <path d="M5 11c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="#E8725A" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="18" x2="12" y2="22" stroke="#E8725A" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="22" x2="16" y2="22" stroke="#E8725A" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Bewerbungsgespräch",
    description: "Übe dein nächstes Interview und überzeuge mit Klarheit und Ausstrahlung.",
    href: "/new?mode=bewerbung",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="14" rx="2" stroke="#6BC4A6" strokeWidth="2" />
        <path d="M8 21h8M12 17v4" stroke="#6BC4A6" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 8l3 3 2-2 3 3" stroke="#6BC4A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Präsentation",
    description: "Halte Vorträge, die ankommen – mit Feedback zu Struktur, Stimme und Wirkung.",
    href: "/new?mode=praesentation",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="7" width="20" height="14" rx="2" stroke="#E5A340" strokeWidth="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#E5A340" strokeWidth="2" />
        <line x1="12" y1="12" x2="12" y2="16" stroke="#E5A340" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="14" x2="14" y2="14" stroke="#E5A340" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Verkaufsgespräch",
    description: "Schließe Deals souverän ab – trainiere Argumentation und Überzeugungskraft.",
    href: "/new?mode=verkauf",
  },
];

const steps = [
  {
    num: "01",
    title: "Wähle deinen Trainingsmodus",
    desc: "Bewerbung, Präsentation oder Verkaufsgespräch – du entscheidest, woran du arbeiten willst.",
  },
  {
    num: "02",
    title: "Übe mit KI oder nimm dich auf",
    desc: "Führe ein realistisches KI-Gespräch, nimm dich live auf oder lade eine bestehende Aufnahme hoch.",
  },
  {
    num: "03",
    title: "Erhalte detailliertes Feedback",
    desc: "Stimme, Struktur, Überzeugungskraft – sieh genau, wo du stehst und wächst.",
  },
];

const testimonials = [
  {
    name: "Lena M.",
    role: "Produktmanagerin, München",
    quote: "Ich habe mein Vorstellungsgespräch dreimal mit Voyce geübt – und beim echten Gespräch war ich so entspannt wie nie. Die Rückmeldungen sind erstaunlich präzise.",
  },
  {
    name: "Thomas R.",
    role: "Sales Manager, Hamburg",
    quote: "Das Verkaufsgespräch-Training hat meine Close-Rate messbar verbessert. Die KI stellt wirklich herausfordernde Einwände – besser als manche Kollegen.",
  },
  {
    name: "Sara K.",
    role: "Startup-Gründerin, Berlin",
    quote: "Meine Investoren-Präsentation war ein Erfolg. Die Feedback-Analyse hat mir gezeigt, dass ich zu schnell spreche – das wusste ich vorher gar nicht.",
  },
];

const plans = [
  {
    name: "Free",
    price: "0€",
    period: "",
    features: ["3 Sessions/Monat", "Basis-Feedback", "Alle 3 Modi ausprobieren"],
    cta: "Kostenlos starten",
    highlight: false,
  },
  {
    name: "Pro",
    price: "39€",
    period: "/Monat",
    features: [
      "Unlimitierte Sessions",
      "Alle Modi & Szenarien",
      "Fortschritts-Dashboard",
      "Personalisierte Tipps",
      "Audio-Upload",
      "KI-Gespräch mit Stimme",
    ],
    cta: "Pro starten",
    highlight: true,
  },
  {
    name: "Team",
    price: "19€",
    period: "/User/Mo.",
    features: [
      "Ab 10 Nutzer",
      "Manager-Dashboard",
      "Team-Analytics",
      "Alles aus Pro",
      "Prioritäts-Support",
    ],
    cta: "Team anfragen",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-coral flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
                <path d="M5 11c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-serif font-semibold text-navy text-lg">Voyce</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted hover:text-text-main transition-colors">Features</a>
            <a href="#how" className="text-sm text-muted hover:text-text-main transition-colors">So funktioniert&apos;s</a>
            <a href="#pricing" className="text-sm text-muted hover:text-text-main transition-colors">Preise</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted hover:text-text-main transition-colors">
              Anmelden
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-coral text-white hover:bg-[#d4614a] transition-colors shadow-coral"
            >
              Kostenlos starten
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div
          className="absolute top-20 right-[-100px] w-96 h-96 opacity-10 blob"
          style={{ background: "radial-gradient(circle, #E8725A, #E5A340)" }}
        />
        <div
          className="absolute bottom-0 left-[-60px] w-64 h-64 blob"
          style={{ background: "radial-gradient(circle, rgba(107,196,166,0.08), rgba(30,42,58,0.04))" }}
        />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/10 text-coral text-sm font-medium mb-8 fade-in-up">
            <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
            KI-gestütztes Kommunikationstraining
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-navy leading-tight mb-6 fade-in-up delay-100">
            Trainiere deine{" "}
            <span className="gradient-text">Wirkung.</span>
            <br />
            Werde gehört.
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed fade-in-up delay-200">
            Die KI-Plattform für alle, die in Bewerbungsgesprächen, Präsentationen und
            Verkaufsgesprächen souverän auftreten wollen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 fade-in-up delay-300">
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl text-lg font-semibold bg-coral text-white hover:bg-[#d4614a] transition-all shadow-coral hover:shadow-lg hover:-translate-y-0.5"
            >
              Kostenlos ausprobieren
            </Link>
            <a
              href="#how"
              className="px-8 py-4 rounded-2xl text-lg font-semibold text-navy hover:bg-card-bg transition-colors"
            >
              So funktioniert&apos;s →
            </a>
          </div>
          <div className="flex justify-center fade-in-up delay-400">
            <div className="bg-white rounded-3xl p-8 shadow-card border border-border/50 inline-flex flex-col items-center gap-4">
              <Waveform active={true} bars={32} height={60} />
              <p className="text-xs text-muted font-mono">Deine Stimme wird analysiert...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "12.400+", label: "Sessions analysiert" },
              { value: "3 Modi", label: "Bewerbung, Präsentation, Verkauf" },
              { value: "∅ 7.8", label: "Ø Score nach 5 Sessions" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-mono font-bold text-2xl sm:text-3xl text-navy">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modes */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy mb-4">Drei Modi. Ein Ziel.</h2>
            <p className="text-muted max-w-xl mx-auto">
              Wähle das Szenario, das dir am meisten bedeutet – und übe so realistisch, dass das Echte leichter wird.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modes.map((mode) => (
              <Link
                key={mode.title}
                href={mode.href}
                className="bg-white rounded-2xl p-6 border border-border/50 shadow-card card-hover group"
              >
                <div className="w-14 h-14 rounded-2xl bg-card-bg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {mode.icon}
                </div>
                <h3 className="font-semibold text-navy text-lg mb-2">{mode.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{mode.description}</p>
                <div className="mt-4 text-coral text-sm font-medium flex items-center gap-1">
                  Jetzt üben <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-4 sm:px-6 bg-navy text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">So funktioniert&apos;s</h2>
            <p className="text-white/60 max-w-xl mx-auto">In drei einfachen Schritten zu messbarem Fortschritt.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="font-mono text-4xl font-bold text-coral/40 mb-4">{step.num}</div>
                <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy mb-4">Was andere sagen</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-border/50 shadow-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#E5A340">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted text-sm leading-relaxed mb-4">&quot;{t.quote}&quot;</p>
                <div>
                  <div className="font-semibold text-navy text-sm">{t.name}</div>
                  <div className="text-xs text-muted">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-card-bg">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy mb-4">Einfache, faire Preise</h2>
            <p className="text-muted">Starte kostenlos. Upgrade wenn du bereit bist.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-6 border shadow-card flex flex-col ${
                  plan.highlight ? "border-coral ring-2 ring-coral/20 shadow-coral" : "border-border/50"
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-semibold text-coral bg-coral/10 rounded-full px-3 py-1 w-fit mb-4">
                    Beliebtester Plan
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-lg font-semibold text-navy">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="font-mono font-bold text-3xl text-navy">{plan.price}</span>
                    <span className="text-muted text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
                        <circle cx="12" cy="12" r="10" fill="#6BC4A6" fillOpacity="0.2" />
                        <path d="M8 12l3 3 5-5" stroke="#6BC4A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-colors ${
                    plan.highlight
                      ? "bg-coral text-white hover:bg-[#d4614a] shadow-coral"
                      : "border border-border hover:bg-card-bg text-navy"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy mb-6">
            Bereit, deine Wirkung zu trainieren?
          </h2>
          <p className="text-muted mb-8 text-lg">
            Starte kostenlos – ohne Kreditkarte. Deine erste Session dauert nur 10 Minuten.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 rounded-2xl text-lg font-semibold bg-coral text-white hover:bg-[#d4614a] transition-all shadow-coral hover:-translate-y-0.5"
          >
            Jetzt kostenlos starten
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-coral flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
                    <path d="M5 11c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="font-serif font-semibold text-navy">Voyce</span>
              </div>
              <p className="text-xs text-muted max-w-xs">
                KI-gestütztes Kommunikationstraining für Berufstätige, die souverän auftreten wollen.
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted">
                <span>🇩🇪</span>
                <span>Made in Germany · DSGVO-konform</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <div className="font-medium text-navy mb-3">Produkt</div>
                <div className="flex flex-col gap-2 text-muted">
                  <Link href="/new" className="hover:text-text-main transition-colors">Neue Session</Link>
                  <Link href="/library" className="hover:text-text-main transition-colors">Bibliothek</Link>
                  <Link href="/progress" className="hover:text-text-main transition-colors">Fortschritt</Link>
                </div>
              </div>
              <div>
                <div className="font-medium text-navy mb-3">Unternehmen</div>
                <div className="flex flex-col gap-2 text-muted">
                  <a href="#" className="hover:text-text-main transition-colors">Über uns</a>
                  <a href="#" className="hover:text-text-main transition-colors">Blog</a>
                  <a href="mailto:hallo@voyce.de" className="hover:text-text-main transition-colors">Kontakt</a>
                </div>
              </div>
              <div>
                <div className="font-medium text-navy mb-3">Rechtliches</div>
                <div className="flex flex-col gap-2 text-muted">
                  <Link href="/datenschutz" className="hover:text-text-main transition-colors">Datenschutz</Link>
                  <Link href="/impressum" className="hover:text-text-main transition-colors">Impressum</Link>
                  <a href="#" className="hover:text-text-main transition-colors">AGB</a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border/50 text-xs text-muted text-center">
            © {new Date().getFullYear()} Voyce GmbH. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}
