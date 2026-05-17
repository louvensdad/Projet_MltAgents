"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function HolographicBadge({
  children,
  tone = "cyan",
}: {
  children: ReactNode;
  tone?: "cyan" | "violet" | "amber" | "emerald" | "rose";
}) {
  const palette = {
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-200",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-200",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-200",
  }[tone];

  return (
    <motion.span
      whileHover={{ y: -1 }}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] ${palette}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </motion.span>
  );
}

