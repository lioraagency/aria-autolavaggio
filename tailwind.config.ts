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
          bg:      "#06100A",
          surface: "#0C1A0E",
          card:    "#111D0E",
          border:  "rgba(194,230,123,0.12)",
          accent:  "#C2E67B",
          "accent-dim": "rgba(194,230,123,0.08)",
          text:    "#E8E8DC",
          muted:   "#5D6A56",
          dim:     "#8C9985",
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
      },
      animation: {
        shake:    "shake 0.4s ease-out",
        "fade-up":  "fade-up 0.3s ease-out forwards",
        "fade-in":  "fade-in 0.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
