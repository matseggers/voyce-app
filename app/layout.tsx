import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voyce – Trainiere deine Wirkung. Werde gehört.",
  description:
    "Die KI-Plattform für alle, die in Bewerbungsgesprächen, Präsentationen und Verkaufsgesprächen souverän auftreten wollen.",
  keywords: ["Bewerbungsgespräch", "Präsentation", "Verkaufsgespräch", "KI Coach", "Kommunikation"],
  openGraph: {
    title: "Voyce",
    description: "Trainiere deine Wirkung. Werde gehört.",
    type: "website",
    locale: "de_DE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream font-sans antialiased">{children}</body>
    </html>
  );
}
