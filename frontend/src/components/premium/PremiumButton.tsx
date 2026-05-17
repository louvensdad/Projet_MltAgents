"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function PremiumButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const base = variant === "primary"
    ? "bg-primary text-white shadow-lg shadow-primary/20"
    : "border border-white/10 bg-white/[0.04] text-slate-200";

  return (
    <Link href={href} className="inline-flex">
      <motion.span
        whileHover={{ y: -1, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${base}`}
      >
        {children}
        <ArrowRight size={16} />
      </motion.span>
    </Link>
  );
}
