"use client";

import { motion } from "framer-motion";

export default function LiveTechPreview({
  title,
  subtitle,
  chips,
}: {
  title: string;
  subtitle: string;
  chips: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Mini preview</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
        </div>
        <motion.div
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-200"
        >
          live
        </motion.div>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chips.map((chip) => (
          <div key={chip} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
            {chip}
          </div>
        ))}
      </div>
    </div>
  );
}

