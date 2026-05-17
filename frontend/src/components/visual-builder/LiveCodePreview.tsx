"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, FileText } from "lucide-react";
import { useVisualBuilder } from "./VisualBuilderContext";
import { generateHtml } from "./builderSchema";

type CodeTab = "html" | "css" | "js";

export default function LiveCodePreview() {
  const { state } = useVisualBuilder();
  const [activeTab, setActiveTab] = useState<CodeTab>("html");
  const [copied, setCopied] = useState(false);

  const code = generateHtml(state);

  const tabs: { key: CodeTab; label: string }[] = [
    { key: "html", label: "HTML" },
    { key: "css", label: "CSS" },
    { key: "js", label: "JS" },
  ];

  const activeCode = activeTab === "html" ? code.html
    : activeTab === "css" ? code.css
    : code.js;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between rounded-t-xl border-b border-white/[0.06] bg-white/[0.02] px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-medium text-gray-400">Código</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-2 py-1 text-[9px] text-gray-400 hover:text-white transition-all"
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      <div className="flex gap-1 border-b border-white/[0.06] bg-white/[0.01] px-3 py-1.5">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-all ${
              activeTab === tab.key
                ? "bg-primary/20 text-primary"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto bg-[#050508] p-4">
        <AnimatePresence mode="wait">
          <motion.pre
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="text-[11px] leading-relaxed text-gray-300 font-mono whitespace-pre-wrap break-all"
          >
            <code>{activeCode || "<!-- vazio -->"}</code>
          </motion.pre>
        </AnimatePresence>
      </div>

      <div className="border-t border-white/[0.04] bg-white/[0.01] px-4 py-1.5 text-[8px] text-gray-600">
        Código gerado automaticamente do canvas — {activeCode.split("\n").length} linhas
      </div>
    </div>
  );
}
