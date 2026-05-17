"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { VisualComponent } from "@/lib/live-builder";

interface Props {
  components: VisualComponent[];
}

const SECTION_COLORS: Record<string, string> = {
  navbar: "border-sky-500/20 bg-sky-500/5",
  hero: "border-blue-500/20 bg-blue-500/5",
  section: "border-teal-500/20 bg-teal-500/5",
  accordion: "border-amber-500/20 bg-amber-500/5",
  form: "border-rose-500/20 bg-rose-500/5",
  cards: "border-violet-500/20 bg-violet-500/5",
  footer: "border-slate-500/20 bg-slate-500/5",
};

function MiniSection({ component, index }: { component: VisualComponent; index: number }) {
  const borderColor = SECTION_COLORS[component.type] || "border-white/[0.06] bg-white/[0.02]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
      layout
      className={`rounded-lg border ${borderColor} p-3`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br ${component.color} text-white text-[9px] font-bold`}>
          {component.icon}
        </div>
        <span className="text-[10px] font-semibold text-gray-300">{component.label}</span>
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

      {component.type === "hero" && (
        <div className="space-y-1.5">
          <div className="h-2 w-3/4 rounded-full bg-white/10" />
          <div className="h-2 w-1/2 rounded-full bg-white/5" />
          <div className="mt-2 flex gap-1">
            <div className="h-4 w-12 rounded bg-primary/20" />
            <div className="h-4 w-12 rounded bg-white/10" />
          </div>
        </div>
      )}
      {component.type === "nav" && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-1.5 w-6 rounded-full bg-white/10" />)}
          </div>
          <div className="h-3 w-8 rounded bg-primary/20" />
        </div>
      )}
      {component.type === "accordion" && (
        <div className="space-y-1">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-2 rounded bg-white/[0.03] p-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400/50" />
              <div className="h-1.5 w-full rounded-full bg-white/10" />
              <span className="text-[8px] text-amber-400/60">▼</span>
            </div>
          ))}
        </div>
      )}
      {component.type === "cards" && (
        <div className="grid grid-cols-2 gap-1">
          {[1, 2, 3, 4].slice(0, component.label === "Serviços" ? 3 : 2).map(i => (
            <div key={i} className="rounded bg-white/[0.03] p-1.5">
              <div className="h-1.5 w-full rounded-full bg-white/10 mb-1" />
              <div className="h-1 w-2/3 rounded-full bg-white/5" />
            </div>
          ))}
        </div>
      )}
      {component.type === "form" && (
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-white/10" />
          <div className="h-1.5 w-full rounded-full bg-white/10" />
          <div className="h-3 w-12 rounded bg-primary/20" />
        </div>
      )}
      {component.type === "section" && (
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded bg-white/10" />
          <div className="flex-1 space-y-1">
            <div className="h-1.5 w-2/3 rounded-full bg-white/10" />
            <div className="h-1 w-1/2 rounded-full bg-white/5" />
          </div>
        </div>
      )}
      {component.type === "footer" && (
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map(i => <div key={i} className="h-1 w-4 rounded-full bg-white/10" />)}
        </div>
      )}
    </motion.div>
  );
}

export default function StaticSitePreview({ components }: Props) {
  const sorted = [...components].sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-medium text-gray-400">Preview ao vivo — {components.filter(c => c.status === "active" || c.status === "added").length} seções</span>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {sorted.map((comp, i) => (
              <MiniSection key={comp.id} component={comp} index={i} />
            ))}
          </AnimatePresence>
        </div>
      </div>
      <p className="text-[8px] text-gray-600 text-center">
        Preview visual — o projeto gerado conterá estas seções em HTML/CSS
      </p>
    </div>
  );
}
