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
        aria: {
          bg:               "#0A0A0A",
          surface:          "#121212",
          elevated:         "#1A1A1A",
          border:           "rgba(255,255,255,0.06)",
          "border-strong":  "rgba(255,255,255,0.12)",
          accent:           "#D4FF3F",
          "accent-dim":     "rgba(212,255,63,0.12)",
          "accent-bd":      "rgba(212,255,63,0.25)",
          text:             "#F5F5F5",
          muted:            "#8A8A8A",
          dim:              "#5A5A5A",
          danger:           "#FF453A",
          warning:          "#FF9F0A",
          success:          "#30D158",
          info:             "#0A84FF",
          cyan:             "#64D2FF",
        },
      },
      fontFamily: {
        condensed: ["var(--font-barlow-condensed)", "sans-serif"],
        sans:      ["var(--font-barlow)", "sans-serif"],
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%":       { transform: "translateX(-8px)" },
          "40%":       { transform: "translateX(8px)" },
          "60%":       { transform: "translateX(-6px)" },
          "80%":       { transform: "translateX(6px)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to:   { transform: "translateY(0)" },
        },
        "slide-down": {
          from: { transform: "translateY(-100%)", opacity: "0" },
          to:   { transform: "translateY(0)", opacity: "1" },
        },
        pulse2: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.4" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(212,255,63,0.4)" },
          "50%":       { boxShadow: "0 0 20px rgba(212,255,63,0.8)" },
        },
        "glow-green": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(48,209,88,0.4)" },
          "50%":       { boxShadow: "0 0 20px rgba(48,209,88,0.7)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "toast-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to:   { opacity: "0", transform: "translateY(-16px)" },
        },
      },
      animation: {
        shake:          "shake 0.4s ease-out",
        "fade-up":      "fade-up 0.3s ease-out forwards",
        "fade-in":      "fade-in 0.2s ease-out forwards",
        "slide-up":     "slide-up 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards",
        "slide-down":   "slide-down 0.25s ease-out forwards",
        "pulse2":       "pulse2 2s ease-in-out infinite",
        "glow":         "glow 2s ease-in-out infinite",
        "glow-green":   "glow-green 2s ease-in-out infinite",
        "toast-in":     "toast-in 0.25s ease-out forwards",
        "toast-out":    "toast-out 0.25s ease-in forwards",
      },
    },
  },
  plugins: [],
};
export default config;
