import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        surface: "var(--surface)",
        border: "var(--border)"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(59, 130, 246, 0.2)" },
          "50%": { boxShadow: "0 0 16px rgba(59, 130, 246, 0.4)" },
        },
        "slide-up-fade": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "progress-pulse": {
          "0%": { opacity: "0.6" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.6" },
        },
        "glow-rotate": {
          "0%": { "--glow-angle": "0deg" },
          "100%": { "--glow-angle": "360deg" },
        },
        "bg-pulse": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up-fade": "slide-up-fade 0.4s ease-out",
        "progress-pulse": "progress-pulse 2s ease-in-out infinite",
        "glow-rotate": "glow-rotate 3s linear infinite",
        "bg-pulse": "bg-pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
