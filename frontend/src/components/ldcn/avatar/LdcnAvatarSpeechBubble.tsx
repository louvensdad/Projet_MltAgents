"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Wand2 } from "lucide-react";

export default function LdcnAvatarSpeechBubble({
  message,
  muted,
}: {
  message: string;
  muted: boolean;
}) {
  return (
    <AnimatePresence>
      {message && !muted && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.22 }}
          className="pointer-events-none absolute -top-2 right-full mr-3 w-[min(18rem,calc(100vw-7rem))] rounded-2xl border border-white/10 bg-slate-950/92 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.38)] backdrop-blur-xl"
          aria-hidden
        >
          <div className="flex items-start gap-2">
            <div className="mt-0.5 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-1.5 text-cyan-100">
              <Wand2 size={12} />
            </div>
            <p className="text-[11px] leading-5 text-slate-200">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

