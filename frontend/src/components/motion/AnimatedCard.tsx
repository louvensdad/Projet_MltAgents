"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { useReducedMotion, useMousePosition } from "@/hooks";
import GlowBorder from "./GlowBorder";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  tiltStrength?: number;
  glowOnHover?: boolean;
  enableTilt?: boolean;
}

export default function AnimatedCard({
  children,
  className = "",
  tiltStrength = 8,
  glowOnHover = false,
  enableTilt = true,
}: AnimatedCardProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useMousePosition(ref);

  if (reduced) return <div className={className}>{children}</div>;

  const rotateX = enableTilt ? -y * tiltStrength : 0;
  const rotateY = enableTilt ? x * tiltStrength : 0;
  const shadowX = enableTilt ? -x * 12 : 0;
  const shadowY = enableTilt ? -y * 12 : 0;

  const cardStyle: CSSProperties = {
    transformStyle: "preserve-3d",
  };

  const content = (
    <div ref={ref} style={{ perspective: 800 }}>
      <motion.div
        className={`rounded-2xl border border-white/[0.08] bg-gradient-to-b from-surface/80 to-surface/40 backdrop-blur-xl ${className}`}
        style={{
          ...cardStyle,
          rotateX,
          rotateY,
          boxShadow: `0 ${20 + shadowY * 0.5}px ${
            40 + Math.abs(shadowX) * 0.5
          }px -10px rgba(0,0,0,0.3), ${shadowX}px ${shadowY * -1}px 30px rgba(59,130,246,0.08)`,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );

  if (glowOnHover && (x !== 0 || y !== 0)) {
    return <GlowBorder>{content}</GlowBorder>;
  }

  return content;
}
