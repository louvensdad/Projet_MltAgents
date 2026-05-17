"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { VisualComponent } from "@/lib/live-builder";

interface Props {
  components: VisualComponent[];
}

function FlowNode({ component, index }: { component: VisualComponent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: component.type === "diamond" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 20 }}
      layout
      className={`rounded-xl border px-4 py-3 ${
        component.status === "added"
          ? "border-emerald-500/25 bg-emerald-500/8 shadow-[0_0_15px_rgba(16,185,129,0.06)]"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${component.color} text-white text-sm font-bold shadow-lg shrink-0 ${component.type === "diamond" ? "rotate-45" : ""}`}>
          <span className={component.type === "diamond" ? "-rotate-45" : ""}>{component.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-200">{component.label}</p>
          <p className="text-[8px] text-gray-500">{component.type}</p>
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
    </motion.div>
  );
}

export default function AutomationPreview({ components }: Props) {
  const sorted = [...components].sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));
  const layers = Array.from(new Set(sorted.map(c => c.layer ?? 0))).sort();

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-medium text-gray-400">Workflow de Automação</span>
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
                    <div className="h-4 w-0.5 bg-gradient-to-b from-emerald-500/30 to-amber-500/30" />
                    <svg width="10" height="6" className="text-amber-500/40">
                      <path d="M0 0 L5 6 L10 0" fill="currentColor" />
                    </svg>
                  </div>
                </motion.div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {sorted
                  .filter(c => (c.layer ?? 0) === layer)
                  .map((comp, i) => (
                    <div key={comp.id} className="flex-1 min-w-[130px]">
                      <FlowNode component={comp} index={i} />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
      <p className="text-[8px] text-gray-600 text-center pt-1">
        Trigger → Condition → Job → Queue → Notification → Log
      </p>
    </div>
  );
}
