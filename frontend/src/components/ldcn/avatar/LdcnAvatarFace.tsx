"use client";

import { motion } from "framer-motion";
import type { LdcnAvatarMood } from "./useLdcnAvatarState";

const eyeVariants = {
  idle: { scaleY: 1, opacity: 0.92 },
  walking: { scaleY: 0.96, opacity: 0.96 },
  listening: { scaleY: 1.12, opacity: 1 },
  thinking: { scaleY: 0.92, opacity: 0.86 },
  speaking: { scaleY: 1.02, opacity: 1 },
  celebrating: { scaleY: 1.08, opacity: 1 },
  warning: { scaleY: 0.86, opacity: 0.88 },
  error: { scaleY: 0.8, opacity: 0.82 },
  guiding: { scaleY: 1.03, opacity: 1 },
} satisfies Record<LdcnAvatarMood, { scaleY: number; opacity: number }>;

const mouthVariants = {
  idle: "M16 20 C20 22, 28 22, 32 20",
  walking: "M16 20 C20 21, 28 21, 32 20",
  listening: "M16 21 C21 18, 27 18, 32 21",
  thinking: "M17 21 C21 20, 27 20, 31 21",
  speaking: "M16 20 C19 17, 29 17, 32 20",
  celebrating: "M15 19 C19 24, 29 24, 33 19",
  warning: "M17 22 C21 20, 27 20, 31 22",
  error: "M17 23 C21 19, 27 19, 31 23",
  guiding: "M16 20 C20 19, 28 19, 32 20",
} satisfies Record<LdcnAvatarMood, string>;

export default function LdcnAvatarFace({ mood }: { mood: LdcnAvatarMood }) {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-cyan-400/15 blur-md" />
      <div className="relative flex items-center gap-2">
        <motion.span
          animate={eyeVariants[mood]}
          transition={{ duration: 0.4 }}
          className="h-2.5 w-2.5 rounded-full bg-cyan-100 shadow-[0_0_12px_rgba(103,232,249,0.7)]"
        />
        <motion.span
          animate={eyeVariants[mood]}
          transition={{ duration: 0.4 }}
          className="h-2.5 w-2.5 rounded-full bg-cyan-100 shadow-[0_0_12px_rgba(103,232,249,0.7)]"
        />
      </div>
      <svg aria-hidden viewBox="0 0 48 32" className="absolute inset-x-0 bottom-0 h-6 w-full">
        <motion.path
          d={mouthVariants[mood]}
          fill="none"
          stroke="rgba(207,250,254,0.95)"
          strokeLinecap="round"
          strokeWidth="2.4"
          animate={{ opacity: mood === "error" ? 0.9 : 1, pathLength: 1 }}
          transition={{ duration: 0.35 }}
        />
      </svg>
    </div>
  );
}

