"use client";

import { motion } from "framer-motion";
import type { LdcnAvatarMood, LdcnAvatarPosition } from "./useLdcnAvatarState";

export default function LdcnAvatarPath({
  mood,
  position,
  active,
}: {
  mood: LdcnAvatarMood;
  position: LdcnAvatarPosition;
  active: boolean;
}) {
  if (!active) return null;

  const path = {
    "bottom-right": "M6 24 C28 18, 76 18, 112 24",
    "bottom-left": "M112 24 C84 18, 40 18, 6 24",
    "sidebar-edge": "M14 18 C34 12, 80 12, 130 18",
    "hero-corner": "M6 18 C36 8, 74 8, 126 18",
  }[position];

  const glow = mood === "warning" || mood === "error" ? "rgba(248,113,113,0.7)" : mood === "celebrating" ? "rgba(103,232,249,0.85)" : "rgba(56,189,248,0.65)";

  return (
    <svg
      aria-hidden
      viewBox="0 0 136 34"
      className="absolute inset-x-0 -bottom-3 h-8 w-full overflow-visible"
    >
      <motion.path
        d={path}
        fill="none"
        stroke={glow}
        strokeLinecap="round"
        strokeWidth="1.4"
        strokeDasharray="4 8"
        animate={mood === "walking" ? { strokeDashoffset: [0, 12] } : { strokeDashoffset: 0 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle
        cx={position === "bottom-left" ? 18 : position === "bottom-right" ? 118 : 68}
        cy={20}
        r="2.2"
        fill={glow}
        animate={mood === "walking" ? { cx: position === "bottom-left" ? [18, 60, 102, 118] : [118, 86, 44, 18] } : { opacity: 0.85 }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

