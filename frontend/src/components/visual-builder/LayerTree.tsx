"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, File } from "lucide-react";
import { useVisualBuilder } from "./VisualBuilderContext";
import type { BuilderElement, BuilderState } from "./builderSchema";

export default function LayerTree() {
  const { state, selectElement } = useVisualBuilder();

  const rootIds = state.rootIds;
  if (rootIds.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Layers</span>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-black/20 p-2 max-h-[200px] overflow-y-auto no-scrollbar">
        {rootIds.map(id => (
          <LayerNode key={id} elementId={id} state={state} depth={0} />
        ))}
      </div>
    </div>
  );
}

function LayerNode({ elementId, state, depth }: { elementId: string; state: BuilderState; depth: number }) {
  const { selectElement } = useVisualBuilder();
  const [open, setOpen] = useState(depth < 2);
  const element = state.elements[elementId];
  const isSelected = state.selectedId === elementId;

  if (!element) return null;

  const hasChildren = element.children.length > 0;

  return (
    <div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          selectElement(elementId);
          if (hasChildren) setOpen(!open);
        }}
        className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs transition-all ${
          isSelected
            ? "bg-primary/15 text-primary"
            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
        }`}
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
      >
        {hasChildren ? (
          open ? <ChevronDown size={10} /> : <ChevronRight size={10} />
        ) : (
          <span className="w-[10px]" />
        )}
        <span className="flex h-4 w-4 items-center justify-center rounded bg-white/[0.04] text-[8px]">
          {element.meta.icon}
        </span>
        <span className="font-medium truncate">{element.label}</span>
        <span className="ml-auto text-[7px] text-gray-600 font-mono">#{elementId.slice(-4)}</span>
      </button>
      <AnimatePresence>
        {open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {element.children.map(childId => (
              <LayerNode key={childId} elementId={childId} state={state} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
