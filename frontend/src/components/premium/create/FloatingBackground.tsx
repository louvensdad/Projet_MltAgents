"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks";

export default function FloatingBackground() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,160,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(124,92,255,0.1),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.06),transparent_22%)]" />
      <motion.div
        className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]"
        animate={{ x: [0, 20, 0], y: [0, 16, 0], opacity: [0.45, 0.8, 0.45] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 top-20 h-[30rem] w-[30rem] rounded-full bg-violet-500/10 blur-[160px]"
        animate={{ x: [0, -18, 0], y: [0, -14, 0], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:84px_84px]" />
    </div>
  );
}

