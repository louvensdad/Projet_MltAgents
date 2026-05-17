"use client";

import HolographicCard from "./HolographicCard";

export default function LiveArchitecturePanel({ title, graph }: { title: string; graph: string }) {
  return (
    <HolographicCard className="p-5">
      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">{title}</p>
      <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-slate-200">
        {graph}
      </pre>
    </HolographicCard>
  );
}

