export const designTokens = {
  spacing: { xs: "0.5rem", sm: "0.75rem", md: "1rem", lg: "1.5rem", xl: "2rem", "2xl": "3rem" },
  radius: { sm: "12px", md: "16px", lg: "20px", xl: "28px", "2xl": "36px" },
  colors: {
    bg: "#05070d",
    surface: "#0d111b",
    surface2: "#131a28",
    border: "rgba(148, 163, 184, 0.14)",
    primary: "#5ea0ff",
    primaryStrong: "#7c9cff",
    cyan: "#22d3ee",
    violet: "#8b5cf6",
    text: "#edf4ff",
    muted: "#8b9bb7",
  },
  motion: {
    fast: 180,
    base: 280,
    slow: 420,
  },
  zIndex: { sidebar: 40, overlay: 90, modal: 100 },
} as const;

