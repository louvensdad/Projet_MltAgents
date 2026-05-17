"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  className?: string;
}

const defaultFormat = (n: number) => String(Math.round(n));

export default function AnimatedCounter({
  value,
  duration = 1.5,
  formatter = defaultFormat,
  className = "",
}: AnimatedCounterProps) {
  const reduced = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => formatter(Math.round(v)));

  useEffect(() => {
    if (reduced) {
      count.set(value);
      return;
    }
    const ctrl = animate(count, value, { duration, ease: "easeOut" });
    return () => ctrl.stop();
  }, [value, duration, reduced, count]);

  if (reduced) return <span className={className}>{formatter(value)}</span>;

  return <motion.span className={className}>{rounded}</motion.span>;
}
