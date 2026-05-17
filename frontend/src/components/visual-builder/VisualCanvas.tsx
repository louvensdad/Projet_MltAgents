"use client";

import { useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVisualBuilder } from "./VisualBuilderContext";
import CanvasElement from "./CanvasElement";

export default function VisualCanvas() {
  const { state, selectElement, saveToLocalStorage } = useVisualBuilder();
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => saveToLocalStorage(), 500);
    return () => clearTimeout(timer);
  }, [state, saveToLocalStorage]);

  const handleCanvasClick = useCallback(() => {
    selectElement(null);
  }, [selectElement]);

  const rootElements = state.rootIds
    .flatMap(id => state.elements[id]?.children ?? [])
    .map(id => state.elements[id])
    .filter(Boolean);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between rounded-t-xl border-b border-white/[0.06] bg-white/[0.02] px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-medium text-gray-400">Canvas</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-gray-600">
          <span>{Object.keys(state.elements).length} elementos</span>
          <span>•</span>
          <span>{state.selectedId ? `#${state.selectedId.slice(-4)}` : "nada selecionado"}</span>
        </div>
      </div>

      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-[#050508] to-[#0a0a14] p-6"
      >
        {rootElements.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                <span className="text-2xl text-gray-600">+</span>
              </div>
              <p className="text-sm text-gray-500">Canvas vazio</p>
              <p className="mt-1 text-[10px] text-gray-600">
                Adicione elementos pela toolbar ao lado
              </p>
            </div>
          </div>
        ) : (
          <motion.div layout className="mx-auto max-w-4xl space-y-4">
            <AnimatePresence mode="popLayout">
              {rootElements.map(el => (
                <CanvasElement key={el.id} element={el} state={state} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
