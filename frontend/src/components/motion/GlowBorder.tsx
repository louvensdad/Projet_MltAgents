"use client";

import { type ReactNode } from "react";
import { useReducedMotion } from "@/hooks";

interface GlowBorderProps {
  children: ReactNode;
  className?: string;
}

export default function GlowBorder({ children, className = "" }: GlowBorderProps) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;

  return (
    <div className={`glow-border rounded-xl ${className}`}>
      {children}
    </div>
  );
}
