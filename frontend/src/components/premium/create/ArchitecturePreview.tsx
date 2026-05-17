"use client";

import { motion } from "framer-motion";

export default function ArchitecturePreview({
  nodes,
  tone = "cyan",
}: {
  nodes: string[];
  tone?: "cyan" | "violet" | "amber" | "emerald" | "rose";
}) {
  const toneClass = {
    cyan: "text-cyan-200 border-cyan-500/20 bg-cyan-500/10",
    violet: "text-violet-200 border-violet-500/20 bg-violet-500/10",
    amber: "text-amber-200 border-amber-500/20 bg-amber-500/10",
    emerald: "text-emerald-200 border-emerald-500/20 bg-emerald-500/10",
    rose: "text-rose-200 border-rose-500/20 bg-rose-500/10",
  }[tone];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Live architecture</p>
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] ${toneClass}`}>
          topology
        </span>
      </div>
      <div className="space-y-2">
        {nodes.map((node, index) => (
          <div key={node} className="flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-center text-sm text-white"
            >
              {node}
            </motion.div>
            {index < nodes.length - 1 && <div className="h-4 w-px bg-cyan-500/35" />}
          </div>
        ))}
      </div>
    </div>
  );
}

