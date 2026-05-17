"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { VisualComponent } from "@/lib/live-builder";

interface Props {
  components: VisualComponent[];
  title?: string;
}

export function VisualNode({ component, index }: { component: VisualComponent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 18 }}
      layout
      className={`relative flex items-center gap-2 rounded-xl border px-3 py-2.5 ${
        component.status === "added"
          ? "border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
          : component.status === "removed"
          ? "border-red-500/20 bg-red-500/5 opacity-50"
          : "border-white/[0.08] bg-white/[0.03]"
      }`}
    >
      <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${component.color} text-white text-xs font-bold shadow-lg`}>
        {component.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-gray-200 truncate">{component.label}</p>
        <p className="text-[8px] text-gray-500 uppercase tracking-wider">{component.type}</p>
      </div>
      {component.status === "added" && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[8px] font-bold text-emerald-300 border border-emerald-500/30"
        >
          added
        </motion.span>
      )}
      {component.status === "removed" && (
        <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[8px] font-bold text-red-300">
          removed
        </span>
      )}
    </motion.div>
  );
}

export function ConnectionLine() {
  return (
    <div className="flex flex-col items-center py-0.5">
      <div className="h-3 w-px bg-gradient-to-b from-white/10 to-white/5" />
      <div className="h-1 w-1 rounded-full bg-white/20" />
      <div className="h-3 w-px bg-gradient-to-b from-white/5 to-white/10" />
    </div>
  );
}

export default function VisualPreview({ components, title }: Props) {
  const sorted = [...components].sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));
  const layers = Array.from(new Set(sorted.map(c => c.layer ?? 0))).sort();

  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 h-12 w-12 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/[0.06]">
          <span className="text-xl text-gray-600">◈</span>
        </div>
        <p className="text-xs text-gray-500">Selecione componentes para ver o preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && (
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
      )}
      <div className="relative">
        <AnimatePresence mode="popLayout">
          {layers.map((layer) => (
            <div key={layer} className="relative">
              {layer > 1 && <ConnectionLine />}
              <div className="flex flex-wrap gap-1.5">
                {sorted
                  .filter(c => (c.layer ?? 0) === layer)
                  .map((comp, i) => (
                    <div key={comp.id} className="flex-1 min-w-[120px]">
                      <VisualNode component={comp} index={i} />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
