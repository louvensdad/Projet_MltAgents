"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PulseStatusProps {
  status: "online" | "offline" | "warning" | "active";
  size?: "sm" | "md";
}

const colorMap = {
  online: "bg-emerald-400 shadow-emerald-400/40",
  active: "bg-emerald-400 shadow-emerald-400/40",
  warning: "bg-amber-400 shadow-amber-400/40",
  offline: "bg-gray-500 shadow-gray-500/20",
};

const sizeMap = { sm: "h-2 w-2", md: "h-3 w-3" };

export default function PulseStatus({ status, size = "sm" }: PulseStatusProps) {
  const reduced = useReducedMotion();

  return (
    <span
      className={`inline-block rounded-full ${sizeMap[size]} ${colorMap[status]} ${
        reduced ? "" : "animate-pulse-glow"
      }`}
    />
  );
}
