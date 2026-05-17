"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import HolographicCard from "./HolographicCard";

export default function MetricOrb({
  label,
  value,
  icon,
  accent = "cyan",
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: "cyan" | "violet" | "emerald";
}) {
  const accentClass = {
    cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-200",
    violet: "from-violet-500/20 to-violet-500/5 text-violet-200",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-200",
  }[accent];

  return (
    <HolographicCard className="p-5">
      <div className={`rounded-2xl bg-gradient-to-br ${accentClass} border border-white/10 p-4`}>
        <div className="flex items-center justify-between text-slate-300">
          <span className="rounded-full border border-white/10 bg-black/20 p-2">{icon}</span>
          <motion.span animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 3, repeat: Infinity }} className="text-[10px] uppercase tracking-[0.25em]">live</motion.span>
        </div>
        <div className="mt-5">
          <p className="text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-400">{label}</p>
        </div>
      </div>
    </HolographicCard>
  );
}
