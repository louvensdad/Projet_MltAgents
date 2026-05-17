"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, Code2, Layers, PanelLeftClose, PanelRightClose,
} from "lucide-react";
import { VisualBuilderProvider, useVisualBuilder } from "./VisualBuilderContext";
import ElementToolbar from "./ElementToolbar";
import VisualCanvas from "./VisualCanvas";
import ElementInspector from "./ElementInspector";
import LayerTree from "./LayerTree";
import LiveCodePreview from "./LiveCodePreview";
import { generateHtml } from "./builderSchema";

type BuilderTab = "canvas" | "code";

function VisualCanvasBuilderInner() {
  const [activeTab, setActiveTab] = useState<BuilderTab>("canvas");
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const { state } = useVisualBuilder();

  const tabs = [
    { key: "canvas" as const, icon: Eye, label: "Canvas Visual" },
    { key: "code" as const, icon: Code2, label: "Código" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-surface/80 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-lg bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center">
              <Eye size={10} className="text-white" />
            </div>
            <span className="text-xs font-bold text-gray-100">Visual Builder</span>
          </div>
          <div className="flex gap-0.5">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[9px] text-gray-500">
          <span>{Object.keys(state.elements).length} elementos</span>
          <span>•</span>
          <span>{generateHtml(state).html.split("\n").length} linhas</span>
          <span>•</span>
          <button
            onClick={() => setShowLeft(!showLeft)}
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-2 py-1 text-[9px] text-gray-400 hover:text-white transition-all"
          >
            <PanelLeftClose size={10} />
            {showLeft ? "Toolbar" : "Menu"}
          </button>
          <button
            onClick={() => setShowRight(!showRight)}
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-2 py-1 text-[9px] text-gray-400 hover:text-white transition-all"
          >
            {showRight ? "Inspector" : "Props"}
            <PanelRightClose size={10} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {showLeft && (
          <motion.div
            initial={false}
            animate={{ width: 200 }}
            className="flex shrink-0 flex-col gap-3 border-r border-white/[0.06] bg-surface/40 p-3 overflow-y-auto"
          >
            <ElementToolbar />
            <LayerTree />
          </motion.div>
        )}

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="h-full"
            >
              {activeTab === "canvas" && <VisualCanvas />}
              {activeTab === "code" && <LiveCodePreview />}
            </motion.div>
          </AnimatePresence>
        </div>

        {showRight && (
          <motion.div
            initial={false}
            animate={{ width: 240 }}
            className="flex shrink-0 flex-col border-l border-white/[0.06] bg-surface/40 overflow-y-auto"
          >
            <ElementInspector />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function VisualCanvasBuilder() {
  return (
    <VisualBuilderProvider>
      <div className="h-full rounded-2xl border border-white/[0.08] bg-gradient-to-b from-surface/90 to-surface/60 backdrop-blur-xl shadow-xl shadow-black/20 overflow-hidden">
        <VisualCanvasBuilderInner />
      </div>
    </VisualBuilderProvider>
  );
}
