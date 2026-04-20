import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1E2A3A",
        coral: "#E8725A",
        mint: "#6BC4A6",
        "amber-brand": "#E5A340",
        cream: "#FAF9F6",
        "card-bg": "#F2F0ED",
        "text-main": "#2D2D2D",
        muted: "#6B7280",
        border: "#E5E2DC",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(30, 42, 58, 0.06)",
        "card-hover": "0 8px 24px rgba(30, 42, 58, 0.12)",
        coral: "0 4px 16px rgba(232, 114, 90, 0.3)",
        navy: "0 4px 16px rgba(30, 42, 58, 0.2)",
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "pulse-record": "pulse-record 1.5s ease-in-out infinite",
        waveform: "waveform 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
