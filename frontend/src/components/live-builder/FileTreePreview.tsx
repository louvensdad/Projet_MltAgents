"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, File, FileText, ChevronRight, ChevronDown, Plus, Sparkles } from "lucide-react";
import type { FileTreeEntry } from "@/lib/live-builder";

interface Props {
  structure: FileTreeEntry[];
}

function TreeNode({ entry, depth = 0 }: { entry: FileTreeEntry; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);

  if (entry.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs transition-all ${
            entry.added
              ? "text-emerald-300 hover:bg-emerald-500/10"
              : "text-gray-400 hover:bg-white/5"
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <Folder size={14} className={entry.added ? "text-emerald-400" : "text-amber-400"} />
          <span className="font-medium">{entry.path.replace(/\/$/, "")}</span>
          {entry.added && <Plus size={10} className="text-emerald-400 ml-auto" />}
        </button>
        <AnimatePresence>
          {open && entry.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              {entry.children.map((child, i) => (
                <TreeNode key={`${child.path}-${i}`} entry={child} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div
      initial={entry.added ? { x: -10, opacity: 0 } : undefined}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-all ${
        entry.added
          ? "text-emerald-200 bg-emerald-500/5 border-l-2 border-emerald-400"
          : "text-gray-500 hover:bg-white/5"
      }`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <FileText size={12} className={entry.added ? "text-emerald-400" : "text-gray-600"} />
      <span>{entry.path}</span>
      {entry.added && (
        <span className="ml-auto flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
          <Sparkles size={8} /> added
        </span>
      )}
    </motion.div>
  );
}

export default function FileTreePreview({ structure }: Props) {
  const total = countFiles(structure);
  const added = countAdded(structure);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <span>{total} arquivos</span>
        {added > 0 && <span className="text-emerald-400">+{added} novos</span>}
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-black/20 p-2 max-h-[320px] overflow-y-auto">
        {structure.map((entry, i) => (
          <TreeNode key={`${entry.path}-${i}`} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function countFiles(entries: FileTreeEntry[]): number {
  let count = 0;
  for (const e of entries) {
    if (e.type === "file") count++;
    if (e.children) count += countFiles(e.children);
  }
  return count;
}

function countAdded(entries: FileTreeEntry[]): number {
  let count = 0;
  for (const e of entries) {
    if (e.added) count++;
    if (e.children) count += countAdded(e.children);
  }
  return count;
}
