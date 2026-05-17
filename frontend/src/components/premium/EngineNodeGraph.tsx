"use client";

import { motion } from "framer-motion";
import HolographicCard from "./HolographicCard";

export default function EngineNodeGraph({ nodes }: { nodes: { name: string; status?: string; hint?: string }[] }) {
  return (
    <HolographicCard className="p-5">
      <div className="space-y-3">
        {nodes.map((node, index) => (
          <div key={node.name} className="relative">
            {index < nodes.length - 1 && <div className="absolute left-4 top-9 h-8 w-px bg-cyan-500/15" />}
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <motion.div
                className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.5)]"
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.15 }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{node.name}</p>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">{node.status || "online"}</span>
                </div>
                {node.hint && <p className="mt-1 text-xs text-slate-500">{node.hint}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </HolographicCard>
  );
}

