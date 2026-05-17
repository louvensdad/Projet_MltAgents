"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { VisualComponent } from "@/lib/live-builder";

interface Props {
  components: VisualComponent[];
}

function AgentNode({ component, index }: { component: VisualComponent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 20 }}
      layout
      className={`rounded-xl border px-4 py-3 ${
        component.status === "added"
          ? "border-emerald-500/25 bg-emerald-500/8 shadow-[0_0_15px_rgba(16,185,129,0.06)]"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${component.color} text-white text-sm font-bold shadow-lg shrink-0`}>
          {component.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-200">{component.label}</p>
          <p className="text-[8px] text-gray-500 font-mono">{component.type}</p>
        </div>
        {component.status === "added" && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[7px] font-bold text-emerald-300 border border-emerald-500/30"
          >
            + added
          </motion.span>
        )}
      </div>
      {component.type === "layer" && (
        <div className="mt-2 flex gap-1">
          <div className="h-1 flex-1 rounded-full bg-white/5" />
          <div className="h-1 flex-1 rounded-full bg-white/10" />
          <div className="h-1 flex-1 rounded-full bg-white/5" />
        </div>
      )}
      {component.type === "node" && (
        <div className="mt-2 flex items-center gap-1">
          <div className="h-1 flex-1 rounded-full bg-white/5" />
          <div className="h-1 w-2 rounded-full bg-white/10" />
          <div className="h-1 flex-1 rounded-full bg-white/5" />
        </div>
      )}
    </motion.div>
  );
}

export default function AgentsPreview({ components }: Props) {
  const sorted = [...components].sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));
  const layers = Array.from(new Set(sorted.map(c => c.layer ?? 0))).sort();

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
        <span className="text-[10px] font-medium text-gray-400">Orquestração de Agentes IA</span>
      </div>
      <div className="relative flex flex-col items-center">
        <AnimatePresence mode="popLayout">
          {layers.map((layer) => (
            <div key={layer} className="w-full">
              {layer > 1 && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  className="flex justify-center py-1"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-0.5 bg-gradient-to-b from-violet-500/30 to-indigo-500/30" />
                    <div className="h-1.5 w-1.5 rotate-45 border border-violet-400/30" />
                  </div>
                </motion.div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {sorted
                  .filter(c => (c.layer ?? 0) === layer)
                  .map((comp, i) => (
                    <div key={comp.id} className="flex-1 min-w-[130px]">
                      <AgentNode component={comp} index={i} />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
      <p className="text-[8px] text-gray-600 text-center pt-1">
        User Task → Orchestrator → Agents → Tools → Memory → Response
      </p>
    </div>
  );
}
