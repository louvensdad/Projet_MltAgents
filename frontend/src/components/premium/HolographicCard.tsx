"use client";

import { type ReactNode, useRef } from "react";
import { motion } from "framer-motion";
import { useMousePosition, useReducedMotion } from "@/hooks";

export default function HolographicCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useMousePosition(ref);
  const rotateX = reduced ? 0 : -y * 6;
  const rotateY = reduced ? 0 : x * 8;

  return (
    <div ref={ref} className="relative" style={{ perspective: 1200 }}>
      <motion.div
        className={`relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl ${className}`}
        style={{ transformStyle: "preserve-3d", rotateX, rotateY }}
        whileHover={reduced ? undefined : { y: -4 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,160,255,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(124,92,255,0.08),transparent_28%)]" />
        {children}
      </motion.div>
    </div>
  );
}

