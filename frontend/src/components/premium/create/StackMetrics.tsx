"use client";

import { motion } from "framer-motion";

export default function StackMetrics({
  score,
  complexity,
  scalability,
  performance,
}: {
  score: number;
  complexity: string;
  scalability: string;
  performance: string;
}) {
  const metrics = [
    { label: "Enterprise score", value: `${score}/100` },
    { label: "Complexity", value: complexity },
    { label: "Scalability", value: scalability },
    { label: "Performance", value: performance },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{metric.label}</p>
          <p className="mt-2 text-sm font-semibold text-white">{metric.value}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

