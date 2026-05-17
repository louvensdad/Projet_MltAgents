"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { VisualComponent } from "@/lib/live-builder";

interface Props {
  components: VisualComponent[];
}

function SaasLayer({ component, index }: { component: VisualComponent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 20 }}
      layout
      className={`rounded-xl border p-3 ${
        component.status === "added"
          ? "border-emerald-500/25 bg-emerald-500/8 shadow-[0_0_20px_rgba(16,185,129,0.06)]"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${component.color} text-white text-xs font-bold shadow-lg shrink-0`}>
          {component.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-gray-200">{component.label}</p>
          <p className="text-[8px] text-gray-500">{component.type === "module" ? "módulo" : "camada"}</p>
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
      {component.type === "module" && (
        <div className="mt-2 flex gap-1">
          <div className="h-1.5 flex-1 rounded-full bg-white/10" />
          <div className="h-1.5 flex-1 rounded-full bg-white/5" />
        </div>
      )}
    </motion.div>
  );
}

export default function SaasPreview({ components }: Props) {
  const sorted = [...components].sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));
  const layers = Array.from(new Set(sorted.map(c => c.layer ?? 0))).sort();

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
        <span className="text-[10px] font-medium text-gray-400">SaaS Fullstack</span>
      </div>
      <div className="relative flex flex-col">
        <AnimatePresence mode="popLayout">
          {layers.map((layer) => (
            <div key={layer}>
              {layer > 1 && (
                <motion.div className="flex justify-center py-1">
                  <div className="h-4 w-px bg-gradient-to-b from-violet-500/20 to-indigo-500/20" />
                </motion.div>
              )}
              <div className="grid gap-1.5">
                {sorted
                  .filter(c => (c.layer ?? 0) === layer)
                  .map((comp, i) => (
                    <SaasLayer key={comp.id} component={comp} index={i} />
                  ))}
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
      <p className="text-[8px] text-gray-600 text-center pt-1">
        Frontend → Gateway → Services → Database → Workers
      </p>
    </div>
  );
}
