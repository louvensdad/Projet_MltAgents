"use client";

import { motion } from "framer-motion";
import LdcnAvatarFace from "./LdcnAvatarFace";
import type { LdcnAvatarMood, LdcnAvatarSize, LdcnAvatarStyle } from "./useLdcnAvatarState";

export default function LdcnAvatarBody({
  mood,
  size,
  style,
  minimized,
  animate,
  transition,
}: {
  mood: LdcnAvatarMood;
  size: LdcnAvatarSize;
  style: LdcnAvatarStyle;
  minimized: boolean;
  animate: any;
  transition: any;
}) {
  const compact = size === "small" || minimized;
  const shellSize = compact ? "h-[4.5rem] w-[4.5rem]" : "h-24 w-24";
  const badge = style === "minimalist" ? "border-white/10 bg-white/[0.03]" : "border-cyan-300/20 bg-white/[0.05]";

  return (
    <motion.div
      animate={animate}
      transition={transition}
      className={`relative flex ${shellSize} items-center justify-center`}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl" />
      <div className={`absolute inset-1 rounded-[1.35rem] border ${badge} backdrop-blur-xl shadow-[0_0_28px_rgba(34,211,238,0.14)]`} />
      <div className="absolute inset-[0.35rem] rounded-[1.15rem] border border-white/10 bg-slate-950/65" />
      <div className="absolute inset-x-[18%] top-[18%] h-3 rounded-full bg-cyan-300/15 blur-[1px]" />

      <motion.div
        className="absolute bottom-[10%] left-[20%] right-[20%] h-1 rounded-full bg-cyan-200/20"
        animate={mood === "walking" ? { scaleX: [0.8, 1, 0.8], opacity: [0.35, 0.7, 0.35] } : { opacity: 0.45 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute top-[22%] flex flex-col items-center justify-center">
        <LdcnAvatarFace mood={mood} />
      </div>

      {!minimized && (
        <div className="absolute bottom-[12%] flex items-end gap-1">
          <motion.span
            animate={mood === "speaking" ? { scaleY: [0.7, 1.2, 0.7], opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-5 w-1 rounded-full bg-cyan-200/70"
          />
          <motion.span
            animate={mood === "speaking" ? { scaleY: [1, 0.5, 1], opacity: [0.6, 1, 0.6] } : { opacity: 0.55 }}
            transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }}
            className="h-4 w-1 rounded-full bg-cyan-300/60"
          />
          <motion.span
            animate={mood === "speaking" ? { scaleY: [0.8, 1.35, 0.8], opacity: [0.5, 1, 0.5] } : { opacity: 0.45 }}
            transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut" }}
            className="h-6 w-1 rounded-full bg-cyan-100/60"
          />
        </div>
      )}

      {mood === "celebrating" && (
        <motion.div
          className="absolute -top-1 h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(103,232,249,0.95)]"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}
