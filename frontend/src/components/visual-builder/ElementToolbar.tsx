"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useVisualBuilder } from "./VisualBuilderContext";
import {
  ELEMENT_META, ELEMENT_CATEGORIES,
  type ElementType, type ElementCategory,
} from "./builderSchema";

export default function ElementToolbar() {
  const { addElement, state } = useVisualBuilder();
  const [activeCategory, setActiveCategory] = useState<ElementCategory>("layout");

  const categoryElements = (Object.values(ELEMENT_META) as any[])
    .filter((m: any) => m.category === activeCategory) as any[];

  const buttonClass = "flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left text-xs text-gray-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white transition-all w-full";

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Elementos</span>
      </div>

      <div className="flex gap-1 rounded-lg bg-white/[0.03] p-1 border border-white/[0.06]">
        {ELEMENT_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-all ${
              activeCategory === cat.key
                ? "bg-primary/20 text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.12 }}
          className="flex-1 space-y-1 overflow-y-auto no-scrollbar"
        >
          {categoryElements.map((meta: any) => (
            <motion.button
              key={meta.type}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addElement(meta.type as ElementType)}
              className={buttonClass}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-xs">
                {meta.icon}
              </span>
              <span className="flex-1 truncate">{meta.label}</span>
              <Plus size={10} className="text-gray-600 shrink-0" />
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center">
        <p className="text-[9px] text-gray-600">
          {Object.keys(state.elements).length} elementos no canvas
        </p>
      </div>
    </div>
  );
}
