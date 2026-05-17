"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { VisualComponent } from "@/lib/live-builder";

interface Props {
  components: VisualComponent[];
}

function FrontendElement({ component, index }: { component: VisualComponent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
      layout
      className={`rounded-xl border p-3 ${
        component.status === "added"
          ? "border-emerald-500/25 bg-emerald-500/8"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${component.color} text-white text-[10px] font-bold`}>
          {component.icon}
        </div>
        <span className="text-[11px] font-semibold text-gray-300">{component.label}</span>
        {component.status === "added" && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[7px] font-bold text-emerald-300"
          >
            + novo
          </motion.span>
        )}
      </div>

      {component.type === "chart" && (
        <div className="space-y-1">
          <div className="flex items-end gap-1 h-10">
            {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary/20"
              />
            ))}
          </div>
        </div>
      )}
      {component.type === "cards" && (
        <div className="grid grid-cols-2 gap-1.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-lg bg-white/[0.03] p-2 border border-white/[0.04]">
              <div className="h-3 w-8 rounded bg-white/10 mb-1" />
              <div className="h-4 w-12 rounded bg-primary/20" />
            </div>
          ))}
        </div>
      )}
      {component.type === "data" && (
        <div className="space-y-1">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-1.5 flex-1 rounded-full bg-white/10" />)}
          </div>
          {[1, 2, 3].map(r => (
            <div key={r} className="flex gap-2">
              {[1, 2, 3].map(c => <div key={c} className="h-1 flex-1 rounded-full bg-white/5" />)}
            </div>
          ))}
        </div>
      )}
      {component.type === "input" && (
        <div className="space-y-1.5">
          <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-2">
            <div className="h-1.5 w-full rounded-full bg-white/10" />
          </div>
          <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-2">
            <div className="h-1.5 w-2/3 rounded-full bg-white/10" />
          </div>
          <div className="h-4 w-12 rounded bg-primary/20" />
        </div>
      )}
      {component.type === "layout" && (
        <div className="flex gap-1.5">
          {component.label === "Sidebar" && (
            <div className="flex gap-1.5 w-full">
              <div className="w-6 space-y-1">
                {[1, 2, 3].map(i => <div key={i} className="h-1.5 w-full rounded-full bg-white/10" />)}
              </div>
              <div className="flex-1" />
            </div>
          )}
          {component.label === "Topbar" && (
            <div className="flex items-center justify-between w-full">
              <div className="h-1.5 w-16 rounded-full bg-white/10" />
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-white/10" />
                <div className="h-2 w-2 rounded-full bg-white/10" />
              </div>
            </div>
          )}
        </div>
      )}
      {component.type === "guard" && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-2">
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-[8px] text-amber-300 font-medium">Protegendo rota</span>
        </div>
      )}
      {component.type === "api" && (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[8px] text-gray-500">
            <span className="text-emerald-400">●</span> loading
            <span className="text-blue-400">●</span> data
          </div>
          <div className="h-1 w-full rounded-full bg-blue-500/20 animate-pulse" />
        </div>
      )}
      {component.type === "validation" && (
        <div className="rounded-lg bg-lime-500/5 border border-lime-500/20 p-2">
          <div className="flex items-center gap-1 text-[8px] text-lime-300">
            <span>✓</span> validação ativa
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function FrontendPreview({ components }: Props) {
  const sorted = [...components].sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));
  const layers = Array.from(new Set(sorted.map(c => c.layer ?? 0))).sort();

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full bg-fuchsia-400 animate-pulse" />
        <span className="text-[10px] font-medium text-gray-400">Preview Frontend</span>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent p-3">
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {layers.map((layer) => (
              <div key={layer}>
                {layer > 1 && <div className="h-px bg-white/[0.04] my-2" />}
                <div className="grid grid-cols-2 gap-1.5">
                  {sorted
                    .filter(c => (c.layer ?? 0) === layer)
                    .map((comp, i) => (
                      <div key={comp.id} className={comp.type === "layout" ? "col-span-2" : ""}>
                        <FrontendElement component={comp} index={i} />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <p className="text-[8px] text-gray-600 text-center">Mockup vivo do frontend com componentes selecionados</p>
    </div>
  );
}
