"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CinematicTransitionProps {
  children: ReactNode;
  direction?: "forward" | "backward";
  className?: string;
}

export default function CinematicTransition({
  children,
  direction = "forward",
  className = "",
}: CinematicTransitionProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          className={className}
          key="step"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        key="step"
        initial={{ opacity: 0, x: direction === "forward" ? 24 : -24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction === "forward" ? -24 : 24 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
