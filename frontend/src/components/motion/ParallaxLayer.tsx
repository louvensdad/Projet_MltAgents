"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion, useMousePosition } from "@/hooks";

interface ParallaxLayerProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export default function ParallaxLayer({
  children,
  strength = 10,
  className = "",
}: ParallaxLayerProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useMousePosition(ref);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        style={{ x: -x * strength, y: -y * strength }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
