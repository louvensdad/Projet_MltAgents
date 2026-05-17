"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function AnimatedBadge({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "violet" | "emerald" }) {
  const palette = {
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-200",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  }[tone];

  return (
    <motion.span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${palette}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </motion.span>
  );
}
