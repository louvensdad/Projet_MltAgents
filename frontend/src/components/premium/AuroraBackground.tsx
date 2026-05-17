"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks";

export default function AuroraBackground() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,160,255,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(124,92,255,0.08),transparent_25%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />
      <motion.div
        className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]"
        animate={reduced ? {} : { x: [0, 20, 0], y: [0, 18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-10%] top-24 h-[28rem] w-[28rem] rounded-full bg-violet-500/10 blur-[140px]"
        animate={reduced ? {} : { x: [0, -18, 0], y: [0, -14, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

