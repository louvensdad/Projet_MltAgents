"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function FloatingActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="group rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:border-cyan-500/30 hover:bg-white/[0.06]"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-cyan-200">{icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </div>
          <div className="text-slate-500 transition-transform group-hover:translate-x-1">↗</div>
        </div>
      </motion.div>
    </Link>
  );
}
