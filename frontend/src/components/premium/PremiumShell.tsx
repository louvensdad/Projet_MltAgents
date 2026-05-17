"use client";

import { type ReactNode, useMemo } from "react";
import AuroraBackground from "./AuroraBackground";
import ParticleField from "./ParticleField";
import { useReducedMotion } from "@/hooks";

export default function PremiumShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const shellClass = useMemo(() => (
    `relative isolate min-h-screen overflow-hidden ${className}`
  ), [className]);

  return (
    <div className={shellClass}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(94,160,255,0.10),transparent_35%),linear-gradient(180deg,#05070d_0%,#05070d_100%)]" />
      {!reduced && (
        <>
          <AuroraBackground />
          <ParticleField />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

