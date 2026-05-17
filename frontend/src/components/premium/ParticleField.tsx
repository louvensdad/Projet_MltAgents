"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks";

export default function ParticleField() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
      {Array.from({ length: 14 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-cyan-300/70 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
          style={{ left: `${(index * 7) % 100}%`, top: `${(index * 11) % 100}%` }}
          animate={{ y: [0, -18, 0], opacity: [0.25, 0.85, 0.25] }}
          transition={{ duration: 6 + index * 0.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

