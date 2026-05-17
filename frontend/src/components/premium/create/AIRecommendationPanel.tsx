"use client";

import { motion } from "framer-motion";
import HolographicBadge from "./HolographicBadge";

export default function AIRecommendationPanel({
  recommendation,
  rationale,
  mode,
}: {
  recommendation: string;
  rationale: string[];
  mode: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">AI recommendation</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Recommendation engine</h3>
        </div>
        <HolographicBadge tone={mode === "Agent Boost 100%" ? "emerald" : "violet"}>
          {mode}
        </HolographicBadge>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-300">{recommendation}</p>
      <div className="mt-4 space-y-2">
        {rationale.map((item) => (
          <motion.div key={item} whileHover={{ x: 2 }} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
            {item}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

